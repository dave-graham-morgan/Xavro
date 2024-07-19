from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from .services import save_room_data
from .utils import get_allowed_origins

# register the blueprints
auth_blueprint = Blueprint('auth', __name__)
rooms_blueprint = Blueprint('rooms', __name__)


@auth_blueprint.route("/", methods=["GET", "POST"])
def display_signup():
    return "auth_blueprint success"


def get_origins():
    origins = get_allowed_origins()
    print(f"within lambda we have origins {origins}")
    return origins

# use lambda in the cross-origin decorator to ensure this is within application context
@rooms_blueprint.route("/api/rooms", methods=["POST", "OPTIONS"])
@cross_origin(origins='http://localhost:5173')
def display_rooms():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid Data"}), 400
    try:
        save_room_data(data)
        return jsonify({"message": f"New room {data['title']} saved successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
