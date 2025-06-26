'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  getProductionPlanDetailsArray, 
  ProductionPlanDetail, 
  getProductionOrdersByPlanId, 
  ProductionOrdersByPlanDto, 
  createProductionOrderByPlanId, 
  ProductionOrder 
} from './service';

const ProductionOrderDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const [productionItems, setProductionItems] = useState<ProductionPlanDetail[]>([]);
  const [productionOrders, setProductionOrders] = useState<ProductionOrdersByPlanDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  useEffect(() => {
    
  const fetchData = async () => {
    if (!id) return; // tránh gọi khi chưa có id
    try {
      const data = await getProductionPlanDetailsArray(id as string);
      setProductionItems(data);
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error);
    } finally {
      setLoading(false);
    }
  };

    fetchData();
  }, [id]);

  const handleEdit = () => {
    router.push(`/production-plans/edit/${id}`);
  };

  const handleBack = () => {
    router.push('/production-plans');
  };

  const handleViewDetail = (orderId: number) => {
    router.push(`/production-orders/${orderId}`);
  };

  const handleCreateProductionOrder = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const newOrder = await createProductionOrderByPlanId(Number(id));
      
      setProductionOrders(prev => [
        {
          productionOrderId: newOrder.id,
          productionOrderCode: newOrder.productionOrderCode,
          orderDate: newOrder.orderDate,
          description: newOrder.description,
          productionStatus: newOrder.productionStatus,
          productionPlanId: newOrder.productionPlanId,
          productCodes: [],
          totalAmount: 0
        } as ProductionOrdersByPlanDto,
        ...prev
      ]);
    } catch (error) {
      alert('Tạo lệnh sản xuất thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const totals = productionItems.reduce(
    (acc, item) => ({
      quantity: acc.quantity + Number(item.quantity),
      inProgress: acc.inProgress + Number(item.inProgressQuantity),
      completed: acc.completed + Number(item.completed)
    }),
    { quantity: 0, inProgress: 0, completed: 0 }
  );

  if (loading) {
    return <p className="p-6">Đang tải dữ liệu...</p>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Chi tiết kế hoạch sản xuất: {id}</h1>
        <div className="space-x-2">
          <button onClick={handleEdit} className="px-4 py-1 bg-blue-500 text-white rounded">
            📝 Sửa
          </button>
          <button 
            className="px-4 py-1 bg-green-600 text-white rounded" 
            onClick={handleCreateProductionOrder}
          >
            🏭 Sản xuất
          </button>
        </div>
      </div>

      {/* Plan Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
        <div><strong>Mã lệnh sản xuất:</strong> {id}</div>
        <div><strong>Ngày tạo:</strong> Không có dữ liệu</div>
        <div><strong>Trạng thái:</strong> Không có dữ liệu</div>
      </div>

      {/* Production Plan Details Table */}
      <h2 className="text-xl font-semibold mb-4">Chi tiết kế hoạch sản xuất</h2>
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">STT</th>
              <th className="border p-2">Mã SP</th>
              <th className="border p-2">Tên SP</th>
              <th className="border p-2">Số lượng</th>
              <th className="border p-2">Đang sản xuất</th>
              <th className="border p-2">Đã hoàn thành</th>
            </tr>
          </thead>
          <tbody>
            {productionItems.map((item, idx) => (
              <tr key={`plan-detail-${idx}`}>
                <td className="border p-2 text-center">{idx + 1}</td>
                <td className="border p-2">{item.productCode}</td>
                <td className="border p-2 text-right">{item.productName}</td>
                <td className="border p-2 text-right">{item.quantity}</td>
                <td className="border p-2 text-right">{item.inProgressQuantity}</td>
                <td className="border p-2 text-right">{item.completed}</td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-bold">
              <td colSpan={3} className="border p-2 text-right">Tổng cộng:</td>
              <td className="border p-2 text-right">{totals.quantity}</td>
              <td className="border p-2 text-right">{totals.inProgress}</td>
              <td className="border p-2 text-right">{totals.completed}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Production Orders Table */}
      <h2 className="text-xl font-semibold mb-4">Lệnh sản xuất</h2>
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">STT</th>
              <th className="border p-2">Mã lệnh sản xuất</th>
              <th className="border p-2">Ngày tạo</th>
              <th className="border p-2">Mô tả</th>
              <th className="border p-2">Trạng thái</th>
              <th className="border p-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(productionOrders) && productionOrders.length > 0 ? (
              productionOrders.map((order, idx) => (
                <tr key={`production-order-${order.productionOrderCode}`}>
                  <td className="border p-2 text-center">{idx + 1}</td>
                  <td className="border p-2">{order.productionOrderCode}</td>
                  <td className="border p-2">
                    {order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN') : 'Không có ngày'}
                  </td>
                  <td className="border p-2 max-w-md break-words whitespace-normal min-w-48">
                    <div className="max-h-20 overflow-y-auto">
                      {order.description || 'Không có mô tả'}
                    </div>
                  </td>
                  <td className="border p-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      order.productionStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                      order.productionStatus === 'InProgress' ? 'bg-yellow-100 text-yellow-800' :
                      order.productionStatus === 'Pending' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.productionStatus === 'Completed' ? 'Hoàn thành' :
                       order.productionStatus === 'InProgress' ? 'Đang sản xuất' :
                       order.productionStatus === 'Pending' ? 'Chờ sản xuất' :
                       order.productionStatus}
                    </span>
                  </td>
                  <td className="border p-2">
                    <button 
                      onClick={() => handleViewDetail(order.productionOrderId)} 
                      className="text-blue-600 hover:underline"
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="border p-4 text-center text-gray-500">
                  Chưa có lệnh sản xuất nào cho kế hoạch này
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Back Button */}
      <button onClick={handleBack} className="px-3 py-1 bg-gray-300 text-black rounded mt-4">
        ◀ Quay lại
      </button>
    </div>
  );
};

export default ProductionOrderDetailPage;
