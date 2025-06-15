'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockOrders } from '@/app/data/mock-orders';

const SalesOrderDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const order = mockOrders.find((o) => o.id === id);
  if (!order) {
    return <div className="p-6 text-red-600">Không tìm thấy đơn hàng với mã: {id}</div>;
  }

  const {
    customerName,
    customerAddress,
    customerPhone,
    orderDate,
    discountPercent,
    orderItems,
  } = order;

  const calcArea = (w: number, h: number) => ((w * h) / 1_000_000).toFixed(2);
  const calcSubtotal = (item: any) => item.unitPrice * item.quantity;
  const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = orderItems.reduce((sum, item) => sum + calcSubtotal(item), 0);
  const discountAmount = (totalAmount * discountPercent) / 100;
  const finalAmount = totalAmount - discountAmount;

  const handleEdit = () => {
    router.push(`/sales-order/edit/${id}`);
  };

  const handleUpdateMisa = () => {
    alert('Đồng bộ thành công vào MISA!');
  };

  const handleExportPDF = () => {
    alert('Đang tạo file PDF...');
  };

  const handleCreateProductionOrder = () => {
    router.push(`/production-order/create?orderId=${id}`);
  };

  const handleBack = () => {
    router.push('/sales-order');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Chi tiết đơn hàng: {id}</h1>
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
          <strong>Mã đơn hàng:</strong> {id}
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
      <button onClick={handleBack} className="px-3 py-1 bg-gray-300 text-black rounded mt-4">
        ◀ Quay lại
      </button>
    </div>
  );
};

export default SalesOrderDetailPage;