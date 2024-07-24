import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const ShowtimeComponent = () => {
    const [showtimes, setShowtimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchShowtimes = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/showtimes`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setShowtimes(data);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        fetchShowtimes();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div className="container mt-5">
            <h2>Showtimes</h2>
            <Link to="/add-showtime" className="btn btn-primary mb-3">Add Showtime</Link>
            {showtimes.length === 0 ? (
                <p>No showtimes available.</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                        <tr>
                            <th>Room ID</th>
                            <th>Booked</th>
                            <th>Bookable</th>
                            <th>Start Time</th>
                            <th>End Time</th>
                            <th>Edit</th>
                        </tr>
                        </thead>
                        <tbody>
                        {showtimes.map(showtime => (
                            <tr key={showtime.id}>
                                <td>{showtime.room_id}</td>
                                <td>{showtime.booked ? 'Yes' : 'No'}</td>
                                <td>{showtime.bookable ? 'Yes' : 'No'}</td>
                                <td>{showtime.start_time}</td>
                                <td>{showtime.end_time}</td>
                                <td><Link to={`/edit-showtime/${showtime.id}`} className="btn btn-sm btn-secondary">Edit</Link></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ShowtimeComponent;
