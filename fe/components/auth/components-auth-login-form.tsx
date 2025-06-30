'use client';
import IconLockDots from '@/components/icon/icon-lock-dots';
import IconMail from '@/components/icon/icon-mail';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure } from '@/store/authSlice';
import authService from '@/services/authService';

const ComponentsAuthLoginForm = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const submitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.username || !formData.password) {
            alert('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        setLoading(true);
        dispatch(loginStart());

        try {
            const response = await authService.login(formData);
            dispatch(loginSuccess({
                user: response.user,
                token: response.token
            }));
            
            // Set token for future API calls
            authService.setAuthToken(response.token);
            
            // Redirect based on role
            const roleId = response.user.roleId;
            if (roleId === 1) {
                router.push('/'); // Factory Manager - Dashboard
            } else if (roleId === 2) {
                router.push('/price-quotes'); // Accountant - Price Quotes
            } else if (roleId === 3) {
                router.push('/production-orders'); // Production Staff - Production Orders
            } else {
                router.push('/');
            }
        } catch (error: any) {
            dispatch(loginFailure(error.message));
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="space-y-5 dark:text-white" onSubmit={submitForm}>
            <div>
                <label htmlFor="username">Tên đăng nhập</label>
                <div className="relative text-white-dark">
                    <input 
                        id="username" 
                        name="username"
                        type="text" 
                        placeholder="Nhập tên đăng nhập" 
                        className="form-input ps-10 placeholder:text-white-dark"
                        value={formData.username}
                        onChange={handleInputChange}
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconMail fill={true} />
                    </span>
                </div>
            </div>
            <div>
                <label htmlFor="password">Mật khẩu</label>
                <div className="relative text-white-dark">
                    <input 
                        id="password" 
                        name="password"
                        type="password" 
                        placeholder="Nhập mật khẩu" 
                        className="form-input ps-10 placeholder:text-white-dark"
                        value={formData.password}
                        onChange={handleInputChange}
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconLockDots fill={true} />
                    </span>
                </div>
            </div>
            <div>
                <label className="flex cursor-pointer items-center">
                    <input type="checkbox" className="form-checkbox bg-white dark:bg-black" />
                    <span className="text-white-dark">Ghi nhớ đăng nhập</span>
                </label>
            </div>
            <button 
                type="submit" 
                disabled={loading}
                className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)] disabled:opacity-50"
            >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
        </form>
    );
};

export default ComponentsAuthLoginForm;
