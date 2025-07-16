'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import IconArrowLeft from '@/components/icon/icon-arrow-left';
import IconEdit from '@/components/icon/icon-edit';
import IconUser from '@/components/icon/icon-user';
import IconUsers from '@/components/icon/icon-users';
import { getCustomerById, CustomerDetail } from '@/app/(defaults)/customers/[id]/service';

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
    const [customer, setCustomer] = useState<CustomerDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCustomer = async () => {
            try {
                const data = await getCustomerById(Number(params.id));
                setCustomer(data);
            } catch (err) {
                console.error('Không tìm thấy khách hàng:', err);
                setCustomer(null);
            } finally {
                setLoading(false);
            }
        };

        loadCustomer();
    }, [params.id]);

    if (loading) {
        return <div className="panel">Đang tải...</div>;
    }

    if (!customer) {
        return (
            <div className="panel">
                <div className="text-center py-8">
                    <h2 className="text-2xl font-bold mb-2">Không tìm thấy khách hàng</h2>
                    <p className="text-gray-500 mb-4">Khách hàng với ID {params.id} không tồn tại.</p>
                    <Link href="/customers">
                        <button className="btn btn-primary">Quay lại danh sách</button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="panel">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-4">
                    <Link href="/customers">
                        <button className="btn btn-outline-primary flex items-center">
                            <IconArrowLeft className="w-4 h-4 mr-2 rotate-180" />
                            Quay lại
                        </button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">{customer.customerName}</h1>
                        <p className="text-gray-500">Chi tiết khách hàng #{customer.customerCode}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* <span className={`badge ${customer.customerType === 'customer' ? 'bg-info' : 'bg-warning'}`}>{customer.customerType === 'customer' ? 'Khách hàng' : 'Nhà cung cấp'}</span> */}
                    <Link href={`/customers/${customer.id}/edit`}>
                        <button className="btn btn-primary">
                            <IconEdit className="mr-2" />
                            Chỉnh sửa
                        </button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                            {customer.customerType === 'customer' ? <IconUser className="w-5 h-5 text-blue-500" /> : <IconUsers className="w-5 h-5 text-orange-500" />}
                            Thông tin cơ bản
                        </h3>

                        <div className="space-y-4">
                            {/* <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                                <span className="text-gray-600 font-medium">Mã khách hàng:</span>
                                <span className="col-span-2 font-semibold text-primary">{customer.customerCode ?? '-'}</span>
                            </div> */}

                            <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                                <span className="text-gray-600 font-medium">Tên:</span>
                                <span className="col-span-2 font-semibold">{customer.customerName}</span>
                            </div>

                            <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                                <span className="text-gray-600 font-medium">Số điện thoại:</span>
                                <span className="col-span-2">{customer.phone}</span>
                            </div>

                            <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                                <span className="text-gray-600 font-medium">Địa chỉ:</span>
                                <span className="col-span-2">{customer.address}</span>
                            </div>

                            <div className="grid grid-cols-3 gap-4 py-3">
                                <span className="text-gray-600 font-medium">Loại:</span>
                                <span className="col-span-2 flex items-center gap-2">
                                    {customer.customerType === 'customer' ? (
                                        <>
                                            <IconUser className="w-4 h-4 text-blue-500" />
                                            <span className="text-blue-600 font-medium">Khách hàng</span>
                                        </>
                                    ) : (
                                        <>
                                            <IconUsers className="w-4 h-4 text-orange-500" />
                                            <span className="text-orange-600 font-medium">Nhà cung cấp</span>
                                        </>
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Thông tin bổ sung</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                                <span className="text-gray-600 font-medium">Chiết khấu:</span>
                                <span className="col-span-2 font-semibold text-green-600">{(customer.discount ?? 0) * 100}%</span>
                            </div>

                            {customer.notes && (
                                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                                    <span className="text-gray-600 font-medium">Ghi chú:</span>
                                    <span className="col-span-2">{customer.notes}</span>
                                </div>
                            )}

                            {customer.contactPerson && (
                                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                                    <span className="text-gray-600 font-medium">Người liên hệ:</span>
                                    <span className="col-span-2">{customer.contactPerson}</span>
                                </div>
                            )}

                            {customer.contactPhone && (
                                <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                                    <span className="text-gray-600 font-medium">SĐT liên hệ:</span>
                                    <span className="col-span-2">{customer.contactPhone}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
