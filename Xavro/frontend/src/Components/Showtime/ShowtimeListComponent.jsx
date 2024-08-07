import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

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
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/rooms/${roomId}/showtimes`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();

                // Sort showtimes by day_of_week and timeslot
                data.sort((a, b) => {
                    if (a.day_of_week !== b.day_of_week) {
                        return a.day_of_week - b.day_of_week;
                    }
                    return a.timeslot - b.timeslot;
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
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/showtimes/${showtimeId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            setShowtimes(showtimes.filter(showtime => showtime.id !== showtimeId));
        } catch (error) {
            console.error('Error deleting showtime:', error);
            setError('Error deleting showtime');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div className="showtime-list-container container mt-5">
            <h2>Showtimes for Room {roomId}</h2>
            <div className="d-flex justify-content-end mb-3">
                <button onClick={() => navigate(`/rooms/${roomId}/add-showtime`)} className="btn btn-primary mr-2">
                    <i className="fas fa-plus"></i> Add Showtime
                </button>
            </div>

            {showtimes.length === 0 ? (
                <p>No showtimes available.</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                        <tr>
                            <th>Start Time</th>
                            <th>End Time</th>
                            <th>Day of the Week</th>
                            <th>Timeslot</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {showtimes.map(showtime => (
                            <tr key={showtime.id}>
                                <td>{showtime.start_time}</td>
                                <td>{showtime.end_time}</td>
                                <td>{daysOfWeek[showtime.day_of_week]}</td>
                                <td>{showtime.timeslot}</td>
                                <td>
                                    <Link to={`/rooms/${roomId}/edit-showtime/${showtime.id}`} className="btn btn-sm btn-secondary" title="Edit Showtime">
                                        <i className="fas fa-edit"></i>
                                    </Link>
                                    <button onClick={() => handleDelete(showtime.id)} className="btn btn-sm btn-danger" title="Delete Showtime">
                                        <i className="fas fa-trash-alt"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
            <button onClick={() => navigate('/rooms')} className="btn btn-secondary mt-3">Return to Room List</button>
        </div>
    );
};

export default ShowtimeListComponent;
