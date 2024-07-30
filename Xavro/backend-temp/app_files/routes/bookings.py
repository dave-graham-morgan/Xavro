from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from ..models import db,  Booking
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError

# register the blueprints
bookings_blueprint = Blueprint('bookings', __name__)


@bookings_blueprint.route('/api/bookings', methods=['GET'])
@cross_origin()
def get_all_bookings():
    bookings = Booking.query.all()
    return jsonify([{
        'id': booking.id,
        'room_id': booking.room_id,
        'customer_id': booking.customer_id,
        'guest_count': booking.guest_count,
        'order_id': booking.order_id,
        'booking_date': booking.booking_date.strftime('%Y-%m-%d'),
        'show_date': booking.show_date.strftime('%Y-%m-%d'),
        'show_timeslot': booking.show_timeslot
    } for booking in bookings])


@bookings_blueprint.route('/api/bookings/<int:booking_id>', methods=['GET'])
@cross_origin()
def get_booking(booking_id):
    booking = Booking.query.get_or_404(booking_id)
    return jsonify({
        'id': booking.id,
        'room_id': booking.room_id,
        'customer_id': booking.customer_id,
        'guest_count': booking.guest_count,
        'order_id': booking.order_id,
        'booking_date': booking.booking_date.strftime('%Y-%m-%d'),
        'show_date': booking.show_date.strftime('%Y-%m-%d'),
        'show_timeslot': booking.show_timeslot
    })


@bookings_blueprint.route('/api/bookings/<int:booking_id>', methods=['PUT'])
@cross_origin()
def update_booking(booking_id):
    data = request.get_json()
    booking = Booking.query.get_or_404(booking_id)
    try:
        booking.room_id = data['room_id'],
        booking.customer_id = data['customer_id'],
        booking.guest_count = data['guest_count'],
        booking.order_id = data['order_id'],
        booking.booking_date = datetime.strptime(data['booking_date'], '%Y-%m-%d').date(),
        booking.show_date = datetime.strptime(data['show_date'], '%Y-%m-%d').date(),  # Use show
        booking.show_timeslot = data['show_timeslot']

        db.session.commit()
        return jsonify({'message': 'Booking updated successfully'}), 201
    except SQLAlchemyError as e:
        print(f"Error adding booking to the database: {e}")
        db.session.rollback()
        return jsonify({'error': 'Something went wrong adding to the database'}), 500
    except KeyError as e:
        print(f"Missing key in JSON data: {e}")
        print(data)
        db.session.rollback()
        return jsonify({'error': f'Missing key in JSON data: {e}'}), 400
    except Exception as e:
        print(f"unknown error occured: {e}")
        db.session.rollback()
        return jsonify({'error': 'something really bad went wrong'}), 500


@bookings_blueprint.route('/api/bookings/<int:booking_id>', methods=['DELETE'])
@cross_origin()
def delete_booking(booking_id):
    booking = Booking.query.get_or_404(booking_id)
    try:
        db.session.delete(booking)
        return jsonify({'message': 'Booking deleted successfully'})
    except SQLAlchemyError as e:
        print(f"Error deleting booking from database: {e}")
        db.session.rollback()
        return jsonify({'error': 'Something went wrong deleting booking from database'}), 500
    except Exception as e:
        print(f"unknown error occured: {e}")
        db.session.rollback()
        return jsonify({'error': 'something really bad went wrong'}), 500


@bookings_blueprint.route('/api/bookings', methods=['POST'])
@cross_origin()
def add_booking():
    data = request.get_json()
    try:
        new_booking = Booking(
            room_id=data['room_id'],
            customer_id=data['customer_id'],
            guest_count=data['guest_count'],
            order_id=data['order_id'],
            booking_date=datetime.strptime(data['booking_date'], '%Y-%m-%d').date(),  # Use booking_date
            show_date=datetime.strptime(data['show_date'], '%Y-%m-%d').date(),  # Use booking_date
            show_timeslot=data['show_timeslot']
        )

        db.session.add(new_booking)
        db.session.commit()
        return jsonify({'message': 'Booking added successfully'}), 201
    except SQLAlchemyError as e:
        print(f"Error adding booking to the database: {e}")
        return jsonify({'error': 'Something went wrong adding to the database'}), 500
    except KeyError as e:
        print(f"Missing key in JSON data: {e}")
        return jsonify({'error': f'Missing key in JSON data: {e}'}), 400
    except Exception as e:
        print(f"unknown error occured: {e}")
        db.session.rollback()
        return jsonify({'error': 'something really bad went wrong'}), 500

