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
        orderItems: OrderItem[];
    }>({
        customer: '',
        address: '',
        phone: '',
        orderDate: '',
        orderCode: '',
        discount: 0,
        status: '',
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
                orderItems: data.products,
            });
            const glassList = await getGlassStructures();
            setGlassStructures(glassList);
        };
        fetchData();
    }, [id]);

    const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
        const updatedItems = [...form.orderItems];
        updatedItems[index] = {
            ...updatedItems[index],
            [field]: field === 'productName' || field === 'productCode' ? value.toString() : +value,
        };
        setForm((prev) => ({ ...prev, orderItems: updatedItems }));
    };

    const addItem = () => {
        setForm((prev) => ({
            ...prev,
            orderItems: [
                ...prev.orderItems,
                {
                    id: Date.now(),
                    productId: 0,
                    productName: '',
                    productCode: '',
                    width: 0,
                    height: 0,
                    thickness: 0,
                    quantity: 1,
                    unitPrice: 0,
                },
            ],
        }));
    };

    const handleSaveProduct = async () => {
        try {
            if (isProductNameDuplicate) {
                alert('Tên sản phẩm đã tồn tại. Vui lòng nhập tên khác.');
                return;
            }

            const regex = /^Kính .+ phút, KT: \d+\*\d+\*\d+ mm, .+$/;
            if (!regex.test(newProductForm.productName)) {
                alert('Tên sản phẩm không đúng định dạng. Ví dụ: "Kính EI60 phút, KT: 300*500*30 mm, VNG-MK cữ kính đứng"');
                return;
            }

            if (!newProductForm.productName.trim()) {
                alert('Vui lòng nhập tên sản phẩm!');
                return;
            }

            const isExisted = await checkProductNameExists(newProductForm.productName);
            if (isExisted) {
                alert('Tên sản phẩm đã tồn tại, vui lòng chọn tên khác!');
                return;
            }

            if (!newProductForm.glassStructureId) {
                alert('Vui lòng chọn cấu trúc kính!');
                return;
            }

            const payload = {
                productName: newProductForm.productName,
                width: newProductForm.width.toString(),
                height: newProductForm.height.toString(),
                thickness: newProductForm.thickness,
                uom: 'Tấm',
                productType: 'Thành Phẩm',
                unitPrice: 0,
                glassStructureId: newProductForm.glassStructureId,
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

    const handleBack = () => router.back();
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
                    <select className="select select-bordered w-full" value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
                        <option value="Chưa thực hiện">Chưa thực hiện</option>
                        <option value="Đang thực hiện">Đang thực hiện</option>
                        <option value="Hoàn thành">Hoàn thành</option>
                        <option value="Đã huỷ">Đã huỷ</option>
                    </select>
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
                        <div className="border rounded-lg p-4 mb-6 bg-gray-50">
                            <h4 className="text-lg font-semibold mb-2">Thêm sản phẩm mới</h4>
                            <p className="text-sm text-gray-500 italic mb-2">
                                ⚠️ Tên sản phẩm phải theo định dạng: <strong>Kính [loại] phút, KT: [rộng]*[cao]*[dày] mm, [mô tả thêm]</strong>
                                <br />
                                <span>
                                    Ví dụ: <code>Kính EI60 phút, KT: 300*500*30 mm, VNG-MK cữ kính đứng</code>
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

                                <div className="md:col-span-2">
                                    <label className="block mb-1 font-medium">Cấu trúc kính</label>
                                    <AsyncSelect
                                        cacheOptions
                                        defaultOptions
                                        placeholder="Tìm cấu trúc kính..."
                                        value={
                                            glassStructures
                                                .filter((gs) => gs.id === newProductForm.glassStructureId)
                                                .map((gs) => ({
                                                    label: gs.productName,
                                                    value: gs.id,
                                                }))[0] || null
                                        }
                                        loadOptions={(inputValue, callback) => {
                                            const filtered = glassStructures
                                                .filter((gs) => gs.productName.toLowerCase().includes(inputValue.toLowerCase()))
                                                .map((gs) => ({
                                                    label: gs.productName,
                                                    value: gs.id,
                                                }));
                                            callback(filtered);
                                        }}
                                        onChange={(option) => {
                                            setNewProductForm((prev) => ({
                                                ...prev,
                                                glassStructureId: option ? option.value : undefined,
                                            }));
                                        }}
                                        styles={{ container: (base) => ({ ...base, width: '100%' }) }}
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1 font-medium">Diện tích (m²)</label>
                                    <div className="input input-sm bg-gray-100 flex items-center">{((newProductForm.width * newProductForm.height) / 1_000_000).toFixed(2)}</div>
                                </div>

                                <div>
                                    <label className="block mb-1 font-medium">Đơn giá (₫)</label>
                                    <div className="input input-sm bg-gray-100 flex items-center">
                                        {(() => {
                                            const area = (newProductForm.width * newProductForm.height) / 1_000_000;
                                            const structure = glassStructures.find((gs) => gs.id === newProductForm.glassStructureId);
                                            const price = (structure?.unitPrice || 0) * area;
                                            return price.toFixed(0);
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
                <button onClick={handleBack} className="btn btn-status-secondary">
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
    );
};

export default SalesOrderEditPage;
