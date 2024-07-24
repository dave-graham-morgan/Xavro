import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './RoomsListComponent.css';

const RoomsListComponent = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate()

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/rooms`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setRooms(data);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        fetchRooms();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div className="rooms-container container mt-5">
            <h2>Rooms List</h2>
            <div className="d-flex justify-content-end mb-3">
                <button onClick={() => navigate('/add-room')} className="btn btn-primary mr-2">
                    <i className="fas fa-plus"></i> Add Room
                </button>
            </div>
            {rooms.length === 0 ? (
                <p>No rooms available.</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                        <tr>
                            <th>Title</th>
                            <th>Max Capacity</th>
                            <th>Min Capacity</th>
                            <th>Duration</th>
                            <th>Reset Buffer</th>
                            <th>Launch Date</th>
                            <th>Sunset Date</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rooms.map(room => (
                            <tr key={room.id}>
                                <td>{room.title}</td>
                                <td>{room.max_capacity}</td>
                                <td>{room.min_capacity}</td>
                                <td>{room.duration} minutes</td>
                                <td>{room.reset_buffer} minutes</td>
                                <td>{room.launch_date}</td>
                                <td>{room.sunset_date}</td>
                                <td>{room.description}</td>

                                <td>
                                    <div className="btn-group" role="group">
                                        <Link to={`/rooms/edit-room/${room.id}`} className="btn btn-sm btn-secondary">
                                            <i className="fas fa-edit"></i>
                                        </Link>
                                        <Link to={`/rooms/${room.id}/room-costs`} className="btn btn-sm btn-success">
                                            <i className="fas fa-dollar-sign"></i>
                                        </Link>
                                        <Link to={`/rooms/${room.id}/showtimes`} className="btn btn-sm btn-warning">
                                            <i className="fas fa-clock"></i> 
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default RoomsListComponent;
