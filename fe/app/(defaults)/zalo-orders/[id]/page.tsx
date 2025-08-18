'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import IconArrowLeft from '@/components/icon/icon-arrow-left';
import IconPencil from '@/components/icon/icon-pencil';
import zaloOrderService, { ZaloOrder } from '@/app/(defaults)/zalo-orders/zaloOrderService';

const ZaloOrderDetail = () => {
    const router = useRouter();
    const params = useParams();
    const [zaloOrder, setZaloOrder] = useState<ZaloOrder | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchZaloOrder(params.id as string);
        }
    }, [params.id]);

    const fetchZaloOrder = async (id: string) => {
        try {
            const data = await zaloOrderService.getZaloOrderById(parseInt(id));
            setZaloOrder(data);
        } catch (error) {
            console.error('Error fetching Zalo order:', error);
        } finally {
            setLoading(false);
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

    if (!zaloOrder) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-gray-500 text-lg">Không tìm thấy đơn hàng</div>
                    <button
                        type="button"
                        className="btn btn-primary mt-4"
                        onClick={() => router.push('/zalo-orders')}
                    >
                        <IconArrowLeft className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                        Quay Lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="panel mt-6">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => router.push('/zalo-orders')}
                        >
                            <IconArrowLeft className="w-4 h-4" />
                        </button>
                        <h5 className="font-semibold text-lg dark:text-white-light">
                            Chi Tiết Đơn Hàng: {zaloOrder.orderCode}
                        </h5>
                    </div>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => router.push(`/zalo-orders/${zaloOrder.id}/edit`)}
                    >
                        <IconPencil className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                        Chỉnh Sửa
                    </button>
                </div>

                {/* Order Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="panel">
                        <h6 className="text-lg font-semibold mb-4">Thông Tin Đơn Hàng</h6>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="font-medium">Mã Đơn Hàng:</span>
                                <span>{zaloOrder.orderCode}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Ngày Đặt:</span>
                                <span>{formatDate(zaloOrder.orderDate)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Trạng Thái:</span>
                                <span>{getStatusBadge(zaloOrder.status)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Tổng Tiền:</span>
                                <span className="font-semibold text-lg">{formatCurrency(zaloOrder.totalAmount)}</span>
                            </div>
                            {zaloOrder.note && (
                                <div className="flex justify-between">
                                    <span className="font-medium">Ghi Chú:</span>
                                    <span className="text-right max-w-xs">{zaloOrder.note}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="panel">
                        <h6 className="text-lg font-semibold mb-4">Thông Tin Khách Hàng</h6>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="font-medium">Tên Khách Hàng:</span>
                                <span>{zaloOrder.customerName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Số Điện Thoại:</span>
                                <span>{zaloOrder.customerPhone}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Địa Chỉ:</span>
                                <span className="text-right max-w-xs">{zaloOrder.customerAddress}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Zalo User ID:</span>
                                <span className="text-sm text-gray-500">{zaloOrder.zaloUserId}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Details */}
                <div className="panel">
                    <h6 className="text-lg font-semibold mb-4">Chi Tiết Sản Phẩm</h6>
                    <div className="table-responsive">
                        <table className="table-striped">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Tên Sản Phẩm</th>
                                    <th>Số Lượng</th>
                                    <th>Đơn Giá</th>
                                    <th>Thành Tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {zaloOrder.zaloOrderDetails.map((detail, index) => (
                                    <tr key={detail.id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div className="font-semibold">{detail.productName}</div>
                                        </td>
                                        <td>{detail.quantity}</td>
                                        <td>{formatCurrency(detail.unitPrice)}</td>
                                        <td className="font-semibold">{formatCurrency(detail.totalPrice)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="font-semibold">
                                    <td colSpan={4} className="text-right">Tổng Cộng:</td>
                                    <td>{formatCurrency(zaloOrder.totalAmount)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Timestamps */}
                <div className="panel mt-6">
                    <h6 className="text-lg font-semibold mb-4">Thông Tin Hệ Thống</h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex justify-between">
                            <span className="font-medium">Ngày Tạo:</span>
                            <span>{formatDate(zaloOrder.createdAt)}</span>
                        </div>
                        {zaloOrder.updatedAt && (
                            <div className="flex justify-between">
                                <span className="font-medium">Ngày Cập Nhật:</span>
                                <span>{formatDate(zaloOrder.updatedAt)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ZaloOrderDetail;
