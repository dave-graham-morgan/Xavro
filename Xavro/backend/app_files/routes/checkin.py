from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from ..models import db, Booking, CustomerRoomCompletion
from ..decorators import role_required
from ..utils import Roles
from datetime import datetime, date
from sqlalchemy.exc import SQLAlchemyError

checkin_blueprint = Blueprint('checkin', __name__)


def _booking_dict(booking):
    customer = booking.customer
    customer_name = f"{customer.first_name or ''} {customer.last_name}".strip() if customer else 'Unknown'
    room = booking.room
    waivers_signed = sum(1 for g in booking.guests if g.waiver_signed_at is not None)
    return {
        'id': booking.id,
        'show_timeslot': booking.show_timeslot,
        'show_date': booking.show_date.isoformat(),
        'room_id': booking.room_id,
        'room_name': room.title if room else 'Unknown',
        'customer_id': booking.customer_id,
        'customer_name': customer_name,
        'guest_count': booking.guest_count,
        'waivers_signed': waivers_signed,
        'paid': booking.status != 'pending',
        'status': booking.status,
        'started_at': booking.started_at.isoformat() if booking.started_at else None,
    }


# ── Today's schedule ──────────────────────────────────────────────────────────

@checkin_blueprint.route('/api/checkin/today', methods=['GET'])
@cross_origin()
@role_required(Roles.EMPLOYEE, Roles.ADMIN)
def get_today():
    today = date.today()
    bookings = (
        Booking.query
        .filter(Booking.show_date == today, Booking.status != 'cancelled')
        .order_by(Booking.show_timeslot)
        .all()
    )
    return jsonify([_booking_dict(b) for b in bookings])


# ── Check in a single booking (verify waivers + payment) ─────────────────────

@checkin_blueprint.route('/api/checkin/bookings/<int:booking_id>/checkin', methods=['POST'])
@cross_origin()
@role_required(Roles.EMPLOYEE, Roles.ADMIN)
def checkin_booking(booking_id):
    booking = Booking.query.get_or_404(booking_id)
    booking.status = 'checked_in'
    try:
        db.session.commit()
        return jsonify(_booking_dict(booking))
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ── Start a room session (all bookings for that room/date/timeslot) ───────────

@checkin_blueprint.route('/api/checkin/session/start', methods=['POST'])
@cross_origin()
@role_required(Roles.EMPLOYEE, Roles.ADMIN)
def start_session():
    data = request.get_json()
    room_id = data.get('room_id')
    show_date_str = data.get('show_date')
    show_timeslot = data.get('show_timeslot')

    try:
        show_date = datetime.strptime(show_date_str, '%Y-%m-%d').date()
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid show_date format, expected YYYY-MM-DD'}), 400

    started_at = datetime.utcnow()
    bookings = Booking.query.filter(
        Booking.room_id == room_id,
        Booking.show_date == show_date,
        Booking.show_timeslot == show_timeslot,
        Booking.status != 'cancelled'
    ).all()

    if not bookings:
        return jsonify({'error': 'No bookings found for that session'}), 404

    for b in bookings:
        b.status = 'in_progress'
        b.started_at = started_at

    try:
        db.session.commit()
        return jsonify({'message': 'Session started', 'started_at': started_at.isoformat()})
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ── Complete a room session ───────────────────────────────────────────────────

@checkin_blueprint.route('/api/checkin/session/complete', methods=['POST'])
@cross_origin()
@role_required(Roles.EMPLOYEE, Roles.ADMIN)
def complete_session():
    data = request.get_json()
    room_id = data.get('room_id')
    show_date_str = data.get('show_date')
    show_timeslot = data.get('show_timeslot')
    escaped = data.get('escaped', False)
    duration_minutes = data.get('duration_minutes')

    try:
        show_date = datetime.strptime(show_date_str, '%Y-%m-%d').date()
    except (ValueError, TypeError):
        return jsonify({'error': 'Invalid show_date format, expected YYYY-MM-DD'}), 400

    bookings = Booking.query.filter(
        Booking.room_id == room_id,
        Booking.show_date == show_date,
        Booking.show_timeslot == show_timeslot,
        Booking.status == 'in_progress'
    ).all()

    if not bookings:
        return jsonify({'error': 'No in-progress bookings found for that session'}), 404

    completed_date = date.today()
    completed_time = datetime.utcnow().time()

    for b in bookings:
        b.status = 'completed'
        completion = CustomerRoomCompletion(
            customer_id=b.customer_id,
            room_id=b.room_id,
            completed_date=completed_date,
            completed_time=completed_time,
            succeeded=escaped,
            duration_minutes=duration_minutes
        )
        db.session.add(completion)

    try:
        db.session.commit()
        return jsonify({'message': 'Session completed'})
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
