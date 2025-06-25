'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
    CustomerOption,
    searchCustomers,
    createOrderDetail,
    OrderItem,
    checkProductCodeExists,
    getGlassStructures,
    loadOptions,
    ProductOption,
    GlassStructure,
    loadCustomerOptions,
    getNextOrderCode,
} from '@/app/(defaults)/sales-order/create/service';
import AsyncSelect from 'react-select/async';

const SalesOrderCreatePage = () => {
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            const structures = await getGlassStructures();
            setGlassStructures(structures);

            const nextCode = await getNextOrderCode();
            setForm((prev) => ({
                ...prev,
                orderCode: nextCode,
            }));
        };

        fetchData();
    }, []);

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
        orderDate: new Date().toISOString().split('T')[0],
        orderCode: '',
        discount: 0,
        status: 'Chưa thực hiện',
        orderItems: [],
    });

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

    const removeItem = (index: number) => {
        const updatedItems = [...form.orderItems];
        updatedItems.splice(index, 1);
        setForm((prev) => ({ ...prev, orderItems: updatedItems }));
    };

    const handleBack = () => router.back();

    const handleSave = async () => {
        try {
            for (const item of form.orderItems) {
                if (!item.productId || item.productId === 0) {
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
                orderCode: form.orderCode,
                orderDate: form.orderDate,
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

            const res = await createOrderDetail(payload);

            alert('Tạo đơn hàng thành công!');
            router.push(`/sales-order/${res.id}`);
        } catch (err: any) {
            console.error('Lỗi tạo đơn hàng:', err.response?.data || err.message);
            alert('Tạo đơn hàng thất bại! ' + (err.response?.data?.title || err.message));
        }
    };

    const totalQuantity = form.orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = form.orderItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const discountAmount = (form.discount / 100) * totalAmount;
    const finalAmount = totalAmount - discountAmount;
    const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null);
    const [glassStructures, setGlassStructures] = useState<GlassStructure[]>([]);
    const [isCustomerLocked, setIsCustomerLocked] = useState(false);

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Tạo đơn hàng mới</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block mb-1 font-medium">Tên khách hàng</label>
                    <input disabled={isCustomerLocked} style={{ height: '35px' }} className="input input-bordered w-full" value={form.customer} onChange={(e) => setForm((prev) => ({ ...prev, customer: e.target.value }))} />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Địa chỉ</label>
                    <input disabled={isCustomerLocked} style={{ height: '35px' }} className="input input-bordered w-full" value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Số điện thoại</label>
                    <input disabled={isCustomerLocked} style={{ height: '35px' }} className="input input-bordered w-full" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Ngày đặt</label>
                    <input disabled={isCustomerLocked} style={{ height: '35px' }} className="input input-bordered w-full bg-gray-100" type="text" value={new Date(form.orderDate).toLocaleDateString('en-US')} readOnly />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Mã đơn hàng</label>
                    <input disabled={isCustomerLocked} style={{ height: '35px' }} className="input input-bordered w-full" value={form.orderCode} onChange={(e) => setForm((prev) => ({ ...prev, orderCode: e.target.value }))} />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Chiết khấu (%)</label>
                    <input
                        style={{ height: '35px' }}
                        type="number"
                        className="input input-bordered w-full"
                        min={0}
                        max={100}
                        value={form.discount}
                        onChange={(e) => setForm((prev) => ({ ...prev, discount: parseFloat(e.target.value) }))}
                    />
                </div>
                <div>
                    <AsyncSelect
                        cacheOptions
                        defaultOptions
                        loadOptions={loadCustomerOptions}
                        placeholder="Thêm theo mã hoặc tên khách hàng"
                        onChange={(option: CustomerOption | null) => {
                            if (!option) return;
                            const c = option.customer;

                            setForm((prev) => ({
                                ...prev,
                                customer: c.customerName,
                                address: c.address,
                                phone: c.phone,
                                discount: c.discount * 100,
                            }));

                            setIsCustomerLocked(true);
                        }}
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Trạng thái</label>
                    <select style={{ height: '35px' }} className="select select-bordered w-full" value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
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
                            <th>Mã SP</th>
                            <th>Tên SP</th>
                            <th>Rộng</th>
                            <th>Cao</th>
                            <th>Dày</th>
                            <th>Số lượng</th>
                            <th>Đơn giá</th>
                            <th>Diện tích (m²)</th>
                            <th>Thành tiền</th>
                            <th>Cấu trúc kính</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {form.orderItems.map((item, index) => {
                            const area = (item.width * item.height) / 1_000_000;
                            const total = item.quantity * item.unitPrice;
                            return (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="text"
                                                value={item.productCode}
                                                onChange={async (e) => {
                                                    const value = e.target.value;
                                                    handleItemChange(index, 'productCode', value);
                                                }}
                                                className="input input-sm w-32"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const generated = `VT${Date.now().toString().slice(-5)}`;
                                                    handleItemChange(index, 'productCode', generated);
                                                }}
                                                className="btn btn-ghost btn-xs p-1"
                                                title="Tạo mã tự động"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M16.023 9.348h4.992M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                    <td>
                                        <input value={item.productName} onChange={(e) => handleItemChange(index, 'productName', e.target.value)} className="input input-sm" />
                                    </td>
                                    <td>
                                        <input type="number" value={item.width} onChange={(e) => handleItemChange(index, 'width', +e.target.value)} className="input input-sm" />
                                    </td>
                                    <td>
                                        <input type="number" value={item.height} onChange={(e) => handleItemChange(index, 'height', +e.target.value)} className="input input-sm" />
                                    </td>
                                    <td>
                                        <input type="number" value={item.thickness} onChange={(e) => handleItemChange(index, 'thickness', +e.target.value)} className="input input-sm" />
                                    </td>
                                    <td>
                                        <input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', +e.target.value)} className="input input-sm" />
                                    </td>
                                    <td>
                                        <input type="number" value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', +e.target.value)} className="input input-sm" />
                                    </td>
                                    <td>{area.toFixed(2)}</td>
                                    <td>{total.toLocaleString()} đ</td>
                                    <td>
                                        <td>
                                            <select className="select select-sm" value={item.glassStructureId || ''} onChange={(e) => handleItemChange(index, 'glassStructureId', +e.target.value)}>
                                                <option value="">-- Chọn --</option>
                                                {glassStructures.map((gs) => (
                                                    <option key={gs.id} value={gs.id}>
                                                        {gs.category}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                    </td>
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
                                form.orderItems.map((item) => item.productId),
                            )
                        }
                        placeholder="Thêm sản phẩm theo mã hoặc tên"
                        onChange={(option: ProductOption | null) => {
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
                    <button onClick={addItem} className="btn btn-outline btn-sm mb-6">
                        + Thêm sản phẩm
                    </button>
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
                    Tạo đơn hàng
                </button>
            </div>
        </div>
    );
};

export default SalesOrderCreatePage;
