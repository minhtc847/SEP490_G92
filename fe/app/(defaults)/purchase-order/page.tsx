'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { getPurchaseOrders, PurchaseOrderDto, getPurchaseOrdersNotUpdated, updateManyPurchaseOrders, checkPurchaseOrderProductsMisaStatus } from './service';
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
    const roleId = useSelector((state: IRootState) => state.auth.user?.roleId);
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
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('');

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
            const combined = `${order.customerName ?? ''} ${order.code ?? ''}`.toLowerCase();
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

    const handleUpdateAllOrders = async () => {
        try {
            setIsUpdating(true);
            setUpdateMessage('');
            
            // Lấy danh sách đơn hàng chưa cập nhật
            const ordersNotUpdated = await getPurchaseOrdersNotUpdated();
            
            if (ordersNotUpdated.length === 0) {
                setUpdateMessage('Không có đơn hàng nào cần đồng bộ!');
                return;
            }

            const confirmed = confirm(`Bạn có chắc chắn muốn đồng bộ ${ordersNotUpdated.length} đơn hàng chưa cập nhật lên MISA?`);
            if (!confirmed) return;

            // Pre-validate all selected orders
            const validations = await Promise.all(
                ordersNotUpdated.map(o => checkPurchaseOrderProductsMisaStatus(o.id))
            );

            const invalids = validations
                .map((v, idx) => ({ v, order: ordersNotUpdated[idx] }))
                .filter(x => !x.v?.canUpdateMisa);

            if (invalids.length > 0) {
                setUpdateMessage('Tồn tại đơn hàng có sản phẩm chưa được đồng bộ. Vui lòng đồng bộ sản phẩm trước.');
                return;
            }

            // Gọi API update tất cả đơn hàng
            await updateManyPurchaseOrders(ordersNotUpdated);
            
            setUpdateMessage(`Đã gửi yêu cầu đồng bộ ${ordersNotUpdated.length} đơn hàng lên MISA. Quá trình này sẽ chạy trong background.`);
            
            // Refresh danh sách đơn hàng sau 2 giây
            setTimeout(() => {
                window.location.reload();
            }, 2000);
            
        } catch (err) {
            console.error('Lỗi khi đồng bộ đơn hàng:', err);
            setUpdateMessage('Có lỗi xảy ra khi đồng bộ đơn hàng!');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleExportToExcel = async () => {
        const data = filteredOrders.map((order) => ({
            'STT': '',
            'Ngày tạo': order.date ? new Date(order.date).toLocaleDateString('vi-VN') : '-',
            'Mã đơn hàng': order.code || '-',
            'Tổng tiền (VNĐ)': order.totalValue || 0,
            'Trạng thái': getStatusText(order.status || ''),
            'MISA': order.isUpdateMisa ? 'Đã đồng bộ' : 'Chưa đồng bộ',
            'Nhà cung cấp': order.customerName || '-',
        }));

        // Thêm STT
        data.forEach((item, index) => {
            item['STT'] = (index + 1).toString();
        });

        const headers = [
            'STT',
            'Ngày tạo',
            'Mã đơn hàng',
            'Tổng tiền (VNĐ)',
            'Trạng thái',
            'MISA',
            'Nhà cung cấp',
        ];

        // Tạo workbook mới
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Đơn Mua Hàng');

        // Thêm tiêu đề
        const titleRow = worksheet.addRow(['ĐƠN MUA HÀNG']);
        titleRow.height = 30;
        worksheet.mergeCells('A1:G1');
        
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
        });

        // Thêm dòng tổng
        const totalAmount = data.reduce((sum, item) => sum + ((item as any)['Tổng tiền (VNĐ)'] || 0), 0);
        const totalRow = worksheet.addRow(['Tổng', '', '', totalAmount, '', '', '']);
        totalRow.height = 25;
        worksheet.mergeCells(`A${totalRow.number}:B${totalRow.number}`);
        
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
        link.download = `DonHangMua_${new Date().toLocaleDateString('vi-VN').replaceAll('/', '-')}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return <div className="p-6">Đang tải đơn hàng mua...</div>;
    }

    return (
        <ProtectedRoute requiredRole={[1, 2]}>

        <div className="p-6 bg-white rounded-lg shadow">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Danh sách đơn hàng mua</h2>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleUpdateAllOrders} 
                        disabled={isUpdating}
                        className="px-4 py-2 text-sm text-white bg-orange-600 rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUpdating ? 'Đang đồng bộ...' : 'Đồng bộ tất cả đơn hàng '}
                    </button>
                    <button className="px-4 py-2 text-sm text-white bg-gray-600 rounded hover:bg-gray-700" onClick={handleExportToExcel}>
                        Xuất Excel
                    </button>
                    {/* Chỉ hiển thị button "Thêm đơn hàng mua" cho role Chủ xưởng (roleId = 1) */}
                    {roleId === 1 && (
                        <button className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-800" onClick={() => router.push('/purchase-order/create')}>
                            + Thêm đơn hàng mua
                        </button>
                    )}
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
                        placeholder="Tìm theo tên nhà cung cấp hoặc mã đơn hàng..."
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
                            <th>Ngày tạo</th>
                            <th>Mã đơn hàng</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>MISA</th>
                            <th>Nhà cung cấp</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedOrders.map((order) => (
                            <tr key={order.id}>
                                <td>{order.date ? new Date(order.date).toLocaleDateString('vi-VN') : '-'}</td>
                                <td>{order.code || '-'}</td>
                                <td>{order.totalValue != null ? `${order.totalValue.toLocaleString('vi-VN')} VNĐ` : '0 VNĐ'}</td>
                                <td>
                                    <span className={`badge ${getStatusClass(order.status || '')}`}>
                                        {getStatusText(order.status || '')}
                                    </span>
                                </td>
                                <td>
                                    <span className={`badge ${order.isUpdateMisa ? 'badge-outline-success' : 'badge-outline-warning'}`}>
                                        {order.isUpdateMisa ? 'Đã đồng bộ' : 'Chưa đồng bộ'}
                                    </span>
                                </td>
                                <td>{order.customerName || '-'}</td>
                                <td>
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
