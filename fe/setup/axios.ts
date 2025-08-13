import axios, { isAxiosError } from 'axios';

// Create an instance of Axios for external API
const externalAxios = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:7075", // Change baseURL if needed
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include JWT token
externalAxios.interceptors.request.use(
    function (config) {
        // Get token from localStorage
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

externalAxios.interceptors.response.use(
    function (response) {
        return response;
    },
    function (error) {
        // Handle 401 errors - redirect to login
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                window.location.href = '/auth/login';
            }
        }
        return Promise.reject(error);
    }
);

export default externalAxios;
