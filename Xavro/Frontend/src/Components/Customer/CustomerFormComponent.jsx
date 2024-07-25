import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './CustomerFormComponent.css';

const CustomerFormComponent = () => {
    const { customerId } = useParams();
    const navigate = useNavigate();
    const [customerFormData, setCustomerFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        is_minor: false,
        is_banned: false,
        customer_notes: ''
    });

    const [responseMessage, setResponseMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        if (customerId) {
            const fetchCustomerDetails = async () => {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/customers/${customerId}`);
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const data = await response.json();
                    setCustomerFormData({
                        first_name: data.first_name || '',
                        last_name: data.last_name || '',
                        email: data.email || '',
                        is_minor: data.is_minor ?? false,
                        is_banned: data.is_banned ?? false,
                        customer_notes: data.customer_notes || ''
                    });
                } catch (error) {
                    console.error('Error fetching customer details:', error);
                }
            };

            fetchCustomerDetails();
        }
    }, [customerId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCustomerFormData({
            ...customerFormData,
            [name]: type === 'checkbox' ? checked : value
        });
    }

    const validateCustomerForm = () => {
        const errors = {};
        if (!customerFormData.first_name) errors.first_name = 'First Name is required';
        if (!customerFormData.last_name) errors.last_name = 'Last Name is required';
        if (!customerFormData.email) errors.email = 'Email is required';
        return errors;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateCustomerForm();
        setFormErrors(errors);

        if (Object.keys(errors).length === 0) {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}api/customers${customerId ? `/${customerId}` : ''}`,
                    {
                        method: customerId ? 'PUT' : 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(customerFormData)
                    }
                );
                const data = await response.json();
                if (response.ok) {
                    setResponseMessage(data.message);
                    setErrorMessage('');
                    if (!customerId) {
                        setCustomerFormData({
                            first_name: '',
                            last_name: '',
                            email: '',
                            is_minor: false,
                            is_banned: false,
                            customer_notes: ''
                        });
                    }
                } else {
                    setErrorMessage(data.error);
                    setResponseMessage('');
                }
            } catch (error) {
                console.error('Error submitting form to server:', error);
            }
        }
    }

    return (
        <div className={`container mt-5 customerFormContainer`}>
            {responseMessage && <p className="text-success">{responseMessage}</p>}
            {errorMessage && <p className="text-danger">{errorMessage}</p>}
            <div className="card">
                <div className="card-header">
                    <h2>{customerId ? 'Edit Customer' : 'Add Customer'}</h2>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>First Name:</label>
                            <input
                                type="text"
                                className={`form-control ${formErrors.first_name ? 'is-invalid' : ''}`}
                                name="first_name"
                                value={customerFormData.first_name}
                                onChange={handleChange}
                            />
                            {formErrors.first_name && <div className="invalid-feedback">{formErrors.first_name}</div>}
                        </div>
                        <div className="form-group">
                            <label>Last Name:</label>
                            <input
                                type="text"
                                className={`form-control ${formErrors.last_name ? 'is-invalid' : ''}`}
                                name="last_name"
                                value={customerFormData.last_name}
                                onChange={handleChange}
                            />
                            {formErrors.last_name && <div className="invalid-feedback">{formErrors.last_name}</div>}
                        </div>
                        <div className="form-group">
                            <label>Email:</label>
                            <input
                                type="email"
                                className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                                name="email"
                                value={customerFormData.email}
                                onChange={handleChange}
                            />
                            {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
                        </div>
                        <div className="form-group form-check">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                name="is_minor"
                                checked={customerFormData.is_minor}
                                onChange={handleChange}
                            />
                            <label className="form-check-label">Minor</label>
                        </div>
                        <div className="form-group form-check">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                name="is_banned"
                                checked={customerFormData.is_banned}
                                onChange={handleChange}
                            />
                            <label className="form-check-label">Banned</label>
                        </div>
                        <div className="form-group">
                            <label>Customer Notes:</label>
                            <textarea
                                className="form-control"
                                name="customer_notes"
                                value={customerFormData.customer_notes}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="d-flex justify-content-end mt-3">
                            <button type="submit"
                                    className="btn btn-primary">{customerId ? 'Update Customer' : 'Submit'}</button>
                        </div>
                    </form>

                </div>
            </div>
            <div className="d-flex mt-3">
                <button onClick={() => navigate('/customers')} className="btn btn-secondary">Return to Customer List
                </button>
            </div>
        </div>
    );
}

export default CustomerFormComponent;
