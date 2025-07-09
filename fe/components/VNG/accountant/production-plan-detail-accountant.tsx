'use client';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import sortBy from 'lodash/sortBy';
import IconFile from '@/components/icon/icon-file';
import IconPrinter from '@/components/icon/icon-printer';
import IconEye from '@/components/icon/icon-eye';
import Link from 'next/link';
import Swal from 'sweetalert2';

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
    },
];

const col = ['id', 'productCode', 'quantity', 'thickness', 'glueLayers', 'glassLayers', 'width', 'height', 'glassThickness', 'butylType'];

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

interface ProductionPlanDetailAccountantComponentProps {
    orderInfo?: OrderInfo;
    productData?: ProductDetail[];
    onOrderCreated?: () => void;
}

const ProductionPlanDetailAccountantComponent: React.FC<ProductionPlanDetailAccountantComponentProps> = ({
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
    const [initialRecords, setInitialRecords] = useState(sortBy(productData, 'id'));
    const [recordsData, setRecordsData] = useState(initialRecords);
    const [selectedRecord, setSelectedRecord] = useState<ProductDetail | null>(null);

    // Production orders state
    const [productionOrders, setProductionOrders] = useState<ProductionOrderListItem[]>([]);
    const [productionOrderRecords, setProductionOrderRecords] = useState<ProductionOrderListItem[]>([]);
    const [productionOrderInitialRecords, setProductionOrderInitialRecords] = useState<ProductionOrderListItem[]>([]);
    const [productionOrderPage, setProductionOrderPage] = useState(1);
    const [productionOrderPageSize, setProductionOrderPageSize] = useState(PAGE_SIZES[0]);
    const [productionOrderSearch, setProductionOrderSearch] = useState('');
    const [productionOrderSortStatus, setProductionOrderSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'orderDate',
        direction: 'asc',
    });

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    // Tab state
    const [tabs, setTabs] = useState<string>('plan');
    const toggleTabs = (name: string) => {
        setTabs(name);
    };

    // Tính toán chi tiết nguyên vật liệu
    const calculateMaterialDetails = (record: ProductDetail): MaterialDetails => {
        const width = record.width / 1000; // Chuyển mm sang m
        const height = record.height / 1000;
        const glassArea = width * height;
        const perimeter = 2 * (width + height);
        const glueArea = perimeter * record.thickness / 1000;
        const gluePerLayer = glueArea * 0.5; // Giả sử 0.5kg keo cho 1m2
        const totalGlue = gluePerLayer * record.glueLayers;
        const butylLength = perimeter * record.glassLayers;
        const tpa = totalGlue * 0.4; // Giả sử 40% TPA trong keo
        const koh = totalGlue * 0.3; // Giả sử 30% KOH trong keo
        const h2o = totalGlue * 0.3; // Giả sử 30% H2O trong keo

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
        setInitialRecords(sortBy(productData, 'id'));
    }, [productData]);

    // Load production orders
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
        const data = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
        setPage(1);
    }, [sortStatus]);

    // Production orders effects
    useEffect(() => {
        setProductionOrderInitialRecords(sortBy(productionOrders, 'orderDate'));
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
        const data2 = sortBy(productionOrderInitialRecords, productionOrderSortStatus.columnAccessor);
        setProductionOrderRecords(productionOrderSortStatus.direction === 'desc' ? data2.reverse() : data2);
        setProductionOrderPage(1);
    }, [productionOrderSortStatus, productionOrderInitialRecords]);

    const exportTable = (type: any) => {
        if (type === 'excel') {
            // Button chỉ để hiển thị, không thực thi chức năng
            return;
        } else if (type === 'print') {
            var rowhtml = '<p>' + 'Lệnh sản xuất' + '</p>';
            rowhtml +=
                '<table style="width: 100%; " cellpadding="0" cellcpacing="0"><thead><tr style="color: #515365; background: #eff5ff; -webkit-print-color-adjust: exact; print-color-adjust: exact; "> ';
            col.map((d: any) => {
                rowhtml += '<th>' + capitalize(d) + '</th>';
            });
            rowhtml += '</tr></thead>';
            rowhtml += '<tbody>';
            productData.map((item: any) => {
                rowhtml += '<tr>';
                col.map((d: any) => {
                    let val = item[d] ? item[d] : '';
                    rowhtml += '<td>' + val + '</td>';
                });
                rowhtml += '</tr>';
            });
            rowhtml +=
                '<style>body {font-family:Arial; color:#495057;}p{text-align:center;font-size:20px;font-weight:bold;margin:15px;}table{ border-collapse: collapse; width: 100%; }thead{background-color: #eff5ff;-webkit-print-color-adjust: exact;print-color-adjust: exact;}tbody{background-color: #fff;-webkit-print-color-adjust: exact;print-color-adjust: exact;}th,td{font-size:12px;text-align:left;padding: 0.75rem;vertical-align:top;border:1px solid #dee2e6;}</style>';
            rowhtml += '</tbody></table>';
            var winPrint: any = window.open('', '', 'left=0,top=0,width=1000,height=600,toolbar=0,scrollbars=0,status=0');
            winPrint.document.write('<title>Print Table</title>' + rowhtml);
            winPrint.document.close();
            winPrint.focus();
            winPrint.print();
            winPrint.close();
        } else if (type === 'txt') {
            let coldelimiter = ',';
            let linedelimiter = '\n';
            let result = col
                .map((d: any) => {
                    return capitalize(d);
                })
                .join(coldelimiter);
            result += linedelimiter;
            productData.map((item: any) => {
                col.map((d: any, index: any) => {
                    if (index > 0) {
                        result += coldelimiter;
                    }
                    let val = item[d] ? item[d] : '';
                    result += val;
                });
                result += linedelimiter;
            });

            if (result == null) return;
            if (!result.match(/^data:text\/txt/i)) {
                var data1 = 'data:application/txt;charset=utf-8,' + encodeURIComponent(result);
                var link1 = document.createElement('a');
                link1.setAttribute('href', data1);
                link1.setAttribute('download', 'Lệnh sản xuất - ' + orderInfo.orderCode + '.txt');
                link1.click();
            }
        }
    };

    const capitalize = (text: any) => {
        return text
            .replace('_', ' ')
            .replace('-', ' ')
            .toLowerCase()
            .split(' ')
            .map((s: any) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(' ');
    };

    const handleCreateOrder = () => {
        Swal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: 'Lệnh sản xuất đã được tạo.',
            padding: '2em',
            customClass: { popup: 'sweet-alerts' },
        });

        if (onOrderCreated) {
            onOrderCreated();
        }
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

                    </ul>
                </div>

                {/* Tab Content */}
                {tabs === 'plan' && (
                    <div>
                        {/* Production Plan Information Panel */}
                        <div className="panel">
                            <div className="flex flex-wrap justify-between gap-4 px-4">
                                <div className="text-2xl font-semibold uppercase">Kế hoạch sản xuất</div>
                            </div>

                            <hr className="my-6 border-white-light dark:border-[#1b2e4b]" />
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
                                            <th>Tổng số lượng</th>
                                            <th>Đang sản xuất</th>
                                            <th>Đã hoàn thành</th>
                                            <th>Đã cắt kính</th>
                                            <th>Đã trộn keo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>1</td>
                                            <td>El 70</td>
                                            <td className="ltr:text-right rtl:text-left">4</td>
                                            <td className="ltr:text-right rtl:text-left">2</td>
                                            <td className="ltr:text-right rtl:text-left">2</td>
                                            <td className="ltr:text-right rtl:text-left">3</td>
                                            <td className="ltr:text-right rtl:text-left">2</td>
                                        </tr>
                                        <tr>
                                            <td>2</td>
                                            <td>El 60</td>
                                            <td className="ltr:text-right rtl:text-left">2</td>
                                            <td className="ltr:text-right rtl:text-left">1</td>
                                            <td className="ltr:text-right rtl:text-left">1</td>
                                            <td className="ltr:text-right rtl:text-left">2</td>
                                            <td className="ltr:text-right rtl:text-left">1</td>
                                        </tr>
                                        <tr>
                                            <td>3</td>
                                            <td>El 60</td>
                                            <td className="ltr:text-right rtl:text-left">1</td>
                                            <td className="ltr:text-right rtl:text-left">0</td>
                                            <td className="ltr:text-right rtl:text-left">0</td>
                                            <td className="ltr:text-right rtl:text-left">1</td>
                                            <td className="ltr:text-right rtl:text-left">0</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {tabs === 'orders' && (
                    <div>


                        <div className="datatables mt-8">
                            <DataTable
                                highlightOnHover
                                className="table-hover whitespace-nowrap"
                                records={recordsData}
                                columns={[
                                    { accessor: 'id', title: 'STT', sortable: true },
                                    { accessor: 'productCode', title: 'Mã sản phẩm', sortable: true },
                                    { accessor: 'quantity', title: 'Số lượng', sortable: true },
                                    { accessor: 'thickness', title: 'Độ dày (mm)', sortable: true },
                                    { accessor: 'glueLayers', title: 'Số lớp keo', sortable: true },
                                    { accessor: 'glassLayers', title: 'Số tấm kính', sortable: true },
                                    { accessor: 'width', title: 'Rộng (mm)', sortable: true },
                                    { accessor: 'height', title: 'Cao (mm)', sortable: true },
                                    { accessor: 'glassThickness', title: 'Độ dày phôi kính', sortable: true },
                                    { accessor: 'butylType', title: 'Loại Butyl (mm)', sortable: true },
                                ]}
                                totalRecords={initialRecords.length}
                                recordsPerPage={pageSize}
                                page={page}
                                onPageChange={(p) => setPage(p)}
                                recordsPerPageOptions={PAGE_SIZES}
                                onRecordsPerPageChange={setPageSize}
                                sortStatus={sortStatus}
                                onSortStatusChange={setSortStatus}
                                minHeight={200}
                                paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                                onRowClick={(record) => setSelectedRecord(record)}
                            />
                        </div>

                        {/* Bảng chi tiết nguyên vật liệu */}
                        {selectedRecord && (
                            <div className="mt-6">
                                <div className="mb-4 text-lg font-semibold">Chi tiết nguyên vật liệu</div>
                                <div className="rounded-md border border-[#e0e6ed] p-4 dark:border-[#1b2e4b]">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div className="flex items-center">
                                            <span className="mb-0 w-1/2 ltr:mr-2 rtl:ml-2 font-semibold">
                                                Diện tích kính (m2):
                                            </span>
                                            <div className="flex-1 text-gray-600 dark:text-gray-400">
                                                {calculateMaterialDetails(selectedRecord).glassArea.toFixed(2)}
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="mb-0 w-1/2 ltr:mr-2 rtl:ml-2 font-semibold">
                                                Chu vi:
                                            </span>
                                            <div className="flex-1 text-gray-600 dark:text-gray-400">
                                                {calculateMaterialDetails(selectedRecord).perimeter.toFixed(2)} m
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="mb-0 w-1/2 ltr:mr-2 rtl:ml-2 font-semibold">
                                                Diện tích keo:
                                            </span>
                                            <div className="flex-1 text-gray-600 dark:text-gray-400">
                                                {calculateMaterialDetails(selectedRecord).glueArea.toFixed(2)} m2
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="mb-0 w-1/2 ltr:mr-2 rtl:ml-2 font-semibold">
                                                Lượng keo / lớp (kg):
                                            </span>
                                            <div className="flex-1 text-gray-600 dark:text-gray-400">
                                                {calculateMaterialDetails(selectedRecord).gluePerLayer.toFixed(2)}
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="mb-0 w-1/2 ltr:mr-2 rtl:ml-2 font-semibold">
                                                Tổng lượng keo:
                                            </span>
                                            <div className="flex-1 text-gray-600 dark:text-gray-400">
                                                {calculateMaterialDetails(selectedRecord).totalGlue.toFixed(2)} kg
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="mb-0 w-1/2 ltr:mr-2 rtl:ml-2 font-semibold">
                                                Chiều dài butyl (m):
                                            </span>
                                            <div className="flex-1 text-gray-600 dark:text-gray-400">
                                                {calculateMaterialDetails(selectedRecord).butylLength.toFixed(2)}
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="mb-0 w-1/2 ltr:mr-2 rtl:ml-2 font-semibold">
                                                TP A:
                                            </span>
                                            <div className="flex-1 text-gray-600 dark:text-gray-400">
                                                {calculateMaterialDetails(selectedRecord).tpa.toFixed(2)} kg
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="mb-0 w-1/2 ltr:mr-2 rtl:ml-2 font-semibold">
                                                KOH:
                                            </span>
                                            <div className="flex-1 text-gray-600 dark:text-gray-400">
                                                {calculateMaterialDetails(selectedRecord).koh.toFixed(2)} kg
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="mb-0 w-1/2 ltr:mr-2 rtl:ml-2 font-semibold">
                                                H2O:
                                            </span>
                                            <div className="flex-1 text-gray-600 dark:text-gray-400">
                                                {calculateMaterialDetails(selectedRecord).h2o.toFixed(2)} kg
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </div>
            
            {/* Production Orders List Panel - Always visible */}
            <div className="panel mt-6">
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
                        totalRecords={productionOrderInitialRecords.length}
                        recordsPerPage={productionOrderPageSize}
                        page={productionOrderPage}
                        onPageChange={(p) => setProductionOrderPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setProductionOrderPageSize}
                        sortStatus={productionOrderSortStatus}
                        onSortStatusChange={setProductionOrderSortStatus}
                        paginationText={({ from, to, totalRecords }) =>
                            `Hiển thị ${from} đến ${to} trong tổng số ${totalRecords} bản ghi`
                        }
                    />
                </div>
            </div>
        </div>


    );
};

export default ProductionPlanDetailAccountantComponent;
