'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import IconDownload from '@/components/icon/icon-download';
import IconEye from '@/components/icon/icon-eye';
import IconSave from '@/components/icon/icon-save';
import IconSend from '@/components/icon/icon-send';
import IconX from '@/components/icon/icon-x';
import { getSalesOrdersForDelivery, getSalesOrderDetail, getProductionPlanValidation, createDelivery, SalesOrderOption, SalesOrderDetail, CreateDeliveryDto, DeliveryValidationItem } from '@/app/(defaults)/delivery/service';

const AddDeliveryComponent = () => {
    const router = useRouter();
    // Chỉ cho phép 2 trạng thái: NotDelivered và Delivering
    const statusList = ['NotDelivered', 'Delivering'];
    
    // State for sales orders
    const [salesOrders, setSalesOrders] = useState<SalesOrderOption[]>([]);
    const [selectedOrderId, setSelectedOrderId] = useState<string>('');
    const [selectedOrderDetail, setSelectedOrderDetail] = useState<SalesOrderDetail | null>(null);
    const [loadingOrder, setLoadingOrder] = useState(false);
    const [productionPlanValidation, setProductionPlanValidation] = useState<DeliveryValidationItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deliveryDate, setDeliveryDate] = useState<string>('');
    const [exportDate, setExportDate] = useState<string>('');
    const [status, setStatus] = useState<string>('NotDelivered');
    const [note, setNote] = useState<string>('');
    
    // Error state for date validation
    const [dateError, setDateError] = useState<string>('');

    interface DeliveryItem {
        id: number;
        productId: string | number;
        productName: string;
        quantity: number;
        unitPrice: number;
        amount: number;
    }

    // State for delivery items
    const [items, setItems] = useState<DeliveryItem[]>([]);

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
            setProductionPlanValidation([]);
            setItems([]);
            return;
        }

        setLoadingOrder(true);
        try {
            const [detail, validation] = await Promise.all([
                getSalesOrderDetail(parseInt(orderId)),
                getProductionPlanValidation(parseInt(orderId))
            ]);
            
            setSelectedOrderDetail(detail);
            setProductionPlanValidation(validation);
            
            // Không tự động thêm sản phẩm, để người dùng chọn
            setItems([]);
        } catch (error) {
            console.error('Lỗi khi tải chi tiết đơn hàng:', error);
        } finally {
            setLoadingOrder(false);
        }
    };

    // Kiểm tra xem đã có đủ sản phẩm của đơn hàng chưa
    const hasAllOrderProducts = (): boolean => {
        if (!selectedOrderDetail) return false;
        const orderProductIds = selectedOrderDetail.products.map(p => p.id);
        const addedProductIds = items.map(item => typeof item.productId === 'string' ? parseInt(item.productId) : item.productId);
        return orderProductIds.every(id => addedProductIds.includes(id));
    };

    // Kiểm tra xem sản phẩm đã được thêm chưa
    const isProductAlreadyAdded = (productId: number): boolean => {
        return items.some(item => (typeof item.productId === 'string' ? parseInt(item.productId) : item.productId) === productId);
    };

    // Lấy danh sách sản phẩm chưa được thêm
    const getAvailableProducts = () => {
        if (!selectedOrderDetail) return [];
        return selectedOrderDetail.products.filter(product => !isProductAlreadyAdded(product.id));
    };

    // Lấy danh sách sản phẩm cho một row cụ thể (bao gồm sản phẩm đã chọn)
    const getProductsForRow = (currentItem: DeliveryItem) => {
        if (!selectedOrderDetail) return [];
        
        const availableProducts = selectedOrderDetail.products.filter(product => 
            !isProductAlreadyAdded(product.id) || product.id === currentItem.productId
        );
        
        return availableProducts;
    };

    const addItem = () => {
        // Không cho phép thêm nếu đã có đủ sản phẩm
        if (hasAllOrderProducts()) {
            alert('Đã có đủ tất cả sản phẩm của đơn hàng!');
            return;
        }

        let maxId = 0;
        if (items.length > 0) {
            maxId = items.reduce((max: number, item: DeliveryItem) => (item.id > max ? item.id : max), items[0].id);
        }

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

    // Validation function for date
    const validateDates = (exportDateValue: string, deliveryDateValue: string) => {
        if (!exportDateValue || !deliveryDateValue) {
            setDateError('');
            return true;
        }
        
        const exportDateObj = new Date(exportDateValue);
        const deliveryDateObj = new Date(deliveryDateValue);
        
        if (deliveryDateObj < exportDateObj) {
            setDateError('Ngày giao hàng phải lớn hơn hoặc bằng ngày xuất kho');
            return false;
        }
        
        setDateError('');
        return true;
    };

    // Helper function to get available quantity for a product
    const getAvailableQuantity = (productId: number): number => {
        const validationItem = productionPlanValidation.find(item => item.productId === productId);
        return validationItem?.availableQuantity || 0;
    };

    // Helper function to check if quantity exceeds available
    const isQuantityExceeded = (productId: number, quantity: number): boolean => {
        const available = getAvailableQuantity(productId);
        return quantity > available;
    };

    // Kiểm tra xem có sản phẩm nào vượt quá số lượng có sẵn không
    const hasExceededQuantity = (): boolean => {
        return items.some(item => {
            if (!item.productId || item.quantity === 0) return false;
            const productId = typeof item.productId === 'string' ? parseInt(item.productId) : item.productId;
            return isQuantityExceeded(productId, item.quantity);
        });
    };

    // Kiểm tra xem có sản phẩm nào có số lượng 0 không
    const hasZeroQuantity = (): boolean => {
        return items.some(item => item.quantity === 0);
    };

    // Kiểm tra xem có sản phẩm nào chưa được chọn không
    const hasUnselectedProducts = (): boolean => {
        return items.some(item => !item.productId);
    };

    const handleSubmit = async () => {
        // Kiểm tra đã chọn đơn hàng chưa
        if (!selectedOrderId) {
            alert('Vui lòng chọn đơn hàng!');
            return;
        }

        // Kiểm tra ngày xuất kho
        if (!exportDate) {
            alert('Vui lòng chọn ngày xuất kho!');
            return;
        }

        // Validate dates before submitting
        if (!validateDates(exportDate, deliveryDate)) {
            return;
        }

        // Kiểm tra có sản phẩm nào chưa được chọn không
        if (hasUnselectedProducts()) {
            alert('Vui lòng chọn đầy đủ sản phẩm!');
            return;
        }

        // Kiểm tra có sản phẩm nào có số lượng 0 không
        if (hasZeroQuantity()) {
            alert('Không được để sản phẩm có số lượng là 0!');
            return;
        }

        // Kiểm tra có sản phẩm nào vượt quá số lượng có sẵn không
        if (hasExceededQuantity()) {
            alert('Có sản phẩm vượt quá số lượng có sẵn! Vui lòng kiểm tra lại.');
            return;
        }

        // Kiểm tra có ít nhất một sản phẩm không
        if (items.length === 0) {
            alert('Vui lòng thêm ít nhất một sản phẩm!');
            return;
        }

        setIsSubmitting(true);
        try {
            const deliveryData: CreateDeliveryDto = {
                salesOrderId: parseInt(selectedOrderId),
                deliveryDate: deliveryDate || undefined, // Cho phép null
                exportDate: exportDate || undefined,
                status: statusList.indexOf(status),
                note: note || undefined,
                deliveryDetails: items
                    .filter(item => item.productId && item.quantity > 0)
                    .map(item => ({
                        productId: typeof item.productId === 'string' ? parseInt(item.productId) : item.productId,
                        quantity: item.quantity,
                        note: undefined
                    }))
            };

            await createDelivery(deliveryData);
            alert('Tạo phiếu giao hàng thành công!');
            router.push('/delivery');
        } catch (error: any) {
            console.error('Lỗi khi tạo phiếu giao hàng:', error);
            alert(error.response?.data?.message || 'Lỗi khi tạo phiếu giao hàng');
        } finally {
            setIsSubmitting(false);
        }
    };

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
                            <label htmlFor="exportDate" className="mb-0 flex-1 ltr:mr-2 rtl:ml-2">
                                Ngày xuất kho <span className="text-red-500">*</span>
                            </label>
                            <input 
                                id="exportDate" 
                                type="date" 
                                value={exportDate}
                                onChange={(e) => {
                                    setExportDate(e.target.value);
                                    validateDates(e.target.value, deliveryDate);
                                }}
                                className="form-input w-2/3 lg:w-[250px]" 
                                required
                            />
                        </div>

                        <div className="mt-4 flex items-center">
                            <label htmlFor="deliveryDate" className="mb-0 flex-1 ltr:mr-2 rtl:ml-2">
                                Ngày giao hàng
                            </label>
                            <input 
                                id="deliveryDate" 
                                type="date" 
                                value={deliveryDate}
                                onChange={(e) => {
                                    setDeliveryDate(e.target.value);
                                    validateDates(exportDate, e.target.value);
                                }}
                                className="form-input w-2/3 lg:w-[250px]" 
                            />
                        </div>
                        {dateError && (
                            <div className="mt-2 text-sm text-red-500">
                                {dateError}
                            </div>
                        )}
                        <div className="mt-4 flex items-center">
                            <label htmlFor="status" className="mb-0 flex-1 ltr:mr-2 rtl:ml-2">
                                Trạng thái
                            </label>
                            <select 
                                id="status" 
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="form-select w-2/3 lg:w-[250px]"
                            >
                                {statusList.map((statusOption) => (
                                    <option key={statusOption} value={statusOption}>{statusOption}</option>
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
                                                    {getProductsForRow(item).map((product) => (
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
                                                    min={1}
                                                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                                                />
                                                {item.productId && typeof item.productId === 'number' && isQuantityExceeded(item.productId, item.quantity) && (
                                                    <div className="mt-1 text-xs text-red-600">
                                                        ⚠️ Vượt quá số lượng có sẵn ({getAvailableQuantity(item.productId)})
                                                    </div>
                                                )}
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
                            {!hasAllOrderProducts() && (
                                <button type="button" className="btn btn-primary" onClick={() => addItem()}>
                                    Thêm sản phẩm
                                </button>
                            )}
                            {hasAllOrderProducts() && (
                                <div className="text-sm text-green-600 font-medium">
                                    ✓ Đã có đủ tất cả sản phẩm của đơn hàng
                                </div>
                            )}
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
                    <textarea 
                        id="notes" 
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="form-textarea min-h-[130px]" 
                        placeholder="Ghi chú...."
                    ></textarea>
                </div>
            </div>
            <div className="mt-6 w-full xl:mt-0 xl:w-96">
                <div className="panel">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-1">
                        <button 
                            type="button" 
                            onClick={handleSubmit}
                            disabled={isSubmitting || !!dateError}
                            className="btn btn-success w-full gap-2"
                        >
                            <IconSave className="shrink-0 ltr:mr-2 rtl:ml-2" />
                            {isSubmitting ? 'Đang tạo...' : 'Tạo phiếu giao hàng'}
                        </button>

                        {/* <button type="button" className="btn btn-primary w-full gap-2">
                            <IconEye className="shrink-0 ltr:mr-2 rtl:ml-2" />
                            Xem trước
                        </button>

                        <button type="button" className="btn btn-secondary w-full gap-2">
                            <IconDownload className="shrink-0 ltr:mr-2 rtl:ml-2" />
                            Tải xuống
                        </button> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddDeliveryComponent;
