'use client';
import IconEye from '@/components/icon/icon-eye';
import { sortBy } from 'lodash';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

export interface ProductionPlanListItem {
    id: number;
    orderCode: string;
    customerName: string;
    totalProducts: number;
    status: { tooltip: string; color: string };
}

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
};

const productionOrderStatusMap: Record<string, { tooltip: string; color: string }> = {
    'Đang sản xuất': { tooltip: 'Đang sản xuất', color: 'warning' },
    'Hoàn thành': { tooltip: 'Hoàn thành', color: 'success' },
    'Chờ xử lý': { tooltip: 'Chờ xử lý', color: 'danger' },
    'Đã xuất kho NVL': { tooltip: 'Đã xuất kho NVL', color: 'info' },
    'Đã nhập kho TP': { tooltip: 'Đã nhập kho TP', color: 'success' },
};

// Mock data cho production plans
const mockProductionPlans = [
    {
        id: 1,
        orderCode: 'DH001',
        customerName: 'Công ty TNHH ABC',
        totalProducts: 150,
        status: 'Đang sản xuất',
    },
    {
        id: 2,
        orderCode: 'DH002',
        customerName: 'Công ty XYZ',
        totalProducts: 200,
        status: 'Chờ xử lý',
    },
    {
        id: 3,
        orderCode: 'DH003',
        customerName: 'Công ty DEF',
        totalProducts: 75,
        status: 'Hoàn thành',
    },
    {
        id: 4,
        orderCode: 'DH004',
        customerName: 'Công ty GHI',
        totalProducts: 300,
        status: 'Chờ xử lý',
    },
];

// Mock data cho production orders theo từng production plan
const mockProductionOrdersByPlan: Record<number, any[]> = {
    1: [
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
    ],
    2: [
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
    ],
    3: [
        {
            id: 5,
            orderDate: '2024-07-04T11:00:00Z',
            description: 'Cắt kính 150*250, 80*180',
            status: 'Hoàn thành',
            isMaterialExported: true,
            isProductImported: true,
        },
    ],
    4: [
        {
            id: 6,
            orderDate: '2024-07-05T14:30:00Z',
            description: 'Ghép kính EI60 180*280*20',
            status: 'Đã xuất kho NVL',
            isMaterialExported: true,
            isProductImported: false,
        },
        {
            id: 7,
            orderDate: '2024-07-06T16:45:00Z',
            description: 'Sản xuất keo cứng cho đơn hàng #300',
            status: 'Chờ xử lý',
            isMaterialExported: false,
            isProductImported: false,
        },
    ],
};

