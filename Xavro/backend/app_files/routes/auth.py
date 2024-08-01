from ..models import db, User
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError

auth_blueprint = Blueprint('auth', __name__)


@auth_blueprint.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    hashed_password = generate_password_hash(data['password'], method='sha256')
    new_user = User(username=data['username'], password=hashed_password, email=data['email'], role='GUEST')
    try:
        print("Saving New User")
        db.session.add(new_user)
        db.session.commit()
        print("New user saved successfully")
        return jsonify({'message': 'User registered successfully!'})
    except SQLAlchemyError as sql_error:
        print(f"Error saving to database {sql_error}")
        return jsonify({'error': 'Error saving new user to db'})
    except Exception as e:
        print(f"Something went wrong saving new user: {e}")
        return jsonify({'error': 'Error something went wrong saving new user to db'})


@auth_blueprint.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401

    # create the jwt and store username in the jwt identity
    access_token = create_access_token(identity={'username': user.username})
    return jsonify(access_token=access_token)


@auth_blueprint.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200


@auth_blueprint.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    # JWTs are stateless so logout can be handled client-side by removing the token
    return jsonify({'message': 'Logged out successfully!'})
