'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import IconPencil from '@/components/icon/icon-pencil';
import IconEye from '@/components/icon/icon-eye';
import IconTrash from '@/components/icon/icon-trash';
import zaloOrderService, { ZaloOrder } from '@/services/zaloOrderService';

const ZaloOrders = () => {
    const router = useRouter();
    const [zaloOrders, setZaloOrders] = useState<ZaloOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchZaloOrders();
    }, []);

    const fetchZaloOrders = async () => {
        try {
            const data = await zaloOrderService.getAllZaloOrders();
            setZaloOrders(data);
        } catch (error) {
            console.error('Error fetching Zalo orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteOrder = async (id: number) => {
        if (confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
            try {
                await zaloOrderService.deleteZaloOrder(id);
                alert('Xóa đơn hàng thành công!');
                fetchZaloOrders(); // Refresh the list
            } catch (error) {
                console.error('Error deleting Zalo order:', error);
                alert('Có lỗi xảy ra khi xóa đơn hàng');
            }
        }
    };

    const getStatusBadge = (status: string) => {
        const statusClasses = {
            Pending: 'bg-yellow-500 text-white',
            Confirmed: 'bg-blue-500 text-white',
            Processing: 'bg-orange-500 text-white',
            Completed: 'bg-green-500 text-white',
            Cancelled: 'bg-red-500 text-white',
        };
        
        return (
            <span className={`badge ${statusClasses[status as keyof typeof statusClasses] || 'bg-gray-500 text-white'}`}>
                {status}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin border-4 border-primary border-l-transparent rounded-full w-12 h-12"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="panel mt-6">
                <div className="flex items-center justify-between mb-5">
                    <h5 className="font-semibold text-lg dark:text-white-light">Danh Sách Đơn Hàng Zalo</h5>
                </div>

                <div className="table-responsive">
                    <table className="table-striped">
                        <thead>
                            <tr>
                                <th>Mã Đơn Hàng</th>
                                <th>Khách Hàng</th>
                                <th>Số Điện Thoại</th>
                                <th>Ngày Đặt</th>
                                <th>Tổng Tiền</th>
                                <th>Trạng Thái</th>
                                <th>Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {zaloOrders.map((order) => (
                                <tr key={order.id}>
                                    <td>
                                        <div className="font-semibold">{order.orderCode}</div>
                                    </td>
                                    <td>
                                        <div>
                                            <div className="font-semibold">{order.customerName}</div>
                                            <div className="text-xs text-gray-500">{order.customerAddress}</div>
                                        </div>
                                    </td>
                                    <td>{order.customerPhone}</td>
                                    <td>{formatDate(order.orderDate)}</td>
                                    <td className="font-semibold">{formatCurrency(order.totalAmount)}</td>
                                    <td>{getStatusBadge(order.status)}</td>
                                    <td className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => router.push(`/zalo-orders/${order.id}`)}
                                            >
                                                <IconEye className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-info"
                                                onClick={() => router.push(`/zalo-orders/${order.id}/edit`)}
                                            >
                                                <IconPencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDeleteOrder(order.id)}
                                            >
                                                <IconTrash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {zaloOrders.length === 0 && (
                    <div className="text-center py-8">
                        <div className="text-gray-500 text-lg">Không có đơn hàng nào</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ZaloOrders;
