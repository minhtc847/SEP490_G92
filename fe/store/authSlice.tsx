import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
    id: number;
    username: string;
    employeeId: number;
    employeeName: string;
    roleId: number;
    roleName: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

// Helper function to get user from localStorage
const getUserFromStorage = (): User | null => {
    if (typeof window === 'undefined') return null;
    try {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        return null;
    }
};

const getTokenFromStorage = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
};

const initialState: AuthState = {
    user: null, // Không truy cập localStorage ở đây
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
            if (typeof window !== 'undefined') {
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('user', JSON.stringify(action.payload.user));
            }
        },
        loginFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        },
        clearError: (state) => {
            state.error = null;
        },
        restoreAuth: (state) => {
            const token = typeof window !== 'undefined' ? getTokenFromStorage() : null;
            const user = typeof window !== 'undefined' ? getUserFromStorage() : null;
            if (token && user) {
                state.token = token;
                state.user = user;
                state.isAuthenticated = true;
            } else {
                // Clear invalid state
                state.token = null;
                state.user = null;
                state.isAuthenticated = false;
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
        },
    },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError, restoreAuth } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectError = (state: { auth: AuthState }) => state.auth.error;
export const selectRoleId = (state: { auth: AuthState }) => state.auth.user?.roleId;
export const selectRoleName = (state: { auth: AuthState }) => state.auth.user?.roleName; 