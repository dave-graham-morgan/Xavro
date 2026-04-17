import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authFetch } from '../../utils/authFetch';

// Note: this form is for creating bookings for dev only and will not be available in final app

const inputClass = "w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50";

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
                    const response = await authFetch(`${import.meta.env.VITE_API_BASE_URL}api/bookings/${bookingId}`);
                    if (!response.ok) throw new Error('Network response was not ok');
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
        setBookingFormData({ ...bookingFormData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = `${import.meta.env.VITE_API_BASE_URL}api/bookings${bookingId ? `/${bookingId}` : ''}`;
        const method = bookingId ? 'PUT' : 'POST';

        try {
            const response = await authFetch(url, {
                method,
                body: JSON.stringify(bookingFormData)
            });
            const data = await response.json();
            if (response.ok) {
                setResponseMessage(data.message);
                setErrorMessage('');
                navigate('/staff/bookings');
            } else {
                setErrorMessage(data.error);
                setResponseMessage('');
            }
        } catch (error) {
            console.error('Error submitting form to server:', error);
            setErrorMessage('Error submitting form to server');
        }
    };

    return (
        <div className="max-w-lg">
            {responseMessage && <p className="text-green-600 text-sm mb-4">{responseMessage}</p>}
            {errorMessage && <p className="text-red-600 text-sm mb-4">{errorMessage}</p>}

            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800">{bookingId ? 'Edit Booking' : 'Add Booking'}</h2>
                </div>
                <div className="p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Room ID</label>
                            <input type="number" name="room_id" value={bookingFormData.room_id} onChange={handleChange} required className={inputClass} />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Customer ID</label>
                            <input type="number" name="customer_id" value={bookingFormData.customer_id} onChange={handleChange} required className={inputClass} />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Guest Count</label>
                            <input type="number" name="guest_count" value={bookingFormData.guest_count} onChange={handleChange} required className={inputClass} />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Order ID</label>
                            <input type="text" name="order_id" value={bookingFormData.order_id} onChange={handleChange} required className={inputClass} />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Booking Date</label>
                            <input type="date" name="booking_date" value={bookingFormData.booking_date} onChange={handleChange} required className={inputClass} />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Show Date</label>
                            <input type="date" name="show_date" value={bookingFormData.show_date} onChange={handleChange} required className={inputClass} />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Show Timeslot</label>
                            <input type="number" name="show_timeslot" value={bookingFormData.show_timeslot} onChange={handleChange} required className={inputClass} />
                        </div>
                        <div className="flex justify-end">
                            <button type="submit"
                                className="px-4 py-2 bg-[#0f172a] hover:bg-[#1e293b] text-white text-sm font-medium rounded transition-colors">
                                {bookingId ? 'Update Booking' : 'Add Booking'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BookingFormComponent;
