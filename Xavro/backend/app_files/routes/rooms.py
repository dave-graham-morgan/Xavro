import os
import re
import cloudinary
import cloudinary.uploader
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from ..services import get_room_availability_service, save_room_data, get_room_timeslots_service
from ..models import Room, db, RoomCost, Showtime, RoomImage
from ..decorators import role_required
from ..utils import Roles

from sqlalchemy.exc import SQLAlchemyError

cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET'),
)

# register blueprint
rooms_blueprint = Blueprint('rooms', __name__)


def _slugify(title):
    return re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', title.lower())).strip('-')


@rooms_blueprint.route('/api/rooms', methods=['POST', 'OPTIONS'])
@cross_origin()
@role_required(Roles.ADMIN)
def add_room():
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Invalid Data'}), 400
    try:
        return save_room_data(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@rooms_blueprint.route('/api/rooms/<int:room_id>/availability', methods=['GET'])
@cross_origin()
def get_room_availability_route(room_id):
    try:
        room_avail = get_room_availability_service(room_id)
    except Exception as e:
        print(f"ERROR: {e}")
        return jsonify({'error': str(e)}), 500
    return jsonify(room_avail)


@rooms_blueprint.route('/api/rooms/', methods=['GET'])
@cross_origin()
def get_all_rooms():
    try:
        rooms = Room.query.all()
        rooms_list = [{
            'id': room.id,
            'slug': _slugify(room.title),
            'title': room.title,
            'max_capacity': room.max_capacity,
            'min_capacity': room.min_capacity,
            'duration': room.duration,
            'reset_buffer': room.reset_buffer,
            'launch_date': room.launch_date,
            'sunset_date': room.sunset_date,
            'description': room.description,
            'difficulty': room.difficulty,
            'physical_rating': room.physical_rating,
            'scare_factor': room.scare_factor,
        } for room in rooms]
        return jsonify(rooms_list)
    except SQLAlchemyError as sql_error:
        return jsonify({'error': str(sql_error)})
    except Exception as e:
        return jsonify({'error': str(e)})


# Fetch details of a specific room
@rooms_blueprint.route('/api/rooms/<int:room_id>', methods=['GET'])
@cross_origin()
def get_room(room_id):
    room = Room.query.get_or_404(room_id)
    return jsonify({
        'id': room.id,
        'slug': _slugify(room.title),
        'title': room.title,
        'max_capacity': room.max_capacity,
        'min_capacity': room.min_capacity,
        'duration': room.duration,
        'reset_buffer': room.reset_buffer,
        'launch_date': room.launch_date.isoformat() if room.launch_date else None,
        'sunset_date': room.sunset_date.isoformat() if room.sunset_date else None,
        'description': room.description,
        'difficulty': room.difficulty,
        'physical_rating': room.physical_rating,
        'scare_factor': room.scare_factor,
    })


@rooms_blueprint.route('/api/rooms/<int:room_id>/leaderboard', methods=['GET'])
@cross_origin()
def get_room_leaderboard(room_id):
    from ..models import Booking
    entries = (
        Booking.query
        .filter(
            Booking.room_id == room_id,
            Booking.escape_time_seconds.isnot(None),
        )
        .order_by(Booking.escape_time_seconds.asc())
        .limit(5)
        .all()
    )
    return jsonify([{
        'rank': i + 1,
        'team_name': b.team_name or 'Anonymous',
        'escape_time_seconds': b.escape_time_seconds,
        'team_photo_url': b.team_photo_url,
        'show_date': b.show_date.strftime('%B %d, %Y'),
    } for i, b in enumerate(entries)])


@rooms_blueprint.route('/api/rooms/slug/<string:slug>', methods=['GET'])
@cross_origin()
def get_room_by_slug(slug):
    rooms = Room.query.all()
    room = next((r for r in rooms if _slugify(r.title) == slug), None)
    if not room:
        return jsonify({'error': 'Room not found'}), 404
    return jsonify({
        'id': room.id,
        'slug': _slugify(room.title),
        'title': room.title,
        'max_capacity': room.max_capacity,
        'min_capacity': room.min_capacity,
        'duration': room.duration,
        'reset_buffer': room.reset_buffer,
        'launch_date': room.launch_date.isoformat() if room.launch_date else None,
        'sunset_date': room.sunset_date.isoformat() if room.sunset_date else None,
        'description': room.description,
        'difficulty': room.difficulty,
        'physical_rating': room.physical_rating,
        'scare_factor': room.scare_factor,
    })


@rooms_blueprint.route('/api/rooms/<int:room_id>', methods=['DELETE'])
@cross_origin()
@role_required(Roles.ADMIN)
def delete_room(room_id):
    room = Room.query.get_or_404(room_id)

    try:
        db.session.delete(room)
        db.session.commit()
        return jsonify({'message': 'Room deleted successfully'}), 204
    except SQLAlchemyError as e:
        print(f"error saving to database: {e}")
        db.session.rollback()
        return jsonify({'error': 'something went wrong saving to database'}), 500
    except Exception as e:
        print(f"unknown error occured: {e}")
        db.session.rollback()
        return jsonify({'error': 'something really bad went wrong'}), 500


@rooms_blueprint.route('/api/rooms/<int:room_id>/associations', methods=['GET'])
@role_required(Roles.EMPLOYEE, Roles.ADMIN)
def check_room_associations(room_id):
    room_costs_count = RoomCost.query.filter_by(room_id=room_id).count()
    showtimes_count = Showtime.query.filter_by(room_id=room_id).count()
    return jsonify({
        'has_associations': room_costs_count > 0 or showtimes_count > 0
    })


# Update a specific room
@rooms_blueprint.route('/api/rooms/<int:room_id>', methods=['PUT'])
@cross_origin()
@role_required(Roles.ADMIN)
def update_room(room_id):
    data = request.get_json()
    room = Room.query.get_or_404(room_id)
    try:
        def _int_or_none(v):
            try:
                return int(v) if v not in (None, '') else None
            except (ValueError, TypeError):
                return None

        new_title = data['title']
        duplicate = Room.query.filter(
            db.func.lower(Room.title) == new_title.lower(),
            Room.id != room_id
        ).first()
        if duplicate:
            return jsonify({'error': f'A room named "{duplicate.title}" already exists.'}), 400

        room.title = new_title
        room.max_capacity = data['maxCapacity']
        room.min_capacity = data['minCapacity']
        room.duration = data['duration']
        room.reset_buffer = data['resetBuffer']
        room.launch_date = data['launchDate']
        room.sunset_date = data['sunsetDate']
        room.description = data['description']
        room.difficulty = _int_or_none(data.get('difficulty'))
        room.physical_rating = _int_or_none(data.get('physicalRating'))
        room.scare_factor = _int_or_none(data.get('scareFactor'))

        db.session.commit()
        return jsonify({'message': 'Room updated successfully'})
    except SQLAlchemyError as e:
        print(f"error saving to database: {e}")
        db.session.rollback()
        return jsonify({'error': 'something went wrong saving to database'}), 500
    except Exception as e:
        print(f"unknown error occured: {e}")
        db.session.rollback()
        return jsonify({'error': 'something really bad went wrong'}), 500


# Fetch costs of a specific room
@rooms_blueprint.route('/api/rooms/<int:room_id>/costs', methods=['GET'])
@cross_origin()
@role_required(Roles.EMPLOYEE, Roles.ADMIN)
def get_all_room_costs(room_id):
    costs = RoomCost.query.filter_by(room_id=room_id).all()
    cost_list = [
        {
            'id': cost.id,
            'room_id': cost.room_id,
            'guests_count': cost.guests_count,
            'total_cost': cost.total_cost,
            'start_date': cost.start_date.isoformat() if cost.start_date else None,
            'end_date': cost.end_date.isoformat() if cost.end_date else None,
        } for cost in costs
    ]
    return jsonify(cost_list)


# Create a new room cost
@rooms_blueprint.route('/api/rooms/<int:room_id>/costs', methods=['POST'])
@cross_origin()
@role_required(Roles.ADMIN)
def create_room_cost(room_id):
    data = request.get_json()
    new_cost = RoomCost(
        room_id=room_id,
        guests_count=data['guests_count'],
        total_cost=data['total_cost'],
        start_date=data.get('start_date'),
        end_date=data.get('end_date')
    )
    try:
        db.session.add(new_cost)
        db.session.commit()
        return jsonify({'message': 'Room cost added successfully'}), 201
    except SQLAlchemyError as e:
        print(f"error saving to database: {e}")
        db.session.rollback()
        return jsonify({'error': 'something went wrong saving to database'}), 500
    except Exception as e:
        print(f"unknown error occured: {e}")
        db.session.rollback()
        return jsonify({'error': 'something really bad went wrong'}), 500


# Update an existing room cost
@rooms_blueprint.route('/api/rooms/costs/<int:cost_id>', methods=['PUT'])
@cross_origin()
@role_required(Roles.ADMIN)
def update_room_cost(cost_id):
    data = request.get_json()
    cost = RoomCost.query.get_or_404(cost_id)
    try:
        cost.guests_count = data['guests_count']
        cost.total_cost = data['total_cost']
        cost.start_date = data.get('start_date')
        cost.end_date = data.get('end_date')
        db.session.commit()
        return jsonify({'message': 'Room cost updated successfully'})
    except SQLAlchemyError as e:
        print(f"error saving to database: {e}")
        db.session.rollback()
        return jsonify({'error': 'something went wrong saving to database'}), 500
    except Exception as e:
        print(f"unknown error occured: {e}")
        db.session.rollback()
        return jsonify({'error': 'something really bad went wrong'}), 500


# delete a single room-cost
@rooms_blueprint.route('/api/rooms/room-costs/<int:cost_id>', methods=['DELETE'])
@cross_origin()
@role_required(Roles.ADMIN)
def delete_room_cost(cost_id):
    cost = RoomCost.query.get_or_404(cost_id)
    try:
        db.session.delete(cost)
        db.session.commit()
        return jsonify({'message': 'Room-cost deleted successfully'}), 204
    except SQLAlchemyError as e:
        print(f"error saving to database: {e}")
        db.session.rollback()
        return jsonify({'error': 'something went wrong saving to database'}), 500
    except Exception as e:
        print(f"unknown error occured: {e}")
        db.session.rollback()
        return jsonify({'error': 'something really bad went wrong'}), 500


# Fetch a single room cost
@rooms_blueprint.route('/api/rooms/costs/<int:cost_id>', methods=['GET'])
@cross_origin()
@role_required(Roles.EMPLOYEE, Roles.ADMIN)
def get_room_cost(cost_id):
    cost = RoomCost.query.get_or_404(cost_id)
    return jsonify({
        'id': cost.id,
        'room_id': cost.room_id,
        'guests_count': cost.guests_count,
        'total_cost': cost.total_cost,
        'start_date': cost.start_date.isoformat() if cost.start_date else None,
        'end_date': cost.end_date.isoformat() if cost.end_date else None,
    })


@rooms_blueprint.route('/api/rooms/<int:room_id>/timeslots', methods=['GET'])
@cross_origin()
def get_available_timeslots(room_id):
    date = request.args.get('date')

    if not date:
        return jsonify({'error': 'Date parameter is required'}), 400

    try:
        timeslots = get_room_timeslots_service(room_id, date)
        return jsonify(timeslots)
    except Exception as e:
        print(f"ERROR: {e}")
        return jsonify({'error': str(e)}), 500


@rooms_blueprint.route('/api/rooms/<int:room_id>/images/upload', methods=['POST'])
@cross_origin()
@role_required(Roles.ADMIN)
def upload_room_image(room_id):
    """Accept a file upload, send to Cloudinary, store resulting URL."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400
    try:
        result = cloudinary.uploader.upload(
            file.read(),
            folder=f'xavro/rooms/{room_id}',
        )
        image_url = result['secure_url']
        public_id = result['public_id']

        # If this is the first image for the room, make it primary automatically
        existing_count = RoomImage.query.filter_by(room_id=room_id).count()
        is_primary = existing_count == 0

        if is_primary:
            RoomImage.query.filter_by(room_id=room_id, is_primary=True).update({'is_primary': False})

        new_image = RoomImage(
            room_id=room_id,
            image_url=image_url,
            alt_text=request.form.get('alt_text', ''),
            display_order=existing_count,
            is_primary=is_primary
        )
        db.session.add(new_image)
        db.session.commit()
        return jsonify({
            'id': new_image.id,
            'image_url': image_url,
            'alt_text': new_image.alt_text,
            'display_order': new_image.display_order,
            'is_primary': new_image.is_primary,
            'public_id': public_id,
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@rooms_blueprint.route('/api/rooms/images/<int:image_id>/primary', methods=['PUT'])
@cross_origin()
@role_required(Roles.ADMIN)
def set_primary_image(image_id):
    """Set one image as primary, clearing any existing primary for that room."""
    image = RoomImage.query.get_or_404(image_id)
    try:
        RoomImage.query.filter_by(room_id=image.room_id, is_primary=True).update({'is_primary': False})
        image.is_primary = True
        db.session.commit()
        return jsonify({'message': 'Primary image updated'})
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@rooms_blueprint.route('/api/rooms/<int:room_id>/images', methods=['GET'])
@cross_origin()
def get_room_images(room_id):
    images = RoomImage.query.filter_by(room_id=room_id).order_by(RoomImage.display_order).all()
    return jsonify([{
        'id': img.id,
        'image_url': img.image_url,
        'alt_text': img.alt_text,
        'display_order': img.display_order,
        'is_primary': img.is_primary
    } for img in images])


@rooms_blueprint.route('/api/rooms/<int:room_id>/images', methods=['POST'])
@cross_origin()
@role_required(Roles.ADMIN)
def add_room_image(room_id):
    data = request.get_json()
    # if this is marked primary, clear any existing primary first
    if data.get('is_primary'):
        RoomImage.query.filter_by(room_id=room_id, is_primary=True).update({'is_primary': False})
    new_image = RoomImage(
        room_id=room_id,
        image_url=data['image_url'],
        alt_text=data.get('alt_text', ''),
        display_order=data.get('display_order', 0),
        is_primary=data.get('is_primary', False)
    )
    try:
        db.session.add(new_image)
        db.session.commit()
        return jsonify({'id': new_image.id, 'message': 'Image added successfully'}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@rooms_blueprint.route('/api/rooms/images/<int:image_id>', methods=['DELETE'])
@cross_origin()
@role_required(Roles.ADMIN)
def delete_room_image(image_id):
    image = RoomImage.query.get_or_404(image_id)
    try:
        db.session.delete(image)
        db.session.commit()
        return jsonify({'message': 'Image deleted successfully'}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
