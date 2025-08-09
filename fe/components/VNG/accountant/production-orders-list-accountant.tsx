'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DataTable } from 'mantine-datatable';

interface ProductionOrderListItem {
    id: number;
    orderDate: string;
    type: string;
    description: string;
    productionStatus: string;
}

const PAGE_SIZES = [10, 20, 50, 100];

const statusBadgeMap: Record<string, string> = {
    '0': 'badge-outline-warning', // Pending
    '1': 'badge-outline-info',    // InProgress
    '2': 'badge-outline-success', // Completed
    '3': 'badge-outline-danger',  // Cancelled
};

const getStatusText = (status: string | undefined) => {
    switch (status) {
        case '0': return 'Pending';
        case '1': return 'InProgress';
        case '2': return 'Completed';
        case '3': return 'Cancelled';
        default: return status || '-';
    }
};

const ProductionOrdersListAccountant: React.FC = () => {
    const [orders, setOrders] = useState<ProductionOrderListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [records, setRecords] = useState<ProductionOrderListItem[]>([]);

    useEffect(() => {
        setLoading(true);
        // Mock data - replace with actual API call
        const mockOrders: ProductionOrderListItem[] = [
            {
                id: 1,
                orderDate: new Date().toISOString(),
                type: 'Cắt kính',
                description: 'Lệnh sản xuất cắt kính theo đơn hàng',
                productionStatus: '1'
            },
            {
                id: 2,
                orderDate: new Date(Date.now() - 86400000).toISOString(),
                type: 'Ghép kính',
                description: 'Lệnh sản xuất ghép kính',
                productionStatus: '2'
            }
        ];
        
        const sorted = [...mockOrders].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
        setOrders(sorted);
        setLoading(false);
    }, []);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecords([...orders.slice(from, to)]);
    }, [orders, page, pageSize]);

    return (
        <div>
            <div className="mb-5">
                <h1 className="text-2xl font-bold">Danh sách lệnh sản xuất (Accountant View)</h1>
                <p className="text-gray-600 mt-2">Quản lý và theo dõi lệnh sản xuất từ góc độ kế toán</p>
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
                                                href={`/mockup/accountant/production-orders/${item.id}`}
                                                className="p-2 bg-sky-100 rounded-full hover:bg-sky-200 transition inline-flex items-center justify-center"
                                                title="Xem chi tiết"
                                            >
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="currentColor" strokeWidth="1.5"/>
                                                    <path opacity="0.5" d="M2 12C2 13.6394 2.42496 15.2045 3.23376 16.5687C4.04255 17.9329 5.19828 19.0424 6.55496 19.7711C7.91165 20.4998 9.41332 20.8214 10.9361 20.6994C12.4589 20.5774 13.9362 20.0159 15.1941 19.0711C16.4519 18.1262 17.4415 16.8273 18.0634 15.3333C18.6853 13.8393 18.9179 12.2003 18.7368 10.5868L22.864 6.4596C23.0516 6.27195 23.0516 5.98559 22.864 5.79794L21.2021 4.13599C21.0144 3.94834 20.7281 3.94834 20.5404 4.13599L16.4132 8.2632C14.7997 8.0821 13.1607 8.31472 11.6667 8.93664C10.1727 9.55856 8.87381 10.5481 7.92894 11.8059C6.98407 13.0638 6.42259 14.5411 6.30061 16.0639C6.17863 17.5867 6.50019 19.0884 7.22889 20.445C7.9576 21.8017 9.06713 22.9574 10.4313 23.7662C11.7955 24.575 13.3606 25 15 25" stroke="currentColor" strokeWidth="1.5"/>
                                                </svg>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductionOrdersListAccountant;
