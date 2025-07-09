'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getOrderDetailById, OrderDetailDto } from '@/app/(defaults)/sales-order/[id]/service';

const SalesOrderDetailPage = () => {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const [order, setOrder] = useState<OrderDetailDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id || isNaN(Number(id))) return;

        const fetchData = async () => {
            try {
                const data = await getOrderDetailById(Number(id));
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
    if (!order) return <div className="p-6 text-red-600">Không tìm thấy đơn hàng với ID: {id}</div>;

    const { customerName, address, phone, orderDate, orderCode, discount, products, totalAmount, totalQuantity } = order;

    const handleBack = () => router.push('/sales-order');

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Chi tiết đơn hàng: {orderCode}</h1>
                <div className="space-x-2">
                    <button onClick={() => router.push(`/sales-order/edit/${id}`)} className="px-4 py-1 bg-blue-500 text-white rounded">
                        📝 Sửa
                    </button>
                    <button onClick={() => alert('Đồng bộ thành công vào MISA!')} className="px-4 py-1 bg-green-600 text-white rounded">
                        🔄 Update MISA
                    </button>
                    <button onClick={() => alert('Đang tạo file PDF...')} className="px-4 py-1 bg-gray-600 text-white rounded">
                        🧾 Xuất PDF
                    </button>
                    <button onClick={() => router.push(`/production-orders/create?orderId=${id}`)} className="px-4 py-1 bg-yellow-500 text-black rounded">
                        🏭 Tạo lệnh sản xuất
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                    <strong>Khách hàng:</strong> {customerName}
                </div>
                <div>
                    <strong>Địa chỉ:</strong> {address}
                </div>
                <div>
                    <strong>Điện thoại:</strong> {phone}
                </div>
                <div>
                    <strong>Ngày đặt:</strong> {new Date(orderDate).toLocaleDateString()}
                </div>
                <div>
                    <strong>Mã đơn hàng:</strong> {orderCode}
                </div>
                <div>
                    <strong>Chiết khấu:</strong> {discount * 100}%
                </div>
                <div>
                    <strong>Trạng thái:</strong> {order.status}
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
                        <th className="border p-2">Đơn giá (₫)</th>
                        <th className="border p-2">Diện tích (m²)</th>
                        <th className="border p-2">Thành tiền (₫)</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((item, idx) => (
                        <tr key={idx}>
                            <td className="border p-2 text-center">{idx + 1}</td>
                            <td className="border p-2">{item.productName}</td>
                            <td className="border p-2 text-right">{item.width}</td>
                            <td className="border p-2 text-right">{item.height}</td>
                            <td className="border p-2 text-right">{item.thickness}</td>
                            <td className="border p-2 text-right">{item.quantity}</td>
                            <td className="border p-2 text-right">{item.unitPrice.toLocaleString()}</td>
                            <td className="border p-2 text-right">{item.areaM2}</td>
                            <td className="border p-2 text-right">{item.totalAmount.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="text-end text-sm space-y-1">
                {(() => {
                    const totalAmountRaw = products.reduce((sum, p) => sum + p.unitPrice * p.quantity, 0);
                    const discountAmount = totalAmountRaw * discount;
                    const finalAmount = totalAmountRaw - discountAmount;

                    return (
                        <>
                            <p>
                                <strong>Tổng số lượng:</strong> {totalQuantity}
                            </p>
                            <p>
                                <strong>Tổng tiền hàng:</strong> {totalAmountRaw.toLocaleString()} ₫
                            </p>
                            <p>
                                <strong>Chiết khấu:</strong> {discountAmount.toLocaleString()} ₫ ({(discount * 100).toFixed(2)}%)
                            </p>
                            <p className="text-base font-bold">
                                Thành tiền sau chiết khấu: <span className="text-green-600">{finalAmount.toLocaleString()} ₫</span>
                            </p>
                        </>
                    );
                })()}
            </div>

            <button onClick={handleBack} className="btn btn-status-secondary">
                ◀ Quay lại
            </button>
        </div>
    );
};

export default SalesOrderDetailPage;
