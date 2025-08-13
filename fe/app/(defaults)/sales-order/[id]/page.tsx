'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getOrderDetailById, OrderDetailDto } from '@/app/(defaults)/sales-order/[id]/service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const SalesOrderDetailPage = () => {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const [order, setOrder] = useState<OrderDetailDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [isUpdatingMisa, setIsUpdatingMisa] = useState<boolean>(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);

    useEffect(() => {
        if (!id || isNaN(Number(id))) return;

        const fetchData = async () => {
            try {
                const data = await getOrderDetailById(Number(id));
                setOrder(data);
            } catch (error) {
                console.error('Lỗi khi gọi API:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleUpdateMisa = async () => {
        setIsUpdatingMisa(true);
        setShowSuccessMessage(false);
        
        // Simulate 10-second delay
        setTimeout(() => {
            setIsUpdatingMisa(false);
            setShowSuccessMessage(true);
            
            // Hide success message after 3 seconds
            setTimeout(() => {
                setShowSuccessMessage(false);
            }, 3000);
        }, 10000);
    };

    if (loading) return <div className="p-6">Đang tải dữ liệu...</div>;
    if (!order) return <div className="p-6 text-red-600">Không tìm thấy đơn hàng với ID: {id}</div>;

    const handleExportToExcel = async () => {
        if (!order) return;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('XacNhanDonHang');

        worksheet.mergeCells('A1', 'J1');
        worksheet.getCell('A1').value = 'XÁC NHẬN ĐƠN HÀNG';
        worksheet.getCell('A1').font = { size: 14, bold: true };
        worksheet.getCell('A1').alignment = { horizontal: 'center' };

        worksheet.addRow([]);
        worksheet.addRow(['Kính gửi:', order.customerName, '', '', 'Ngày:', new Date(order.orderDate).toLocaleDateString()]);
        worksheet.addRow(['Địa chỉ:', order.address]);
        worksheet.addRow(['Điện thoại:', order.phone]);
        worksheet.addRow([]);
        worksheet.addRow(['Công ty cổ phần kính VNG Trân trọng gửi đến Quý khách bảng xác nhận đơn đặt hàng kính chống cháy như sau :']);

        worksheet.addRow([]);

        const headerRow = worksheet.addRow(['Stt', 'Ký hiệu', 'Tên sản phẩm', 'Đơn vị', 'SL', 'Dày kính (mm)', 'Rộng(mm)', 'Cao(mm)', 'Đơn giá (VND/m2)', 'Thành tiền (VND)']);

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

        order.products.forEach((item, idx) => {
            const row = worksheet.addRow([idx + 1, item.productCode, item.productName, 'Tấm', item.quantity, item.thickness, item.width, item.height, item.unitPrice, item.totalAmount]);
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
        const total = order.products.reduce((sum, item) => sum + item.totalAmount, 0);
        const discountAmount = total * order.discount;
        const finalAmount = total - discountAmount;

        worksheet.addRow(['Tổng giá trị đơn hàng:', '', '', '', '', '', '', '', '', total]);
        worksheet.addRow(['Chiết khấu:', `${(order.discount * 100).toFixed(0)}%`, '', '', '', '', '', '', '', -discountAmount]);
        worksheet.addRow(['Thành tiền sau chiết khấu:', '', '', '', '', '', '', '', '', finalAmount]);

        worksheet.addRow([]);
        worksheet.addRow(['Ghi chú:']);
        worksheet.addRow(['- Đơn giá đã bao gồm chi phí vận chuyển, chưa bao gồm thuế VAT và chi phí kiểm định.']);
        worksheet.addRow(['- Thời gian giao hàng: 5 ngày tính từ ngày chốt đơn hàng.']);
        worksheet.addRow(['- Thời gian bảo hành: VNG-N 24 tháng, VNG-MB 12 tháng.']);
        worksheet.addRow(['- Thanh toán 70% khi đặt hàng, 30% sau giao hàng.']);

        worksheet.addRow([]);
        worksheet.addRow(['ĐẠI DIỆN BÊN MUA', '', '', '', '', '', 'ĐẠI DIỆN BÊN BÁN']);

        worksheet.columns.forEach((column) => {
            column.width = 15;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `XacNhanDonHang_${order.orderCode}.xlsx`);
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

    if (loading) return <div className="p-6">Đang tải dữ liệu...</div>;
    if (!order) return <div className="p-6 text-red-600">Không tìm thấy đơn hàng với ID: {id}</div>;

    const { customerName, address, phone, orderDate, orderCode, discount, products, totalAmount, totalQuantity } = order;

    return (
        <ProtectedRoute requiredRole={[1, 2]}>

        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Chi tiết đơn hàng: {orderCode}</h1>
                <div className="space-x-2">
                    <button onClick={() => router.push(`/sales-order/edit/${id}`)} className="px-4 py-1 bg-blue-500 text-white rounded">
                        📝 Sửa
                    </button>
                    <button 
                        onClick={handleUpdateMisa} 
                        disabled={isUpdatingMisa}
                        className={`px-4 py-1 rounded transition ${
                            isUpdatingMisa 
                                ? 'bg-orange-400 text-white cursor-not-allowed' 
                                : 'bg-orange-500 text-white hover:bg-orange-600'
                        }`}
                    >
                        {isUpdatingMisa ? (
                            <>
                                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                                Đang cập nhật MISA...
                            </>
                        ) : (
                            '🔄 Update MISA'
                        )}
                    </button>
                    <button onClick={handleExportToExcel} className="px-4 py-1 bg-gray-600 text-white rounded">
                        📊 Xuất Excel
                    </button>
                    <button onClick={() => router.push(`/production-plans/create?orderId=${id}`)} className="px-4 py-1 bg-yellow-500 text-black rounded">
                        🏭 Tạo lệnh sản xuất
                    </button>
                </div>
            </div>

            {/* Success Message */}
            {showSuccessMessage && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                    ✅ Cập nhật MISA thành công!
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                    <strong>Khách hàng:</strong> {customerName}
                </div>
                <div>
                    <strong>Địa chỉ:</strong> {address}
                </div>
                <div>
                    <strong>Điện thoại:</strong> {phone}
                </div>
                <div>
                    <strong>Ngày đặt:</strong> {new Date(orderDate).toLocaleDateString()}
                </div>
                <div>
                    <strong>Mã đơn hàng:</strong> {orderCode}
                </div>
                <div>
                    <strong>Chiết khấu:</strong> {discount * 100}%
                </div>
                <div>
                    <strong>Trạng thái:</strong> {getStatusText(order.status)}
                </div>
                <div>
                    <strong>Giao hàng:</strong> {getDeliveryStatusText(order.deliveryStatus)}
                </div>
            </div>

            <table className="w-full border-collapse border text-sm mb-6">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="border p-2">STT</th>
                        <th className="border p-2">Tên SP</th>
                        {/* <th className="border p-2">Rộng (mm)</th>
                        <th className="border p-2">Cao (mm)</th>
                        <th className="border p-2">Dày (mm)</th> */}
                        <th className="border p-2">Số lượng</th>
                        <th className="border p-2">Đơn vị tính</th>
                        <th className="border p-2">Đơn giá (₫)</th>
                        <th className="border p-2">Diện tích (m²)</th>
                        <th className="border p-2">Thành tiền (₫)</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((item, idx) => (
                        <tr key={idx}>
                            <td className="border p-2 text-center">{idx + 1}</td>
                            <td className="border p-2">{item.productName}</td>
                            {/* <td className="border p-2 text-right">{item.width}</td>
                            <td className="border p-2 text-right">{item.height}</td>
                            <td className="border p-2 text-right">{item.thickness}</td> */}
                            <td className="border p-2 text-right">{item.quantity}</td>
                            <td className="border p-2">Tấm</td>
                            <td className="border p-2 text-right">{item.unitPrice.toLocaleString()}</td>
                            <td className="border p-2 text-right">{item.areaM2}</td>
                            <td className="border p-2 text-right">{item.totalAmount.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="text-end text-sm space-y-1">
                {(() => {
                    const totalAmountRaw = products.reduce((sum, p) => sum + p.unitPrice * p.quantity, 0);
                    const discountAmount = totalAmountRaw * discount;
                    const finalAmount = totalAmountRaw - discountAmount;

                    return (
                        <>
                            <p>
                                <strong>Tổng số lượng:</strong> {totalQuantity}
                            </p>
                            <p>
                                <strong>Tổng tiền hàng:</strong> {totalAmountRaw.toLocaleString()} ₫
                            </p>
                            <p>
                                <strong>Chiết khấu:</strong> {discountAmount.toLocaleString()} ₫ ({(discount * 100).toFixed(2)}%)
                            </p>
                            <p className="text-base font-bold">
                                Thành tiền sau chiết khấu: <span className="text-green-600">{finalAmount.toLocaleString()} ₫</span>
                            </p>
                        </>
                    );
                })()}
            </div>

            <button onClick={() => router.back()} className="btn btn-status-secondary">
                ◀ Quay lại
            </button>
        </div>
        </ProtectedRoute>

    );
};

export default SalesOrderDetailPage;
