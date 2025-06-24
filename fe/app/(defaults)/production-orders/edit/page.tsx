'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface ProductionItem {
    id?: number;
    productCode: string;
    thickness: number;
    width: number;
    height: number;
    glueLayers: number;
    glassPanels: number;
    butylType: number;
    quantity: number;
}

// Mock data for production order
const mockProductionOrder = {
    id: 'PO001',
    orderDate: '2024-03-20',
    status: 'Đang sản xuất',
    items: [
        {
            id: 1,
            productCode: 'SP001',
            thickness: 6,
            width: 1000,
            height: 2000,
            glueLayers: 2,
            glassPanels: 3,
            butylType: 0.5,
            quantity: 10,
            inProgress: 5,
            completed: 2
        },
        {
            id: 2,
            productCode: 'SP002',
            thickness: 8,
            width: 1200,
            height: 1800,
            glueLayers: 1,
            glassPanels: 2,
            butylType: 0.4,
            quantity: 8,
            inProgress: 3,
            completed: 1
        }
    ]
};

const ProductionOrderEditPage = () => {
    const { id } = useParams();
    const router = useRouter();

    const [form, setForm] = useState<{
        orderDate: string;
        orderCode: string;
        status: string;
        items: ProductionItem[];
    }>({
        orderDate: '',
        orderCode: '',
        status: '',
        items: [],
    });

    useEffect(() => {
        if (!id) return;

        const order = mockProductionOrder;

        if (order) {
            setForm({
                orderDate: order.orderDate,
                orderCode: order.id,
                status: order.status,
                items: order.items.map(item => ({
                    id: item.id,
                    productCode: item.productCode,
                    thickness: item.thickness,
                    width: item.width,
                    height: item.height,
                    glueLayers: item.glueLayers,
                    glassPanels: item.glassPanels,
                    butylType: item.butylType,
                    quantity: item.quantity
                })),
            });
        }
    }, [id]);

    const handleItemChange = (index: number, field: keyof ProductionItem, value: string | number) => {
        const updatedItems = [...form.items];
        updatedItems[index] = {
            ...updatedItems[index],
            [field]: field === 'productCode' ? value.toString() : +value,
        };
        setForm((prev) => ({ ...prev, items: updatedItems }));
    };

    const addItem = () => {
        setForm((prev) => ({
            ...prev,
            items: [
                ...prev.items,
                {
                    productCode: '',
                    thickness: 0,
                    width: 0,
                    height: 0,
                    glueLayers: 1,
                    glassPanels: 2,
                    butylType: 0.4,
                    quantity: 1,
                },
            ],
        }));
    };

    const removeItem = (index: number) => {
        const updatedItems = [...form.items];
        updatedItems.splice(index, 1);
        setForm((prev) => ({ ...prev, items: updatedItems }));
    };

    const handleBack = () => {
        router.back();
    };

    const handleSave = () => {
        alert('Cập nhật thành công!');
        router.push(`/production-orders/${form.orderCode}`);
    };

    const totalQuantity = form.items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Chỉnh sửa Lệnh Sản Xuất: {id}</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block mb-1 font-medium">Ngày tạo</label>
                    <div className="p-2 bg-gray-100 rounded">{form.orderDate}</div>
                </div>
                <div>
                    <label className="block mb-1 font-medium">Mã lệnh sản xuất</label>
                    <div className="p-2 bg-gray-100 rounded">{form.orderCode}</div>
                </div>
                <div>
                    <label className="block mb-1 font-medium">Trạng thái</label>
                    <select
                        value={form.status}
                        onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
                        className="input input-bordered w-full"
                        style={{ height: '35px' }}
                    >
                        <option value="Chờ sản xuất">Chờ sản xuất</option>
                        <option value="Đang sản xuất">Đang sản xuất</option>
                        <option value="Hoàn thành">Hoàn thành</option>
                        <option value="Đã hủy">Đã hủy</option>
                    </select>
                </div>
            </div>

            <h3 className="text-xl font-semibold mb-3">Chi tiết lệnh sản xuất</h3>

            <div className="overflow-x-auto mb-4">
                <table className="table table-zebra min-w-[1000px]">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Mã SP</th>
                            <th>Độ dày (mm)</th>
                            <th>Rộng (mm)</th>
                            <th>Cao (mm)</th>
                            <th>Số lớp keo</th>
                            <th>Số tấm kính</th>
                            <th>Loại Butyl (mm)</th>
                            <th>Số lượng</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {form.items.map((item, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>
                                    <input
                                        type="text"
                                        value={item.productCode}
                                        onChange={(e) => handleItemChange(index, 'productCode', e.target.value)}
                                        className="input input-sm"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={item.thickness}
                                        onChange={(e) => handleItemChange(index, 'thickness', +e.target.value)}
                                        className="input input-sm"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={item.width}
                                        onChange={(e) => handleItemChange(index, 'width', +e.target.value)}
                                        className="input input-sm"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={item.height}
                                        onChange={(e) => handleItemChange(index, 'height', +e.target.value)}
                                        className="input input-sm"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={item.glueLayers}
                                        onChange={(e) => handleItemChange(index, 'glueLayers', +e.target.value)}
                                        className="input input-sm"
                                        min="1"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={item.glassPanels}
                                        onChange={(e) => handleItemChange(index, 'glassPanels', +e.target.value)}
                                        className="input input-sm"
                                        min="2"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={item.butylType}
                                        onChange={(e) => handleItemChange(index, 'butylType', +e.target.value)}
                                        className="input input-sm"
                                        step="0.1"
                                    />
                                </td>
                                <td>
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', +e.target.value)}
                                        className="input input-sm"
                                        min="1"
                                    />
                                </td>
                                <td>
                                    <button onClick={() => removeItem(index)} className="btn btn-sm btn-error">Xoá</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <button onClick={addItem} className="btn btn-outline btn-sm mb-6">+ Thêm sản phẩm</button>

            <div className="text-end text-sm space-y-1">
                <p><strong>Tổng số lượng:</strong> {totalQuantity}</p>
            </div>

            <div className="flex items-center gap-4 mt-4">
                <button onClick={handleBack} className="btn btn-status-secondary">◀ Quay lại</button>
                <button onClick={handleSave} className="btn btn-primary">Lưu thay đổi</button>
            </div>
        </div>
    );
};

export default ProductionOrderEditPage;