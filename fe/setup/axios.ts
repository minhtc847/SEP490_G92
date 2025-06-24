import axios, { isAxiosError } from 'axios';

// Create an instance of Axios for external API
const externalAxios = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5250", // Change baseURL if needed
    headers: {
        'Content-Type': 'application/json',
    },
});

externalAxios.interceptors.response.use(
    function (response) {
        return response;
    },
);

export default externalAxios;
