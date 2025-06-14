'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

const SalesOrderSummaryPage = () => {
    const router = useRouter();

    // Mock data
    const orderId = 'DH0001';
    const customerName = 'Nguyễn Văn A';
    const customerAddress = '123 Đường ABC, Quận 1, TP.HCM';
    const customerPhone = '0123 456 789';
    const orderDate = '2025-06-13';
    const discountPercent = 10;
    const handleBack = () => {
        router.back();
    };

    const orderItems = [
        {
            id: 1,
            productName: 'Kính cường lực 10ly',
            productCode: 'KCL10',
            width: 1000,
            height: 2000,
            thickness: 10,
            quantity: 3,
            unitPrice: 850000,
        },
        {
            id: 2,
            productName: 'Kính dán an toàn 6.38ly',
            productCode: 'KD638',
            width: 800,
            height: 1600,
            thickness: 6.38,
            quantity: 2,
            unitPrice: 920000,
        },
        {
            id: 3,
            productName: 'Kính cường lực 12ly',
            productCode: 'KCL12',
            width: 1200,
            height: 2200,
            thickness: 12,
            quantity: 4,
            unitPrice: 950000,
        },
        {
            id: 4,
            productName: 'Kính dán an toàn 8.38ly',
            productCode: 'KD838',
            width: 900,
            height: 1800,
            thickness: 8.38,
            quantity: 3,
            unitPrice: 980000,
        },
        {
            id: 5,
            productName: 'Kính hộp 5+9+5 low-e',
            productCode: 'KH595LE',
            width: 1000,
            height: 2000,
            thickness: 19,
            quantity: 2,
            unitPrice: 1550000,
        },
    ];

    // Tính toán
    const calcArea = (w: number, h: number) => ((w * h) / 1_000_000).toFixed(2);
    const calcSubtotal = (item: any) => item.unitPrice * item.quantity;
    const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = orderItems.reduce((sum, item) => sum + calcSubtotal(item), 0);
    const discountAmount = (totalAmount * discountPercent) / 100;
    const finalAmount = totalAmount - discountAmount;

    // --- Action handlers ---
    const handleEdit = () => {
        router.push(`/sales-order-edit/${orderId}`);
    };

    const handleUpdateMisa = () => {
        // Fake API call
        alert('Đồng bộ thành công vào MISA!');
    };

    const handleExportPDF = () => {
        // Giả lập xuất file PDF
        alert('Đang tạo file PDF...');
        // Tương lai có thể dùng thư viện jsPDF
    };

    const handleCreateProductionOrder = () => {
        router.push(`/production-order/create?orderId=${orderId}`);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Chi tiết đơn hàng: {orderId}</h1>
                <div className="space-x-2">
                    <button onClick={handleEdit} className="px-4 py-1 bg-blue-500 text-white rounded">
                        📝 Sửa
                    </button>
                    <button onClick={handleUpdateMisa} className="px-4 py-1 bg-green-600 text-white rounded">
                        🔄 Update MISA
                    </button>
                    <button onClick={handleExportPDF} className="px-4 py-1 bg-gray-600 text-white rounded">
                        🧾 Xuất PDF
                    </button>
                    <button onClick={handleCreateProductionOrder} className="px-4 py-1 bg-yellow-500 text-black rounded">
                        🏭 Tạo lệnh sản xuất
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                    <strong>Khách hàng:</strong> {customerName}
                </div>
                <div>
                    <strong>Địa chỉ:</strong> {customerAddress}
                </div>
                <div>
                    <strong>Điện thoại:</strong> {customerPhone}
                </div>
                <div>
                    <strong>Ngày đặt:</strong> {orderDate}
                </div>
                <div>
                    <strong>Mã đơn hàng:</strong> {orderId}
                </div>
                <div>
                    <strong>Chiết khấu:</strong> {discountPercent}%
                </div>
            </div>

            <div className="table-responsive mb-6 overflow-x-auto">
                <table className="w-full border-collapse border text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2">STT</th>
                            <th className="border p-2">Tên sản phẩm</th>
                            <th className="border p-2">Mã SP</th>
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
                        {orderItems.map((item, idx) => {
                            const area = calcArea(item.width, item.height);
                            const subtotal = calcSubtotal(item);
                            return (
                                <tr key={item.id}>
                                    <td className="border p-2 text-center">{idx + 1}</td>
                                    <td className="border p-2">{item.productName}</td>
                                    <td className="border p-2">{item.productCode}</td>
                                    <td className="border p-2 text-right">{item.width}</td>
                                    <td className="border p-2 text-right">{item.height}</td>
                                    <td className="border p-2 text-right">{item.thickness}</td>
                                    <td className="border p-2 text-right">{item.quantity}</td>
                                    <td className="border p-2 text-right">{item.unitPrice.toLocaleString()}</td>
                                    <td className="border p-2 text-right">{area}</td>
                                    <td className="border p-2 text-right">{subtotal.toLocaleString()}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="text-end text-sm space-y-1">
                <p>
                    <strong>Tổng số lượng:</strong> {totalQuantity}
                </p>
                <p>
                    <strong>Tổng tiền hàng:</strong> {totalAmount.toLocaleString()} ₫
                </p>
                <p>
                    <strong>Chiết khấu:</strong> {discountAmount.toLocaleString()} ₫ ({discountPercent}%)
                </p>
                <p className="text-base font-bold">
                    Thành tiền sau chiết khấu: <span className="text-green-600">{finalAmount.toLocaleString()} ₫</span>
                </p>
            </div>
            <button onClick={handleBack} className="px-3 py-1 bg-gray-300 text-black rounded">
                ◀ Quay lại
            </button>
        </div>
    );
};

export default SalesOrderSummaryPage;
