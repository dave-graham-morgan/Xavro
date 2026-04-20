from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import relationship

from .utils import PaymentStatus, Roles

db = SQLAlchemy()


def connect_db(app):
    """connect to db"""
    with app.app_context():
        db.app = app
        db.init_app(app)
        db.create_all()


class Customer(db.Model):
    """Customer table"""
    __tablename__ = "customers"

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(50), nullable=True)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(256), nullable=False)
    is_minor = db.Column(db.Boolean, nullable=True)
    is_banned = db.Column(db.Boolean, nullable=True)
    customer_notes = db.Column(db.String, nullable=True)

    bookings = relationship("Booking", back_populates="customer")
    room_completions = relationship("CustomerRoomCompletion", back_populates="customer",
                                   cascade="all, delete-orphan")


class Room(db.Model):
    """room table"""
    __tablename__ = "rooms"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    max_capacity = db.Column(db.Integer, nullable=False)
    min_capacity = db.Column(db.Integer, nullable=False)
    duration = db.Column(db.Integer, nullable=False)
    reset_buffer = db.Column(db.Integer, nullable=False)
    launch_date = db.Column(db.DateTime, nullable=True)
    sunset_date = db.Column(db.DateTime, nullable=True)
    description = db.Column(db.String, nullable=True)
    difficulty = db.Column(db.Integer, nullable=True)       # 1–5
    physical_rating = db.Column(db.Integer, nullable=True)  # 1–5
    scare_factor = db.Column(db.Integer, nullable=True)     # 1–5

    showtimes = relationship("Showtime", back_populates="room")
    special_schedules = relationship("SpecialSchedule", back_populates="room")
    images = relationship("RoomImage", back_populates="room", order_by="RoomImage.display_order")
    completions = relationship("CustomerRoomCompletion", back_populates="room")
    bookings = relationship("Booking", back_populates="room")



class RoomCost(db.Model):
    """cost of each room, there will be one row for each guest count up to the max_capacity of each room"""
    __tablename__ = "room_costs"

    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id', ondelete="cascade"), nullable=False)
    guests_count = db.Column(db.Integer, nullable=False)
    total_cost = db.Column(db.Float, nullable=False)

    # start and end dates exist so that we can change the price of a room
    start_date = db.Column(db.DateTime, nullable=True)
    end_date = db.Column(db.DateTime, nullable=True)


class Waiver(db.Model):
    """table to hold the different waivers"""
    __tablename__ = "waivers"

    id = db.Column(db.Integer, primary_key=True)
    start_date = db.Column(db.DateTime, nullable=True)
    end_date = db.Column(db.DateTime, nullable=True)


class CustomerWaiver(db.Model):
    """table to hold signed waivers"""
    __tablename__ = "customers_waivers"

    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id', ondelete="cascade"), nullable=False)
    waivers_id = db.Column(db.Integer, db.ForeignKey('waivers.id', ondelete="cascade"), nullable=False)
    sign_date = db.Column(db.DateTime, nullable=True)


class Showtime(db.Model):
    """Schedule rule for a room on a given day of week.
    Available slots are computed dynamically from start_time, end_time, and interval_minutes."""
    __tablename__ = "showtimes"

    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id', ondelete="cascade"), nullable=False)
    day_of_week = db.Column(db.Integer, nullable=False)  # 0 = Monday, 6 = Sunday
    start_time = db.Column(db.Time, nullable=False)      # first slot start time
    end_time = db.Column(db.Time, nullable=False)        # no slot may end after this time
    interval_minutes = db.Column(db.Integer, nullable=False)  # minutes between slot start times

    room = relationship("Room", back_populates="showtimes")

    def __repr__(self):
        return (f"<Showtime(id={self.id}, "
                f"room_id={self.room_id}, "
                f"day_of_week={self.day_of_week}, "
                f"start_time={self.start_time}, "
                f"end_time={self.end_time}, "
                f"interval_minutes={self.interval_minutes})>")


