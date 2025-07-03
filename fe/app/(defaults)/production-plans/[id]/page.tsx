'use client';
import IconEdit from '@/components/icon/icon-edit';
import IconPlus from '@/components/icon/icon-plus';
import IconPrinter from '@/components/icon/icon-printer';
import IconSend from '@/components/icon/icon-send';
import Link from 'next/link';
import React from 'react';

const ProductionPlanDetailPage = () => {
    const exportTable = () => {
        window.print();
    };

    const items = [
        {
            id: 1,
            productName: 'Kính cường lực 8mm',
            totalQuantity: 100,
            inProduction: 30,
            completed: 20,
            daCatKinh: 80,
            daDanKinh: 60,
            daTronKeo: 40,
            daDoKeo: 20,
        },
        {
            id: 2,
            productName: 'Kính cường lực 10mm',
            totalQuantity: 150,
            inProduction: 50,
            completed: 80,
            daCatKinh: 150,
            daDanKinh: 120,
            daTronKeo: 100,
            daDoKeo: 80,
        },
        {
            id: 3,
            productName: 'Kính cường lực 12mm',
            totalQuantity: 80,
            inProduction: 25,
            completed: 45,
            daCatKinh: 80,
            daDanKinh: 60,
            daTronKeo: 40,
            daDoKeo: 20,
        },
        {
            id: 4,
            productName: 'Kính cường lực 6mm',
            totalQuantity: 200,
            inProduction: 100,
            completed: 150,
            daCatKinh: 200,
            daDanKinh: 180,
            daTronKeo: 160,
            daDoKeo: 150,
        },
    ];

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
            key: 'daDanKinh',
            label: 'Đã dán kính',
            class: 'ltr:text-right rtl:text-left',
        },
        {
            key: 'daTronKeo',
            label: 'Đã trộn keo',
            class: 'ltr:text-right rtl:text-left',
        },
        {
            key: 'daDoKeo',
            label: 'Đã đổ keo',
            class: 'ltr:text-right rtl:text-left',
        },
    ];

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
                            <div className="font-semibold text-black dark:text-white">Công ty TNHH ABC</div>
                            <div>405 Mulberry Rd. Mc Grady, NC, 28649</div>
                            <div>abc@company.com</div>
                            <div>(128) 666 070</div>
                        </div>
                    </div>
                    <div className="flex flex-col justify-between gap-6 sm:flex-row lg:w-2/3">
                        <div className="xl:1/3 sm:w-1/2 lg:w-2/5">
                            <div className="mb-2 flex w-full items-center justify-between">
                                <div className="text-white-dark">Mã đơn hàng :</div>
                                <div>#PP001</div>
                            </div>
                            <div className="mb-2 flex w-full items-center justify-between">
                                <div className="text-white-dark">Ngày đặt hàng :</div>
                                <div>15 Dec 2024</div>
                            </div>

                            <div className="flex w-full items-center justify-between">
                                <div className="text-white-dark">Tình trạng giao hàng :</div>
                                <div>Đang giao</div>
                            </div>
                        </div>
                        <div className="xl:1/3 sm:w-1/2 lg:w-2/5">
                            <div className="mb-2 flex w-full items-center justify-between">
                                <div className="text-white-dark">Ngày bắt đầu:</div>
                                <div className="whitespace-nowrap">16 Dec 2024</div>
                            </div>

                            <div className="mb-2 flex w-full items-center justify-between">
                                <div className="text-white-dark">Trạng thái:</div>
                                <div>Đang sản xuất</div>
                            </div>
                            <div className="mb-2 flex w-full items-center justify-between">
                                <div className="text-white-dark">Tổng sản phẩm:</div>
                                <div>530</div>
                            </div>
                            <div className="mb-2 flex w-full items-center justify-between">
                                <div className="text-white-dark">Đã hoàn thành:</div>
                                <div>295</div>
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
                            {items.map((item) => {
                                return (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                        <td>{item.productName}</td>
                                        <td className="ltr:text-right rtl:text-left">{item.totalQuantity}</td>
                                        <td className="ltr:text-right rtl:text-left">{item.inProduction}</td>
                                        <td className="ltr:text-right rtl:text-left">{item.completed}</td>
                                        <td className="ltr:text-right rtl:text-left">{item.daCatKinh}</td>
                                        <td className="ltr:text-right rtl:text-left">{item.daDanKinh}</td>
                                        <td className="ltr:text-right rtl:text-left">{item.daTronKeo}</td>
                                        <td className="ltr:text-right rtl:text-left">{item.daDoKeo}</td>
                                    </tr>
                                );
                            })}
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
                                <th>Loại lệnh sản xuất</th>
                                <th>Sản xuất cho</th>
                                <th>Số lượng</th>
                                <th>Đã xuất kho NVL</th>
                                <th>Đã nhập kho thành phẩm</th>
                                <th>Xem chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>Lệnh sản xuất thường</td>
                                <td>Kính cường lực 8mm</td>
                                <td>100</td>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={true}
                                        disabled
                                        className="form-checkbox"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={false}
                                        disabled
                                        className="form-checkbox"
                                    />
                                </td>
                                <td>
                                    <Link href="/production-orders/1" className="btn btn-sm btn-outline-primary">
                                        Xem chi tiết
                                    </Link>
                                </td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>Lệnh sản xuất gấp</td>
                                <td>Kính cường lực 10mm</td>
                                <td>150</td>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={true}
                                        disabled
                                        className="form-checkbox"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={true}
                                        disabled
                                        className="form-checkbox"
                                    />
                                </td>
                                <td>
                                    <Link href="/production-orders/2" className="btn btn-sm btn-outline-primary">
                                        Xem chi tiết
                                    </Link>
                                </td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>Lệnh sản xuất thường</td>
                                <td>Kính cường lực 12mm</td>
                                <td>80</td>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={false}
                                        disabled
                                        className="form-checkbox"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={false}
                                        disabled
                                        className="form-checkbox"
                                    />
                                </td>
                                <td>
                                    <Link href="/production-orders/3" className="btn btn-sm btn-outline-primary">
                                        Xem chi tiết
                                    </Link>
                                </td>
                            </tr>
                            <tr>
                                <td>4</td>
                                <td>Lệnh sản xuất gấp</td>
                                <td>Kính cường lực 6mm</td>
                                <td>200</td>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={true}
                                        disabled
                                        className="form-checkbox"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={false}
                                        disabled
                                        className="form-checkbox"
                                    />
                                </td>
                                <td>
                                    <Link href="/production-orders/4" className="btn btn-sm btn-outline-primary">
                                        Xem chi tiết
                                    </Link>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductionPlanDetailPage;
