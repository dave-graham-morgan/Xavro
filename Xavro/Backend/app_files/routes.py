import os

from flask import Blueprint, request, jsonify, current_app
from flask_cors import cross_origin
from .services import save_room_data
from .utils import get_allowed_origins

# register the blueprints
auth_blueprint = Blueprint('auth', __name__)
rooms_blueprint = Blueprint('rooms', __name__)


@auth_blueprint.route("/", methods=["GET", "POST"])
def display_signup():
    return "auth_blueprint success"


# use lambda in the cross-origin decorator to ensure this is within application context
@rooms_blueprint.route("/api/rooms", methods=["POST", "OPTIONS"])
@cross_origin(origins='http://localhost:5173')
def display_rooms():
    print(get_allowed_origins())
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid Data"}), 400
    try:
        save_room_data(data)
        return jsonify({"message": "New room data saved successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