class RoomImage(db.Model):
    """Images for a room, supports multiple images with ordering"""
    __tablename__ = "room_images"

    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id', ondelete="cascade"), nullable=False)
    image_url = db.Column(db.String, nullable=False)
    alt_text = db.Column(db.String(200), nullable=True)
    display_order = db.Column(db.Integer, nullable=False, default=0)
    is_primary = db.Column(db.Boolean, nullable=False, default=False)

    room = relationship("Room", back_populates="images")


class SpecialSchedule(db.Model):
    """table to handle special schedules like closures or maintenance"""
    __tablename__ = "special_schedules"

    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id', ondelete="cascade"), nullable=False)
    date = db.Column(db.Date, nullable=False)
    closed = db.Column(db.Boolean, nullable=False, default=True)
    reason = db.Column(db.String, nullable=True)

    room = relationship("Room", back_populates="special_schedules")


class Booking(db.Model):
    """store the bookings for each showtime"""
    __tablename__ = "bookings"

    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id', ondelete="cascade"), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id', ondelete="cascade"), nullable=False)
    guest_count = db.Column(db.Integer, nullable=False)
    order_id = db.Column(db.String, nullable=False)  # this is the customer-facing ID
    booking_date = db.Column(db.Date, nullable=False)  # the date the booking was made
    show_date = db.Column(db.Date, nullable=False)  # the date of the show
    show_timeslot = db.Column(db.Integer, nullable=False)  # minutes since midnight; unique slot key
    status = db.Column(db.String(20), nullable=False, default='confirmed')
    # statuses: pending | confirmed | checked_in | in_progress | completed | cancelled
    team_name = db.Column(db.String(100), nullable=True)
    escape_time_seconds = db.Column(db.Integer, nullable=True)   # null = did not escape
    team_photo_url = db.Column(db.String, nullable=True)
    stripe_session_id = db.Column(db.String, nullable=True)
    started_at = db.Column(db.DateTime, nullable=True)  # set when staff starts the room

    customer = relationship("Customer", back_populates="bookings")
    room = relationship("Room", back_populates="bookings")
    guests = relationship("BookingGuest", back_populates="booking", cascade="all, delete-orphan")


class CustomerRoomCompletion(db.Model):
    """Tracks which rooms a customer has completed and when.
    A customer may complete the same room more than once — no uniqueness constraint.
    room_id is SET NULL on room delete so history survives room retirement."""
    __tablename__ = "customer_room_completions"

    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id', ondelete="CASCADE"), nullable=False)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id', ondelete="SET NULL"), nullable=True)
    completed_date = db.Column(db.Date, nullable=False)
    completed_time = db.Column(db.Time, nullable=True)   # time of day the session started
    succeeded = db.Column(db.Boolean, nullable=True)     # True = escaped, False = did not escape
    duration_minutes = db.Column(db.Integer, nullable=True)

    customer = relationship("Customer", back_populates="room_completions")
    room = relationship("Room", back_populates="completions")


class BookingGuest(db.Model):
    """One record per person in a booking party.
    Created when guests sign waivers (at booking time or on arrival).
    waiver_signed_at is null until the waiver is signed."""
    __tablename__ = "booking_guests"

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id', ondelete="CASCADE"), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    is_minor = db.Column(db.Boolean, nullable=False, default=False)
    waiver_signed_at = db.Column(db.DateTime, nullable=True)
    signed_by_name = db.Column(db.String(100), nullable=True)  # guardian name when signing for a minor

    booking = relationship("Booking", back_populates="guests")


class Payments(db.Model):
    """payments for each booking.  Could be multiple"""
    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id', ondelete="cascade"), nullable=False)
    payment_amt = db.Column(db.Float, nullable=False)
    status = db.Column(db.Enum(PaymentStatus), default=PaymentStatus.NOT_PAID)


class User(db.Model):
    """User model"""
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), nullable=False, unique=True)
    password = db.Column(db.String(256), nullable=False)
    email = db.Column(db.String(256), nullable=False, unique=True)
    last_login = db.Column(db.DateTime, nullable=True)
    role = db.Column(db.Enum(Roles), default=Roles.EMPLOYEE, nullable=False)
