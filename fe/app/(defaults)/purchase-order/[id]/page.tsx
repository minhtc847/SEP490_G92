'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPurchaseOrderById, PurchaseOrderWithDetailsDto, updatePurchaseOrderStatus } from './service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

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

const PurchaseOrderDetailPage = () => {
    const params = useParams();
    const id = Number(params?.id);
    const router = useRouter();

    const [order, setOrder] = useState<PurchaseOrderWithDetailsDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id || isNaN(id)) return;

        const fetchData = async () => {
            try {
                const data = await getPurchaseOrderById(id);
                setOrder(data);
            } catch (error) {
                console.error('Lỗi khi gọi API:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleExportToExcel = async () => {
        if (!order) return;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('DonHangMua');

        worksheet.mergeCells('A1', 'H1');
        worksheet.getCell('A1').value = 'ĐƠN HÀNG MUA';
        worksheet.getCell('A1').font = { size: 14, bold: true };
        worksheet.getCell('A1').alignment = { horizontal: 'center' };

        worksheet.addRow([]);
        worksheet.addRow(['Mã đơn hàng:', order.code, '', '', 'Ngày:', order.date ? new Date(order.date).toLocaleDateString() : '']);
        worksheet.addRow(['Nhà cung cấp:', order.customerName]);
        worksheet.addRow(['Mô tả:', order.description]);
        worksheet.addRow(['Trạng thái:', getStatusText(order.status || '')]);
        worksheet.addRow([]);

        const headerRow = worksheet.addRow(['STT', 'Tên sản phẩm', 'Số lượng', 'Đơn vị tính', 'Đơn giá', 'Thành tiền', 'Ghi chú']);

        headerRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '305496' },
            };
            cell.font = { color: { argb: 'FFFFFF' }, bold: true };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
        });

        order.purchaseOrderDetails.forEach((item, idx) => {
            const row = worksheet.addRow([
                idx + 1, 
                item.productName, 
                item.quantity, 
                item.uom || 'Tấm', 
                item.unitPrice || 0,
                item.totalPrice || 0,
                ''
            ]);
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' },
                };
            });
        });

        worksheet.addRow([]);
        const totalQuantity = order.purchaseOrderDetails.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const totalPrice = order.purchaseOrderDetails.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
        worksheet.addRow(['Tổng số lượng:', '', totalQuantity, '', '', '', '']);
        worksheet.addRow(['Tổng giá trị:', '', '', '', '', totalPrice, '']);

        worksheet.columns.forEach((column) => {
            column.width = 15;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `DonHangMua_${order.code}.xlsx`);
    };

    if (loading) return <div className="p-6">Đang tải dữ liệu...</div>;
    if (!order) return <div className="p-6 text-red-600">Không tìm thấy đơn hàng mua với ID: {id}</div>;

    const totalQuantity = order.purchaseOrderDetails.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const calculatedTotalPrice = order.purchaseOrderDetails.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

    return (
        <ProtectedRoute requiredRole={[1, 2]}>

        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Chi tiết đơn hàng mua: {order.code}</h1>
                <div className="space-x-2">
                    {order.status === 'Pending' && (
                        <div className="flex gap-2">
                            <button
                                onClick={async () => {
                                    if (confirm(`Bạn có chắc muốn đặt đơn hàng "${order.description}" không?`)) {
                                        try {
                                            await updatePurchaseOrderStatus(order.id, 1); // Ordered
                                            setOrder((prev) => (prev ? { ...prev, status: 'Ordered' } : prev));
                                            alert('Đơn hàng đã được đặt.');
                                        } catch (error) {
                                            alert('Có lỗi khi cập nhật trạng thái.');
                                        }
                                    }
                                }}
                                className="px-4 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm focus:outline-none focus:ring-0"
                            >
                                🛒 Đặt hàng
                            </button>

                            <button
                                onClick={async () => {
                                    if (confirm(`Bạn có chắc muốn huỷ đơn hàng "${order.description}" không?`)) {
                                        try {
                                            await updatePurchaseOrderStatus(order.id, 3); // Cancelled
                                            setOrder((prev) => (prev ? { ...prev, status: 'Cancelled' } : prev));
                                            alert('Đơn hàng đã bị huỷ.');
                                        } catch (error) {
                                            alert('Có lỗi khi huỷ đơn hàng.');
                                        }
                                    }
                                }}
                                className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm focus:outline-none focus:ring-0"
                            >
                                ❌ Huỷ đơn
                            </button>
                        </div>
                    )}
                    <button onClick={() => router.push(`/purchase-order/edit/${id}`)} className="px-4 py-1 bg-blue-500 text-white rounded">
                        📝 Sửa
                    </button>
                    <button onClick={handleExportToExcel} className="px-4 py-1 bg-gray-600 text-white rounded">
                        📊 Xuất Excel
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                    <strong>Mã đơn hàng:</strong> {order.code || '-'}
                </div>
                <div>
                    <strong>Ngày tạo:</strong> {order.date ? new Date(order.date).toLocaleDateString() : '-'}
                </div>
                <div>
                    <strong>Nhà cung cấp:</strong> {order.customerName || '-'}
                </div>
                <div>
                    <strong>Mô tả:</strong> {order.description || '-'}
                </div>
                <div>
                    <strong>Trạng thái:</strong> 
                    <span className={`ml-2 badge ${getStatusClass(order.status || '')}`}>
                        {getStatusText(order.status || '')}
                    </span>
                </div>
                <div>
                    <strong>Tổng giá trị:</strong> {calculatedTotalPrice ? `${calculatedTotalPrice.toLocaleString('vi-VN')} VNĐ` : '0 VNĐ'}
                </div>
            </div>

            <table className="w-full border-collapse border text-sm mb-6">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border p-2">STT</th>
                        <th className="border p-2">Tên sản phẩm</th>
                        <th className="border p-2">Số lượng</th>
                        <th className="border p-2">Đơn vị tính</th>
                        <th className="border p-2">Đơn giá</th>
                        <th className="border p-2">Thành tiền</th>
                        <th className="border p-2">Ghi chú</th>
                    </tr>
                </thead>
                <tbody>
                    {order.purchaseOrderDetails.map((item, idx) => (
                        <tr key={idx}>
                            <td className="border p-2 text-center">{idx + 1}</td>
                            <td className="border p-2">{item.productName || '-'}</td>
                            <td className="border p-2 text-right">{(item.quantity || 0).toLocaleString()}</td>
                            <td className="border p-2">{item.uom || 'Tấm'}</td>
                            <td className="border p-2 text-right">{(item.unitPrice || 0).toLocaleString('vi-VN')} VNĐ</td>
                            <td className="border p-2 text-right font-medium">{(item.totalPrice || 0).toLocaleString('vi-VN')} VNĐ</td>
                            <td className="border p-2">-</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="text-end text-sm space-y-1">
                <p>
                    <strong>Tổng số lượng:</strong> {totalQuantity}
                </p>
                <p>
                    <strong>Tổng giá trị:</strong> {calculatedTotalPrice ? `${calculatedTotalPrice.toLocaleString('vi-VN')} VNĐ` : '0 VNĐ'}
                </p>
            </div>

            <button onClick={() => router.back()} className="btn btn-status-secondary">
                ◀ Quay lại
            </button>
        </div>
        </ProtectedRoute>

    );
};

export default PurchaseOrderDetailPage;
