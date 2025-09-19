'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AsyncSelect from 'react-select/async';

import {
    deletePurchaseOrder,
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
import ProtectedRoute from '@/components/auth/ProtectedRoute';

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

    const STATUS_OPTIONS = [
        { value: 'Pending', label: 'Chờ đặt hàng' },
        { value: 'Ordered', label: 'Đã đặt hàng' },
        { value: 'Imported', label: 'Đã nhập hàng' },
        { value: 'Cancelled', label: 'Đã hủy' },
    ];

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
                    status: po.status ?? 'Pending',
                    createdDate: po.date ? new Date(po.date).toISOString().split('T')[0] : '',
                    items: po.purchaseOrderDetails.map((d, idx) => ({
                        id: Date.now() + idx,
                        productId: d.productId ?? null,
                        productName: d.productName ?? '',
                        width: d.width ? Number(d.width) : null,
                        height: d.height ? Number(d.height) : null,
                        thickness: d.thickness ? Number(d.thickness) : null,
                        quantity: d.quantity ?? 1,
                        unitPrice: d.unitPrice ?? 0,
                        uom: d.unit ?? 'Tấm',
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
                unitPrice: it.unitPrice ?? 0,
                totalPrice: (it.unitPrice ?? 0) * (toPositiveInt(it.quantity) ?? 1),
                uom: it.uom ?? 'Tấm',
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
        <ProtectedRoute requiredRole={[1,2]}>

        <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Chỉnh sửa đơn hàng mua: {orderId}</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block mb-1 font-medium">Tên nhà cung cấp</label>
                    <div className="p-2 bg-gray-100 rounded">{form.customer}</div>
                </div>
                <div>
                    <label className="block mb-1 font-medium">Ngày tạo</label>
                    <div className="p-2 bg-gray-100 rounded">{form.createdDate}</div>
                </div>
                <div>
                    <label className="block mb-1 font-medium">Mã đơn hàng</label>
                    <div className="p-2 bg-gray-100 rounded">{form.orderCode}</div>
                </div>
                <div>
                    <label className="block mb-1 font-medium">Trạng thái</label>
                    <select className="select select-bordered w-full" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col-span-2">
                    <label className="block mb-1 font-medium">Mô tả / Ghi chú</label>
                    <textarea className="textarea textarea-bordered w-full" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                </div>
            </div>

            <h3 className="text-xl font-semibold mb-3">Chi tiết đơn hàng</h3>

            <div className="overflow-x-auto mb-4">
                <table className="table table-zebra min-w-[1000px]">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên sản phẩm</th>
                            <th>Số lượng</th>
                            <th>Đơn giá (₫)</th>
                            <th>Đơn vị tính</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {form.items.map((it, idx) => {
                            return (
                                <tr key={it.id}>
                                    <td>{idx + 1}</td>
                                    <td>{it.productName}</td>
                                    <td>
                                        <input type="number" className="input input-sm" value={it.quantity} min={1} onChange={(e) => handleItemChange(idx, 'quantity', +e.target.value)} />
                                    </td>
                                    <td>
                                        <input 
                                            type="number" 
                                            className="input input-sm" 
                                            value={it.unitPrice || 0} 
                                            min={0} 
                                            onChange={(e) => handleItemChange(idx, 'unitPrice', +e.target.value)} 
                                        />
                                    </td>
                                    <td>{it.uom || 'Tấm'}</td>
                                    <td>
                                        <button className="btn btn-sm btn-error" onClick={() => removeItem(idx)}>
                                            Xoá
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="flex gap-4 mb-4">
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

            <div className="text-end text-sm space-y-1">
                <p>
                    <strong>Tổng số lượng:</strong> {form.items.reduce((sum, item) => sum + item.quantity, 0)}
                </p>
                <p>
                    <strong>Tổng tiền hàng:</strong> {form.items.reduce((sum, item) => sum + ((item.unitPrice || 0) * item.quantity), 0).toLocaleString()} ₫
                </p>
            </div>

            <div className="flex items-center gap-4 mt-4">
                <button onClick={() => router.back()} className="btn btn-status-secondary">
                    ◀ Quay lại
                </button>
                <button onClick={handleSave} disabled={saving} className="btn btn-primary">
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
                <button
                    className="btn btn-danger"
                    onClick={async () => {
                        const confirmed = confirm(`Bạn có chắc muốn xoá đơn hàng "${form.description}" không?`);
                        if (!confirmed) return;

                        try {
                            await deletePurchaseOrder(orderId);
                            alert(`Xoá thành công: Đơn hàng ${form.orderCode} – ${form.description || '(Không có mô tả)'}`);
                            router.push('/purchase-order');
                        } catch (err: any) {
                            alert(err.message || 'Xoá thất bại. Vui lòng thử lại');
                        }
                    }}
                >
                    🗑 Xoá đơn hàng
                </button>
            </div>
        </div>
        </ProtectedRoute>

    );
};

export default PurchaseOrderEditPage;
