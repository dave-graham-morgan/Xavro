import logging
import os

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from backend.config import ProductionConfig, DevelopmentConfig
from backend.app_files.models import connect_db

# import the route blueprints
from backend.app_files.routes.bookings import bookings_blueprint
from backend.app_files.routes.customers import customers_blueprint
from backend.app_files.routes.rooms import rooms_blueprint
from backend.app_files.routes.showtimes import showtimes_blueprint
from backend.app_files.routes.auth import auth_blueprint

load_dotenv()  # use this to read in environment variables below


def create_app(config_class=ProductionConfig):
    app = Flask(__name__)

    # get allowed_origins from .env
    ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS')
    print('allowed origins below:')
    print(ALLOWED_ORIGINS)

    # set CORS globally
    CORS(app, resources={r"/api/*": {
        "origins": ALLOWED_ORIGINS,
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "max_age": 3600
    }})

    app.config.from_object(config_class)
    logging.basicConfig(filename='app.log')

    # Initialize JWT
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
    jwt = JWTManager(app)

    # register blueprints
    app.register_blueprint(auth_blueprint)
    app.register_blueprint(rooms_blueprint)
    app.register_blueprint(bookings_blueprint)
    app.register_blueprint(showtimes_blueprint)
    app.register_blueprint(customers_blueprint)

    connect_db(app)

    return app

# Create the application instance
if os.environ.get('ENVIRONMENT') == 'DEV':
    app = create_app(DevelopmentConfig)
else:
    app = create_app(ProductionConfig)
    print("we are in production beyathces")

if __name__ == '__main__':
    app.run(port=8080, debug=app.config['DEBUG'])
