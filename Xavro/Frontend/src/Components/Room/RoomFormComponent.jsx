import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './RoomFormComponent.css'; // Import the new CSS file

const RoomFormComponent = () => {
    const { roomId } = useParams();
    const [roomFormData, setRoomFormData] = useState({
        title: '',
        maxCapacity: '',
        minCapacity: '',
        duration: '',
        resetBuffer: '',
        launchDate: '',
        sunsetDate: '',
        description: ''
    });

    const [responseMessage, setResponseMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (roomId) {
            // Fetch room details and populate form for editing
            const fetchRoomDetails = async () => {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/rooms/${roomId}`);
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const data = await response.json();
                    setRoomFormData({
                        title: data.title,
                        maxCapacity: data.max_capacity,
                        minCapacity: data.min_capacity,
                        duration: data.duration,
                        resetBuffer: data.reset_buffer,
                        launchDate: data.launch_date ? new Date(data.launch_date) : '',
                        sunsetDate: data.sunset_date ? new Date(data.sunset_date) : '',
                        description: data.description
                    });
                } catch (error) {
                    console.error('Error fetching room details:', error);
                }
            };

            fetchRoomDetails();
        }
    }, [roomId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRoomFormData({
            ...roomFormData,
            [name]: value
        });
    }

    const handleDateChange = (name, value) => {
        setRoomFormData({
            ...roomFormData,
            [name]: value
        });
    }

    const [formErrors, setFormErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateRoomForm();
        setFormErrors(errors);

        if (Object.keys(errors).length === 0) {
            const dataToSend = {
                ...roomFormData,
                maxCapacity: parseInt(roomFormData.maxCapacity, 10),
                minCapacity: parseInt(roomFormData.minCapacity, 10),
                duration: parseInt(roomFormData.duration, 10),
                resetBuffer: parseInt(roomFormData.resetBuffer, 10),
                launchDate: roomFormData.launchDate ? roomFormData.launchDate.toISOString() : null,
                sunsetDate: roomFormData.sunsetDate ? roomFormData.sunsetDate.toISOString() : null
            }

            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}api/rooms${roomId ? `/${roomId}` : ''}`,
                    {
                        method: roomId ? 'PUT' : 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(dataToSend)
                    }
                );
                const data = await response.json();
                if (response.ok) {
                    setResponseMessage(data.message);
                    setErrorMessage('');
                    if (!roomId) {
                        setRoomFormData({
                            title: '',
                            maxCapacity: '',
                            minCapacity: '',
                            duration: '',
                            resetBuffer: '',
                            launchDate: '',
                            sunsetDate: '',
                            description: ''
                        });
                    }
                } else {
                    setErrorMessage(data.error);
                    setResponseMessage('');
                }
            } catch (error) {
                console.error('Error submitting form to server:', error);
            }
        }
    }

    const validateRoomForm = () => {
        const errors = {};
        if (!roomFormData.title) errors.title = 'Room Title is required';
        if (!roomFormData.maxCapacity) {
            errors.maxCapacity = 'Max Capacity is required';
        } else if (!Number.isInteger(parseInt(roomFormData.maxCapacity, 10))) {
            errors.maxCapacity = 'Max Capacity must be an integer';
        }

        if (!roomFormData.minCapacity) {
            errors.minCapacity = 'Min Capacity is required';
        } else if (!Number.isInteger(parseInt(roomFormData.minCapacity, 10))) {
            errors.minCapacity = 'Min Capacity must be an integer';
        }

        if (!roomFormData.duration) {
            errors.duration = 'Duration is required';
        } else if (!Number.isInteger(parseInt(roomFormData.duration, 10))) {
            errors.duration = 'Duration must be an integer';
        }
        if (!roomFormData.resetBuffer) {
            errors.resetBuffer = 'Reset Buffer is required';
        } else if (!Number.isInteger(parseInt(roomFormData.resetBuffer, 10))) {
            errors.resetBuffer = 'Reset Buffer must be an integer';
        }

        return errors;
    }

    return (
        <div className="container room-form-container mt-5">
            {responseMessage && <p className="text-success">{responseMessage}</p>}
            {errorMessage && <p className="text-danger">{errorMessage}</p>}
            <div className="card">
                <div className="card-header">
                    <h2>{roomId ? 'Edit Room' : 'Add Room'}</h2>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Room Name:</label>
                            <input
                                type="text"
                                className={`form-control ${formErrors.title ? 'is-invalid' : ''}`}
                                name="title"
                                value={roomFormData.title}
                                onChange={handleChange}
                            />
                            {formErrors.title && <div className="invalid-feedback">{formErrors.title}</div>}
                        </div>
                        <div className="form-group">
                            <label>Max Capacity:</label>
                            <input
                                type="text"
                                className={`form-control ${formErrors.maxCapacity ? 'is-invalid' : ''}`}
                                name="maxCapacity"
                                value={roomFormData.maxCapacity}
                                onChange={handleChange}
                            />
                            {formErrors.maxCapacity && <div className="invalid-feedback">{formErrors.maxCapacity}</div>}
                        </div>
                        <div className="form-group">
                            <label>Min Capacity:</label>
                            <input
                                type="text"
                                className={`form-control ${formErrors.minCapacity ? 'is-invalid' : ''}`}
                                name="minCapacity"
                                value={roomFormData.minCapacity}
                                onChange={handleChange}
                            />
                            {formErrors.minCapacity && <div className="invalid-feedback">{formErrors.minCapacity}</div>}
                        </div>
                        <div className="form-group">
                            <label>Duration:</label>
                            <input
                                type="text"
                                className={`form-control ${formErrors.duration ? 'is-invalid' : ''}`}
                                name="duration"
                                value={roomFormData.duration}
                                onChange={handleChange}
                            />
                            {formErrors.duration && <div className="invalid-feedback">{formErrors.duration}</div>}
                        </div>
                        <div className="form-group">
                            <label>Reset Buffer:</label>
                            <input
                                type="text"
                                className={`form-control ${formErrors.resetBuffer ? 'is-invalid' : ''}`}
                                name="resetBuffer"
                                value={roomFormData.resetBuffer}
                                onChange={handleChange}
                            />
                            {formErrors.resetBuffer && <div className="invalid-feedback">{formErrors.resetBuffer}</div>}
                        </div>
                        <div className="form-group">
                            <label>Launch Date:</label>
                            <DatePicker
                                selected={roomFormData.launchDate}
                                className="form-control"
                                name="launchDate"
                                onChange={(date) => handleDateChange('launchDate', date)}
                                placeholderText="Select Launch Date"
                                dateFormat="MMMM dd, yyyy"
                            />
                        </div>
                        <div className="form-group">
                            <label>Sunset Date: </label>
                            <DatePicker
                                selected={roomFormData.sunsetDate}
                                className="form-control"
                                name="sunsetDate"
                                onChange={(date) => handleDateChange('sunsetDate', date)}
                                placeholderText="Select Sunset Date"
                                dateFormat="MMMM dd, yyyy"
                            />
                        </div>
                        <div className="form-group">
                            <label>Description: </label>
                            <textarea
                                name="description"
                                className="form-control"
                                value={roomFormData.description}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="d-flex justify-content-end mt-3">
                            <button type="submit"
                                    className="btn btn-primary">{roomId ? 'Update Room' : 'Submit'}</button>
                        </div>
                    </form>

                </div>

            </div>
            <button onClick={() => navigate('/rooms')} className="btn btn-secondary mt-3">Return to Room List
            </button>
        </div>
    );
}

export default RoomFormComponent;
