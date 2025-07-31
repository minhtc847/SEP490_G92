'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import IconDownload from '@/components/icon/icon-download';
import IconEye from '@/components/icon/icon-eye';
import IconSave from '@/components/icon/icon-save';
import IconSend from '@/components/icon/icon-send';
import IconX from '@/components/icon/icon-x';
import { getSalesOrdersForDelivery, getSalesOrderDetail, SalesOrderOption, SalesOrderDetail } from '@/app/(defaults)/delivery/service';

const AddDeliveryComponent = () => {
    const router = useRouter();
    const statusList = ['NotDelivered', 'Delivering', 'FullyDelivered', 'Cancelled'];
    
    // State for sales orders
    const [salesOrders, setSalesOrders] = useState<SalesOrderOption[]>([]);
    const [selectedOrderId, setSelectedOrderId] = useState<string>('');
    const [selectedOrderDetail, setSelectedOrderDetail] = useState<SalesOrderDetail | null>(null);
    const [loadingOrder, setLoadingOrder] = useState(false);

    interface DeliveryItem {
        id: number;
        productId: string | number;
        productName: string;
        quantity: number;
        unitPrice: number;
        amount: number;
    }

    // State for delivery items
    const [items, setItems] = useState<DeliveryItem[]>([
        {
            id: 1,
            productId: '',
            productName: '',
            quantity: 0,
            unitPrice: 0,
            amount: 0,
        },
    ]);

    // Load sales orders on component mount
    useEffect(() => {
        const loadSalesOrders = async () => {
            try {
                const data = await getSalesOrdersForDelivery();
                setSalesOrders(data);
            } catch (error) {
                console.error('Lỗi khi tải danh sách đơn hàng:', error);
            }
        };
        loadSalesOrders();
    }, []);

    // Load order detail when order is selected
    const handleOrderChange = async (orderId: string) => {
        setSelectedOrderId(orderId);
        if (!orderId) {
            setSelectedOrderDetail(null);
            return;
        }

        setLoadingOrder(true);
        try {
            const detail = await getSalesOrderDetail(parseInt(orderId));
            setSelectedOrderDetail(detail);
            
            // Initialize items with products from the order
            const initialItems = detail.products.map((product, index) => ({
                id: index + 1,
                productId: product.id,
                productName: product.productName,
                quantity: product.quantity,
                unitPrice: product.unitPrice,
                amount: product.quantity * product.unitPrice,
            }));
            setItems(initialItems);
        } catch (error) {
            console.error('Lỗi khi tải chi tiết đơn hàng:', error);
        } finally {
            setLoadingOrder(false);
        }
    };

    const addItem = () => {
        let maxId = 0;
        maxId = items?.length ? items.reduce((max: number, character: any) => (character.id > max ? character.id : max), items[0].id) : 0;

        setItems([
            ...items,
            {
                id: maxId + 1,
                productId: '',
                productName: '',

                quantity: 0,
                unitPrice: 0,
                amount: 0,
            },
        ]);
    };

    const removeItem = (item: DeliveryItem) => {
        setItems(items.filter((d: DeliveryItem) => d.id !== item.id));
    };

    const handleProductChange = (itemId: number, productId: string) => {
        if (!selectedOrderDetail) return;

        const product = selectedOrderDetail.products.find(p => p.id === parseInt(productId));
        if (!product) return;

        setItems(items.map(item => 
            item.id === itemId 
                ? {
                    ...item,
                    productId: product.id,
                    productName: product.productName,
                    unitPrice: product.unitPrice,
                    amount: item.quantity * product.unitPrice,
                }
                : item
        ));
    };

    const handleQuantityChange = (itemId: number, quantity: number) => {
        setItems(items.map(item => 
            item.id === itemId 
                ? {
                    ...item,
                    quantity: quantity,
                    amount: quantity * item.unitPrice,
                }
                : item
        ));
    };

    const totalAmount = items.reduce((sum: number, item: DeliveryItem) => sum + item.amount, 0);

    return (
        <div className="flex flex-col gap-2.5 xl:flex-row">
            <div className="panel flex-1 px-0 py-6 ltr:xl:mr-6 rtl:xl:ml-6">
                <div className="flex flex-wrap justify-between px-4">
                    <div className="mb-6 w-full lg:w-1/2">
                        <div className="flex shrink-0 items-center text-black dark:text-white">
                            <img src="/assets/images/logo.svg" alt="img" className="w-14" />
                        </div>
                        <div className="mt-6 space-y-1 text-gray-500 dark:text-gray-400">
                            <div>{selectedOrderDetail?.customer.customerName}</div>
                            <div>{selectedOrderDetail?.customer.address}</div>
                            <div>{selectedOrderDetail?.customer.phone}</div>
                        </div>
                    </div>
                    <div className="w-full lg:w-1/2 lg:max-w-fit">
                        <div className="mt-4 flex items-center">
                            <label htmlFor="orderSelect" className="mb-0 flex-1 ltr:mr-2 rtl:ml-2">
                                Chọn đơn hàng
                            </label>
                            <select 
                                id="orderSelect" 
                                value={selectedOrderId}
                                onChange={(e) => handleOrderChange(e.target.value)}
                                className="form-select w-2/3 lg:w-[250px]"
                            >
                                <option value="">-- Chọn đơn hàng --</option>
                                {salesOrders.map((order) => (
                                    <option key={order.id} value={order.id}>
                                        {order.orderCode} - {order.customerName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mt-4 flex items-center">
                            <label htmlFor="startDate" className="mb-0 flex-1 ltr:mr-2 rtl:ml-2">
                                Ngày xuất kho
                            </label>
                            <input id="exportDate" type="date" name="inv-date" className="form-input w-2/3 lg:w-[250px]" />
                        </div>

                        <div className="mt-4 flex items-center">
                            <label htmlFor="startDate" className="mb-0 flex-1 ltr:mr-2 rtl:ml-2">
                                Ngày giao hàng
                            </label>
                            <input id="deliveryDate" type="date" name="inv-date" className="form-input w-2/3 lg:w-[250px]" />
                        </div>
                        <div className="mt-4 flex items-center">
                            <label htmlFor="status" className="mb-0 flex-1 ltr:mr-2 rtl:ml-2">
                                Trạng thái
                            </label>
                            <select id="status" name="status" className="form-select w-2/3 lg:w-[250px]">
                                {statusList.map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

               
                <hr className="my-6 border-white-light dark:border-[#1b2e4b]" />

                <div className="mt-8">
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Sản phẩm</th>
                                    <th className="w-1">Số lượng</th>
                                    <th className="w-1">Đơn giá</th>
                                    <th className="w-1">Thành tiền</th>
                                    <th className="w-1"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingOrder && (
                                    <tr>
                                        <td colSpan={5} className="!text-center font-semibold">
                                            Đang tải sản phẩm...
                                        </td>
                                    </tr>
                                )}
                                {!loadingOrder && items.length <= 0 && (
                                    <tr>
                                        <td colSpan={5} className="!text-center font-semibold">
                                            Không có sản phẩm nào
                                        </td>
                                    </tr>
                                )}
                                {!loadingOrder && items.map((item: DeliveryItem) => {
                                    return (
                                        <tr className="align-top" key={item.id}>
                                            <td>
                                                <select
                                                    value={item.productId}
                                                    onChange={(e) => handleProductChange(item.id, e.target.value)}
                                                    className="form-select min-w-[200px]"
                                                    disabled={!selectedOrderDetail}
                                                >
                                                    <option value="">-- Chọn sản phẩm --</option>
                                                    {selectedOrderDetail?.products.map((product) => (
                                                        <option key={product.id} value={product.id}>
                                                            {product.productName} 
                                                        </option>
                                                    ))}
                                                </select>
                                                
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="form-input w-32"
                                                    placeholder="Số lượng"
                                                    value={item.quantity}
                                                    min={0}
                                                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                                                />
                                            </td>
                                            <td>
                                                <div className="form-input w-32 bg-gray-100">
                                                    {item.unitPrice.toLocaleString()}₫
                                                </div>
                                            </td>
                                            <td>
                                                <div className="form-input w-32 bg-gray-100">
                                                    {item.amount.toLocaleString()}₫
                                                </div>
                                            </td>
                                            <td>
                                                <button type="button" onClick={() => removeItem(item)}>
                                                    <IconX className="h-5 w-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-6 flex flex-col justify-between px-4 sm:flex-row">
                        <div className="mb-6 sm:mb-0">
                            <button type="button" className="btn btn-primary" onClick={() => addItem()}>
                                Thêm sản phẩm
                            </button>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-semibold">
                                Tổng tiền: {totalAmount.toLocaleString()}₫
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-8 px-4">
                    <label htmlFor="notes">Ghi chú</label>
                    <textarea id="notes" name="notes" className="form-textarea min-h-[130px]" placeholder="Ghi chú...."></textarea>
                </div>
            </div>
            <div className="mt-6 w-full xl:mt-0 xl:w-96">
                <div className="panel">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-1">
                        <button type="button" className="btn btn-success w-full gap-2">
                            <IconSave className="shrink-0 ltr:mr-2 rtl:ml-2" />
                           Tạo
                        </button>

                        <button type="button" className="btn btn-info w-full gap-2">
                            <IconSend className="shrink-0 ltr:mr-2 rtl:ml-2" />
                            Gửi
                        </button>

                        <button type="button" className="btn btn-primary w-full gap-2">
                            <IconEye className="shrink-0 ltr:mr-2 rtl:ml-2" />
                            Xem trước
                        </button>

                        <button type="button" className="btn btn-secondary w-full gap-2">
                            <IconDownload className="shrink-0 ltr:mr-2 rtl:ml-2" />
                            Tải xuống
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddDeliveryComponent;
