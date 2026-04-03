import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Add interceptor to include token if stored in localStorage (optional, if using tokens vs cookies)
// Since we are using Sanctum SPA cookie-based auth, we don't strictly need Bearer token.
// But if we used token response in login, we can add it here.
// I'll add it to be safe as I implemented token storage in useAuth.
api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // Manually set X-XSRF-TOKEN if cookie exists (sometimes Axios auto-logic fails on cross-port localhost)
    if (typeof document !== 'undefined') {
        const match = document.cookie.match(new RegExp('(^|;\\s*)XSRF-TOKEN=([^;]+)'));
        if (match) {
            config.headers['X-XSRF-TOKEN'] = decodeURIComponent(match[2]);
        }
    }

    return config;
});

export default api;
