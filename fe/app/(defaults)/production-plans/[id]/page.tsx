'use client';
import { DataTable } from 'mantine-datatable';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import Dropdown from '@/components/dropdown';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import IconSend from '@/components/icon/icon-send';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
    fetchProductionPlanDetail, fetchProductionPlanProductDetails,
    ProductionPlanDetail, ProductionPlanProductDetail, fetchProductionOrdersByPlanId,
    ProductionOrderListItem, fetchProductionPlanMaterialDetail, ProductionPlanMaterialDetail, ProductionPlanMaterialProduct
} from '../service';

const ProductionPlanDetailPage = () => {
    const { id } = useParams();
    const [detail, setDetail] = useState<ProductionPlanDetail | null>(null);
    const [productDetails, setProductDetails] = useState<ProductionPlanProductDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [productionOrders, setProductionOrders] = useState<ProductionOrderListItem[]>([]);

    // Dropdown & Modal states
    const [modal5, setModal5] = useState(false);
    const [selectedOrderType, setSelectedOrderType] = useState<string | null>(null);
    const [modalProductQuantities, setModalProductQuantities] = useState<{ [productId: number]: number }>({});
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass === 'rtl');

    // Use productDetails as productData for modal
    const productData = productDetails;

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

    // Remove hardcoded items - will use real data from API

    const columns = [
        {
            key: 'id',
            label: 'STT',
        },
        {
            key: 'productName',
            label: 'Tên sản phẩm',
        },
        {
            key: 'totalQuantity',
            label: 'Số lượng',
            class: 'ltr:text-right rtl:text-left',
        },
        {
            key: 'daCatKinh',
            label: 'Đã cắt kính',
            class: 'ltr:text-right rtl:text-left',
        },
        {
            key: 'daGhepKinh',
            label: 'Đã ghép kính',
            class: 'ltr:text-right rtl:text-left',
        },
        {
            key: 'daDoKeo',
            label: 'Đã đổ keo',
            class: 'ltr:text-right rtl:text-left',
        },
        {
            key: 'completed',
            label: 'Đã hoàn thành',
            class: 'ltr:text-right rtl:text-left',
        },
        {
            key: 'daGiao',
            label: 'Đã giao',
            class: 'ltr:text-right rtl:text-left',
        },
    ];

    const [tabs, setTabs] = useState<string>('plan');
    const toggleTabs = (tab: string) => setTabs(tab);
    const [materialDetail, setMaterialDetail] = useState<ProductionPlanMaterialDetail | null>(null);
    const [materialLoading, setMaterialLoading] = useState(false);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const [detailData, productData, ordersData] = await Promise.all([
                    fetchProductionPlanDetail(id as string),
                    fetchProductionPlanProductDetails(id as string),
                    fetchProductionOrdersByPlanId(id as string)
                ]);
                setDetail(detailData);
                setProductDetails(productData);
                setProductionOrders(ordersData);
            } catch (err) {
                console.error('Lỗi khi fetch dữ liệu production plan:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    useEffect(() => {
        if (tabs === 'plandetail' && id) {
            setMaterialLoading(true);
            fetchProductionPlanMaterialDetail(id as string)
                .then(setMaterialDetail)
                .finally(() => setMaterialLoading(false));
        }
    }, [tabs, id]);

    return (
        <div>
            <div className="panel">
                <div className="mb-5">
                    <ul className="flex flex-wrap -mb-px border-b border-[#e0e6ed] dark:border-[#191e3a]">
                        <li className="mr-2">
                            <button
                                type="button"
                                className={`inline-block p-4 text-sm font-medium rounded-t-lg border-b-2 ${tabs === 'plan' ? 'text-primary border-primary' : 'text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
                                onClick={() => toggleTabs('plan')}
                            >
                                Kế hoạch sản xuất
                            </button>
                        </li>
                        <li className="mr-2">
                            <button
                                type="button"
                                className={`inline-block p-4 text-sm font-medium rounded-t-lg border-b-2 ${tabs === 'plandetail' ? 'text-primary border-primary' : 'text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
                                onClick={() => toggleTabs('plandetail')}
                            >
                                Chi tiết vật tư
                            </button>
                        </li>
                    </ul>
                </div>
                {tabs === 'plan' && (
                    <div>
                        {/* Nội dung panel cũ: thông tin chung, bảng sản phẩm... */}
                        <div className="flex flex-wrap justify-between gap-4 px-4">
                            <div className="text-2xl font-semibold uppercase">Kế hoạch sản xuất</div>
                        </div>

                        <hr className="my-6 border-white-light dark:border-[#1b2e4b]" />
                        <div className="flex flex-col flex-wrap justify-between gap-6 lg:flex-row">
                            <div className="flex-1">
                                <div className="space-y-1 text-white-dark">
                                    <div>Sản xuất cho:</div>
                                    <div className="font-semibold text-black dark:text-white">{detail?.customerName || '-'}</div>
                                    <div>{detail?.address || '-'}</div>
                                    <div>{detail?.phone || '-'}</div>
                                </div>
                            </div>
                            <div className="flex flex-col justify-between gap-6 sm:flex-row lg:w-2/3">
                                <div className="xl:1/3 sm:w-1/2 lg:w-2/5">
                                    <div className="mb-2 flex w-full items-center justify-between">
                                        <div className="text-white-dark">Mã đơn hàng :</div>
                                        <div>{detail?.orderCode ? `#${detail.orderCode}` : '-'}</div>
                                    </div>
                                    <div className="mb-2 flex w-full items-center justify-between">
                                        <div className="text-white-dark">Ngày đặt hàng :</div>
                                        <div>{detail?.orderDate ? new Date(detail.orderDate).toLocaleDateString() : '-'}</div>
                                    </div>
                                    <div className="flex w-full items-center justify-between">
                                        <div className="text-white-dark">Tình trạng giao hàng :</div>
                                        <div>{detail?.deliveryStatus || '-'}</div>
                                    </div>
                                </div>
                                <div className="xl:1/3 sm:w-1/2 lg:w-2/5">
                                    <div className="mb-2 flex w-full items-center justify-between">
                                        <div className="text-white-dark">Ngày bắt đầu:</div>
                                        <div className="whitespace-nowrap">{detail?.planDate ? new Date(detail.planDate).toLocaleDateString() : '-'}</div>
                                    </div>
                                    <div className="mb-2 flex w-full items-center justify-between">
                                        <div className="text-white-dark">Trạng thái:</div>
                                        <div>{detail?.status || '-'}</div>
                                    </div>
                                    <div className="mb-2 flex w-full items-center justify-between">
                                        <div className="text-white-dark">Tổng sản phẩm:</div>
                                        <div>{detail?.quantity ?? '-'}</div>
                                    </div>
                                    <div className="mb-2 flex w-full items-center justify-between">
                                        <div className="text-white-dark">Đã hoàn thành:</div>
                                        <div>{detail?.done ?? '-'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="table-responsive mt-6">
                            <table className="table-striped">
                                <thead>
                                    <tr>
                                        {columns.map((column) => {
                                            return (
                                                <th key={column.key} className={column?.class}>
                                                    {column.label}
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={columns.length} className="text-center py-4">
                                                Đang tải dữ liệu...
                                            </td>
                                        </tr>
                                    ) : productDetails.length === 0 ? (
                                        <tr>
                                            <td colSpan={columns.length} className="text-center py-4">
                                                Không có dữ liệu sản phẩm
                                            </td>
                                        </tr>
                                    ) : (
                                        productDetails.map((item) => {
                                            return (
                                                <tr key={item.id}>
                                                    <td>{item.id}</td>
                                                    <td>{item.productName}</td>
                                                    <td className="ltr:text-right rtl:text-left">{item.totalQuantity}</td>
                                                    <td className="ltr:text-right rtl:text-left">{item.daCatKinh}</td>
                                                    <td className="ltr:text-right rtl:text-left">{item.daGhepKinh}</td>
                                                    <td className="ltr:text-right rtl:text-left">{item.daDoKeo}</td>
                                                    <td className="ltr:text-right rtl:text-left">{item.completed}</td>
                                                    <td className="ltr:text-right rtl:text-left">{item.daGiao}</td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {tabs === 'plandetail' && (
                    <div>
                        {materialLoading ? (
                            <div>Đang tải dữ liệu vật tư...</div>
                        ) : (
                            <>
                                <div className="flex flex-col flex-wrap justify-between gap-6 lg:flex-row">
                                    <div className="flex flex-col justify-between gap-6 sm:flex-row lg:w-2/3">
                                        <div className="xl:1/3 sm:w-1/2 lg:w-2/5">
                                            <div className="mb-2 flex w-full items-center justify-between">
                                                <div className="text-white-dark">Tổng keo nano :</div>
                                                <div>{materialDetail?.totalKeoNano ?? '-'} kg</div>
                                            </div>
                                        </div>
                                        <div className="xl:1/3 sm:w-1/2 lg:w-2/5">
                                            <div className="mb-2 flex w-full items-center justify-between">
                                                <div className="text-white-dark">Tổng keo mềm:</div>
                                                <div className="whitespace-nowrap">{materialDetail?.totalKeoMem ?? '-'} kg</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="datatables mt-8">
                                    <DataTable
                                        highlightOnHover
                                        className="table-hover whitespace-nowrap"
                                        records={materialDetail?.products ?? []}
                                        columns={[
                                            { accessor: 'id', title: 'STT' },
                                            { accessor: 'productName', title: 'Tên sản phẩm', render: (record: ProductionPlanMaterialProduct) => `${record.productName}` },
                                            { accessor: 'quantity', title: 'Số lượng' },
                                            { accessor: 'thickness', title: 'Dày' },
                                            { accessor: 'glueLayers', title: 'Lớp keo' },
                                            { accessor: 'glassLayers', title: 'Số kính' },
                                            { accessor: 'glass4mm', title: 'Kính 4' },
                                            { accessor: 'glass5mm', title: 'Kính 5' },
                                            { accessor: 'butylType', title: 'Loại butyl' },
                                            { accessor: 'totalGlue', title: 'Tổng keo(kg)', render: (record: ProductionPlanMaterialProduct) => record.totalGlue?.toFixed(2) },
                                            { accessor: 'butylLength', title: 'Tổng butyl (m)', render: (record: ProductionPlanMaterialProduct) => record.butylLength?.toFixed(2) },
                                            { accessor: 'isCuongLuc', title: 'CL', render: (record: ProductionPlanMaterialProduct) => (<input type="checkbox" checked={record.isCuongLuc} disabled className="form-checkbox" />) },
                                        ]}
                                        totalRecords={materialDetail?.products?.length ?? 0}
                                        recordsPerPage={10}
                                        page={1}
                                        onPageChange={() => { }}
                                        recordsPerPageOptions={[10, 20, 50]}
                                        onRecordsPerPageChange={() => { }}
                                        minHeight={200}
                                        paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

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
                                    <button type="button" onClick={() => handleDropdownSelect('Đổ keo')}>
                                        Đổ keo
                                    </button>
                                </li>
                            </ul>
                        </Dropdown>
                    </div>
                </div>

                <div className="mb-4">
                    <h3 className="text-lg font-semibold">Lệnh sản xuất</h3>
                </div>
                <div className="table-responsive">
                    <table className="table-striped">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Ngày lên lệnh SX</th>
                                <th>Loại</th>
                                <th>Mô tả</th>
                                <th>Đã xuất kho NVL</th>
                                <th>Đã nhập kho TP</th>
                                <th>Xem chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productionOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-4">
                                        Không có dữ liệu lệnh sản xuất
                                    </td>
                                </tr>
                            ) : (
                                productionOrders.map((item, idx) => (
                                    <tr key={item.id}>
                                        <td>{idx + 1}</td>
                                        <td>{item.orderDate ? new Date(item.orderDate).toLocaleDateString() : '-'}</td>
                                        <td>{item.type}</td>
                                        <td>{item.description}</td>
                                        <td>
                                            <input type="checkbox" checked={item.isMaterialExported} disabled className="form-checkbox" />
                                        </td>
                                        <td>
                                            <input type="checkbox" checked={item.isProductImported} disabled className="form-checkbox" />
                                        </td>
                                        <td>
                                            <Link href={`/production-orders/${item.id}`} className="btn btn-sm btn-outline-primary">
                                                Xem chi tiết
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
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
                                                                <td>{product.productName}</td>
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
        </div>
    );
};

export default ProductionPlanDetailPage;
