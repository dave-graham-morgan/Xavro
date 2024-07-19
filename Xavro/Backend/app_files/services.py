import logging

from flask import jsonify
from .models import db, Room


def save_room_data(data):
    # first extract dic into their own variables
    title = data.get('title')
    max_capacity = data.get('maxCapacity')
    min_capacity = data.get('minCapacity')
    duration = data.get('duration')
    reset_buffer = data.get('resetBuffer')
    launch_date = data.get('launchDate')
    sunset_date = data.get('sunsetDate')
    description = data.get('description')

    # Convert max_capacity, min_capacity, duration and reset_buffer to integers if they are strings
    try:
        max_capacity = int(max_capacity)
        min_capacity = int(min_capacity)
        duration = int(duration)
        reset_buffer = int(reset_buffer)

    except ValueError as e:
        logging.error(f"Error with datatypes not being integers: {e}")
        return jsonify({"error": "Invalid data type"}), 400

    # Do validation even though UI will also do this
    # make sure none of the required fields are empty
    if not all([title, max_capacity, min_capacity, duration, reset_buffer]):
        logging.error("Error: missing required fields")
        return jsonify({"Error": "Missing required fields"}), 400

    # make sure min and max capacity are positive integers and min is less than max
    if not isinstance(max_capacity, int) or max_capacity <= 0:
        logging.error("Error: Max Capacity must be a positive integer")
        return jsonify({"Error": "Max Capacity must be a positive integer"}), 400
    if not isinstance(min_capacity, int) or min_capacity <= 0:
        logging.error("Error: Min Capacity must be a positive integer")
        return jsonify({"error": "Min Capacity must be a positive integer"}), 400
    if min_capacity > max_capacity:
        logging.error("Error: Min Capacity must be less than Max Capacity")
        return jsonify({"error": "Min Capacity must be less than Max Capacity"}), 400

    # save the room to the db
    response = add_room_service(title, max_capacity, min_capacity, duration, reset_buffer,
                                launch_date, sunset_date, description)
    return response


def add_room_service(title, max_capacity, min_capacity, duration, reset_buffer,
                     launch_date=None, sunset_date=None, description=None):
    # Convert empty strings to None
    launch_date = None if launch_date == "" else launch_date
    sunset_date = None if sunset_date == "" else sunset_date
    description = None if description == "" else description

    new_room = Room(
        title=title,
        max_capacity=max_capacity,
        min_capacity=min_capacity,
        duration=duration,
        reset_buffer=reset_buffer,
        launch_date=launch_date,
        sunset_date=sunset_date,
        description=description
    )
    try:
        # add the new room to the session and commit to db
        db.session.add(new_room)
        db.session.commit()
        return jsonify({"message": "Room added successfully"}), 201
    except Exception as e:
        logging.error(f"Error saving to database: {e}")
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
