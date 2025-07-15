'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AsyncSelect from 'react-select/async';
import {
    createProduct,
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
} from './service';

const toPositiveInt = (v: string | number): number | null => {
    const n = typeof v === 'string' ? Number(v) : v;
    return Number.isInteger(n) && n > 0 ? n : null;
};
const toPositiveNumber = (v: string | number): number | null => {
    const n = typeof v === 'string' ? Number(v) : v;
    return Number.isFinite(n) && n > 0 ? n : null;
};
const PRODUCT_NAME_REGEX = /^Kính .+ KT: \d+\*\d+\*\d+ mm$/;

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
        setForm((f) => {
            const items = [...f.items];
            items[idx] = {
                ...items[idx],
                [field]: field === 'productName' ? val.toString() : Number(val),
            } as OrderItem;
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

    const handleProductNameChange = (name: string) => {
        setIsProductNameDuplicate(productNames.includes(name.trim()));
        setNewProductForm((p) => ({ ...p, productName: name }));
    };

    const handleSaveProduct = async () => {
        try {
            if (!newProductForm.productName.trim()) throw new Error('Vui lòng nhập tên sản phẩm');
            if (!PRODUCT_NAME_REGEX.test(newProductForm.productName)) throw new Error('Tên sản phẩm sai định dạng');
            if (isProductNameDuplicate) throw new Error('Tên sản phẩm đã tồn tại');
            if (await checkProductNameExists(newProductForm.productName)) throw new Error('Tên sản phẩm đã tồn tại, vui lòng chọn tên khác!');

            const w = toPositiveNumber(newProductForm.width);
            const h = toPositiveNumber(newProductForm.height);
            const t = toPositiveInt(newProductForm.thickness);
            if (!w || !h || !t) throw new Error('Rộng/Cao/Dày phải > 0');

            const payload = {
                productName: newProductForm.productName,
                width: newProductForm.width.toString(),
                height: newProductForm.height.toString(),
                thickness: newProductForm.thickness,
                unitPrice: 0,
                ...(newProductForm.glassStructureId && { glassStructureId: newProductForm.glassStructureId }),
            };
            const p = await createProduct(payload);

            const newItem: OrderItem = {
                id: Date.now(),
                productId: p.id,
                productName: p.productName,
                width: Number(p.width),
                height: Number(p.height),
                thickness: Number(p.thickness),
                quantity: 1,
                unitPrice: 0,
                glassStructureId: p.glassStructureId,
                isFromDatabase: true,
            };
            setForm((f) => ({ ...f, items: [...f.items, newItem] }));
            setShowAddProductForm(false);
            setNewProductForm({ productName: '', width: 0, height: 0, thickness: 0, quantity: 1, glassStructureId: undefined });
        } catch (err: any) {
            alert(err.message || 'Lỗi tạo sản phẩm');
        }
    };

    const handleSave = async () => {
        try {
            if (!form.customer.trim()) throw new Error('Vui lòng nhập tên nhà cung cấp');
            if (isCustomerNameDuplicate) throw new Error('Tên nhà cung cấp đã tồn tại');

            const validItems = form.items.filter((i) => i.productName.trim());
            if (!validItems.length) throw new Error('Chưa có sản phẩm hợp lệ');

            const products = validItems.map((p, i) => {
                const width = toPositiveNumber(p.width);
                const height = toPositiveNumber(p.height);
                const thick = toPositiveNumber(p.thickness);
                const qty = toPositiveInt(p.quantity);
                if (!width || !height || !thick) throw new Error(`Sản phẩm #${i + 1}: Rộng/Cao/Dày phải > 0`);
                if (!qty) throw new Error(`Sản phẩm #${i + 1}: Số lượng phải > 0`);
                return { productName: p.productName.trim(), width, height, thickness: thick, quantity: qty };
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
            alert('Tạo đơn hàng mua thành công!');
            router.push(`/purchase-order/${res.id}`);
        } catch (err: any) {
            console.error('Create PO error:', err?.response?.data || err);
            alert(err.message || 'Tạo đơn hàng mua thất bại');
        }
    };

    return (
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
                            <th className="border p-2">Rộng (mm)</th>
                            <th className="border p-2">Cao (mm)</th>
                            <th className="border p-2">Dày (mm)</th>
                            <th className="border p-2">Số lượng</th>
                            <th className="border p-2">Đơn vị</th>
                            <th className="border p-2">Diện tích (m²)</th>
                            <th className="border p-2 w-20"></th> {/* cột xoá */}
                        </tr>
                    </thead>

                    <tbody>
                        {form.items.map((it, idx) => {
                            const width = it.width ?? 0;
                            const height = it.height ?? 0;
                            const areaM2 = (width * height) / 1_000_000;

                            return (
                                <tr key={it.id}>
                                    <td className="border p-2 text-center">{idx + 1}</td>

                                    <td className="border p-2">{it.productName}</td>

                                    <td className="border p-2 text-right">{width.toLocaleString()}</td>

                                    <td className="border p-2 text-right">{height.toLocaleString()}</td>

                                    <td className="border p-2 text-right">{(it.thickness ?? 0).toLocaleString()}</td>

                                    {/* cột chỉnh số lượng */}
                                    <td className="border p-2 text-right">
                                        <input type="number" className="input input-xs w-20" value={it.quantity} min={1} onChange={(e) => handleItemChange(idx, 'quantity', +e.target.value)} />
                                    </td>

                                    <td className="border p-2">{it.uom || 'Tấm'}</td>

                                    <td className="border p-2 text-right">{areaM2.toFixed(2)}</td>

                                    {/* nút xoá */}
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
                                unitPrice: 0,
                                glassStructureId: p.glassStructureId,
                                isFromDatabase: true,
                            };
                            setForm((f) => ({ ...f, items: [...f.items, newItem] }));
                            setSelectedProduct(null);
                        }}
                    />
                </div>
                <div>
                    <button onClick={() => setShowAddProductForm(true)} className="btn btn-outline btn-sm mb-6">
                        + Thêm sản phẩm
                    </button>
                    {showAddProductForm && (
                        <div className="border rounded-lg p-4 mb-6 bg-gray-50">
                            <h4 className="text-lg font-semibold mb-2">Thêm sản phẩm mới</h4>
                            <p className="text-sm text-gray-500 italic mb-2">
                                ⚠️ Tên sản phẩm phải theo định dạng: <strong>Kính [loại kính] KT: [rộng]*[cao]*[dày] mm</strong>
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
                                        placeholder="VD: Kính EI60 phút, KT: 300*500*30 mm, VNG-MK cữ kính đứng"
                                        value={newProductForm.productName}
                                        onChange={(e) => handleProductNameChange(e.target.value)}
                                    />
                                    {isProductNameDuplicate && <p className="text-red-500 text-sm mt-1">Tên sản phẩm đã tồn tại. Vui lòng nhập tên khác.</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 font-medium">Rộng (mm)</label>
                                    <input
                                        className="input input-sm input-bordered w-full"
                                        type="number"
                                        value={newProductForm.width}
                                        onChange={(e) => setNewProductForm((prev) => ({ ...prev, width: +e.target.value }))}
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 font-medium">Cao (mm)</label>
                                    <input
                                        className="input input-sm input-bordered w-full"
                                        type="number"
                                        value={newProductForm.height}
                                        onChange={(e) => setNewProductForm((prev) => ({ ...prev, height: +e.target.value }))}
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 font-medium">Dày (mm)</label>
                                    <input
                                        className="input input-sm input-bordered w-full"
                                        type="number"
                                        value={newProductForm.thickness}
                                        onChange={(e) => setNewProductForm((prev) => ({ ...prev, thickness: +e.target.value }))}
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 font-medium">Diện tích (m²)</label>
                                    <div className="input input-sm bg-gray-100 flex items-center">{((newProductForm.width * newProductForm.height) / 1_000_000).toFixed(2)}</div>
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
                <button className="btn btn-secondary" onClick={() => router.back()}>
                    ◀ Quay lại
                </button>
                <button className="btn btn-primary" onClick={handleSave}>
                    Tạo đơn hàng mua
                </button>
            </div>
        </div>
    );
};

export default PurchaseOrderCreatePage;
