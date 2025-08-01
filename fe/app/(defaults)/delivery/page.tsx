'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDeliveries, DeliveryDto } from './service';
import { FiSearch } from 'react-icons/fi';

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

const getStatusClass = (status: number) => {
    switch (status) {
        case 0: // NotDelivered
            return 'badge-outline-warning';
        case 1: // Delivering
            return 'badge-outline-info';
        case 2: // FullyDelivered
            return 'badge-outline-success';
        default:
            return 'badge-outline-default';
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
        default:
            return 'Không xác định';
    }
};

const DeliverySummary = () => {
    const router = useRouter();

    const [deliveries, setDeliveries] = useState<DeliveryDto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortAmount, setSortAmount] = useState<'asc' | 'desc' | null>(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getDeliveries();
                const sortedData = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setDeliveries(data);
            } catch (error) {
                console.error('Lỗi khi tải phiếu giao hàng:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredDeliveries = deliveries
        .filter((delivery) => delivery.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter((delivery) => {
            const deliveryDate = new Date(delivery.deliveryDate);

            if (fromDate && new Date(fromDate) > deliveryDate) return false;
            if (toDate && new Date(toDate) < deliveryDate) return false;

            return true;
        })
        .filter((delivery) => (statusFilter ? delivery.status === parseInt(statusFilter) : true))
        .sort((a, b) => {
            if (sortAmount === 'asc') return a.totalAmount - b.totalAmount;
            if (sortAmount === 'desc') return b.totalAmount - a.totalAmount;
            return 0;
        });

    const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedDeliveries = filteredDeliveries.slice(startIndex, startIndex + itemsPerPage);

    if (loading) {
        return <div className="p-6">Đang tải phiếu giao hàng...</div>;
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Danh sách phiếu giao hàng</h2>
                <button className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-800" onClick={() => router.push('/delivery/create')}>
                    + Thêm phiếu giao hàng
                </button>
            </div>

            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:w-1/3">
                    <input
                        type="text"
                        placeholder="Tìm theo tên khách hàng..."
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
                        <option value="">Thành tiền</option>
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
                        <option value="0">Chưa giao hàng</option>
                        <option value="1">Đang giao hàng</option>
                        <option value="2">Đã giao hàng</option>
                    </select>
                </div>
            </div>

            {/* Thông tin hiển thị */}
            <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                <span>
                    Hiển thị {startIndex + 1} đến {Math.min(startIndex + itemsPerPage, filteredDeliveries.length)} trong tổng {filteredDeliveries.length} phiếu giao hàng.
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

            {/* Bảng phiếu giao hàng */}
            <div className="overflow-x-auto mb-5">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>Mã Đơn Hàng</th>
                            <th>Tên Khách Hàng</th>
                            <th>Ngày xuất kho</th>
                            <th>Ngày Giao Hàng</th>
                            <th>Tổng tiền</th>
                            <th>Trạng Thái</th>
                            <th>Ghi Chú</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedDeliveries.map((delivery) => (
                            <tr key={delivery.id}>
                                <td>{delivery.orderCode}</td>
                                <td>{delivery.customerName}</td>
                                <td>{new Date(delivery.deliveryDate).toLocaleDateString('vi-VN')}</td>
                                <td>{new Date(delivery.exportDate).toLocaleDateString('vi-VN')}</td>
                                <td>{delivery.totalAmount.toLocaleString()}₫</td>
                                <td>
                                    <span className={`badge ${getStatusClass(delivery.status)} whitespace-nowrap`}>
                                        {getStatusText(delivery.status)}
                                    </span>
                                </td>
                                <td className="max-w-xs truncate" title={delivery.note || ''}>
                                    {delivery.note || '-'}
                                </td>
                                <td className="flex gap-2">
                                    <button
                                        className="px-2 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-800"
                                        onClick={() => {
                                            if (delivery.id) {
                                                router.push(`/delivery/${delivery.id}`);
                                            } else {
                                                alert('Không tìm thấy ID phiếu giao hàng!');
                                            }
                                        }}
                                    >
                                        Chi tiết
                                    </button>
                                    <button 
                                        className="px-2 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-800"
                                        onClick={() => {
                                            // Handle delivery completion
                                            alert('Cập nhật trạng thái giao hàng thành công!');
                                        }}
                                    >
                                        Hoàn thành
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

export default DeliverySummary;
