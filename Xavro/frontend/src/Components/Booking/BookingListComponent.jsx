import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authFetch } from '../../utils/authFetch';

const BookingListComponent = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const roomFilter = searchParams.get('room');

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                // When filtering by room (coming from a conflict warning), fetch only
                // future bookings for that room so past conflicts don't clutter the view.
                const url = roomFilter
                    ? `${import.meta.env.VITE_API_BASE_URL}api/rooms/${roomFilter}/future-bookings`
                    : `${import.meta.env.VITE_API_BASE_URL}api/bookings`;
                const response = await authFetch(url);
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setBookings(data);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };
        fetchBookings();
    }, [roomFilter]);

    const handleDelete = async (bookingId) => {
        try {
            const response = await authFetch(`${import.meta.env.VITE_API_BASE_URL}api/bookings/${bookingId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Network response was not ok');
            setBookings(bookings.filter(booking => booking.id !== bookingId));
        } catch (error) {
            console.error('Error deleting booking:', error);
            setError('Error deleting booking');
        }
    };

    if (loading) return <div className="text-slate-500 text-sm">Loading...</div>;
    if (error) return <div className="text-red-500 text-sm">Error: {error.message}</div>;

    // When roomFilter is set we fetch from future-bookings (already scoped to that room),
    // so no client-side filtering is needed. Without a filter we show everything.
    const visibleBookings = bookings;

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-800">Bookings</h2>
                <button
                    onClick={() => navigate('/staff/bookings/add')}
                    className="flex items-center gap-2 px-4 py-2 bg-[#c9a84c] hover:bg-[#b8972f] text-[#0f172a] text-sm font-semibold rounded transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add Booking
                </button>
            </div>

            {roomFilter && (
                <div className="flex items-center gap-3 mb-4 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600 shrink-0"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>
                    <span className="text-sm text-amber-800">
                        Showing bookings for room ID <strong>{roomFilter}</strong> only
                    </span>
                    <button
                        onClick={() => setSearchParams({})}
                        className="ml-auto text-xs text-amber-600 hover:text-amber-800 underline transition-colors"
                    >
                        Clear filter
                    </button>
                </div>
            )}

            {visibleBookings.length === 0 ? (
                <p className="text-slate-500 text-sm">
                    {roomFilter ? `No upcoming bookings found for room ID ${roomFilter}.` : 'No bookings available.'}
                </p>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[#0f172a] text-white">
                                    <th className="px-4 py-3 text-left font-medium">Room ID</th>
                                    <th className="px-4 py-3 text-left font-medium">Customer ID</th>
                                    <th className="px-4 py-3 text-left font-medium">Guests</th>
                                    <th className="px-4 py-3 text-left font-medium">Order ID</th>
                                    <th className="px-4 py-3 text-left font-medium">Booking Date</th>
                                    <th className="px-4 py-3 text-left font-medium">Show Date</th>
                                    <th className="px-4 py-3 text-left font-medium">Timeslot</th>
                                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleBookings.map(booking => (
                                    <tr key={booking.id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="px-4 py-3 text-slate-600">{booking.room_id}</td>
                                        <td className="px-4 py-3 text-slate-600">{booking.customer_id}</td>
                                        <td className="px-4 py-3 text-slate-600">{booking.guest_count}</td>
                                        <td className="px-4 py-3 text-slate-600">{booking.order_id}</td>
                                        <td className="px-4 py-3 text-slate-600">{booking.booking_date}</td>
                                        <td className="px-4 py-3 text-slate-600">{booking.show_date}</td>
                                        <td className="px-4 py-3 text-slate-600">{booking.show_timeslot}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <Link
                                                    to={`/staff/bookings/edit/${booking.id}`}
                                                    title="Edit Booking"
                                                    className="text-slate-400 hover:text-blue-600 transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(booking.id)}
                                                    title="Delete Booking"
                                                    className="text-slate-400 hover:text-red-600 transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingListComponent;
