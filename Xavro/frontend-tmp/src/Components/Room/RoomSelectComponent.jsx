import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './RoomSelectComponent.css'; // Custom styles

const RoomSelectComponent = ({ selectedRoomId, onRoomChange }) => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const handleChange = (e) => {
        onRoomChange(e.target.value);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div className="form-group room-select-container">
            <label htmlFor="roomSelect">Select Room:</label>
            <select
                id="roomSelect"
                className="form-control"
                value={selectedRoomId}
                onChange={handleChange}
            >
                <option value="" className="default-option" disabled>-- Select a Room --</option>
                {rooms.map(room => (
                    <option key={room.id} value={room.id}>
                        {room.title}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default RoomSelectComponent;
