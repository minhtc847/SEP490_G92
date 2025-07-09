'use client';
import { DataTable } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import IconEye from '@/components/icon/icon-eye';
import IconSend from '@/components/icon/icon-send';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import Dropdown from '@/components/dropdown';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';

export interface OrderInfo {
    customerName: string;
    orderCode: string;
}

export interface MaterialDetails {
    glassArea: number;
    perimeter: number;
    glueArea: number;
    gluePerLayer: number;
    totalGlue: number;
    butylLength: number;
    tpa: number;
    koh: number;
    h2o: number;
}

export interface ProductDetail {
    id: number;
    productCode: string;
    quantity: number;
    thickness: number;
    glueLayers: number;
    glassLayers: number;
    width: number;
    height: number;
    glassThickness: number;
    butylType: number;
    glass4mm: number;
    glass5mm: number;
    isCuongLuc: boolean;
}

export interface ProductionOrderListItem {
    id: number;
    orderDate?: string;
    description: string;
    status: { tooltip: string; color: string };
    isMaterialExported: boolean;
    isProductImported: boolean;
}

const defaultRowData: ProductDetail[] = [
    {
        id: 1,
        productCode: 'El 70',
        quantity: 4,
        thickness: 26,
        glueLayers: 2,
        glassLayers: 3,
        width: 740,
        height: 2135,
        glassThickness: 5,
        butylType: 5,
        glass4mm: 0,
        glass5mm: 3,
        isCuongLuc: true,
    },
    {
        id: 2,
        productCode: 'El 60',
        quantity: 2,
        thickness: 22,
        glueLayers: 1,
        glassLayers: 2,
        width: 240,
        height: 1990,
        glassThickness: 5,
        butylType: 8,
        glass4mm: 1,
        glass5mm: 1,
        isCuongLuc: false,
    },
    {
        id: 3,
        productCode: 'El 60',
        quantity: 1,
        thickness: 22,
        glueLayers: 1,
        glassLayers: 2,
        width: 2410,
        height: 1990,
        glassThickness: 5,
        butylType: 8,
        glass4mm: 0,
        glass5mm: 2,
        isCuongLuc: false,
    },
];

