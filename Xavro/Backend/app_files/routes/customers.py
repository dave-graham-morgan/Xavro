from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from ..models import db, Customer

from sqlalchemy.exc import SQLAlchemyError

# register the blueprints
customers_blueprint = Blueprint('customers', __name__)


@customers_blueprint.route('/api/customers', methods=['GET'])
@cross_origin()
def get_customers():
    # this route is used by the modal as well as the customer list component
    # if the query parms include and email we can assume we're in the modal and should return only one record
    email = request.args.get('email')

    if email:
        customer = Customer.query.filter_by(email=email).first()
        if customer:
            return jsonify({
                'id': customer.id,
                'first_name': customer.first_name,
                'last_name': customer.last_name,
                'email': customer.email,
                'is_minor': customer.is_minor,
                'is_banned': customer.is_banned,
                'customer_notes': customer.customer_notes
            })
        else:
            return jsonify({'error': 'Customer not found'}), 404  # TODO: handle this 404
    else:
        customers = Customer.query.all()
        return jsonify([{
            'id': customer.id,
            'first_name': customer.first_name,
            'last_name': customer.last_name,
            'email': customer.email,
            'is_minor': customer.is_minor,
            'is_banned': customer.is_banned,
            'customer_notes': customer.customer_notes
        } for customer in customers])



@customers_blueprint.route('/api/customers/<int:customer_id>', methods=['GET'])
@cross_origin()
def get_customer(customer_id):
    customer = Customer.query.get_or_404(customer_id)
    return jsonify({
        'id': customer.id,
        'first_name': customer.first_name,
        'last_name': customer.last_name,
        'email': customer.email,
        'is_minor': customer.is_minor,
        'is_banned': customer.is_banned,
        'customer_notes': customer.customer_notes
    })


@customers_blueprint.route('/api/customers', methods=['POST'])
@cross_origin()
def add_customer():

    data = request.get_json()

    # Create a new customer with optional fields
    new_customer = Customer(
        first_name=data['first_name'],
        last_name=data['last_name'],
        email=data['email'],
        is_minor=data.get('is_minor', None),
        is_banned=data.get('is_banned', None),
        customer_notes=data.get('customer_notes', '')
    )

    try:
        db.session.add(new_customer)
        db.session.commit()
        return jsonify({
            'id': new_customer.id,
            'first_name': new_customer.first_name,
            'last_name': new_customer.last_name,
            'email': new_customer.email,
            'is_minor': new_customer.is_minor,
            'is_banned': new_customer.is_banned,
            'customer_notes': new_customer.customer_notes
        }), 201
    except SQLAlchemyError as e:
        print(f"error saving to database: {e}")
        db.session.rollback()
        return jsonify({'error': 'something went wrong saving to database'}), 500
    except Exception as e:
        print(f"unknown error occured: {e}")
        db.session.rollback()
        return jsonify({'error': 'something really bad went wrong'}), 500


@customers_blueprint.route('/api/customers/<int:customer_id>', methods=['PUT'])
@cross_origin()
def update_customer(customer_id):
    data = request.get_json()
    customer = Customer.query.get_or_404(customer_id)
    try:
        customer.first_name = data['first_name']
        customer.last_name = data['last_name']
        customer.email = data['email']
        customer.is_minor = data.get('is_minor', False)
        customer.is_banned = data.get('is_banned', False)
        customer.customer_notes = data['customer_notes']

        db.session.commit()
        return jsonify({'message': 'Customer updated successfully'}), 200
    except SQLAlchemyError as e:
        print(f"error saving to database: {e}")
        db.session.rollback()
        return jsonify({'error': 'something went wrong saving to database'}), 500
    except Exception as e:
        print(f"unknown error occured: {e}")
        db.session.rollback()
        return jsonify({'error': 'something really bad went wrong'}), 500


@customers_blueprint.route('/api/customers/<int:customer_id>', methods=['DELETE'])
@cross_origin()
def delete_customer(customer_id):
    customer = Customer.query.get_or_404(customer_id)
    try:
        db.session.delete(customer)
        db.session.commit()
        return jsonify({'message': 'Customer deleted successfully'}), 200
    except SQLAlchemyError as e:
        print(f"error deleting from database: {e}")
        return jsonify({'error': 'something went wrong saving to database'}), 500
    except Exception as e:
        print(f"unknown error occured: {e}")
        return jsonify({'error': 'something really bad went wrong'}), 500
