import { useEffect, useCallback } from 'react';
import { useBlocker } from 'react-router-dom';

/**
 * Warns the user about unsaved changes when navigating away.
 * - Browser close/refresh: native browser dialog
 * - In-app navigation: returns a blocker you can pass to UnsavedChangesModal
 */
export const useUnsavedChanges = (isDirty) => {
    useEffect(() => {
        const handler = (e) => {
            if (!isDirty) return;
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [isDirty]);

    const blocker = useBlocker(
        useCallback(({ currentLocation, nextLocation }) =>
            isDirty && currentLocation.pathname !== nextLocation.pathname,
        [isDirty])
    );

    return blocker;
};
