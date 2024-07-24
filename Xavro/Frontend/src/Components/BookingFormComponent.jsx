import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const BookingFormComponent = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [bookingFormData, setBookingFormData] = useState({
        showtime_id: '',
        customer_id: '',
        guest_count: '',
        status: 'Not Booked',
        order_id: '',
        date: ''
    });

    const [responseMessage, setResponseMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (bookingId) {
            const fetchBookingDetails = async () => {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/bookings/${bookingId}`);
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const data = await response.json();
                    setBookingFormData({
                        showtime_id: data.showtime_id,
                        customer_id: data.customer_id,
                        guest_count: data.guest_count,
                        status: data.status,
                        order_id: data.order_id,
                        date: data.date
                    });
                } catch (error) {
                    console.error('Error fetching booking details:', error);
                }
            };

            fetchBookingDetails();
        }
    }, [bookingId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBookingFormData({
            ...bookingFormData,
            [name]: value
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = `${import.meta.env.VITE_API_BASE_URL}api/bookings${bookingId ? `/${bookingId}` : ''}`;
        const method = bookingId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookingFormData)
            });
            const data = await response.json();
            if (response.ok) {
                setResponseMessage(data.message);
                setErrorMessage('');
                navigate('/bookings');
            } else {
                setErrorMessage(data.error);
                setResponseMessage('');
            }
        } catch (error) {
            console.error('Error submitting form to server:', error);
            setErrorMessage('Error submitting form to server');
        }
    }

    return (
        <div className="booking-form-container container mt-5">
            {responseMessage && <p className="text-success">{responseMessage}</p>}
            {errorMessage && <p className="text-danger">{errorMessage}</p>}
            <div className="card">
                <div className="card-header">
                    <h2>{bookingId ? 'Edit Booking' : 'Add Booking'}</h2>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Showtime ID:</label>
                            <input
                                type="text"
                                className="form-control"
                                name="showtime_id"
                                value={bookingFormData.showtime_id}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Customer ID:</label>
                            <input
                                type="text"
                                className="form-control"
                                name="customer_id"
                                value={bookingFormData.customer_id}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Guest Count:</label>
                            <input
                                type="number"
                                className="form-control"
                                name="guest_count"
                                value={bookingFormData.guest_count}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Status:</label>
                            <select
                                className="form-control"
                                name="status"
                                value={bookingFormData.status}
                                onChange={handleChange}
                                required
                            >
                                <option value="Not Booked">Not Booked</option>
                                <option value="Booked">Booked</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Order ID:</label>
                            <input
                                type="text"
                                className="form-control"
                                name="order_id"
                                value={bookingFormData.order_id}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Date:</label>
                            <input
                                type="date"
                                className="form-control"
                                name="date"
                                value={bookingFormData.date}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="d-flex justify-content-end mt-3">
                            <button type="submit" className="btn btn-primary">{bookingId ? 'Update Booking' : 'Add Booking'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default BookingFormComponent;
