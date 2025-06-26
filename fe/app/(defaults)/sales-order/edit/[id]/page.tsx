'use client';


import AsyncSelect from 'react-select/async';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getOrderDetailById, updateOrderDetailById, getGlassStructures, OrderItem, OrderDetailDto, loadOptions, checkProductCodeExists } from '@/app/(defaults)/sales-order/edit/[id]/service';


type GlassStructure = {
    id: number;
    category: string;
};


const SalesOrderEditPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [glassStructures, setGlassStructures] = useState<{ id: number; productName: string }[]>([]);


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


    const removeItem = (index: number) => {
        const updatedItems = [...form.orderItems];
        updatedItems.splice(index, 1);
        setForm((prev) => ({ ...prev, orderItems: updatedItems }));
    };


    const handleBack = () => router.back();
    const existingProductIds = new Set(form.orderItems.map((item) => item.productId));


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
                            const area = (Number(item.width) * Number(item.height)) / 1_000_000;
                            const total = item.quantity * item.unitPrice;


                            return (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td className="flex items-center gap-2">
                                        <input
                                            disabled={item.productId !== 0}
                                            type="text"
                                            value={item.productCode}
                                            onChange={async (e) => {
                                                const value = e.target.value;
                                                handleItemChange(index, 'productCode', value);


                                                if (item.productId === 0) {
                                                    const exists = await checkProductCodeExists(value);
                                                    if (exists) {
                                                        alert(`Mã sản phẩm "${value}" đã tồn tại. Hãy nhập mã khác hoặc bấm tạo tự động.`);
                                                    }
                                                }
                                            }}
                                            className="input input-sm w-32"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            disabled={item.productId !== 0}
                                            type="text"
                                            value={item.productName}
                                            onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                                            className="input input-sm"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            disabled={item.productId !== 0}
                                            type="number"
                                            value={item.width}
                                            onChange={(e) => handleItemChange(index, 'width', +e.target.value)}
                                            className="input input-sm"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            disabled={item.productId !== 0}
                                            type="number"
                                            value={item.height}
                                            onChange={(e) => handleItemChange(index, 'height', +e.target.value)}
                                            className="input input-sm"
                                        />
                                    </td>
                                    <td>
                                        <input
                                            disabled={item.productId !== 0}
                                            type="number"
                                            value={item.thickness}
                                            onChange={(e) => handleItemChange(index, 'thickness', +e.target.value)}
                                            className="input input-sm"
                                        />
                                    </td>
                                    <td>
                                        <input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', +e.target.value)} className="input input-sm" />
                                    </td>
                                    <td>
                                        <input
                                            disabled={item.productId !== 0}
                                            type="number"
                                            value={item.unitPrice}
                                            onChange={(e) => handleItemChange(index, 'unitPrice', +e.target.value)}
                                            className="input input-sm"
                                        />
                                    </td>
                                    <td>{area.toFixed(2)}</td>
                                    <td>{total.toLocaleString()} đ</td>
                                    <td>
                                        <select className="select select-sm" value={item.glassStructureId || ''} onChange={(e) => handleItemChange(index, 'glassStructureId', +e.target.value)} disabled={item.productId !== 0}>
                                            <option value="">-- Chọn --</option>
                                            {glassStructures.map((gs) => (
                                                <option key={gs.id} value={gs.id}>
                                                    {gs.productName}
                                                </option>
                                            ))}
                                        </select>
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
                                form.orderItems.map((i) => i.productCode),
                            )
                        }
                        placeholder="Thêm sản phẩm theo mã hoặc tên"
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
                    Lưu thay đổi
                </button>
            </div>
        </div>
    );
};


export default SalesOrderEditPage;