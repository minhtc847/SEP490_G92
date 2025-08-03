'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
    getInvoiceWithPayments, 
    InvoiceWithPaymentsDto, 
    PaymentDto, 
    createPayment, 
    CreatePaymentDto,
    deletePayment
} from '../service';
import { FiArrowLeft, FiPlus, FiTrash2, FiEdit, FiDownload, FiSend } from 'react-icons/fi';
// Using browser alert for notifications - can be replaced with a proper toast library
const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') {
        alert(`✅ ${message}`);
    } else {
        alert(`❌ ${message}`);
    }
};

const InvoiceDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const invoiceId = Number(params.id);

    const [invoice, setInvoice] = useState<InvoiceWithPaymentsDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentForm, setPaymentForm] = useState<CreatePaymentDto>({
        customerId: 0,
        invoiceId: invoiceId,
        invoiceType: 0,
        paymentDate: new Date().toISOString().split('T')[0],
        amount: 0,
        note: ''
    });

    useEffect(() => {
        if (invoiceId) {
            fetchInvoiceData();
        }
    }, [invoiceId]);

    const fetchInvoiceData = async () => {
        try {
            setLoading(true);
            const data = await getInvoiceWithPayments(invoiceId);
            setInvoice(data);
            setPaymentForm(prev => ({
                ...prev,
                customerId: data.customerId || 0,
                invoiceType: data.invoiceType
            }));
        } catch (error) {
            console.error('Error fetching invoice:', error);
            showNotification('Không thể tải thông tin hóa đơn', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePayment = async () => {
        try {
            if (paymentForm.amount <= 0) {
                showNotification('Số tiền thanh toán phải lớn hơn 0', 'error');
                return;
            }

            if (paymentForm.amount > (invoice?.remainingAmount || 0)) {
                showNotification('Số tiền thanh toán không được vượt quá số tiền còn lại', 'error');
                return;
            }

            await createPayment(paymentForm);
            showNotification('Tạo thanh toán thành công');
            setShowPaymentModal(false);
            setPaymentForm({
                customerId: invoice?.customerId || 0,
                invoiceId: invoiceId,
                invoiceType: invoice?.invoiceType || 0,
                paymentDate: new Date().toISOString().split('T')[0],
                amount: 0,
                note: ''
            });
            fetchInvoiceData(); // Refresh data to update status
        } catch (error) {
            console.error('Error creating payment:', error);
            showNotification('Không thể tạo thanh toán', 'error');
        }
    };

    const handleDeletePayment = async (paymentId: number) => {
        try {
            if (confirm('Bạn có chắc chắn muốn xóa thanh toán này?')) {
                await deletePayment(paymentId);
                showNotification('Xóa thanh toán thành công');
                fetchInvoiceData(); // Refresh data to update status
            }
        } catch (error) {
            console.error('Error deleting payment:', error);
            showNotification('Không thể xóa thanh toán', 'error');
        }
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
                return 'bg-green-100 text-green-800';
            case 1:
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
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
                return 'bg-red-100 text-red-800';
            case 1:
                return 'bg-yellow-100 text-yellow-800';
            case 2:
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy hóa đơn</h2>
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.back()}
                                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <FiArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Chi tiết hóa đơn</h1>
                                <p className="text-gray-600 mt-1">Mã hóa đơn: {invoice.invoiceCode}</p>
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                <FiDownload className="w-4 h-4 mr-2" />
                                Xuất PDF
                            </button>
                            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                <FiSend className="w-4 h-4 mr-2" />
                                Gửi email
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Invoice Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin hóa đơn</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã hóa đơn</label>
                                    <p className="text-lg font-semibold text-gray-900">{invoice.invoiceCode}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại hóa đơn</label>
                                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getInvoiceTypeClass(invoice.invoiceType)}`}>
                                        {getInvoiceTypeText(invoice.invoiceType)}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo</label>
                                    <p className="text-gray-900">{formatDate(invoice.invoiceDate)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Hạn thanh toán</label>
                                    <p className="text-gray-900">{invoice.dueDate ? formatDate(invoice.dueDate) : 'Không có'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Khách hàng</label>
                                    <p className="text-gray-900">{invoice.customerName}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(invoice.status)}`}>
                                        {getStatusText(invoice.status)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Invoice Details */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Chi tiết sản phẩm</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn giá</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {invoice.invoiceDetails.map((detail) => (
                                            <tr key={detail.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{detail.productName}</div>
                                                        {detail.description && (
                                                            <div className="text-sm text-gray-500">{detail.description}</div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{detail.quantity}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(detail.unitPrice)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(detail.total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Payment History */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Lịch sử thanh toán</h2>
                                <button
                                    onClick={() => setShowPaymentModal(true)}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <FiPlus className="w-4 h-4 mr-2" />
                                    Tạo thanh toán
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày thanh toán</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ghi chú</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {invoice.payments.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                                    Chưa có thanh toán nào
                                                </td>
                                            </tr>
                                        ) : (
                                            invoice.payments.map((payment) => (
                                                <tr key={payment.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatDate(payment.paymentDate)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {formatCurrency(payment.amount)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        {payment.note || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <button 
                                                            onClick={() => handleDeletePayment(payment.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Xóa thanh toán"
                                                        >
                                                            <FiTrash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="space-y-6">
                        {/* Payment Summary */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tổng quan thanh toán</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tổng tiền hóa đơn:</span>
                                    <span className="font-semibold text-gray-900">{formatCurrency(invoice.totalAmount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Đã thanh toán:</span>
                                    <span className="font-semibold text-green-600">{formatCurrency(invoice.totalPaidAmount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Còn lại:</span>
                                    <span className="font-semibold text-red-600">{formatCurrency(invoice.remainingAmount)}</span>
                                </div>
                                <hr className="my-3" />
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Trạng thái:</span>
                                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(invoice.status)}`}>
                                        {getStatusText(invoice.status)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    <FiEdit className="w-4 h-4 mr-2" />
                                    Chỉnh sửa hóa đơn
                                </button>
                                <button className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                    <FiDownload className="w-4 h-4 mr-2" />
                                    Xuất PDF
                                </button>
                                <button className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                                    <FiSend className="w-4 h-4 mr-2" />
                                    Gửi email
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tạo thanh toán mới</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày thanh toán</label>
                                <input
                                    type="date"
                                    value={paymentForm.paymentDate}
                                    onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentDate: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền thanh toán</label>
                                <input
                                    type="number"
                                    value={paymentForm.amount}
                                    onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                                    placeholder="Nhập số tiền"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Số tiền còn lại: {formatCurrency(invoice?.remainingAmount || 0)}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                                <textarea
                                    value={paymentForm.note}
                                    onChange={(e) => setPaymentForm(prev => ({ ...prev, note: e.target.value }))}
                                    placeholder="Nhập ghi chú (tùy chọn)"
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleCreatePayment}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Tạo thanh toán
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoiceDetailPage;
