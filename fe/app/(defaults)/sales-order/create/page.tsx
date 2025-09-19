'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
    createProduct,
    createOrderDetail,
    getGlassStructures,
    loadOptions,
    ProductOption,
    GlassStructure,
    loadCustomerOptions,
    getNextOrderCode,
    CustomerOption,
    checkProductNameExists,
    getAllCustomerNames,
    getAllProductNames,
} from '@/app/(defaults)/sales-order/create/service';
import AsyncSelect from 'react-select/async';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const SalesOrderCreatePage = () => {
    const router = useRouter();
    const [glassStructures, setGlassStructures] = useState<GlassStructure[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(null);
    const [isCustomerLocked, setIsCustomerLocked] = useState(false);

    const [customerNames, setCustomerNames] = useState<string[]>([]);
    const [isCustomerNameDuplicate, setIsCustomerNameDuplicate] = useState(false);

    const [productNames, setProductNames] = useState<string[]>([]);
    const [isProductNameDuplicate, setIsProductNameDuplicate] = useState(false);

    const handleCustomerNameChange = (value: string) => {
        const isDuplicate = customerNames.includes(value.trim());
        setIsCustomerNameDuplicate(isDuplicate);

        setForm((prev) => ({
            ...prev,
            customer: value,
        }));
    };

    const [newFinishedProductForm, setNewFinishedProductForm] = useState({
        productName: '',
        width: 0,
        height: 0,
        thickness: 0,
        unitPrice: 0,
        glassStructureId: undefined as number | undefined,
    });

    // Hàm sinh tên tự động từ dữ liệu form
    function generateProductName(structure: GlassStructure | undefined, width: number, height: number, thickness: number) {
        if (!structure || !width || !height || !thickness) return '';
        // Ví dụ: Kính EI60 phút, KT: 300*500*30 mm, VNG-MK cữ kính đứng
        return `Kính ${structure.productCode} phút | KT: ${width}*${height}*${thickness} mm `.trim();
    }

    // Thêm useEffect để auto tạo tên khi người dùng chọn cấu trúc + nhập kích thước
    useEffect(() => {
        const selectedStructure = glassStructures.find((gs) => gs.id === newFinishedProductForm.glassStructureId);
        if (selectedStructure && newFinishedProductForm.width && newFinishedProductForm.height && newFinishedProductForm.thickness) {
            setNewFinishedProductForm((prev) => ({
                ...prev,
                productName: generateProductName(selectedStructure, prev.width, prev.height, prev.thickness),
            }));
        }
    }, [newFinishedProductForm.width, newFinishedProductForm.height, newFinishedProductForm.thickness, newFinishedProductForm.glassStructureId, glassStructures]);

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

    type OrderItem = {
        id: number;
        productId: number;
        productName: string;
        width: number;
        height: number;
        thickness: number;
        quantity: number;
        unitPrice: number;
        glassStructureId?: number;
        isFromDatabase?: boolean;
    };

    const [form, setForm] = useState({
        customer: '',
        address: '',
        phone: '',
        orderDate: new Date().toISOString().split('T')[0],
        orderCode: '',
        discount: 0,
        status: 'Pending',
        isUpdateMisa: false,
        orderItems: [] as OrderItem[],
    });

    useEffect(() => {
        const loadInitial = async () => {
            try {
                const [code, structures, customers, products] = await Promise.all([getNextOrderCode(), getGlassStructures(), getAllCustomerNames(), getAllProductNames()]);

                setForm((prev) => ({ ...prev, orderCode: code }));
                setGlassStructures(structures);
                setCustomerNames(customers);
                setProductNames(products);
            } catch (err) {
                console.error('Lỗi load dữ liệu:', err);
            }
        };

        loadInitial();
    }, []);

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

    useEffect(() => {
        if (!glassStructures.length) return;

        const area = (newProductForm.width * newProductForm.height) / 1_000_000;
        const structure = glassStructures.find((gs) => gs.id === newProductForm.glassStructureId);
        const unitPrice = +(area * (structure?.unitPrice ?? 0)).toFixed(0);

        if (unitPrice !== newProductForm.unitPrice) {
            setNewProductForm((prev) => ({ ...prev, unitPrice }));
        }
    }, [newProductForm.width, newProductForm.height, newProductForm.glassStructureId, glassStructures]);

    const handleProductNameChange = (value: string) => {
        const isDuplicate = productNames.includes(value.trim());
        setIsProductNameDuplicate(isDuplicate);
        setNewProductForm((prev) => ({
            ...prev,
            productName: value,
        }));
    };

    const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
        const updatedItems = [...form.orderItems];
        const currentItem = updatedItems[index];

        if (currentItem.isFromDatabase && ['productName', 'width', 'height', 'thickness', 'unitPrice'].includes(field)) return;

        updatedItems[index] = {
            ...currentItem,
            [field]: field === 'productName' ? value.toString() : +value,
        };

        setForm((prev) => ({ ...prev, orderItems: updatedItems }));
    };

    const removeItem = (index: number) => {
        const updatedItems = [...form.orderItems];
        updatedItems.splice(index, 1);
        setForm((prev) => ({ ...prev, orderItems: updatedItems }));
    };

    const handleSaveProduct = async () => {
        try {
            if (isProductNameDuplicate) {
                alert('Tên sản phẩm đã tồn tại. Vui lòng nhập tên khác.');
                return;
            }

            // const regex = /^Kính .+ phút, KT: \d+\*\d+\*\d+ mm, .+$/;
            // if (!regex.test(newFinishedProductForm.productName)) {
            //     alert('Tên sản phẩm sai định dạng.\n\nVí dụ đúng: Kính EI60 phút, KT: 300*500*30 mm, VNG-MK cữ kính đứng');
            //     return;
            // }

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

    const handleSave = async () => {
        try {
            if (isCustomerNameDuplicate) {
                alert('Tên khách hàng đã tồn tại. Vui lòng nhập tên khác.');
                return;
            }

            const payload = {
                customerName: form.customer,
                address: form.address,
                phone: form.phone,
                orderCode: form.orderCode,
                orderDate: form.orderDate,
                discount: form.discount / 100,
                status: form.status,
                isUpdateMisa: form.isUpdateMisa,
                products: form.orderItems.map((item) => ({
                    productId: item.productId,
                    productCode: '',
                    productName: item.productName.trim(),
                    height: item.height?.toString() || '0',
                    width: item.width?.toString() || '0',
                    thickness: +item.thickness,
                    unitPrice: +item.unitPrice,
                    quantity: +item.quantity,
                    glassStructureId: item.glassStructureId,
                })),
            };

            const res = await createOrderDetail(payload);
            alert('Tạo đơn hàng thành công!');
            router.push(`/sales-order/${res.id}`);
        } catch (err: any) {
            console.error('Response‑data:', err?.response?.data);
            alert('Tạo đơn hàng thất bại!\n' + JSON.stringify(err?.response?.data?.errors ?? err?.response?.data, null, 2));
        }
    };

    const totalQuantity = form.orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = form.orderItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const discountAmount = (form.discount / 100) * totalAmount;
    const finalAmount = totalAmount - discountAmount;

    return (
        <ProtectedRoute requiredRole={[1, 2]}>

        <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Tạo đơn hàng mới</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block mb-1 font-medium">Tên khách hàng</label>
                    <input disabled={isCustomerLocked} className="input input-bordered w-full" value={form.customer} required onChange={(e) => handleCustomerNameChange(e.target.value)} />
                    {isCustomerNameDuplicate && <p className="text-red-500 text-sm mt-1">Tên khách hàng đã tồn tại. Vui lòng nhập tên khác.</p>}
                </div>
                <div>
                    <label className="block mb-1 font-medium">Địa chỉ</label>
                    <input disabled={isCustomerLocked} className="input input-bordered w-full" value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Số điện thoại</label>
                    <input disabled={isCustomerLocked} className="input input-bordered w-full" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Ngày đặt</label>
                    <input disabled className="input input-bordered w-full bg-gray-100" type="text" value={new Date(form.orderDate).toLocaleDateString('en-US')} readOnly />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Mã đơn hàng</label>
                    <input disabled className="input input-bordered w-full" value={form.orderCode} />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Chiết khấu (%)</label>
                    <input
                        type="number"
                        className="input input-bordered w-full"
                        min={0}
                        max={100}
                        value={form.discount}
                        onChange={(e) => setForm((prev) => ({ ...prev, discount: parseFloat(e.target.value) }))}
                    />
                </div>
                <div>
                    <label className="block mb-1 font-medium">Trạng thái</label>
                    <select className="select select-bordered w-full" value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
                        <option value="Pending">Chưa thực hiện</option>
                        <option value="Processing">Đang thực hiện</option>
                        <option value="Delivered">Hoàn thành</option>
                        <option value="Cancelled">Đã huỷ</option>
                    </select>
                </div>
                <div>
                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={form.isUpdateMisa}
                            onChange={(e) => setForm((prev) => ({ ...prev, isUpdateMisa: e.target.checked }))}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <span className="font-medium text-gray-700">Cập nhật MISA</span>
                    </label>
                    <p className="text-sm text-gray-500 mt-1">Đánh dấu nếu đơn hàng đã được cập nhật vào hệ thống MISA</p>
                </div>
                <div>
                    <label className="block mb-1 font-medium">Khách hàng có sẵn</label>
                    <div className="flex items-center gap-2">
                        <AsyncSelect
                            cacheOptions
                            defaultOptions
                            loadOptions={loadCustomerOptions}
                            placeholder="Tìm khách hàng có sẵn..."
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
                            styles={{ container: (base) => ({ ...base, width: 300 }) }}
                        />
                        {isCustomerLocked && (
                            <button
                                onClick={() => {
                                    setForm((prev) => ({
                                        ...prev,
                                        customer: '',
                                        address: '',
                                        phone: '',
                                        discount: 0,
                                    }));
                                    setIsCustomerLocked(false);
                                }}
                                className="btn btn-sm btn-outline text-red-500"
                                type="button"
                            >
                                ✕ Xoá KH
                            </button>
                        )}
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
                            {/* <th>Rộng</th>
                            <th>Cao</th>
                            <th>Dày</th> */}
                            <th>Số lượng</th>
                            <th>Đơn vị tính</th>
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
                                    {/* <td className="text-right">{width.toLocaleString()}</td>
                                    <td className="text-right">{height.toLocaleString()}</td>
                                    <td className="text-right">{(item.thickness ?? 0).toLocaleString()}</td> */}
                                    <td>
                                        <input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', +e.target.value)} className="input input-sm" />
                                    </td>
                                    <td>Tấm</td>
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
                                form.orderItems.map((item) => item.productId),
                            )
                        }
                        placeholder="Thêm sản phẩm có sẵn..."
                        onChange={(option: ProductOption | null) => {
                            if (!option) return;
                            const p = option.product;
                            const newItem: OrderItem = {
                                id: Date.now(),
                                productId: p.id,
                                productName: p.productName,
                                height: Number(p.height),
                                width: Number(p.width),
                                thickness: Number(p.thickness),
                                quantity: 1,
                                unitPrice: Number(p.unitPrice),
                                glassStructureId: p.glassStructureId,
                                isFromDatabase: true,
                            };
                            setForm((prev) => ({ ...prev, orderItems: [...prev.orderItems, newItem] }));
                            setSelectedProduct(null);
                        }}
                    />
                </div>
                <div>
                    {/* <button onClick={() => setShowAddProductForm(true)} className="btn btn-outline btn-sm mb-6">
                        + Thêm sản phẩm
                    </button> */}
                    {showAddProductForm && (
                        <div>
                            <div>
                                <h4 className="text-lg font-semibold mb-2">Thêm sản phẩm mới</h4>
                                <p className="text-sm text-gray-500 italic mb-2">
                                    ⚠️ Tên sản phẩm phải theo định dạng: <strong>Kính [loại] phút, KT: [rộng]*[cao]*[dày] mm, [mô tả thêm]</strong>
                                    <br />
                                    <span>
                                        Ví dụ: <code>Kính chống cháy dùng keo Nano cao cấp EI 15, KT: 100*200*10 mm</code>
                                    </span>
                                </p>

                                {/* <label className="block mb-1 font-medium">Tên sản phẩm</label>
                                <input
                                    className="input input-bordered w-full"
                                    value={newFinishedProductForm.productName}
                                    onChange={(e) => handleFinishedProductNameChange(e.target.value)}
                                /> */}
                                <label className="block mb-1 font-medium">Tên sản phẩm</label>
                                <input
                                    className="input input-bordered w-full"
                                    value={newFinishedProductForm.productName}
                                    onChange={(e) => setNewFinishedProductForm((p) => ({ ...p, productName: e.target.value }))}
                                    placeholder="VD: Kính chống cháy dùng keo Nano cao cấp EI 15, KT: 100*200*10 mm"
                                />
                                {isProductNameDuplicate && <p className="text-red-500 text-sm">Tên sản phẩm đã tồn tại. Vui lòng nhập tên khác.</p>}
                            </div>

                            {/* <div className="grid grid-cols-3 gap-4">
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
                            </div> */}

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block mb-1 font-medium">Rộng (mm)</label>
                                    <input
                                        type="number"
                                        className="input input-bordered w-full"
                                        value={newFinishedProductForm.width}
                                        onChange={(e) => setNewFinishedProductForm((p) => ({ ...p, width: +e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 font-medium">Cao (mm)</label>
                                    <input
                                        type="number"
                                        className="input input-bordered w-full"
                                        value={newFinishedProductForm.height}
                                        onChange={(e) => setNewFinishedProductForm((p) => ({ ...p, height: +e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 font-medium">Dày (mm)</label>
                                    <input
                                        type="number"
                                        className="input input-bordered w-full"
                                        value={newFinishedProductForm.thickness}
                                        onChange={(e) => setNewFinishedProductForm((p) => ({ ...p, thickness: +e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block mb-1 font-medium">Cấu trúc kính</label>
                                {/* <AsyncSelect
                                    cacheOptions
                                    defaultOptions
                                    loadOptions={(input, cb) =>
                                        cb(glassStructures.filter((g) => g.productName.toLowerCase().includes(input.toLowerCase())).map((g) => ({ label: g.productName, value: g.id })))
                                    }
                                    onChange={(opt) => setNewFinishedProductForm((p) => ({ ...p, glassStructureId: opt ? opt.value : undefined }))}
                                    value={glassStructures.filter((g) => g.id === newFinishedProductForm.glassStructureId).map((g) => ({ label: g.productName, value: g.id }))[0] || null}
                                /> */}
                                <AsyncSelect
                                    cacheOptions
                                    defaultOptions
                                    loadOptions={(input, cb) =>
                                        cb(glassStructures.filter((g) => g.productName.toLowerCase().includes(input.toLowerCase())).map((g) => ({ label: g.productName, value: g.id })))
                                    }
                                    onChange={(opt) =>
                                        setNewFinishedProductForm((p) => ({
                                            ...p,
                                            glassStructureId: opt ? opt.value : undefined,
                                        }))
                                    }
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
                    Tạo đơn hàng
                </button>
            </div>
        </div>
        </ProtectedRoute>

    );
};

export default SalesOrderCreatePage;
