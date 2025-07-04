'use client';
import IconEdit from '@/components/icon/icon-edit';
import IconEye from '@/components/icon/icon-eye';
import IconPlus from '@/components/icon/icon-plus';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import { sortBy } from 'lodash';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { fetchProductionPlanList, ProductionPlan } from './service';

const statusMap: Record<string, { tooltip: string; color: string }> = {
    'Đang sản xuất': { tooltip: 'Đang sản xuất', color: 'warning' },
    'Hoàn thành': { tooltip: 'Hoàn thành', color: 'success' },
    'Chờ xử lý': { tooltip: 'Chờ xử lý', color: 'danger' },
};

const ProductionPlansPage = () => {
    const [items, setItems] = useState<any[]>([]);
    const [initialRecords, setInitialRecords] = useState<any[]>([]);
    const [records, setRecords] = useState<any[]>([]);

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'orderCode',
        direction: 'asc',
    });

    useEffect(() => {
        async function loadData() {
            try {
                const data: ProductionPlan[] = await fetchProductionPlanList();
                const mapped = data.map((plan, idx) => ({
                    id: plan.id,
                    orderCode: plan.orderCode,
                    customerName: plan.customerName,
                    totalProducts: plan.quantity,
                    status: statusMap[plan.status || ''] || { tooltip: plan.status || '', color: 'secondary' },
                }));
                setItems(mapped);
                console.log('Fetched plans:', mapped);
            } catch (error: any) {
                console.error('Lỗi khi fetch production plans:', error);
                alert(error?.message || 'Có lỗi xảy ra khi lấy danh sách production plan');
            }
        }
        loadData();
    }, []);

    useEffect(() => {
        setInitialRecords(sortBy(items, 'orderCode'));
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
                    item.orderCode.toLowerCase().includes(search.toLowerCase()) ||
                    item.customerName.toLowerCase().includes(search.toLowerCase()) ||
                    item.totalProducts.toString().includes(search.toLowerCase()) ||
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
        <div>
            <div className="mb-5">
                <h1 className="text-2xl font-bold">Danh sách kế hoạch sản xuất</h1>
            </div>
            <div className="panel mt-6">

                <div className="production-plans-table">
                    <div className="mb-4.5 flex flex-col gap-5 px-5 md:flex-row md:items-center">
                        <div className="flex items-center gap-2">
                            <Link href="/production-plans/create" className="btn btn-primary gap-2">
                                <IconPlus />
                                Thêm mới
                            </Link>
                        </div>
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
                                    accessor: 'orderCode',
                                    title: 'Mã đơn hàng',
                                    sortable: true,
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
                                    sortable: true,
                                    textAlignment: 'center',
                                    render: ({ customerName }) => (
                                        <div className="text-center font-semibold">{customerName}</div>
                                    ),
                                },
                                {
                                    accessor: 'totalProducts',
                                    title: 'Tổng số SP',
                                    sortable: true,
                                    textAlignment: 'center',
                                    render: ({ totalProducts }) => (
                                        <div className="text-center font-semibold">{totalProducts}</div>
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
                                    accessor: 'action',
                                    title: 'Thao tác',
                                    sortable: false,
                                    textAlignment: 'center',
                                    width: 150,
                                    render: ({ id }) => (
                                        <div className="mx-auto flex w-max items-center gap-4">
                                            <Link href="/production-plans/edit" className="flex hover:text-info">
                                                <IconEdit className="h-4.5 w-4.5" />
                                            </Link>
                                            <Link href={`/production-plans/${id}`} className="flex hover:text-primary">
                                                <IconEye />
                                            </Link>
                                            <button
                                                type="button"
                                                className="flex hover:text-danger"
                                                onClick={() => deleteRow(id)}
                                            >
                                                <IconTrashLines />
                                            </button>
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
            </div>
        </div>

    );
};

export default ProductionPlansPage;
