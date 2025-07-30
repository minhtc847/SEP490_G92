'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AsyncSelect from 'react-select/async';

import {
    createProductNVL,
    loadCustomerOptions,
    loadOptions,
    checkProductNameExists,
    createProduct,
    CustomerOption,
    ProductOption,
    getPurchaseOrderById,
    updatePurchaseOrder,
    UpdatePurchaseOrderDto,
} from './service';

const toPositiveInt = (v: string | number | null): number | null => {
    if (v === null || v === '') return null;
    const n = typeof v === 'string' ? Number(v) : v;
    return Number.isInteger(n) && n > 0 ? n : null;
};
const toPositiveNumber = (v: string | number | null): number | null => {
    if (v === null || v === '') return null;
    const n = typeof v === 'string' ? Number(v) : v;
    return Number.isFinite(n) && n > 0 ? n : null;
};
const PRODUCT_NAME_REGEX = /^Kính .+ KT: \d+\*\d+\*\d+ mm$/;

export type OrderItem = {
    id: number;
    productId?: number | null;
    productName: string;
    width: number | null;
    height: number | null;
    thickness: number | null;
    quantity: number;
    uom?: string;
    isFromDatabase?: boolean;
    unitPrice?: number;
};

const PurchaseOrderEditPage = () => {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();
    const orderId = Number(id);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [isCustomerLocked, setIsCustomerLocked] = useState(false);
    const [customerNames, setCustomerNames] = useState<string[]>([]);
    const [isCustomerNameDuplicate, setIsCustomerNameDuplicate] = useState(false);
    const [productNames, setProductNames] = useState<string[]>([]);
    const [isProductNameDuplicate, setIsProductNameDuplicate] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null);
    const [showAddProductForm, setShowAddProductForm] = useState(false);
    const [newProductForm, setNewProductForm] = useState({
        productName: '',
        width: null as number | null,
        height: null as number | null,
        thickness: null as number | null,
        quantity: 1,
    });

    const [newMaterialProductForm, setNewMaterialProductForm] = useState({
        productName: '',
        width: 0,
        height: 0,
        thickness: 0,
        uom: '',
    });

    const [isProductNameDuplicateNVL, setIsProductNameDuplicateNVL] = useState(false);

    const [form, setForm] = useState({
        customer: '',
        description: '',
        orderCode: '',
        status: '',
        createdDate: '',
        items: [] as OrderItem[],
    });

    useEffect(() => {
        (async () => {
            try {
                const po = await getPurchaseOrderById(orderId);
                setForm({
                    customer: po.customerName ?? '',
                    description: po.description ?? '',
                    orderCode: po.code ?? '',
                    status: po.status ?? 'Chưa thực hiện',
                    createdDate: po.date ? new Date(po.date).toISOString().split('T')[0] : '',
                    items: po.purchaseOrderDetails.map((d, idx) => ({
                        id: Date.now() + idx,
                        productId: d.productId ?? null,
                        productName: d.productName ?? '',
                        width: d.width ? Number(d.width) : null,
                        height: d.height ? Number(d.height) : null,
                        thickness: d.thickness ? Number(d.thickness) : null,
                        quantity: d.quantity ?? 1,
                        isFromDatabase: !!d.productId,
                    })),
                });
            } catch (err: any) {
                setError(err.message || 'Lỗi tải dữ liệu');
            } finally {
                setLoading(false);
            }
        })();
    }, [orderId]);

    useEffect(() => {
        import('./service').then(async (svc) => {
            const [allCus, allProds] = await Promise.all([svc.getAllCustomerNames(), svc.getAllProductNames()]);
            setCustomerNames(allCus);
            setProductNames(allProds);
        });
    }, []);

    const handleCustomerNameChange = (v: string) => {
        const dup = customerNames.includes(v.trim()) && v.trim() !== form.customer;
        setIsCustomerNameDuplicate(dup);
        setForm((f) => ({ ...f, customer: v }));
    };

    const handleItemChange = (idx: number, field: keyof OrderItem, val: string | number | null) => {
        setForm((f) => {
            const items = [...f.items];
            items[idx] = { ...items[idx], [field]: field === 'productName' ? String(val) : val === '' ? null : Number(val) } as OrderItem;
            return { ...f, items };
        });
    };

    const removeItem = (idx: number) => setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

    const handleProductNameChange = (name: string) => {
        setIsProductNameDuplicate(productNames.includes(name.trim()));
        setNewProductForm((p) => ({ ...p, productName: name }));
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
                uom: p.uom ?? 'Tấm',
                isFromDatabase: true,
            };

            setForm((f) => ({ ...f, items: [...f.items, newItem] }));
            setShowAddProductForm(false);
            setNewMaterialProductForm({ productName: '', width: 0, height: 0, thickness: 0, uom: '' });

            alert(`Đã tạo sản phẩm thành công: ${p.productName}`);
        } catch (err: any) {
            alert(err.message || 'Lỗi tạo sản phẩm');
        }
    };

    const handleMaterialProductNameChange = async (val: string) => {
        const exists = await checkProductNameExists(val.trim());
        setIsProductNameDuplicateNVL(exists);
        setNewMaterialProductForm((prev) => ({ ...prev, productName: val }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            const products: UpdatePurchaseOrderDto['products'] = form.items.map((it) => ({
                productId: it.productId ?? undefined,
                productName: it.productName.trim(),
                width: toPositiveNumber(it.width),
                height: toPositiveNumber(it.height),
                thickness: toPositiveNumber(it.thickness),
                quantity: toPositiveInt(it.quantity) ?? 1,
            }));

            const dto: UpdatePurchaseOrderDto = {
                customerName: form.customer.trim(),
                description: form.description,
                status: form.status,
                products,
            };

            await updatePurchaseOrder(orderId, dto);
            alert('Cập nhật thành công!');
            router.push(`/purchase-order/${orderId}`);
        } catch (err: any) {
            console.error('Update PO error:', err?.response?.data || err);
            alert(err.message || 'Cập nhật thất bại');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-6">Đang tải...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold">Chỉnh sửa đơn hàng mua</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block mb-1 font-medium">Tên nhà cung cấp</label>
                    <input disabled={true} className="input input-bordered w-full" value={form.customer} onChange={(e) => handleCustomerNameChange(e.target.value)} />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Ngày tạo</label>
                    <input className="input input-bordered w-full bg-gray-100" value={form.createdDate} readOnly />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Mã đơn hàng</label>
                    <input className="input input-bordered w-full" value={form.orderCode} readOnly />
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

            <div className="overflow-x-auto">
                <table className="w-full border-collapse border text-sm mb-6">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2">STT</th>
                            <th className="border p-2">Tên SP</th>
                            {/* <th className="border p-2">Rộng (mm)</th>
                            <th className="border p-2">Cao (mm)</th>
                            <th className="border p-2">Dày (mm)</th> */}
                            <th className="border p-2">Số lượng</th>
                            <th className="border p-2">Đơn vị tính</th>
                            {/* <th className="border p-2">Diện tích (m²)</th> */}
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

                                    {/* <td className="border p-2 text-right">{width.toLocaleString()}</td>

                                    <td className="border p-2 text-right">{height.toLocaleString()}</td>

                                    <td className="border p-2 text-right">{(it.thickness ?? 0).toLocaleString()}</td> */}

                                    {/* cột chỉnh số lượng */}
                                    <td className="border p-2 text-right">
                                        <input type="number" className="input input-xs w-20" value={it.quantity} min={1} onChange={(e) => handleItemChange(idx, 'quantity', +e.target.value)} />
                                    </td>

                                    <td className="border p-2">{it.uom || 'Tấm'}</td>

                                    {/* <td className="border p-2 text-right">{areaM2.toFixed(2)}</td> */}

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
                                uom: p.uom ?? 'Tấm',
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
                <button className="btn btn-secondary" onClick={() => router.back()}>
                    ◀ Quay lại
                </button>
                <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
            </div>
        </div>
    );
};

export default PurchaseOrderEditPage;
