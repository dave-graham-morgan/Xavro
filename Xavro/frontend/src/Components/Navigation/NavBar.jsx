import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NavBar = () => {
    const { token, role, logout } = useAuth();
    const navigate = useNavigate();

    const isEmployee = token && (role === 'EMPLOYEE' || role === 'ADMIN');
    const isAdmin = token && role === 'ADMIN';

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
                <NavLink to="/" className="text-[#0f172a] font-semibold text-lg tracking-wide">
                    Xavro
                </NavLink>

                <div className="flex items-center gap-6">
                    {isEmployee && (
                        <>
                            <NavLink
                                to="/staff/checkin"
                                className={({ isActive }) =>
                                    `text-sm font-medium transition-colors ${isActive ? 'text-[#c9a84c]' : 'text-slate-600 hover:text-slate-900'}`
                                }
                            >
                                Check-In
                            </NavLink>
                            <NavLink
                                to="/staff/rooms"
                                className={({ isActive }) =>
                                    `text-sm font-medium transition-colors ${isActive ? 'text-[#c9a84c]' : 'text-slate-600 hover:text-slate-900'}`
                                }
                            >
                                Rooms
                            </NavLink>
                            <NavLink
                                to="/staff/customers"
                                className={({ isActive }) =>
                                    `text-sm font-medium transition-colors ${isActive ? 'text-[#c9a84c]' : 'text-slate-600 hover:text-slate-900'}`
                                }
                            >
                                Customers
                            </NavLink>
                            <NavLink
                                to="/staff/bookings"
                                className={({ isActive }) =>
                                    `text-sm font-medium transition-colors ${isActive ? 'text-[#c9a84c]' : 'text-slate-600 hover:text-slate-900'}`
                                }
                            >
                                Bookings
                            </NavLink>
                            {isAdmin && (
                                <NavLink
                                    to="/staff/users"
                                    className={({ isActive }) =>
                                        `text-sm font-medium transition-colors ${isActive ? 'text-[#c9a84c]' : 'text-slate-600 hover:text-slate-900'}`
                                    }
                                >
                                    Users
                                </NavLink>
                            )}
                        </>
                    )}

                    {token ? (
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                            <NavLink
                                to="/staff/profile"
                                className={({ isActive }) =>
                                    `flex items-center gap-1.5 transition-colors ${isActive ? 'text-[#c9a84c]' : 'text-slate-500 hover:text-slate-800'}`
                                }
                                title="My Profile"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                                </svg>
                                <span className="text-xs">{role}</span>
                            </NavLink>
                            <button
                                onClick={handleLogout}
                                className="text-xs px-3 py-1.5 border border-slate-300 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <NavLink
                            to="/login"
                            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            Staff Login
                        </NavLink>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
