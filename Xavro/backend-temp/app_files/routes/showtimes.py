from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from ..models import db, Showtime
from ..utils import time_to_string

from sqlalchemy.exc import SQLAlchemyError

# register the blueprints
showtimes_blueprint = Blueprint('showtimes', __name__)


@showtimes_blueprint.route('/api/rooms/<int:room_id>/showtimes', methods=['GET'])
@cross_origin()
def get_all_showtimes(room_id):
    showtimes = Showtime.query.filter_by(room_id=room_id).all()
    return jsonify([{
        'id': showtime.id,
        'room_id': showtime.room_id,
        'start_time': time_to_string(showtime.start_time),
        'end_time': time_to_string(showtime.end_time),
        'day_of_week': showtime.day_of_week,
        'timeslot': showtime.timeslot
    } for showtime in showtimes])


@showtimes_blueprint.route('/api/showtimes/<int:showtime_id>', methods=['GET'])
@cross_origin()
def get_showtime(showtime_id):
    showtime = Showtime.query.get_or_404(showtime_id)
    return jsonify({
        'id': showtime.id,
        'room_id': showtime.room_id,
        'start_time': time_to_string(showtime.start_time),
        'end_time': time_to_string(showtime.end_time),
        'day_of_week': showtime.day_of_week,
        'timeslot': showtime.timeslot
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
        showtime.start_time = data['start_time']
        showtime.end_time = data['end_time']
        showtime.day_of_week = data['day_of_week']
        showtime.timeslot = data['timeslot']

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
        start_time=data['start_time'],
        end_time=data['end_time'],
        day_of_week=data['day_of_week'],
        timeslot=data['timeslot']
    )
    try:
        db.session.add(new_showtime)
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

