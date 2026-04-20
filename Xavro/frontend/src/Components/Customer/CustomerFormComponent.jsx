import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authFetch } from '../../utils/authFetch';
import { useUnsavedChanges } from '../../utils/useUnsavedChanges';
import UnsavedChangesModal from '../UnsavedChangesModal';

const inputClass = "w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50";
const inputErrorClass = "w-full px-3 py-2 border border-red-400 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-300";

const CustomerFormComponent = () => {
    const { customerId } = useParams();
    const navigate = useNavigate();
    const [customerFormData, setCustomerFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        is_minor: false,
        is_banned: false,
        customer_notes: ''
    });

    const [responseMessage, setResponseMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [isDirty, setIsDirty] = useState(false);
    const blocker = useUnsavedChanges(isDirty);

    useEffect(() => {
        if (customerId) {
            const fetchCustomerDetails = async () => {
                try {
                    const response = await authFetch(`${import.meta.env.VITE_API_BASE_URL}api/customers/${customerId}`);
                    if (!response.ok) throw new Error('Network response was not ok');
                    const data = await response.json();
                    setCustomerFormData({
                        first_name: data.first_name || '',
                        last_name: data.last_name || '',
                        email: data.email || '',
                        is_minor: data.is_minor ?? false,
                        is_banned: data.is_banned ?? false,
                        customer_notes: data.customer_notes || ''
                    });
                } catch (error) {
                    console.error('Error fetching customer details:', error);
                }
            };
            fetchCustomerDetails();
        }
    }, [customerId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCustomerFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        setIsDirty(true);
    };

    const validateCustomerForm = () => {
        const errors = {};
        if (!customerFormData.first_name) errors.first_name = 'First Name is required';
        if (!customerFormData.last_name) errors.last_name = 'Last Name is required';
        if (!customerFormData.email) errors.email = 'Email is required';
        if (customerFormData.is_banned && !customerFormData.customer_notes.trim())
            errors.customer_notes = 'A note is required when banning a customer';
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateCustomerForm();
        setFormErrors(errors);

        if (Object.keys(errors).length === 0) {
            try {
                const response = await authFetch(
                    `${import.meta.env.VITE_API_BASE_URL}api/customers${customerId ? `/${customerId}` : ''}`,
                    {
                        method: customerId ? 'PUT' : 'POST',
                        body: JSON.stringify(customerFormData)
                    }
                );
                const data = await response.json();
                if (response.ok) {
                    setResponseMessage(data.message);
                    setErrorMessage('');
                    setIsDirty(false);
                    if (!customerId) {
                        setCustomerFormData({ first_name: '', last_name: '', email: '', is_minor: false, is_banned: false, customer_notes: '' });
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

    return (
        <div className="max-w-lg mx-auto">
            <UnsavedChangesModal blocker={blocker} />

            {responseMessage && <p className="text-green-600 text-sm mb-4">{responseMessage}</p>}
            {errorMessage && <p className="text-red-600 text-sm mb-4">{errorMessage}</p>}

            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-800">{customerId ? 'Edit Customer' : 'Add Customer'}</h2>
                    {isDirty && (
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                            Unsaved changes
                        </span>
                    )}
                </div>
                <div className="p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                            <input type="text" name="first_name" value={customerFormData.first_name} onChange={handleChange}
                                className={formErrors.first_name ? inputErrorClass : inputClass} />
                            {formErrors.first_name && <p className="text-red-500 text-xs mt-1">{formErrors.first_name}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                            <input type="text" name="last_name" value={customerFormData.last_name} onChange={handleChange}
                                className={formErrors.last_name ? inputErrorClass : inputClass} />
                            {formErrors.last_name && <p className="text-red-500 text-xs mt-1">{formErrors.last_name}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                            <input type="email" name="email" value={customerFormData.email} onChange={handleChange}
                                className={formErrors.email ? inputErrorClass : inputClass} />
                            {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                        </div>
                        <div className="mb-4 flex items-center gap-3">
                            <input type="checkbox" id="is_minor" name="is_minor" checked={customerFormData.is_minor}
                                onChange={handleChange} className="w-4 h-4 rounded border-slate-300 text-[#c9a84c] focus:ring-[#c9a84c]/50" />
                            <label htmlFor="is_minor" className="text-sm text-slate-700">Minor</label>
                        </div>
                        <div className="mb-4 flex items-center gap-3">
                            <input type="checkbox" id="is_banned" name="is_banned" checked={customerFormData.is_banned}
                                onChange={handleChange} className="w-4 h-4 rounded border-slate-300 text-[#c9a84c] focus:ring-[#c9a84c]/50" />
                            <label htmlFor="is_banned" className="text-sm text-slate-700">Banned</label>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Customer Notes
                                {customerFormData.is_banned && (
                                    <span className="ml-1 text-red-500 text-xs font-normal">* required when banned</span>
                                )}
                            </label>
                            <textarea name="customer_notes" rows={3}
                                className={formErrors.customer_notes ? inputErrorClass : inputClass}
                                value={customerFormData.customer_notes} onChange={handleChange} />
                            {formErrors.customer_notes && <p className="text-red-500 text-xs mt-1">{formErrors.customer_notes}</p>}
                        </div>
                        <div className="flex justify-end">
                            <button type="submit"
                                className="px-4 py-2 bg-[#c9a84c] hover:bg-[#b8972f] text-[#0f172a] text-sm font-semibold rounded transition-colors">
                                {customerId ? 'Update Customer' : 'Add Customer'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <button onClick={() => navigate('/staff/customers')}
                className="mt-4 px-4 py-2 border border-slate-300 text-slate-600 hover:bg-slate-50 text-sm font-medium rounded transition-colors">
                Return to Customer List
            </button>
        </div>
    );
};

export default CustomerFormComponent;
