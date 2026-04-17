import os
import resend
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from flask_jwt_extended import create_access_token, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.exc import SQLAlchemyError
from ..models import db, User
from ..utils import Roles
from ..decorators import role_required
import datetime

users_blueprint = Blueprint('users', __name__)


def _user_dict(user):
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': user.role.name
    }


# ── Admin: list all users ─────────────────────────────────────────────────────

@users_blueprint.route('/api/users', methods=['GET'])
@cross_origin()
@role_required(Roles.ADMIN)
def get_users():
    users = User.query.order_by(User.username).all()
    return jsonify([_user_dict(u) for u in users])


# ── Admin: create user ────────────────────────────────────────────────────────

@users_blueprint.route('/api/users', methods=['POST'])
@cross_origin()
@role_required(Roles.ADMIN)
def create_user():
    data = request.get_json()
    username = data.get('username', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    role_name = data.get('role', 'EMPLOYEE')

    if not username or not email or not password:
        return jsonify({'error': 'Username, email and password are required'}), 400

    existing = User.query.filter(
        (User.username == username) | (User.email == email)
    ).first()
    if existing:
        return jsonify({'error': 'A user with that username or email already exists'}), 409

    try:
        role = Roles[role_name]
    except KeyError:
        return jsonify({'error': 'Invalid role'}), 400

    hashed = generate_password_hash(password, method='pbkdf2:sha256')
    user = User(username=username, email=email, password=hashed, role=role)

    try:
        db.session.add(user)
        db.session.commit()
        return jsonify({'message': 'User created successfully', 'user': _user_dict(user)}), 201
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ── Admin: update user (username, email, role) ────────────────────────────────

@users_blueprint.route('/api/users/<int:user_id>', methods=['PUT'])
@cross_origin()
@role_required(Roles.ADMIN)
def update_user(user_id):
    data = request.get_json()
    user = User.query.get_or_404(user_id)

    username = data.get('username', '').strip()
    email = data.get('email', '').strip().lower()
    role_name = data.get('role', user.role.name)

    if not username or not email:
        return jsonify({'error': 'Username and email are required'}), 400

    # Check uniqueness against other users
    conflict = User.query.filter(
        ((User.username == username) | (User.email == email)) & (User.id != user_id)
    ).first()
    if conflict:
        return jsonify({'error': 'That username or email is already taken'}), 409

    try:
        role = Roles[role_name]
    except KeyError:
        return jsonify({'error': 'Invalid role'}), 400

    user.username = username
    user.email = email
    user.role = role

    try:
        db.session.commit()
        return jsonify({'message': 'User updated successfully', 'user': _user_dict(user)})
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ── Admin: send password reset email to a user ────────────────────────────────

@users_blueprint.route('/api/users/<int:user_id>/reset-password', methods=['POST'])
@cross_origin()
@role_required(Roles.ADMIN)
def admin_reset_password(user_id):
    user = User.query.get_or_404(user_id)

    reset_token = create_access_token(
        identity={'username': user.username, 'purpose': 'password_reset'},
        expires_delta=datetime.timedelta(minutes=15)
    )
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
    reset_link = f"{frontend_url}/reset-password?token={reset_token}"

    resend.api_key = os.environ.get('RESEND_API_KEY')
    email_from = os.environ.get('EMAIL_FROM', 'onboarding@resend.dev')

    try:
        resend.Emails.send({
            'from': email_from,
            'to': [user.email],
            'subject': 'Your Xavro password has been reset',
            'html': f"""
                <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
                    <h2>Password Reset</h2>
                    <p>Hi {user.username},</p>
                    <p>An admin has initiated a password reset for your account.
                       Click the link below to set a new password. This link expires in 15 minutes.</p>
                    <p><a href="{reset_link}" style="color:#c9a84c;">Set my new password</a></p>
                    <p style="color:#888;font-size:12px;">If you weren't expecting this, contact your administrator.</p>
                </div>
            """
        })
        return jsonify({'message': f'Password reset email sent to {user.email}'})
    except Exception as e:
        print(f"Error sending reset email: {e}")
        return jsonify({'error': 'Failed to send reset email'}), 500


# ── Admin: delete user ────────────────────────────────────────────────────────

@users_blueprint.route('/api/users/<int:user_id>', methods=['DELETE'])
@cross_origin()
@role_required(Roles.ADMIN)
def delete_user(user_id):
    current = get_jwt_identity()
    user = User.query.get_or_404(user_id)

    if user.username == current.get('username'):
        return jsonify({'error': "You can't delete your own account"}), 400

    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': 'User deleted successfully'})
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ── Staff: get own profile ────────────────────────────────────────────────────

@users_blueprint.route('/api/users/me', methods=['GET'])
@cross_origin()
@role_required(Roles.EMPLOYEE, Roles.ADMIN)
def get_profile():
    current = get_jwt_identity()
    user = User.query.filter_by(username=current['username']).first_or_404()
    return jsonify(_user_dict(user))


# ── Staff: update own profile (username + email only) ─────────────────────────

@users_blueprint.route('/api/users/me', methods=['PUT'])
@cross_origin()
@role_required(Roles.EMPLOYEE, Roles.ADMIN)
def update_profile():
    current = get_jwt_identity()
    user = User.query.filter_by(username=current['username']).first_or_404()
    data = request.get_json()

    username = data.get('username', '').strip()
    email = data.get('email', '').strip().lower()

    if not username or not email:
        return jsonify({'error': 'Username and email are required'}), 400

    conflict = User.query.filter(
        ((User.username == username) | (User.email == email)) & (User.id != user.id)
    ).first()
    if conflict:
        return jsonify({'error': 'That username or email is already taken'}), 409

    user.username = username
    user.email = email

    try:
        db.session.commit()
        return jsonify({'message': 'Profile updated successfully', 'user': _user_dict(user)})
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ── Staff: change own password (requires current password) ───────────────────

@users_blueprint.route('/api/users/me/password', methods=['PUT'])
@cross_origin()
@role_required(Roles.EMPLOYEE, Roles.ADMIN)
def change_own_password():
    current = get_jwt_identity()
    user = User.query.filter_by(username=current['username']).first_or_404()
    data = request.get_json()

    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')

    if not check_password_hash(user.password, current_password):
        return jsonify({'error': 'Current password is incorrect'}), 400

    if len(new_password) < 8:
        return jsonify({'error': 'New password must be at least 8 characters'}), 400

    user.password = generate_password_hash(new_password, method='pbkdf2:sha256')

    try:
        db.session.commit()
        return jsonify({'message': 'Password changed successfully'})
    except SQLAlchemyError as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
