import React from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../Components/Navigation/NavBar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useInactivityTimeout } from '../utils/useInactivityTimeout.js';

const StaffLayout = ({ children }) => {
    const { role, logout } = useAuth();
    const navigate = useNavigate();
    const isAdmin = role === 'ADMIN';

    const handleLogout = () => {
        logout();
        navigate('/xavro');
    };

    const { showWarning, secondsLeft, stayLoggedIn } = useInactivityTimeout(isAdmin, handleLogout);

    return (
        <div className="min-h-screen bg-slate-50">
            <NavBar />
            <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
                {children}
            </div>

            {showWarning && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-[#1e293b] border border-[#c9a84c]/30 rounded-lg p-8 max-w-sm w-full mx-4 text-center shadow-2xl">
                        <div className="text-5xl font-bold text-[#c9a84c] mb-3">{secondsLeft}</div>
                        <h2 className="text-lg font-semibold text-[#f1ece3] mb-2">Still there?</h2>
                        <p className="text-[#b8afa3] text-sm mb-6">
                            You've been inactive for a while. For security, you'll be logged out in{' '}
                            <span className="text-[#f1ece3] font-medium">{secondsLeft} second{secondsLeft !== 1 ? 's' : ''}</span>.
                        </p>
                        <button
                            onClick={stayLoggedIn}
                            className="w-full py-2.5 bg-[#c9a84c] hover:bg-[#b8972f] text-[#0f172a] text-sm font-semibold tracking-widest uppercase transition-colors rounded"
                        >
                            Stay Logged In
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full mt-3 py-2 text-[#b8afa3] hover:text-[#f1ece3] text-sm transition-colors"
                        >
                            Logout now
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffLayout;
