'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface OrderItem {
    productName: string;
    productCode: string;
    width: number;
    height: number;
    thickness: number;
    quantity: number;
    unitPrice: number;
}

const SalesOrderEditPage = () => {
    const { id } = useParams();
    const router = useRouter();

    const [form, setForm] = useState<{
        customer: string;
        address: string;
        phone: string;
        orderDate: string;
        orderCode: string;
        discount: number;
        orderItems: OrderItem[];
    }>({
        customer: '',
        address: '',
        phone: '',
        orderDate: '',
        orderCode: '',
        discount: 0,
        orderItems: [],
    });

    useEffect(() => {
        const data = {
            customer: 'Nguyễn Văn A',
            address: '123 Lý Thường Kiệt',
            phone: '0987654321',
            orderDate: '2025-06-10',
            orderCode: id as string,
            discount: 10,
            orderItems: [
                {
                    id: 1,
                    productName: 'Kính cường lực 10ly',
                    productCode: 'KCL10',
                    width: 1000,
                    height: 2000,
                    thickness: 10,
                    quantity: 3,
                    unitPrice: 850000,
                },
                {
                    id: 2,
                    productName: 'Kính dán an toàn 6.38ly',
                    productCode: 'KD638',
                    width: 800,
                    height: 1600,
                    thickness: 6.38,
                    quantity: 2,
                    unitPrice: 920000,
                },
                {
                    id: 3,
                    productName: 'Kính cường lực 12ly',
                    productCode: 'KCL12',
                    width: 1200,
                    height: 2200,
                    thickness: 12,
                    quantity: 4,
                    unitPrice: 950000,
                },
                {
                    id: 4,
                    productName: 'Kính dán an toàn 8.38ly',
                    productCode: 'KD838',
                    width: 900,
                    height: 1800,
                    thickness: 8.38,
                    quantity: 3,
                    unitPrice: 980000,
                },
                {
                    id: 5,
                    productName: 'Kính hộp 5+9+5 low-e',
                    productCode: 'KH595LE',
                    width: 1000,
                    height: 2000,
                    thickness: 19,
                    quantity: 2,
                    unitPrice: 1550000,
                },
            ],
        };
        setForm(data);
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

    const handleBack = () => {
        router.back();
    };

    const removeItem = (index: number) => {
        const updatedItems = [...form.orderItems];
        updatedItems.splice(index, 1);
        setForm((prev) => ({ ...prev, orderItems: updatedItems }));
    };

    const totalQuantity = form.orderItems.reduce((sum, item) => sum + item.quantity, 0);

    const totalAmount = form.orderItems.reduce((sum, item) => {
        return sum + item.quantity * item.unitPrice;
    }, 0);

    const discountAmount = (form.discount / 100) * totalAmount;
    const finalAmount = totalAmount - discountAmount;

    const handleSave = () => {
        alert('Cập nhật thành công!');
        router.push(`/sales-order-summary/${form.orderCode}`);
    };

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
                        name="discount"
                        value={form.discount}
                        onChange={(e) => setForm((prev) => ({ ...prev, discount: parseFloat(e.target.value) }))}
                        className="input input-bordered w-full"
                        min={0}
                        max={100}
                    />
                </div>
            </div>

            <h3 className="text-xl font-semibold mb-3">Chi tiết đơn hàng</h3>

            <div className="overflow-x-auto mb-4">
                <table className="table table-zebra min-w-[1000px]">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên SP</th>
                            <th>Mã SP</th>
                            <th>Rộng (mm)</th>
                            <th>Cao (mm)</th>
                            <th>Dày (mm)</th>
                            <th>Số lượng</th>
                            <th>Đơn giá</th>
                            <th>Diện tích (m²)</th>
                            <th>Thành tiền</th>
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
                                        <input type="text" value={item.productName} onChange={(e) => handleItemChange(index, 'productName', e.target.value)} className="input input-sm" />
                                    </td>
                                    <td>
                                        <input type="text" value={item.productCode} onChange={(e) => handleItemChange(index, 'productCode', e.target.value)} className="input input-sm" />
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

            <button onClick={addItem} className="btn btn-outline btn-sm mb-6">
                + Thêm sản phẩm
            </button>

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
            </div>
        </div>
    );
};

export default SalesOrderEditPage;
