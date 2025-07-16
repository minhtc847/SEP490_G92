'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import IconArrowLeft from '@/components/icon/icon-arrow-left';
import IconSave from '@/components/icon/icon-save';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconRefresh from '@/components/icon/icon-refresh';
import { getCustomerById, updateCustomerById, deleteCustomerById } from './service';

interface Customer {
    id: number;
    customerName: string;
    phone: string;
    address: string;
    customerType: 'customer' | 'supplier';
    notes?: string;
    discount?: number;
    createdAt: string;
    customerCode: string;
    contactPerson: string;
    contactPhone: string;
}

export default function EditCustomerPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasOrders, setHasOrders] = useState(false);
    const [formData, setFormData] = useState({
        customerName: '',
        phone: '',
        address: '',
        customerType: 'customer' as 'customer' | 'supplier',
        notes: '',
        discount: 0,
        customerCode: '',
        contactPerson: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getCustomerById(Number(params.id));
                
                setCustomer(data);
                setFormData({
                    customerName: data.customerName,
                    phone: data.phone,
                    address: data.address,
                    customerType: data.customerType,
                    notes: data.notes || '',
                    discount: data.discount || 0,
                    customerCode: data.customerCode,
                    contactPerson: data.contactPerson || '',
                });
            } catch (error) {
                console.error('Lỗi khi tải khách hàng:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [params.id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'discount') {
            const percentage = parseFloat(value);
            setFormData((prev) => ({
                ...prev,
                discount: isNaN(percentage) ? 0 : percentage / 100, // 50 => 0.5
            }));
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateCustomerById(Number(params.id), formData);
            alert('Cập nhật khách hàng thành công!');
            router.push(`/customers/${params.id}`);
        } catch (error) {
            console.error('Lỗi cập nhật:', error);
            alert('Cập nhật thất bại!');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm(`Bạn có chắc muốn xóa khách hàng "${customer?.customerName}"?`)) {
            try {
                await deleteCustomerById(Number(params.id));
                alert('Xóa thành công!');
                router.push('/customers');
            } catch (error) {
                alert('Không thể xoá khách hàng đã có đơn hang hoặc giao dịch.');
                console.error(error);
            }
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

    if (loading) return <div className="panel">Đang tải...</div>;

    if (!customer)
        return (
            <div className="panel text-center py-10">
                <h2 className="text-xl font-bold">Không tìm thấy khách hàng</h2>
                <Link href="/customers">
                    <button className="btn btn-primary mt-4">Quay lại danh sách</button>
                </Link>
            </div>
        );

    return (
        <div className="flex gap-6">
            <div className="flex-1">
                <form onSubmit={handleSubmit} className="panel space-y-6">
                    <div className="flex items-center justify-between border-b pb-4">
                        <div className="flex items-center gap-4">
                            <Link href={`/customers/${params.id}`}>
                                <button className="btn btn-outline-primary flex items-center">
                                    <IconArrowLeft className="w-4 h-4 mr-2 rotate-180" />
                                    Quay lại
                                </button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold">Chỉnh sửa khách hàng</h1>
                                {/* <p className="text-gray-500">Mã khách hàng: {customer.customerCode}</p> */}
                            </div>
                        </div>
                        {/* <span className={`badge ${formData.customerType === 'customer' ? 'bg-info' : 'bg-warning'}`}>{formData.customerType === 'customer' ? 'Khách hàng' : 'Nhà cung cấp'}</span> */}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            {/* <label className="block font-medium">Mã khách hàng</label>
                            <div className="flex gap-2">
                                <input readOnly name="customerCode" value={formData.customerCode} onChange={handleChange} className="form-input flex-1" />
                            </div> */}

                            <label className="block font-medium">Tên khách hàng *</label>
                            <input name="customerName" required value={formData.customerName} onChange={handleChange} className="form-input" />

                            <label className="block font-medium">Số điện thoại</label>
                            <input name="phone" value={formData.phone} onChange={handleChange} className="form-input" />

                            <label className="block font-medium">Địa chỉ</label>
                            <textarea name="address" rows={3} value={formData.address} onChange={handleChange} className="form-textarea" />
                        </div>

                        <div className="space-y-4">
                            <label className="block font-medium">Loại</label>
                            <select name="customerType" value={formData.customerType} onChange={handleChange} className="block font-medium form-select">
                                <option value="customer">Khách hàng</option>
                                <option value="supplier">Nhà cung cấp</option>
                            </select>

                            {/* <label className="block font-medium">Người liên hệ</label> */}
                            {/* <input name="contactPerson" value={formData.contactPerson} onChange={handleChange} className="form-input" /> */}

                            <label className="block font-medium">Chiết khấu (%)</label>
                            <input name="discount" type="number" min="0" max="100" value={formData.discount * 100} onChange={handleChange} className="form-input" />

                            <label className="block font-medium">Ghi chú</label>
                            <textarea name="notes" value={formData.notes} onChange={handleChange} className="form-textarea" rows={3} />
                        </div>
                    </div>

                    <div className="flex gap-4 border-t pt-4 justify-end">
                        <button type="submit" className="btn btn-success">
                            <IconSave className="mr-2" />
                            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                        <button type="button" onClick={handleDelete} className="btn btn-outline-danger">
                            <IconTrashLines className="mr-2" />
                            Xóa khách hàng
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
