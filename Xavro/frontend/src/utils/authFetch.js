/**
 * Wraps fetch with the JWT Authorization header from localStorage.
 * Use this for all requests to protected staff/admin API endpoints.
 */
export const authFetch = (url, options = {}) => {
    const token = localStorage.getItem('token');
    return fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers
        }
    });
};
