'use client';
import { useState, useEffect } from 'react';
import { Transition, Dialog, DialogPanel, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';
import IconX from '@/components/icon/icon-x';
import IconSearch from '@/components/icon/icon-search';
import { getOrders, OrderDto } from '@/app/(defaults)/sales-order/service';
import { useRouter } from 'next/navigation';

interface OrderSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const OrderSelectionModal: React.FC<OrderSelectionModalProps> = ({ isOpen, onClose }) => {
    const router = useRouter();
    const [orders, setOrders] = useState<OrderDto[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<OrderDto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);

    // Fetch orders with status 0 (pending)
    useEffect(() => {
        const fetchPendingOrders = async () => {
            setLoading(true);
            try {
                const allOrders = await getOrders();
                const pendingOrders = allOrders.filter(order => order.status === 0);
                setOrders(pendingOrders);
                setFilteredOrders(pendingOrders);
            } catch (error) {
                console.error('Lỗi khi tải danh sách đơn hàng:', error);
                alert('Có lỗi xảy ra khi tải danh sách đơn hàng');
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchPendingOrders();
        }
    }, [isOpen]);

    // Filter orders based on search term
    useEffect(() => {
        const filtered = orders.filter(order =>
            order.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredOrders(filtered);
    }, [searchTerm, orders]);

    const handleOrderSelect = (order: OrderDto) => {
        setSelectedOrder(order);
    };

    const handleCreatePlan = () => {
        if (selectedOrder) {
            // Encode order data to pass to create page
            const orderData = encodeURIComponent(JSON.stringify(selectedOrder));
            router.push(`/production-plans/create?order=${orderData}`);
            onClose();
        }
    };

    const handleViewOrderDetail = (order: OrderDto) => {
        const orderId = order.orderCode.replace(/^DH/, '');
        window.open(`/sales-order/${orderId}`, '_blank');
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

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" open={isOpen} onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0" />
                </TransitionChild>
                <div className="fixed inset-0 bg-[black]/60 z-[999] overflow-y-auto">
                    <div className="flex items-start justify-center min-h-screen px-4">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel as="div" className="panel my-8 w-full max-w-4xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                                    <div className="text-lg font-bold">Chọn đơn hàng để tạo kế hoạch sản xuất</div>
                                    <button type="button" className="text-white-dark hover:text-dark" onClick={onClose}>
                                        <IconX />
                                    </button>
                                </div>
                                <div className="p-5">
                                    {/* Search */}
                                    <div className="mb-4">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Tìm kiếm theo mã đơn hàng hoặc tên khách hàng..."
                                                className="form-input w-full pl-10"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        </div>
                                    </div>

                                    {/* Loading */}
                                    {loading && (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                            <span className="ml-2">Đang tải danh sách đơn hàng...</span>
                                        </div>
                                    )}

                                    {/* Orders List */}
                                    {!loading && (
                                        <div className="max-h-96 overflow-y-auto">
                                            {filteredOrders.length === 0 ? (
                                                <div className="text-center py-8">
                                                    {searchTerm ? (
                                                        <div className="text-gray-500">
                                                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                            </svg>
                                                            <p className="text-lg font-medium">Không tìm thấy đơn hàng phù hợp</p>
                                                            <p className="text-sm">Thử tìm kiếm với từ khóa khác</p>
                                                        </div>
                                                    ) : (
                                                        <div className="text-gray-500">
                                                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            <p className="text-lg font-medium">Không có đơn hàng nào đang chờ xử lý</p>
                                                            <p className="text-sm">Tất cả đơn hàng đã được xử lý hoặc đang trong quá trình sản xuất</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {filteredOrders.map((order) => (
                                                        <div
                                                            key={order.id}
                                                            className={`p-4 border rounded-lg transition-colors ${
                                                                selectedOrder?.id === order.id
                                                                    ? 'border-primary bg-primary/5'
                                                                    : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex-1 cursor-pointer" onClick={() => handleOrderSelect(order)}>
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="font-semibold text-primary">
                                                                            {order.orderCode}
                                                                        </div>
                                                                        <span className="badge badge-outline-warning">
                                                                            Chưa thực hiện
                                                                        </span>
                                                                    </div>
                                                                    <div className="mt-1 text-sm text-gray-600">
                                                                        <span className="font-medium">Khách hàng:</span> {order.customerName}
                                                                    </div>
                                                                    <div className="mt-1 text-sm text-gray-600">
                                                                        <span className="font-medium">Ngày đặt:</span> {formatDate(order.orderDate)}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="text-right">
                                                                        <div className="font-semibold text-lg">
                                                                            {formatCurrency(order.totalAmount)}
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-primary"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleViewOrderDetail(order);
                                                                        }}
                                                                        title="Xem chi tiết đơn hàng"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Selected Order Info */}
                                    {selectedOrder && (
                                        <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-primary">Đơn hàng đã chọn:</h4>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {selectedOrder.orderCode} - {selectedOrder.customerName}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Tổng giá trị: {formatCurrency(selectedOrder.totalAmount)}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={() => setSelectedOrder(null)}
                                                >
                                                    Bỏ chọn
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex justify-end items-center mt-6 gap-3">
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger"
                                            onClick={onClose}
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            disabled={!selectedOrder}
                                            onClick={handleCreatePlan}
                                        >
                                            Tạo kế hoạch sản xuất
                                        </button>
                                    </div>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default OrderSelectionModal; 