'use client';

import React, { useState } from 'react';
// import { Eye, RefreshCcw, Search, CalendarDays, ChevronDown, Filter, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { mockOrders } from '@/app/data/mock-orders';

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

const SalesOrderSummary = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [sortAmount, setSortAmount] = useState<'asc' | 'desc' | null>(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const router = useRouter();

    const filteredOrders = mockOrders
        .filter((order) => order.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter((order) => (selectedDate ? order.orderDate === selectedDate : true))
        .filter((order) => (statusFilter ? order.status === statusFilter : true))
        .sort((a, b) => {
            if (sortAmount === 'asc') return a.totalAmount - b.totalAmount;
            if (sortAmount === 'desc') return b.totalAmount - a.totalAmount;
            return 0;
        });

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

    const handleUpdateMisa = () => {
        alert('Đồng bộ thành công vào MISA!');
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Tóm tắt đơn hàng</h2>

            {/* Bộ lọc */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:w-1/3">
                    {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /> */}
                    <input
                        type="text"
                        placeholder="Tìm theo tên khách hàng..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="input input-bordered w-full pl-10 pr-4 py-2 rounded-lg shadow-sm"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative">
                        {/* <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /> */}
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => {
                                setSelectedDate(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="input input-bordered pl-10 pr-4 py-2 rounded-lg shadow-sm"
                        />
                    </div>

                    <div className="relative">
                        {/* <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /> */}
                        <select
                            onChange={(e) => {
                                const val = e.target.value;
                                setSortAmount(val === 'asc' ? 'asc' : val === 'desc' ? 'desc' : null);
                                setCurrentPage(1);
                            }}
                            className="select select-bordered pl-10 pr-10 py-2 rounded-lg shadow-sm"
                            defaultValue=""
                        >
                            <option value="">Thành tiền</option>
                            <option value="asc">Thấp → Cao</option>
                            <option value="desc">Cao → Thấp</option>
                        </select>
                        {/* <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} /> */}
                    </div>

                    <div className="relative">
                        {/* <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /> */}
                        <select
                            className="select select-bordered pl-10 pr-4 py-2 rounded-lg shadow-sm"
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="Đã xác nhận">Đã xác nhận</option>
                            <option value="Đang xử lý">Đang xử lý</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Hiển thị thông tin và chọn số dòng */}
            <div className="flex flex-wrap items-center gap-2 mb-3 text-sm text-gray-600">
                <span>
                    Hiển thị {startIndex + 1} đến {Math.min(startIndex + itemsPerPage, filteredOrders.length)} trong tổng {filteredOrders.length} đơn hàng.
                </span>
                <select
                    className="select select-bordered border-gray-300 pl-4 pr-4 py-2 rounded-lg shadow-sm"
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
                            <th>Tên Khách Hàng</th>
                            <th>Ngày Đặt</th>
                            <th>Mã Đơn Hàng</th>
                            <th>Thành Tiền</th>
                            <th>Trạng Thái</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedOrders.map((order) => (
                            <tr key={order.id}>
                                <td>{order.customerName}</td>
                                <td>{order.orderDate}</td>
                                <td>{order.id}</td>
                                <td>{order.totalAmount.toLocaleString()}₫</td>
                                <td>
                                    <span className={`badge whitespace-nowrap ${order.status === 'Đã xác nhận' ? 'badge-outline-primary' : 'badge-outline-warning'}`}>{order.status}</span>
                                </td>
                                <td className="flex gap-2">
                                    <button
                                        className="px-2 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-800 transition"
                                        title="Chi tiết"
                                        onClick={() => router.push(`/sales-order/${order.id}`)}>
                                        {/* <Eye className="w-5 h-5 text-blue-600 hover:text-blue-800" /> */}
                                        Chi tiết
                                    </button>
                                    <button 
                                        className="px-2 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-800 transition" 
                                        title="Update MISA" 
                                        onClick={handleUpdateMisa}>
                                        {/* <RefreshCcw className="w-5 h-5 text-green-600 hover:text-green-800" /> */}
                                        Update MISA
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

export default SalesOrderSummary;
