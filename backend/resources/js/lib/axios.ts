import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true, // sends session cookie automatically
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

// Attach CSRF token from meta tag (Laravel sets this)
api.interceptors.request.use((config) => {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (token) config.headers['X-CSRF-TOKEN'] = token;
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
