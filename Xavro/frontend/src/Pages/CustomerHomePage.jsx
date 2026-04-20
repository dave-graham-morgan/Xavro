import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerLayout from '../layouts/CustomerLayout.jsx';
import logo from '../assets/logo.jpg';

const RoomCard = ({ room }) => {
    const navigate = useNavigate();
    const primaryImage = room.images?.[0];

    return (
        <div
            className="group cursor-pointer border border-[#c9a84c]/20 hover:border-[#c9a84c]/60 transition-all duration-300 overflow-hidden"
            onClick={() => navigate(`/rooms/${room.slug}`)}
        >
            <div className="relative h-56 overflow-hidden bg-[#1e293b]">
                {primaryImage ? (
                    <img
                        src={primaryImage.image_url}
                        alt={primaryImage.alt_text || room.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#b8afa3] text-sm tracking-widest uppercase">
                        No Image
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />
            </div>
            <div className="p-6">
                <h3 className="font-['Playfair_Display'] text-xl text-[#f1ece3] mb-2">{room.title}</h3>
                <p className="text-[#b8afa3] text-sm leading-relaxed line-clamp-2 mb-4">
                    {room.description || 'An immersive escape room experience awaits.'}
                </p>
                <div className="flex items-center justify-between text-xs tracking-widest uppercase text-[#b8afa3]">
                    <span>{room.min_capacity}–{room.max_capacity} players</span>
                    <span>{room.duration} min</span>
                </div>
            </div>
        </div>
    );
};

const CustomerHomePage = () => {
    const [rooms, setRooms] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/rooms/`);
                if (!res.ok) return;
                const data = await res.json();

                const roomsWithImages = await Promise.all(
                    data.slice(0, 3).map(async (room) => {
                        const imgRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}api/rooms/${room.id}/images`);
                        const images = imgRes.ok ? await imgRes.json() : [];
                        return { ...room, images };
                    })
                );
                setRooms(roomsWithImages);
            } catch (err) {
                console.error('Error fetching rooms:', err);
            }
        };
        fetchRooms();
    }, []);

    return (
        <CustomerLayout>
            {/* Hero */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('https://picsum.photos/seed/darkroom/1920/1080')` }}
                />
                <div className="absolute inset-0 bg-[#0f172a]/80" />
                <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
                    <img src={logo} alt="The Escapeway Collective" className="h-24 md:h-32 mx-auto mb-8" />
                    <p className="text-[#b8afa3] text-sm md:text-base tracking-[0.3em] uppercase mb-6">
                        Can you escape in time?
                    </p>
                    <p className="text-[#f1ece3] text-lg md:text-xl font-light leading-relaxed mb-10">
                        Immersive escape room experiences for thrill-seekers, puzzle-lovers, and adventurous groups.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/rooms')}
                            className="px-10 py-4 bg-[#c9a84c] hover:bg-[#b8972f] text-[#0f172a] font-semibold tracking-widest uppercase text-sm transition-colors"
                        >
                            Book Now
                        </button>
                        <button
                            onClick={() => navigate('/rooms')}
                            className="px-10 py-4 border border-[#c9a84c]/50 hover:border-[#c9a84c] text-[#f1ece3] tracking-widest uppercase text-sm transition-colors"
                        >
                            Explore Rooms
                        </button>
                    </div>
                </div>
                {/* Scroll indicator */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#b8afa3]">
                    <span className="text-xs tracking-widest uppercase">Scroll</span>
                    <div className="w-px h-10 bg-gradient-to-b from-[#c9a84c] to-transparent" />
                </div>
            </section>

            {/* Featured rooms */}
            {rooms.length > 0 && (
                <section className="max-w-6xl mx-auto px-6 py-24">
                    <div className="text-center mb-16">
                        <p className="text-[#c9a84c] text-xs tracking-[0.4em] uppercase mb-4">The Experiences</p>
                        <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#f1ece3]">Choose Your Adventure</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {rooms.map(room => <RoomCard key={room.id} room={room} />)}
                    </div>
                    <div className="text-center mt-12">
                        <button
                            onClick={() => navigate('/rooms')}
                            className="px-8 py-3 border border-[#c9a84c]/40 hover:border-[#c9a84c] text-[#f1ece3] text-sm tracking-widest uppercase transition-colors"
                        >
                            View All Rooms
                        </button>
                    </div>
                </section>
            )}

            {/* Why us */}
            <section className="bg-[#1e293b] py-24">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <p className="text-[#c9a84c] text-xs tracking-[0.4em] uppercase mb-4">The Experience</p>
                        <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#f1ece3]">Why The Escapeway Collective</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
                        {[
                            { title: 'Immersive Design', desc: 'Every room is meticulously crafted to pull you into another world from the moment you step inside.' },
                            { title: 'Original Stories', desc: 'No generic puzzles here. Each experience is built around an original narrative written for The Escapeway Collective.' },
                            { title: 'All Skill Levels', desc: "From first-timers to seasoned escape artists — our rooms are designed to challenge and delight everyone." },
                        ].map(({ title, desc }) => (
                            <div key={title} className="p-8 border border-[#c9a84c]/20">
                                <div className="w-8 h-px bg-[#c9a84c] mx-auto mb-6" />
                                <h3 className="font-['Playfair_Display'] text-lg text-[#f1ece3] mb-4">{title}</h3>
                                <p className="text-[#b8afa3] text-sm leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA banner */}
            <section className="max-w-6xl mx-auto px-6 py-24 text-center">
                <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#f1ece3] mb-6">Ready to Test Your Limits?</h2>
                <p className="text-[#b8afa3] mb-10 max-w-xl mx-auto leading-relaxed">
                    Gather your team, pick your room, and see if you have what it takes to escape.
                </p>
                <button
                    onClick={() => navigate('/rooms')}
                    className="px-12 py-4 bg-[#c9a84c] hover:bg-[#b8972f] text-[#0f172a] font-semibold tracking-widest uppercase text-sm transition-colors"
                >
                    Book Your Experience
                </button>
            </section>
        </CustomerLayout>
    );
};

export default CustomerHomePage;
