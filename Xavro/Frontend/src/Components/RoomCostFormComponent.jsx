import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './RoomCostFormComponent.css';

const RoomCostFormComponent = () => {
    const { roomId, costId } = useParams();
    const navigate = useNavigate();
    const [costFormData, setCostFormData] = useState({
        guests_count: '',
        total_cost: '',
        start_date: '',
        end_date: ''
    });

    const [responseMessage, setResponseMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (costId) {
            const fetchCostDetails = async () => {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/rooms/costs/${costId}`);
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const data = await response.json();
                    setCostFormData({
                        guests_count: data.guests_count,
                        total_cost: data.total_cost,
                        start_date: data.start_date ? new Date(data.start_date) : '',
                        end_date: data.end_date ? new Date(data.end_date) : ''
                    });
                } catch (error) {
                    console.error('Error fetching cost details:', error);
                }
            };

            fetchCostDetails();
        }
    }, [costId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCostFormData({
            ...costFormData,
            [name]: value
        });
    }

    const handleDateChange = (name, value) => {
        setCostFormData({
            ...costFormData,
            [name]: value
        });
    }

    const [formErrors, setFormErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateCostForm();
        setFormErrors(errors);

        if (Object.keys(errors).length === 0) {
            const dataToSend = {
                ...costFormData,
                start_date: costFormData.start_date ? costFormData.start_date.toISOString() : null,
                end_date: costFormData.end_date ? costFormData.end_date.toISOString() : null
            };

            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}api/rooms${costId ? `/costs/${costId}` : `/${roomId}/costs`}`,
                    {
                        method: costId ? 'PUT' : 'POST',
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
                    if (!costId) {
                        setCostFormData({
                            guests_count: '',
                            total_cost: '',
                            start_date: '',
                            end_date: ''
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

    const validateCostForm = () => {
        const errors = {};
        if (!costFormData.guests_count) {
            errors.guests_count = 'Guest count is required';
        } else if (!Number.isInteger(parseInt(costFormData.guests_count, 10))) {
            errors.guests_count = 'Guest count must be an integer';
        }

        if (!costFormData.total_cost) {
            errors.total_cost = 'Total cost is required';
        } else if (isNaN(parseFloat(costFormData.total_cost))) {
            errors.total_cost = 'Total cost must be a number';
        }

        return errors;
    }

    const handleReturnClick = () => {
        navigate(`/rooms/${roomId}/room-costs`);
    }

    return (
        <div className="room-cost-form-container container mt-5">
            {responseMessage && <p className="text-success">{responseMessage}</p>}
            {errorMessage && <p className="text-danger">{errorMessage}</p>}
            <button onClick={handleReturnClick} className="btn btn-secondary mb-3">Return to Room Costs</button>
            <div className="card">
                <div className="card-header">
                    <h2>{costId ? 'Edit Room Cost' : 'Add Room Cost'}</h2>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Guest Count:</label>
                            <input
                                type="text"
                                className={`form-control ${formErrors.guests_count ? 'is-invalid' : ''}`}
                                name="guests_count"
                                value={costFormData.guests_count}
                                onChange={handleChange}
                            />
                            {formErrors.guests_count && <div className="invalid-feedback">{formErrors.guests_count}</div>}
                        </div>
                        <div className="form-group">
                            <label>Total Cost:</label>
                            <input
                                type="text"
                                className={`form-control ${formErrors.total_cost ? 'is-invalid' : ''}`}
                                name="total_cost"
                                value={costFormData.total_cost}
                                onChange={handleChange}
                            />
                            {formErrors.total_cost && <div className="invalid-feedback">{formErrors.total_cost}</div>}
                        </div>
                        <div className="form-group">
                            <label>Start Date:</label>
                            <DatePicker
                                selected={costFormData.start_date}
                                className="form-control"
                                name="start_date"
                                onChange={(date) => handleDateChange('start_date', date)}
                                placeholderText="Select Start Date"
                                dateFormat="MMMM dd, yyyy"
                            />
                        </div>
                        <div className="form-group">
                            <label>End Date: </label>
                            <DatePicker
                                selected={costFormData.end_date}
                                className="form-control"
                                name="end_date"
                                onChange={(date) => handleDateChange('end_date', date)}
                                placeholderText="Select End Date"
                                dateFormat="MMMM dd, yyyy"
                            />
                        </div>
                        <div className="d-flex justify-content-end mt-3">
                            <button type="submit" className="btn btn-primary">{costId ? 'Update Cost' : 'Add Cost'}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default RoomCostFormComponent;
