'use client';

import { useState, useEffect } from 'react';
import { Transition, Dialog, DialogPanel, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';
import IconX from '@/components/icon/icon-x';
import IconSearch from '@/components/icon/icon-search';
import { getDeliveries, DeliveryDto } from '@/app/(defaults)/delivery/service';
import { useRouter } from 'next/navigation';

interface DeliverySelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DeliverySelectionModal: React.FC<DeliverySelectionModalProps> = ({ isOpen, onClose }) => {
    const router = useRouter();
    const [deliveries, setDeliveries] = useState<DeliveryDto[]>([]);
    const [filteredDeliveries, setFilteredDeliveries] = useState<DeliveryDto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedDelivery, setSelectedDelivery] = useState<DeliveryDto | null>(null);

    useEffect(() => {
        if (isOpen) {
            loadDeliveries();
        }
    }, [isOpen]);

    useEffect(() => {
        // Filter deliveries with status "FullyDelivered" (2) and apply search
        const filtered = deliveries.filter(delivery => {
            const matchesStatus = delivery.status === 2; // FullyDelivered
            const matchesSearch = 
                delivery.orderCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                delivery.customerName.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
        });
        setFilteredDeliveries(filtered);
    }, [deliveries, searchTerm]);

    const loadDeliveries = async () => {
        try {
            setLoading(true);
            const data = await getDeliveries();
            setDeliveries(data);
        } catch (error) {
            console.error('Lỗi khi tải danh sách giao hàng:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeliverySelect = (delivery: DeliveryDto) => {
        // If clicking on already selected delivery, deselect it
        if (selectedDelivery?.id === delivery.id) {
            setSelectedDelivery(null);
        } else {
            setSelectedDelivery(delivery);
        }
    };

    const handleCreateInvoice = () => {
        if (selectedDelivery) {
            // Navigate to create invoice page with delivery data
            const deliveryData = encodeURIComponent(JSON.stringify(selectedDelivery));
            router.push(`/invoices/create?delivery=${deliveryData}`);
            onClose();
        }
    };

    const getStatusText = (status: number) => {
        switch (status) {
            case 0:
                return 'Chưa giao hàng';
            case 1:
                return 'Đang giao hàng';
            case 2:
                return 'Đã giao hàng';
            case 3:
                return 'Đã hủy';
            default:
                return 'Không xác định';
        }
    };

    const getStatusClass = (status: number) => {
        switch (status) {
            case 0:
                return 'badge-outline-warning';
            case 1:
                return 'badge-outline-info';
            case 2:
                return 'badge-outline-success';
            case 3:
                return 'badge-outline-danger';
            default:
                return 'badge-outline-default';
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex items-center justify-between mb-6">
                                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                        Chọn đơn giao hàng đã hoàn thành
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="rounded-full p-1 hover:bg-gray-100 transition-colors"
                                    >
                                        <IconX className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Search Bar */}
                                <div className="mb-6">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Tìm theo mã đơn hàng hoặc tên khách hàng..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    </div>
                                </div>

                                {/* Selected Delivery Info */}
                                {selectedDelivery && (
                                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-blue-900">
                                                    Đã chọn: <span className="font-semibold">{selectedDelivery.orderCode}</span>
                                                </p>
                                                <p className="text-sm text-blue-700">
                                                    Khách hàng: {selectedDelivery.customerName}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setSelectedDelivery(null)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            >
                                                Bỏ chọn
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {loading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                        <p className="mt-2 text-gray-600">Đang tải danh sách giao hàng...</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Deliveries List */}
                                        <div className="max-h-96 overflow-y-auto mb-6">
                                            {filteredDeliveries.length === 0 ? (
                                                <div className="text-center py-8">
                                                    <p className="text-gray-500">
                                                        {searchTerm ? 'Không tìm thấy đơn giao hàng nào phù hợp' : 'Không có đơn giao hàng nào đã hoàn thành'}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {filteredDeliveries.map((delivery) => (
                                                        <div
                                                            key={delivery.id}
                                                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                                                selectedDelivery?.id === delivery.id
                                                                    ? 'border-blue-500 bg-blue-50'
                                                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                            }`}
                                                            onClick={() => handleDeliverySelect(delivery)}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-4 mb-2">
                                                                        <h4 className="font-semibold text-gray-900">
                                                                            {delivery.orderCode}
                                                                        </h4>
                                                                        <span className={`badge ${getStatusClass(delivery.status)}`}>
                                                                            {getStatusText(delivery.status)}
                                                                        </span>
                                                                    </div>
                                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                                                        <div>
                                                                            <span className="font-medium">Khách hàng:</span>
                                                                            <p>{delivery.customerName}</p>
                                                                        </div>
                                                                        <div>
                                                                            <span className="font-medium">Ngày giao hàng:</span>
                                                                            <p>{new Date(delivery.deliveryDate).toLocaleDateString('vi-VN')}</p>
                                                                        </div>
                                                                        {/* <div>
                                                                            <span className="font-medium">Tổng tiền:</span>
                                                                            <p className="font-semibold">{delivery.totalAmount.toLocaleString()}₫</p>
                                                                        </div> */}
                                                                    </div>
                                                                    {delivery.note && (
                                                                        <div className="mt-2">
                                                                            <span className="font-medium text-sm">Ghi chú:</span>
                                                                            <p className="text-sm text-gray-600">{delivery.note}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex justify-end gap-3">
                                            {selectedDelivery && (
                                                <button
                                                    onClick={() => setSelectedDelivery(null)}
                                                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                                >
                                                    Bỏ chọn
                                                </button>
                                            )}
                                            <button
                                                onClick={onClose}
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                Hủy
                                            </button>
                                            <button
                                                onClick={handleCreateInvoice}
                                                disabled={!selectedDelivery}
                                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Tạo hóa đơn
                                            </button>
                                        </div>
                                    </>
                                )}
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default DeliverySelectionModal;
