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
    difficulty = data.get('difficulty')
    physical_rating = data.get('physicalRating')
    scare_factor = data.get('scareFactor')

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

    # Check for duplicate title (slug collision)
    existing = Room.query.filter(db.func.lower(Room.title) == title.lower()).first()
    if existing:
        return jsonify({'error': f'A room named "{existing.title}" already exists.'}), 400

    # save the room to the db
    response = add_room_service(title, max_capacity, min_capacity, duration, reset_buffer,
                                launch_date, sunset_date, description,
                                difficulty, physical_rating, scare_factor)
    return response


def add_room_service(title, max_capacity, min_capacity, duration, reset_buffer,
                     launch_date=None, sunset_date=None, description=None,
                     difficulty=None, physical_rating=None, scare_factor=None):
    # Convert empty strings to None
    launch_date = None if launch_date == "" else launch_date
    sunset_date = None if sunset_date == "" else sunset_date
    description = None if description == "" else description

    def _int_or_none(v):
        try:
            return int(v) if v not in (None, '') else None
        except (ValueError, TypeError):
            return None

    new_room = Room(
        title=title,
        max_capacity=max_capacity,
        min_capacity=min_capacity,
        duration=duration,
        reset_buffer=reset_buffer,
        launch_date=launch_date,
        sunset_date=sunset_date,
        description=description,
        difficulty=_int_or_none(difficulty),
        physical_rating=_int_or_none(physical_rating),
        scare_factor=_int_or_none(scare_factor),
    )
    try:
        # add the new room to the session and commit to db
        db.session.add(new_room)
        db.session.commit()
        return jsonify({"message": "Room added successfully", "id": new_room.id}), 201
    except Exception as e:
        logging.error(f"Error saving to database: {e}")
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


def compute_timeslots(start_time, end_time, interval_minutes, duration_minutes):
    """Compute the list of (start_minutes, slot_start, slot_end) tuples for a schedule rule.
    start_minutes is minutes since midnight — unique within a day, used as the booking key."""
    slots = []
    base = datetime(2000, 1, 1)
    current = base.replace(hour=start_time.hour, minute=start_time.minute, second=0, microsecond=0)
    deadline = base.replace(hour=end_time.hour, minute=end_time.minute, second=0, microsecond=0)
    while current + timedelta(minutes=duration_minutes) <= deadline:
        slot_end = current + timedelta(minutes=duration_minutes)
        start_minutes = current.hour * 60 + current.minute
        slots.append((start_minutes, current.time(), slot_end.time()))
        current += timedelta(minutes=interval_minutes)
    return slots


def get_room_availability_service(room_id):
    """TODO: REWORK! we don't want to be arbitrarily looking ahead num of days
    instead we should load the entire month and then when the date changes
    to another month we load that month.  Arbitrary days is not going to work"""

    start_date = datetime.today()
    end_date = start_date + timedelta(days=NUM_OF_DAYS_TO_CHECK)

    showtimes = db.session.query(Showtime).filter(Showtime.room_id == room_id).all()

    available_dates = set()

    for single_date in (start_date + timedelta(n) for n in range((end_date - start_date).days + 1)):
        day_of_week = single_date.weekday()
        day_rules = [st for st in showtimes if st.day_of_week == day_of_week]

        if not day_rules:
            continue

        bookings = db.session.query(Booking).filter(
            Booking.room_id == room_id,
            Booking.show_date == single_date.date(),
            Booking.status != 'cancelled'
        ).all()
        # Sum guest_count per timeslot to support multiple bookings sharing a slot
        guest_totals = {}
        for b in bookings:
            guest_totals[b.show_timeslot] = guest_totals.get(b.show_timeslot, 0) + b.guest_count

        for rule in day_rules:
            interval = rule.room.duration + rule.room.reset_buffer
            slots = compute_timeslots(rule.start_time, rule.end_time, interval, rule.room.duration)
            if any(guest_totals.get(start_minutes, 0) < rule.room.max_capacity for start_minutes, _, _ in slots):
                available_dates.add(single_date.date())
                break

    return [date.strftime('%Y-%m-%d') for date in available_dates]


def get_room_timeslots_service(room_id, date_str):
    try:
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')

        rules = db.session.query(Showtime).filter(
            Showtime.room_id == room_id,
            Showtime.day_of_week == date_obj.weekday()
        ).all()

        bookings = db.session.query(Booking).filter(
            Booking.room_id == room_id,
            Booking.show_date == date_obj.date(),
            Booking.status != 'cancelled'
        ).all()
        guest_totals = {}
        for b in bookings:
            guest_totals[b.show_timeslot] = guest_totals.get(b.show_timeslot, 0) + b.guest_count

        timeslot_list = []
        for rule in rules:
            interval = rule.room.duration + rule.room.reset_buffer
            slots = compute_timeslots(rule.start_time, rule.end_time, interval, rule.room.duration)
            for start_minutes, slot_start, slot_end in slots:
                booked = guest_totals.get(start_minutes, 0)
                remaining = max(0, rule.room.max_capacity - booked)
                timeslot_list.append({
                    'id': start_minutes,
                    'timeslot': start_minutes,
                    'roomName': rule.room.title,
                    'startTime': slot_start.strftime('%H:%M'),
                    'endTime': slot_end.strftime('%H:%M'),
                    'isBooked': remaining == 0,
                    'available_spots': remaining
                })

        return timeslot_list
    except Exception as e:
        print(f"Error in get_room_timeslots_service: {e}")
        return []