const ProductionPlanList: React.FC = () => {
    const [items, setItems] = useState<ProductionPlanListItem[]>([]);
    const [initialRecords, setInitialRecords] = useState<ProductionPlanListItem[]>([]);
    const [records, setRecords] = useState<ProductionPlanListItem[]>([]);

    // Production orders state
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
    const [productionOrders, setProductionOrders] = useState<ProductionOrderListItem[]>([]);
    const [productionOrderRecords, setProductionOrderRecords] = useState<ProductionOrderListItem[]>([]);
    const [productionOrderInitialRecords, setProductionOrderInitialRecords] = useState<ProductionOrderListItem[]>([]);

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

    // Production orders pagination
    const [productionOrderPage, setProductionOrderPage] = useState(1);
    const [productionOrderPageSize, setProductionOrderPageSize] = useState(PAGE_SIZES[0]);

    const [search, setSearch] = useState('');
    const [productionOrderSearch, setProductionOrderSearch] = useState('');

    useEffect(() => {
        // Load mock data
        const mapped = mockProductionPlans.map((plan) => ({
            id: plan.id,
            orderCode: plan.orderCode,
            customerName: plan.customerName,
            totalProducts: plan.totalProducts,
            status: statusMap[plan.status] || { tooltip: plan.status, color: 'secondary' },
        }));
        setItems(mapped);
        
        // Set first plan as selected by default
        if (mapped.length > 0) {
            setSelectedPlanId(mapped[0].id);
        }
    }, []);

    useEffect(() => {
        setInitialRecords(sortBy(items, 'orderCode'));
    }, [items]);

    // Load production orders when plan is selected
    useEffect(() => {
        if (selectedPlanId) {
            const orders = mockProductionOrdersByPlan[selectedPlanId] || [];
            const mapped = orders.map((order) => ({
                id: order.id,
                orderDate: order.orderDate,
                description: order.description,
                status: productionOrderStatusMap[order.status] || { tooltip: order.status, color: 'secondary' },
                isMaterialExported: order.isMaterialExported,
                isProductImported: order.isProductImported,
            }));
            setProductionOrders(mapped);
        }
    }, [selectedPlanId]);

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    // Production orders pagination effects
    useEffect(() => {
        setProductionOrderInitialRecords(sortBy(productionOrders, 'orderDate'));
    }, [productionOrders]);

    useEffect(() => {
        setProductionOrderPage(1);
    }, [productionOrderPageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecords([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    useEffect(() => {
        const from = (productionOrderPage - 1) * productionOrderPageSize;
        const to = from + productionOrderPageSize;
        setProductionOrderRecords([...productionOrderInitialRecords.slice(from, to)]);
    }, [productionOrderPage, productionOrderPageSize, productionOrderInitialRecords]);

    useEffect(() => {
        setInitialRecords(() => {
            return items.filter((item) => {
                return (
                    item.orderCode.toLowerCase().includes(search.toLowerCase()) ||
                    item.customerName.toLowerCase().includes(search.toLowerCase()) ||
                    item.totalProducts.toString().includes(search.toLowerCase()) ||
                    item.status.tooltip.toLowerCase().includes(search.toLowerCase())
                );
            });
        });
    }, [search]);

    useEffect(() => {
        setProductionOrderInitialRecords(() => {
            return productionOrders.filter((item) => {
                return (
                    item.description.toLowerCase().includes(productionOrderSearch.toLowerCase()) ||
                    item.status.tooltip.toLowerCase().includes(productionOrderSearch.toLowerCase())
                );
            });
        });
    }, [productionOrderSearch, productionOrders]);

    const deleteRow = (id: any = null) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa kế hoạch sản xuất này?')) {
            if (id) {
                setRecords(items.filter((item) => item.id !== id));
                setInitialRecords(items.filter((item) => item.id !== id));
                setItems(items.filter((item) => item.id !== id));
                setSearch('');
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Production Plans Table */}
            <div className="production-plans-table">
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
                                width: 70,
                                render: (_, index) => <span>{index + 1}</span>,
                            },
                            {
                                accessor: 'orderCode',
                                title: 'Mã đơn hàng',
                                render: ({ orderCode }) => {
                                    const orderId = orderCode.replace(/^DH/, '');
                                    return (
                                        <Link href={`/sales-order/${orderId}`}>
                                            <div className="font-semibold text-primary underline hover:no-underline">{orderCode}</div>
                                        </Link>
                                    );
                                },
                            },
                            {
                                accessor: 'customerName',
                                title: 'Tên khách hàng',
                                textAlignment: 'center',
                                render: ({ customerName }) => (
                                    <div className="text-center font-semibold">{customerName}</div>
                                ),
                            },
                            {
                                accessor: 'totalProducts',
                                title: 'Tổng số SP',
                                textAlignment: 'center',
                                render: ({ totalProducts }) => (
                                    <div className="text-center font-semibold">{totalProducts}</div>
                                ),
                            },
                            {
                                accessor: 'status',
                                title: 'Trạng thái',
                                render: ({ status }) => (
                                    <span className={`badge badge-outline-${status.color}`}>
                                        {status.tooltip}
                                    </span>
                                ),
                            },
                            {
                                accessor: 'action',
                                title: 'Thao tác',
                                textAlignment: 'center',
                                width: 150,
                                render: ({ id }) => (
                                    <div className="mx-auto flex w-max items-center gap-4">
                                        
                                        <Link href={`/mockup/worker/production-plans/${id}`} className="flex hover:text-primary">
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
                        paginationText={({ from, to, totalRecords }) =>
                            `Hiển thị ${from} đến ${to} trong tổng số ${totalRecords} bản ghi`
                        }
                        onRowClick={(record) => setSelectedPlanId(record.id)}
                        rowClassName={(record) => 
                            record.id === selectedPlanId ? 'bg-primary/10' : ''
                        }
                    />
                </div>
            </div>

            {/* Production Orders Table */}
            <div className="production-orders-table">
                <div className="mb-4.5 flex flex-col gap-5 px-5 md:flex-row md:items-center">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">
                            Lệnh sản xuất - {selectedPlanId ? `Đơn hàng ${mockProductionPlans.find(p => p.id === selectedPlanId)?.orderCode || ''}` : 'Chọn kế hoạch'}
                        </h3>
                    </div>
                    <div className="ltr:ml-auto rtl:mr-auto">
                        <input
                            type="text"
                            className="form-input w-auto"
                            placeholder="Tìm kiếm lệnh sản xuất..."
                            value={productionOrderSearch}
                            onChange={(e) => setProductionOrderSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="datatables pagination-padding">
                    <DataTable
                        className="table-hover whitespace-nowrap"
                        records={productionOrderRecords}
                        columns={[
                            {
                                accessor: 'index',
                                title: '#',
                                width: 70,
                                render: (_, index) => <span>{index + 1}</span>,
                            },
                            {
                                accessor: 'orderDate',
                                title: 'Ngày lên lệnh',
                                render: ({ orderDate }) => (
                                    <div>{orderDate ? new Date(orderDate).toLocaleDateString() : '-'}</div>
                                ),
                            },
                            {
                                accessor: 'description',
                                title: 'Mô tả',
                                render: ({ description }) => (
                                    <div className="max-w-xs truncate" title={description}>
                                        {description}
                                    </div>
                                ),
                            },
                            {
                                accessor: 'status',
                                title: 'Trạng thái',
                                render: ({ status }) => (
                                    <span className={`badge badge-outline-${status.color}`}>
                                        {status.tooltip}
                                    </span>
                                ),
                            },
                            {
                                accessor: 'isMaterialExported',
                                title: 'Đã xuất kho NVL',
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
                        totalRecords={productionOrderInitialRecords.length}
                        recordsPerPage={productionOrderPageSize}
                        page={productionOrderPage}
                        onPageChange={(p) => setProductionOrderPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setProductionOrderPageSize}
                        paginationText={({ from, to, totalRecords }) =>
                            `Hiển thị ${from} đến ${to} trong tổng số ${totalRecords} bản ghi`
                        }
                    />
                </div>
            </div>
        </div>
    );
};

export default ProductionPlanList;
