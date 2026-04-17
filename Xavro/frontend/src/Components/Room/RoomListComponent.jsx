import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authFetch } from '../../utils/authFetch';

const RoomListComponent = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/rooms`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                const roomsWithAssociations = await Promise.all(data.map(async room => {
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/rooms/${room.id}/associations`);
                    const associationData = await response.json();
                    return { ...room, hasAssociations: associationData.has_associations };
                }));
                setRooms(roomsWithAssociations);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        fetchRooms();
    }, []);

    const handleDelete = async (roomId) => {
        try {
            const response = await authFetch(`${import.meta.env.VITE_API_BASE_URL}api/rooms/${roomId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            setRooms(rooms.filter(room => room.id !== roomId));
        } catch (error) {
            console.error('Error deleting room:', error);
            setError('Error deleting room');
        }
    };

    if (loading) return <div className="text-slate-500 text-sm">Loading...</div>;
    if (error) return <div className="text-red-500 text-sm">Error: {error.message}</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-800">Rooms</h2>
                <button
                    onClick={() => navigate('/staff/rooms/add')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#0f172a] hover:bg-[#1e293b] text-white text-sm font-medium rounded transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add Room
                </button>
            </div>

            {rooms.length === 0 ? (
                <p className="text-slate-500 text-sm">No rooms available.</p>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[#0f172a] text-white">
                                    <th className="px-4 py-3 text-left font-medium">Title</th>
                                    <th className="px-4 py-3 text-left font-medium">Max</th>
                                    <th className="px-4 py-3 text-left font-medium">Min</th>
                                    <th className="px-4 py-3 text-left font-medium">Duration</th>
                                    <th className="px-4 py-3 text-left font-medium">Buffer</th>
                                    <th className="px-4 py-3 text-left font-medium">Launch</th>
                                    <th className="px-4 py-3 text-left font-medium">Sunset</th>
                                    <th className="px-4 py-3 text-left font-medium">Description</th>
                                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rooms.map(room => (
                                    <tr key={room.id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="px-4 py-3 text-slate-800 font-medium">{room.title}</td>
                                        <td className="px-4 py-3 text-slate-600">{room.max_capacity}</td>
                                        <td className="px-4 py-3 text-slate-600">{room.min_capacity}</td>
                                        <td className="px-4 py-3 text-slate-600">{room.duration}m</td>
                                        <td className="px-4 py-3 text-slate-600">{room.reset_buffer}m</td>
                                        <td className="px-4 py-3 text-slate-600">{room.launch_date}</td>
                                        <td className="px-4 py-3 text-slate-600">{room.sunset_date}</td>
                                        <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate">{room.description}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <Link
                                                    to={`/staff/rooms/edit/${room.id}`}
                                                    title="Edit Room"
                                                    className="inline-flex items-center justify-center p-1.5 bg-slate-500 hover:bg-slate-600 text-white rounded transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                                </Link>
                                                <Link
                                                    to={`/staff/rooms/${room.id}/room-costs`}
                                                    title="Room Costs"
                                                    className="inline-flex items-center justify-center p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                                </Link>
                                                <Link
                                                    to={`/staff/rooms/${room.id}/showtimes`}
                                                    title="Showtimes"
                                                    className="inline-flex items-center justify-center p-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                                </Link>
                                                <div title={room.hasAssociations ? 'Remove costs and/or showtimes before deleting' : 'Delete Room'}>
                                                    <button
                                                        onClick={() => handleDelete(room.id)}
                                                        disabled={room.hasAssociations}
                                                        className="inline-flex items-center justify-center p-1.5 bg-red-500 hover:bg-red-600 text-white rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                                                    </button>
                                                </div>
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

export default RoomListComponent;
