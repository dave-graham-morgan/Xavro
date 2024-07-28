import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ShowtimeFormComponent.css';

const ShowtimeFormComponent = () => {
    const { roomId, showtimeId } = useParams();
    const navigate = useNavigate();
    const [showtimeFormData, setShowtimeFormData] = useState({
        room_id: roomId,
        day_of_week: 0, // Default to Monday
        timeslot: 1,
        start_time: '',
        end_time: ''
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
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/showtimes/${showtimeId}`);
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const data = await response.json();
                    setShowtimeFormData({
                        room_id: data.room_id,
                        day_of_week: data.day_of_week,
                        timeslot: data.timeslot,
                        start_time: data.start_time,
                        end_time: data.end_time
                    });
                } catch (error) {
                    console.error('Error fetching showtime details:', error);
                }
            };

            fetchShowtimeDetails();
        }

        const fetchRoomDetails = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/rooms/${roomId}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setRoomDetails({
                    duration: data.duration,
                    reset_buffer: data.reset_buffer
                });
            } catch (error) {
                console.error('Error fetching room details:', error);
            }
        };

        fetchRoomDetails();
    }, [roomId, showtimeId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setShowtimeFormData({
            ...showtimeFormData,
            [name]: type === 'checkbox' ? checked : value
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = `${import.meta.env.VITE_API_BASE_URL}api/rooms/${roomId}/showtimes${showtimeId ? `/${showtimeId}` : ''}`;
        const method = showtimeId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(showtimeFormData)
            });
            const data = await response.json();
            if (response.ok) {
                setResponseMessage(data.message);
                setErrorMessage('');
                navigate(`/rooms/${roomId}/showtimes`);
            } else {
                setErrorMessage(data.error);
                setResponseMessage('');
            }
        } catch (error) {
            console.error('Error submitting form to server:', error);
            setErrorMessage('Error submitting form to server');
        }
    }

    return (
        <div className="showtime-form-container container mt-5">
            {responseMessage && <p className="text-success">{responseMessage}</p>}
            {errorMessage && <p className="text-danger">{errorMessage}</p>}
            <div className="card">
                <div className="card-header">
                    <h2>{showtimeId ? 'Edit Showtime' : 'Add Showtime'}</h2>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Day of the Week:</label>
                            <select
                                className="form-control"
                                name="day_of_week"
                                value={showtimeFormData.day_of_week}
                                onChange={handleChange}
                                required
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
                        <div className="form-group">
                            <label>Timeslot:</label>
                            <input
                                type="number"
                                className="form-control"
                                name="timeslot"
                                value={showtimeFormData.timeslot}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Start Time:</label>
                            <input
                                type="time"
                                className="form-control"
                                name="start_time"
                                value={showtimeFormData.start_time}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>End Time:</label>
                            <input
                                type="time"
                                className="form-control"
                                name="end_time"
                                value={showtimeFormData.end_time}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Duration:</label>
                            <p className="form-control-plaintext">{roomDetails.duration} minutes</p>
                        </div>
                        <div className="form-group">
                            <label>Reset Buffer:</label>
                            <p className="form-control-plaintext">{roomDetails.reset_buffer} minutes</p>
                        </div>
                        <div className="d-flex justify-content-end mt-3">
                            <button type="submit" className="btn btn-primary">{showtimeId ? 'Update Showtime' : 'Add Showtime'}</button>
                        </div>
                    </form>
                </div>
            </div>
            <div className="d-flex">
                <button onClick={() => navigate(`/rooms/${roomId}/showtimes`)} className="btn btn-secondary mb-3">Return to Showtimes</button>
            </div>
        </div>
    );
}

export default ShowtimeFormComponent;
