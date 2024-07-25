from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from .services import save_room_data
from .models import Room, db, RoomCost, Booking, Showtime, Customer
from .utils import BookingStatus, time_to_string
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError

# register the blueprints
auth_blueprint = Blueprint('auth', __name__)
rooms_blueprint = Blueprint('rooms', __name__)
bookings_blueprint = Blueprint('bookings', __name__)
showtimes_blueprint = Blueprint('showtimes', __name__)
customers_blueprint = Blueprint('customers', __name__)


@auth_blueprint.route('/', methods=['GET', 'POST'])
@cross_origin()
def display_signup():
    return 'auth_blueprint success'


@rooms_blueprint.route('/api/rooms', methods=['POST', 'OPTIONS'])
@cross_origin()
def add_room():
    data = request.get_json()

    if not data:
        return jsonify({'error': 'Invalid Data'}), 400
    try:
        return save_room_data(data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@rooms_blueprint.route('/api/rooms/', methods=['GET'])
@cross_origin()
def get_rooms():
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


# Update a specific room
@rooms_blueprint.route('/api/rooms/<int:room_id>', methods=['PUT'])
@cross_origin()
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
def get_room_costs(room_id):
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
@rooms_blueprint.route('/api/room-costs/<int:cost_id>', methods=['DELETE'])
@cross_origin()
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


@bookings_blueprint.route('/api/bookings', methods=['GET'])
@cross_origin()
def get_bookings():
    bookings = Booking.query.all()
    return jsonify([{
        'id': booking.id,
        'showtime_id': booking.showtime_id,
        'customer_id': booking.customer_id,
        'guest_count': booking.guest_count,
        'status': booking.status.value,
        'order_id': booking.order_id,
        'date': booking.date.strftime('%Y-%m-%d')
    } for booking in bookings])


@bookings_blueprint.route('/api/bookings', methods=['POST'])
@cross_origin()
def add_booking():
    data = request.get_json()
    new_booking = Booking(
        showtime_id=data['showtime_id'],
        customer_id=data['customer_id'],
        guest_count=data['guest_count'],
        status=BookingStatus(data.get('status', BookingStatus.NOT_BOOKED)),
        order_id=data['order_id'],
        date=datetime.strptime(data['date'], '%Y-%m-%d').date() if 'date' in data else date.today()
    )
    try:
        db.session.add(new_booking)
        db.session.commit()
        return jsonify({'message': 'Booking added successfully'}), 201
    except SQLAlchemyError as e:
        print(f"error saving to database: {e}")
        db.session.rollback()
        return jsonify({'error': 'something went wrong saving to database'}), 500
    except Exception as e:
        print(f"unknown error occured: {e}")
        db.session.rollback()
        return jsonify({'error': 'something really bad went wrong'}), 500

@showtimes_blueprint.route('/api/rooms/<int:room_id>/showtimes', methods=['GET'])
@cross_origin()
def get_all_showtimes(room_id):
    showtimes = Showtime.query.filter_by(room_id=room_id).all()
    return jsonify([{
        'id': showtime.id,
        'room_id': showtime.room_id,
        'booked': showtime.booked,
        'bookable': showtime.bookable,
        'start_time': time_to_string(showtime.start_time),
        'end_time': time_to_string(showtime.end_time)
    } for showtime in showtimes])


@showtimes_blueprint.route('/api/showtimes/<int:showtime_id>', methods=['GET'])
@cross_origin()
def get_showtime(showtime_id):
    showtime = Showtime.query.get_or_404(showtime_id)
    return jsonify({
        'id': showtime.id,
        'room_id': showtime.room_id,
        'booked': showtime.booked,
        'bookable': showtime.bookable,
        'start_time': time_to_string(showtime.start_time),
        'end_time': time_to_string(showtime.end_time)
    })


@showtimes_blueprint.route('/api/showtimes/<int:showtime_id>', methods=['DELETE'])
@cross_origin()
def delete_showtime(showtime_id):
    showtime = Showtime.query.get_or_404(showtime_id)
    try:
        db.session.delete(showtime)
        db.session.commit()
        return jsonify({'message': 'Showtime deleted successfully'}), 204
    except SQLAlchemyError as e:
        print(f"error saving to database: {e}")
        db.session.rollback()
        return jsonify({'error': 'something went wrong saving to database'}), 500
    except Exception as e:
        print(f"unknown error occured: {e}")
        db.session.rollback()
        return jsonify({'error': 'something really bad went wrong'}), 500

@showtimes_blueprint.route('/api/rooms/<int:room_id>/showtimes/<int:showtime_id>', methods=['PUT'])
@cross_origin()
def update_showtime(room_id, showtime_id):
    data = request.get_json()
    showtime = Showtime.query.get_or_404(showtime_id)

    try:
        showtime.room_id = room_id
        showtime.booked = data['booked']
        showtime.bookable = data['bookable']
        showtime.start_time = data['start_time']
        showtime.end_time = data['end_time']

        db.session.commit()
        return jsonify({'message': 'Showtime updated successfully'}), 201
    except SQLAlchemyError as e:
        print(f"error saving to database: {e}")
        db.session.rollback()
        return jsonify({'error': 'something went wrong saving to database'}), 500
    except Exception as e:
        print(f"unknown error occured: {e}")
        db.session.rollback()
        return jsonify({'error': 'something really bad went wrong'}), 500


@showtimes_blueprint.route('/api/rooms/<int:room_id>/showtimes', methods=['POST'])
@cross_origin()
def add_showtime(room_id):
    data = request.get_json()
    new_showtime = Showtime(
        room_id=room_id,
        booked=data['booked'],
        bookable=data['bookable'],
        start_time=data['start_time'],
        end_time=data['end_time']
    )
    try:
        db.session.add(new_showtime)  # TODO: put these in try except blocks!
        db.session.commit()
        return jsonify({'message': 'Showtime added successfully'}), 201
    except SQLAlchemyError as e:
        print(f"error saving to database: {e}")
        db.session.rollback()
        return jsonify({'error': 'something went wrong saving to database'}), 500
    except Exception as e:
        print(f"unknown error occured: {e}")
        db.session.rollback()
        return jsonify({'error': 'something really bad went wrong'}), 500


@customers_blueprint.route('/api/customers', methods=['GET'])
@cross_origin()
def get_all_customers():
    customers = Customer.query.all()
    return jsonify([{
        'id': customer.id,
        'first_name': customer.first_name,
        'last_name': customer.last_name,
        'email': customer.email,
        'is_minor': customer.is_minor,
        'is_banned': customer.is_banned,
        'customer_notes': customer.customer_notes

    } for customer in customers])


@customers_blueprint.route('/api/customers/<int:customer_id>', methods=['GET'])
@cross_origin()
def get_customer(customer_id):
    customer = Customer.query.get_or_404(customer_id)
    return jsonify({
        'id': customer.id,
        'first_name': customer.first_name,
        'last_name': customer.last_name,
        'email': customer.email,
        'is_minor': customer.is_minor,
        'is_banned': customer.is_banned,
        'customer_notes': customer.customer_notes
    })


@customers_blueprint.route('/api/customers', methods=['POST'])
@cross_origin()
def add_customer():
    data = request.get_json()
    new_customer = Customer(
        first_name=data['first_name'],
        last_name=data['last_name'],
        email=data['email'],
        is_minor=data['is_minor'],
        is_banned=data['is_banned'],
        customer_notes=data['customer_notes']
    )
    try:
        db.session.add(new_customer)
        db.session.commit()
        return jsonify({'message': 'Customer added successfully'}), 201
    except SQLAlchemyError as e:
        print(f"error saving to database: {e}")
        db.session.rollback()
        return jsonify({'error': 'something went wrong saving to database'}), 500
    except Exception as e:
        print(f"unknown error occured: {e}")
        db.session.rollback()
        return jsonify({'error': 'something really bad went wrong'}), 500




@customers_blueprint.route('/api/customers/<int:customer_id>', methods=['PUT'])
@cross_origin()
def update_customer(customer_id):
    data = request.get_json()
    customer = Customer.query.get_or_404(customer_id)
    try:
        customer.first_name = data['first_name']
        customer.last_name = data['last_name']
        customer.email = data['email']
        customer.is_minor = data.get('is_minor', False)
        customer.is_banned = data.get('is_banned', False)
        customer.customer_notes = data['customer_notes']

        db.session.commit()
        return jsonify({'message': 'Customer updated successfully'}), 200
    except SQLAlchemyError as e:
        print(f"error saving to database: {e}")
        db.session.rollback()
        return jsonify({'error': 'something went wrong saving to database'}), 500
    except Exception as e:
        print(f"unknown error occured: {e}")
        db.session.rollback()
        return jsonify({'error': 'something really bad went wrong'}), 500


@customers_blueprint.route('/api/customers/<int:customer_id>', methods=['DELETE'])
@cross_origin()
def delete_customer(customer_id):
    customer = Customer.query.get_or_404(customer_id)
    try:
        db.session.delete(customer)
        db.session.commit()
        return jsonify({'message': 'Customer deleted successfully'}), 200
    except SQLAlchemyError as e:
        print(f"error deleting from database: {e}")
        return jsonify({'error': 'something went wrong saving to database'}), 500
    except Exception as e:
        print(f"unknown error occured: {e}")
        return jsonify({'error': 'something really bad went wrong'}), 500


