import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './BookingListComponent.css'

const BookingListComponent = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

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

    const handleDelete = async (bookingId) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/bookings/${bookingId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            setBookings(bookings.filter(booking => booking.id !== bookingId));
        } catch (error) {
            console.error('Error deleting booking:', error);
            setError('Error deleting booking');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div className="container booking-container mt-5">
            <h2>Bookings</h2>
            <div className="d-flex justify-content-end mb-3">
                <button onClick={() => navigate('/bookings/add-booking')} className="btn btn-primary mr-2">
                    <i className="fas fa-plus"></i> Add Booking
                </button>
            </div>
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
                            <th>Order ID</th>
                            <th>Booking Date</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {bookings.map(booking => (
                            <tr key={booking.id}>
                                <td>{booking.showtime_id}</td>
                                <td>{booking.customer_id}</td>
                                <td>{booking.guest_count}</td>
                                <td>{booking.order_id}</td>
                                <td>{booking.booking_date}</td>
                                <td>
                                    <Link to={`/bookings/edit-booking/${booking.id}`} className="btn btn-sm btn-secondary">
                                        <i className="fas fa-edit"></i>
                                    </Link>
                                    <button onClick={() => handleDelete(booking.id)} className="btn btn-sm btn-danger">
                                        <i className="fas fa-trash-alt"></i>
                                    </button>
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

export default BookingListComponent;
