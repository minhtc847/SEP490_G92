'use client';
import { useEffect, useState } from 'react';
import { DataTable } from 'mantine-datatable';
import Link from 'next/link';
import { fetchAllProductionOrders, ProductionOrderListItem } from './service';

const PAGE_SIZES = [10, 20, 50, 100];

const statusBadgeMap: Record<string, string> = {
    'Đang sản xuất': 'badge-outline-warning',
    'Đã hoàn thành': 'badge-outline-success',
    'Đã hủy': 'badge-outline-danger',
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
                                            <span className={`badge ${statusBadgeMap[item.productionStatus || ''] || 'badge-outline-secondary'}`}>
                                                {item.productionStatus || '-'}
                                            </span>
                                        </td>
                                        <td>
                                            <Link href={`/production-orders/view/${item.id}`} className="btn btn-sm btn-outline-primary">
                                                Xem chi tiết
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
    );
};

export default ProductionOrdersPage;
