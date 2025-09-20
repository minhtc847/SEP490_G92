'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getOrders, OrderDto, getOrdersNotUpdated, updateManySaleOrders } from '@/app/(defaults)/sales-order/service';
import { FiSearch } from 'react-icons/fi';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ExcelJS from 'exceljs';

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
        case 'Chưa thực hiện':
            return 'bg-gray-200 text-gray-800';
        case 'Đang thực hiện':
            return 'bg-yellow-200 text-yellow-800';
        case 'Hoàn thành':
            return 'bg-green-200 text-green-800';
        case 'Đã huỷ':
            return 'bg-red-200 text-red-800';
        default:
            return 'bg-blue-200 text-blue-800';
    }
};

const SalesOrderSummary = () => {
    const router = useRouter();

    const [orders, setOrders] = useState<OrderDto[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [sortAmount, setSortAmount] = useState<'asc' | 'desc' | null>(null);
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getOrders();
                const sortedData = data.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
                setOrders(data);
            } catch (error) {
                console.error('Lỗi khi tải đơn hàng:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getDeliveryStatusText = (status: number) => {
        switch (status) {
            case 0:
                return 'Chưa giao';
            case 1:
                return 'Đã giao một phần';
            case 2:
                return 'Đã giao dầy đủ';
            case 3:
                return 'Trả hàng';
        }
    };

    const getDeliveryStatusClass = (status: number) => {
        switch (status) {
            case 0:
                return 'badge-outline-warning';
            case 1:
                return 'badge-outline-info';
            case 2:
                return 'badge-outline-success';
            case 3:
                return 'badge-outline-danger';
        }
    };

    const filteredOrders = orders
        .filter((order) => order.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter((order) => {
            const orderDate = new Date(order.orderDate);

            if (fromDate && new Date(fromDate) > orderDate) return false;
            if (toDate && new Date(toDate) < orderDate) return false;

            return true;
        })
        .filter((order) => (statusFilter ? order.status === parseInt(statusFilter) : true))
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

    const handleUpdateAllOrders = async () => {
        try {
            setIsUpdating(true);
            setUpdateMessage('');
            
            // Lấy danh sách đơn hàng chưa cập nhật
            const ordersNotUpdated = await getOrdersNotUpdated();
            
            if (ordersNotUpdated.length === 0) {
                setUpdateMessage('Không có đơn hàng nào cần cập nhật!');
                return;
            }

            const confirmed = confirm(`Bạn có chắc chắn muốn cập nhật ${ordersNotUpdated.length} đơn hàng chưa cập nhật lên MISA?`);
            if (!confirmed) return;

            // Gọi API update tất cả đơn hàng
            await updateManySaleOrders(ordersNotUpdated);
            
            setUpdateMessage(`Đã gửi yêu cầu cập nhật ${ordersNotUpdated.length} đơn hàng lên MISA. Quá trình này sẽ chạy trong background.`);
            
            // Refresh danh sách đơn hàng sau 2 giây
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            
        } catch (err) {
            console.error('Lỗi khi cập nhật đơn hàng:', err);
            setUpdateMessage('Có lỗi xảy ra khi cập nhật đơn hàng!');
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusText = (status: number) => {
        switch (status) {
            case 0:
                return 'Chưa thực hiện';
            case 1:
                return 'Đang thực hiện';
            case 2:
                return 'Hoàn thành';
            case 3:
                return 'Đã huỷ';
            default:
                return 'Không xác định';
        }
    };

    const handleExportToExcel = async () => {
        const data = filteredOrders.map((order) => ({
            'STT': '',
            'Tên Khách Hàng': order.customerName,
            'Ngày Đặt': new Date(order.orderDate).toLocaleDateString('vi-VN'),
            'Mã Đơn Hàng': order.orderCode,
            'Thành Tiền (₫)': order.totalAmount,
            'Trạng Thái': getStatusText(order.status),
            'Giao Hàng': getDeliveryStatusText(order.deliveryStatus),
            'Cập nhật MISA': order.isUpdateMisa ? 'Đã cập nhật' : 'Chưa cập nhật',
        }));

        // Thêm STT
        data.forEach((item, index) => {
            item['STT'] = (index + 1).toString();
        });

        const headers = [
            'STT',
            'Tên Khách Hàng',
            'Ngày Đặt',
            'Mã Đơn Hàng',
            'Thành Tiền (₫)',
            'Trạng Thái',
            'Giao Hàng',
            'Cập nhật MISA',
        ];

        // Tạo workbook mới
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Đơn Hàng');

        // Thêm tiêu đề
        const titleRow = worksheet.addRow(['ĐƠN HÀNG BÁN']);
        titleRow.height = 30;
        worksheet.mergeCells('A1:H1');
        
        // Định dạng tiêu đề
        const titleCell = worksheet.getCell('A1');
        titleCell.font = { bold: true, size: 18 };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        titleCell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        // Thêm header
        const headerRow = worksheet.addRow(headers);
        headerRow.height = 25;
        
        // Định dạng header
        headerRow.eachCell((cell, colNumber) => {
            cell.font = { bold: true };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD3D3D3' }
            };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Thêm border cho cột cuối cùng của header
        const lastHeaderCell = headerRow.getCell(headers.length);
        lastHeaderCell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        // Thêm dữ liệu
        data.forEach((row) => {
            const dataRow = worksheet.addRow(headers.map(header => (row as any)[header]));
            dataRow.height = 20;
            
            dataRow.eachCell((cell, colNumber) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });

            // Thêm border cho cột cuối cùng của data row
            const lastDataCell = dataRow.getCell(headers.length);
            lastDataCell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Thêm dòng tổng
        const totalRow = worksheet.addRow(['Tổng', '', '', '', '', '', '', '']);
        totalRow.height = 25;
        worksheet.mergeCells(`A${totalRow.number}:B${totalRow.number}`);
        
        // Tổng thành tiền
        const totalAmount = data.reduce((sum, item) => sum + ((item as any)['Thành Tiền (₫)'] || 0), 0);
        const totalAmountCell = worksheet.getCell(`E${totalRow.number}`);
        totalAmountCell.value = totalAmount;
        
        // Định dạng dòng tổng
        totalRow.eachCell((cell, colNumber) => {
            cell.font = { bold: true };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD3D3D3' }
            };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Auto-size columns
        worksheet.columns.forEach(column => {
            let maxLength = 0;
            if (column.eachCell) {
                column.eachCell({ includeEmpty: true }, (cell) => {
                    const columnLength = cell.value?.toString()?.length || 10;
                    if (columnLength > maxLength) {
                        maxLength = columnLength;
                    }
                });
            }
            column.width = Math.min(Math.max(maxLength + 2, 10), 50);
        });

        // Xuất file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `TongHopDonHang_${new Date().toLocaleDateString('vi-VN').replaceAll('/', '-')}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return <div className="p-6">Đang tải đơn hàng...</div>;
    }

    return (
        <ProtectedRoute requiredRole={[1, 2]}>

        <div className="p-6 bg-white rounded-lg shadow">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Tóm tắt đơn hàng</h2>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleUpdateAllOrders} 
                        disabled={isUpdating}
                        className="px-4 py-2 text-sm text-white bg-orange-600 rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUpdating ? 'Đang cập nhật...' : 'Cập nhật tất cả đơn hàng chưa cập nhật'}
                    </button>
                    <button className="px-4 py-2 text-sm text-white bg-gray-600 rounded hover:bg-gray-700" onClick={handleExportToExcel}>
                         Xuất Excel
                    </button>
                    <button className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-800" onClick={() => router.push('/sales-order/create')}>
                        + Thêm đơn hàng
                    </button>
                </div>
            </div>

            {updateMessage && (
                <div className={`mb-4 p-3 rounded-xl border ${
                    updateMessage.includes('lỗi') || updateMessage.includes('thất bại') 
                        ? 'bg-red-100 text-red-800 border-red-300'
                        : 'bg-blue-100 text-blue-800 border-blue-300'
                }`}>
                    {updateMessage.includes('lỗi') || updateMessage.includes('thất bại') ? '❌' : '🔄'} {updateMessage}
                </div>
            )}

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
                        <option value="0">Chưa thực hiện</option>
                        <option value="1">Đang thực hiện</option>
                        <option value="2">Hoàn thành</option>
                        <option value="3">Đã huỷ</option>
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
                            <th>Tên Khách Hàng</th>
                            <th>Ngày Đặt</th>
                            <th>Mã Đơn Hàng</th>
                            <th>Thành Tiền</th>
                            <th>Trạng Thái</th>
                            <th>Giao Hàng</th>
                            <th>Cập nhật MISA</th>
                            <th>Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedOrders.map((order) => (
                            <tr key={order.id}>
                                <td>{order.customerName}</td>
                                <td>{new Date(order.orderDate).toLocaleDateString('vi-VN')}</td>
                                <td>{order.orderCode}</td>
                                <td>{order.totalAmount.toLocaleString()}₫</td>
                                <td>
                                    <span
                                        className={`badge ${
                                            order.status === 0
                                                ? 'badge-outline-warning'
                                                : order.status === 1
                                                  ? 'badge-outline-info'
                                                  : order.status === 2
                                                    ? 'badge-outline-success'
                                                    : order.status === 3
                                                      ? 'badge-outline-danger'
                                                      : 'badge-outline-default'
                                        }`}
                                    >
                                        {order.status === 0 ? 'Chưa thực hiện' : order.status === 1 ? 'Đang thực hiện' : order.status === 2 ? 'Hoàn thành' : 'Đã huỷ'}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge ${getDeliveryStatusClass(order.deliveryStatus)}`}>{getDeliveryStatusText(order.deliveryStatus)}</span>
                                </td>
                                <td>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        order.isUpdateMisa 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {order.isUpdateMisa ? 'Đã cập nhật' : 'Chưa cập nhật'}
                                    </span>
                                </td>
                                <td className="flex gap-2">
                                    <button
                                        className="px-2 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-800"
                                        onClick={() => {
                                            if (order.id) {
                                                router.push(`/sales-order/${order.id}`);
                                            } else {
                                                alert('Không tìm thấy ID đơn hàng!');
                                            }
                                        }}
                                    >
                                        Chi tiết
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
        </ProtectedRoute>

    );
};

export default SalesOrderSummary;
