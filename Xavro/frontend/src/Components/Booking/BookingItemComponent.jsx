import React from 'react';

const BookingItemComponent = ({ roomName, startTime, endTime, showDate, isBooked, onBookNow }) => {
    const formattedShowDate = new Date(showDate).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <div className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
            isBooked
                ? 'bg-slate-800/40 border-slate-700 opacity-60'
                : 'bg-[#1e293b]/80 border-[#c9a84c]/20 hover:border-[#c9a84c]/40'
        }`}>
            <div>
                <p className="text-sm font-medium text-[#f1ece3]">{startTime} – {endTime}</p>
                <p className="text-xs text-[#b8afa3] mt-0.5">{formattedShowDate}</p>
            </div>
            <button
                onClick={onBookNow}
                disabled={isBooked}
                className={`px-4 py-1.5 text-xs font-semibold tracking-wider uppercase rounded transition-colors ${
                    isBooked
                        ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                        : 'bg-[#c9a84c] hover:bg-[#b8972f] text-[#0f172a]'
                }`}
            >
                {isBooked ? 'Booked' : 'Book Now'}
            </button>
        </div>
    );
};

export default BookingItemComponent;
