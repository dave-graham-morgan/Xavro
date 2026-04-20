import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { authFetch } from '../../utils/authFetch';

const API = import.meta.env.VITE_API_BASE_URL;
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const CONFLICT_THRESHOLD = parseInt(import.meta.env.VITE_CONFLICT_THRESHOLD_MINUTES) || 5;

let nextRowId = 1;

// ── Time helpers ──────────────────────────────────────────────────────────────

function toMins(str) {
    if (!str) return 0;
    const [h, m] = str.split(':').map(Number);
    return h * 60 + m;
}

function minsToInput(mins) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function inputToDisplay(str) {
    if (!str) return '';
    const [h, m] = str.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
}

/** Returns { display, mins }[] */
function computeSlots(startTime, endTime, intervalMins, durationMins) {
    if (!startTime || !endTime || !intervalMins || !durationMins) return [];
    const start   = toMins(startTime);
    const closing = toMins(endTime);
    const slots   = [];
    let cur = start;
    while (cur + durationMins <= closing) {
        slots.push({ display: inputToDisplay(minsToInput(cur)), mins: cur });
        cur += intervalMins;
    }
    return slots;
}

function lastSlotToEndTime(lastSlotInput, durationMins) {
    if (!lastSlotInput || !durationMins) return lastSlotInput;
    return minsToInput(toMins(lastSlotInput) + durationMins);
}

function endTimeToLastSlot(endTimeStr, durationMins) {
    if (!endTimeStr || !durationMins) return endTimeStr ? endTimeStr.slice(0, 5) : '';
    return minsToInput(toMins(endTimeStr.slice(0, 5)) - durationMins);
}

function showtimesToRows(showtimes, durationMins) {
    const groups = {};
    for (const st of showtimes) {
        const start = st.start_time.slice(0, 5);
        const end   = st.end_time.slice(0, 5);
        const key   = `${start}|${end}`;
        if (!groups[key]) groups[key] = { startTime: start, lastSlot: endTimeToLastSlot(end, durationMins), days: [] };
        groups[key].days.push(st.day_of_week);
    }
    return Object.values(groups).map(g => ({ id: nextRowId++, ...g }));
}

/** Do two time windows [s1,e1) and [s2,e2) overlap? */
function windowsOverlap(s1, e1, s2, e2) {
    return s1 < e2 && s2 < e1;
}

// ── Slot preview strip ────────────────────────────────────────────────────────

/** slots: { display, mins }[]   collisionMins: Set<number> */
const SlotStrip = ({ slots, collisionMins = new Set(), label }) => (
    <div className="flex flex-wrap gap-1.5 items-center">
        {label && <span className="text-xs text-slate-400 font-medium mr-0.5">{label}</span>}
        {slots.map((s, i) => {
            const isConflict = collisionMins.has(s.mins);
            return (
                <span
                    key={i}
                    title={isConflict ? `Starts within ${CONFLICT_THRESHOLD} min of another room` : undefined}
                    className={`text-xs px-2 py-0.5 rounded-full font-medium tabular-nums ${
                        isConflict
                            ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-300'
                            : 'bg-slate-100 text-slate-600'
                    }`}
                >
                    {isConflict && '⚠ '}{s.display}
                </span>
            );
        })}
    </div>
);

// ── Other rooms stagger panel ─────────────────────────────────────────────────

