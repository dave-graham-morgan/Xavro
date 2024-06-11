import os

from dotenv import load_dotenv

from config import DevelopmentConfig, ProductionConfig
from app import create_app

load_dotenv()
print("OK we are in the app.py!!!!!")
if os.environ.get('ENVIRONMENT') == 'DEV':
    config_class = DevelopmentConfig
    debug = True
else:
    config_class = ProductionConfig
    debug = False
 

app = create_app(config_class)

if __name__ == '__main__':
    app.run(port=8080, debug=debug)

