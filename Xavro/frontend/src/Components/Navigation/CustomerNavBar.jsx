import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.jpg';
import { useAuth } from '../../context/AuthContext';

const CustomerNavBar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { token, role, logout } = useAuth();

    const handleLogout = () => {
        logout();
        setMenuOpen(false);
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a]/95 backdrop-blur-sm border-b border-[#c9a84c]/20">
            <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-20">

                {/* Logo */}
                <NavLink to="/" onClick={() => setMenuOpen(false)}>
                    <img src={logo} alt="The Escapeway Collective" className="h-12 w-auto" />
                </NavLink>

                {/* Desktop nav */}
                <div className="hidden md:flex items-center gap-8">
                    <NavLink
                        to="/rooms"
                        className={({ isActive }) =>
                            `text-sm font-medium tracking-widest uppercase transition-colors ${
                                isActive ? 'text-[#c9a84c]' : 'text-[#f1ece3] hover:text-[#c9a84c]'
                            }`
                        }
                    >
                        Rooms
                    </NavLink>
                    <NavLink
                        to="/team-building"
                        className={({ isActive }) =>
                            `text-sm font-medium tracking-widest uppercase transition-colors ${
                                isActive ? 'text-[#c9a84c]' : 'text-[#f1ece3] hover:text-[#c9a84c]'
                            }`
                        }
                    >
                        Team Building
                    </NavLink>
                    <button
                        onClick={() => navigate('/rooms')}
                        className="ml-4 px-6 py-2.5 bg-[#c9a84c] hover:bg-[#b8972f] text-[#0f172a] text-sm font-semibold tracking-widest uppercase transition-colors"
                    >
                        Book Now
                    </button>

                    {/* Staff indicator */}
                    {token && (
                        <div className="flex items-center gap-3 ml-2 pl-6 border-l border-[#c9a84c]/30">
                            <button
                                onClick={() => navigate('/staff/rooms')}
                                title={`Logged in as ${role}`}
                                className="text-[#c9a84c] hover:text-[#b8972f] transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                                </svg>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="text-xs tracking-widest uppercase text-[#b8afa3] hover:text-[#f1ece3] transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>

                {/* Mobile hamburger */}
                <button
                    className="md:hidden text-[#f1ece3] p-2"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <div className={`w-6 h-0.5 bg-current mb-1.5 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                    <div className={`w-6 h-0.5 bg-current mb-1.5 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
                    <div className={`w-6 h-0.5 bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </button>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden bg-[#0f172a] border-t border-[#c9a84c]/20 px-6 py-6 flex flex-col gap-6">
                    <NavLink to="/rooms" className="text-[#f1ece3] text-sm tracking-widest uppercase" onClick={() => setMenuOpen(false)}>Rooms</NavLink>
                    <NavLink to="/team-building" className="text-[#f1ece3] text-sm tracking-widest uppercase" onClick={() => setMenuOpen(false)}>Team Building</NavLink>
                    <button
                        onClick={() => { navigate('/rooms'); setMenuOpen(false); }}
                        className="w-full py-3 bg-[#c9a84c] text-[#0f172a] text-sm font-semibold tracking-widest uppercase"
                    >
                        Book Now
                    </button>
                    {token && (
                        <div className="flex items-center justify-between border-t border-[#c9a84c]/20 pt-4">
                            <button onClick={() => { navigate('/staff/rooms'); setMenuOpen(false); }} className="text-[#b8afa3] text-xs tracking-widest uppercase">
                                Staff Portal ({role})
                            </button>
                            <button onClick={handleLogout} className="text-[#b8afa3] text-xs tracking-widest uppercase hover:text-[#f1ece3]">
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default CustomerNavBar;
