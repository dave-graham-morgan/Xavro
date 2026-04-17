import os
import resend
from ..models import db, User
from ..utils import Roles
from ..decorators import role_required
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, decode_token
from flask_cors import cross_origin
from sqlalchemy.exc import SQLAlchemyError

auth_blueprint = Blueprint('auth', __name__)


@auth_blueprint.route('/login', methods=['POST'])
@cross_origin()
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401

    access_token = create_access_token(identity={'username': user.username, 'role': user.role.name})
    return jsonify(access_token=access_token, role=user.role.name)


@auth_blueprint.route('/forgot-password', methods=['POST'])
@cross_origin()
def forgot_password():
    data = request.get_json()
    email = data.get('email', '').strip().lower()

    # Always return success to prevent user enumeration
    user = User.query.filter_by(email=email).first()
    if user:
        # Short-lived reset token (15 minutes)
        reset_token = create_access_token(
            identity={'username': user.username, 'purpose': 'password_reset'},
            expires_delta=__import__('datetime').timedelta(minutes=15)
        )
        frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
        reset_link = f"{frontend_url}/reset-password?token={reset_token}"

        resend.api_key = os.environ.get('RESEND_API_KEY')
        email_from = os.environ.get('EMAIL_FROM', 'onboarding@resend.dev')

        try:
            resend.Emails.send({
                'from': email_from,
                'to': [user.email],
                'subject': 'Reset your Xavro password',
                'html': f"""
                    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
                        <h2>Password Reset</h2>
                        <p>Hi {user.username},</p>
                        <p>Click the link below to reset your password. This link expires in 15 minutes.</p>
                        <p><a href="{reset_link}" style="color:#c9a84c;">Reset my password</a></p>
                        <p style="color:#888;font-size:12px;">If you didn't request this, you can ignore this email.</p>
                    </div>
                """
            })
        except Exception as e:
            print(f"Error sending reset email: {e}")

    return jsonify({'message': 'If that email is registered you will receive a reset link shortly.'})


@auth_blueprint.route('/reset-password', methods=['POST'])
@cross_origin()
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('password')

    if not token or not new_password:
        return jsonify({'error': 'Token and new password are required'}), 400

    try:
        decoded = decode_token(token)
        identity = decoded.get('sub')
        if not identity or identity.get('purpose') != 'password_reset':
            return jsonify({'error': 'Invalid or expired reset link'}), 400

        user = User.query.filter_by(username=identity['username']).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        user.password = generate_password_hash(new_password, method='pbkdf2:sha256')
        db.session.commit()
        return jsonify({'message': 'Password updated successfully'})

    except Exception as e:
        print(f"Reset password error: {e}")
        return jsonify({'error': 'Invalid or expired reset link'}), 400


@auth_blueprint.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200


@auth_blueprint.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({'message': 'Logged out successfully!'})
