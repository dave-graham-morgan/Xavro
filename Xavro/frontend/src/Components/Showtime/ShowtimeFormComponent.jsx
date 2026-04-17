import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authFetch } from '../../utils/authFetch';

const inputClass = "w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50";

const ShowtimeFormComponent = () => {
    const { roomId, showtimeId } = useParams();
    const navigate = useNavigate();
    const [showtimeFormData, setShowtimeFormData] = useState({
        room_id: roomId,
        day_of_week: 0,
        start_time: '',
        end_time: '',
        interval_minutes: 120
    });

    const [roomDetails, setRoomDetails] = useState({
        duration: '',
        reset_buffer: ''
    });

    const [responseMessage, setResponseMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (showtimeId) {
            const fetchShowtimeDetails = async () => {
                try {
                    const response = await authFetch(`${import.meta.env.VITE_API_BASE_URL}api/showtimes/${showtimeId}`);
                    if (!response.ok) throw new Error('Network response was not ok');
                    const data = await response.json();
                    setShowtimeFormData({
                        room_id: data.room_id,
                        day_of_week: data.day_of_week,
                        start_time: data.start_time,
                        end_time: data.end_time,
                        interval_minutes: data.interval_minutes
                    });
                } catch (error) {
                    console.error('Error fetching showtime details:', error);
                }
            };
            fetchShowtimeDetails();
        }

        const fetchRoomDetails = async () => {
            try {
                const response = await authFetch(`${import.meta.env.VITE_API_BASE_URL}api/rooms/${roomId}`);
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setRoomDetails({ duration: data.duration, reset_buffer: data.reset_buffer });
            } catch (error) {
                console.error('Error fetching room details:', error);
            }
        };
        fetchRoomDetails();
    }, [roomId, showtimeId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setShowtimeFormData({ ...showtimeFormData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = `${import.meta.env.VITE_API_BASE_URL}api/rooms/${roomId}/showtimes${showtimeId ? `/${showtimeId}` : ''}`;
        const method = showtimeId ? 'PUT' : 'POST';

        try {
            const response = await authFetch(url, {
                method,
                body: JSON.stringify(showtimeFormData)
            });
            const data = await response.json();
            if (response.ok) {
                setResponseMessage(data.message);
                setErrorMessage('');
                navigate(`/staff/rooms/${roomId}/showtimes`);
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
                    <h2 className="text-lg font-semibold text-slate-800">{showtimeId ? 'Edit Showtime' : 'Add Showtime'}</h2>
                </div>
                <div className="p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Day of the Week</label>
                            <select
                                name="day_of_week"
                                value={showtimeFormData.day_of_week}
                                onChange={handleChange}
                                required
                                className={inputClass}
                            >
                                <option value={0}>Monday</option>
                                <option value={1}>Tuesday</option>
                                <option value={2}>Wednesday</option>
                                <option value={3}>Thursday</option>
                                <option value={4}>Friday</option>
                                <option value={5}>Saturday</option>
                                <option value={6}>Sunday</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                                <input
                                    type="time"
                                    name="start_time"
                                    value={showtimeFormData.start_time}
                                    onChange={handleChange}
                                    required
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                                <input
                                    type="time"
                                    name="end_time"
                                    value={showtimeFormData.end_time}
                                    onChange={handleChange}
                                    required
                                    className={inputClass}
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Interval Between Slots (minutes)</label>
                            <input
                                type="number"
                                name="interval_minutes"
                                value={showtimeFormData.interval_minutes}
                                onChange={handleChange}
                                min="1"
                                required
                                className={inputClass}
                            />
                        </div>
                        <div className="mb-4 p-3 bg-slate-50 rounded-md border border-slate-200">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Room Info</p>
                            <div className="flex gap-6">
                                <span className="text-sm text-slate-600">Duration: <strong>{roomDetails.duration} min</strong></span>
                                <span className="text-sm text-slate-600">Reset Buffer: <strong>{roomDetails.reset_buffer} min</strong></span>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button type="submit"
                                className="px-4 py-2 bg-[#0f172a] hover:bg-[#1e293b] text-white text-sm font-medium rounded transition-colors">
                                {showtimeId ? 'Update Showtime' : 'Add Showtime'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <button onClick={() => navigate(`/staff/rooms/${roomId}/showtimes`)}
                className="mt-4 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium rounded transition-colors">
                Return to Showtimes
            </button>
        </div>
    );
};

export default ShowtimeFormComponent;
