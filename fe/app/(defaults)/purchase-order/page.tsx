'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { importPurchaseOrder, deletePurchaseOrder, getPurchaseOrders, PurchaseOrderDto, updatePurchaseOrderStatus } from './service';
import { FiSearch } from 'react-icons/fi';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const Pagination = ({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) => {
    const renderPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition ${currentPage === i ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-300'}`}
                >
                    {i}
                </button>,
            );
        }
        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
            >
                &lt;
            </button>
            {renderPageNumbers()}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
            >
                &gt;
            </button>
        </div>
    );
};

const getStatusClass = (status: string) => {
    switch (status) {
        case 'Pending':
            return 'badge-outline-warning';
        case 'Ordered':
            return 'badge-outline-info';
        case 'Imported':
            return 'badge-outline-success';
        case 'Cancelled':
            return 'badge-outline-danger';
        default:
            return 'badge-outline-default';
    }
};

const getStatusText = (status: string) => {
    switch (status) {
        case 'Pending':
            return 'Chờ đặt hàng';
        case 'Ordered':
            return 'Đã đặt hàng';
        case 'Imported':
            return 'Đã nhập hàng';
        case 'Cancelled':
            return 'Đã hủy';
        default:
            return status;
    }
};

const PurchaseOrderPage = () => {
    const [orders, setOrders] = useState<PurchaseOrderDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortAmount, setSortAmount] = useState<'asc' | 'desc' | null>(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const router = useRouter();
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getPurchaseOrders();
                setOrders(data);
            } catch (err) {
                console.error('Lỗi khi tải đơn hàng mua:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredOrders = orders
        .filter((order) => {
            if (!fromDate && !toDate) return true;
            const orderDate = order.date ? new Date(order.date) : null;
            if (!orderDate) return false;

            const from = fromDate ? new Date(fromDate) : null;
            const to = toDate ? new Date(toDate) : null;

            if (from && orderDate < from) return false;
            if (to && orderDate > to) return false;

            return true;
        })
        .filter((order) => {
            const combined = `${order.customerName ?? ''} ${order.description ?? ''}`.toLowerCase();
            return combined.includes(searchTerm.toLowerCase());
        })
        .filter((order) => (statusFilter ? order.status === statusFilter : true))
        .sort((a, b) => {
            if (sortAmount === 'asc') return (a.totalValue || 0) - (b.totalValue || 0);
            if (sortAmount === 'desc') return (b.totalValue || 0) - (a.totalValue || 0);
            return 0;
        });

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

    if (loading) {
        return <div className="p-6">Đang tải đơn hàng mua...</div>;
    }

    return (
        <ProtectedRoute requiredRole={[1, 2]}>

        <div className="p-6 bg-white rounded-lg shadow">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Danh sách đơn hàng mua</h2>
                <button className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-800" onClick={() => router.push('/purchase-order/create')}>
                    + Thêm đơn hàng mua
                </button>
            </div>

            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:w-1/3">
                    <input
                        type="text"
                        placeholder="Tìm theo tên nhà cung cấp hoặc mô tả..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="input input-bordered w-full py-2 px-4 pr-12 rounded-lg shadow-sm"
                    />
                    <button
                        type="button"
                        className="absolute top-1/2 right-2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center shadow z-10"
                        onClick={() => console.log('Tìm kiếm:', searchTerm)}
                    >
                        <FiSearch className="text-white w-4 h-4" />
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium whitespace-nowrap">Từ:</label>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => {
                                    setFromDate(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="input input-bordered py-2 px-4 rounded-lg shadow-sm"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium whitespace-nowrap">Đến:</label>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => {
                                    setToDate(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="input input-bordered py-2 px-4 rounded-lg shadow-sm"
                            />
                        </div>
                    </div>

                    <select
                        onChange={(e) => {
                            const val = e.target.value;
                            setSortAmount(val === 'asc' ? 'asc' : val === 'desc' ? 'desc' : null);
                            setCurrentPage(1);
                        }}
                        className="select select-bordered py-2 px-4 rounded-lg shadow-sm"
                        defaultValue=""
                    >
                        <option value="">Tổng tiền</option>
                        <option value="asc">Thấp → Cao</option>
                        <option value="desc">Cao → Thấp</option>
                    </select>

                    <select
                        className="select select-bordered py-2 px-4 rounded-lg shadow-sm"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="Pending">Chờ đặt hàng</option>
                        <option value="Ordered">Đã đặt hàng</option>
                        <option value="Imported">Đã nhập hàng</option>
                        <option value="Cancelled">Đã hủy</option>
                    </select>
                </div>
            </div>

            {/* Thông tin hiển thị */}
            <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                <span>
                    Hiển thị {startIndex + 1} đến {Math.min(startIndex + itemsPerPage, filteredOrders.length)} trong tổng {filteredOrders.length} đơn hàng.
                </span>
                <select
                    className="select select-bordered py-2 px-4 rounded-lg shadow-sm"
                    value={itemsPerPage}
                    onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                    }}
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                </select>
            </div>

            {/* Bảng đơn hàng */}
            <div className="overflow-x-auto mb-5">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>Mô tả</th>
                            <th>Ngày tạo</th>
                            <th>Mã đơn hàng</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>Nhà cung cấp</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedOrders.map((order) => (
                            <tr key={order.id}>
                                <td>{order.description || '-'}</td>
                                <td>{order.date ? new Date(order.date).toLocaleDateString('vi-VN') : '-'}</td>
                                <td>{order.code || '-'}</td>
                                <td>{order.totalValue != null ? `${order.totalValue.toLocaleString()}₫` : '0₫'}</td>
                                <td>
                                    <span className={`badge ${getStatusClass(order.status || '')}`}>
                                        {getStatusText(order.status || '')}
                                    </span>
                                </td>
                                <td>{order.customerName || '-'}</td>
                                <td className="flex gap-2">
                                    <button
                                        className="px-2 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-800"
                                        onClick={() => {
                                            if (order.id) {
                                                router.push(`/purchase-order/${order.id}`);
                                            } else {
                                                alert('Không tìm thấy ID đơn hàng!');
                                            }
                                        }}
                                    >
                                        Chi tiết
                                    </button>
                                    
                                    {order.status === 'Pending' && (
                                        <>
                                            <button
                                                onClick={async () => {
                                                    if (confirm(`Bạn có chắc muốn đặt đơn hàng "${order.description}" không?`)) {
                                                        try {
                                                            await updatePurchaseOrderStatus(order.id, 1); // Ordered = 1
                                                            setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: 'Ordered' } : o)));
                                                            alert('Đơn hàng đã chuyển sang trạng thái "Đã đặt hàng".');
                                                        } catch (error) {
                                                            alert('Lỗi khi cập nhật trạng thái. Vui lòng thử lại.');
                                                        }
                                                    }
                                                }}
                                                className="px-2 py-1 text-sm text-white bg-yellow-500 rounded hover:bg-yellow-600"
                                            >
                                                Đặt hàng
                                            </button>

                                            <button
                                                onClick={async () => {
                                                    if (confirm(`Bạn có chắc muốn huỷ đơn hàng "${order.description}" không?`)) {
                                                        try {
                                                            await updatePurchaseOrderStatus(order.id, 3); // Cancelled = 3
                                                            setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: 'Cancelled' } : o)));
                                                            alert('Đơn hàng đã được huỷ.');
                                                        } catch (error) {
                                                            alert('Lỗi khi huỷ đơn hàng. Vui lòng thử lại.');
                                                        }
                                                    }
                                                }}
                                                className="px-2 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                                            >
                                                Huỷ đơn
                                            </button>
                                        </>
                                    )}
                                    {order.status !== 'Imported' && order.status !== 'Cancelled' && (
                                        <button
                                            onClick={async () => {
                                                if (confirm(`Bạn có chắc muốn nhập hàng cho đơn hàng "${order.description}" không?`)) {
                                                    try {
                                                        await importPurchaseOrder(order.id);
                                                        setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: 'Imported' } : o)));
                                                        alert('Đã nhập hàng thành công.');
                                                    } catch {
                                                        alert('Lỗi khi nhập hàng. Vui lòng thử lại.');
                                                    }
                                                }
                                            }}
                                            className="px-2 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700"
                                        >
                                            Nhập hàng
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Phân trang */}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
        </ProtectedRoute>

    );
};

export default PurchaseOrderPage;
