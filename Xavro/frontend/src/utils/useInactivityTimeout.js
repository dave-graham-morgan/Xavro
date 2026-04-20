import { useEffect, useRef, useState, useCallback } from 'react';

const INACTIVITY_MS  = 15 * 60 * 1000; // 15 minutes
const WARNING_MS     = 60 * 1000;       // show warning 60 s before logout

const EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];

export const useInactivityTimeout = (isAdmin, onLogout) => {
    const [showWarning, setShowWarning] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(60);

    const inactivityTimer  = useRef(null);
    const warningTimer     = useRef(null);
    const countdownTimer   = useRef(null);
    const showWarningRef   = useRef(false);  // mirror of showWarning, readable in callbacks
    const onLogoutRef      = useRef(onLogout);

    // Keep onLogoutRef current without re-running the effect
    useEffect(() => { onLogoutRef.current = onLogout; }, [onLogout]);

    const clearAll = useCallback(() => {
        clearTimeout(inactivityTimer.current);
        clearTimeout(warningTimer.current);
        clearInterval(countdownTimer.current);
    }, []);

    const resetTimer = useCallback(() => {
        if (!isAdmin) return;
        clearAll();
        setShowWarning(false);
        showWarningRef.current = false;

        inactivityTimer.current = setTimeout(() => {
            setShowWarning(true);
            showWarningRef.current = true;
            setSecondsLeft(WARNING_MS / 1000);

            countdownTimer.current = setInterval(() => {
                setSecondsLeft(s => s - 1);
            }, 1000);

            warningTimer.current = setTimeout(() => {
                clearInterval(countdownTimer.current);
                setShowWarning(false);
                showWarningRef.current = false;
                onLogoutRef.current();
            }, WARNING_MS);

        }, INACTIVITY_MS - WARNING_MS);
    }, [isAdmin, clearAll]);

    const stayLoggedIn = useCallback(() => {
        setShowWarning(false);
        showWarningRef.current = false;
        setSecondsLeft(60);
        clearAll();
        resetTimer();
    }, [clearAll, resetTimer]);

    useEffect(() => {
        if (!isAdmin) return;

        resetTimer();

        const handleActivity = () => {
            // Use the ref so we don't need showWarning in the dependency array
            if (showWarningRef.current) return;
            resetTimer();
        };

        EVENTS.forEach(e => window.addEventListener(e, handleActivity, { passive: true }));
        return () => {
            clearAll();
            EVENTS.forEach(e => window.removeEventListener(e, handleActivity));
        };
    }, [isAdmin, resetTimer, clearAll]);

    return { showWarning, secondsLeft, stayLoggedIn };
};
