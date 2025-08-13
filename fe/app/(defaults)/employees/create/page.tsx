'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createEmployee, UpdateEmployeeDto } from '../service';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const CreateEmployeePage = () => {
    const router = useRouter();
    const [formData, setFormData] = useState<UpdateEmployeeDto>({
        fullName: '',
        phone: '',
        email: '',
        address: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Partial<UpdateEmployeeDto>>({});

    const validateForm = () => {
        const newErrors: Partial<UpdateEmployeeDto> = {};

        if (!formData.fullName?.trim()) {
            newErrors.fullName = 'Họ và tên là bắt buộc';
        }

        if (!formData.phone?.trim()) {
            newErrors.phone = 'Số điện thoại là bắt buộc';
        } else if (!/^[0-9]{10,11}$/.test(formData.phone)) {
            newErrors.phone = 'Số điện thoại không hợp lệ';
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            await createEmployee(formData);
            alert('Thêm nhân viên thành công!');
            router.push('/employees');
        } catch (error) {
            console.error('Lỗi thêm nhân viên:', error);
            alert('Có lỗi xảy ra khi thêm nhân viên');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name as keyof UpdateEmployeeDto]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    return (
        <ProtectedRoute requiredRole={1}>
            <div className="panel">
                <div className="mb-5">
                    <h2 className="text-xl font-semibold mb-4">Thêm nhân viên mới</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="fullName" className="form-label">
                                    Họ và tên <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    className={`form-input ${errors.fullName ? 'border-red-500' : ''}`}
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Nhập họ và tên"
                                />
                                {errors.fullName && (
                                    <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="phone" className="form-label">
                                    Số điện thoại <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Nhập số điện thoại"
                                />
                                {errors.phone && (
                                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="email" className="form-label">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Nhập email"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="address" className="form-label">
                                    Địa chỉ
                                </label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    className="form-input"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Nhập địa chỉ"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <Link href="/employees">
                                <button type="button" className="btn btn-outline-secondary">
                                    Hủy
                                </button>
                            </Link>
                            <button 
                                type="submit" 
                                className="btn btn-success" 
                                disabled={loading}
                            >
                                {loading ? 'Đang thêm...' : 'Thêm nhân viên'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default CreateEmployeePage;
