import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { authFetch } from '../../utils/authFetch';
import { useUnsavedChanges } from '../../utils/useUnsavedChanges';
import UnsavedChangesModal from '../UnsavedChangesModal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import RoomScheduleEditor from './RoomScheduleEditor';
import RoomImageEditor from './RoomImageEditor';

const inputClass = "w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50";
const inputErrorClass = "w-full px-3 py-2 border border-red-400 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-300";

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
        description: '',
        difficulty: '',
        physicalRating: '',
        scareFactor: '',
    });

    const [responseMessage, setResponseMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [msgFading, setMsgFading] = useState(false);
    const [originalTiming, setOriginalTiming] = useState(null);
    const [bookingWarning, setBookingWarning] = useState(null);
    const [isDirty, setIsDirty] = useState(false);
    const blocker = useUnsavedChanges(isDirty);

    useEffect(() => {
        const msg = responseMessage || errorMessage;
        if (!msg) { setMsgFading(false); return; }
        const fadeId  = setTimeout(() => setMsgFading(true),  2500);
        const clearId = setTimeout(() => {
            setResponseMessage('');
            setErrorMessage('');
            setMsgFading(false);
        }, 3000);
        return () => { clearTimeout(fadeId); clearTimeout(clearId); };
    }, [responseMessage, errorMessage]);

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
                        description: data.description,
                        difficulty: data.difficulty ?? '',
                        physicalRating: data.physical_rating ?? '',
                        scareFactor: data.scare_factor ?? '',
                    });
                    setOriginalTiming({ duration: String(data.duration), resetBuffer: String(data.reset_buffer) });
                } catch (error) {
                    console.error('Error fetching room details:', error);
                }
            };
            fetchRoomDetails();
        }
    }, [roomId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRoomFormData(prev => ({ ...prev, [name]: value }));
        setIsDirty(true);
    };

    const handleDateChange = (name, value) => {
        setRoomFormData(prev => ({ ...prev, [name]: value }));
        setIsDirty(true);
    };

    const doSave = async (dataToSend) => {
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
                setBookingWarning(null);
                setIsDirty(false);
                if (!roomId && data.id) {
                    navigate(`/staff/rooms/edit/${data.id}`);
                }
            } else {
                setErrorMessage(data.error);
                setResponseMessage('');
            }
        } catch (error) {
            console.error('Error submitting form to server:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateRoomForm();
        setFormErrors(errors);
        if (Object.keys(errors).length > 0) return;

        const dataToSend = {
            ...roomFormData,
            maxCapacity: parseInt(roomFormData.maxCapacity, 10),
            minCapacity: parseInt(roomFormData.minCapacity, 10),
            duration: parseInt(roomFormData.duration, 10),
            resetBuffer: parseInt(roomFormData.resetBuffer, 10),
            launchDate: roomFormData.launchDate ? roomFormData.launchDate.toISOString() : null,
            sunsetDate: roomFormData.sunsetDate ? roomFormData.sunsetDate.toISOString() : null
        };

        // Only check for booking conflicts when editing and timing fields changed
        if (roomId && originalTiming) {
            const timingChanged =
                String(roomFormData.duration)    !== originalTiming.duration ||
                String(roomFormData.resetBuffer) !== originalTiming.resetBuffer;

            if (timingChanged) {
                try {
                    const res      = await authFetch(`${import.meta.env.VITE_API_BASE_URL}api/rooms/${roomId}/future-bookings`);
                    const bookings = await res.json();
                    if (bookings.length > 0) {
                        setBookingWarning({ count: bookings.length, pendingData: dataToSend });
                        return;
                    }
                } catch {
                    // If check fails, proceed anyway
                }
            }
        }

        await doSave(dataToSend);
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
        <div className="max-w-2xl mx-auto">
            <UnsavedChangesModal blocker={blocker} />

            <Link to="/staff/rooms" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                Rooms
            </Link>

            {responseMessage && <p className={`text-green-600 text-sm mb-4 transition-opacity duration-500 ${msgFading ? 'opacity-0' : 'opacity-100'}`}>{responseMessage}</p>}
            {errorMessage && <p className={`text-red-600 text-sm mb-4 transition-opacity duration-500 ${msgFading ? 'opacity-0' : 'opacity-100'}`}>{errorMessage}</p>}

            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-800">{roomId ? 'Edit Room' : 'Add Room'}</h2>
                    {isDirty && (
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            Unsaved changes
                        </span>
                    )}
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
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty <span className="font-normal text-slate-400">(1–5)</span></label>
                                <input type="number" name="difficulty" min="1" max="5" value={roomFormData.difficulty} onChange={handleChange} placeholder="—" className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Physical <span className="font-normal text-slate-400">(1–5)</span></label>
                                <input type="number" name="physicalRating" min="1" max="5" value={roomFormData.physicalRating} onChange={handleChange} placeholder="—" className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Scare Factor <span className="font-normal text-slate-400">(1–5)</span></label>
                                <input type="number" name="scareFactor" min="1" max="5" value={roomFormData.scareFactor} onChange={handleChange} placeholder="—" className={inputClass} />
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
                        {bookingWarning && (
                            <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-300 rounded-lg">
                                <p className="text-sm font-semibold text-amber-800 mb-1">
                                    ⚠ This room has {bookingWarning.count} upcoming booking{bookingWarning.count !== 1 ? 's' : ''}
                                </p>
                                <p className="text-xs text-amber-700 mb-3">
                                    Changing the duration or reset buffer may cause existing bookings to overlap with new slots. Review those bookings before proceeding.
                                </p>
                                <Link
                                    to={`/staff/bookings?room=${roomId}`}
                                    className="inline-block text-xs text-amber-700 underline hover:text-amber-900 mb-3 transition-colors"
                                >
                                    View affected bookings →
                                </Link>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => doSave(bookingWarning.pendingData)}
                                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded transition-colors">
                                        Save Anyway
                                    </button>
                                    <button type="button" onClick={() => setBookingWarning(null)}
                                        className="px-3 py-1.5 border border-amber-300 text-amber-700 hover:bg-amber-100 text-xs font-semibold rounded transition-colors">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="flex justify-end">
                            <button type="submit"
                                className="px-4 py-2 bg-[#0f172a] hover:bg-[#1e293b] text-white text-sm font-medium rounded transition-colors">
                                {roomId ? 'Update Room' : 'Add Room'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {roomId && (
                <RoomScheduleEditor
                    roomId={roomId}
                    duration={roomFormData.duration}
                    resetBuffer={roomFormData.resetBuffer}
                />
            )}

            {roomId && <RoomImageEditor roomId={roomId} />}

        </div>
    );
};

export default RoomFormComponent;
