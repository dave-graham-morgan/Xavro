import React from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerLayout from '../layouts/CustomerLayout.jsx';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <CustomerLayout>
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-24">
                <p className="text-[#c9a84c] text-xs tracking-[0.4em] uppercase mb-6">Lost in the dark</p>
                <h1 className="font-['Playfair_Display'] text-[8rem] leading-none text-[#f1ece3]/10 select-none mb-2">
                    404
                </h1>
                <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl text-[#f1ece3] mb-4">
                    This room doesn't exist
                </h2>
                <p className="text-[#b8afa3] text-sm max-w-md leading-relaxed mb-10">
                    You've wandered somewhere that isn't on the map. The page you're looking for may have been moved, removed, or was never here to begin with.
                </p>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3 bg-[#c9a84c] hover:bg-[#b8972f] text-[#0f172a] text-sm font-semibold tracking-widest uppercase transition-colors"
                    >
                        Back to Safety
                    </button>
                    <button
                        onClick={() => navigate('/rooms')}
                        className="px-6 py-3 border border-[#c9a84c]/40 text-[#c9a84c] text-sm font-semibold tracking-widest uppercase hover:bg-[#c9a84c]/10 transition-colors"
                    >
                        View Rooms
                    </button>
                </div>
            </div>
        </CustomerLayout>
    );
};

export default NotFoundPage;
