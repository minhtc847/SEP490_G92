'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPurchaseOrderById, PurchaseOrderWithDetailsDto, updatePurchaseOrderStatus } from './service';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const getStatusBadgeClass = (status: string) => {
    switch (status) {
        case 'Pending':
            return 'bg-yellow-200 text-yellow-800';
        case 'Ordered':
            return 'bg-blue-200 text-blue-800';
        case 'Imported':
            return 'bg-green-200 text-green-800';
        case 'Cancelled':
            return 'bg-red-200 text-red-800';
        default:
            return 'bg-gray-200 text-gray-800';
    }
};

const getStatusDisplayName = (status: string) => {
    switch (status) {
        case 'Pending':
            return 'Chờ đặt hàng';
        case 'Ordered':
            return 'Đã đặt hàng';
        case 'Imported':
            return 'Đã nhập hàng';
        case 'Cancelled':
            return 'Đã hủy';
        default:
            return status;
    }
};

const PurchaseOrderDetailPage = () => {
    const params = useParams();
    const id = Number(params?.id);
    const router = useRouter();

    const [order, setOrder] = useState<PurchaseOrderWithDetailsDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id || isNaN(id)) return;

        const fetchData = async () => {
            try {
                const data = await getPurchaseOrderById(id);
                setOrder(data);
            } catch (error) {
                console.error('Lỗi khi gọi API:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) return <div className="p-6">Đang tải dữ liệu...</div>;
    if (!order) return <div className="p-6 text-red-600">Không tìm thấy đơn hàng mua với ID: {id}</div>;

    const handleBack = () => router.push('/purchase-order');
    const handleEdit = () => router.push(`/purchase-order/edit/${id}`);

    return (
        <ProtectedRoute requiredRole={[1, 2]}>

        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Chi tiết đơn hàng mua: {order.code}</h1>
                <div className="space-x-2">
                    {order.status === 'Pending' && (
                        <div className="flex gap-2">
                            <button
                                onClick={async () => {
                                    if (confirm(`Bạn có chắc muốn đặt đơn hàng "${order.description}" không?`)) {
                                        try {
                                            await updatePurchaseOrderStatus(order.id, 1); // Ordered
                                            setOrder((prev) => (prev ? { ...prev, status: 'Ordered' } : prev));
                                            alert('Đơn hàng đã được đặt.');
                                        } catch (error) {
                                            alert('Có lỗi khi cập nhật trạng thái.');
                                        }
                                    }
                                }}
                                className="px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm focus:outline-none focus:ring-0"
                            >
                                🛒 Đặt hàng
                            </button>

                            <button
                                onClick={async () => {
                                    if (confirm(`Bạn có chắc muốn huỷ đơn hàng "${order.description}" không?`)) {
                                        try {
                                            await updatePurchaseOrderStatus(order.id, 3); // Cancelled
                                            setOrder((prev) => (prev ? { ...prev, status: 'Cancelled' } : prev));
                                            alert('Đơn hàng đã bị huỷ.');
                                        } catch (error) {
                                            alert('Có lỗi khi huỷ đơn hàng.');
                                        }
                                    }
                                }}
                                className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm focus:outline-none focus:ring-0"
                            >
                                ❌ Huỷ đơn
                            </button>
                        </div>
                    )}
                    <button onClick={handleEdit} className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                        ✏️ Sửa
                    </button>
                    <button onClick={() => alert('Xuất Excel')} className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                        🧾 Xuất Excel
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                    <strong>Mô tả:</strong> {order.description || '-'}
                </div>
                <div>
                    <strong>Nhà cung cấp:</strong> {order.customerName}
                </div>
                <div>
                    <strong>Ngày tạo:</strong> {order.date ? new Date(order.date).toLocaleDateString('vi-VN') : '-'}
                </div>
                <div>
                    <strong>Trạng thái:</strong> <span className={`inline-block px-2 py-1 rounded text-xs ${getStatusBadgeClass(order.status || '')}`}>{getStatusDisplayName(order.status || '')}</span>
                </div>
            </div>

            <table className="w-full border-collapse border text-sm mb-6">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border p-2">STT</th>
                        <th className="border p-2">Tên SP</th>
                        {/* <th className="border p-2">Rộng (mm)</th>
                        <th className="border p-2">Cao (mm)</th>
                        <th className="border p-2">Dày (mm)</th> */}
                        <th className="border p-2">Số lượng</th>
                        <th className="border p-2">Đơn vị</th>
                        {/* <th className="border p-2">Diện tích (m²)</th> */}
                    </tr>
                </thead>
                <tbody>
                    {order.purchaseOrderDetails.map((item, idx) => {
                        const width = Number(item.width) || 0;
                        const height = Number(item.height) || 0;
                        const areaM2 = (width * height) / 1_000_000;

                        return (
                            <tr key={idx}>
                                <td className="border p-2 text-center">{idx + 1}</td>
                                <td className="border p-2">{item.productName}</td>
                                {/* <td className="border p-2 text-right">{width.toLocaleString()}</td>
                                <td className="border p-2 text-right">{height.toLocaleString()}</td>
                                <td className="border p-2 text-right">{(item.thickness ?? 0).toLocaleString()}</td> */}
                                <td className="border p-2 text-right">{(item.quantity ?? 0).toLocaleString()}</td>
                                <td className="border p-2">{item.uom || '-'}</td>
                                {/* <td className="border p-2 text-right">{areaM2.toFixed(2)}</td> */}
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div className="text-end text-sm font-semibold">
                <p>
                    <strong>Tổng số lượng:</strong> {order.purchaseOrderDetails.reduce((sum, item) => sum + (item.quantity ?? 0), 0)}
                </p>
            </div>

            <button onClick={handleBack} className="mt-6 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
                ◀ Quay lại
            </button>
        </div>
        </ProtectedRoute>

    );
};

export default PurchaseOrderDetailPage;
