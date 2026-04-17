from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from ..services import get_room_availability_service, save_room_data, get_room_timeslots_service
from ..models import Room, db, RoomCost, Showtime, RoomImage
from ..decorators import role_required
from ..utils import Roles

from sqlalchemy.exc import SQLAlchemyError

# register blueprint
rooms_blueprint = Blueprint('rooms', __name__)


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
            'title': room.title,
            'max_capacity': room.max_capacity,
            'min_capacity': room.min_capacity,
            'duration': room.duration,
            'reset_buffer': room.reset_buffer,
            'launch_date': room.launch_date,
            'sunset_date': room.sunset_date,
            'description': room.description
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
        'title': room.title,
        'max_capacity': room.max_capacity,
        'min_capacity': room.min_capacity,
        'duration': room.duration,
        'reset_buffer': room.reset_buffer,
        'launch_date': room.launch_date.isoformat() if room.launch_date else None,
        'sunset_date': room.sunset_date.isoformat() if room.sunset_date else None,
        'description': room.description
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
        room.title = data['title']
        room.max_capacity = data['maxCapacity']
        room.min_capacity = data['minCapacity']
        room.duration = data['duration']
        room.reset_buffer = data['resetBuffer']
        room.launch_date = data['launchDate']
        room.sunset_date = data['sunsetDate']
        room.description = data['description']

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
