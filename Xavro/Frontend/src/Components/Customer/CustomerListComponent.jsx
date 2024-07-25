import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './CustomerListComponent.css';

const CustomerListComponent = () => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/customers`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setCustomers(data);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    const handleDelete = async (customerId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/customers/${customerId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            setCustomers(customers.filter(customer => customer.id !== customerId));
        } catch (error) {
            console.error('Error deleting customer:', error);
            setError('Error deleting customer');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div className="customers-container container mt-5">
            <h2>Customers List</h2>
            <div className="d-flex justify-content-end mb-3">
                <button onClick={() => navigate('/customers/add-customer')} className="btn btn-primary mr-2">
                    <i className="fas fa-plus"></i> Add Customer
                </button>
            </div>
            {customers.length === 0 ? (
                <p>No customers available.</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                        <tr>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Email</th>
                            <th>Is Minor</th>
                            <th>Is Banned</th>
                            <th>Customer Notes</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {customers.map(customer => (
                            <tr key={customer.id}>
                                <td>{customer.first_name}</td>
                                <td>{customer.last_name}</td>
                                <td>{customer.email}</td>
                                <td>{customer.is_minor ? 'Yes' : 'No'}</td>
                                <td>{customer.is_banned ? 'Yes' : 'No'}</td>
                                <td>{customer.customer_notes}</td>
                                <td>
                                    <div className="btn-group" role="group">
                                        <Link to={`/customers/${customer.id}/edit-customer`} className="btn btn-sm btn-secondary">
                                            <i className="fas fa-edit"></i>
                                        </Link>
                                        <button onClick={() => handleDelete(customer.id)} className="btn btn-sm btn-danger">
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CustomerListComponent;
