'use client';
import IconLockDots from '@/components/icon/icon-lock-dots';
import IconMail from '@/components/icon/icon-mail';
import IconUser from '@/components/icon/icon-user';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '@/store/authSlice';
import authService from '@/services/authService';

const ComponentsAuthRegisterForm = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        employeeId: '',
        roleId: ''
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const submitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.username || !formData.password || !formData.confirmPassword || !formData.employeeId || !formData.roleId) {
            alert('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            alert('Mật khẩu xác nhận không khớp');
            return;
        }

        if (formData.password.length < 6) {
            alert('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setLoading(true);

        try {
            const registerData = {
                username: formData.username,
                password: formData.password,
                employeeId: parseInt(formData.employeeId),
                roleId: parseInt(formData.roleId)
            };

            await authService.register(registerData);
            
            // Auto login after successful registration
            const loginResponse = await authService.login({
                username: formData.username,
                password: formData.password
            });

            dispatch(loginSuccess({
                user: loginResponse.user,
                token: loginResponse.token
            }));

            authService.setAuthToken(loginResponse.token);
            
            alert('Đăng ký thành công!');
            
            // Redirect based on role
            const roleId = loginResponse.user.roleId;
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
                        <IconUser fill={true} />
                    </span>
                </div>
            </div>
            
            <div>
                <label htmlFor="employeeId">ID Nhân viên</label>
                <div className="relative text-white-dark">
                    <input 
                        id="employeeId" 
                        name="employeeId"
                        type="number" 
                        placeholder="Nhập ID nhân viên" 
                        className="form-input ps-10 placeholder:text-white-dark"
                        value={formData.employeeId}
                        onChange={handleInputChange}
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconUser fill={true} />
                    </span>
                </div>
            </div>

            <div>
                <label htmlFor="roleId">Vai trò</label>
                <div className="relative text-white-dark">
                    <select 
                        id="roleId" 
                        name="roleId"
                        className="form-select ps-10"
                        value={formData.roleId}
                        onChange={handleInputChange}
                    >
                        <option value="">Chọn vai trò</option>
                        <option value="1">Chủ xưởng</option>
                        <option value="2">Kế toán</option>
                        <option value="3">Bộ phận sản xuất</option>
                    </select>
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconUser fill={true} />
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
                <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
                <div className="relative text-white-dark">
                    <input 
                        id="confirmPassword" 
                        name="confirmPassword"
                        type="password" 
                        placeholder="Nhập lại mật khẩu" 
                        className="form-input ps-10 placeholder:text-white-dark"
                        value={formData.confirmPassword}
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
                    <span className="text-white-dark">Tôi đồng ý với các điều khoản sử dụng</span>
                </label>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)] disabled:opacity-50"
            >
                {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
        </form>
    );
};

export default ComponentsAuthRegisterForm;
