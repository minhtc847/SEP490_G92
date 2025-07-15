'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPurchaseOrderById, PurchaseOrderWithDetailsDto } from './service';

const getStatusBadgeClass = (status: string) => {
    switch (status) {
        case 'Đã tạo':
            return 'bg-yellow-200 text-yellow-800';
        case 'Đã mua':
            return 'bg-green-200 text-green-800';
        default:
            return 'bg-gray-200 text-gray-800';
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
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Chi tiết đơn hàng mua: {order.code}</h1>
                <div className="space-x-2">
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
                    <strong>Trạng thái:</strong> <span className={`inline-block px-2 py-1 rounded text-xs ${getStatusBadgeClass(order.status || '')}`}>{order.status || '-'}</span>
                </div>
            </div>

            <table className="w-full border-collapse border text-sm mb-6">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border p-2">STT</th>
                        <th className="border p-2">Tên SP</th>
                        <th className="border p-2">Rộng (mm)</th>
                        <th className="border p-2">Cao (mm)</th>
                        <th className="border p-2">Dày (mm)</th>
                        <th className="border p-2">Số lượng</th>
                        <th className="border p-2">Đơn vị</th>
                        <th className="border p-2">Diện tích (m²)</th>
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
                                <td className="border p-2 text-right">{width.toLocaleString()}</td>
                                <td className="border p-2 text-right">{height.toLocaleString()}</td>
                                <td className="border p-2 text-right">{(item.thickness ?? 0).toLocaleString()}</td>
                                <td className="border p-2 text-right">{(item.quantity ?? 0).toLocaleString()}</td>
                                <td className="border p-2">{item.uom || '-'}</td>
                                <td className="border p-2 text-right">{areaM2.toFixed(2)}</td>
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
    );
};

export default PurchaseOrderDetailPage;
