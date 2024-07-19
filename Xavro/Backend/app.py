import logging

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from app.routes import auth_blueprint, rooms_blueprint
from config import ProductionConfig
import config_globals

load_dotenv()  # use this to read in environment below


def create_app(config_class=ProductionConfig):
    app = Flask(__name__)

    config_globals.ALLOWED_ORIGINS = config_class.REACT_SERVER_BASE_URL

    CORS(app, resources={r"/api/*": {"origins": config_globals.ALLOWED_ORIGINS}})  # enable cors for /api/ routes
    app.config.from_object(config_class)
    logging.basicConfig(filename='app.log')

    # register blueprints
    app.register_blueprint(auth_blueprint)
    app.register_blueprint(rooms_blueprint)

    return app
