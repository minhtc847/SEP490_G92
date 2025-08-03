'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getDebtByCustomerId, DebtDto } from '../service';
import { FiArrowLeft, FiDownload, FiEye, FiTrendingUp, FiTrendingDown, FiDollarSign } from 'react-icons/fi';

// Using browser alert for notifications
const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') {
        alert(`✅ ${message}`);
    } else {
        alert(`❌ ${message}`);
    }
};

const CustomerDebtDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const customerId = Number(params.customerId);

    const [debt, setDebt] = useState<DebtDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (customerId) {
            fetchDebtData();
        }
    }, [customerId]);

    const fetchDebtData = async () => {
        try {
            setLoading(true);
            const data = await getDebtByCustomerId(customerId);
            setDebt(data);
        } catch (error) {
            console.error('Error fetching debt data:', error);
            showNotification('Không thể tải thông tin công nợ', 'error');
        } finally {
            setLoading(false);
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

    const getDebtTypeText = (netDebt: number) => {
        if (netDebt > 0) {
            return 'Khách nợ';
        } else if (netDebt < 0) {
            return 'Mình nợ';
        } else {
            return 'Cân bằng';
        }
    };

    const getDebtTypeClass = (netDebt: number) => {
        if (netDebt > 0) {
            return 'bg-red-100 text-red-800';
        } else if (netDebt < 0) {
            return 'bg-blue-100 text-blue-800';
        } else {
            return 'bg-green-100 text-green-800';
        }
    };

    const getDebtTypeIcon = (netDebt: number) => {
        if (netDebt > 0) {
            return <FiTrendingUp className="w-4 h-4" />;
        } else if (netDebt < 0) {
            return <FiTrendingDown className="w-4 h-4" />;
        } else {
            return <FiDollarSign className="w-4 h-4" />;
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!debt) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Không tìm thấy thông tin công nợ</h2>
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
                                <h1 className="text-3xl font-bold text-gray-900">Chi tiết công nợ</h1>
                                <p className="text-gray-600 mt-1">Khách hàng: {debt.customerName}</p>
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                <FiDownload className="w-4 h-4 mr-2" />
                                Xuất báo cáo
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Customer Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Customer Details */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin khách hàng</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng</label>
                                    <p className="text-lg font-semibold text-gray-900">{debt.customerName}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã khách hàng</label>
                                    <p className="text-gray-900">{debt.customerCode || 'Chưa có'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                    <p className="text-gray-900">{debt.customerPhone || 'Chưa có'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <p className="text-gray-900">{debt.customerEmail || 'Chưa có'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Debt Summary */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tổng quan công nợ</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="p-3 bg-red-100 rounded-lg inline-block mb-2">
                                        <FiTrendingUp className="w-8 h-8 text-red-600" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-600">Phải thu</p>
                                    <p className="text-2xl font-bold text-red-600">{formatCurrency(debt.totalReceivable)}</p>
                                </div>
                                <div className="text-center">
                                    <div className="p-3 bg-blue-100 rounded-lg inline-block mb-2">
                                        <FiTrendingDown className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-600">Phải trả</p>
                                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(debt.totalPayable)}</p>
                                </div>
                                <div className="text-center">
                                    <div className="p-3 bg-green-100 rounded-lg inline-block mb-2">
                                        {getDebtTypeIcon(debt.netDebt)}
                                    </div>
                                    <p className="text-sm font-medium text-gray-600">Công nợ ròng</p>
                                    <p className={`text-2xl font-bold ${debt.netDebt >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
                                        {formatCurrency(Math.abs(debt.netDebt))}
                                    </p>
                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-2 ${getDebtTypeClass(debt.netDebt)}`}>
                                        {getDebtTypeText(debt.netDebt)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Invoice List */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Danh sách hóa đơn</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã hóa đơn</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đã trả</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Còn lại</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {debt.invoices.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                                                    Không có hóa đơn nào
                                                </td>
                                            </tr>
                                        ) : (
                                            debt.invoices.map((invoice) => (
                                                <tr key={invoice.invoiceId} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {invoice.invoiceCode}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatDate(invoice.invoiceDate)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getInvoiceTypeClass(invoice.invoiceType)}`}>
                                                            {invoice.typeText}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {formatCurrency(invoice.totalAmount)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                                                        {formatCurrency(invoice.paidAmount)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                                                        {formatCurrency(invoice.remainingAmount)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(invoice.status)}`}>
                                                            {invoice.statusText}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <button
                                                            onClick={() => router.push(`/invoices/${invoice.invoiceId}`)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                            title="Xem chi tiết hóa đơn"
                                                        >
                                                            <FiEye className="w-4 h-4" />
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
                        {/* Debt Status */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Trạng thái công nợ</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tổng phải thu:</span>
                                    <span className="font-semibold text-red-600">{formatCurrency(debt.totalReceivable)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tổng phải trả:</span>
                                    <span className="font-semibold text-blue-600">{formatCurrency(debt.totalPayable)}</span>
                                </div>
                                <hr className="my-3" />
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Công nợ ròng:</span>
                                    <span className={`font-semibold ${debt.netDebt >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
                                        {formatCurrency(Math.abs(debt.netDebt))}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Trạng thái:</span>
                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getDebtTypeClass(debt.netDebt)}`}>
                                        {getDebtTypeText(debt.netDebt)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    <FiEye className="w-4 h-4 mr-2" />
                                    Xem tất cả hóa đơn
                                </button>
                                <button className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                    <FiDownload className="w-4 h-4 mr-2" />
                                    Xuất báo cáo
                                </button>
                            </div>
                        </div> */}

                        {/* Last Updated */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cập nhật</h3>
                            <div className="text-sm text-gray-600">
                                <p>Cập nhật lần cuối: {formatDate(debt.lastUpdated)}</p>
                                <p className="mt-2">Số hóa đơn: {debt.invoices.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerDebtDetailPage; 