'use client';

import React, { useState } from 'react';
// import { Eye, RefreshCcw, Search, CalendarDays, ChevronDown, Filter, DollarSign } from 'lucide-react'; // pnpm install lucide-react
import PanelCodeHighlight from '@/components/panel-code-highlight';
import { useRouter } from 'next/navigation';

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
    const originalOrders = [
        { id: 'DH00001', customerName: 'Nguyễn Văn A', orderDate: '2025-06-01', totalAmount: 2500000, status: 'Đã xác nhận' },
        { id: 'DH00002', customerName: 'Trần Thị B', orderDate: '2025-06-02', totalAmount: 1200000, status: 'Đang xử lý' },
        { id: 'DH00003', customerName: 'Phạm Văn C', orderDate: '2025-06-03', totalAmount: 3800000, status: 'Đã xác nhận' },
        { id: 'DH00004', customerName: 'Lê Thị D', orderDate: '2025-06-04', totalAmount: 1500000, status: 'Đang xử lý' },
        { id: 'DH00005', customerName: 'Vũ Văn E', orderDate: '2025-06-05', totalAmount: 2700000, status: 'Đã xác nhận' },
        { id: 'DH00006', customerName: 'Hoàng Thị F', orderDate: '2025-06-06', totalAmount: 3100000, status: 'Đang xử lý' },
        { id: 'DH00007', customerName: 'Đỗ Văn G', orderDate: '2025-06-07', totalAmount: 1800000, status: 'Đã xác nhận' },
        { id: 'DH00008', customerName: 'Ngô Thị H', orderDate: '2025-06-08', totalAmount: 4500000, status: 'Đang xử lý' },
        { id: 'DH00009', customerName: 'Phan Văn I', orderDate: '2025-06-09', totalAmount: 2200000, status: 'Đã xác nhận' },
        { id: 'DH00010', customerName: 'Trịnh Thị J', orderDate: '2025-06-10', totalAmount: 1900000, status: 'Đang xử lý' },
        { id: 'DH00011', customerName: 'Mai Văn K', orderDate: '2025-06-11', totalAmount: 3300000, status: 'Đã xác nhận' },
        { id: 'DH00012', customerName: 'Nguyễn Thị L', orderDate: '2025-06-12', totalAmount: 2100000, status: 'Đang xử lý' },
        { id: 'DH00013', customerName: 'Trần Văn M', orderDate: '2025-06-13', totalAmount: 3900000, status: 'Đã xác nhận' },
        { id: 'DH00014', customerName: 'Lý Thị N', orderDate: '2025-06-14', totalAmount: 1700000, status: 'Đang xử lý' },
        { id: 'DH00015', customerName: 'Bùi Văn O', orderDate: '2025-06-15', totalAmount: 2600000, status: 'Đã xác nhận' },
        { id: 'DH00016', customerName: 'Nguyễn Văn P', orderDate: '2025-06-16', totalAmount: 2800000, status: 'Đã xác nhận' },
        { id: 'DH00017', customerName: 'Trần Thị Q', orderDate: '2025-06-17', totalAmount: 3200000, status: 'Đang xử lý' },
        { id: 'DH00018', customerName: 'Phạm Văn R', orderDate: '2025-06-18', totalAmount: 3500000, status: 'Đã xác nhận' },
        { id: 'DH00019', customerName: 'Lê Thị S', orderDate: '2025-06-19', totalAmount: 2900000, status: 'Đang xử lý' },
        { id: 'DH00020', customerName: 'Vũ Văn T', orderDate: '2025-06-20', totalAmount: 4000000, status: 'Đã xác nhận' },
        { id: 'DH00021', customerName: 'Hoàng Thị U', orderDate: '2025-06-21', totalAmount: 2150000, status: 'Đang xử lý' },
        { id: 'DH00022', customerName: 'Đỗ Văn V', orderDate: '2025-06-22', totalAmount: 1850000, status: 'Đã xác nhận' },
        { id: 'DH00023', customerName: 'Ngô Thị W', orderDate: '2025-06-23', totalAmount: 3100000, status: 'Đang xử lý' },
        { id: 'DH00024', customerName: 'Phan Văn X', orderDate: '2025-06-24', totalAmount: 2650000, status: 'Đã xác nhận' },
        { id: 'DH00025', customerName: 'Trịnh Thị Y', orderDate: '2025-06-25', totalAmount: 2750000, status: 'Đang xử lý' },
        { id: 'DH00026', customerName: 'Mai Văn Z', orderDate: '2025-06-26', totalAmount: 3050000, status: 'Đã xác nhận' },
        { id: 'DH00027', customerName: 'Nguyễn Thị AA', orderDate: '2025-06-27', totalAmount: 2950000, status: 'Đang xử lý' },
        { id: 'DH00028', customerName: 'Trần Văn BB', orderDate: '2025-06-28', totalAmount: 3850000, status: 'Đã xác nhận' },
        { id: 'DH00029', customerName: 'Lý Thị CC', orderDate: '2025-06-29', totalAmount: 2350000, status: 'Đang xử lý' },
        { id: 'DH00030', customerName: 'Bùi Văn DD', orderDate: '2025-06-30', totalAmount: 2600000, status: 'Đã xác nhận' },
    ];

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [sortAmount, setSortAmount] = useState<'asc' | 'desc' | null>(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const router = useRouter();

    const filteredOrders = originalOrders
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
        // Fake API call
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
                            className="select select-bordered appearance-none pl-10 pr-10 py-2 rounded-lg shadow-sm"
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
            <div className="flex flex-wrap justify-between items-center mb-3 gap-4 text-sm text-gray-600">
                <span>
                    Hiển thị {startIndex + 1} đến {Math.min(startIndex + itemsPerPage, filteredOrders.length)} trong tổng {filteredOrders.length} đơn hàng.
                    <select
                        id="rowsPerPage"
                        className="select select-bordered appearance-none border border-gray-300 pl-5 pr-4 py-2 rounded-lg shadow-sm "
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
                </span>
            </div>

            {/* Bảng đơn hàng */}
            <div className="table-responsive mb-5">
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
                                    <button title="Chi tiết" onClick={() => router.push(`/sales-order/${order.id}`)}>
                                        {/* <Eye className="w-5 h-5 text-blue-600 hover:text-blue-800" /> */}
                                    </button>
                                    <button title="Update MISA" onClick={handleUpdateMisa}>
                                        {/* <RefreshCcw className="w-5 h-5 text-green-600 hover:text-green-800" /> */}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Phân trang dạng số giống DataTables */}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full text-center">
                        <h2 className="text-lg font-semibold mb-4">Đồng bộ thành công</h2>
                        <p>Đơn hàng đã được đồng bộ vào MISA.</p>
                        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={() => setShowSuccessModal(false)}>
                            Đóng
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalesOrderSummary;
