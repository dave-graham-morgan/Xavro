import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CustomerLayout from '../layouts/CustomerLayout.jsx';
import ModalComponent from '../Components/Modal/ModalComponent.jsx';

// ── Helpers ───────────────────────────────────────────────────────────────────

const todayMidnight = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
};

const addDays = (date, n) => {
    const d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
};

const fmt12 = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
};

const formatDateHeader = (date) => date.toLocaleDateString('en-US', {
    weekday: 'short', month: 'long', day: 'numeric', year: 'numeric'
});

const formatDateShort = (date) => date.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
});

// ── RoomWidget ────────────────────────────────────────────────────────────────

const RoomWidget = ({ room, selectedDate, onDateChange }) => {
    const navigate = useNavigate();
    const [timeslots, setTimeslots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(true);
    const [nextAvailable, setNextAvailable] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedTimeslot, setSelectedTimeslot] = useState(null);

    useEffect(() => {
        const fetchTimeslots = async () => {
            setLoadingSlots(true);
            setNextAvailable(null);
            try {
                const dateStr = selectedDate.toISOString().split('T')[0];
                const res = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}api/rooms/${room.id}/timeslots?date=${dateStr}`
                );
                const data = res.ok ? await res.json() : [];
                data.sort((a, b) => a.timeslot - b.timeslot);
                setTimeslots(data);

                // If no slots, find next available date
                if (data.length === 0) {
                    const availRes = await fetch(
                        `${import.meta.env.VITE_API_BASE_URL}api/rooms/${room.id}/availability`
                    );
                    if (availRes.ok) {
                        const availDates = await availRes.json(); // array of "YYYY-MM-DD" strings
                        const future = availDates
                            .map(s => { const d = new Date(s + 'T00:00:00'); return d; })
                            .filter(d => d > selectedDate)
                            .sort((a, b) => a - b);
                        if (future.length > 0) setNextAvailable(future[0]);
                    }
                }
            } catch (err) {
                console.error('Error fetching timeslots:', err);
                setTimeslots([]);
            } finally {
                setLoadingSlots(false);
            }
        };
        fetchTimeslots();
    }, [room.id, selectedDate]);

    const handleBookNow = (ts) => {
        setSelectedTimeslot({ ...ts, showDate: selectedDate.toISOString().split('T')[0] });
        setShowModal(true);
    };

    const handleConfirmBooking = async (customer, timeslotDetails, guestCount) => {
        try {
            if (!customer.id) {
                const createRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/customers`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(customer)
                });
                if (!createRes.ok) throw new Error('Failed to create customer');
                const created = await createRes.json();
                customer.id = created.id;
            }

            const orderId = `${customer.id}-${Date.now()}`;
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_id: customer.id,
                    room_id: room.id,
                    guest_count: guestCount,
                    order_id: orderId,
                    booking_date: new Date().toISOString().split('T')[0],
                    show_date: timeslotDetails.showDate,
                    show_timeslot: timeslotDetails.timeslot
                })
            });

            if (res.ok) {
                setTimeslots(prev =>
                    prev.map(ts =>
                        ts.timeslot === timeslotDetails.timeslot ? { ...ts, isBooked: true } : ts
                    )
                );
                setShowModal(false);
                setSelectedTimeslot(null);
            } else {
                alert('Failed to book. Please try again.');
            }
        } catch (err) {
            console.error('Booking error:', err);
            alert('Error confirming booking. Please try again.');
        }
    };

    const primaryImage = room.images?.[0];
    const isToday = selectedDate.toDateString() === todayMidnight().toDateString();

    return (
        <div className="bg-[#1e293b] border border-[#c9a84c]/20 overflow-hidden flex flex-col">

            {/* Image */}
            <div
                className="relative h-56 overflow-hidden cursor-pointer group flex-shrink-0"
                onClick={() => navigate(`/rooms/${room.id}`)}
            >
                {primaryImage ? (
                    <img
                        src={primaryImage.image_url}
                        alt={primaryImage.alt_text || room.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full bg-[#0f172a] flex items-center justify-center text-[#b8afa3] text-xs tracking-widest uppercase">
                        No Image
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/70 via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-1">

                {/* Room name + meta */}
                <h2
                    className="font-['Playfair_Display'] text-2xl text-[#f1ece3] mb-1 cursor-pointer hover:text-[#c9a84c] transition-colors"
                    onClick={() => navigate(`/rooms/${room.id}`)}
                >
                    {room.title}
                </h2>
                <p className="text-xs text-[#b8afa3] tracking-widest uppercase mb-5">
                    {room.duration} min &nbsp;·&nbsp; {room.min_capacity}–{room.max_capacity} guests
                </p>

                {/* Date navigation */}
                <div className="flex items-center justify-between border-t border-b border-[#c9a84c]/10 py-3 mb-5">
                    <button
                        onClick={() => onDateChange(addDays(selectedDate, -1))}
                        disabled={isToday}
                        className="p-1.5 text-[#c9a84c] hover:text-[#f1ece3] disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                        title="Previous day"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <span className="text-sm text-[#f1ece3] font-medium tracking-wide">
                        {formatDateHeader(selectedDate)}
                    </span>
                    <button
                        onClick={() => onDateChange(addDays(selectedDate, 1))}
                        className="p-1.5 text-[#c9a84c] hover:text-[#f1ece3] transition-colors"
                        title="Next day"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                </div>

                {/* Timeslots */}
                {loadingSlots ? (
                    <p className="text-xs text-[#b8afa3] tracking-widest uppercase text-center py-4">Loading...</p>
                ) : timeslots.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-5">
                        <p className="text-xs text-[#b8afa3] tracking-widest uppercase">
                            No availability for this date
                        </p>
                        {nextAvailable ? (
                            <button
                                onClick={() => onDateChange(nextAvailable)}
                                className="flex items-center gap-1.5 text-xs text-[#c9a84c] hover:text-[#f1ece3] tracking-wide transition-colors border border-[#c9a84c]/30 hover:border-[#c9a84c]/60 px-3 py-1.5"
                            >
                                Next available: {formatDateShort(nextAvailable)}
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                            </button>
                        ) : (
                            <p className="text-xs text-[#b8afa3]/60 italic">No upcoming availability</p>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {timeslots.map(ts => (
                            <button
                                key={ts.timeslot}
                                onClick={() => !ts.isBooked && handleBookNow(ts)}
                                disabled={ts.isBooked}
                                title={ts.isBooked ? 'Already booked' : `Book ${fmt12(ts.startTime)}`}
                                className={`px-3 py-2 text-xs font-semibold tracking-wide transition-all ${
                                    ts.isBooked
                                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed line-through'
                                        : 'bg-[#0f172a] border border-[#c9a84c]/40 text-[#c9a84c] hover:bg-[#c9a84c] hover:text-[#0f172a] hover:border-[#c9a84c]'
                                }`}
                            >
                                {ts.isBooked ? `${fmt12(ts.startTime)} Full` : fmt12(ts.startTime)}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {showModal && selectedTimeslot && (
                <ModalComponent
                    show={showModal}
                    handleClose={() => { setShowModal(false); setSelectedTimeslot(null); }}
                    handleConfirm={handleConfirmBooking}
                    timeslotDetails={selectedTimeslot}
                />
            )}
        </div>
    );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const CustomerRoomsPage = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(todayMidnight());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const datePickerRef = useRef(null);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/rooms/`);
                if (!res.ok) return;
                const data = await res.json();
                const roomsWithImages = await Promise.all(
                    data.map(async (room) => {
                        const imgRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/rooms/${room.id}/images`);
                        const images = imgRes.ok ? await imgRes.json() : [];
                        return { ...room, images };
                    })
                );
                setRooms(roomsWithImages);
            } catch (err) {
                console.error('Error fetching rooms:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, []);

    // Close flyout when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
                setShowDatePicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDateChange = (date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        setSelectedDate(d);
        setShowDatePicker(false);
    };

    return (
        <CustomerLayout>
            {/* Slim page header */}
            <div className="relative py-14 text-center border-b border-[#c9a84c]/20">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-10"
                    style={{ backgroundImage: `url('https://picsum.photos/seed/mystery/1920/400')` }}
                />
                <div className="relative z-10">
                    <p className="text-[#c9a84c] text-xs tracking-[0.4em] uppercase mb-3">The Experiences</p>
                    <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl text-[#f1ece3]">
                        Book Your Adventure
                    </h1>
                </div>
            </div>

            {/* Date picker bar — sits right above widgets */}
            <div className="border-b border-[#c9a84c]/10 bg-[#0f172a]/60">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
                    <span className="text-xs text-[#b8afa3] tracking-widest uppercase hidden sm:block">
                        Showing availability for
                    </span>
                    <div className="relative" ref={datePickerRef}>
                        <button
                            onClick={() => setShowDatePicker(v => !v)}
                            className="flex items-center gap-2 px-4 py-2 border border-[#c9a84c]/40 text-[#c9a84c] text-sm tracking-wide hover:bg-[#c9a84c]/10 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            {selectedDate.toLocaleDateString('en-US', {
                                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                            })}
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                        </button>

                        {showDatePicker && (
                            <div className="absolute top-full mt-2 left-0 z-50 shadow-2xl">
                                <DatePicker
                                    selected={selectedDate}
                                    onChange={handleDateChange}
                                    minDate={todayMidnight()}
                                    inline
                                />
                            </div>
                        )}
                    </div>
                    <span className="text-xs text-[#b8afa3]/50 hidden sm:block">
                        Use arrows on each room to step day by day
                    </span>
                </div>
            </div>

            {/* Room widgets */}
            <div className="max-w-5xl mx-auto px-6 py-10">
                {loading ? (
                    <div className="text-center text-[#b8afa3] tracking-widest uppercase text-sm py-20">
                        Loading...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {rooms.map(room => (
                            <RoomWidget
                                key={room.id}
                                room={room}
                                selectedDate={selectedDate}
                                onDateChange={handleDateChange}
                            />
                        ))}
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
};

export default CustomerRoomsPage;
