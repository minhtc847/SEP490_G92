'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    getAllDebts, 
    getDebtSummary, 
    getDebtsByFilter,
    DebtDto, 
    DebtSummaryDto 
} from './service';
import { FiSearch, FiFilter, FiRefreshCw, FiEye, FiDownload, FiTrendingUp, FiTrendingDown, FiDollarSign } from 'react-icons/fi';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Using browser alert for notifications
const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') {
        alert(`✅ ${message}`);
    } else {
        alert(`❌ ${message}`);
    }
};

const DebtManagementPage = () => {
    const router = useRouter();
    const [debts, setDebts] = useState<DebtDto[]>([]);
    const [summary, setSummary] = useState<DebtSummaryDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debtTypeFilter, setDebtTypeFilter] = useState<string>('');
    const [minAmount, setMinAmount] = useState<string>('');
    const [maxAmount, setMaxAmount] = useState<string>('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [debtsData, summaryData] = await Promise.all([
                getAllDebts(),
                getDebtSummary()
            ]);
            setDebts(debtsData);
            setSummary(summaryData);
        } catch (error) {
            console.error('Error fetching debt data:', error);
            showNotification('Không thể tải dữ liệu công nợ', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = async () => {
        try {
            setLoading(true);
            const filteredDebts = await getDebtsByFilter(
                searchTerm || undefined,
                debtTypeFilter ? Number(debtTypeFilter) : undefined,
                minAmount ? Number(minAmount) : undefined,
                maxAmount ? Number(maxAmount) : undefined
            );
            setDebts(filteredDebts);
        } catch (error) {
            console.error('Error filtering debts:', error);
            showNotification('Không thể lọc dữ liệu', 'error');
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setDebtTypeFilter('');
        setMinAmount('');
        setMaxAmount('');
        fetchData();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <ProtectedRoute requiredRole={[1, 2]}>

        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Quản lý công nợ</h1>
                            <p className="text-gray-600 mt-1">Tổng hợp công nợ với khách hàng</p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={fetchData}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <FiRefreshCw className="w-4 h-4 mr-2" />
                                Làm mới
                            </button>
                            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                <FiDownload className="w-4 h-4 mr-2" />
                                Xuất báo cáo
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                {summary && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <FiDollarSign className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Tổng phải thu</p>
                                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(summary.totalReceivable)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-red-100 rounded-lg">
                                    <FiTrendingDown className="w-6 h-6 text-red-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Tổng phải trả</p>
                                    <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalPayable)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <FiTrendingUp className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Công nợ ròng</p>
                                    <p className={`text-2xl font-bold ${summary.netDebt >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {formatCurrency(summary.netDebt)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <FiDollarSign className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Tổng khách hàng</p>
                                    <p className="text-2xl font-bold text-purple-600">{summary.totalCustomers}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Bộ lọc</h2>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <FiFilter className="w-4 h-4 mr-2" />
                            {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
                        </button>
                    </div>

                    {showFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng</label>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Nhập tên khách hàng"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Loại công nợ</label>
                                <select
                                    value={debtTypeFilter}
                                    onChange={(e) => setDebtTypeFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Tất cả</option>
                                    <option value="1">Chỉ có phải thu</option>
                                    <option value="2">Chỉ có phải trả</option>
                                    <option value="3">Cân bằng</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền tối thiểu</label>
                                <input
                                    type="number"
                                    value={minAmount}
                                    onChange={(e) => setMinAmount(e.target.value)}
                                    placeholder="Nhập số tiền"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền tối đa</label>
                                <input
                                    type="number"
                                    value={maxAmount}
                                    onChange={(e) => setMaxAmount(e.target.value)}
                                    placeholder="Nhập số tiền"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex space-x-3 mt-4">
                        <button
                            onClick={handleFilter}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <FiSearch className="w-4 h-4 mr-2" />
                            Lọc
                        </button>
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                </div>

                {/* Debt List */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Danh sách công nợ</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phải thu</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phải trả</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Công nợ ròng</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {debts.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                                            Không có dữ liệu công nợ
                                        </td>
                                    </tr>
                                ) : (
                                    debts.map((debt) => (
                                        <tr key={debt.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{debt.customerName}</div>
                                                    <div className="text-sm text-gray-500">{debt.customerCode}</div>
                                                    <div className="text-sm text-gray-500">{debt.customerPhone}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                                                {formatCurrency(debt.totalReceivable)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                                {formatCurrency(debt.totalPayable)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {getDebtTypeIcon(debt.netDebt)}
                                                    <span className={`ml-2 text-sm font-medium ${debt.netDebt >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
                                                        {formatCurrency(Math.abs(debt.netDebt))}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getDebtTypeClass(debt.netDebt)}`}>
                                                    {getDebtTypeText(debt.netDebt)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => router.push(`/debts/${debt.customerId}`)}
                                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                                    title="Xem chi tiết"
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
        </div>
        </ProtectedRoute>
    );
};

export default DebtManagementPage; 