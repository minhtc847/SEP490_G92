'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { checkOrderProductsMisaStatus, getOrderDetailById, OrderDetailDto, updateMisaOrder, checkHasProductionPlan } from '@/app/(defaults)/sales-order/[id]/service';
import * as signalR from '@microsoft/signalr';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const SalesOrderDetailPage = () => {
    const params = useParams();
    const id = params?.id as string;
    const router = useRouter();
    const roleId = useSelector((state: IRootState) => state.auth.user?.roleId);
    const [order, setOrder] = useState<OrderDetailDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [isUpdatingMisa, setIsUpdatingMisa] = useState<boolean>(false);
    const [isWaitingMisaConfirm, setIsWaitingMisaConfirm] = useState<boolean>(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
    const [showErrorMessage, setShowErrorMessage] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [hasProductionPlan, setHasProductionPlan] = useState<boolean>(false);

    useEffect(() => {
        if (!id || isNaN(Number(id))) return;

        const fetchData = async () => {
            try {
                const data = await getOrderDetailById(Number(id));
                console.log('Order data received:', data);
                console.log('isUpdateMisa from API:', data.isUpdateMisa);
                setOrder(data);
                
                // Check if this sales order has a production plan
                const hasPlan = await checkHasProductionPlan(Number(id));
                setHasProductionPlan(hasPlan);
            } catch (error) {
                console.error('Lỗi khi gọi API:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // Listen to SignalR hub for MISA update confirmation
    useEffect(() => {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${process.env.NEXT_PUBLIC_BASE_URL}/saleOrderHub`)
            .withAutomaticReconnect()
            .build();

        connection.on('MisaUpdate', async (data: any) => {
            try {
                // For sales order updates, refresh the detail and show success
                if (data?.type === 'Đơn Bán Hàng') {
                    const updated = await getOrderDetailById(Number(id));
                    setOrder(updated);
                    setShowSuccessMessage(true);
                    setTimeout(() => setShowSuccessMessage(false), 3000);
                }
            } finally {
                setIsWaitingMisaConfirm(false);
            }
        });

        connection
            .start()
            .catch(() => {});

        return () => {
            connection.stop();
        };
    }, [id]);

    const handleUpdateMisa = async () => {
        if (!order) return;
        
        setIsUpdatingMisa(true);
        // Show blocking overlay by adding a body class
        if (typeof document !== 'undefined') {
            document.body.classList.add('pointer-events-none');
        }
        setShowSuccessMessage(false);
        setShowErrorMessage(false);
        setErrorMessage('');
        
        try {
            // Kiểm tra trạng thái MISA của các sản phẩm trước
            const misaCheckResult = await checkOrderProductsMisaStatus(Number(id));
            
            if (!misaCheckResult.success) {
                throw new Error(misaCheckResult.message || 'Không thể kiểm tra trạng thái MISA của sản phẩm');
            }
            
            if (!misaCheckResult.canUpdateMisa) {
                // Hiển thị thông báo lỗi với danh sách sản phẩm chưa update MISA
                const notUpdatedProducts = misaCheckResult.notUpdatedProducts || [];
                const productList = notUpdatedProducts.map((p: any) => {
                    // Sử dụng đúng tên field từ API response
                    const productName = p.ProductName || p.productName || 'Không có tên';
                    const productCode = p.ProductCode || p.productCode || 'Không có mã';
                    return `${productName} (${productCode})`;
                }).join(', ');
                
                setErrorMessage(`Không thể đồng bộ MISA. Các sản phẩm sau chưa được đồng bộ MISA: ${productList}`);
                setShowErrorMessage(true);
                setTimeout(() => {
                    setShowErrorMessage(false);
                }, 8000); // Hiển thị lỗi trong 8 giây để user có thể đọc hết
                return;
            }
            
            // Nếu tất cả sản phẩm đã update MISA, tiến hành gửi yêu cầu đồng bộ (background)
            // Không cập nhật trạng thái ngay lập tức; đợi SignalR xác nhận
            await updateMisaOrder(Number(id));
            setIsWaitingMisaConfirm(true);
            
        } catch (error: any) {
            console.error('Lỗi khi đồng bộ MISA:', error);
            setErrorMessage(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi đồng bộ MISA.');
            setShowErrorMessage(true);
            setTimeout(() => {
                setShowErrorMessage(false);
            }, 5000); // Hiển thị lỗi trong 5 giây
        } finally {
            setIsUpdatingMisa(false);
            if (typeof document !== 'undefined') {
                document.body.classList.remove('pointer-events-none');
            }
        }
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

        worksheet.addRow(['Tổng giá trị đơn hàng:', '', '', '', '', '', '', '', '', total]);

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

    const { customerName, address, phone, orderDate, orderCode, products, totalAmount, totalQuantity } = order;

    return (
        <ProtectedRoute requiredRole={[1, 2]}>

        <div className="p-6">
            {isUpdatingMisa && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                    <div className="bg-white rounded shadow p-4 text-center">
                        <div className="animate-spin inline-block w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full mr-2"></div>
                        <span>Đang đồng bộ MISA, vui lòng không thao tác...</span>
                    </div>
                </div>
            )}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Chi tiết đơn hàng: {orderCode}</h1>
                <div className="space-x-2">
                    <button onClick={() => router.push(`/sales-order/edit/${id}`)} className="px-4 py-1 bg-blue-500 text-white rounded">
                        📝 Sửa
                    </button>
                    <button 
                        onClick={handleUpdateMisa} 
                        disabled={isUpdatingMisa || isWaitingMisaConfirm || order.isUpdateMisa}
                        title={order.isUpdateMisa ? 'Đơn hàng đã được đồng bộ MISA' : ''}
                        aria-busy={isUpdatingMisa}
                        className={`px-4 py-1 rounded transition ${
                            isUpdatingMisa || isWaitingMisaConfirm || order.isUpdateMisa
                                ? 'bg-gray-400 text-white cursor-not-allowed' 
                                : 'bg-orange-500 text-white hover:bg-orange-600'
                        }`}
                    >
                        {isUpdatingMisa ? (
                            <>
                                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                                Đang đồng bộ MISA...
                            </>
                        ) : isWaitingMisaConfirm ? (
                            '⏳ Đang chờ xác nhận MISA...'
                        ) : (
                            '🔄 Đồng bộ MISA'
                        )}
                    </button>
                    <button onClick={handleExportToExcel} className="px-4 py-1 bg-gray-600 text-white rounded">
                        📊 Xuất Excel
                    </button>
                    {/* Chỉ hiển thị button "Tạo kế hoạch sản xuất" cho role Chủ xưởng (roleId = 1) */}
                    {roleId === 1 && (
                        <button 
                            onClick={() => router.push(`/production-plans/create?orderId=${id}`)} 
                            disabled={hasProductionPlan}
                            className={`px-4 py-1 rounded ${
                                hasProductionPlan 
                                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                                    : 'bg-yellow-500 text-black hover:bg-yellow-600'
                            }`}
                            title={hasProductionPlan ? 'Đơn hàng đã có kế hoạch sản xuất' : 'Tạo kế hoạch sản xuất'}
                        >
                            {hasProductionPlan ? '🏭 Đã có kế hoạch sản xuất' : '🏭 Tạo kế hoạch sản xuất'}
                        </button>
                    )}
                </div>
            </div>

            {/* Success Message */}
            {showSuccessMessage && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                    ✅ Cập nhật MISA thành công!
                </div>
            )}

            {/* Error Message */}
            {showErrorMessage && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    ❌ {errorMessage}
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
                    <strong>Trạng thái:</strong> {getStatusText(order.status)}
                </div>
                <div>
                    <strong>Giao hàng:</strong> {getDeliveryStatusText(order.deliveryStatus)}
                </div>
                <div>
                    <strong>Trạng thái đồng bộ MISA:</strong>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        order.isUpdateMisa 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                    }`}>
                        {order.isUpdateMisa ? 'Đã đồng bộ' : 'Chưa đồng bộ'}
                    </span>
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
                    const totalQuantityCalc = products.reduce((sum, p) => sum + (p.quantity || 0), 0);
                    return (
                        <>
                            <p>
                                <strong>Tổng số lượng:</strong> {totalQuantityCalc}
                            </p>
                            <p>
                                <strong>Tổng tiền hàng:</strong> {totalAmount.toLocaleString()} ₫
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
