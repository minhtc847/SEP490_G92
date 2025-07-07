// fe/components/VNG/manager/production-orders-list-manager.tsx

'use client';
import IconEdit from '@/components/icon/icon-edit';
import IconEye from '@/components/icon/icon-eye';
import IconPlus from '@/components/icon/icon-plus';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import { sortBy } from 'lodash';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

export interface ProductionOrderListItem {
    id: number;
    orderDate?: string;
    description: string;
    status: { tooltip: string; color: string };
    isMaterialExported: boolean;
    isProductImported: boolean;
}

const statusMap: Record<string, { tooltip: string; color: string }> = {
    'Đang sản xuất': { tooltip: 'Đang sản xuất', color: 'warning' },
    'Hoàn thành': { tooltip: 'Hoàn thành', color: 'success' },
    'Chờ xử lý': { tooltip: 'Chờ xử lý', color: 'danger' },
    'Đã xuất kho NVL': { tooltip: 'Đã xuất kho NVL', color: 'info' },
    'Đã nhập kho TP': { tooltip: 'Đã nhập kho TP', color: 'success' },
};

// Mock data cho production orders
const mockProductionOrders = [
    {
        id: 1,
        orderDate: '2024-07-01T08:00:00Z',
        description: 'Cắt kính 200*300, 100*200',
        status: 'Đang sản xuất',
        isMaterialExported: true,
        isProductImported: false,
    },
    {
        id: 2,
        orderDate: '2024-07-02T09:30:00Z',
        description: 'Ghép kính EI70 200*300*25, EI90 100*200*15',
        status: 'Chờ xử lý',
        isMaterialExported: true,
        isProductImported: true,
    },
    {
        id: 3,
        orderDate: '2024-07-03T10:15:00Z',
        description: 'Sản xuất keo mềm cho đơn hàng #125',
        status: 'Chờ xử lý',
        isMaterialExported: false,
        isProductImported: false,
    },
    {
        id: 4,
        orderDate: '2024-07-03T10:15:00Z',
        description: 'Lệnh đổ keo hàng EI70 200*300*25, EI90 100*200*15',
        status: 'Chờ xử lý',
        isMaterialExported: false,
        isProductImported: false,
    },
];

const ProductionOrdersListManager: React.FC = () => {
    const [items, setItems] = useState<ProductionOrderListItem[]>([]);
    const [initialRecords, setInitialRecords] = useState<ProductionOrderListItem[]>([]);
    const [records, setRecords] = useState<ProductionOrderListItem[]>([]);

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'orderDate',
        direction: 'asc',
    });

    useEffect(() => {
        // Load mock data
        const mapped = mockProductionOrders.map((order) => ({
            id: order.id,
            orderDate: order.orderDate,
            description: order.description,
            status: statusMap[order.status] || { tooltip: order.status, color: 'secondary' },
            isMaterialExported: order.isMaterialExported,
            isProductImported: order.isProductImported,
        }));
        setItems(mapped);
    }, []);

    useEffect(() => {
        setInitialRecords(sortBy(items, 'orderDate'));
    }, [items]);

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecords([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    useEffect(() => {
        setInitialRecords(() => {
            return items.filter((item) => {
                return (
                    item.description.toLowerCase().includes(search.toLowerCase()) ||
                    item.status.tooltip.toLowerCase().includes(search.toLowerCase())
                );
            });
        });
    }, [search]);

    useEffect(() => {
        const data2 = sortBy(initialRecords, sortStatus.columnAccessor);
        setRecords(sortStatus.direction === 'desc' ? data2.reverse() : data2);
        setPage(1);
    }, [sortStatus]);

    return (
        <div className="production-orders-table">
            <div className="mb-4.5 flex flex-col gap-5 px-5 md:flex-row md:items-center">
                <div className="ltr:ml-auto rtl:mr-auto">
                    <input
                        type="text"
                        className="form-input w-auto"
                        placeholder="Tìm kiếm..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="datatables pagination-padding">
                <DataTable
                    className="table-hover whitespace-nowrap"
                    records={records}
                    columns={[
                        {
                            accessor: 'index',
                            title: '#',
                            sortable: false,
                            width: 70,
                            render: (_, index) => <span>{index + 1}</span>,
                        },

                        {
                            accessor: 'orderDate',
                            title: 'Ngày lên lệnh',
                            sortable: true,
                            render: ({ orderDate }) => (
                                <div>{orderDate ? new Date(orderDate).toLocaleDateString() : '-'}</div>
                            ),
                        },

                        {
                            accessor: 'description',
                            title: 'Mô tả',
                            sortable: true,
                            render: ({ description }) => (
                                <div className="max-w-xs truncate" title={description}>
                                    {description}
                                </div>
                            ),
                        },
                        {
                            accessor: 'status',
                            title: 'Trạng thái',
                            sortable: true,
                            render: ({ status }) => (
                                <span className={`badge badge-outline-${status.color}`}>
                                    {status.tooltip}
                                </span>
                            ),
                        },
                        {
                            accessor: 'isMaterialExported',
                            title: 'Đã xuất kho NVL',
                            sortable: true,
                            textAlignment: 'center',
                            render: ({ isMaterialExported }) => (
                                <input 
                                    type="checkbox" 
                                    checked={isMaterialExported} 
                                    disabled 
                                    className="form-checkbox" 
                                />
                            ),
                        },
                        {
                            accessor: 'isProductImported',
                            title: 'Đã nhập kho TP',
                            sortable: true,
                            textAlignment: 'center',
                            render: ({ isProductImported }) => (
                                <input 
                                    type="checkbox" 
                                    checked={isProductImported} 
                                    disabled 
                                    className="form-checkbox" 
                                />
                            ),
                        },
                        {
                            accessor: 'action',
                            title: 'Thao tác',
                            sortable: false,
                            textAlignment: 'center',
                            width: 150,
                            render: ({ id }) => (
                                <div className="mx-auto flex w-max items-center gap-4">
                                    
                                    <Link href={`/mockup/worker/production-orders/${id}`} className="flex hover:text-primary">
                                        <IconEye />
                                    </Link>
                                    
                                </div>
                            ),
                        },
                    ]}
                    highlightOnHover
                    totalRecords={initialRecords.length}
                    recordsPerPage={pageSize}
                    page={page}
                    onPageChange={(p) => setPage(p)}
                    recordsPerPageOptions={PAGE_SIZES}
                    onRecordsPerPageChange={setPageSize}
                    sortStatus={sortStatus}
                    onSortStatusChange={setSortStatus}
                    paginationText={({ from, to, totalRecords }) =>
                        `Hiển thị ${from} đến ${to} trong tổng số ${totalRecords} bản ghi`
                    }
                />
            </div>
        </div>
    );
};

export default ProductionOrdersListManager;