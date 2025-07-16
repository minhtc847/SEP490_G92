'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPurchaseOrders, PurchaseOrderDto } from './service';

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

const PurchaseOrderPage = () => {
    const [orders, setOrders] = useState<PurchaseOrderDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortAmount, setSortAmount] = useState<'asc' | 'desc' | null>(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const router = useRouter();
    const [searchDescription, setSearchDescription] = useState('');

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
        .filter((order) => order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(order => order.description?.toLowerCase().includes(searchDescription.toLowerCase()))
        .filter((order) => (statusFilter ? order.status === statusFilter : true))
        .sort((a, b) => {
            if (sortAmount === 'asc') return (a.totalValue || 0) - (b.totalValue || 0);
            if (sortAmount === 'desc') return (b.totalValue || 0) - (a.totalValue || 0);
            return 0;
        });

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

    if (loading) return <div className="p-6">Đang tải đơn hàng mua...</div>;

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Danh sách đơn hàng mua</h2>
                <button onClick={() => router.push('/purchase-order/create')} className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-800">
                    + Thêm đơn hàng mua
                </button>
            </div>

            {/* Bộ lọc */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-2/3">
                    <input
                        type="text"
                        placeholder="Tìm theo tên nhà cung cấp..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="input input-bordered w-full py-2 px-4 rounded-lg shadow-sm"
                    />
                    <input
                        type="text"
                        placeholder="Tìm theo mô tả..."
                        value={searchDescription}
                        onChange={(e) => {
                            setSearchDescription(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="input input-bordered w-full py-2 px-4 rounded-lg shadow-sm"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-4">
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
                        <option value="Chờ đặt hàng">Chờ đặt hàng</option>
                        <option value="Đã đặt hàng">Đã đặt hàng</option>
                        <option value="Hoàn thành">Đã nhập hàng</option>
                        {/* <option value="Đã huỷ">Đã huỷ</option> */}
                    </select>
                </div>
            </div>

            {/* Hiển thị thông tin dòng */}
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
            <div className="overflow-x-auto">
                <table className="table w-full border text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-3 py-2">Mô tả</th>
                            <th className="border px-3 py-2">Ngày tạo</th>
                            <th className="border px-3 py-2">Tổng tiền</th>
                            <th className="border px-3 py-2">Trạng thái</th>
                            <th className="border px-3 py-2">Nhà cung cấp</th>
                            <th className="border px-3 py-2">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedOrders.map((order) => (
                            <tr key={order.id}>
                                <td className="border px-3 py-2">{order.description || '-'}</td>
                                <td className="border px-3 py-2">{order.date ? new Date(order.date).toLocaleDateString('vi-VN') : ''}</td>
                                <td className="border px-3 py-2">{order.totalValue != null ? `${order.totalValue.toLocaleString()}₫` : '0₫'}</td>
                                <td>
                                    <span
                                        className={`badge ${
                                            order.status === 'Chờ đặt hàng'
                                                ? 'badge-outline-warning'
                                                : order.status === 'Đã đặt hàng'
                                                  ? 'badge-outline-info'
                                                  : order.status === 'Hoàn thành'
                                                    ? 'badge-outline-success'
                                                    : order.status === 'Đã huỷ'
                                                      ? 'badge-outline-danger'
                                                      : 'badge-outline-default'
                                        }`}
                                    >
                                        {order.status}
                                    </span>
                                </td>
                                {/* <td className="border px-3 py-2">
                                    <span className={`bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs`}>{order.status}</span>
                                </td> */}
                                <td className="border px-3 py-2">{order.customerName || '-'}</td>
                                <td className="border px-3 py-2 space-x-2">
                                    <button onClick={() => router.push(`/purchase-order/${order.id}`)} className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
                                        Chi tiết
                                    </button>
                                    <button onClick={() => alert(`Xoá đơn ${order.code}`)} className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm">
                                        Xoá
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Phân trang */}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
    );
};

export default PurchaseOrderPage;
