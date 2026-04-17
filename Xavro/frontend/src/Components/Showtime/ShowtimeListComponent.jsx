import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { authFetch } from '../../utils/authFetch';

const ShowtimeListComponent = () => {
    const { roomId } = useParams();
    const [showtimes, setShowtimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    useEffect(() => {
        const fetchShowtimes = async () => {
            try {
                const response = await authFetch(`${import.meta.env.VITE_API_BASE_URL}api/rooms/${roomId}/showtimes`);
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();

                data.sort((a, b) => {
                    if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
                    return a.start_time < b.start_time ? -1 : 1;
                });

                setShowtimes(data);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };
        fetchShowtimes();
    }, [roomId]);

    const handleDelete = async (showtimeId) => {
        try {
            const response = await authFetch(`${import.meta.env.VITE_API_BASE_URL}api/showtimes/${showtimeId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Network response was not ok');
            setShowtimes(showtimes.filter(showtime => showtime.id !== showtimeId));
        } catch (error) {
            console.error('Error deleting showtime:', error);
            setError('Error deleting showtime');
        }
    };

    if (loading) return <div className="text-slate-500 text-sm">Loading...</div>;
    if (error) return <div className="text-red-500 text-sm">Error: {error.message}</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-800">Showtimes — Room {roomId}</h2>
                <button
                    onClick={() => navigate(`/staff/rooms/${roomId}/showtimes/add`)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#0f172a] hover:bg-[#1e293b] text-white text-sm font-medium rounded transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add Showtime
                </button>
            </div>

            {showtimes.length === 0 ? (
                <p className="text-slate-500 text-sm">No showtimes available.</p>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[#0f172a] text-white">
                                    <th className="px-4 py-3 text-left font-medium">Day</th>
                                    <th className="px-4 py-3 text-left font-medium">Start Time</th>
                                    <th className="px-4 py-3 text-left font-medium">End Time</th>
                                    <th className="px-4 py-3 text-left font-medium">Interval (min)</th>
                                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {showtimes.map(showtime => (
                                    <tr key={showtime.id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="px-4 py-3 text-slate-800 font-medium">{daysOfWeek[showtime.day_of_week]}</td>
                                        <td className="px-4 py-3 text-slate-600">{showtime.start_time}</td>
                                        <td className="px-4 py-3 text-slate-600">{showtime.end_time}</td>
                                        <td className="px-4 py-3 text-slate-600">{showtime.interval_minutes}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <Link
                                                    to={`/staff/rooms/${roomId}/showtimes/edit/${showtime.id}`}
                                                    title="Edit Showtime"
                                                    className="inline-flex items-center justify-center p-1.5 bg-slate-500 hover:bg-slate-600 text-white rounded transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(showtime.id)}
                                                    title="Delete Showtime"
                                                    className="inline-flex items-center justify-center p-1.5 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
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
            <button onClick={() => navigate('/staff/rooms')}
                className="mt-4 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium rounded transition-colors">
                Return to Room List
            </button>
        </div>
    );
};

export default ShowtimeListComponent;
