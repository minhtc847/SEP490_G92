'use client';
import { DataTable } from 'mantine-datatable';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import Dropdown from '@/components/dropdown';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import IconSend from '@/components/icon/icon-send';
import IconEye from '@/components/icon/icon-eye';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
    fetchProductionPlanDetail, fetchProductionPlanProductDetails,
    ProductionPlanDetail, ProductionPlanProductDetail, fetchProductionOrdersByPlanId,
    ProductionOrderListItem, fetchProductionPlanMaterialDetail, ProductionPlanMaterialDetail, ProductionPlanMaterialProduct,
    createCutGlassOrder, CutGlassOrderData, createGlueGlassOrder, GlueGlassOrderData,
    createPourGlueOrder, PourGlueOrderData
} from '../service';
import CutGlassModal from '@/components/VNG/manager/production-orders/modals/CutGlassModal';
import GlueGlassModal from '@/components/VNG/manager/production-orders/modals/GlueGlassModal';
import PourGlueModal from '@/components/VNG/manager/production-orders/modals/PourGlueModal';
import ListOutputsPP from '@/components/VNG/manager/production-plans/list-outputs-of-pp/list-outputs-pp-components';

const ProductionPlanDetailPage = () => {
    const { id } = useParams();
    const [detail, setDetail] = useState<ProductionPlanDetail | null>(null);
    const [productDetails, setProductDetails] = useState<ProductionPlanProductDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [productionOrders, setProductionOrders] = useState<ProductionOrderListItem[]>([]);

    // Modal states
    const [cutGlassModalOpen, setCutGlassModalOpen] = useState(false);
    const [glueGlassModalOpen, setGlueGlassModalOpen] = useState(false);
    const [pourGlueModalOpen, setPourGlueModalOpen] = useState(false);
    const [materialDetail, setMaterialDetail] = useState<ProductionPlanMaterialDetail | null>(null);
    

    
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass === 'rtl');

    // Use productDetails as productData for modal
    const productData = productDetails;

    // Handler for dropdown selection
    const handleDropdownSelect = (type: string) => {
        switch (type) {
            case 'Cắt kính':
                setCutGlassModalOpen(true);
                break;
            case 'Ghép kính':
                setGlueGlassModalOpen(true);
                break;
            case 'Đổ keo':
                setPourGlueModalOpen(true);
                break;
        }
    };

    // Handler for saving cut glass order
    const handleSaveCutGlassOrder = async (data: CutGlassOrderData) => {
        try {
            // Prepare data for API
            const orderData = {
                productionPlanId: Number(id),
                productQuantities: data.productQuantities,
                finishedProducts: data.finishedProducts
            };

            const result = await createCutGlassOrder(orderData);
            
            if (result) {
                // Refresh production orders list
                const ordersData = await fetchProductionOrdersByPlanId(id as string);
                setProductionOrders(ordersData);
                
                // Close modal
                setCutGlassModalOpen(false);
                
                // Show success message (you can use a toast notification here)
                alert('Lệnh cắt kính đã được tạo thành công!');
            } else {
                alert('Có lỗi xảy ra khi tạo lệnh cắt kính!');
            }
        } catch (error) {
            console.error('Error creating cut glass order:', error);
            alert('Có lỗi xảy ra khi tạo lệnh cắt kính!');
        }
    };

    // Handler for saving glue glass order
    const handleSaveGlueGlassOrder = async (data: GlueGlassOrderData) => {
        try {
            // Prepare data for API
            const orderData = {
                productionPlanId: Number(id),
                productQuantities: data.productQuantities,
                finishedProducts: data.finishedProducts
            };

            const result = await createGlueGlassOrder(orderData);
            
            if (result) {
                // Refresh production orders list
                const ordersData = await fetchProductionOrdersByPlanId(id as string);
                setProductionOrders(ordersData);
                
                // Close modal
                setGlueGlassModalOpen(false);
                
                // Show success message (you can use a toast notification here)
                alert('Lệnh ghép kính đã được tạo thành công!');
            } else {
                alert('Có lỗi xảy ra khi tạo lệnh ghép kính!');
            }
        } catch (error) {
            console.error('Error creating glue glass order:', error);
            alert('Có lỗi xảy ra khi tạo lệnh ghép kính!');
        }
    };

    // Handler for saving pour glue order
    const handleSavePourGlueOrder = async (data: PourGlueOrderData) => {
        try {
            // Prepare data for API
            const orderData = {
                productionPlanId: Number(id),
                productQuantities: data.productQuantities,
                finishedProducts: data.finishedProducts
            };

            const result = await createPourGlueOrder(orderData);
            
            if (result) {
                // Refresh production orders list
                const ordersData = await fetchProductionOrdersByPlanId(id as string);
                setProductionOrders(ordersData);
                
                // Close modal
                setPourGlueModalOpen(false);
                
                // Show success message (you can use a toast notification here)
                alert('Lệnh sản xuất keo và lệnh đổ keo đã được tạo thành công!');
            } else {
                alert('Có lỗi xảy ra khi tạo lệnh sản xuất!');
            }
        } catch (error) {
            console.error('Error creating pour glue order:', error);
            alert('Có lỗi xảy ra khi tạo lệnh sản xuất!');
        }
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
    const [materialLoading, setMaterialLoading] = useState(false);

    const statusBadgeMap: Record<string, string> = {
        'Đang sản xuất': 'badge-outline-warning',
        'Đã hoàn thành': 'badge-outline-success',
        'Đã hủy': 'badge-outline-danger',
    };


    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const [detailData, productData, ordersData, materialData] = await Promise.all([
                    fetchProductionPlanDetail(id as string),
                    fetchProductionPlanProductDetails(id as string),
                    fetchProductionOrdersByPlanId(id as string),
                    fetchProductionPlanMaterialDetail(id as string)
                ]);
                setDetail(detailData);
                setProductDetails(productData);
                setProductionOrders(ordersData);
                setMaterialDetail(materialData);
            } catch (err) {
                console.error('Lỗi khi fetch dữ liệu production plan:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    useEffect(() => {
        if (tabs === 'plandetail' && id && !materialDetail) {
            setMaterialLoading(true);
            fetchProductionPlanMaterialDetail(id as string)
                .then(setMaterialDetail)
                .finally(() => setMaterialLoading(false));
        }
    }, [tabs, id, materialDetail]);

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
                        <li className="mr-2">
                            <button
                                type="button"
                                className={`inline-block p-4 text-sm font-medium rounded-t-lg border-b-2 ${tabs === 'outputs' ? 'text-primary border-primary' : 'text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
                                onClick={() => toggleTabs('outputs')}
                            >
                                Trạng thái sản xuất
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
                {tabs === 'outputs' && (
                    <div>
                        <ListOutputsPP productionPlanId={Number(id)} />
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
                                <th style={{ minWidth: '120px' }}>Trạng thái</th>
                                <th>Xem chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productionOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-4">
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

                {/* Cut Glass Modal */}
                <CutGlassModal
                    isOpen={cutGlassModalOpen}
                    onClose={() => setCutGlassModalOpen(false)}
                    products={productData}
                    materialProducts={materialDetail?.products ?? []}
                    productionPlanId={Number(id)}
                    onSave={handleSaveCutGlassOrder}
                />

                {/* Glue Glass Modal */}
                <GlueGlassModal
                    isOpen={glueGlassModalOpen}
                    onClose={() => setGlueGlassModalOpen(false)}
                    products={productData}
                    materialProducts={materialDetail?.products ?? []}
                    productionPlanId={Number(id)}
                    onSave={handleSaveGlueGlassOrder}
                />

                {/* Pour Glue Modal */}
                <PourGlueModal
                    isOpen={pourGlueModalOpen}
                    onClose={() => setPourGlueModalOpen(false)}
                    products={productData}
                    productionPlanId={Number(id)}
                    onSave={handleSavePourGlueOrder}
                />
            </div>
        </div>
    );
};

export default ProductionPlanDetailPage;
