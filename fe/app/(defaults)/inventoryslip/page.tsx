'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAllInventorySlips, InventorySlipListItem } from './service';
import IconEye from '@/components/icon/icon-eye';
import IconPlus from '@/components/icon/icon-plus';

const PAGE_SIZES = [10, 20, 50, 100];

const transactionTypeBadgeMap: Record<string, string> = {
    'In': 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200', // Nhập kho
    'Out': 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200', // Xuất kho
};

const getTransactionTypeText = (type: string | undefined) => {
    switch (type) {
        case 'In': return 'Nhập kho';
        case 'Out': return 'Xuất kho';
        default: return type || '-';
    }
};

const getSlipTypeText = (productionOrderType: string | undefined) => {
    switch (productionOrderType) {
        case 'Cắt kính': return 'Phiếu cắt kính';
        case 'Ghép kính': return 'Phiếu xuất keo butyl';
        case 'Sản xuất keo':
        case 'Đổ keo': return 'Phiếu xuất hóa chất';
        default: return productionOrderType || '-';
    }
};

const InventorySlipPage = () => {
    const [slips, setSlips] = useState<InventorySlipListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [records, setRecords] = useState<InventorySlipListItem[]>([]);
    const [filterType, setFilterType] = useState<string>('all');
    const [filterTransactionType, setFilterTransactionType] = useState<string>('all');

    useEffect(() => {
        setLoading(true);
        fetchAllInventorySlips()
            .then((data: InventorySlipListItem[]) => {
                // Sort by created date descending (newest first)
                const sorted = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setSlips(sorted);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        let filtered = [...slips];
        
        // Filter by slip type
        if (filterType !== 'all') {
            filtered = filtered.filter(slip => slip.productionOrderType === filterType);
        }
        
        // Filter by transaction type
        if (filterTransactionType !== 'all') {
            filtered = filtered.filter(slip => slip.transactionType === filterTransactionType);
        }
        
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecords(filtered.slice(from, to));
    }, [slips, page, pageSize, filterType, filterTransactionType]);

    const filteredSlips = slips.filter(slip => {
        if (filterType !== 'all' && slip.productionOrderType !== filterType) return false;
        if (filterTransactionType !== 'all' && slip.transactionType !== filterTransactionType) return false;
        return true;
    });

    return (
        <div>
            <div className="mb-5 flex justify-between items-center">
                <h1 className="text-2xl font-bold">Quản lý phiếu kho</h1>
                <Link
                    href="/inventoryslip/create"
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    <IconPlus className="w-4 h-4 mr-2" />
                    Tạo phiếu mới
                </Link>
            </div>

            {/* Filters */}
                         <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-wrap gap-4">
                    <div>
                                                 <label className="block text-sm font-medium text-gray-700 mb-2">Loại phiếu:</label>
                                                 <select 
                             className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                             value={filterType}
                             onChange={(e) => setFilterType(e.target.value)}
                         >
                            <option value="all">Tất cả</option>
                            <option value="Cắt kính">Cắt kính</option>
                            <option value="Ghép kính">Ghép kính</option>
                            <option value="Sản xuất keo">Sản xuất keo</option>
                            <option value="Đổ keo">Đổ keo</option>
                        </select>
                    </div>
                    <div>
                                                 <label className="block text-sm font-medium text-gray-700 mb-2">Loại giao dịch:</label>
                        <select 
                            className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={filterTransactionType}
                            onChange={(e) => setFilterTransactionType(e.target.value)}
                        >
                            <option value="all">Tất cả</option>
                            <option value="In">Nhập kho</option>
                            <option value="Out">Xuất kho</option>
                        </select>
                    </div>
                </div>
            </div>

                         <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mt-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã phiếu</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại phiếu</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại giao dịch</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lệnh sản xuất</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người tạo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                                            <tr>
                                <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
                                    Đang tải dữ liệu...
                                </td>
                            </tr>
                            ) : records.length === 0 ? (
                                                            <tr>
                                <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
                                    Không có dữ liệu phiếu kho
                                </td>
                            </tr>
                            ) : (
                                records.map((item, idx) => (
                                    <tr key={item.id} className="bg-white hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(page - 1) * pageSize + idx + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-semibold text-blue-600">
                                                {item.slipCode}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.slipDate ? new Date(item.slipDate).toLocaleDateString() : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getSlipTypeText(item.productionOrderType)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`${transactionTypeBadgeMap[item.transactionType || ''] || 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200'} whitespace-nowrap`}>
                                                {getTransactionTypeText(item.transactionType)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Link 
                                                href={`/production-orders/view/${item.productionOrderId}`}
                                                className="text-blue-600 hover:underline"
                                            >
                                                {item.productionOrderCode}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.createdByEmployeeName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={item.description}>
                                            {item.description || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <Link
                                                href={`/inventoryslip/${item.productionOrderId}`}
                                                className="p-2 bg-sky-100 rounded-full hover:bg-sky-200 transition inline-flex items-center justify-center"
                                                title="Xem chi tiết"
                                            >
                                                <IconEye className="w-4 h-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredSlips.length > pageSize && (
                    <div className="flex justify-between items-center mt-4">
                        <div>
                            Hiển thị {((page - 1) * pageSize) + 1} đến {Math.min(page * pageSize, filteredSlips.length)} trong tổng số {filteredSlips.length} phiếu
                        </div>
                        <div className="flex gap-2">
                                                         <button
                                 className="px-3 py-1 text-sm border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                 onClick={() => setPage(Math.max(1, page - 1))}
                                 disabled={page === 1}
                             >
                                 Trước
                             </button>
                            <span className="px-3 py-2">
                                Trang {page} / {Math.ceil(filteredSlips.length / pageSize)}
                            </span>
                                                         <button
                                 className="px-3 py-1 text-sm border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                 onClick={() => setPage(Math.min(Math.ceil(filteredSlips.length / pageSize), page + 1))}
                                 disabled={page >= Math.ceil(filteredSlips.length / pageSize)}
                             >
                                 Sau
                             </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InventorySlipPage;