const OtherRoomsPanel = ({ currentRoomId, selectedDays, currentSlotsByDay, onConflictsChange }) => {
    const [others, setOthers] = useState([]);

    const depsKey = JSON.stringify({ selectedDays: [...selectedDays].sort(), currentSlotsByDay });

    const load = useCallback(async () => {
        if (!selectedDays.length) {
            setOthers([]);
            onConflictsChange({});
            return;
        }
        try {
            const roomsRes = await fetch(`${API}api/rooms`);
            const rooms    = await roomsRes.json();
            const peers    = rooms.filter(r => String(r.id) !== String(currentRoomId));

            const results = await Promise.all(peers.map(async room => {
                const stRes = await fetch(`${API}api/rooms/${room.id}/showtimes`);
                const sts   = await stRes.json();
                const relevant = sts.filter(st => selectedDays.includes(st.day_of_week));
                if (!relevant.length) return null;

                const groups = {};
                for (const st of relevant) {
                    const key = `${st.start_time.slice(0, 5)}|${st.end_time.slice(0, 5)}`;
                    if (!groups[key]) groups[key] = {
                        startTime: st.start_time.slice(0, 5),
                        endTime:   st.end_time.slice(0, 5),
                        days:      [],
                    };
                    groups[key].days.push(st.day_of_week);
                }

                // Always derive interval from the room's current duration + reset_buffer
                // so stale interval_minutes on showtime records don't cause wrong slot counts.
                const intervalMins = room.duration + room.reset_buffer;

                const scheduleGroups = Object.values(groups).map(g => {
                    const slots = computeSlots(g.startTime, g.endTime, intervalMins, room.duration);
                    const collisionMins = new Set();
                    for (const day of g.days) {
                        const mySlotMins = currentSlotsByDay[day] || [];
                        for (const s of slots) {
                            if (mySlotMins.some(m => Math.abs(m - s.mins) <= CONFLICT_THRESHOLD)) {
                                collisionMins.add(s.mins);
                            }
                        }
                    }
                    return { days: g.days, slots, collisionMins };
                });

                const hasCollision = scheduleGroups.some(g => g.collisionMins.size > 0);
                return { id: room.id, name: room.title, scheduleGroups, hasCollision };
            }));

            const valid = results.filter(Boolean);
            setOthers(valid);

            // Tell parent which of its OWN slot minutes are in conflict
            const myConflicts = {};
            for (const room of valid) {
                for (const g of room.scheduleGroups) {
                    for (const day of g.days) {
                        const myMins = currentSlotsByDay[day] || [];
                        for (const myMin of myMins) {
                            if (g.slots.some(s => Math.abs(s.mins - myMin) <= CONFLICT_THRESHOLD)) {
                                if (!myConflicts[day]) myConflicts[day] = new Set();
                                myConflicts[day].add(myMin);
                            }
                        }
                    }
                }
            }
            onConflictsChange(myConflicts);
        } catch {
            setOthers([]);
            onConflictsChange({});
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [depsKey, currentRoomId]);

    useEffect(() => { load(); }, [load]);

    if (!others.length) return null;

    return (
        <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                Other rooms on these days — for staggering
            </p>
            <div className="space-y-3">
                {others.map(room => (
                    <div key={room.id} className={`rounded-lg p-3 ${room.hasCollision ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50 border border-slate-100'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-semibold text-slate-700">{room.name}</span>
                            {room.hasCollision && (
                                <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                                    ⚠ start time conflict
                                </span>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            {room.scheduleGroups.map((g, i) => (
                                <div key={i} className="flex items-start gap-2">
                                    <span className="text-xs text-slate-400 shrink-0 pt-0.5 w-24">
                                        {g.days.map(d => DAYS[d].slice(0, 2)).join(', ')}:
                                    </span>
                                    <SlotStrip slots={g.slots} collisionMins={g.collisionMins} />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ── Main component ────────────────────────────────────────────────────────────

const RoomScheduleEditor = ({ roomId, duration, resetBuffer }) => {
    const [rows, setRows]                 = useState([]);
    const [loading, setLoading]           = useState(true);
    const [saving, setSaving]             = useState(false);
    const [message, setMessage]           = useState(null);
    const [showExtra, setShowExtra]       = useState(false);
    // conflictMinsByDay: { [dayIdx]: Set<number> } — which of OUR slot minutes conflict with other rooms
    const [conflictMinsByDay, setConflictMinsByDay] = useState({});
    const [messageFading, setMessageFading] = useState(false);
    const [bookingWarning, setBookingWarning] = useState(null); // { count, bookings } when pending confirmation

    useEffect(() => {
        if (!message) { setMessageFading(false); return; }
        const fadeId  = setTimeout(() => setMessageFading(true),  2500);
        const clearId = setTimeout(() => { setMessage(null); setMessageFading(false); }, 3000);
        return () => { clearTimeout(fadeId); clearTimeout(clearId); };
    }, [message]);

    const durationMins = parseInt(duration)    || 0;
    const bufferMins   = parseInt(resetBuffer) || 0;
    const intervalMins = durationMins + bufferMins;

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res    = await fetch(`${API}api/rooms/${roomId}/showtimes`);
                const data   = await res.json();
                const loaded = showtimesToRows(data, durationMins);
                if (loaded.length > 0) {
                    setRows(loaded);
                    setShowExtra(loaded.length > 1);
                } else {
                    setRows([{ id: nextRowId++, days: [], startTime: '09:00', lastSlot: '17:00' }]);
                }
            } catch {
                setRows([{ id: nextRowId++, days: [], startTime: '09:00', lastSlot: '17:00' }]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [roomId]);

    const updateRow = (id, field, value) =>
        setRows(r => r.map(row => row.id === id ? { ...row, [field]: value } : row));

    const toggleDay = (rowId, dayIdx) => {
        setRows(r => r.map(row => {
            if (row.id !== rowId) return row;
            const days = row.days.includes(dayIdx)
                ? row.days.filter(d => d !== dayIdx)
                : [...row.days, dayIdx];
            return { ...row, days };
        }));
    };

    const addExtraRow = () => {
        setRows(r => [...r, { id: nextRowId++, days: [], startTime: '10:00', lastSlot: '22:00' }]);
        setShowExtra(true);
    };

    const removeRow = (id) => {
        const next = rows.filter(row => row.id !== id);
        setRows(next.length ? next : [{ id: nextRowId++, days: [], startTime: '09:00', lastSlot: '17:00' }]);
        if (next.length <= 1) setShowExtra(false);
    };

    const doSave = async () => {
        const payload = rows.flatMap(row =>
            row.days.map(day => ({
                day_of_week: day,
                start_time:  row.startTime,
                end_time:    lastSlotToEndTime(row.lastSlot, durationMins),
            }))
        );
        setSaving(true);
        setMessage(null);
        setBookingWarning(null);
        try {
            const res  = await authFetch(`${API}api/rooms/${roomId}/showtimes/bulk`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || 'Failed to save');
            setMessage({ type: 'success', text: 'Schedule saved.' });
        } catch (e) {
            setMessage({ type: 'error', text: e.message });
        } finally {
            setSaving(false);
        }
    };

    const save = async () => {
        try {
            const res      = await authFetch(`${API}api/rooms/${roomId}/future-bookings`);
            const bookings = await res.json();
            if (bookings.length > 0) {
                setBookingWarning({ count: bookings.length, bookings });
                return;
            }
        } catch {
            // If the check fails, proceed anyway
        }
        await doSave();
    };

    // currentSlotsByDay: { [dayIdx]: number[] } — slot minutes for each selected day
    const currentSlotsByDay = {};
    for (const row of rows) {
        const endTime = lastSlotToEndTime(row.lastSlot, durationMins);
        const slots   = computeSlots(row.startTime, endTime, intervalMins, durationMins);
        for (const day of row.days) {
            currentSlotsByDay[day] = slots.map(s => s.mins);
        }
    }

    const allSelectedDays = Object.keys(currentSlotsByDay).map(Number);

    // Detect overlapping time windows within the same day across rows
    const overlapWarnings = new Set(); // row ids that have an intra-room day overlap
    for (let i = 0; i < rows.length; i++) {
        for (let j = i + 1; j < rows.length; j++) {
            const sharedDays = rows[i].days.filter(d => rows[j].days.includes(d));
            if (!sharedDays.length) continue;
            const s1 = toMins(rows[i].startTime), e1 = toMins(lastSlotToEndTime(rows[i].lastSlot, durationMins));
            const s2 = toMins(rows[j].startTime), e2 = toMins(lastSlotToEndTime(rows[j].lastSlot, durationMins));
            if (windowsOverlap(s1, e1, s2, e2)) {
                overlapWarnings.add(rows[i].id);
                overlapWarnings.add(rows[j].id);
            }
        }
    }

    if (loading) return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 mt-6 p-6">
            <p className="text-sm text-slate-400">Loading schedule…</p>
        </div>
    );

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 mt-6">
            <div className="px-6 py-4 border-b border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800">Room Schedule</h2>
                {intervalMins > 0 && (
                    <p className="text-xs text-slate-400 mt-0.5">
                        {durationMins}m sessions + {bufferMins}m reset = slot every {intervalMins} min
                    </p>
                )}
            </div>

            <div className="p-6">
                {rows.slice(0, showExtra ? rows.length : 1).map((row, idx) => {
                    const endTime = lastSlotToEndTime(row.lastSlot, durationMins);
                    const slots   = computeSlots(row.startTime, endTime, intervalMins, durationMins);

                    // Build conflict set for this row's slots (union across all its days)
                    const rowConflictMins = new Set(
                        row.days.flatMap(day => [...(conflictMinsByDay[day] || [])])
                    );

                    const hasOverlap = overlapWarnings.has(row.id);

                    return (
                        <div key={row.id} className={idx > 0 ? 'mt-6 pt-6 border-t border-slate-100' : ''}>
                            {idx > 0 && (
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                                        {hasOverlap ? '⚠ Overlapping time window' : 'Different hours / break window'}
                                    </span>
                                    <button type="button" onClick={() => removeRow(row.id)}
                                        className="text-xs text-red-400 hover:text-red-600 transition-colors">
                                        Remove
                                    </button>
                                </div>
                            )}

                            {/* Day picker — same day allowed in multiple rows for break windows */}
                            <div className="mb-5">
                                <p className="text-sm font-medium text-slate-700 mb-2">Available days</p>
                                <div className="flex gap-2">
                                    {DAYS.map((day, i) => {
                                        const isSelected = row.days.includes(i);
                                        return (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => toggleDay(row.id, i)}
                                                className={`w-10 h-10 rounded-full text-xs font-semibold transition-colors ${
                                                    isSelected
                                                        ? 'bg-[#0f172a] text-[#c9a84c]'
                                                        : 'bg-white border border-slate-300 text-slate-500 hover:border-slate-400'
                                                }`}
                                            >
                                                {day.slice(0, 2)}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Time inputs */}
                            <div className="grid grid-cols-2 gap-4 mb-4 max-w-sm">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">First slot at</label>
                                    <input type="time" value={row.startTime}
                                        onChange={e => updateRow(row.id, 'startTime', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Last slot by</label>
                                    <input type="time" value={row.lastSlot}
                                        onChange={e => updateRow(row.id, 'lastSlot', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/50" />
                                </div>
                            </div>

                            {/* Overlap warning */}
                            {hasOverlap && (
                                <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                                    <p className="text-xs text-amber-700">
                                        ⚠ This window overlaps with another schedule on the same day. Adjust the times so they don't overlap.
                                    </p>
                                </div>
                            )}

                            {/* Slot preview */}
                            <div className={`rounded-lg border px-4 py-3 ${rowConflictMins.size > 0 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                                {!intervalMins ? (
                                    <p className="text-xs text-amber-500">Set duration and reset buffer on the room to preview slots.</p>
                                ) : slots.length === 0 ? (
                                    <p className="text-xs text-amber-500">No slots fit — try a later "Last slot by" time.</p>
                                ) : (
                                    <>
                                        <SlotStrip slots={slots} collisionMins={rowConflictMins} />
                                        <p className="text-xs text-slate-400 mt-1.5">
                                            {slots.length} slot{slots.length !== 1 ? 's' : ''} · last starts {slots[slots.length - 1].display}
                                            {rowConflictMins.size > 0 && (
                                                <span className="text-amber-600 ml-2">⚠ conflict with another room</span>
                                            )}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Other rooms stagger panel */}
                <OtherRoomsPanel
                    currentRoomId={roomId}
                    selectedDays={allSelectedDays}
                    currentSlotsByDay={currentSlotsByDay}
                    onConflictsChange={setConflictMinsByDay}
                />

                {/* Booking conflict warning */}
                {bookingWarning && (
                    <div className="mt-4 px-4 py-3 bg-amber-50 border border-amber-300 rounded-lg">
                        <p className="text-sm font-semibold text-amber-800 mb-1">
                            ⚠ This room has {bookingWarning.count} upcoming booking{bookingWarning.count !== 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-amber-700 mb-3">
                            Changing the schedule will not cancel them, but their timeslots may no longer align with the new schedule. Review those bookings before proceeding.
                        </p>
                        <Link
                            to={`/staff/bookings?room=${roomId}`}
                            className="inline-block text-xs text-amber-700 underline hover:text-amber-900 mb-3 transition-colors"
                        >
                            View affected bookings →
                        </Link>
                        <div className="flex gap-2">
                            <button type="button" onClick={doSave} disabled={saving}
                                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded transition-colors disabled:opacity-50">
                                {saving ? 'Saving…' : 'Save Anyway'}
                            </button>
                            <button type="button" onClick={() => setBookingWarning(null)}
                                className="px-3 py-1.5 border border-amber-300 text-amber-700 hover:bg-amber-100 text-xs font-semibold rounded transition-colors">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                    <button type="button" onClick={addExtraRow}
                        className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
                        + Add break or different hours
                    </button>
                    <div className="flex items-center gap-3">
                        {message && (
                            <span className={`text-sm transition-opacity duration-500 ${messageFading ? 'opacity-0' : 'opacity-100'} ${message.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                                {message.text}
                            </span>
                        )}
                        <button type="button" onClick={save} disabled={saving || !!bookingWarning}
                            className="px-4 py-2 bg-[#c9a84c] hover:bg-[#b8972f] text-[#0f172a] text-sm font-semibold rounded transition-colors disabled:opacity-50">
                            {saving ? 'Saving…' : 'Save Schedule'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomScheduleEditor;
