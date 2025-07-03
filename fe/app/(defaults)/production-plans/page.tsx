'use client';
import IconEdit from '@/components/icon/icon-edit';
import IconEye from '@/components/icon/icon-eye';
import IconPlus from '@/components/icon/icon-plus';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import { sortBy } from 'lodash';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

const ProductionPlansPage = () => {
    const [items, setItems] = useState([
        {
            id: 1,
            orderCode: 'PP001',
            customerName: 'Công ty TNHH ABC',
            totalProducts: 150,
            status: { tooltip: 'Đang sản xuất', color: 'warning' },
        },
        {
            id: 2,
            orderCode: 'PP002',
            customerName: 'Công ty XYZ',
            totalProducts: 200,
            status: { tooltip: 'Hoàn thành', color: 'success' },
        },
        {
            id: 3,
            orderCode: 'PP003',
            customerName: 'Công ty DEF',
            totalProducts: 75,
            status: { tooltip: 'Chờ xử lý', color: 'danger' },
        },
        {
            id: 4,
            orderCode: 'PP004',
            customerName: 'Công ty GHI',
            totalProducts: 300,
            status: { tooltip: 'Đang sản xuất', color: 'warning' },
        },
        {
            id: 5,
            orderCode: 'PP005',
            customerName: 'Công ty JKL',
            totalProducts: 120,
            status: { tooltip: 'Hoàn thành', color: 'success' },
        },
        {
            id: 6,
            orderCode: 'PP006',
            customerName: 'Công ty MNO',
            totalProducts: 180,
            status: { tooltip: 'Chờ xử lý', color: 'danger' },
        },
        {
            id: 7,
            orderCode: 'PP007',
            customerName: 'Công ty PQR',
            totalProducts: 250,
            status: { tooltip: 'Đang sản xuất', color: 'warning' },
        },
        {
            id: 8,
            orderCode: 'PP008',
            customerName: 'Công ty STU',
            totalProducts: 90,
            status: { tooltip: 'Hoàn thành', color: 'success' },
        },
        {
            id: 9,
            orderCode: 'PP009',
            customerName: 'Công ty VWX',
            totalProducts: 160,
            status: { tooltip: 'Chờ xử lý', color: 'danger' },
        },
        {
            id: 10,
            orderCode: 'PP010',
            customerName: 'Công ty YZ',
            totalProducts: 220,
            status: { tooltip: 'Đang sản xuất', color: 'warning' },
        },
    ]);

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState(sortBy(items, 'orderCode'));
    const [records, setRecords] = useState(initialRecords);

    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'orderCode',
        direction: 'asc',
    });

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
        <div className="panel border-white-light px-0 dark:border-[#1b2e4b]">
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
                                render: ({ orderCode }) => (
                                    <Link href="/production-plans/preview">
                                        <div className="font-semibold text-primary underline hover:no-underline">{orderCode}</div>
                                    </Link>
                                ),
                            },
                            {
                                accessor: 'customerName',
                                title: 'Tên khách hàng',
                                sortable: true,
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
                                        <Link href="/production-plans/preview" className="flex hover:text-primary">
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
    );
};

export default ProductionPlansPage;
