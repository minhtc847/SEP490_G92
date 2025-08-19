import axios, { isAxiosError } from 'axios';

// Create an instance of Axios for external API
const externalAxios = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE || "https://localhost:7075",
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
externalAxios.interceptors.request.use(
    function (config) {
        // Add auth token if available
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle authentication errors
externalAxios.interceptors.response.use(
    function (response) {
        return response;
    },
    function (error) {
        // Handle authentication errors
        if (error.response?.status === 401) {
            // Token expired or invalid, redirect to login
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                window.location.href = '/auth/login';
            }
        }
        return Promise.reject(error);
    }
);

export default externalAxios;
