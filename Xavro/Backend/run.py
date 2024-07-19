import os
from .app import create_app
from backend.app_files.models import connect_db
from backend.config import DevelopmentConfig, ProductionConfig


if __name__ == '__main__':
    if os.environ.get('ENVIRONMENT') == 'DEV':
        app = create_app(DevelopmentConfig)
        debug = True
    else:
        app = create_app(ProductionConfig)
        debug = False
    connect_db(app)
    app.run(port=8080, debug=debug)
