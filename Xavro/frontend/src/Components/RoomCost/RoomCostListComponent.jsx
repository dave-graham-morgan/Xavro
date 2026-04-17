import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { authFetch } from '../../utils/authFetch';

const RoomCostListComponent = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [roomCosts, setRoomCosts] = useState([]);
    const [roomTitle, setRoomTitle] = useState('');
    const [minGuests, setMinGuests] = useState(0);
    const [maxGuests, setMaxGuests] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRoomDetails = async () => {
            try {
                const roomResponse = await authFetch(`${import.meta.env.VITE_API_BASE_URL}api/rooms/${roomId}`);
                const costsResponse = await authFetch(`${import.meta.env.VITE_API_BASE_URL}api/rooms/${roomId}/costs`);
                if (!roomResponse.ok || !costsResponse.ok) throw new Error('Network response was not ok');
                const roomData = await roomResponse.json();
                const costsData = await costsResponse.json();
                setRoomTitle(roomData.title);
                setMinGuests(roomData.min_capacity);
                setMaxGuests(roomData.max_capacity);
                setRoomCosts(costsData);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };
        fetchRoomDetails();
    }, [roomId]);

    const handleDelete = async (costId) => {
        try {
            const response = await authFetch(`${import.meta.env.VITE_API_BASE_URL}api/rooms/room-costs/${costId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Network response was not ok');
            setRoomCosts(roomCosts.filter(cost => cost.id !== costId));
        } catch (error) {
            console.error('Error deleting room cost:', error);
            setError('Error deleting room cost');
        }
    };

    if (loading) return <div className="text-slate-500 text-sm">Loading...</div>;
    if (error) return <div className="text-red-500 text-sm">Error: {error.message}</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-slate-800">Room Costs — {roomTitle}</h2>
                <button
                    onClick={() => navigate(`/staff/rooms/${roomId}/costs/add`)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#0f172a] hover:bg-[#1e293b] text-white text-sm font-medium rounded transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    Add Cost
                </button>
            </div>
            <p className="text-sm text-slate-500 mb-6">Capacity: {minGuests}–{maxGuests} guests</p>

            {roomCosts.length === 0 ? (
                <p className="text-slate-500 text-sm">No costs available for this room.</p>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-[#0f172a] text-white">
                                    <th className="px-4 py-3 text-left font-medium">Guest Count</th>
                                    <th className="px-4 py-3 text-left font-medium">Total Cost</th>
                                    <th className="px-4 py-3 text-left font-medium">Start Date</th>
                                    <th className="px-4 py-3 text-left font-medium">End Date</th>
                                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {roomCosts.map(cost => (
                                    <tr key={cost.id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="px-4 py-3 text-slate-600">{cost.guests_count}</td>
                                        <td className="px-4 py-3 text-slate-800 font-medium">${cost.total_cost}</td>
                                        <td className="px-4 py-3 text-slate-600">{cost.start_date}</td>
                                        <td className="px-4 py-3 text-slate-600">{cost.end_date}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <Link
                                                    to={`/staff/rooms/${roomId}/costs/edit/${cost.id}`}
                                                    title="Edit Cost"
                                                    className="inline-flex items-center justify-center p-1.5 bg-slate-500 hover:bg-slate-600 text-white rounded transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(cost.id)}
                                                    title="Delete Cost"
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

export default RoomCostListComponent;
