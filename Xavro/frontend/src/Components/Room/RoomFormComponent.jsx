import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authFetch } from '../../utils/authFetch';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const inputClass = "w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50";
const inputErrorClass = "w-full px-3 py-2 border border-red-400 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-300";

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
    const [formErrors, setFormErrors] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        if (roomId) {
            const fetchRoomDetails = async () => {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/rooms/${roomId}`);
                    if (!response.ok) throw new Error('Network response was not ok');
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
        setRoomFormData({ ...roomFormData, [name]: value });
    };

    const handleDateChange = (name, value) => {
        setRoomFormData({ ...roomFormData, [name]: value });
    };

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
            };

            try {
                const response = await authFetch(
                    `${import.meta.env.VITE_API_BASE_URL}api/rooms${roomId ? `/${roomId}` : ''}`,
                    {
                        method: roomId ? 'PUT' : 'POST',
                        body: JSON.stringify(dataToSend)
                    }
                );
                const data = await response.json();
                if (response.ok) {
                    setResponseMessage(data.message);
                    setErrorMessage('');
                    if (!roomId) {
                        setRoomFormData({ title: '', maxCapacity: '', minCapacity: '', duration: '', resetBuffer: '', launchDate: '', sunsetDate: '', description: '' });
                    }
                } else {
                    setErrorMessage(data.error);
                    setResponseMessage('');
                }
            } catch (error) {
                console.error('Error submitting form to server:', error);
            }
        }
    };

    const validateRoomForm = () => {
        const errors = {};
        if (!roomFormData.title) errors.title = 'Room Title is required';
        if (!roomFormData.maxCapacity) errors.maxCapacity = 'Max Capacity is required';
        else if (!Number.isInteger(parseInt(roomFormData.maxCapacity, 10))) errors.maxCapacity = 'Max Capacity must be an integer';
        if (!roomFormData.minCapacity) errors.minCapacity = 'Min Capacity is required';
        else if (!Number.isInteger(parseInt(roomFormData.minCapacity, 10))) errors.minCapacity = 'Min Capacity must be an integer';
        if (!roomFormData.duration) errors.duration = 'Duration is required';
        else if (!Number.isInteger(parseInt(roomFormData.duration, 10))) errors.duration = 'Duration must be an integer';
        if (!roomFormData.resetBuffer) errors.resetBuffer = 'Reset Buffer is required';
        else if (!Number.isInteger(parseInt(roomFormData.resetBuffer, 10))) errors.resetBuffer = 'Reset Buffer must be an integer';
        return errors;
    };

    return (
        <div className="max-w-2xl">
            {responseMessage && <p className="text-green-600 text-sm mb-4">{responseMessage}</p>}
            {errorMessage && <p className="text-red-600 text-sm mb-4">{errorMessage}</p>}

            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800">{roomId ? 'Edit Room' : 'Add Room'}</h2>
                </div>
                <div className="p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Room Name</label>
                            <input type="text" name="title" value={roomFormData.title} onChange={handleChange}
                                className={formErrors.title ? inputErrorClass : inputClass} />
                            {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Max Capacity</label>
                                <input type="text" name="maxCapacity" value={roomFormData.maxCapacity} onChange={handleChange}
                                    className={formErrors.maxCapacity ? inputErrorClass : inputClass} />
                                {formErrors.maxCapacity && <p className="text-red-500 text-xs mt-1">{formErrors.maxCapacity}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Min Capacity</label>
                                <input type="text" name="minCapacity" value={roomFormData.minCapacity} onChange={handleChange}
                                    className={formErrors.minCapacity ? inputErrorClass : inputClass} />
                                {formErrors.minCapacity && <p className="text-red-500 text-xs mt-1">{formErrors.minCapacity}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Duration (min)</label>
                                <input type="text" name="duration" value={roomFormData.duration} onChange={handleChange}
                                    className={formErrors.duration ? inputErrorClass : inputClass} />
                                {formErrors.duration && <p className="text-red-500 text-xs mt-1">{formErrors.duration}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Reset Buffer (min)</label>
                                <input type="text" name="resetBuffer" value={roomFormData.resetBuffer} onChange={handleChange}
                                    className={formErrors.resetBuffer ? inputErrorClass : inputClass} />
                                {formErrors.resetBuffer && <p className="text-red-500 text-xs mt-1">{formErrors.resetBuffer}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Launch Date</label>
                                <DatePicker
                                    selected={roomFormData.launchDate}
                                    className={inputClass}
                                    name="launchDate"
                                    onChange={(date) => handleDateChange('launchDate', date)}
                                    placeholderText="Select Launch Date"
                                    dateFormat="MMMM dd, yyyy"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Sunset Date</label>
                                <DatePicker
                                    selected={roomFormData.sunsetDate}
                                    className={inputClass}
                                    name="sunsetDate"
                                    onChange={(date) => handleDateChange('sunsetDate', date)}
                                    placeholderText="Select Sunset Date"
                                    dateFormat="MMMM dd, yyyy"
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                rows={3}
                                className={inputClass}
                                value={roomFormData.description}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="flex justify-end">
                            <button type="submit"
                                className="px-4 py-2 bg-[#0f172a] hover:bg-[#1e293b] text-white text-sm font-medium rounded transition-colors">
                                {roomId ? 'Update Room' : 'Add Room'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <button onClick={() => navigate('/staff/rooms')}
                className="mt-4 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium rounded transition-colors">
                Return to Room List
            </button>
        </div>
    );
};

export default RoomFormComponent;
