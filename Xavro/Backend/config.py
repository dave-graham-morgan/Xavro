from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

class BaseConfig:
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    WTF_CSRF_ENABLED = True
    SQLALCHEMY_ECHO = False
    DEBUG_TB_INTERCEPT_REDIRECTS = False

class DevelopmentConfig(BaseConfig):
    SQLALCHEMY_DATABASE_URI = os.environ.get('SQLALCHEMY_DEV_DATABASE_URI')
    SECRET_KEY = os.environ.get('DEV_SECRET_KEY')

class ProductionConfig(BaseConfig):
    SQLALCHEMY_DATABASE_URI = os.environ.get('SQLALCHEMY_PROD_DATABASE_URI')
    SECRET_KEY = os.environ.get('PROD_SECRET_KEY')
