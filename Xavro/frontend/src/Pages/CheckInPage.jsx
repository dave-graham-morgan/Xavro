import React, { useState, useEffect, useCallback } from 'react';
import { authFetch } from '../utils/authFetch';

const API = import.meta.env.VITE_API_BASE_URL;

const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
});

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convert minutes-since-midnight integer to display string, e.g. 660 → "11:00 AM" */
function minutesToDisplay(mins) {
    const h24 = Math.floor(mins / 60);
    const m   = mins % 60;
    const period = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
}

function groupBookings(bookings) {
    // { [timeslot_int]: { [room_name]: booking[] } }
    return bookings.reduce((acc, b) => {
        const ts = b.show_timeslot;
        if (!acc[ts]) acc[ts] = {};
        if (!acc[ts][b.room_name]) acc[ts][b.room_name] = [];
        acc[ts][b.room_name].push(b);
        return acc;
    }, {});
}

function elapsedDisplay(startedAt, now) {
    const secs = Math.max(0, Math.floor((now - startedAt) / 1000));
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

// ── Small badges ──────────────────────────────────────────────────────────────

const WaiverBadge = ({ signed, total }) => {
    const all  = signed === total;
    const none = signed === 0;
    return (
        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
            all  ? 'bg-green-100 text-green-700' :
            none ? 'bg-red-100 text-red-700' :
                   'bg-amber-100 text-amber-700'
        }`}>
            {all  && <Checkmark />}
            {none && <Cross />}
            {!all && !none && <Warn />}
            {all ? `Waivers ${signed}/${total}` : none ? 'No waivers' : `${signed}/${total} waivers`}
        </span>
    );
};

const PayBadge = ({ paid }) => (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${paid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {paid ? <Checkmark /> : <Cross />}
        {paid ? 'Paid' : 'Unpaid'}
    </span>
);

const Checkmark = () => (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);
const Cross = () => (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
const Warn = () => (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>
);

// ── Booking card ──────────────────────────────────────────────────────────────

const BookingCard = ({ booking, onCheckIn }) => {
    const { customer_name, guest_count, waivers_signed, paid, status } = booking;
    const hasIssues = !paid || waivers_signed < guest_count;

    return (
        <div className={`px-4 py-3 ${status === 'completed' ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-sm font-semibold text-slate-800">{customer_name}</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
                            {guest_count}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        <WaiverBadge signed={waivers_signed} total={guest_count} />
                        <PayBadge paid={paid} />
                        {status === 'checked_in' && (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">
                                <Checkmark /> Checked In
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex-shrink-0 pt-0.5">
                    {(status === 'confirmed' || status === 'pending') && (
                        <button
                            onClick={onCheckIn}
                            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap ${
                                hasIssues
                                    ? 'bg-amber-50 border border-amber-300 text-amber-700 hover:bg-amber-100'
                                    : 'bg-[#c9a84c] hover:bg-[#b8972f] text-[#0f172a]'
                            }`}
                        >
                            {hasIssues ? '⚠ Check In' : 'Check In'}
                        </button>
                    )}
                    {status === 'checked_in' && (
                        <span className="text-xs text-blue-600 font-medium">✓ Ready</span>
                    )}
                    {status === 'in_progress' && (
                        <span className="text-xs text-blue-500 font-medium">In Room</span>
                    )}
                    {status === 'completed' && (
                        <span className="text-xs text-slate-400 font-medium">Done</span>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── Main page ─────────────────────────────────────────────────────────────────

const CheckInPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);
    // timers: { [`${timeslot}|${room_name}`]: Date } — seeded from started_at on load
    const [timers, setTimers]     = useState({});
    const [now, setNow]           = useState(new Date());

    // Check-in modal
    const [ciBooking, setCiBooking] = useState(null);
    const [ciWaivers, setCiWaivers] = useState([]);
    const [ciPayment, setCiPayment] = useState(false);

    // Completion modal
    const [compKey, setCompKey]         = useState(null); // `${timeslot}|${room_name}`
    const [escaped, setEscaped]         = useState(null);
    const [compMinutes, setCompMinutes] = useState('');

    // Clock tick
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    // Load today's bookings
    const loadBookings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await authFetch(`${API}api/checkin/today`);
            if (!res.ok) throw new Error('Failed to load schedule');
            const data = await res.json();
            setBookings(data);

            // Seed timers from started_at for any in-progress sessions
            const seedTimers = {};
            for (const b of data) {
                if (b.status === 'in_progress' && b.started_at) {
                    const key = `${b.show_timeslot}|${b.room_name}`;
                    if (!seedTimers[key]) {
                        seedTimers[key] = new Date(b.started_at + 'Z'); // UTC ISO string
                    }
                }
            }
            setTimers(seedTimers);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadBookings(); }, [loadBookings]);

    // ── Actions ───────────────────────────────────────────────────────────────

    const openCheckIn = (booking) => {
        setCiBooking(booking);
        setCiWaivers(Array.from({ length: booking.guest_count }, (_, i) => i < booking.waivers_signed));
        setCiPayment(booking.paid);
    };

    const confirmCheckIn = async () => {
        try {
            const res = await authFetch(`${API}api/checkin/bookings/${ciBooking.id}/checkin`, {
                method: 'POST',
            });
            if (!res.ok) throw new Error('Check-in failed');
            const updated = await res.json();
            setBookings(bs => bs.map(b => b.id === updated.id ? updated : b));
            setCiBooking(null);
        } catch (e) {
            alert(e.message);
        }
    };

    const startRoom = async (timeslot, roomName, showDate) => {
        try {
            const res = await authFetch(`${API}api/checkin/session/start`, {
                method: 'POST',
                body: JSON.stringify({ room_id: getRoomId(timeslot, roomName), show_date: showDate, show_timeslot: timeslot }),
            });
            if (!res.ok) throw new Error('Failed to start session');
            const data = await res.json();
            const startedAt = new Date(data.started_at + 'Z');
            const key = `${timeslot}|${roomName}`;
            setTimers(t => ({ ...t, [key]: startedAt }));
            setBookings(bs => bs.map(b =>
                b.show_timeslot === timeslot && b.room_name === roomName && b.status !== 'completed'
                    ? { ...b, status: 'in_progress', started_at: data.started_at }
                    : b
            ));
        } catch (e) {
            alert(e.message);
        }
    };

    const openCompletion = (timeslot, roomName) => {
        const key = `${timeslot}|${roomName}`;
        const elapsedMins = timers[key] ? Math.floor((now - timers[key]) / 60000) : '';
        setCompKey(key);
        setEscaped(null);
        setCompMinutes(String(elapsedMins));
    };

    const saveCompletion = async () => {
        const [timeslotStr, roomName] = compKey.split('|');
        const timeslot = parseInt(timeslotStr);
        const showDate = bookings.find(b => b.show_timeslot === timeslot && b.room_name === roomName)?.show_date;
        const roomId   = getRoomId(timeslot, roomName);
        try {
            const res = await authFetch(`${API}api/checkin/session/complete`, {
                method: 'POST',
                body: JSON.stringify({
                    room_id: roomId,
                    show_date: showDate,
                    show_timeslot: timeslot,
                    escaped,
                    duration_minutes: parseInt(compMinutes) || null,
                }),
            });
            if (!res.ok) throw new Error('Failed to record completion');
            setBookings(bs => bs.map(b =>
                b.show_timeslot === timeslot && b.room_name === roomName && b.status === 'in_progress'
                    ? { ...b, status: 'completed' }
                    : b
            ));
            setCompKey(null);
        } catch (e) {
            alert(e.message);
        }
    };

    // Helper: get room_id from any booking in the group
    const getRoomId = (timeslot, roomName) => {
        return bookings.find(b => b.show_timeslot === timeslot && b.room_name === roomName)?.room_id;
    };

    // ── Grouping ──────────────────────────────────────────────────────────────

    const grouped   = groupBookings(bookings);
    const timeslots = Object.keys(grouped).map(Number).sort((a, b) => a - b);

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800">Check-In</h1>
                    <p className="text-sm text-slate-500 mt-0.5">{todayLabel}</p>
                </div>
                <button
                    onClick={loadBookings}
                    className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-800 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-full transition-colors"
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                    </svg>
                    Refresh
                </button>
            </div>

            {loading && (
                <div className="text-center py-16 text-slate-400 text-sm">Loading today's schedule…</div>
            )}

            {error && (
                <div className="text-center py-8 text-red-500 text-sm">{error}</div>
            )}

            {!loading && !error && bookings.length === 0 && (
                <div className="text-center py-16 text-slate-400 text-sm">No bookings for today.</div>
            )}

            {/* Timeline */}
            {!loading && !error && (
                <div className="space-y-8">
                    {timeslots.map(timeslot => {
                        const rooms = grouped[timeslot];
                        const allCompleted = Object.values(rooms).every(bks =>
                            bks.every(b => b.status === 'completed')
                        );
                        const showDate = Object.values(rooms)[0][0].show_date;

                        return (
                            <div key={timeslot}>
                                {/* Timeslot divider */}
                                <div className="flex items-center gap-3 mb-4">
                                    <span className={`text-sm font-bold px-3 py-1 rounded-full shrink-0 ${
                                        allCompleted
                                            ? 'bg-slate-100 text-slate-400'
                                            : 'bg-[#0f172a] text-[#c9a84c]'
                                    }`}>
                                        {minutesToDisplay(timeslot)}
                                    </span>
                                    <div className="flex-1 h-px bg-slate-200" />
                                    {allCompleted && (
                                        <span className="text-xs text-slate-400 font-medium uppercase tracking-widest shrink-0">Done</span>
                                    )}
                                </div>

                                {/* Room columns */}
                                <div className={`grid gap-4 ${Object.keys(rooms).length > 1 ? 'md:grid-cols-2' : 'max-w-lg'}`}>
                                    {Object.entries(rooms).map(([roomName, roomBookings]) => {
                                        const key = `${timeslot}|${roomName}`;
                                        const isRunning   = roomBookings.some(b => b.status === 'in_progress');
                                        const allDone     = roomBookings.every(b => b.status === 'completed');
                                        const canStart    = !isRunning && !allDone && roomBookings.some(b => b.status === 'checked_in');
                                        const notCheckedIn = roomBookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length;
                                        const totalGuests  = roomBookings.reduce((s, b) => s + b.guest_count, 0);

                                        return (
                                            <div key={roomName} className={`rounded-xl border overflow-hidden ${
                                                allDone    ? 'border-slate-100 bg-slate-50/80' :
                                                isRunning  ? 'border-blue-200 bg-white shadow-sm shadow-blue-100' :
                                                             'border-slate-200 bg-white shadow-sm'
                                            }`}>
                                                {/* Room header bar */}
                                                <div className={`px-4 py-3 flex items-center justify-between ${
                                                    allDone   ? 'bg-slate-100' :
                                                    isRunning ? 'bg-blue-600' :
                                                                'bg-[#0f172a]'
                                                }`}>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-semibold text-sm ${allDone ? 'text-slate-400' : 'text-[#c9a84c]'}`}>
                                                            {roomName}
                                                        </span>
                                                        <span className={`text-xs ${allDone ? 'text-slate-400' : isRunning ? 'text-blue-200' : 'text-slate-500'}`}>
                                                            · {totalGuests} guest{totalGuests !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>

                                                    {/* Room-level controls */}
                                                    <div className="flex items-center gap-3">
                                                        {isRunning && timers[key] && (
                                                            <>
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                                                    <span className="font-mono text-sm font-bold text-white tabular-nums">
                                                                        {elapsedDisplay(timers[key], now)}
                                                                    </span>
                                                                </div>
                                                                <button
                                                                    onClick={() => openCompletion(timeslot, roomName)}
                                                                    className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold rounded transition-colors"
                                                                >
                                                                    End Room
                                                                </button>
                                                            </>
                                                        )}

                                                        {canStart && (
                                                            <div className="flex items-center gap-2">
                                                                {notCheckedIn > 0 && (
                                                                    <span className="text-xs text-amber-300">
                                                                        {notCheckedIn} not checked in
                                                                    </span>
                                                                )}
                                                                <button
                                                                    onClick={() => startRoom(timeslot, roomName, showDate)}
                                                                    className="px-3 py-1 bg-[#c9a84c] hover:bg-[#b8972f] text-[#0f172a] text-xs font-semibold rounded transition-colors"
                                                                >
                                                                    Start Room
                                                                </button>
                                                            </div>
                                                        )}

                                                        {allDone && (
                                                            <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Complete</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Individual booking cards */}
                                                <div className="divide-y divide-slate-100">
                                                    {roomBookings.map(booking => (
                                                        <BookingCard
                                                            key={booking.id}
                                                            booking={booking}
                                                            onCheckIn={() => openCheckIn(booking)}
                                                        />
                                                    ))}
                                                </div>

                                                {/* Split-payment hint */}
                                                {roomBookings.length > 1 && !allDone && (
                                                    <div className="px-4 py-2 border-t border-slate-100 bg-slate-50">
                                                        <p className="text-xs text-slate-400">
                                                            {roomBookings.length} separate parties · {totalGuests} guests total
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Check-In Modal ─────────────────────────────────────────────── */}
            {ciBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCiBooking(null)} />
                    <div className="relative bg-[#1e293b] rounded-xl border border-[#c9a84c]/20 shadow-2xl w-full max-w-md p-8">
                        <button onClick={() => setCiBooking(null)} className="absolute top-4 right-4 text-[#b8afa3] hover:text-[#f1ece3] transition-colors">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>

                        <h2 className="text-lg font-semibold text-[#f1ece3] mb-0.5">Check In</h2>
                        <p className="text-sm text-[#b8afa3] mb-6">{ciBooking.customer_name} · {ciBooking.room_name}</p>

                        {/* Waiver checklist */}
                        <div className="mb-5">
                            <p className="text-xs font-semibold text-[#b8afa3] uppercase tracking-widest mb-3">Waivers</p>
                            <div className="space-y-2.5">
                                {ciWaivers.map((signed, i) => (
                                    <label key={i} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={signed}
                                            onChange={e => {
                                                const next = [...ciWaivers];
                                                next[i] = e.target.checked;
                                                setCiWaivers(next);
                                            }}
                                            className="w-4 h-4 rounded border-slate-600 accent-[#c9a84c]"
                                        />
                                        <span className="text-sm text-[#f1ece3] flex-1">Guest {i + 1}</span>
                                        {signed
                                            ? <span className="text-xs text-green-400 font-medium">Signed ✓</span>
                                            : <span className="text-xs text-red-400 font-medium">Missing</span>
                                        }
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Payment */}
                        <div className="mb-6">
                            <p className="text-xs font-semibold text-[#b8afa3] uppercase tracking-widest mb-3">Payment</p>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={ciPayment}
                                    onChange={e => setCiPayment(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-600 accent-[#c9a84c]"
                                />
                                <span className="text-sm text-[#f1ece3] flex-1">Payment confirmed</span>
                                {ciPayment
                                    ? <span className="text-xs text-green-400 font-medium">Paid ✓</span>
                                    : <span className="text-xs text-red-400 font-medium">Not paid</span>
                                }
                            </label>
                        </div>

                        {/* Warning banner */}
                        {(!ciPayment || ciWaivers.some(w => !w)) && (
                            <div className="mb-5 px-3 py-2.5 bg-amber-900/30 border border-amber-600/40 rounded-lg">
                                <p className="text-xs text-amber-300 leading-relaxed">
                                    {!ciPayment && ciWaivers.some(w => !w)
                                        ? 'Payment unconfirmed and waivers incomplete. You may still proceed.'
                                        : !ciPayment
                                        ? 'Payment not confirmed. You may still proceed.'
                                        : 'Not all waivers signed. You may still proceed.'}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button onClick={() => setCiBooking(null)}
                                className="flex-1 py-2.5 border border-[#c9a84c]/30 text-[#b8afa3] text-sm rounded hover:border-[#c9a84c]/60 transition-colors">
                                Cancel
                            </button>
                            <button onClick={confirmCheckIn}
                                className="flex-1 py-2.5 bg-[#c9a84c] hover:bg-[#b8972f] text-[#0f172a] text-sm font-semibold rounded transition-colors">
                                Confirm Check-In
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Completion Modal ──────────────────────────────────────────── */}
            {compKey && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCompKey(null)} />
                    <div className="relative bg-[#1e293b] rounded-xl border border-[#c9a84c]/20 shadow-2xl w-full max-w-sm p-8">
                        <button onClick={() => setCompKey(null)} className="absolute top-4 right-4 text-[#b8afa3] hover:text-[#f1ece3] transition-colors">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>

                        <h2 className="text-lg font-semibold text-[#f1ece3] mb-0.5">Record Completion</h2>
                        <p className="text-sm text-[#b8afa3] mb-6">
                            {compKey.split('|')[1]} · {minutesToDisplay(parseInt(compKey.split('|')[0]))}
                        </p>

                        {/* Result buttons */}
                        <div className="mb-6">
                            <p className="text-xs font-semibold text-[#b8afa3] uppercase tracking-widest mb-3">Did they escape?</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setEscaped(true)}
                                    className={`py-5 rounded-xl text-sm font-semibold border-2 transition-all ${
                                        escaped === true
                                            ? 'border-green-500 bg-green-500/15 text-green-400 scale-[1.02]'
                                            : 'border-slate-600 text-slate-400 hover:border-slate-500'
                                    }`}
                                >
                                    <div className="text-2xl mb-1">🎉</div>
                                    Escaped!
                                </button>
                                <button
                                    onClick={() => setEscaped(false)}
                                    className={`py-5 rounded-xl text-sm font-semibold border-2 transition-all ${
                                        escaped === false
                                            ? 'border-red-500 bg-red-500/15 text-red-400 scale-[1.02]'
                                            : 'border-slate-600 text-slate-400 hover:border-slate-500'
                                    }`}
                                >
                                    <div className="text-2xl mb-1">🔒</div>
                                    Did Not Escape
                                </button>
                            </div>
                        </div>

                        {/* Duration */}
                        <div className="mb-6">
                            <label className="text-xs font-semibold text-[#b8afa3] uppercase tracking-widest block mb-2">
                                Time taken (minutes)
                                <span className="ml-1 normal-case font-normal text-[#b8afa3]/60">— pre-filled from timer</span>
                            </label>
                            <input
                                type="number"
                                value={compMinutes}
                                onChange={e => setCompMinutes(e.target.value)}
                                min="1"
                                max="120"
                                className="w-full px-3 py-2.5 bg-[#0f172a] border border-[#c9a84c]/20 rounded-md text-[#f1ece3] text-sm focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40"
                                placeholder="e.g. 52"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setCompKey(null)}
                                className="flex-1 py-2.5 border border-[#c9a84c]/30 text-[#b8afa3] text-sm rounded hover:border-[#c9a84c]/60 transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={saveCompletion}
                                disabled={escaped === null}
                                className="flex-1 py-2.5 bg-[#c9a84c] hover:bg-[#b8972f] text-[#0f172a] text-sm font-semibold rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckInPage;
