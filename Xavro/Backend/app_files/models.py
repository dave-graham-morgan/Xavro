from flask_sqlalchemy import SQLAlchemy

from .utils import PaymentStatus, BookingStatus, Roles

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
    last_login = db.Column(db.Date)
    us_minor = db.Column(db.Boolean)


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
    sunset_date = db.Column(db.Float, nullable=True)
    description = db.Column(db.String, nullable=True)


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
    """table to hold the showtimes for each room"""
    __tablename__ = "showtimes"

    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id', ondelete="cascade"), nullable=False)
    booked = db.Column(db.Boolean, nullable=True)
    bookable = db.Column(db.Boolean, nullable=True)


class Booking(db.Model):
    """store the bookings for each showtime"""
    __tablename__ = "bookings"

    id = db.Column(db.Integer, primary_key=True)
    showtime_id = db.Column(db.Integer, db.ForeignKey('showtimes.id', ondelete="cascade"), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id', ondelete="cascade"), nullable=False)
    guest_count = db.Column(db.Integer, nullable=False)
    status = db.Column(db.Enum(BookingStatus), default=BookingStatus.NOT_BOOKED)
    order_id = db.Column(db.String, nullable=False)  # this is the customer-facing ID


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
    username = db.Column(db.String(20), nullable=False)
    password = db.Column(db.String(61), nullable=False)
    email = db.Column(db.String(256), nullable=False)
    last_login = db.Column(db.DateTime, nullable=True)
    roll = db.Column(db.Enum(Roles), default=Roles.GUEST, nullable=False)
