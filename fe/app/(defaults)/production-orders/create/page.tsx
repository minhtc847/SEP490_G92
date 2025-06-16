'use client';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import sortBy from 'lodash/sortBy';
import IconFile from '@/components/icon/icon-file';
import IconPrinter from '@/components/icon/icon-printer';
import Swal from 'sweetalert2';


interface OrderInfo {
    customerName: string;
    orderCode: string;
}

interface MaterialDetails {
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

const rowData = [
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

const ComponentsDatatablesExport = () => {
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState(sortBy(rowData, 'id'));
    const [recordsData, setRecordsData] = useState(initialRecords);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);

    const [orderInfo] = useState<OrderInfo>({
        customerName: 'Anh Huy Adamco',
        orderCode: 'ĐH00003',
    });

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    // Tính toán chi tiết nguyên vật liệu
    const calculateMaterialDetails = (record: any): MaterialDetails => {
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
            rowData.map((item: any) => {
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
            rowData.map((item: any) => {
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
    };

    return (
        <div>
            <div className="mb-5">
                <h1 className="text-2xl font-bold">Tạo lệnh sản xuất</h1>
            </div>
            <div className="panel mt-6">
                <div className="mb-4.5 flex flex-col justify-between gap-5 md:flex-row md:items-center">
                    <div className="flex flex-wrap items-center">
                        <button type="button" onClick={() => exportTable('excel')} className="btn btn-primary btn-sm m-1 ">
                            <IconFile className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                            Excel
                        </button>
                        <button type="button" onClick={() => exportTable('print')} className="btn btn-primary btn-sm m-1">
                            <IconPrinter className="ltr:mr-2 rtl:ml-2" />
                            PRINT
                        </button>
                    </div>
                </div>

                <div className="mb-6 rounded-md border border-[#e0e6ed] p-4 dark:border-[#1b2e4b]">
                    <div className="text-lg font-semibold">Thông tin đơn hàng</div>
                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="flex items-center">
                            <span className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2 font-semibold">
                                Tên khách hàng:
                            </span>
                            <div className="flex-1 text-gray-600 dark:text-gray-400">
                                {orderInfo.customerName}
                            </div>
                        </div>
                        <div className="flex items-center">
                            <span className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2 font-semibold">
                                Mã đơn hàng:
                            </span>
                            <div className="flex-1 text-gray-600 dark:text-gray-400">
                                {orderInfo.orderCode}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Thêm phần ghi chú */}
                <div className="mb-5 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-base font-semibold mb-2">Ghi chú:</div>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                        <li>Kích thước kính được tính theo đơn vị mm</li>
                        <li>Độ dày kính và butyl được tính theo đơn vị mm</li>
                        <li>Số lượng keo được tính theo đơn vị kg</li>
                        <li>Diện tích được tính theo đơn vị m²</li>
                    </ul>
                </div>

                <div className="datatables">
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

                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        onClick={handleCreateOrder}
                        className="btn btn-primary"
                    >
                        Tạo lệnh sản xuất
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ComponentsDatatablesExport;