from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def connect_db(app):
    """connect to db"""
    with  app.app_context():
        db.app = app
        db.init_app(app)
        db.create_all()

class Customer(db.Model):
    """Customer table"""
    __tablename__="customers"

    id = db.Column(db.Integer, primary_key = True)
    first_name = db.Column(db.String(50), nullable=True)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(256), nullable = False)
    last_login = db.Column(db.Date)
    us_minor = db.Column(db.Boolean)

class Room(db.Model):
    """room table"""
    __tablename__="rooms"

    id = db.Column(db.Integer, primary_key = True)
    title = db.Column(db.String(100), nullable=False)
    max_capacity = db.Column(db.Integer, nullable=False)
    min_capacity = db.Column(db.Integer, nullable=False)
    duration = db.Column(db.Integer, nullable=False)
    cost = db.Column(db.Float, nullable=False)
    reset_buffer = db.Column(db.Integer, nullable=False)
    launch_date = db.Column(db.DateTime, nullable=False)
    sunset_date =db.Column(db.Float, nullable=True)
    description = db.Column(db.String, nullable=True)

class Room_cost(db.Modelse):
    """cost of each room"""
    __tablename__="room_costs"

    #there will be one row in this table for each guest count up to the guest count max of each room

    id = db.Column(db.Integer, primary_key = True)
    room_id = db.Column(db.Integer, db.ForeignKey('rooms.id', ondelete="cascade"), nullable=False)
    guests_count = db.Column(db.Integer, nullable=False)
    total_cost = db.Column(db.Float, nullable=False)

    #start and end dates exist so that we can change the price of a room
    start_date = db.Column(db.DateTime, nullable=True)
    end_date = db.Column(db.DateTime, nullable=True)
