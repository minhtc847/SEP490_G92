'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Mock data for production order
const mockProductionOrder = {
  id: 'PO001',
  orderDate: '2024-03-20',
  status: 'Đang sản xuất',
  items: [
    {
      id: 1,
      productCode: 'SP001',
      thickness: 6,
      width: 1000,
      height: 2000,
      glueLayers: 2,
      glassPanels: 3,
      butylType: 0.5,
      quantity: 10,
      inProgress: 5,
      completed: 2
    },
    {
      id: 2,
      productCode: 'SP002',
      thickness: 8,
      width: 1200,
      height: 1800,
      glueLayers: 1,
      glassPanels: 2,
      butylType: 0.4,
      quantity: 8,
      inProgress: 3,
      completed: 1
    }
  ],
  productionStatus: [
    {
      id: 1,
      date: '2024-03-20 09:00',
      productCode: 'SP001',
      quantity: 5,
      status: 'Đang sản xuất',
      action: 'Xem chi tiết'
    }
  ]
};

const ProductionOrderDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [showPopup, setShowPopup] = useState(false);
  const [productionItems, setProductionItems] = useState(mockProductionOrder.items);
  const [productionStatus, setProductionStatus] = useState(mockProductionOrder.productionStatus);
  const [popupQuantities, setPopupQuantities] = useState<Record<number, number>>({});

  const handleEdit = () => {
    router.push(`/production-orders/edit/${id}`);
  };

  const handleStartProduction = () => {
    // Initialize popup quantities with current quantities
    const initialQuantities = productionItems.reduce((acc, item) => ({
      ...acc,
      [item.id]: item.quantity
    }), {});
    setPopupQuantities(initialQuantities);
    setShowPopup(true);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
  };

  const handlePopupConfirm = () => {
    // Filter out items with quantity > 0 and create new status entries
    const newStatus = productionItems
      .filter(item => popupQuantities[item.id] > 0)
      .map(item => ({
        id: Date.now() + Math.random(),
        date: new Date().toLocaleString(),
        productCode: item.productCode,
        quantity: popupQuantities[item.id],
        status: 'Đang sản xuất',
        action: 'Xem chi tiết'
      }));

    setProductionStatus([...productionStatus, ...newStatus]);
    setShowPopup(false);
  };

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    setPopupQuantities(prev => ({
      ...prev,
      [itemId]: newQuantity
    }));
  };

  const handleBack = () => {
    router.push('/production-orders');
  };

  const handleViewDetail = (statusId: number) => {
    // Ensure we're using the correct ID format
    const formattedStatusId = `PS${String(statusId).padStart(3, '0')}`;
    router.push(`/production-orders/${id}/production-status-detail/${formattedStatusId}`);
  };

  // Calculate totals
  const totals = productionItems.reduce(
    (acc, item) => ({
      quantity: acc.quantity + item.quantity,
      inProgress: acc.inProgress + item.inProgress,
      completed: acc.completed + item.completed
    }),
    { quantity: 0, inProgress: 0, completed: 0 }
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Chi tiết lệnh sản xuất: {id}</h1>
        <div className="space-x-2">
          <button onClick={handleEdit} className="px-4 py-1 bg-blue-500 text-white rounded">
            📝 Sửa
          </button>
          <button onClick={handleStartProduction} className="px-4 py-1 bg-green-600 text-white rounded">
            🏭 Sản xuất
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <strong>Mã lệnh sản xuất:</strong> {id}
        </div>
        <div>
          <strong>Ngày tạo:</strong> {mockProductionOrder.orderDate}
        </div>
        <div>
          <strong>Trạng thái:</strong> {mockProductionOrder.status}
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Chi tiết lệnh sản xuất</h2>
      <div className="table-responsive mb-6 overflow-x-auto">
        <table className="w-full border-collapse border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">STT</th>
              <th className="border p-2">Mã SP</th>
              <th className="border p-2">Độ dày (mm)</th>
              <th className="border p-2">Rộng (mm)</th>
              <th className="border p-2">Cao (mm)</th>
              <th className="border p-2">Số lượng</th>
              <th className="border p-2">Đang sản xuất</th>
              <th className="border p-2">Đã hoàn thành</th>
            </tr>
          </thead>
          <tbody>
            {productionItems.map((item, idx) => (
              <tr key={item.id}>
                <td className="border p-2 text-center">{idx + 1}</td>
                <td className="border p-2">{item.productCode}</td>
                <td className="border p-2 text-right">{item.thickness}</td>
                <td className="border p-2 text-right">{item.width}</td>
                <td className="border p-2 text-right">{item.height}</td>
                <td className="border p-2 text-right">{item.quantity}</td>
                <td className="border p-2 text-right">{item.inProgress}</td>
                <td className="border p-2 text-right">{item.completed}</td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-bold">
              <td colSpan={5} className="border p-2 text-right">Tổng cộng:</td>
              <td className="border p-2 text-right">{totals.quantity}</td>
              <td className="border p-2 text-right">{totals.inProgress}</td>
              <td className="border p-2 text-right">{totals.completed}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-xl font-semibold mb-4">Trạng thái sản xuất</h2>
      <div className="table-responsive mb-6 overflow-x-auto">
        <table className="w-full border-collapse border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">STT</th>
              <th className="border p-2">Ngày tạo</th>
              <th className="border p-2">Mã SP</th>
              <th className="border p-2">Số lượng</th>
              <th className="border p-2">Trạng thái</th>
              <th className="border p-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {productionStatus.map((status, idx) => (
              <tr key={status.id}>
                <td className="border p-2 text-center">{idx + 1}</td>
                <td className="border p-2">{status.date}</td>
                <td className="border p-2">{status.productCode}</td>
                <td className="border p-2 text-right">{status.quantity}</td>
                <td className="border p-2">{status.status}</td>
                <td className="border p-2">
                  <button 
                    onClick={() => handleViewDetail(status.id)} 
                    className="text-blue-600 hover:underline"
                  >
                    {status.action}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Bắt đầu sản xuất</h3>
            <div className="space-y-4">
              {productionItems.map(item => (
                <div key={item.id} className="flex items-center justify-between">
                  <span>{item.productCode}</span>
                  <input
                    type="number"
                    value={popupQuantities[item.id] || 0}
                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                    className="border p-1 w-24 text-right"
                    min="0"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={handlePopupClose}
                className="px-4 py-1 bg-gray-300 text-black rounded"
              >
                Hủy
              </button>
              <button
                onClick={handlePopupConfirm}
                className="px-4 py-1 bg-blue-500 text-white rounded"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <button onClick={handleBack} className="px-3 py-1 bg-gray-300 text-black rounded mt-4">
        ◀ Quay lại
      </button>
    </div>
  );
};

export default ProductionOrderDetailPage;
