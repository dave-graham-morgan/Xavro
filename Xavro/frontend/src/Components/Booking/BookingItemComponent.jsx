import React from 'react';

const fmt12 = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${period}`;
};

const BookingItemComponent = ({ roomName, startTime, endTime, showDate, isBooked, onBookNow }) => {
    // Determine if this slot is in the past
    const [h, m] = startTime.split(':').map(Number);
    const slotDate = new Date(showDate);
    slotDate.setHours(h, m, 0, 0);
    const isPast = slotDate < new Date();

    const label = fmt12(startTime) + ' – ' + fmt12(endTime);

    let containerClass, badgeClass, badgeLabel, showButton;
    if (isPast) {
        containerClass = 'bg-slate-900/40 border-slate-800 opacity-50 cursor-default';
        badgeClass = 'px-4 py-1.5 text-xs font-medium tracking-wider uppercase rounded bg-slate-800 text-slate-500 cursor-default';
        badgeLabel = 'Past';
        showButton = false;
    } else if (isBooked) {
        containerClass = 'bg-slate-800/40 border-slate-700 opacity-60';
        badgeClass = 'px-4 py-1.5 text-xs font-semibold tracking-wider uppercase rounded bg-slate-600 text-slate-400 cursor-not-allowed';
        badgeLabel = 'Booked';
        showButton = false;
    } else {
        containerClass = 'bg-[#1e293b]/80 border-[#c9a84c]/20 hover:border-[#c9a84c]/40';
        badgeClass = 'px-4 py-1.5 text-xs font-semibold tracking-wider uppercase rounded bg-[#c9a84c] hover:bg-[#b8972f] text-[#0f172a] transition-colors';
        badgeLabel = 'Book Now';
        showButton = true;
    }

    return (
        <div className={`flex items-center justify-between h-[60px] px-4 rounded-lg border ${containerClass}`}>
            <p className="text-sm font-medium text-[#f1ece3] whitespace-nowrap">{label}</p>
            {showButton ? (
                <button onClick={onBookNow} className={badgeClass}>{badgeLabel}</button>
            ) : (
                <span className={badgeClass}>{badgeLabel}</span>
            )}
        </div>
    );
};

export default BookingItemComponent;
