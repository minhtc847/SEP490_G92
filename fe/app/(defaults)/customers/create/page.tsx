'use client';

import { useState } from 'react';
import type React from 'react';
import { useRouter } from 'next/navigation';
import IconArrowLeft from '@/components/icon/icon-arrow-left';
import IconRefresh from '@/components/icon/icon-refresh';
import Link from 'next/link';
import { createCustomer } from '@/app/(defaults)/customers/create/service';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const CustomerCreatePage = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        customerCode: '',
        phone: '',
        customerName: '',
        customerType: 'customer' as 'customer' | 'supplier',
        address: '',
        contactPerson: '',
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ phone?: string; address?: string }>({});

    const validateForm = () => {
        const newErrors: { phone?: string; address?: string } = {};
        if (!formData.phone?.trim()) {
            newErrors.phone = 'Số điện thoại là bắt buộc';
        } else if (!/^[0-9]{10,11}$/.test(formData.phone)) {
            newErrors.phone = 'Số điện thoại không hợp lệ';
        }
        if (!formData.address?.trim()) {
            newErrors.address = 'Địa chỉ là bắt buộc';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: string, value: string | number) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);

        try {
            const payload = {
                ...formData,
                customerCode: '',
            };

            await createCustomer(payload);

            alert(`Thêm khách hàng "${formData.customerName}" thành công!`);
            router.push('/customers');
        } catch (error: any) {
            console.error('Lỗi tạo khách hàng:', error.response?.data || error.message);
            alert('Thêm khách hàng thất bại! ' + (error.response?.data?.title || error.message));
        } finally {
            setLoading(false);
        }
    };

    const generateCustomerCode = () => {
        const prefix = formData.customerType === 'customer' ? 'KH' : 'NCC';
        const randomNum = Math.floor(Math.random() * 1000);
        const code = `${prefix}${String(randomNum).padStart(3, '0')}`;
        setFormData((prev) => ({
            ...prev,
            customerCode: code,
        }));
    };

    return (
        <ProtectedRoute requiredRole={[1, 2]}>
            <div className="panel">
            <div className="mb-5">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold">Thông tin khách hàng</h2>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium mb-1">Tên khách hàng *</label>
                        <input type="text" className="form-input" value={formData.customerName} onChange={(e) => handleInputChange('customerName', e.target.value)} required />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium mb-1">Loại khách hàng</label>
                            <select className="form-select w-full" value={formData.customerType} onChange={(e) => handleInputChange('customerType', e.target.value)}>
                                <option value="customer">Khách hàng</option>
                                <option value="supplier">Nhà cung cấp</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Địa chỉ *</label>
                        <input type="text" className={`form-input ${errors.address ? 'border-red-500' : ''}`} value={formData.address} onChange={(e) => {
                            handleInputChange('address', e.target.value);
                            if (errors.address) setErrors(prev => ({ ...prev, address: undefined }));
                        }} required />
                        {errors.address && (<p className="text-red-500 text-sm mt-1">{errors.address}</p>)}
                    </div>

                    <div className="pt-4 border-t">
                        {/* <h3 className="text-lg font-medium mb-4">Thông tin liên hệ</h3> */}

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {/* <div>
                                <label className="block text-sm font-medium mb-1">Người liên hệ</label>
                                <input type="text" className="form-input" value={formData.contactPerson} onChange={(e) => handleInputChange('contactPerson', e.target.value)} />
                            </div> */}

                            <div>
                                <label className="block text-sm font-medium mb-1">SĐT liên hệ *</label>
                                <input type="tel" className={`form-input ${errors.phone ? 'border-red-500' : ''}`} value={formData.phone} onChange={(e) => {
                                    handleInputChange('phone', e.target.value);
                                    if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
                                }} required />
                                {errors.phone && (<p className="text-red-500 text-sm mt-1">{errors.phone}</p>)}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <h3 className="text-lg font-medium mb-4">Thông tin bổ sung</h3>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium mb-1">Ghi chú</label>
                                <textarea className="form-textarea" rows={4} value={formData.notes} onChange={(e) => handleInputChange('notes', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t">
                        <Link href="/customers">
                            <button type="button" className="btn btn-outline-secondary" disabled={loading}>
                                Hủy
                            </button>
                        </Link>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Đang lưu...' : 'Lưu khách hàng'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </ProtectedRoute>
        
    );
};

export default CustomerCreatePage;
