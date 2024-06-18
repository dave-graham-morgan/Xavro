import logging
import os

from dotenv import load_dotenv
from flask import Flask

from app.models import connect_db
from config import DevelopmentConfig, ProductionConfig

load_dotenv()  # use this to read in environment below


def create_app(config_class=ProductionConfig):
    app = Flask(__name__)
    app.config.from_object(config_class)
    logging.basicConfig(filename='app.log')

    @app.route("/", methods=["GET"])
    def show_homepage():
        return "Hello you big tiger!"

    return app


if __name__ == '__main__':
    if os.environ.get('ENVIRONMENT') == 'DEV':
        app = create_app(DevelopmentConfig)
        debug = True
    else:
        app = create_app(ProductionConfig)
        debug = False
    connect_db(app)
    app.run(port=8080, debug=debug)

