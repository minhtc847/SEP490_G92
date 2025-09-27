'use client';
import { useState, useEffect } from 'react';
import { Transition, Dialog, DialogPanel, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';
import IconX from '@/components/icon/icon-x';
import IconSearch from '@/components/icon/icon-search';
import { getPurchaseOrders, PurchaseOrderDto } from '@/app/(defaults)/purchase-order/service';
import { useRouter } from 'next/navigation';

interface OrderSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const OrderSelectionModal: React.FC<OrderSelectionModalProps> = ({ isOpen, onClose }) => {
    const router = useRouter();
    const [orders, setOrders] = useState<PurchaseOrderDto[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<PurchaseOrderDto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<PurchaseOrderDto | null>(null);

    // Fetch purchase orders with status "Imported" (status = 2)
    useEffect(() => {
        const fetchImportedOrders = async () => {
            setLoading(true);
            try {
                const allOrders = await getPurchaseOrders();
                const importedOrders = allOrders.filter(order => order.status === 'Imported');
                setOrders(importedOrders);
                setFilteredOrders(importedOrders);
            } catch (error) {
                console.error('Lỗi khi tải danh sách đơn mua hàng:', error);
                alert('Có lỗi xảy ra khi tải danh sách đơn mua hàng');
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchImportedOrders();
        }
    }, [isOpen]);

    // Filter orders based on search term
    useEffect(() => {
        const filtered = orders.filter(order =>
            order.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredOrders(filtered);
    }, [searchTerm, orders]);

    const handleOrderSelect = (order: PurchaseOrderDto) => {
        setSelectedOrder(order);
    };

    const handleCreateInvoice = () => {
        if (selectedOrder) {
            // Encode order data to pass to create page
            const orderData = encodeURIComponent(JSON.stringify(selectedOrder));
            router.push(`/invoices/create?order=${orderData}`);
            onClose();
        }
    };

    const handleViewOrderDetail = (order: PurchaseOrderDto) => {
        const orderId = order.id || order.id.toString();
        window.open(`/purchase-order/${orderId}`, '_blank');
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const formatCurrency = (amount: number | null) => {
        if (amount === null) return 'N/A';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getStatusBadge = (status: string | null) => {
        switch (status) {
            case 'Imported':
                return <span className="badge badge-outline-success">Đã nhập hàng</span>;
            case 'Ordered':
                return <span className="badge badge-outline-warning">Đã đặt hàng</span>;
            case 'Pending':
                return <span className="badge badge-outline-info">Chờ xử lý</span>;
            case 'Cancelled':
                return <span className="badge badge-outline-danger">Đã hủy</span>;
            default:
                return <span className="badge badge-outline-secondary">Không xác định</span>;
        }
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
                                    <div className="text-lg font-bold">Chọn đơn mua hàng để tạo hóa đơn</div>
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
                                                placeholder="Tìm kiếm theo mã đơn hàng, nhà cung cấp hoặc khách hàng..."
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
                                            <span className="ml-2">Đang tải danh sách đơn mua hàng...</span>
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
                                                            <p className="text-lg font-medium">Không tìm thấy đơn mua hàng phù hợp</p>
                                                            <p className="text-sm">Thử tìm kiếm với từ khóa khác</p>
                                                        </div>
                                                    ) : (
                                                        <div className="text-gray-500">
                                                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            <p className="text-lg font-medium">Không có đơn mua hàng nào đã nhập hàng</p>
                                                            <p className="text-sm">Chỉ những đơn mua hàng đã nhập hàng mới có thể tạo hóa đơn</p>
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
                                                                            {order.code}
                                                                        </div>
                                                                        {getStatusBadge(order.status)}
                                                                    </div>
                                                                    
                                                                    {order.customerName && (
                                                                        <div className="mt-1 text-sm text-gray-600">
                                                                            <span className="font-medium">Nhà cung cấp:</span> {order.customerName}
                                                                        </div>
                                                                    )}
                                                                    <div className="mt-1 text-sm text-gray-600">
                                                                        <span className="font-medium">Ngày đặt:</span> {formatDate(order.date)}
                                                                    </div>
                                                                    {order.description && (
                                                                        <div className="mt-1 text-sm text-gray-600">
                                                                            <span className="font-medium">Mô tả:</span> {order.description}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    {/* <div className="text-right">
                                                                        <div className="font-semibold text-lg">
                                                                            {formatCurrency(order.totalValue)}
                                                                        </div>
                                                                    </div> */}
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-outline-primary"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleViewOrderDetail(order);
                                                                        }}
                                                                        title="Xem chi tiết đơn mua hàng"
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
                                                    <h4 className="font-semibold text-primary">Đơn mua hàng đã chọn:</h4>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {selectedOrder.code} - {selectedOrder.customerName || 'N/A'}
                                                    </p>
                                                    {/* <p className="text-sm text-gray-600">
                                                        Tổng giá trị: {formatCurrency(selectedOrder.totalValue)}
                                                    </p> */}
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
                                            onClick={handleCreateInvoice}
                                        >
                                            Tạo hóa đơn
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