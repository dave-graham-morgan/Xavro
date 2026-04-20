import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CustomerLayout from '../layouts/CustomerLayout.jsx';
import BookingItemComponent from '../Components/Booking/BookingItemComponent.jsx';
import ModalComponent from '../Components/Modal/ModalComponent.jsx';

const Stars = ({ value, label }) => {
    if (!value) return null;
    return (
        <div>
            <div className="text-[#c9a84c] text-base font-light mb-1 tracking-wide">
                {Array.from({ length: 5 }, (_, i) => (
                    <span key={i} className={i < value ? 'opacity-100' : 'opacity-20'}>★</span>
                ))}
            </div>
            <div className="text-xs tracking-widest uppercase text-[#b8afa3]">{label}</div>
        </div>
    );
};

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

const CustomerRoomDetailPage = () => {
    const { roomSlug } = useParams();
    const navigate = useNavigate();
    const datePickerRef = useRef(null);

    const [room, setRoom] = useState(null);
    const [roomId, setRoomId] = useState(null);
    const [images, setImages] = useState([]);
    const [activeImage, setActiveImage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [leaderboard, setLeaderboard] = useState([]);

    const [selectedDate, setSelectedDate] = useState(todayMidnight());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [timeslots, setTimeslots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(true);
    const [nextAvailable, setNextAvailable] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedTimeslot, setSelectedTimeslot] = useState(null);

    // Load room data — fetch by slug first to get the numeric id
    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const roomRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/rooms/slug/${roomSlug}`);
                if (!roomRes.ok) { setLoading(false); return; }
                const roomData = await roomRes.json();
                setRoom(roomData);
                setRoomId(roomData.id);
                const [imgRes, lbRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_BASE_URL}api/rooms/${roomData.id}/images`),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}api/rooms/${roomData.id}/leaderboard`),
                ]);
                if (imgRes.ok) setImages(await imgRes.json());
                if (lbRes.ok) setLeaderboard(await lbRes.json());
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchRoom();
    }, [roomSlug]);

    // Load timeslots whenever date changes
    useEffect(() => {
        const fetchTimeslots = async () => {
            setLoadingSlots(true);
            setNextAvailable(null);
            try {
                const dateStr = selectedDate.toISOString().split('T')[0];
                const res = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}api/rooms/${roomId}/timeslots?date=${dateStr}`
                );
                const data = res.ok ? await res.json() : [];
                data.sort((a, b) => a.timeslot - b.timeslot);
                setTimeslots(data);

                if (data.length === 0) {
                    const availRes = await fetch(
                        `${import.meta.env.VITE_API_BASE_URL}api/rooms/${roomId}/availability`
                    );
                    if (availRes.ok) {
                        const dates = await availRes.json();
                        const future = dates
                            .map(s => new Date(s + 'T00:00:00'))
                            .filter(d => d > selectedDate)
                            .sort((a, b) => a - b);
                        if (future.length > 0) setNextAvailable(future[0]);
                    }
                }
            } catch (err) {
                console.error(err);
                setTimeslots([]);
            } finally {
                setLoadingSlots(false);
            }
        };
        fetchTimeslots();
    }, [selectedDate, roomId]);

    // Close date picker on outside click
    useEffect(() => {
        const handler = (e) => {
            if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
                setShowDatePicker(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleDateChange = (date) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        setSelectedDate(d);
        setShowDatePicker(false);
    };

    const handleBookNow = (ts) => {
        setSelectedTimeslot({
            ...ts,
            showDate: selectedDate.toISOString().split('T')[0],
            minCapacity: room.min_capacity,
            maxCapacity: room.max_capacity,
        });
        setShowModal(true);
    };

    const handleConfirmBooking = async (customer, timeslotDetails, guestCount, teamName) => {
        try {
            if (!customer.id) {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/customers`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(customer)
                });
                if (!res.ok) throw new Error('Failed to create customer');
                const created = await res.json();
                customer.id = created.id;
            }

            const now = new Date();
            const orderId = `${customer.id}-${now.toISOString().slice(0,10).replace(/-/g,'')}${now.toISOString().slice(11,19).replace(/:/g,'')}`;

            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_id: customer.id,
                    room_id: Number(roomId),
                    guest_count: guestCount,
                    order_id: orderId,
                    booking_date: new Date().toISOString().split('T')[0],
                    show_date: timeslotDetails.showDate,
                    show_timeslot: timeslotDetails.timeslot,
                    team_name: teamName || null,
                })
            });

            if (res.ok) {
                setTimeslots(prev => prev.map(ts =>
                    ts.timeslot === timeslotDetails.timeslot ? { ...ts, isBooked: true } : ts
                ));
                setShowModal(false);
                setSelectedTimeslot(null);
                alert('Booking confirmed! Check your email for details.');
            } else {
                alert('Failed to book. Please try again.');
            }
        } catch (err) {
            console.error(err);
            alert('Error confirming booking. Please try again.');
        }
    };

    if (loading) {
        return (
            <CustomerLayout>
                <div className="text-center text-[#b8afa3] tracking-widest uppercase text-sm py-40">Loading...</div>
            </CustomerLayout>
        );
    }

    if (!room) {
        return (
            <CustomerLayout>
                <div className="text-center py-40">
                    <p className="text-[#b8afa3] mb-6">Room not found.</p>
                    <button onClick={() => navigate('/rooms')} className="text-[#c9a84c] underline text-sm">Back to Rooms</button>
                </div>
            </CustomerLayout>
        );
    }

    const displayImages = images.length > 0
        ? images
        : [{ id: 0, image_url: `https://picsum.photos/seed/${room.title}/1200/700`, alt_text: room.title }];

    const isToday = selectedDate.toDateString() === todayMidnight().toDateString();

    return (
        <CustomerLayout>
            {/* Breadcrumb */}
            <div className="max-w-6xl mx-auto px-6 pt-10 pb-4">
                <button onClick={() => navigate('/rooms')} className="text-[#b8afa3] hover:text-[#c9a84c] text-xs tracking-widest uppercase transition-colors">
                    ← All Rooms
                </button>
            </div>

            {/* Image gallery */}
            <div className="max-w-6xl mx-auto px-6">
                <div className="relative h-[28rem] md:h-[36rem] overflow-hidden bg-[#1e293b]">
                    <img
                        src={displayImages[activeImage]?.image_url}
                        alt={displayImages[activeImage]?.alt_text || room.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/60 via-transparent to-transparent" />
                    {displayImages.length > 1 && (
                        <>
                            <button
                                onClick={() => setActiveImage(i => (i - 1 + displayImages.length) % displayImages.length)}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                            </button>
                            <button
                                onClick={() => setActiveImage(i => (i + 1) % displayImages.length)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                            </button>
                        </>
                    )}
                </div>
                {displayImages.length > 1 && (
                    <div className="flex gap-3 mt-3">
                        {displayImages.map((img, i) => (
                            <button
                                key={img.id}
                                onClick={() => setActiveImage(i)}
                                className={`h-20 w-28 overflow-hidden border-2 transition-all ${
                                    i === activeImage ? 'border-[#c9a84c]' : 'border-transparent opacity-50 hover:opacity-80'
                                }`}
                            >
                                <img src={img.image_url} alt={img.alt_text} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Room info + booking */}
            <div className="max-w-6xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

                    {/* Left: details */}
                    <div className="lg:col-span-2">
                        <p className="text-[#c9a84c] text-xs tracking-[0.4em] uppercase mb-3">The Experience</p>
                        <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl text-[#f1ece3] mb-8">{room.title}</h1>

                        <div className="flex flex-wrap gap-8 text-xs tracking-widest uppercase text-[#b8afa3] pb-8 mb-8 border-b border-[#c9a84c]/20">
                            <div>
                                <div className="text-[#c9a84c] text-lg font-light mb-1">{room.min_capacity}–{room.max_capacity}</div>
                                <div>Players</div>
                            </div>
                            <div>
                                <div className="text-[#c9a84c] text-lg font-light mb-1">{room.duration}</div>
                                <div>Minutes</div>
                            </div>
                            <Stars value={room.difficulty} label="Difficulty" />
                            <Stars value={room.physical_rating} label="Physical" />
                            <Stars value={room.scare_factor} label="Scare Factor" />
                        </div>

                        <p className="text-[#b8afa3] leading-relaxed text-base">
                            {room.description || 'An immersive escape room experience awaits. Can your team solve the puzzles and escape in time?'}
                        </p>
                    </div>

                    {/* Right: booking panel */}
                    <div className="border border-[#c9a84c]/20 p-6 h-fit">
                        <h2 className="font-['Playfair_Display'] text-xl text-[#f1ece3] mb-5">Book Your Session</h2>

                        {/* Date navigation */}
                        <div className="flex items-center justify-between border border-[#c9a84c]/20 rounded px-2 py-2 mb-4">
                            <button
                                onClick={() => !isToday && setSelectedDate(d => addDays(d, -1))}
                                disabled={isToday}
                                className="p-1.5 text-[#c9a84c] hover:text-[#f1ece3] disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                            </button>

                            <div className="relative" ref={datePickerRef}>
                                <button
                                    onClick={() => setShowDatePicker(v => !v)}
                                    className="flex items-center gap-1.5 text-sm text-[#f1ece3] hover:text-[#c9a84c] transition-colors font-medium"
                                >
                                    {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                                </button>
                                {showDatePicker && (
                                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 shadow-2xl">
                                        <DatePicker
                                            selected={selectedDate}
                                            onChange={handleDateChange}
                                            minDate={todayMidnight()}
                                            inline
                                        />
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setSelectedDate(d => addDays(d, 1))}
                                className="p-1.5 text-[#c9a84c] hover:text-[#f1ece3] transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                            </button>
                        </div>

                        {/* Timeslots */}
                        {loadingSlots ? (
                            <p className="text-xs text-[#b8afa3] tracking-widest uppercase text-center py-6">Loading...</p>
                        ) : timeslots.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-6">
                                <p className="text-xs text-[#b8afa3] tracking-widest uppercase text-center">
                                    No availability for this date
                                </p>
                                {nextAvailable ? (
                                    <button
                                        onClick={() => handleDateChange(nextAvailable)}
                                        className="flex items-center gap-1.5 text-xs text-[#c9a84c] hover:text-[#f1ece3] tracking-wide transition-colors border border-[#c9a84c]/30 hover:border-[#c9a84c]/60 px-3 py-1.5"
                                    >
                                        Next available: {nextAvailable.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                                    </button>
                                ) : (
                                    <p className="text-xs text-[#b8afa3]/60 italic">No upcoming availability</p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {timeslots.map(ts => (
                                    <BookingItemComponent
                                        key={ts.timeslot}
                                        startTime={ts.startTime}
                                        endTime={ts.endTime}
                                        showDate={selectedDate}
                                        isBooked={ts.isBooked}
                                        onBookNow={() => handleBookNow(ts)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Hall of Fame */}
            <div className="max-w-6xl mx-auto px-6 pb-20">
                <div className="border border-[#c9a84c]/20 bg-[#1e293b]">
                    <div className="px-8 py-6 border-b border-[#c9a84c]/20 flex items-center gap-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                        <div>
                            <h2 className="font-['Playfair_Display'] text-2xl text-[#f1ece3]">Hall of Fame</h2>
                            <p className="text-[#b8afa3] text-xs tracking-widest uppercase mt-0.5">Fastest escapes from {room.title}</p>
                        </div>
                    </div>

                    <div className="p-8">
                        {leaderboard.length === 0 ? (
                            <div className="text-center py-10">
                                <svg className="mx-auto mb-4 opacity-20" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                                <p className="text-[#b8afa3] text-sm">No escape records yet.</p>
                                <p className="text-[#b8afa3]/50 text-xs mt-1 tracking-widest uppercase">Will your team be first?</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {leaderboard.map((entry, i) => {
                                    const mins = Math.floor(entry.escape_time_seconds / 60);
                                    const secs = entry.escape_time_seconds % 60;
                                    const time = `${mins}:${String(secs).padStart(2, '0')}`;
                                    const isFirst = i === 0;
                                    const medals = ['🥇', '🥈', '🥉'];
                                    const initials = entry.team_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

                                    return (
                                        <div
                                            key={i}
                                            className={`flex items-center gap-5 rounded-lg transition-all ${
                                                isFirst
                                                    ? 'bg-[#c9a84c]/10 border border-[#c9a84c]/40 px-6 py-5'
                                                    : 'bg-[#0f172a]/40 border border-white/5 px-5 py-3.5'
                                            }`}
                                        >
                                            {/* Rank */}
                                            <div className={`shrink-0 text-center ${isFirst ? 'w-10' : 'w-8'}`}>
                                                {i < 3 ? (
                                                    <span className={isFirst ? 'text-3xl' : 'text-xl'}>{medals[i]}</span>
                                                ) : (
                                                    <span className="text-[#b8afa3] font-semibold text-sm">{i + 1}</span>
                                                )}
                                            </div>

                                            {/* Photo or initials avatar */}
                                            {entry.team_photo_url ? (
                                                <img
                                                    src={entry.team_photo_url}
                                                    alt={entry.team_name}
                                                    className={`shrink-0 rounded-full object-cover border-2 ${
                                                        isFirst ? 'w-14 h-14 border-[#c9a84c]' : 'w-10 h-10 border-[#c9a84c]/30'
                                                    }`}
                                                />
                                            ) : (
                                                <div className={`shrink-0 rounded-full flex items-center justify-center font-semibold border-2 ${
                                                    isFirst
                                                        ? 'w-14 h-14 border-[#c9a84c] bg-[#c9a84c]/20 text-[#c9a84c] text-lg'
                                                        : 'w-10 h-10 border-[#c9a84c]/20 bg-[#c9a84c]/10 text-[#c9a84c]/60 text-sm'
                                                }`}>
                                                    {initials}
                                                </div>
                                            )}

                                            {/* Name + date */}
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-semibold truncate ${
                                                    isFirst ? 'text-[#f1ece3] text-lg font-["Playfair_Display"]' : 'text-[#f1ece3] text-sm'
                                                }`}>
                                                    {entry.team_name}
                                                </p>
                                                <p className="text-[#b8afa3] text-xs mt-0.5">{entry.show_date}</p>
                                            </div>

                                            {/* Time */}
                                            <div className={`shrink-0 font-mono font-bold tabular-nums ${
                                                isFirst ? 'text-[#c9a84c] text-2xl' : 'text-[#b8afa3] text-base'
                                            }`}>
                                                {time}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {selectedTimeslot && (
                <ModalComponent
                    show={showModal}
                    handleClose={() => { setShowModal(false); setSelectedTimeslot(null); }}
                    handleConfirm={handleConfirmBooking}
                    timeslotDetails={selectedTimeslot}
                />
            )}
        </CustomerLayout>
    );
};

export default CustomerRoomDetailPage;
