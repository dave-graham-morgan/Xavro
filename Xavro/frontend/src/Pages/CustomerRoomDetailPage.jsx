import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CustomerLayout from '../layouts/CustomerLayout.jsx';
import CalendarComponent from '../Components/Calendar/CalendarComponent.jsx';
import BookingItemComponent from '../Components/Booking/BookingItemComponent.jsx';
import ModalComponent from '../Components/Modal/ModalComponent.jsx';

const CustomerRoomDetailPage = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();

    const [room, setRoom] = useState(null);
    const [images, setImages] = useState([]);
    const [activeImage, setActiveImage] = useState(0);
    const [loading, setLoading] = useState(true);

    // Booking state
    const [showBooking, setShowBooking] = useState(false);
    const [availability, setAvailability] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [timeslots, setTimeslots] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedTimeslot, setSelectedTimeslot] = useState(null);

    useEffect(() => {
        const fetchRoom = async () => {
            try {
                const [roomRes, imgRes, availRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_BASE_URL}api/rooms/${roomId}`),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}api/rooms/${roomId}/images`),
                    fetch(`${import.meta.env.VITE_API_BASE_URL}api/rooms/${roomId}/availability`),
                ]);
                if (roomRes.ok) setRoom(await roomRes.json());
                if (imgRes.ok) setImages(await imgRes.json());
                if (availRes.ok) setAvailability(await availRes.json());
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchRoom();
    }, [roomId]);

    useEffect(() => {
        if (!showBooking) return;
        const fetchTimeslots = async () => {
            const dateString = selectedDate.toISOString().split('T')[0];
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/rooms/${roomId}/timeslots?date=${dateString}`);
            if (res.ok) setTimeslots(await res.json());
        };
        fetchTimeslots();
    }, [selectedDate, showBooking, roomId]);

    const handleBookNow = (timeslot) => {
        setSelectedTimeslot({ ...timeslot, showDate: selectedDate.toISOString().split('T')[0] });
        setShowModal(true);
    };

    const generateOrderId = (customerId) => {
        const now = new Date();
        const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
        const timePart = now.toISOString().slice(11, 19).replace(/:/g, '');
        return `${customerId}-${datePart}-${timePart}`;
    };

    const handleConfirmBooking = async (customer, timeslotDetails, guestCount) => {
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

            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_id: customer.id,
                    room_id: Number(roomId),
                    guest_count: guestCount,
                    order_id: generateOrderId(customer.id),
                    booking_date: new Date().toISOString().split('T')[0],
                    show_date: timeslotDetails.showDate,
                    show_timeslot: timeslotDetails.timeslot
                })
            });

            if (res.ok) {
                setTimeslots(prev => prev.map(ts =>
                    ts.id === timeslotDetails.id ? { ...ts, isBooked: true } : ts
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
                        </div>

                        <p className="text-[#b8afa3] leading-relaxed text-base">
                            {room.description || 'An immersive escape room experience awaits. Can your team solve the puzzles and escape in time?'}
                        </p>
                    </div>

                    {/* Right: booking panel */}
                    <div className="border border-[#c9a84c]/20 p-8 h-fit">
                        <h2 className="font-['Playfair_Display'] text-xl text-[#f1ece3] mb-2">Ready to Book?</h2>
                        <p className="text-[#b8afa3] text-sm mb-6">Select a date to see available times.</p>
                        {!showBooking ? (
                            <button
                                onClick={() => setShowBooking(true)}
                                className="w-full py-4 bg-[#c9a84c] hover:bg-[#b8972f] text-[#0f172a] font-semibold tracking-widest uppercase text-sm transition-colors"
                            >
                                Check Availability
                            </button>
                        ) : (
                            <div>
                                <CalendarComponent
                                    selectedDate={selectedDate}
                                    onDateChange={setSelectedDate}
                                    availability={availability}
                                />
                                <div className="mt-4 space-y-3">
                                    {timeslots.length === 0 ? (
                                        <p className="text-[#b8afa3] text-sm text-center py-4">No available times on this date.</p>
                                    ) : (
                                        timeslots.map(ts => (
                                            <BookingItemComponent
                                                key={ts.id}
                                                roomName={ts.roomName}
                                                startTime={ts.startTime}
                                                endTime={ts.endTime}
                                                showDate={selectedDate}
                                                isBooked={ts.isBooked}
                                                onBookNow={() => handleBookNow(ts)}
                                            />
                                        ))
                                    )}
                                </div>
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
