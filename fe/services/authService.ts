import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000/api';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    password: string;
    employeeId: number;
    roleId: number;
}

export interface User {
    id: number;
    username: string;
    employeeId: number;
    employeeName: string;
    roleId: number;
    roleName: string;
}

export interface AuthResponse {
    message: string;
    token: string;
    user: User;
}

class AuthService {
    private api = axios.create({
        baseURL: API_BASE_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    constructor() {
        // Initialize token from localStorage on service creation
        this.initializeToken();
    }

    // Initialize token from localStorage
    private initializeToken() {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                this.setAuthToken(token);
            }
        }
    }

    // Add token to requests
    setAuthToken(token: string) {
        if (token) {
            this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete this.api.defaults.headers.common['Authorization'];
        }
    }

    async login(credentials: LoginRequest): Promise<AuthResponse> {
        try {
            const response = await this.api.post<AuthResponse>('/api/auth/login', credentials);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Đăng nhập thất bại');
        }
    }

    async register(userData: RegisterRequest): Promise<{ message: string }> {
        try {
            const response = await this.api.post<{ message: string }>('/api/auth/register', userData);
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Đăng ký thất bại');
        }
    }

    async validateToken(token: string): Promise<{ user: User }> {
        try {
            const response = await this.api.post<{ user: User }>('/api/auth/validate', { token });
            return response.data;
        } catch (error: any) {
            throw new Error('Token không hợp lệ');
        }
    }

    async checkPermission(userId: number, permission: string): Promise<{ hasPermission: boolean }> {
        try {
            const response = await this.api.post<{ hasPermission: boolean }>('/api/auth/permission', {
                userId,
                permission,
            });
            return response.data;
        } catch (error: any) {
            throw new Error('Kiểm tra quyền thất bại');
        }
    }
}

export default new AuthService(); 