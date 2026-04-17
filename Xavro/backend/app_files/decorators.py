from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity


def role_required(*roles):
    """Decorator that enforces JWT auth and checks the caller's role.
    Usage: @role_required(Roles.ADMIN) or @role_required(Roles.EMPLOYEE, Roles.ADMIN)
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            identity = get_jwt_identity()
            if identity.get('role') not in [r.name for r in roles]:
                return jsonify({'error': 'Insufficient permissions'}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator
