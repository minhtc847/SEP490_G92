'use client';

import React, { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardCard from './components/DashboardCard';
import ProductionChart from './components/ProductionChart';
import ProductionTable from './components/ProductionTable';
import { 
    productionDashboardService,
    ProductionDashboardOverviewDTO,
    OrderDetailDTO,
    OrderProductDTO
} from './service';
// Icons sẽ được định nghĩa inline

// Icons
const CalendarIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const FunnelIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
    </svg>
);

const EyeIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
);

const XMarkIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const CogIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const DocumentIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const CubeIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);

const AlertIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
);

const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
);

const ProductionDashboard: React.FC = () => {
    const [overview, setOverview] = useState<ProductionDashboardOverviewDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateFilter, setDateFilter] = useState({
        fromDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0]
    });
    const [orders, setOrders] = useState<OrderDetailDTO[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<OrderDetailDTO | null>(null);
    const [showOrderModal, setShowOrderModal] = useState(false);

    useEffect(() => {
        fetchProductionOverview();
        fetchOrders();
    }, [dateFilter]);

    const fetchProductionOverview = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await productionDashboardService.getProductionOverview(dateFilter.fromDate, dateFilter.toDate);
            setOverview(data);
        } catch (err) {
            console.error('Error fetching production overview:', err);
            setError('Không thể tải dữ liệu dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleCardClick = (type: string) => {
        console.log(`Clicked on ${type} card`);
        // Navigate to specific pages or show more details
    };

    const fetchOrders = async () => {
        try {
            const ordersData = await productionDashboardService.getOrdersList();
            setOrders(ordersData);
        } catch (err) {
            console.error('Error fetching orders:', err);
        }
    };

    const handleRowClick = (row: any, type: string) => {
        console.log(`Clicked on ${type} row:`, row);
        // Navigate to detail pages
    };

    const handleViewOrderDetails = async (orderId: number) => {
        try {
            const orderDetails = await productionDashboardService.getOrderDetails(orderId);
            setSelectedOrder(orderDetails);
            setShowOrderModal(true);
        } catch (err) {
            console.error('Error fetching order details:', err);
        }
    };

    // Table columns
    const productionPlanColumns = [
        { key: 'planDate', title: 'Ngày kế hoạch' },
        { key: 'orderCode', title: 'Mã đơn hàng' },
        { key: 'customerName', title: 'Khách hàng' },
        { key: 'quantity', title: 'Số lượng' },
        { key: 'status', title: 'Trạng thái' }
    ];

    const inventorySlipColumns = [
        { key: 'slipCode', title: 'Mã phiếu' },
        { key: 'productionOrderCode', title: 'Lệnh sản xuất' },
        { key: 'createdByEmployeeName', title: 'Người tạo' },
        { key: 'createdAt', title: 'Ngày tạo' },
        { key: 'isFinalized', title: 'Trạng thái', render: (value: boolean) => value ? 'Đã hoàn thành' : 'Chưa hoàn thành' },
        { key: 'isUpdateMisa', title: 'MISA', render: (value: boolean) => value ? 'Đã cập nhật' : 'Chưa cập nhật' }
    ];

    if (loading) {
        return (
            <ProtectedRoute requiredRole={[1, 2]}>
                <div className="p-6">
                    <LoadingSpinner />
                </div>
            </ProtectedRoute>
        );
    }

    if (error) {
        return (
            <ProtectedRoute requiredRole={[1, 2]}>
                <div className="p-6">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredRole={[1, 2]}>
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Sản Xuất</h1>
                    <p className="text-gray-600">Tổng quan về kế hoạch sản xuất, lệnh sản xuất và phiếu kho</p>
                </div>

                {/* Date Filter */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                            <FunnelIcon className="w-5 h-5 mr-2" />
                            Bộ lọc thời gian
                        </h2>
                        <button
                            onClick={() => {
                                const today = new Date();
                                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                                setDateFilter({
                                    fromDate: firstDay.toISOString().split('T')[0],
                                    toDate: today.toISOString().split('T')[0]
                                });
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            Tháng này
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Từ ngày
                            </label>
                            <input
                                type="date"
                                value={dateFilter.fromDate}
                                onChange={(e) => setDateFilter(prev => ({ ...prev, fromDate: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Đến ngày
                            </label>
                            <input
                                type="date"
                                value={dateFilter.toDate}
                                onChange={(e) => setDateFilter(prev => ({ ...prev, toDate: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={fetchProductionOverview}
                                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Áp dụng bộ lọc
                            </button>
                        </div>
                    </div>
                </div>

                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <DashboardCard
                        title="Tổng Kế Hoạch"
                        value={overview?.productionPlans.totalPlans || 0}
                        percentage={overview?.productionPlans.totalPlans ? 
                            ((overview.productionPlans.completedPlans / overview.productionPlans.totalPlans) * 100) : 0
                        }
                        icon={<CalendarIcon />}
                        color="blue"
                        trend="up"
                        onClick={() => handleCardClick('production-plans')}
                    />
                    <DashboardCard
                        title="Lệnh Sản Xuất"
                        value={overview?.productionOrders.totalOrders || 0}
                        percentage={overview?.productionOrders.totalOrders ? 
                            ((overview.productionOrders.completedOrders / overview.productionOrders.totalOrders) * 100) : 0
                        }
                        icon={<CogIcon />}
                        color="green"
                        trend="up"
                        onClick={() => handleCardClick('production-orders')}
                    />
                    <DashboardCard
                        title="Phiếu Kho"
                        value={overview?.inventorySlips.totalSlips || 0}
                        percentage={overview?.inventorySlips.totalSlips ? 
                            ((overview.inventorySlips.finalizedSlips / overview.inventorySlips.totalSlips) * 100) : 0
                        }
                        icon={<DocumentIcon />}
                        color="purple"
                        trend="up"
                        onClick={() => handleCardClick('inventory-slips')}
                    />
                    <DashboardCard
                        title="Vật Liệu"
                        value={overview?.materials.totalMaterials || 0}
                        percentage={overview?.materials.totalMaterials ? 
                            ((overview.materials.availableMaterials / overview.materials.totalMaterials) * 100) : 0
                        }
                        icon={<CubeIcon />}
                        color="orange"
                        trend="stable"
                        onClick={() => handleCardClick('materials')}
                    />
                </div>

                

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <ProductionChart
                        data={overview?.productionPlans.plansByStatus || []}
                        type="bar"
                        title="Kế Hoạch Theo Trạng Thái"
                    />
                    <ProductionChart
                        data={overview?.productionOrders.ordersByStatus || []}
                        type="bar"
                        title="Lệnh Sản Xuất Theo Trạng Thái"
                    />
                </div>


                {/* Tables */}
                {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ProductionTable
                        data={overview?.productionPlans.recentPlans || []}
                        columns={productionPlanColumns}
                        title="Kế Hoạch Gần Đây"
                        onRowClick={(row) => handleRowClick(row, 'production-plan')}
                    />
                    <ProductionTable
                        data={overview?.inventorySlips.recentSlips || []}
                        columns={inventorySlipColumns}
                        title="Phiếu Kho Gần Đây"
                        onRowClick={(row) => handleRowClick(row, 'inventory-slip')}
                    />
                </div> */}

                {/* Orders Section */}
                {/* <div className="mt-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Danh Sách Đơn Hàng</h2>
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Mã Đơn Hàng
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Khách Hàng
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Ngày Đặt
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tổng Giá Trị
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trạng Thái
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thao Tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {order.orderCode}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {order.customerName}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {order.totalValue.toLocaleString('vi-VN')} VNĐ
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                    order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleViewOrderDetails(order.id)}
                                                    className="text-blue-600 hover:text-blue-900 flex items-center"
                                                >
                                                    <EyeIcon className="w-4 h-4 mr-1" />
                                                    Xem chi tiết
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div> */}

                {/* Order Details Modal */}
                {/* {showOrderModal && selectedOrder && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                        <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-900">
                                    Chi Tiết Đơn Hàng: {selectedOrder.orderCode}
                                </h3>
                                <button
                                    onClick={() => setShowOrderModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>
                            
                            <div className="mb-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Khách Hàng</label>
                                        <p className="text-sm text-gray-900">{selectedOrder.customerName}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Ngày Đặt</label>
                                        <p className="text-sm text-gray-900">{new Date(selectedOrder.orderDate).toLocaleDateString('vi-VN')}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Tổng Giá Trị</label>
                                        <p className="text-sm text-gray-900">{selectedOrder.totalValue.toLocaleString('vi-VN')} VNĐ</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Trạng Thái</label>
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            selectedOrder.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                            selectedOrder.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {selectedOrder.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-md font-semibold text-gray-900 mb-4">Danh Sách Sản Phẩm</h4>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sản Phẩm</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Số Lượng Đặt</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Đã Giao</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Còn Lại</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Đơn Giá</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tình Trạng</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {selectedOrder.products.map((product) => (
                                                <tr key={product.id}>
                                                    <td className="px-4 py-2 text-sm text-gray-900">
                                                        <div>
                                                            <div className="font-medium">{product.productName}</div>
                                                            <div className="text-gray-500">{product.productCode}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-900">{product.quantity}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-900">{product.deliveredQuantity}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-900">{product.remainingQuantity}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-900">{product.unitPrice.toLocaleString('vi-VN')} VNĐ</td>
                                                    <td className="px-4 py-2 text-sm">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            product.deliveryStatus === 'Đã giao đủ' ? 'bg-green-100 text-green-800' :
                                                            product.deliveryStatus === 'Giao một phần' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            {product.deliveryStatus}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )} */}

                {/* Refresh Button */}
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={fetchProductionOverview}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Làm mới dữ liệu
                    </button>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default ProductionDashboard;
