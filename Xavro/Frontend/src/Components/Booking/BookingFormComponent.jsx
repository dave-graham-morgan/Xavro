import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './BookingFormComponent.css'

// Note: this form is for creating bookings for dev only and will not be available in final app

const BookingFormComponent = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [bookingFormData, setBookingFormData] = useState({
        room_id: '',
        customer_id: '',
        guest_count: '',
        order_id: '',
        booking_date: '',
        show_date: '',
        show_timeslot: ''
    });

    const [responseMessage, setResponseMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (bookingId) {
            const fetchBookingDetails = async () => {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/bookings/${bookingId}`, {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const data = await response.json();
                    setBookingFormData({
                        room_id: data.room_id,
                        customer_id: data.customer_id,
                        guest_count: data.guest_count,
                        order_id: data.order_id,
                        booking_date: data.booking_date,
                        show_date: data.show_date,
                        show_timeslot: data.show_timeslot
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
                            <label>Room ID:</label>
                            <input
                                type="number"
                                className="form-control"
                                name="room_id"
                                value={bookingFormData.room_id}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Customer ID:</label>
                            <input
                                type="number"
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
                            <label>Booking Date:</label>
                            <input
                                type="date"
                                className="form-control"
                                name="booking_date"
                                value={bookingFormData.booking_date}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Show Date:</label>
                            <input
                                type="date"
                                className="form-control"
                                name="show_date"
                                value={bookingFormData.show_date}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Show Timeslot:</label>
                            <input
                                type="number"
                                className="form-control"
                                name="show_timeslot"
                                value={bookingFormData.show_timeslot}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="d-flex justify-content-end mt-3">
                            <button type="submit"
                                    className="btn btn-primary">{bookingId ? 'Update Booking' : 'Add Booking'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default BookingFormComponent;
