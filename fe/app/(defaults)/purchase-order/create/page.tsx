'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AsyncSelect from 'react-select/async';
import {
    checkProductNameExists,
    createPurchaseOrder,
    getNextPurchaseOrderCode,
    loadCustomerOptions,
    loadOptions,
    searchCustomers,
    searchProducts,
    CustomerOption,
    ProductOption,
    OrderItem,
    getAllCustomerNames,
    getAllProductNames,
    createProductNVL,
} from './service';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Swal from 'sweetalert2';

const toPositiveInt = (v: string | number): number | null => {
    const n = typeof v === 'string' ? Number(v) : v;
    return Number.isInteger(n) && n > 0 ? n : null;
};
const toPositiveNumber = (v: string | number): number | null => {
    const n = typeof v === 'string' ? Number(v) : v;
    return Number.isFinite(n) && n > 0 ? n : null;
};

const PurchaseOrderCreatePage = () => {
    const router = useRouter();

    const [isCustomerLocked, setIsCustomerLocked] = useState(false);
    const [customerNames, setCustomerNames] = useState<string[]>([]);
    const [productNames, setProductNames] = useState<string[]>([]);

    const [form, setForm] = useState({
        customer: '',
        description: '',
        createdDate: new Date().toISOString().split('T')[0],
        orderCode: '',
        status: 'Chưa thực hiện',
        items: [] as OrderItem[],
    });

    const [showAddProductForm, setShowAddProductForm] = useState(false);
    const [newProductForm, setNewProductForm] = useState({
        productName: '',
        width: 0,
        height: 0,
        thickness: 0,
        quantity: 1,
        glassStructureId: undefined as number | undefined,
    });
    const [isProductNameDuplicate, setIsProductNameDuplicate] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null);

    const [isCustomerNameDuplicate, setIsCustomerNameDuplicate] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const [code, productRes, customerRes] = await Promise.all([getNextPurchaseOrderCode(), searchProducts(''), searchCustomers('')]);
                setForm((f) => ({ ...f, orderCode: code }));
                setProductNames(productRes.map((p) => p.productName));
                setCustomerNames(customerRes.map((c) => c.customer.customerName));
            } catch (err) {
                console.error('Init error:', err);
            }
        })();
        getAllCustomerNames().then(setCustomerNames);
        getAllProductNames().then(setProductNames);
    }, []);

    const handleCustomerChange = (val: string) => setForm((f) => ({ ...f, customer: val }));

    const handleItemChange = (idx: number, field: keyof OrderItem, val: string | number) => {
        // Validate quantity limit
        if (field === 'quantity') {
            const numValue = +val;
            if (numValue > 9999) {
                Swal.fire({
                    title: 'Cảnh báo',
                    text: 'Số lượng không được vượt quá 9999',
                    icon: 'warning',
                    toast: true,
                    position: 'bottom-start',
                    showConfirmButton: false,
                    timer: 3000,
                    showCloseButton: true,
                });
                return;
            }
            if (numValue < 1) {
                Swal.fire({
                    title: 'Cảnh báo',
                    text: 'Số lượng phải lớn hơn 0',
                    icon: 'warning',
                    toast: true,
                    position: 'bottom-start',
                    showConfirmButton: false,
                    timer: 3000,
                    showCloseButton: true,
                });
                return;
            }
        }

        // Validate unit price limit
        if (field === 'unitPrice') {
            const numValue = +val;
            if (numValue > 99999999) {
                Swal.fire({
                    title: 'Cảnh báo',
                    text: 'Đơn giá không được vượt quá 99,999,999',
                    icon: 'warning',
                    toast: true,
                    position: 'bottom-start',
                    showConfirmButton: false,
                    timer: 3000,
                    showCloseButton: true,
                });
                return;
            }
            if (numValue < 0) {
                Swal.fire({
                    title: 'Cảnh báo',
                    text: 'Đơn giá không được âm',
                    icon: 'warning',
                    toast: true,
                    position: 'bottom-start',
                    showConfirmButton: false,
                    timer: 3000,
                    showCloseButton: true,
                });
                return;
            }
        }

        setForm((f) => {
            const items = [...f.items];
            const updatedItem = {
                ...items[idx],
                [field]: field === 'productName' ? val.toString() : Number(val),
            } as OrderItem;
            
            // Calculate total price when quantity or unit price changes
            if (field === 'quantity' || field === 'unitPrice') {
                updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
            }
            
            items[idx] = updatedItem;
            return { ...f, items };
        });
    };

    const handleCustomerNameChange = (value: string) => {
        const isDuplicate = customerNames.includes(value.trim());
        setIsCustomerNameDuplicate(isDuplicate);

        setForm((prev) => ({
            ...prev,
            customer: value,
        }));
    };

    const removeItem = (idx: number) =>
        setForm((f) => {
            const items = [...f.items];
            items.splice(idx, 1);
            return { ...f, items };
        });

    const [newMaterialProductForm, setNewMaterialProductForm] = useState({
        productName: '',
        width: 0,
        height: 0,
        thickness: 0,
        uom: '',
    });

    const [isProductNameDuplicateNVL, setIsProductNameDuplicateNVL] = useState(false);

    const handleMaterialProductNameChange = async (val: string) => {
        const exists = await checkProductNameExists(val.trim());
        setIsProductNameDuplicateNVL(exists);
        setNewMaterialProductForm((prev) => ({ ...prev, productName: val }));
    };

    const handleSaveProduct = async () => {
        try {
            if (!newMaterialProductForm.productName.trim()) throw new Error('Vui lòng nhập tên sản phẩm');
            if (!newMaterialProductForm.uom?.trim()) throw new Error('Vui lòng nhập đơn vị tính');
            if (isProductNameDuplicateNVL) throw new Error('Tên sản phẩm đã tồn tại');
            if (await checkProductNameExists(newMaterialProductForm.productName)) throw new Error('Tên sản phẩm đã tồn tại, vui lòng chọn tên khác!');

            const payload = {
                productName: newMaterialProductForm.productName,
                uom: newMaterialProductForm.uom,
                productType: 'NVL', // mặc định
                width: null,
                height: null,
                thickness: null,
                unitPrice: 0,
            };

            const p = await createProductNVL(payload);

            const newItem: OrderItem = {
                id: Date.now(),
                productId: p.id,
                productName: p.productName,
                width: 0,
                height: 0,
                thickness: 0,
                quantity: 1,
                unitPrice: 0,
                totalPrice: 0,
                uom: p.uom ?? 'Tấm',
                isFromDatabase: true,
            };

            setForm((f) => ({ ...f, items: [...f.items, newItem] }));
            setShowAddProductForm(false);
            setNewMaterialProductForm({ productName: '', width: 0, height: 0, thickness: 0, uom: '' });

            Swal.fire({
                title: 'Thành công',
                text: `Đã tạo sản phẩm thành công: ${p.productName}`,
                icon: 'success',
                toast: true,
                position: 'bottom-start',
                showConfirmButton: false,
                timer: 3000,
                showCloseButton: true,
            });
        } catch (err: any) {
            Swal.fire({
                title: 'Lỗi',
                text: err.message || 'Lỗi tạo sản phẩm',
                icon: 'error',
                toast: true,
                position: 'bottom-start',
                showConfirmButton: false,
                timer: 3000,
                showCloseButton: true,
            });
        }
    };

    const handleSave = async () => {
        try {
            if (!form.customer.trim()) throw new Error('Vui lòng nhập tên nhà cung cấp');
            if (isCustomerNameDuplicate) throw new Error('Tên nhà cung cấp đã tồn tại');

            const validItems = form.items.filter((i) => i.productName.trim());
            if (!validItems.length) throw new Error('Chưa có sản phẩm hợp lệ');

            const products = validItems.map((p, i) => {
                const qty = toPositiveInt(p.quantity);
                const unitPrice = toPositiveNumber(p.unitPrice);
                if (!p.productName?.trim()) throw new Error(`Sản phẩm #${i + 1}: Vui lòng nhập tên sản phẩm`);
                if (!qty) throw new Error(`Sản phẩm #${i + 1}: Số lượng phải > 0`);
                if (!unitPrice) throw new Error(`Sản phẩm #${i + 1}: Đơn giá phải > 0`);

                return {
                    productName: p.productName.trim(),
                    quantity: qty,
                    unitPrice: unitPrice,
                    totalPrice: qty * unitPrice,
                    uom: p.uom,
                };
            });

            const dto = {
                customerName: form.customer.trim(),
                code: form.orderCode,
                description: form.description,
                date: form.createdDate,
                status: form.status,
                products,
            };
            const res = await createPurchaseOrder(dto);
            Swal.fire({
                title: 'Thành công',
                text: 'Tạo đơn hàng mua thành công!',
                icon: 'success',
                toast: true,
                position: 'bottom-start',
                showConfirmButton: false,
                timer: 3000,
                showCloseButton: true,
            });
            router.push(`/purchase-order/${res.id}`);
        } catch (err: any) {
            console.error('Create PO error:', err?.response?.data || err);
            Swal.fire({
                title: 'Lỗi',
                text: err.message || 'Tạo đơn hàng mua thất bại',
                icon: 'error',
                toast: true,
                position: 'bottom-start',
                showConfirmButton: false,
                timer: 3000,
                showCloseButton: true,
            });
        }
    };

    return (
        <ProtectedRoute requiredRole={[1]}>

        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold">Tạo đơn hàng mua</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block mb-1 font-medium">Tên nhà cung cấp</label>
                    <input disabled={isCustomerLocked} className="input input-bordered w-full" value={form.customer} onChange={(e) => handleCustomerNameChange(e.target.value)} />
                    {isCustomerNameDuplicate && <p className="text-red-500 text-sm mt-1">Tên nhà cung cấp đã tồn tại. Vui lòng nhập tên khác.</p>}
                </div>
                <div>
                    <label className="block mb-1 font-medium">Ngày tạo</label>
                    <input className="input input-bordered w-full bg-gray-100" value={form.createdDate} readOnly />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Trạng thái</label>
                    <select className="select select-bordered w-full" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                        <option value="Chờ đặt hàng">Chờ đặt hàng</option>
                        <option value="Đã đặt hàng">Đã đặt hàng</option>
                        <option value="Hoàn thành">Hoàn thành</option>
                        <option value="Đã huỷ">Đã huỷ</option>
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className="block mb-1 font-medium">Mô tả / Ghi chú</label>
                    <textarea className="textarea textarea-bordered w-full" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                </div>
            </div>
            <div>
                <label className="block mb-1 font-medium">Nhà cung cấp có sẵn</label>
                <div className="flex items-center gap-2">
                    <AsyncSelect<CustomerOption>
                        cacheOptions
                        defaultOptions
                        loadOptions={loadCustomerOptions}
                        placeholder="Tìm nhà cung cấp có sẵn..."
                        onChange={(opt) => {
                            if (!opt) return;
                            setForm((f) => ({ ...f, customer: opt.customer.customerName }));
                            setIsCustomerLocked(true);
                        }}
                        styles={{ container: (base) => ({ ...base, width: 300 }) }}
                    />
                    {isCustomerLocked && (
                        <button
                            className="btn btn-sm btn-outline text-red-500"
                            onClick={() => {
                                setIsCustomerLocked(false);
                                setForm((f) => ({ ...f, customer: '' }));
                            }}
                        >
                            ✕ Xoá KH
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse border text-sm mb-6">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2">STT</th>
                            <th className="border p-2">Tên SP</th>
                            <th className="border p-2">Số lượng</th>
                            <th className="border p-2">Đơn vị tính</th>
                            <th className="border p-2">Đơn giá</th>
                            <th className="border p-2">Thành tiền</th>
                            <th className="border p-2 w-20"></th> {/* cột xoá */}
                        </tr>
                    </thead>

                    <tbody>
                        {form.items.map((it, idx) => {
                            return (
                                <tr key={it.id}>
                                    <td className="border p-2 text-center">{idx + 1}</td>

                                    <td className="border p-2">{it.productName}</td>

                                    <td className="border p-2 text-right">
                                        <input 
                                            type="number" 
                                            className="input input-xs w-20" 
                                            value={it.quantity} 
                                            min={1} 
                                            max={9999}
                                            onChange={(e) => handleItemChange(idx, 'quantity', +e.target.value)} 
                                        />
                                    </td>

                                    <td className="border p-2">{it.uom || 'Tấm'}</td>

                                    <td className="border p-2 text-right">
                                        <input 
                                            type="number" 
                                            className="input input-xs w-24" 
                                            value={it.unitPrice} 
                                            min={0} 
                                            max={99999999}
                                            step={1000}
                                            onChange={(e) => handleItemChange(idx, 'unitPrice', +e.target.value)} 
                                        />
                                    </td>

                                    <td className="border p-2 text-right font-medium">
                                        {it.totalPrice.toLocaleString('vi-VN')} VNĐ
                                    </td>

                                    <td className="border p-2 text-center">
                                        <button className="btn btn-xs btn-error" onClick={() => removeItem(idx)}>
                                            Xoá
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                
                {/* Total Summary */}
                {form.items.length > 0 && (
                    <div className="mt-4 flex justify-end">
                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <div className="text-right">
                                <div className="text-lg font-semibold">
                                    Tổng cộng: {form.items.reduce((sum, item) => sum + item.totalPrice, 0).toLocaleString('vi-VN')} VNĐ
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-4">
                <div className="w-1/2">
                    <AsyncSelect<ProductOption>
                        cacheOptions
                        defaultOptions
                        placeholder="Thêm sản phẩm có sẵn..."
                        value={selectedProduct}
                        loadOptions={(input) =>
                            loadOptions(
                                input,
                                form.items.map((i) => i.productId ?? i.id),
                            )
                        }
                        onChange={(opt) => {
                            if (!opt) return;
                            const p = opt.product;
                            const newItem: OrderItem = {
                                id: Date.now(),
                                productId: p.id,
                                productName: p.productName,
                                width: Number(p.width),
                                height: Number(p.height),
                                thickness: Number(p.thickness),
                                quantity: 1,
                                unitPrice: p.unitPrice || 0,
                                totalPrice: p.unitPrice || 0,
                                uom: p.uom ?? 'Tấm',
                                glassStructureId: p.glassStructureId,
                                isFromDatabase: true,
                            };
                            setForm((f) => ({ ...f, items: [...f.items, newItem] }));
                            setSelectedProduct(null);
                        }}
                    />
                </div>
                <div>
                    {/* <button onClick={() => setShowAddProductForm(true)} className="btn btn-outline btn-sm mb-6">
                        + Thêm sản phẩm
                    </button> */}
                    {showAddProductForm && (
                        <div className="border rounded-lg p-4 mb-6 bg-gray-50">
                            <h4 className="text-lg font-semibold mb-2">Thêm sản phẩm mới</h4>
                            <p className="text-sm text-gray-500 italic mb-2">
                                ⚠️ Tên sản phẩm không cần theo định dạng đặc biệt, chỉ cần mô tả rõ ràng là được.
                                <br />
                                <span>
                                    Ví dụ: <code>Kính cường lực tôi trắng KT: 200*200*5 mm</code>
                                </span>
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="col-span-full">
                                    <label className="block mb-1 font-medium">Tên sản phẩm</label>
                                    <input
                                        className="input input-sm input-bordered w-full"
                                        placeholder="VD: Kính EI60 phút, KT: 300*500*30 mm, ..."
                                        value={newMaterialProductForm.productName}
                                        onChange={(e) => handleMaterialProductNameChange(e.target.value)}
                                    />
                                    {isProductNameDuplicateNVL && <p className="text-red-500 text-sm mt-1">Tên sản phẩm đã tồn tại. Vui lòng nhập tên khác.</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 font-medium">Đơn vị tính (UOM)</label>
                                    <input
                                        className="input input-sm input-bordered w-full"
                                        placeholder="VD: Tấm, m², kg, ..."
                                        value={newMaterialProductForm.uom ?? ''}
                                        onChange={(e) => setNewMaterialProductForm((prev) => ({ ...prev, uom: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div className="mt-4 flex gap-4">
                                <button className="btn btn-sm btn-primary" onClick={handleSaveProduct}>
                                    Lưu sản phẩm
                                </button>
                                <button className="btn btn-sm btn-ghost text-red-500" onClick={() => setShowAddProductForm(false)}>
                                    ✕ Huỷ
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-4">
                <button className="btn btn-secondary" onClick={() => router.push('/purchase-order')}>
                    ◀ Quay lại
                </button>
                <button className="btn btn-primary" onClick={handleSave}>
                    Tạo đơn hàng mua
                </button>
            </div>
        </div>
        </ProtectedRoute>

    );
};

export default PurchaseOrderCreatePage;
