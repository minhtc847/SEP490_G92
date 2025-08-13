'use client';

import AsyncSelect from 'react-select/async';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    createProduct,
    checkProductNameExists,
    getOrderDetailById,
    updateOrderDetailById,
    getGlassStructures,
    OrderItem,
    OrderDetailDto,
    loadOptions,
    checkProductCodeExists,
    deleteOrderById,
} from '@/app/(defaults)/sales-order/edit/[id]/service';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

type GlassStructure = {
    id: number;
    category: string;
};

const SalesOrderEditPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [glassStructures, setGlassStructures] = useState<{ id: number; productName: string; unitPrice: number }[]>([]);
    const [productNames, setProductNames] = useState<string[]>([]);
    const [isProductNameDuplicate, setIsProductNameDuplicate] = useState(false);
    const [showAddProductForm, setShowAddProductForm] = useState(false);
    const [newProductForm, setNewProductForm] = useState({
        productName: '',
        width: 0,
        height: 0,
        thickness: 0,
        quantity: 1,
        unitPrice: 0,
        glassStructureId: undefined as number | undefined,
    });

    const [form, setForm] = useState<{
        customer: string;
        address: string;
        phone: string;
        orderDate: string;
        orderCode: string;
        discount: number;
        status: string;
        deliveryStatus: string;
        orderItems: OrderItem[];
    }>({
        customer: '',
        address: '',
        phone: '',
        orderDate: '',
        orderCode: '',
        discount: 0,
        status: 'Pending',
        deliveryStatus: 'NotShipped',
        orderItems: [],
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            const data: OrderDetailDto = await getOrderDetailById(Number(id));
            setForm({
                customer: data.customerName,
                address: data.address,
                phone: data.phone,
                orderDate: new Date(data.orderDate).toLocaleDateString(),
                orderCode: data.orderCode,
                discount: data.discount * 100,
                status: data.status,
                deliveryStatus: data.deliveryStatus,
                orderItems: data.products,
            });
            const glassList = await getGlassStructures();
            setGlassStructures(glassList);
        };
        fetchData();
    }, [id]);

    const STATUS_OPTIONS = [
        { value: 'Pending', label: 'Chưa thực hiện' },
        { value: 'Processing', label: 'Đang thực hiện' },
        { value: 'Delivered', label: 'Hoàn thành' },
        { value: 'Cancelled', label: 'Đã hủy' },
    ];

    const DELIVERY_STATUS_OPTIONS = [
        { value: 'NotDelivered', label: 'Chưa giao' },
        { value: 'Delivering', label: 'Đã giao một phần' },
        { value: 'FullyDelivered', label: 'Đã giao đầy đủ' },
        { value: 'Cancelled', label: 'Trả hàng' },
    ];

    const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
        const updatedItems = [...form.orderItems];
        updatedItems[index] = {
            ...updatedItems[index],
            [field]: field === 'productName' || field === 'productCode' ? value.toString() : +value,
        };
        setForm((prev) => ({ ...prev, orderItems: updatedItems }));
    };

    const handleSaveProduct = async () => {
        try {
            if (isProductNameDuplicate) {
                alert('Tên sản phẩm đã tồn tại. Vui lòng nhập tên khác.');
                return;
            }

            const regex = /^Kính .+ phút, KT: \d+\*\d+\*\d+ mm, .+$/;
            if (!regex.test(newFinishedProductForm.productName)) {
                alert('Tên sản phẩm không đúng định dạng. Ví dụ: "Kính EI60 phút, KT: 300*500*30 mm, VNG-MK cữ kính đứng"');
                return;
            }

            if (!newFinishedProductForm.productName.trim()) {
                alert('Vui lòng nhập tên sản phẩm!');
                return;
            }

            const isExisted = await checkProductNameExists(newFinishedProductForm.productName);
            if (isExisted) {
                alert('Tên sản phẩm đã tồn tại, vui lòng chọn tên khác!');
                return;
            }

            if (!newFinishedProductForm.glassStructureId) {
                alert('Vui lòng chọn cấu trúc kính!');
                return;
            }

            const payload = {
                productName: newFinishedProductForm.productName,
                width: newFinishedProductForm.width.toString(),
                height: newFinishedProductForm.height.toString(),
                thickness: newFinishedProductForm.thickness,
                uom: 'Tấm',
                productType: 'Thành Phẩm',
                unitPrice: 0,
                glassStructureId: newFinishedProductForm.glassStructureId,
            };

            const newProduct = await createProduct(payload);

            setForm((prev) => ({
                ...prev,
                orderItems: [
                    ...prev.orderItems,
                    {
                        id: Date.now(),
                        productId: newProduct.id,
                        productName: newProduct.productName,
                        productCode: '', // Ensure productCode is present
                        width: Number(newProduct.width),
                        height: Number(newProduct.height),
                        thickness: Number(newProduct.thickness),
                        quantity: 1,
                        unitPrice: Number(newProduct.unitPrice),
                        glassStructureId: newProduct.glassStructureId,
                        isFromDatabase: true,
                    },
                ],
            }));

            setShowAddProductForm(false);
            setNewProductForm({
                productName: '',
                width: 0,
                height: 0,
                thickness: 0,
                quantity: 1,
                unitPrice: 0,
                glassStructureId: undefined,
            });
        } catch (err) {
            console.error('Lỗi thêm sản phẩm:', err);
            alert('Thêm sản phẩm thất bại!');
        }
    };

    const [newFinishedProductForm, setNewFinishedProductForm] = useState({
        productName: '',
        width: 0,
        height: 0,
        thickness: 0,
        unitPrice: 0,
        glassStructureId: undefined as number | undefined,
    });

    const removeItem = (index: number) => {
        const updatedItems = [...form.orderItems];
        updatedItems.splice(index, 1);
        setForm((prev) => ({ ...prev, orderItems: updatedItems }));
    };

    const handleProductNameChange = (value: string) => {
        const isDuplicate = productNames.includes(value.trim());
        setIsProductNameDuplicate(isDuplicate);
        setNewProductForm((prev) => ({
            ...prev,
            productName: value,
        }));
    };

    function extractDimensionsFromName(name: string): { width: number; height: number; thickness: number } | null {
        const match = name.match(/KT:\s*(\d+)\*(\d+)\*(\d+)\s*mm/i);
        if (!match) return null;

        const [, width, height, thickness] = match;
        return {
            width: parseInt(width),
            height: parseInt(height),
            thickness: parseInt(thickness),
        };
    }

    const handleFinishedProductNameChange = async (val: string) => {
        const trimmed = val.trim();
        const exists = await checkProductNameExists(trimmed);

        setIsProductNameDuplicate(exists);

        const dims = extractDimensionsFromName(trimmed);

        setNewFinishedProductForm((prev) => ({
            ...prev,
            productName: val,
            width: dims?.width ?? prev.width,
            height: dims?.height ?? prev.height,
            thickness: dims?.thickness ?? prev.thickness,
        }));
    };

    const existingProductIds = new Set(form.orderItems.map((item) => item.productId));

    const handleDelete = async () => {
        const confirmDelete = confirm('Bạn có chắc chắn muốn xoá đơn hàng này không?');
        if (!confirmDelete) return;

        try {
            await deleteOrderById(Number(id));
            alert('Đã xoá đơn hàng thành công!');
            router.push('/sales-order');
        } catch (err: any) {
            console.error('Lỗi khi xoá:', err.response?.data || err.message);
            alert('Xoá thất bại! ' + (err.response?.data?.title || err.message));
        }
    };

    const handleSave = async () => {
        try {
            for (const item of form.orderItems) {
                if (item.productId === 0) {
                    const exists = await checkProductCodeExists(item.productCode);
                    if (exists) {
                        alert(`Mã sản phẩm "${item.productCode}" đã tồn tại. Vui lòng sửa lại mã hoặc tạo mã tự động.`);
                        return;
                    }
                }
            }

            const payload = {
                customerName: form.customer,
                address: form.address,
                phone: form.phone,
                discount: form.discount / 100,
                status: form.status,
                deliveryStatus: form.deliveryStatus,
                products: form.orderItems.map((item) => ({
                    productId: item.productId,
                    productCode: item.productCode,
                    productName: item.productName,
                    height: item.height.toString(),
                    width: item.width.toString(),
                    thickness: item.thickness,
                    unitPrice: item.unitPrice,
                    quantity: item.quantity,
                    glassStructureId: item.glassStructureId,
                })),
            };

            await updateOrderDetailById(Number(id), payload);
            alert('Cập nhật thành công!');
            router.push(`/sales-order/${id}`);
        } catch (err: any) {
            console.error('Lỗi cập nhật:', err.response?.data || err.message);
            alert('Cập nhật thất bại! ' + (err.response?.data?.title || err.message));
        }
    };

    const totalQuantity = form.orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = form.orderItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const discountAmount = (form.discount / 100) * totalAmount;
    const finalAmount = totalAmount - discountAmount;

    return (
        <ProtectedRoute requiredRole={[1, 2]}>

        <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Chỉnh sửa Đơn Hàng: {id}</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block mb-1 font-medium">Tên khách hàng</label>
                    <div className="p-2 bg-gray-100 rounded">{form.customer}</div>
                </div>
                <div>
                    <label className="block mb-1 font-medium">Địa chỉ</label>
                    <div className="p-2 bg-gray-100 rounded">{form.address}</div>
                </div>
                <div>
                    <label className="block mb-1 font-medium">Số điện thoại</label>
                    <div className="p-2 bg-gray-100 rounded">{form.phone}</div>
                </div>
                <div>
                    <label className="block mb-1 font-medium">Ngày đặt</label>
                    <div className="p-2 bg-gray-100 rounded">{form.orderDate}</div>
                </div>
                <div>
                    <label className="block mb-1 font-medium">Mã đơn hàng</label>
                    <div className="p-2 bg-gray-100 rounded">{form.orderCode}</div>
                </div>
                <div>
                    <label className="block mb-1 font-medium">Chiết khấu (%)</label>
                    <input
                        style={{ height: '35px' }}
                        type="number"
                        value={form.discount}
                        onChange={(e) => setForm((prev) => ({ ...prev, discount: parseFloat(e.target.value) }))}
                        className="input input-bordered w-full"
                        min={0}
                        max={100}
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Trạng thái</label>
                    <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s.value} value={s.value}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <div>
                        <label className="block mb-1 font-medium">Trạng thái giao hàng</label>
                        <select value={form.deliveryStatus} onChange={(e) => setForm((prev) => ({ ...prev, deliveryStatus: e.target.value }))} className="input input-bordered w-full">
                            {DELIVERY_STATUS_OPTIONS.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <h3 className="text-xl font-semibold mb-3">Chi tiết đơn hàng</h3>

            <div className="overflow-x-auto mb-4">
                <table className="table table-zebra min-w-[1000px]">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên SP</th>
                            <th>Rộng</th>
                            <th>Cao</th>
                            <th>Dày</th>
                            <th>Số lượng</th>
                            <th>Đơn giá</th>
                            <th>Diện tích (m²)</th>
                            <th>Thành tiền</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {form.orderItems.map((item, index) => {
                            const width = Number(item.width) || 0;
                            const height = Number(item.height) || 0;
                            const area = (width * height) / 1_000_000;
                            const total = (item.quantity ?? 0) * (item.unitPrice ?? 0);

                            return (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.productName}</td>
                                    <td className="text-right">{width.toLocaleString()}</td>
                                    <td className="text-right">{height.toLocaleString()}</td>
                                    <td className="text-right">{(item.thickness ?? 0).toLocaleString()}</td>
                                    <td>
                                        <input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', +e.target.value)} className="input input-sm" />
                                    </td>
                                    <td className="text-right">{(item.unitPrice ?? 0).toLocaleString()}</td>
                                    <td className="text-right">{area.toFixed(2)}</td>
                                    <td className="text-right">{total.toLocaleString()} đ</td>
                                    <td>
                                        <button onClick={() => removeItem(index)} className="btn btn-sm btn-error">
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
                    <AsyncSelect
                        cacheOptions
                        defaultOptions
                        value={selectedProduct}
                        loadOptions={(inputValue) =>
                            loadOptions(
                                inputValue,
                                form.orderItems.map((i) => i.productId),
                            )
                        }
                        placeholder="Thêm sản phẩm có sẵn..."
                        onChange={(option) => {
                            if (!option) return;
                            const p = option.product;

                            const newItem: OrderItem = {
                                id: Date.now(),
                                productId: p.id,
                                productCode: p.productCode,
                                productName: p.productName,
                                height: Number(p.height),
                                width: Number(p.width),
                                thickness: Number(p.thickness),
                                quantity: 1,
                                unitPrice: Number(p.unitPrice),
                                glassStructureId: p.glassStructureId,
                            };

                            setForm((prev) => ({
                                ...prev,
                                orderItems: [...prev.orderItems, newItem],
                            }));
                            setSelectedProduct(null);
                        }}
                    />
                </div>
                <div>
                    <button onClick={() => setShowAddProductForm(true)} className="btn btn-outline btn-sm mb-6">
                        + Thêm sản phẩm
                    </button>
                    {showAddProductForm && (
                        <div>
                            <div>
                                <h4 className="text-lg font-semibold mb-2">Thêm sản phẩm mới</h4>
                                <p className="text-sm text-gray-500 italic mb-2">
                                    ⚠️ Tên sản phẩm phải theo định dạng: <strong>Kính [loại] phút, KT: [rộng]*[cao]*[dày] mm, [mô tả thêm]</strong>
                                    <br />
                                    <span>
                                        Ví dụ: <code>Kính EI60 phút, KT: 300*500*30 mm, VNG-MK cữ kính đứng</code>
                                    </span>
                                </p>

                                <label className="block mb-1 font-medium">Tên sản phẩm</label>
                                <input
                                    className="input input-bordered w-full"
                                    value={newFinishedProductForm.productName}
                                    onChange={(e) => handleFinishedProductNameChange(e.target.value)}
                                    placeholder="VD: Kính EI60 phút, KT: 300*500*30 mm, VNG-MK cữ kính đứng"
                                />
                                {isProductNameDuplicate && <p className="text-red-500 text-sm">Tên sản phẩm đã tồn tại. Vui lòng nhập tên khác.</p>}
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block mb-1 font-medium">Rộng (mm)</label>
                                    <input
                                        disabled={true}
                                        type="number"
                                        className="input input-bordered w-full"
                                        value={newFinishedProductForm.width}
                                        onChange={(e) => setNewFinishedProductForm((p) => ({ ...p, width: +e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 font-medium">Cao (mm)</label>
                                    <input
                                        disabled={true}
                                        type="number"
                                        className="input input-bordered w-full"
                                        value={newFinishedProductForm.height}
                                        onChange={(e) => setNewFinishedProductForm((p) => ({ ...p, height: +e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 font-medium">Dày (mm)</label>
                                    <input
                                        disabled={true}
                                        type="number"
                                        className="input input-bordered w-full"
                                        value={newFinishedProductForm.thickness}
                                        onChange={(e) => setNewFinishedProductForm((p) => ({ ...p, thickness: +e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block mb-1 font-medium">Cấu trúc kính</label>
                                <AsyncSelect
                                    cacheOptions
                                    defaultOptions
                                    loadOptions={(input, cb) =>
                                        cb(glassStructures.filter((g) => g.productName.toLowerCase().includes(input.toLowerCase())).map((g) => ({ label: g.productName, value: g.id })))
                                    }
                                    onChange={(opt) => setNewFinishedProductForm((p) => ({ ...p, glassStructureId: opt ? opt.value : undefined }))}
                                    value={glassStructures.filter((g) => g.id === newFinishedProductForm.glassStructureId).map((g) => ({ label: g.productName, value: g.id }))[0] || null}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 font-medium">Diện tích (m²)</label>
                                    <div className="input input-bordered bg-gray-100">{((newFinishedProductForm.width * newFinishedProductForm.height) / 1_000_000).toFixed(2)}</div>
                                </div>
                                <div>
                                    <label className="block mb-1 font-medium">Đơn giá (₫)</label>
                                    <div className="input input-bordered bg-gray-100">
                                        {(() => {
                                            const area = (newFinishedProductForm.width * newFinishedProductForm.height) / 1_000_000;
                                            const s = glassStructures.find((g) => g.id === newFinishedProductForm.glassStructureId);
                                            return ((s?.unitPrice || 0) * area).toFixed(0);
                                        })()}
                                    </div>
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
                    <strong>Tổng số lượng:</strong> {totalQuantity}
                </p>
                <p>
                    <strong>Tổng tiền hàng:</strong> {totalAmount.toLocaleString()} ₫
                </p>
                <p>
                    <strong>Chiết khấu:</strong> {discountAmount.toLocaleString()} ₫ ({form.discount}%)
                </p>
                <p className="text-base font-bold">
                    Thành tiền sau chiết khấu: <span className="text-green-600">{finalAmount.toLocaleString()} ₫</span>
                </p>
            </div>

            <div className="flex items-center gap-4 mt-4">
                <button onClick={() => router.back()} className="btn btn-status-secondary">
                    ◀ Quay lại
                </button>
                <button onClick={handleSave} className="btn btn-primary">
                    Lưu thay đổi
                </button>
                <button onClick={handleDelete} className="btn btn-danger">
                    🗑 Xoá đơn hàng
                </button>
            </div>
        </div>
        </ProtectedRoute>

    );
};

export default SalesOrderEditPage;
