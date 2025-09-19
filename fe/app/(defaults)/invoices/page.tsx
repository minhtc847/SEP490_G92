'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getInvoices, InvoiceDto } from '@/app/(defaults)/invoices/service';
import { FiSearch } from 'react-icons/fi';
import OrderSelectionModal from '@/components/invoices/OrderSelectionModal';
import DeliverySelectionModal from '@/components/invoices/DeliverySelectionModal';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import * as XLSX from 'xlsx';

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

const getInvoiceTypeText = (type: number) => {
    switch (type) {
        case 0:
            return 'Bán hàng';
        case 1:
            return 'Mua hàng';
        default:
            return 'Không xác định';
    }
};

const getInvoiceTypeClass = (type: number) => {
    switch (type) {
        case 0:
            return 'badge-outline-success';
        case 1:
            return 'badge-outline-info';
        default:
            return 'badge-outline-default';
    }
};

const getStatusText = (status: number) => {
    switch (status) {
        case 0:
            return 'Chưa thanh toán';
        case 1:
            return 'Thanh toán một phần';
        case 2:
            return 'Đã thanh toán';
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
        default:
            return 'badge-outline-default';
    }
};

const InvoiceSummary = () => {
    const router = useRouter();

    const [invoices, setInvoices] = useState<InvoiceDto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [sortAmount, setSortAmount] = useState<'asc' | 'desc' | null>(null);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getInvoices();
                const sortedData = data.sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
                setInvoices(data);
            } catch (error) {
                console.error('Lỗi khi tải hóa đơn:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredInvoices = invoices
        .filter((invoice) => invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter((invoice) => {
            const invoiceDate = new Date(invoice.invoiceDate);

            if (fromDate && new Date(fromDate) > invoiceDate) return false;
            if (toDate && new Date(toDate) < invoiceDate) return false;

            return true;
        })
        .filter((invoice) => (statusFilter ? invoice.status === parseInt(statusFilter) : true))
        .filter((invoice) => (typeFilter ? invoice.invoiceType === parseInt(typeFilter) : true))
        .sort((a, b) => {
            if (sortAmount === 'asc') return a.totalAmount - b.totalAmount;
            if (sortAmount === 'desc') return b.totalAmount - a.totalAmount;
            return 0;
        });

    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);

    const handleExportInvoice = () => {
        alert('Xuất hóa đơn thành công!');
    };

    const handleSendInvoice = () => {
        alert('Gửi hóa đơn thành công!');
    };

    if (loading) {
        return <div className="p-6">Đang tải hóa đơn...</div>;
    }

    return (
        <ProtectedRoute requiredRole={[1, 2]}>

            <div className="p-6 bg-white rounded-lg shadow">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Tóm tắt hóa đơn</h2>
                    <div className="flex gap-2">
                        <button 
                            className="px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-800" 
                            onClick={() => setIsOrderModalOpen(true)}
                        >
                            + Tạo từ đơn mua hàng
                        </button>
                        <button 
                            className="px-4 py-2 text-sm text-white bg-purple-600 rounded hover:bg-purple-800" 
                            onClick={() => setIsDeliveryModalOpen(true)}
                        >
                            + Tạo từ đơn giao hàng
                        </button>
                        <button 
                            className="px-4 py-2 text-sm text-white bg-gray-600 rounded hover:bg-gray-700" 
                            onClick={() => {
                                const data = filteredInvoices.map((invoice) => ({
                                    'Mã Hóa Đơn': invoice.invoiceCode,
                                    'Khách Hàng': invoice.customerName,
                                    'Ngày Hóa Đơn': new Date(invoice.invoiceDate).toLocaleDateString('vi-VN'),
                                    'Loại': getInvoiceTypeText(invoice.invoiceType),
                                    'Tổng Tiền (₫)': invoice.totalAmount,
                                    'Trạng Thái': getStatusText(invoice.status),
                                }));
                                const headers = ['Mã Hóa Đơn', 'Khách Hàng', 'Ngày Hóa Đơn', 'Loại', 'Tổng Tiền (₫)', 'Trạng Thái'];
                                const worksheet = XLSX.utils.json_to_sheet(data.length ? data : [{}], { header: headers });
                                const workbook = XLSX.utils.book_new();
                                XLSX.utils.book_append_sheet(workbook, worksheet, 'HoaDon');
                                const fileName = `HoaDon_${new Date().toLocaleDateString('vi-VN').replaceAll('/', '-')}.xlsx`;
                                XLSX.writeFile(workbook, fileName);
                            }}
                        >
                            Xuất excel
                        </button>
                    </div>
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
                        <option value="">Tổng tiền</option>
                        <option value="asc">Thấp → Cao</option>
                        <option value="desc">Cao → Thấp</option>
                    </select>

                    <select
                        className="select select-bordered py-2 px-4 rounded-lg shadow-sm"
                        value={typeFilter}
                        onChange={(e) => {
                            setTypeFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="">Tất cả loại</option>
                        <option value="0">Bán hàng</option>
                        <option value="1">Mua hàng</option>
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
                        <option value="0">Chưa thanh toán</option>
                        <option value="1">Thanh toán một phần</option>
                        <option value="2">Đã thanh toán</option>
                    </select>
                </div>
            </div>

            {/* Thông tin hiển thị */}
            <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                <span>
                    Hiển thị {startIndex + 1} đến {Math.min(startIndex + itemsPerPage, filteredInvoices.length)} trong tổng {filteredInvoices.length} hóa đơn.
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

            {/* Bảng hóa đơn */}
            <div className="overflow-x-auto mb-5">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>Mã Hóa Đơn</th>
                            <th>Khách Hàng</th>
                            <th>Ngày Hóa Đơn</th>
                            <th>Loại</th>
                            <th>Tổng Tiền</th>
                            <th>Trạng Thái</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedInvoices.map((invoice) => (
                            <tr key={invoice.id}>
                                <td className="font-medium">{invoice.invoiceCode}</td>
                                <td>{invoice.customerName}</td>
                                <td>{new Date(invoice.invoiceDate).toLocaleDateString('vi-VN')}</td>
                                <td>
                                    <span className={`badge ${getInvoiceTypeClass(invoice.invoiceType)}`}>
                                        {getInvoiceTypeText(invoice.invoiceType)}
                                    </span>
                                </td>
                                <td className="font-medium">
                                    {invoice.totalAmount.toLocaleString()}₫
                                </td>
                                <td>
                                    <span className={`badge ${getStatusClass(invoice.status)}`}>
                                        {getStatusText(invoice.status)}
                                    </span>
                                </td>
                                <td className="flex gap-2">
                                    <button
                                        className="px-2 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-800"
                                        onClick={() => {
                                            if (invoice.id) {
                                                router.push(`/invoices/${invoice.id}`);
                                            } else {
                                                alert('Không tìm thấy ID hóa đơn!');
                                            }
                                        }}
                                    >
                                        Chi tiết
                                    </button>
                                    {/* <button 
                                        className="px-2 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-800" 
                                        onClick={handleExportInvoice}
                                    >
                                        Xuất PDF
                                    </button>
                                    <button 
                                        className="px-2 py-1 text-sm text-white bg-orange-600 rounded hover:bg-orange-800" 
                                        onClick={handleSendInvoice}
                                    >
                                        Gửi
                                    </button> */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Phân trang */}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>

            {/* Order Selection Modal */}
            <OrderSelectionModal 
                isOpen={isOrderModalOpen}
                onClose={() => setIsOrderModalOpen(false)}
            />

            {/* Delivery Selection Modal */}
            <DeliverySelectionModal 
                isOpen={isDeliveryModalOpen}
                onClose={() => setIsDeliveryModalOpen(false)}
            />
        </ProtectedRoute>
    );
};

export default InvoiceSummary;
