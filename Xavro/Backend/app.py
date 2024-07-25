import logging
import os

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from backend.app_files.routes import (
    auth_blueprint,
    rooms_blueprint,
    bookings_blueprint,
    showtimes_blueprint,
    customers_blueprint
)
from backend.config import ProductionConfig, DevelopmentConfig
from backend.app_files.models import connect_db

load_dotenv()  # use this to read in environment variables below


def create_app(config_class=ProductionConfig):
    newApp = Flask(__name__)

    # get allowed_origins from .env
    ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS')
    print(f"allowed Origins = {ALLOWED_ORIGINS}")

    # set CORS globally
    CORS(newApp, resources={r"/api/*": {
        "origins": ALLOWED_ORIGINS,
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "max_age": 3600
    }})

    newApp.config.from_object(config_class)
    logging.basicConfig(filename='app.log')

    # register blueprints
    newApp.register_blueprint(auth_blueprint)
    newApp.register_blueprint(rooms_blueprint)
    newApp.register_blueprint(bookings_blueprint)
    newApp.register_blueprint(showtimes_blueprint)
    newApp.register_blueprint(customers_blueprint)


    return newApp


if __name__ == '__main__':
    if os.environ.get('ENVIRONMENT') == 'DEV':
        app = create_app(DevelopmentConfig)
        debug = True
    else:
        app = create_app(ProductionConfig)
        debug = False
    connect_db(app)
    app.run(port=8080, debug=debug)
