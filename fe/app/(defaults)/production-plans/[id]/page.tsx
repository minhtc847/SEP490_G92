'use client';
import IconEdit from '@/components/icon/icon-edit';
import IconPlus from '@/components/icon/icon-plus';
import IconPrinter from '@/components/icon/icon-printer';
import IconSend from '@/components/icon/icon-send';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchProductionPlanDetail, fetchProductionPlanProductDetails, 
    ProductionPlanDetail, ProductionPlanProductDetail, fetchProductionOrdersByPlanId, 
    ProductionOrderListItem } from '../service';

const ProductionPlanDetailPage = () => {
    const { id } = useParams();
    const [detail, setDetail] = useState<ProductionPlanDetail | null>(null);
    const [productDetails, setProductDetails] = useState<ProductionPlanProductDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [productionOrders, setProductionOrders] = useState<ProductionOrderListItem[]>([]);

    const exportTable = () => {
        window.print();
    };

    // Remove hardcoded items - will use real data from API

    const columns = [
        {
            key: 'id',
            label: 'Số thứ tự',
        },
        {
            key: 'productName',
            label: 'Tên sản phẩm',
        },
        {
            key: 'totalQuantity',
            label: 'Tổng số lượng',
            class: 'ltr:text-right rtl:text-left',
        },
        {
            key: 'inProduction',
            label: 'Đang sản xuất',
            class: 'ltr:text-right rtl:text-left',
        },
        {
            key: 'completed',
            label: 'Đã hoàn thành',
            class: 'ltr:text-right rtl:text-left',
        },
        {
            key: 'daCatKinh',
            label: 'Đã cắt kính',
            class: 'ltr:text-right rtl:text-left',
        },
        {
            key: 'daTronKeo',
            label: 'Đã trộn keo',
            class: 'ltr:text-right rtl:text-left',
        },
    ];

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

    return (
        <div>
            <div className="mb-6 flex flex-wrap items-center justify-center gap-4 lg:justify-end">
                <button type="button" className="btn btn-primary gap-2">
                    <IconSend />
                    Lên lệnh sản xuất
                </button>


            </div>
            <div className="panel">
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
                                            <td className="ltr:text-right rtl:text-left">{item.inProduction}</td>
                                            <td className="ltr:text-right rtl:text-left">{item.completed}</td>
                                            <td className="ltr:text-right rtl:text-left">{item.daCatKinh}</td>
                                            <td className="ltr:text-right rtl:text-left">{item.daTronKeo}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="panel mt-6">
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
            </div>
        </div>
    );
};

export default ProductionPlanDetailPage;