const productionOrderStatusMap: Record<string, { tooltip: string; color: string }> = {
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

// Mock data for warehouse slips
const mockWarehouseSlips = [
    {
        id: 1,
        date: '2024-07-05T08:00:00Z',
        type: 'Cắt kính',
        user: 'Nguyễn Văn A',
        note: 'Xuất kính cho đơn hàng #123',
    },
    {
        id: 2,
        date: '2024-07-06T09:30:00Z',
        type: 'keo,butyl',
        user: 'Trần Thị B',
        note: 'Xuất keo cho sản xuất',
    },
    {
        id: 3,
        date: '2024-07-07T10:15:00Z',
        type: 'hóa chất',
        user: 'Lê Văn C',
        note: 'Xuất hóa chất cho phòng lab',
    },
];

interface ProductionPlanDetailManagerComponentProps {
    orderInfo?: OrderInfo;
    productData?: ProductDetail[];
    onOrderCreated?: () => void;
}

const ProductionPlanDetailManagerComponent: React.FC<ProductionPlanDetailManagerComponentProps> = ({
    orderInfo = {
        customerName: 'Anh Huy Adamco',
        orderCode: 'ĐH00003',
    },
    productData = defaultRowData,
    onOrderCreated
}) => {
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState(productData);
    const [recordsData, setRecordsData] = useState(initialRecords);
    const [productionOrders, setProductionOrders] = useState<ProductionOrderListItem[]>([]);
    const [productionOrderRecords, setProductionOrderRecords] = useState<ProductionOrderListItem[]>([]);
    const [productionOrderInitialRecords, setProductionOrderInitialRecords] = useState<ProductionOrderListItem[]>([]);
    const [productionOrderPage, setProductionOrderPage] = useState(1);
    const [productionOrderPageSize, setProductionOrderPageSize] = useState(PAGE_SIZES[0]);
    const [productionOrderSearch, setProductionOrderSearch] = useState('');
    const [tabs, setTabs] = useState<string>('plan');
    const [modal5, setModal5] = useState(false);
    const [selectedOrderType, setSelectedOrderType] = useState<string>('');
    const [modalProductQuantities, setModalProductQuantities] = useState<{ [productId: number]: number }>({});
    const [warehouseTabPage, setWarehouseTabPage] = useState(1);
    const [warehouseTabPageSize, setWarehouseTabPageSize] = useState(PAGE_SIZES[0]);
    const [warehouseTabRecords, setWarehouseTabRecords] = useState(mockWarehouseSlips);
    const toggleTabs = (name: string) => {
        setTabs(name);
    };
    const calculateMaterialDetails = (record: ProductDetail): MaterialDetails => {
        const width = record.width / 1000;
        const height = record.height / 1000;
        const glassArea = width * height;
        const perimeter = 2 * (width + height);
        const glueArea = perimeter * record.thickness / 1000;
        const gluePerLayer = glueArea * 0.5;
        const totalGlue = gluePerLayer * record.glueLayers;
        const butylLength = perimeter * record.glassLayers;
        const tpa = totalGlue * 0.4;
        const koh = totalGlue * 0.3;
        const h2o = totalGlue * 0.3;
        return {
            glassArea,
            perimeter,
            glueArea,
            gluePerLayer,
            totalGlue,
            butylLength,
            tpa,
            koh,
            h2o
        };
    };
    useEffect(() => {
        setInitialRecords(productData);
    }, [productData]);
    useEffect(() => {
        const mapped = mockProductionOrders.map((order) => ({
            id: order.id,
            orderDate: order.orderDate,
            description: order.description,
            status: productionOrderStatusMap[order.status] || { tooltip: order.status, color: 'secondary' },
            isMaterialExported: order.isMaterialExported,
            isProductImported: order.isProductImported,
        }));
        setProductionOrders(mapped);
    }, []);
    useEffect(() => {
        setPage(1);
    }, [pageSize]);
    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsData([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);
    useEffect(() => {
        setProductionOrderInitialRecords(productionOrders);
    }, [productionOrders]);
    useEffect(() => {
        setProductionOrderPage(1);
    }, [productionOrderPageSize]);
    useEffect(() => {
        const from = (productionOrderPage - 1) * productionOrderPageSize;
        const to = from + productionOrderPageSize;
        setProductionOrderRecords([...productionOrderInitialRecords.slice(from, to)]);
    }, [productionOrderPage, productionOrderPageSize, productionOrderInitialRecords]);
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
    useEffect(() => {
        setWarehouseTabPage(1);
    }, [warehouseTabPageSize]);
    useEffect(() => {
        const from = (warehouseTabPage - 1) * warehouseTabPageSize;
        const to = from + warehouseTabPageSize;
        setWarehouseTabRecords([...mockWarehouseSlips.slice(from, to)]);
    }, [warehouseTabPage, warehouseTabPageSize]);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    // Handler for dropdown selection
    const handleDropdownSelect = (type: string) => {
        setSelectedOrderType(type);
        setModal5(true);
        // Initialize modal quantities with default values (e.g., 0)
        const initialQuantities: { [productId: number]: number } = {};
        productData.forEach((product) => {
            initialQuantities[product.id] = 0;
        });
        setModalProductQuantities(initialQuantities);
    };

    // Handler for changing quantity in modal
    const handleModalQuantityChange = (productId: number, value: string) => {
        setModalProductQuantities((prev) => ({
            ...prev,
            [productId]: Number(value),
        }));
    };

    return (
        <div>
            <div className="panel">
                {/* Tabs */}
                <div className="mb-5">
                    <ul className="flex flex-wrap -mb-px border-b border-[#e0e6ed] dark:border-[#191e3a]">
                        <li className="mr-2">
                            <button
                                type="button"
                                className={`inline-block p-4 text-sm font-medium rounded-t-lg border-b-2 ${tabs === 'plan'
                                    ? 'text-primary border-primary'
                                    : 'text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                onClick={() => toggleTabs('plan')}
                            >
                                Kế hoạch sản xuất
                            </button>
                        </li>
                        <li className="mr-2">
                            <button
                                type="button"
                                className={`inline-block p-4 text-sm font-medium rounded-t-lg border-b-2 ${tabs === 'orders'
                                    ? 'text-primary border-primary'
                                    : 'text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                onClick={() => toggleTabs('orders')}
                            >
                                Chi tiết lệnh sản xuất
                            </button>
                        </li>
                        <li className="mr-2">
                            <button
                                type="button"
                                className={`inline-block p-4 text-sm font-medium rounded-t-lg border-b-2 ${tabs === 'warehouse'
                                    ? 'text-primary border-primary'
                                    : 'text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                                onClick={() => toggleTabs('warehouse')}
                            >
                                Phiếu xuất/nhập kho
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Tab Content */}
                {tabs === 'plan' && (
                    <div>
                        <div className="flex flex-col flex-wrap justify-between gap-6 lg:flex-row">
                            <div className="flex-1">
                                <div className="space-y-1 text-white-dark">
                                    <div>Sản xuất cho:</div>
                                    <div className="font-semibold text-black dark:text-white">{orderInfo.customerName}</div>
                                    <div>123 Đường ABC, Quận 1, TP.HCM</div>
                                    <div>0901234567</div>
                                </div>
                            </div>
                            <div className="flex flex-col justify-between gap-6 sm:flex-row lg:w-2/3">
                                <div className="xl:1/3 sm:w-1/2 lg:w-2/5">
                                    <div className="mb-2 flex w-full items-center justify-between">
                                        <div className="text-white-dark">Mã đơn hàng :</div>
                                        <div>#{orderInfo.orderCode}</div>
                                    </div>
                                    <div className="mb-2 flex w-full items-center justify-between">
                                        <div className="text-white-dark">Ngày đặt hàng :</div>
                                        <div>01/07/2024</div>
                                    </div>
                                    <div className="flex w-full items-center justify-between">
                                        <div className="text-white-dark">Tình trạng giao hàng :</div>
                                        <div>Đang xử lý</div>
                                    </div>
                                </div>
                                <div className="xl:1/3 sm:w-1/2 lg:w-2/5">
                                    <div className="mb-2 flex w-full items-center justify-between">
                                        <div className="text-white-dark">Ngày bắt đầu:</div>
                                        <div className="whitespace-nowrap">05/07/2024</div>
                                    </div>
                                    <div className="mb-2 flex w-full items-center justify-between">
                                        <div className="text-white-dark">Trạng thái:</div>
                                        <div>Đang sản xuất</div>
                                    </div>
                                    <div className="mb-2 flex w-full items-center justify-between">
                                        <div className="text-white-dark">Tổng sản phẩm:</div>
                                        <div>7</div>
                                    </div>
                                    <div className="mb-2 flex w-full items-center justify-between">
                                        <div className="text-white-dark">Đã hoàn thành:</div>
                                        <div>3</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="table-responsive mt-6">
                            <table className="table-striped">
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>Tên sản phẩm</th>
                                        <th>Số lượng</th>
                                        <th>Đã cắt kính</th>
                                        <th>Đã ghép kính</th>
                                        <th>Đã đổ keo</th>
                                        <th>Đã hoàn thành</th>
                                        <th>Đã giao</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1</td>
                                        <td>El 70</td>
                                        <td>4</td>
                                        <td>3</td>
                                        <td>2</td>
                                        <td>2</td>
                                        <td>2</td>
                                        <td>1</td>
                                    </tr>
                                    <tr>
                                        <td>2</td>
                                        <td>El 60</td>
                                        <td>2</td>
                                        <td>2</td>
                                        <td>1</td>
                                        <td>1</td>
                                        <td>1</td>
                                        <td>0</td>
                                    </tr>
                                    <tr>
                                        <td>3</td>
                                        <td>El 60</td>
                                        <td>1</td>
                                        <td>1</td>
                                        <td>0</td>
                                        <td>0</td>
                                        <td>0</td>
                                        <td>0</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {tabs === 'orders' && (
                    <div>
                        <div className="flex flex-col flex-wrap justify-between gap-6 lg:flex-row">
                            <div className="flex flex-col justify-between gap-6 sm:flex-row lg:w-2/3">
                                <div className="xl:1/3 sm:w-1/2 lg:w-2/5">
                                    <div className="mb-2 flex w-full items-center justify-between">
                                        <div className="text-white-dark">Tổng keo nano :</div>
                                        <div>20 kg</div>
                                    </div>
                                    <div className="mb-2 flex w-full items-center justify-between">
                                        <div className="text-white-dark">Chất A :</div>
                                        <div>10 kg</div>
                                    </div>
                                    <div className="mb-2 flex w-full items-center justify-between">
                                        <div className="text-white-dark">KOH :</div>
                                        <div>2 kg</div>
                                    </div>
                                    <div className="flex w-full items-center justify-between">
                                        <div className="text-white-dark">H2O :</div>
                                        <div>8 kg</div>
                                    </div>
                                </div>
                                <div className="xl:1/3 sm:w-1/2 lg:w-2/5">
                                    <div className="mb-2 flex w-full items-center justify-between">
                                        <div className="text-white-dark">Tổng keo mềm:</div>
                                        <div className="whitespace-nowrap">20 kg</div>
                                    </div>
                                    <div className="mb-2 flex w-full items-center justify-between">
                                        <div className="text-white-dark">Nước liệu: </div>
                                        <div>10 kg</div>
                                    </div>
                                    <div className="mb-2 flex w-full items-center justify-between">
                                        <div className="text-white-dark">A:</div>
                                        <div>7 kg</div>
                                    </div>
                                    <div className="mb-2 flex w-full items-center justify-between">
                                        <div className="text-white-dark">B :</div>
                                        <div>3 kg</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="datatables mt-8">
                            <DataTable
                                highlightOnHover
                                className="table-hover whitespace-nowrap"
                                records={recordsData}
                                columns={[
                                    { accessor: 'id', title: 'STT' },
                                    { accessor: 'productCode', title: 'Tên sản phẩm', render: (record) => `${record.productCode} ${record.width}*${record.height}` },
                                    { accessor: 'quantity', title: 'Số lượng' },
                                    { accessor: 'thickness', title: 'Dày' },
                                    { accessor: 'glueLayers', title: 'Lớp keo' },
                                    { accessor: 'glassLayers', title: 'Số kính' },
                                    { accessor: 'glass4mm', title: 'Kính 4' },
                                    { accessor: 'glass5mm', title: 'Kính 5' },
                                    { accessor: 'butylType', title: 'Loại butyl' },
                                    {
                                        accessor: 'totalGlue',
                                        title: 'Tổng keo(kg)',
                                        render: (record) => calculateMaterialDetails(record).totalGlue.toFixed(2)
                                    },
                                    {
                                        accessor: 'butylLength',
                                        title: 'Tổng butyl (m)',
                                        render: (record) => calculateMaterialDetails(record).butylLength.toFixed(2)
                                    },
                                    {
                                        accessor: 'isCuongLuc',
                                        title: 'CL',
                                        render: ({ isCuongLuc }) => (
                                            <input
                                                type="checkbox"
                                                checked={isCuongLuc}
                                                disabled
                                                className="form-checkbox"
                                            />
                                        )
                                    },
                                ]}
                                totalRecords={initialRecords.length}
                                recordsPerPage={pageSize}
                                page={page}
                                onPageChange={(p) => setPage(p)}
                                recordsPerPageOptions={PAGE_SIZES}
                                onRecordsPerPageChange={setPageSize}
                                minHeight={200}
                                paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                            />
                        </div>
                    </div>
                )}

                {tabs === 'warehouse' && (
                    <div>
                        <div className="mb-4.5 flex flex-col gap-5 px-5 md:flex-row md:items-center">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold">Danh sách phiếu xuất/nhập kho</h3>
                            </div>
                        </div>
                        <div className="datatables pagination-padding">
                            <DataTable
                                className="table-hover whitespace-nowrap"
                                records={warehouseTabRecords}
                                columns={[
                                    {
                                        accessor: 'index',
                                        title: 'STT',
                                        width: 70,
                                        render: (_, index) => <span>{index + 1}</span>,
                                    },
                                    {
                                        accessor: 'date',
                                        title: 'Ngày xuất',
                                        render: ({ date }) => (
                                            <div>{date ? new Date(date).toLocaleDateString() : '-'}</div>
                                        ),
                                    },
                                    {
                                        accessor: 'type',
                                        title: 'Loại xuất',
                                        render: ({ type }) => (
                                            <span>{type}</span>
                                        ),
                                    },
                                    {
                                        accessor: 'user',
                                        title: 'Người xuất',
                                    },
                                    {
                                        accessor: 'note',
                                        title: 'Ghi chú',
                                    },
                                    {
                                        accessor: 'action',
                                        title: 'Thao tác',
                                        textAlignment: 'center',
                                        width: 100,
                                        render: ({ id }) => (
                                            <div className="mx-auto flex w-max items-center gap-4">
                                                <Link href={`/mockup/manager/ware-house-slips/${id}`} className="flex hover:text-primary" title="Xem chi tiết">
                                                    <IconEye />
                                                </Link>
                                            </div>
                                        ),
                                    },
                                ]}
                                highlightOnHover
                                totalRecords={mockWarehouseSlips.length}
                                recordsPerPage={warehouseTabPageSize}
                                page={warehouseTabPage}
                                onPageChange={(p) => setWarehouseTabPage(p)}
                                recordsPerPageOptions={PAGE_SIZES}
                                onRecordsPerPageChange={setWarehouseTabPageSize}
                                paginationText={({ from, to, totalRecords }) =>
                                    `Hiển thị ${from} đến ${to} trong tổng số ${totalRecords} bản ghi`
                                }
                            />
                        </div>
                    </div>
                )}
            </div>
            {/* Production Orders List Panel - Always visible */}
            <div className="panel mt-6">
                <div className="flex flex-wrap items-center justify-center gap-4 lg:justify-end">
                    <div className="dropdown">
                        <Dropdown
                            placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                            btnClassName="btn btn-primary dropdown-toggle"
                            button={
                                <>
                                    <IconSend />
                                    Lên lệnh sản xuất
                                    <span>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                                    </span>
                                </>
                            }
                        >
                            <ul className="!min-w-[170px]">
                                <li>
                                    <button type="button" onClick={() => handleDropdownSelect('Cắt kính')}>
                                        Cắt kính
                                    </button>
                                </li>
                                <li>
                                    <button type="button" onClick={() => handleDropdownSelect('Ghép kính')}>
                                        Ghép kính
                                    </button>
                                </li>
                                <li>
                                    <button type="button" onClick={() => handleDropdownSelect('Sản xuất keo')}>
                                        Sản xuất keo
                                    </button>
                                </li>
                                <li>
                                    <button type="button" onClick={() => handleDropdownSelect('Đổ keo')}>
                                        Đổ keo
                                    </button>
                                </li>
                            </ul>
                        </Dropdown>
                    </div>
                </div>
                <div className="mb-4.5 flex flex-col gap-5 px-5 md:flex-row md:items-center">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">Danh sách lệnh sản xuất</h3>
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
            <Transition appear show={modal5} as={Fragment}>
                <Dialog as="div" open={modal5} onClose={() => setModal5(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0" />
                    </Transition.Child>
                    <div className="fixed inset-0 bg-[black]/60 z-[999]">
                        <div className="flex items-start justify-center min-h-screen px-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-5xl my-8 text-black dark:text-white-dark">
                                    <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                        <h5 className="font-bold text-lg">{selectedOrderType || 'Lệnh sản xuất'}</h5>
                                        <button onClick={() => setModal5(false)} type="button" className="text-white-dark hover:text-dark">
                                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                    <div className="p-5">
                                        {/* Mocked product list with quantity input */}
                                        <div className="table-responsive">
                                            <table className="table-striped w-full">
                                                <thead>
                                                    <tr>
                                                        <th>STT</th>
                                                        <th>Tên sản phẩm</th>
                                                        <th>Số lượng</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {productData.map((product, idx) => (
                                                        <tr key={product.id}>
                                                            <td>{idx + 1}</td>
                                                            <td>{product.productCode} {product.width}*{product.height}</td>
                                                            <td>
                                                                <input
                                                                    type="number"
                                                                    min={0}
                                                                    className="form-input w-24"
                                                                    value={modalProductQuantities[product.id] ?? 0}
                                                                    onChange={e => handleModalQuantityChange(product.id, e.target.value)}
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="flex justify-end items-center mt-8">
                                            <button onClick={() => setModal5(false)} type="button" className="btn btn-outline-danger">
                                                Discard
                                            </button>
                                            <button onClick={() => setModal5(false)} type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default ProductionPlanDetailManagerComponent;
