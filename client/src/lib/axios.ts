import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (
            error.response?.status === 401 &&
            typeof window !== 'undefined' &&
            window.location.pathname !== '/login'
        ) {
            localStorage.removeItem('access_token');
            document.cookie = 'access_token=; path=/; max-age=0';
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
