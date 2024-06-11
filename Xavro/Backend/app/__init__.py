from flask import Flask

import logging

from app.models import db, connect_db
from config import ProductionConfig


def create_app(config_class=ProductionConfig):
    print("we are in create_app!!!!")
    app = Flask(__name__)
    app.config.from_object(config_class)
    with app.app_context():
        print("we are in the app context - not sure what that even is")
        connect_db(app)
    # toolbar = DebugToolbarExtension(app)
    logging.basicConfig(filename='app.log', level=logging.INFO)

    @app.route('/')
    def home():
        return "Hello, Flask!"

    return app
