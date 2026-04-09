import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    withXSRFToken: true,   // axios ≥1.x: auto-reads XSRF-TOKEN cookie → X-XSRF-TOKEN header
    headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        // NOTE: Do NOT set Content-Type here globally.
        // For JSON requests axios sets it automatically.
        // For FormData (file uploads) axios MUST set it with the correct boundary.
    },
});

// Ensure Sanctum has issued the XSRF-TOKEN cookie before any request.
// This is the correct SPA auth flow for Laravel Sanctum stateful sessions.
let csrfInitialized = false;

api.interceptors.request.use(async (config) => {
    // Skip for the csrf-cookie request itself to avoid infinite loop
    if (config.url === '/sanctum/csrf-cookie') return config;

    if (!csrfInitialized) {
        try {
            await axios.get('/sanctum/csrf-cookie', { withCredentials: true });
            csrfInitialized = true;
        } catch {
            // Non-fatal — proceed anyway; the session cookie may already be valid
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // 419 = CSRF token mismatch — reset so next request re-fetches the cookie
        if (error.response?.status === 419) {
            csrfInitialized = false;
        }
        if (error.response?.status === 401) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
