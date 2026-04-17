import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerLayout from '../layouts/CustomerLayout.jsx';

const CustomerRoomsPage = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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

    return (
        <CustomerLayout>
            {/* Page header */}
            <div className="relative py-24 text-center border-b border-[#c9a84c]/20">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-10"
                    style={{ backgroundImage: `url('https://picsum.photos/seed/mystery/1920/400')` }}
                />
                <div className="relative z-10">
                    <p className="text-[#c9a84c] text-xs tracking-[0.4em] uppercase mb-4">The Experiences</p>
                    <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl text-[#f1ece3]">Our Rooms</h1>
                </div>
            </div>

            {/* Rooms grid */}
            <div className="max-w-6xl mx-auto px-6 py-20">
                {loading ? (
                    <div className="text-center text-[#b8afa3] tracking-widest uppercase text-sm py-20">Loading...</div>
                ) : rooms.length === 0 ? (
                    <div className="text-center text-[#b8afa3] py-20">No rooms available at this time.</div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {rooms.map(room => {
                            const primaryImage = room.images?.[0];
                            return (
                                <div
                                    key={room.id}
                                    className="group border border-[#c9a84c]/20 hover:border-[#c9a84c]/50 transition-all duration-300 cursor-pointer"
                                    onClick={() => navigate(`/rooms/${room.id}`)}
                                >
                                    {/* Image */}
                                    <div className="relative h-72 overflow-hidden bg-[#1e293b]">
                                        {primaryImage ? (
                                            <img
                                                src={primaryImage.image_url}
                                                alt={primaryImage.alt_text || room.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-[#b8afa3] text-xs tracking-widest uppercase">
                                                No Image Yet
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
                                    </div>

                                    {/* Details */}
                                    <div className="p-8">
                                        <div className="flex items-start justify-between mb-4">
                                            <h2 className="font-['Playfair_Display'] text-2xl text-[#f1ece3]">{room.title}</h2>
                                        </div>
                                        <p className="text-[#b8afa3] text-sm leading-relaxed mb-6">
                                            {room.description || 'An immersive escape room experience awaits you.'}
                                        </p>
                                        <div className="flex items-center gap-6 text-xs tracking-widest uppercase text-[#b8afa3] mb-6 border-t border-[#c9a84c]/10 pt-6">
                                            <span>{room.min_capacity}–{room.max_capacity} players</span>
                                            <span className="text-[#c9a84c]/40">|</span>
                                            <span>{room.duration} minutes</span>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); navigate(`/rooms/${room.id}`); }}
                                            className="w-full py-3 bg-[#c9a84c] hover:bg-[#b8972f] text-[#0f172a] text-sm font-semibold tracking-widest uppercase transition-colors"
                                        >
                                            View & Book
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
};

export default CustomerRoomsPage;
