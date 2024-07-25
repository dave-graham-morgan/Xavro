import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const BookingComponent = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/bookings`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setBookings(data);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div className="container mt-5">
            <h2>Bookings</h2>
            <Link to="/add-booking" className="btn btn-primary mb-3">Add Booking</Link>
            {bookings.length === 0 ? (
                <p>No bookings available.</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                        <tr>
                            <th>Showtime ID</th>
                            <th>Customer ID</th>
                            <th>Guest Count</th>
                            <th>Status</th>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Edit</th>
                        </tr>
                        </thead>
                        <tbody>
                        {bookings.map(booking => (
                            <tr key={booking.id}>
                                <td>{booking.showtime_id}</td>
                                <td>{booking.customer_id}</td>
                                <td>{booking.guest_count}</td>
                                <td>{booking.status}</td>
                                <td>{booking.order_id}</td>
                                <td>{booking.date}</td>
                                <td><Link to={`/edit-booking/${booking.id}`} className="btn btn-sm btn-secondary">Edit</Link></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default BookingComponent;
