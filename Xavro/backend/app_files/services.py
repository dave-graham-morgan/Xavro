import logging
import os

from flask import jsonify
from .models import db, Room, Showtime, Booking
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()
NUM_OF_DAYS_TO_CHECK = int(os.getenv('NUM_OF_DAYS_TO_CHECK_AVAILABILITY'))


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
        return jsonify({"error": "Invalid data type"}), 200

    # Do validation even though UI will also do this
    # make sure none of the required fields are empty
    if not all([title, max_capacity, min_capacity, duration, reset_buffer]):
        logging.error("Error: missing required fields")
        return jsonify({"Error": "Missing required fields"}), 200

    # make sure min and max capacity are positive integers and min is less than max
    if not isinstance(max_capacity, int) or max_capacity <= 0:
        logging.error("Error: Max Capacity must be a positive integer")
        return jsonify({"Error": "Max Capacity must be a positive integer"}), 200
    if not isinstance(min_capacity, int) or min_capacity <= 0:
        logging.error("Error: Min Capacity must be a positive integer")
        return jsonify({"error": "Min Capacity must be a positive integer"}), 200
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


def get_room_availability_service(session, room_id):
    """TODO: REWORK! we don't want to be arbitrarily looking ahead num of days
    instead we should load the entire month and then when the date changes
    to another month we load that month.  Arbitrary days is not going towork"""

    start_date = datetime.today()
    end_date = start_date + timedelta(days=NUM_OF_DAYS_TO_CHECK)  # check availability for next x number of days

    # Get all showtimes for the room
    showtimes = session.query(Showtime).filter(Showtime.room_id == room_id).order_by(Showtime.day_of_week, Showtime.timeslot).all()

    # Initialize a set to store available dates
    available_dates = set()

    # Iterate through the date range
    for single_date in (start_date + timedelta(n) for n in range((end_date - start_date).days + 1)):
        # Get the day of the week (0 = Monday, ..., 6 = Sunday)
        day_of_week = single_date.weekday()

        # Get the showtimes for the current day of the week
        day_showtimes = [st for st in showtimes if st.day_of_week == day_of_week]

        if not day_showtimes:
            continue

        # Get all bookings for the room on the current date
        bookings = session.query(Booking).filter(Booking.room_id == room_id, Booking.show_date == single_date.date()).all()

        # Check if there is at least one showtime without a booking
        booked_timeslots = {booking.show_timeslot for booking in bookings}
        if any(showtime.timeslot not in booked_timeslots for showtime in day_showtimes):
            available_dates.add(single_date.date())

    # Convert dates to strings using my favorite thing, a list comprehension
    available_dates = [date.strftime('%Y-%m-%d') for date in available_dates]

    return available_dates


def get_room_timeslots_service(session, room_id, date_str):
    try:
        # Convert the date string to a datetime object
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')

        # Query the showtimes based on the room_id and day_of_week
        timeslots = session.query(Showtime).filter(
            Showtime.room_id == room_id,
            Showtime.day_of_week == date_obj.weekday()
        ).all()

        # Get all bookings for the given room and date
        bookings = session.query(Booking).filter(
            Booking.room_id == room_id,
            Booking.show_date == date_obj
        ).all()

        # Create a set of booked timeslots for quick lookup
        booked_timeslots = {booking.show_timeslot for booking in bookings}

        # Transform the timeslots into the format needed for the frontend
        timeslot_list = [
            {
                'id': timeslot.id,
                'timeslot': timeslot.timeslot,
                'roomName': timeslot.room.title,
                'startTime': timeslot.start_time.strftime('%H:%M'),
                'endTime': timeslot.end_time.strftime('%H:%M'),
                'isBooked': timeslot.timeslot in booked_timeslots
            }

            for timeslot in timeslots
        ]

        return timeslot_list
    except Exception as e:
        print(f"Error in get_room_timeslots_service: {e}")
        return []

