'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import IconDownload from '@/components/icon/icon-download';
import IconEye from '@/components/icon/icon-eye';
import IconSave from '@/components/icon/icon-save';
import IconX from '@/components/icon/icon-x';
import { PurchaseOrderDto } from '@/app/(defaults)/purchase-order/service';
import { DeliveryDto, getDeliveryDetail, getSalesOrderDetail, DeliveryDetailDto } from '@/app/(defaults)/delivery/service';
import { createInvoice } from '@/app/(defaults)/invoices/service';
import axios from '@/setup/axios';

interface InvoiceItem {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    description?: string;
}

interface CreateInvoiceDto {
    invoiceCode: string;
    invoiceDate: string;
    dueDate?: string;
    invoiceType: number; // 0: Sales, 1: Purchase
    status: number; // 0: Unpaid, 1: PartiallyPaid, 2: Paid
    subtotal: number;
    tax: number;
    totalAmount: number;
    salesOrderId?: number;
    purchaseOrderId?: number;
    customerId: number;
    note?: string;
    invoiceDetails: {
        productId: number;
        quantity: number;
        unitPrice: number;
        total: number;
        description?: string;
    }[];
}

interface AddInvoiceComponentProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

const AddInvoiceComponent: React.FC<AddInvoiceComponentProps> = ({ onSuccess, onCancel }) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State for invoice form
    const [invoiceCode, setInvoiceCode] = useState('');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');
    const [invoiceType, setInvoiceType] = useState(1); // Default to Purchase
    const [status, setStatus] = useState(0); // Default to Unpaid
    // Customer info is now loaded from source (delivery or purchase order)
    const [note, setNote] = useState('');
    const [tax, setTax] = useState(0);
    const [purchaseOrderId, setPurchaseOrderId] = useState<number | undefined>();
    const [deliveryId, setDeliveryId] = useState<number | undefined>();
    const [customerId, setCustomerId] = useState<number>(0);
    const [sourceInfo, setSourceInfo] = useState<{
        type: 'delivery' | 'purchase' | null;
        data: any;
    }>({ type: null, data: null });

    // State for invoice items
    const [items, setItems] = useState<InvoiceItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [productAreaMap, setProductAreaMap] = useState<Record<number, number>>({});
    const [productPriceMap, setProductPriceMap] = useState<Record<number, number>>({});

    // Load purchase order or delivery data if provided in URL
    useEffect(() => {
        const orderParam = searchParams?.get('order');
        const deliveryParam = searchParams?.get('delivery');
        
        if (orderParam) {
            try {
                const orderData: PurchaseOrderDto = JSON.parse(decodeURIComponent(orderParam));
                setPurchaseOrderId(orderData.id);
                setCustomerId(orderData.id || 0);
                setInvoiceType(1); // Purchase invoice
                
                // Load purchase order details
                loadPurchaseOrderDetails(orderData.id);
            } catch (error) {
                console.error('Error parsing order data:', error);
            }
        } else if (deliveryParam) {
            try {
                const deliveryData: DeliveryDto = JSON.parse(decodeURIComponent(deliveryParam));
                setDeliveryId(deliveryData.id);
                setCustomerId(deliveryData.salesOrderId || 0);
                setInvoiceType(0); // Sales invoice
                
                // Load delivery details
                loadDeliveryDetails(deliveryData.id);
            } catch (error) {
                console.error('Error parsing delivery data:', error);
            }
        } 
    }, [searchParams]);

    const loadPurchaseOrderDetails = async (orderId: number) => {
        try {
            // Load purchase order details from API
            const response = await axios.get(`/api/PurchaseOrder/${orderId}`);
            const orderData = response.data;
            
            console.log('Purchase order data received:', orderData);
            console.log('CustomerId from purchase order:', orderData.customerId);
            
            setSourceInfo({ type: 'purchase', data: orderData });
            setCustomerId(orderData.customerId); // Set customerId from purchase order
            
            // Load products from purchase order details
            setItems(orderData.purchaseOrderDetails.map((detail: any, index: number) => ({
                id: index + 1,
                productId: detail.productId || 0,
                productName: detail.productName || '',
                quantity: detail.quantity || 0,
                unitPrice: detail.unitPrice || 0, // Use actual unit price from purchase order
                amount: detail.totalPrice || 0, // Use actual total price from purchase order
                description: ''
            })));
        } catch (error) {
            console.error('Error loading purchase order details:', error);
        }
    };

    const loadDeliveryDetails = async (deliveryId: number) => {
        try {
            const deliveryData = await getDeliveryDetail(deliveryId);           
            
            setSourceInfo({ type: 'delivery', data: deliveryData });
            setCustomerId(deliveryData.customerId); // Use actual customerId

            if (deliveryData.salesOrderId) {
                try {
                    const orderDetail = await getSalesOrderDetail(deliveryData.salesOrderId);
                    const areaMap: Record<number, number> = {};
                    const priceMap: Record<number, number> = {};
                    orderDetail.products.forEach(p => {
                        const width = Number(p.width) || 0;
                        const height = Number(p.height) || 0;
                        const areaM2 = (width * height) / 1_000_000;
                        areaMap[p.id] = areaM2;
                        priceMap[p.id] = Number(p.unitPrice) || 0; // price per m²
                    });
                    setProductAreaMap(areaMap);
                    setProductPriceMap(priceMap);

                    // Map delivery details using correct price and computed amount
                    setItems(deliveryData.deliveryDetails.map((detail, index) => {
                        const perM2Price = priceMap[detail.productId] ?? detail.unitPrice ?? 0;
                        const areaM2 = areaMap[detail.productId] ?? 0;
                        return {
                            id: index + 1,
                            productId: detail.productId,
                            productName: detail.productName,
                            quantity: detail.quantity,
                            unitPrice: perM2Price,
                            amount: (detail.quantity || 0) * perM2Price * areaM2,
                            description: detail.note || ''
                        } as InvoiceItem;
                    }));
                } catch (e) {
                    console.error('Không thể tải đơn hàng liên quan để tính đơn giá/diện tích:', e);
                    // Fallback to delivery-provided values
                    setItems(deliveryData.deliveryDetails.map((detail, index) => ({
                        id: index + 1,
                        productId: detail.productId,
                        productName: detail.productName,
                        quantity: detail.quantity,
                        unitPrice: detail.unitPrice,
                        amount: detail.amount,
                        description: detail.note || ''
                    })));
                }
            } else {
                // No sales order, fallback
                setItems(deliveryData.deliveryDetails.map((detail, index) => ({
                    id: index + 1,
                    productId: detail.productId,
                    productName: detail.productName,
                    quantity: detail.quantity,
                    unitPrice: detail.unitPrice,
                    amount: detail.amount,
                    description: detail.note || ''
                })));
            }
        } catch (error) {
            console.error('Error loading delivery details:', error);
        }
    };

    // addItem and removeItem removed as items are now read-only from source data

    // handleItemChange removed as all fields are now read-only

    const subtotal = items.reduce((sum, item) => {
        const areaM2 = productAreaMap[item.productId] ?? 0;
        const perM2Price = productPriceMap[item.productId] ?? item.unitPrice ?? 0;
        const lineTotal = (item.quantity || 0) * perM2Price * areaM2;
        return sum + lineTotal;
    }, 0);
    const taxAmount = (subtotal * tax) / 100;
    const totalAmount = subtotal + taxAmount;

    const validateForm = (): boolean => {
        
        if (!invoiceDate) {
            alert('Vui lòng chọn ngày hóa đơn!');
            return false;
        }
        if (customerId <= 0) {
            alert('Vui lòng chọn khách hàng/nhà cung cấp!');
            return false;
        }
        if (!sourceInfo.type) {
            alert('Vui lòng chọn nguồn dữ liệu (phiếu giao hàng hoặc đơn mua hàng)!');
            return false;
        }
        if (items.length === 0) {
            alert('Vui lòng thêm ít nhất một sản phẩm!');
            return false;
        }
        // All invoice data is now read-only, validate that all items have valid data
        if (items.some(item => !item.productName.trim() || item.quantity <= 0 || item.unitPrice <= 0)) {
            alert('Dữ liệu sản phẩm không hợp lệ!');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const invoiceData: CreateInvoiceDto = {
                invoiceCode,
                invoiceDate,
                dueDate: dueDate || undefined,
                invoiceType,
                status,
                subtotal,
                tax,
                totalAmount,
                purchaseOrderId,
                salesOrderId: sourceInfo.type === 'delivery' ? sourceInfo.data.salesOrderId : undefined,
                customerId,
                note: note || undefined,
                invoiceDetails: items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    total: item.amount,
                    description: item.description,
                })),
            };

            console.log('Creating invoice with data:', invoiceData);
            const result = await createInvoice(invoiceData);
            
            alert('Tạo hóa đơn thành công!');
            if (onSuccess) {
                onSuccess();
            } else {
                router.push('/invoices');
            }
        } catch (error: any) {
            console.error('Lỗi khi tạo hóa đơn:', error);
            alert(error.response?.data?.message || 'Lỗi khi tạo hóa đơn');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            router.push('/invoices');
        }
    };

    return (
        <div className="flex flex-col gap-2.5 xl:flex-row">
            <div className="panel flex-1 px-0 py-6 ltr:xl:mr-6 rtl:xl:ml-6">
                <div className="flex flex-wrap justify-between px-4">

                    {/* Hóa đơn cho */}
                    {sourceInfo.type && (
                        <div className="mb-6 w-full lg:w-1/2">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                                    Hóa đơn cho
                                </h3>
                                {sourceInfo.type === 'delivery' && sourceInfo.data && (
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="font-medium">Phiếu giao hàng:</span>
                                            <p className="text-blue-700">{sourceInfo.data.orderCode}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium">Khách hàng:</span>
                                            <p className="text-blue-700">{sourceInfo.data.customerName}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium">Địa chỉ:</span>
                                            <p className="text-blue-700">{sourceInfo.data.customerAddress}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium">Số điện thoại:</span>
                                            <p className="text-blue-700">{sourceInfo.data.customerPhone}</p>
                                        </div>
                                    </div>
                                )}
                                {sourceInfo.type === 'purchase' && sourceInfo.data && (
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="font-medium">Đơn mua hàng:</span>
                                            <p className="text-blue-700">{sourceInfo.data.code}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium">Nhà cung cấp:</span>
                                            <p className="text-blue-700">{sourceInfo.data.customerName}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium">Ngày đặt hàng:</span>
                                            <p className="text-blue-700">{sourceInfo.data.date ? new Date(sourceInfo.data.date).toLocaleDateString('vi-VN') : 'N/A'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <div className="w-full lg:w-1/2 lg:max-w-fit">
                        
                        <div className="mt-4 flex items-center">
                            <label htmlFor="invoiceDate" className="mb-0 flex-1 ltr:mr-2 rtl:ml-2">
                                Ngày hóa đơn <span className="text-red-500">*</span>
                            </label>
                            <input 
                                id="invoiceDate" 
                                type="date" 
                                value={invoiceDate}
                                onChange={(e) => setInvoiceDate(e.target.value)}
                                className="form-input w-2/3 lg:w-[250px]" 
                                required
                            />
                        </div>
                        
                        <div className="mt-4 flex items-center">
                            <label htmlFor="invoiceType" className="mb-0 flex-1 ltr:mr-2 rtl:ml-2">
                                Loại hóa đơn
                            </label>
                            <select 
                                id="invoiceType" 
                                value={invoiceType}
                                onChange={(e) => setInvoiceType(parseInt(e.target.value))}
                                className="form-select w-2/3 lg:w-[250px]"
                            >
                                <option value={0}>Bán hàng</option>
                                <option value={1}>Mua hàng</option>
                            </select>
                        </div>
                        <div className="mt-4 flex items-center">
                            <label htmlFor="status" className="mb-0 flex-1 ltr:mr-2 rtl:ml-2">
                                Trạng thái
                            </label>
                            <select 
                                id="status" 
                                value={status}
                                onChange={(e) => setStatus(parseInt(e.target.value))}
                                className="form-select w-2/3 lg:w-[250px]"
                            >
                                <option value={0}>Chưa thanh toán</option>
                                <option value={1}>Thanh toán một phần</option>
                                <option value={2}>Đã thanh toán</option>
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
                                    <th className="w-1">Đơn giá / m² (₫)</th>
                                    <th className="w-1">Diện tích (m²)</th>
                                    <th className="w-1">Thành tiền</th>
                                    <th className="w-1"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="!text-center font-semibold">
                                            Không có sản phẩm nào
                                        </td>
                                    </tr>
                                )}
                                {items.map((item) => {
                                    const areaM2 = productAreaMap[item.productId] ?? 0;
                                    const perM2Price = productPriceMap[item.productId] ?? item.unitPrice ?? 0;
                                    const computedAmount = (item.quantity || 0) * perM2Price * areaM2;
                                    return (
                                    <tr className="align-top" key={item.id}>
                                        <td>
                                            <div className="form-input min-w-[200px] bg-gray-100">
                                                {item.productName}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="form-input w-32 bg-gray-100">
                                                {item.quantity}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="form-input w-32 bg-gray-100">
                                                {perM2Price.toLocaleString()}₫
                                            </div>
                                        </td>
                                        <td>
                                            <div className="form-input w-32 bg-gray-100">
                                                {areaM2.toFixed(2)}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="form-input w-32 bg-gray-100">
                                                {computedAmount.toLocaleString()}₫
                                            </div>
                                        </td>
                                       
                                        {/* <td>
                                            <button type="button" onClick={() => removeItem(item.id)}>
                                                <IconX className="h-5 w-5" />
                                            </button>
                                        </td> */}
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-6 flex flex-col justify-between px-4 sm:flex-row">
                        {/* <div className="mb-6 sm:mb-0">
                            <button type="button" className="btn btn-primary" onClick={addItem}>
                                Thêm sản phẩm
                            </button>
                        </div> */}
                        <div className="space-y-2 text-right">
                            <div className="text-lg">
                                Tổng tiền hàng: {subtotal.toLocaleString()}₫
                            </div>
                            <div className="flex items-center gap-2">
                                {/* <span>Thuế (%):</span> */}
                                <input
                                    type="number"
                                    value={tax}
                                    onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                                    className="form-input w-20"
                                    min={0}
                                    max={100}
                                />
                                <span>= {taxAmount.toLocaleString()}₫</span>
                            </div>
                            <div className="text-xl font-semibold">
                                Tổng cộng: {totalAmount.toLocaleString()}₫
                            </div>
                        </div>
                    </div>
                </div>
               
            </div>
            <div className="mt-6 w-full xl:mt-0 xl:w-96">
                <div className="panel">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-1">
                        <button 
                            type="button" 
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="btn btn-success w-full gap-2"
                        >
                            <IconSave className="shrink-0 ltr:mr-2 rtl:ml-2" />
                            {isSubmitting ? 'Đang tạo...' : 'Tạo hóa đơn'}
                        </button>

                       

                        <button 
                            type="button" 
                            onClick={handleCancel}
                            className="btn btn-outline-danger w-full gap-2"
                        >
                            <IconX className="shrink-0 ltr:mr-2 rtl:ml-2" />
                            Hủy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddInvoiceComponent;
