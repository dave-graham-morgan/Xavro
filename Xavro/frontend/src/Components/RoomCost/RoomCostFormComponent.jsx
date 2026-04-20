import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authFetch } from '../../utils/authFetch';
import { useUnsavedChanges } from '../../utils/useUnsavedChanges';
import UnsavedChangesModal from '../UnsavedChangesModal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const inputClass = "w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50";
const inputErrorClass = "w-full px-3 py-2 border border-red-400 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-300";

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
    const [formErrors, setFormErrors] = useState({});
    const [isDirty, setIsDirty] = useState(false);
    const blocker = useUnsavedChanges(isDirty);

    useEffect(() => {
        if (costId) {
            const fetchCostDetails = async () => {
                try {
                    const response = await authFetch(`${import.meta.env.VITE_API_BASE_URL}api/rooms/costs/${costId}`);
                    if (!response.ok) throw new Error('Network response was not ok');
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
        setCostFormData(prev => ({ ...prev, [name]: value }));
        setIsDirty(true);
    };

    const handleDateChange = (name, value) => {
        setCostFormData(prev => ({ ...prev, [name]: value }));
        setIsDirty(true);
    };

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
                const response = await authFetch(
                    `${import.meta.env.VITE_API_BASE_URL}api/rooms${costId ? `/costs/${costId}` : `/${roomId}/costs`}`,
                    {
                        method: costId ? 'PUT' : 'POST',
                        body: JSON.stringify(dataToSend)
                    }
                );
                const data = await response.json();
                if (response.ok) {
                    setResponseMessage(data.message);
                    setErrorMessage('');
                    setIsDirty(false);
                    if (!costId) {
                        setCostFormData({ guests_count: '', total_cost: '', start_date: '', end_date: '' });
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

    const validateCostForm = () => {
        const errors = {};
        if (!costFormData.guests_count) errors.guests_count = 'Guest count is required';
        else if (!Number.isInteger(parseInt(costFormData.guests_count, 10))) errors.guests_count = 'Guest count must be an integer';
        if (!costFormData.total_cost) errors.total_cost = 'Total cost is required';
        else if (isNaN(parseFloat(costFormData.total_cost))) errors.total_cost = 'Total cost must be a number';
        return errors;
    };

    return (
        <div className="max-w-lg mx-auto">
            <UnsavedChangesModal blocker={blocker} />

            {responseMessage && <p className="text-green-600 text-sm mb-4">{responseMessage}</p>}
            {errorMessage && <p className="text-red-600 text-sm mb-4">{errorMessage}</p>}

            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-800">{costId ? 'Edit Room Cost' : 'Add Room Cost'}</h2>
                    {isDirty && (
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            Unsaved changes
                        </span>
                    )}
                </div>
                <div className="p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Guest Count</label>
                            <input type="text" name="guests_count" value={costFormData.guests_count} onChange={handleChange}
                                className={formErrors.guests_count ? inputErrorClass : inputClass} />
                            {formErrors.guests_count && <p className="text-red-500 text-xs mt-1">{formErrors.guests_count}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Total Cost ($)</label>
                            <input type="text" name="total_cost" value={costFormData.total_cost} onChange={handleChange}
                                className={formErrors.total_cost ? inputErrorClass : inputClass} />
                            {formErrors.total_cost && <p className="text-red-500 text-xs mt-1">{formErrors.total_cost}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                                <DatePicker selected={costFormData.start_date} className={inputClass} name="start_date"
                                    onChange={(date) => handleDateChange('start_date', date)}
                                    placeholderText="Select Start Date" dateFormat="MMMM dd, yyyy" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                                <DatePicker selected={costFormData.end_date} className={inputClass} name="end_date"
                                    onChange={(date) => handleDateChange('end_date', date)}
                                    placeholderText="Select End Date" dateFormat="MMMM dd, yyyy" />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button type="submit"
                                className="px-4 py-2 bg-[#0f172a] hover:bg-[#1e293b] text-white text-sm font-medium rounded transition-colors">
                                {costId ? 'Update Cost' : 'Add Cost'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <button onClick={() => navigate(`/staff/rooms/${roomId}/room-costs`)}
                className="mt-4 px-4 py-2 border border-slate-300 text-slate-600 hover:bg-slate-50 text-sm font-medium rounded transition-colors">
                Return to Room Costs
            </button>
        </div>
    );
};

export default RoomCostFormComponent;
