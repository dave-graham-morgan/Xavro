import React, { useState, useEffect } from 'react';

const ModalComponent = ({ show, handleClose, handleConfirm, timeslotDetails }) => {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [guestCount, setGuestCount] = useState('');
    const [customer, setCustomer] = useState(null);

    useEffect(() => {
        if (customer) {
            setFirstName(customer.first_name);
            setLastName(customer.last_name);
        }
    }, [customer]);

    const handleEmailLookup = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/customers?email=${email}`);
            if (response.ok) {
                const data = await response.json();
                setCustomer(data);
            } else {
                setCustomer(null);
            }
        } catch (error) {
            console.error('Error looking up customer:', error);
        }
    };

    const handleConfirmBooking = () => {
        handleConfirm(customer || { first_name: firstName, last_name: lastName, email }, timeslotDetails, guestCount);
    };

    const isConfirmDisabled = !email || !firstName || !lastName || !guestCount;

    const inputClass = "w-full px-3 py-2 bg-[#0f172a] border border-[#c9a84c]/20 rounded-md text-[#f1ece3] text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40 placeholder:text-slate-500";

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
            <div className="relative w-full max-w-md bg-[#1e293b] rounded-lg border border-[#c9a84c]/20 shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#c9a84c]/20">
                    <h3 className="text-lg font-semibold text-[#f1ece3]">Book Your Adventure</h3>
                    <button
                        onClick={handleClose}
                        className="text-[#b8afa3] hover:text-[#f1ece3] transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>

                <div className="px-6 py-5 space-y-4">
                    <div className="p-3 bg-[#0f172a]/50 rounded border border-[#c9a84c]/10 text-sm text-[#b8afa3] space-y-1">
                        <p>Room: <span className="text-[#f1ece3]">{timeslotDetails.roomName}</span></p>
                        <p>Date: <span className="text-[#f1ece3]">{timeslotDetails.showDate}</span></p>
                        <p>Time: <span className="text-[#f1ece3]">{timeslotDetails.startTime} – {timeslotDetails.endTime}</span></p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#b8afa3] mb-1.5">Email address</label>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={handleEmailLookup}
                                className={inputClass + " flex-1"}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-[#b8afa3] mb-1.5">First Name</label>
                            <input
                                type="text"
                                placeholder="First Name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className={inputClass}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#b8afa3] mb-1.5">Last Name</label>
                            <input
                                type="text"
                                placeholder="Last Name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#b8afa3] mb-1.5">Number of Guests</label>
                        <input
                            type="number"
                            placeholder="How many guests?"
                            value={guestCount}
                            onChange={(e) => setGuestCount(e.target.value)}
                            className={inputClass}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#c9a84c]/20">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-sm text-[#b8afa3] hover:text-[#f1ece3] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirmBooking}
                        disabled={isConfirmDisabled}
                        className="px-6 py-2 bg-[#c9a84c] hover:bg-[#b8972f] text-[#0f172a] text-sm font-semibold tracking-wide uppercase transition-colors rounded disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Confirm Booking
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalComponent;
