'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import IconDownload from '@/components/icon/icon-download';
import IconEye from '@/components/icon/icon-eye';
import IconSave from '@/components/icon/icon-save';
import IconX from '@/components/icon/icon-x';
import { PurchaseOrderDto } from '@/app/(defaults)/purchase-order/service';
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
    customerName: string;
    customerAddress?: string;
    customerPhone?: string;
    note?: string;
    invoiceDetails: {
        productId: number;
        quantity: number;
        unitPrice: number;
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
    const [customerName, setCustomerName] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [note, setNote] = useState('');
    const [tax, setTax] = useState(0);
    const [purchaseOrderId, setPurchaseOrderId] = useState<number | undefined>();

    // State for invoice items
    const [items, setItems] = useState<InvoiceItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load purchase order data if provided in URL
    useEffect(() => {
        const orderParam = searchParams.get('order');
        if (orderParam) {
            try {
                const orderData: PurchaseOrderDto = JSON.parse(decodeURIComponent(orderParam));
                setPurchaseOrderId(orderData.id);
                setCustomerName(orderData.supplierName || '');
                setInvoiceType(1); // Purchase invoice
                
                // Generate invoice code
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                setInvoiceCode(`HD${year}${month}${day}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
                
                // Load purchase order details
                loadPurchaseOrderDetails(orderData.id);
            } catch (error) {
                console.error('Error parsing order data:', error);
            }
        } else {
            // Generate invoice code for manual creation
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            setInvoiceCode(`HD${year}${month}${day}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
        }
    }, [searchParams]);

    const loadPurchaseOrderDetails = async (orderId: number) => {
        try {
            // This would need to be implemented in the backend
            // For now, we'll create a mock structure
            console.log('Loading purchase order details for ID:', orderId);
        } catch (error) {
            console.error('Error loading purchase order details:', error);
        }
    };

    const addItem = () => {
        const maxId = items.length > 0 ? Math.max(...items.map(item => item.id)) : 0;
        setItems([
            ...items,
            {
                id: maxId + 1,
                productId: 0,
                productName: '',
                quantity: 0,
                unitPrice: 0,
                amount: 0,
                description: '',
            },
        ]);
    };

    const removeItem = (itemId: number) => {
        setItems(items.filter(item => item.id !== itemId));
    };

    const handleItemChange = (itemId: number, field: keyof InvoiceItem, value: any) => {
        setItems(items.map(item => {
            if (item.id === itemId) {
                const updatedItem = { ...item, [field]: value };
                // Recalculate amount if quantity or unitPrice changed
                if (field === 'quantity' || field === 'unitPrice') {
                    updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice;
                }
                return updatedItem;
            }
            return item;
        }));
    };

    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = (subtotal * tax) / 100;
    const totalAmount = subtotal + taxAmount;

    const validateForm = (): boolean => {
        if (!invoiceCode.trim()) {
            alert('Vui lòng nhập mã hóa đơn!');
            return false;
        }
        if (!invoiceDate) {
            alert('Vui lòng chọn ngày hóa đơn!');
            return false;
        }
        if (!customerName.trim()) {
            alert('Vui lòng nhập tên khách hàng/nhà cung cấp!');
            return false;
        }
        if (items.length === 0) {
            alert('Vui lòng thêm ít nhất một sản phẩm!');
            return false;
        }
        if (items.some(item => !item.productName.trim() || item.quantity <= 0 || item.unitPrice <= 0)) {
            alert('Vui lòng điền đầy đủ thông tin sản phẩm!');
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
                customerName,
                customerAddress: customerAddress || undefined,
                customerPhone: customerPhone || undefined,
                note: note || undefined,
                invoiceDetails: items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    description: item.description,
                })),
            };

            // This would need to be implemented in the backend
            // await axios.post('/api/invoices', invoiceData);
            console.log('Creating invoice:', invoiceData);
            
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
                    <div className="mb-6 w-full lg:w-1/2">
                        <div className="flex shrink-0 items-center text-black dark:text-white">
                            <img src="/assets/images/logo.svg" alt="img" className="w-14" />
                        </div>
                        <div className="mt-6 space-y-1 text-gray-500 dark:text-gray-400">
                            <div>VNG Glass</div>
                            <div>123 Đường ABC, Quận 1, TP.HCM</div>
                            <div>Phone: (84) 123-456-789</div>
                        </div>
                    </div>
                    <div className="w-full lg:w-1/2 lg:max-w-fit">
                        <div className="mt-4 flex items-center">
                            <label htmlFor="invoiceCode" className="mb-0 flex-1 ltr:mr-2 rtl:ml-2">
                                Mã hóa đơn <span className="text-red-500">*</span>
                            </label>
                            <input 
                                id="invoiceCode" 
                                type="text" 
                                value={invoiceCode}
                                onChange={(e) => setInvoiceCode(e.target.value)}
                                className="form-input w-2/3 lg:w-[250px]" 
                                required
                            />
                        </div>
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
                            <label htmlFor="dueDate" className="mb-0 flex-1 ltr:mr-2 rtl:ml-2">
                                Ngày đến hạn
                            </label>
                            <input 
                                id="dueDate" 
                                type="date" 
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="form-input w-2/3 lg:w-[250px]" 
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

                <div className="px-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <label htmlFor="customerName" className="mb-2 block">
                                {invoiceType === 0 ? 'Tên khách hàng' : 'Tên nhà cung cấp'} <span className="text-red-500">*</span>
                            </label>
                            <input 
                                id="customerName" 
                                type="text" 
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="form-input" 
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="customerAddress" className="mb-2 block">
                                Địa chỉ
                            </label>
                            <input 
                                id="customerAddress" 
                                type="text" 
                                value={customerAddress}
                                onChange={(e) => setCustomerAddress(e.target.value)}
                                className="form-input" 
                            />
                        </div>
                        <div>
                            <label htmlFor="customerPhone" className="mb-2 block">
                                Số điện thoại
                            </label>
                            <input 
                                id="customerPhone" 
                                type="text" 
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                className="form-input" 
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Sản phẩm</th>
                                    <th className="w-1">Số lượng</th>
                                    <th className="w-1">Đơn giá</th>
                                    <th className="w-1">Thành tiền</th>
                                    <th className="w-1">Mô tả</th>
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
                                {items.map((item) => (
                                    <tr className="align-top" key={item.id}>
                                        <td>
                                            <input
                                                type="text"
                                                value={item.productName}
                                                onChange={(e) => handleItemChange(item.id, 'productName', e.target.value)}
                                                className="form-input min-w-[200px]"
                                                placeholder="Tên sản phẩm"
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="form-input w-32"
                                                placeholder="Số lượng"
                                                value={item.quantity}
                                                min={1}
                                                onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                className="form-input w-32"
                                                placeholder="Đơn giá"
                                                value={item.unitPrice}
                                                min={0}
                                                onChange={(e) => handleItemChange(item.id, 'unitPrice', parseInt(e.target.value) || 0)}
                                            />
                                        </td>
                                        <td>
                                            <div className="form-input w-32 bg-gray-100">
                                                {item.amount.toLocaleString()}₫
                                            </div>
                                        </td>
                                        <td>
                                            <input
                                                type="text"
                                                value={item.description || ''}
                                                onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                                className="form-input min-w-[150px]"
                                                placeholder="Mô tả"
                                            />
                                        </td>
                                        <td>
                                            <button type="button" onClick={() => removeItem(item.id)}>
                                                <IconX className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-6 flex flex-col justify-between px-4 sm:flex-row">
                        <div className="mb-6 sm:mb-0">
                            <button type="button" className="btn btn-primary" onClick={addItem}>
                                Thêm sản phẩm
                            </button>
                        </div>
                        <div className="space-y-2 text-right">
                            <div className="text-lg">
                                Tổng tiền hàng: {subtotal.toLocaleString()}₫
                            </div>
                            <div className="flex items-center gap-2">
                                <span>Thuế (%):</span>
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
                            disabled={isSubmitting}
                            className="btn btn-success w-full gap-2"
                        >
                            <IconSave className="shrink-0 ltr:mr-2 rtl:ml-2" />
                            {isSubmitting ? 'Đang tạo...' : 'Tạo hóa đơn'}
                        </button>

                        <button type="button" className="btn btn-primary w-full gap-2">
                            <IconEye className="shrink-0 ltr:mr-2 rtl:ml-2" />
                            Xem trước
                        </button>

                        <button type="button" className="btn btn-secondary w-full gap-2">
                            <IconDownload className="shrink-0 ltr:mr-2 rtl:ml-2" />
                            Tải xuống
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
