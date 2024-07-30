from flask import Blueprint
from flask_cors import cross_origin

# register the blueprints
auth_blueprint = Blueprint('auth', __name__)


@auth_blueprint.route('/', methods=['GET', 'POST'])
@cross_origin()
def display_signup():
    return 'auth_blueprint success'