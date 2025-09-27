'use client';
import { useEffect, useState } from 'react';
import { DataTable } from 'mantine-datatable';
import Link from 'next/link';
import { fetchAllProductionOrders, ProductionOrderListItem } from './service';
import IconEye from '@/components/icon/icon-eye';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const PAGE_SIZES = [10, 20, 50, 100];

const statusBadgeMap: Record<string, string> = {
    '0': 'badge-outline-warning', // Pending
    '1': 'badge-outline-info',    // InProgress
    '2': 'badge-outline-success', // Completed
    '3': 'badge-outline-danger',  // Cancelled
    'Pending': 'badge-outline-warning',
    'InProgress': 'badge-outline-info',
    'Completed': 'badge-outline-success',
    'Cancelled': 'badge-outline-danger',
};

const getStatusText = (status: string | undefined) => {
    switch (status) {
        case '0':
        case 'Pending': 
            return 'Chưa thực hiện';
        case '1':
        case 'InProgress': 
            return 'Đang thực hiện';
        case '2':
        case 'Completed': 
            return 'Đã hoàn thành';
        case '3':
        case 'Cancelled': 
            return 'Đã hủy';
        default: return status || '-';
    }
};

const ProductionOrdersPage = () => {
    const [orders, setOrders] = useState<ProductionOrderListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [records, setRecords] = useState<ProductionOrderListItem[]>([]);

    useEffect(() => {
        setLoading(true);
        fetchAllProductionOrders()
            .then((data: ProductionOrderListItem[]) => {
                // Sort by orderDate descending (newest first)
                const sorted = [...data].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
                setOrders(sorted);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecords([...orders.slice(from, to)]);
    }, [orders, page, pageSize]);

    return (
        <ProtectedRoute >
            <div>
                <div className="mb-5">
                    <h1 className="text-2xl font-bold">Danh sách lệnh sản xuất</h1>
                </div>
                <div className="panel mt-6">
                    <div className="table-responsive">
                        <table className="table-striped">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Ngày lên lệnh SX</th>
                                    <th>Loại</th>
                                    <th>Mô tả</th>
                                    <th style={{ minWidth: '120px' }}>Trạng thái</th>
                                    <th>Xem chi tiết</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-4">
                                            Đang tải dữ liệu...
                                        </td>
                                    </tr>
                                ) : records.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-4">
                                            Không có dữ liệu lệnh sản xuất
                                        </td>
                                    </tr>
                                ) : (
                                    records.map((item, idx) => (
                                        <tr key={item.id}>
                                            <td>{(page - 1) * pageSize + idx + 1}</td>
                                            <td>{item.orderDate ? new Date(item.orderDate).toLocaleDateString() : '-'}</td>
                                            <td>{item.type}</td>
                                            <td>{item.description}</td>
                                            <td style={{ minWidth: '150px' }}>
                                                <span className={`badge ${statusBadgeMap[item.productionStatus || ''] || 'badge-outline-secondary'} whitespace-nowrap`}>
                                                    {getStatusText(item.productionStatus)}
                                                </span>
                                            </td>
                                            <td>
                                                <Link
                                                    href={`/production-orders/view/${item.id}`}
                                                    className="p-2 bg-sky-100 rounded-full hover:bg-sky-200 transition inline-flex items-center justify-center"
                                                    title="Xem chi tiết"
                                                    >
                                                    <IconEye className="w-4 h-4 text-sky-700" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                        <div>
                            Hiển thị {(page - 1) * pageSize + 1} đến {Math.min(page * pageSize, orders.length)} trong tổng số {orders.length} lệnh sản xuất
                        </div>
                        <div className="flex gap-2 items-center">
                            <label>Trang:</label>
                            <select value={page} onChange={e => setPage(Number(e.target.value))}>
                                {Array.from({ length: Math.ceil(orders.length / pageSize) }, (_, i) => i + 1).map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                            <label>Số dòng/trang:</label>
                            <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
                                {PAGE_SIZES.map(size => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default ProductionOrdersPage;
