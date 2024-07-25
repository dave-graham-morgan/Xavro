import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

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
                const roomResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/rooms/${roomId}`);
                const costsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/rooms/${roomId}/costs`);
                if (!roomResponse.ok || !costsResponse.ok) {
                    throw new Error('Network response was not ok');
                }
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
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/room-costs/${costId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            setRoomCosts(roomCosts.filter(cost => cost.id !== costId));
        } catch (error) {
            console.error('Error deleting room cost:', error);
            setError('Error deleting room cost');
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div className="container mt-5">
            <h2>Room Costs for {roomTitle}</h2>
            <p><strong>Minimum Guests:</strong> {minGuests}</p>
            <p><strong>Maximum Guests:</strong> {maxGuests}</p>
            <div className="d-flex justify-content-end mb-3">
                <button onClick={() => navigate(`/rooms/${roomId}/add-cost`)} className="btn btn-primary mr-2">
                    <i className="fas fa-plus"></i> Add Cost
                </button>
            </div>
            {roomCosts.length === 0 ? (
                <p>No costs available for this room.</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                        <tr>
                            <th>Guest Count</th>
                            <th>Total Cost</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Edit</th>
                        </tr>
                        </thead>
                        <tbody>
                        {roomCosts.map(cost => (
                            <tr key={cost.id}>
                                <td>{cost.guests_count}</td>
                                <td>{cost.total_cost}</td>
                                <td>{cost.start_date}</td>
                                <td>{cost.end_date}</td>
                                <td>
                                    <Link to={`/rooms/${roomId}/edit-cost/${cost.id}`}
                                          className="btn btn-sm btn-secondary mr-2">
                                        <i className="fas fa-edit"></i>
                                    </Link>
                                    <button onClick={() => handleDelete(cost.id)} className="btn btn-sm btn-danger">
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

export default RoomCostListComponent;
