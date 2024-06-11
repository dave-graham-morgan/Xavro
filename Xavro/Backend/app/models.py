from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def connect_db(app):
    """connect to db"""
    db.app = app
    db.init_app(app)
    db.create_all()
