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
import Swal from 'sweetalert2';

type GlassStructure = {
    id: number;
    productName: string;
    unitPrice: number;
    productCode?: string; // <-- thêm optional
};

const SalesOrderEditPage = () => {
    const params = useParams();
    const id = params?.id as string;
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

    const [isProductNameEdited, setIsProductNameEdited] = useState(false);

    function generateProductName(structure: { productName: string; productCode?: string } | undefined, width: number, height: number, thickness: number) {
        if (!structure || !width || !height || !thickness) return '';
        return `Kính ${structure.productName}, KT: ${width}*${height}*${thickness} mm, ${structure.productCode || ''}`.trim();
    }

    // Auto tính giá & tên khi thay đổi cấu trúc kính hoặc kích thước
    useEffect(() => {
        const structure = glassStructures.find((gs) => gs.id === newProductForm.glassStructureId);
        if (!structure) return;

        const area = (newProductForm.width * newProductForm.height) / 1_000_000;
        const unitPrice = +(area * (structure?.unitPrice ?? 0)).toFixed(0);

        setNewProductForm((prev) => {
            const updatedForm = { ...prev };

            // Tính giá
            if (unitPrice !== prev.unitPrice) {
                updatedForm.unitPrice = unitPrice;
            }

            // Sinh tên nếu chưa chỉnh tay
            if (!isProductNameEdited && prev.width && prev.height && prev.thickness) {
                updatedForm.productName = generateProductName(structure, prev.width, prev.height, prev.thickness);
            }

            return updatedForm;
        });
    }, [newProductForm.width, newProductForm.height, newProductForm.thickness, newProductForm.glassStructureId, glassStructures, isProductNameEdited]);

    const [form, setForm] = useState<{
        customer: string;
        address: string;
        phone: string;
        orderDate: string;
        orderCode: string;
        status: string;
        deliveryStatus: string;
        orderItems: OrderItem[];
        isUpdateMisa: boolean;
    }>({
        customer: '',
        address: '',
        phone: '',
        orderDate: '',
        orderCode: '',
        status: 'Pending',
        deliveryStatus: 'NotDelivered',
        orderItems: [],
        isUpdateMisa: false,
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
                status: getStatusString(Number(data.status)),
                deliveryStatus: data.deliveryStatus,
                orderItems: data.products,
                isUpdateMisa: data.isUpdateMisa,
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

    const getStatusString = (statusNumber: number): string => {
        switch (statusNumber) {
            case 0: return 'Pending';
            case 1: return 'Processing';
            case 2: return 'Delivered';
            case 3: return 'Cancelled';
            default: return 'Pending';
        }
    };

    const DELIVERY_STATUS_OPTIONS = [
        { value: 'NotDelivered', label: 'Chưa giao' },
        { value: 'Delivering', label: 'Đã giao một phần' },
        { value: 'FullyDelivered', label: 'Đã giao đầy đủ' },
        { value: 'Cancelled', label: 'Trả hàng' },
    ];

    const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
        // Validate quantity limit
        if (field === 'quantity') {
            const numValue = +value;
            if (numValue > 9999) {
                Swal.fire({
                    title: 'Cảnh báo',
                    text: 'Số lượng không được vượt quá 9999',
                    icon: 'warning',
                    toast: true,
                    position: 'bottom-start',
                    showConfirmButton: false,
                    timer: 3000,
                    showCloseButton: true,
                });
                return;
            }
            if (numValue < 1) {
                Swal.fire({
                    title: 'Cảnh báo',
                    text: 'Số lượng phải lớn hơn 0',
                    icon: 'warning',
                    toast: true,
                    position: 'bottom-start',
                    showConfirmButton: false,
                    timer: 3000,
                    showCloseButton: true,
                });
                return;
            }
        }

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
                Swal.fire({
                    title: 'Lỗi',
                    text: 'Tên sản phẩm đã tồn tại. Vui lòng nhập tên khác.',
                    icon: 'error',
                    toast: true,
                    position: 'bottom-start',
                    showConfirmButton: false,
                    timer: 3000,
                    showCloseButton: true,
                });
                return;
            }

            const isExisted = await checkProductNameExists(newProductForm.productName);
            if (isExisted) {
                Swal.fire({
                    title: 'Lỗi',
                    text: 'Tên sản phẩm đã tồn tại, vui lòng chọn tên khác!',
                    icon: 'error',
                    toast: true,
                    position: 'bottom-start',
                    showConfirmButton: false,
                    timer: 3000,
                    showCloseButton: true,
                });
                return;
            }

            if (!newProductForm.glassStructureId) {
                Swal.fire({
                    title: 'Lỗi',
                    text: 'Vui lòng chọn cấu trúc kính!',
                    icon: 'error',
                    toast: true,
                    position: 'bottom-start',
                    showConfirmButton: false,
                    timer: 3000,
                    showCloseButton: true,
                });
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

            const gs = glassStructures.find((g) => g.id === newProductForm.glassStructureId);
            setForm((prev) => ({
                ...prev,
                orderItems: [
                    ...prev.orderItems,
                    {
                        id: Date.now(),
                        productId: newProduct.id,
                        productName: newProduct.productName,
                        productCode: '', 
                        width: Number(newProduct.width),
                        height: Number(newProduct.height),
                        thickness: Number(newProduct.thickness),
                        quantity: 1,
                        unitPrice: Number(gs?.unitPrice ?? 0),
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
            Swal.fire({
                title: 'Lỗi',
                text: 'Thêm sản phẩm thất bại!',
                icon: 'error',
                toast: true,
                position: 'bottom-start',
                showConfirmButton: false,
                timer: 3000,
                showCloseButton: true,
            });
        }
    };

    // const [newFinishedProductForm, setNewFinishedProductForm] = useState({
    //     productName: '',
    //     width: 0,
    //     height: 0,
    //     thickness: 0,
    //     unitPrice: 0,
    //     glassStructureId: undefined as number | undefined,
    // });

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

        setNewProductForm((prev) => ({
            ...prev,
            productName: val,
            width: dims?.width ?? prev.width,
            height: dims?.height ?? prev.height,
            thickness: dims?.thickness ?? prev.thickness,
        }));
    };

    const existingProductIds = new Set(form.orderItems.map((item) => item.productId));

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: 'Xác nhận xóa',
            text: 'Bạn có chắc chắn muốn xoá đơn hàng này không?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy'
        });

        if (!result.isConfirmed) return;

        try {
            await deleteOrderById(Number(id));
            Swal.fire({
                title: 'Thành công',
                text: 'Đã xoá đơn hàng thành công!',
                icon: 'success',
                toast: true,
                position: 'bottom-start',
                showConfirmButton: false,
                timer: 3000,
                showCloseButton: true,
            });
            router.push('/sales-order');
        } catch (err: any) {
            console.error('Lỗi khi xoá:', err.response?.data || err.message);
            Swal.fire({
                title: 'Lỗi',
                text: 'Xoá thất bại! ' + (err.response?.data?.title || err.message),
                icon: 'error',
                toast: true,
                position: 'bottom-start',
                showConfirmButton: false,
                timer: 3000,
                showCloseButton: true,
            });
        }
    };

    const handleSave = async () => {
        try {
            for (const item of form.orderItems) {
                if (item.productId === 0) {
                    const exists = await checkProductCodeExists(item.productCode);
                    if (exists) {
                        Swal.fire({
                            title: 'Lỗi',
                            text: `Mã sản phẩm "${item.productCode}" đã tồn tại. Vui lòng sửa lại mã hoặc tạo mã tự động.`,
                            icon: 'error',
                            toast: true,
                            position: 'bottom-start',
                            showConfirmButton: false,
                            timer: 3000,
                            showCloseButton: true,
                        });
                        return;
                    }
                }
            }

            const payload = {
                customerName: form.customer || '',
                address: form.address || '',
                phone: form.phone || '',
                discount: 0,
                status: form.status || 'Pending',
                deliveryStatus: form.deliveryStatus || 'NotDelivered',
                isUpdateMisa: form.isUpdateMisa || false,
                products: form.orderItems.map(item => {
                    const gs = glassStructures.find(g => g.id === item.glassStructureId);
                    const unitPricePerM2 = Number(gs?.unitPrice ?? item.unitPrice ?? 0);
                    return {
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: unitPricePerM2,
                        productName: item.productName,
                        productCode: item.productCode || '',
                        height: item.height?.toString() || '',
                        width: item.width?.toString() || '',
                        thickness: item.thickness,
                        glassStructureId: item.glassStructureId
                    };
                })
            };

            await updateOrderDetailById(Number(id), payload);
            Swal.fire({
                title: 'Thành công',
                text: 'Cập nhật thành công!',
                icon: 'success',
                toast: true,
                position: 'bottom-start',
                showConfirmButton: false,
                timer: 3000,
                showCloseButton: true,
            });
            
            // Force reload the page to ensure updated data is shown
            window.location.href = `/sales-order/${id}`;
        } catch (err: any) {
            console.error('Lỗi cập nhật:', err.response?.data || err.message);
            Swal.fire({
                title: 'Lỗi',
                text: 'Cập nhật thất bại! ' + (err.response?.data?.title || err.message),
                icon: 'error',
                toast: true,
                position: 'bottom-start',
                showConfirmButton: false,
                timer: 3000,
                showCloseButton: true,
            });
        }
    };

    const totalQuantity = form.orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = form.orderItems.reduce((sum, item) => {
        const width = Number(item.width) || 0;
        const height = Number(item.height) || 0;
        const areaM2 = (width * height) / 1_000_000;
        return sum + (item.quantity * (item.unitPrice || 0) * areaM2);
    }, 0);

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
                {/* Discount field removed */}
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
                            <th>Đơn giá / m²</th>
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
                                        <input 
                                            type="number" 
                                            value={item.quantity} 
                                            onChange={(e) => handleItemChange(index, 'quantity', +e.target.value)} 
                                            className="input input-sm" 
                                            min="1"
                                            max="9999"
                                        />
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
                            const gs = glassStructures.find((g) => g.id === p.glassStructureId);

                            const newItem: OrderItem = {
                                id: Date.now(),
                                productId: p.id,
                                productCode: p.productCode,
                                productName: p.productName,
                                height: Number(p.height),
                                width: Number(p.width),
                                thickness: Number(p.thickness),
                                quantity: 1,
                                unitPrice: Number(gs?.unitPrice ?? 0),
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
                                        Ví dụ: <code>Kính chống cháy dùng keo Nano cao cấp EI 15, KT: 100*200*10 mm</code>
                                    </span>
                                </p>

                                <label className="block mb-1 font-medium">Tên sản phẩm</label>
                                <input
                                    className="input input-bordered w-full"
                                    value={newProductForm.productName}
                                    onChange={(e) => {
                                        setNewProductForm((p) => ({ ...p, productName: e.target.value }));
                                        setIsProductNameEdited(true);
                                    }}
                                    placeholder="VD: Kính chống cháy dùng keo Nano cao cấp EI 15, KT: 100*200*10 mm"
                                />
                                {isProductNameDuplicate && <p className="text-red-500 text-sm">Tên sản phẩm đã tồn tại. Vui lòng nhập tên khác.</p>}
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block mb-1 font-medium">Rộng (mm)</label>
                                    <input
                                        className="input input-bordered w-full"
                                        type="number"
                                        value={newProductForm.width}
                                        onChange={(e) => setNewProductForm((p) => ({ ...p, width: +e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 font-medium">Cao (mm)</label>
                                    <input
                                        type="number"
                                        className="input input-bordered w-full"
                                        value={newProductForm.height}
                                        onChange={(e) => setNewProductForm((p) => ({ ...p, height: +e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 font-medium">Dày (mm)</label>
                                    <input
                                        type="number"
                                        className="input input-bordered w-full"
                                        value={newProductForm.thickness}
                                        onChange={(e) => setNewProductForm((p) => ({ ...p, thickness: +e.target.value }))}
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
                                    onChange={(opt) => {
                                        setNewProductForm((p) => ({
                                            ...p,
                                            glassStructureId: opt ? opt.value : undefined,
                                        }));
                                        setIsProductNameEdited(false); // reset để auto tên khi đổi loại kính
                                    }}
                                    value={glassStructures.filter((g) => g.id === newProductForm.glassStructureId).map((g) => ({ label: g.productName, value: g.id }))[0] || null}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 font-medium">Diện tích (m²)</label>
                                    <div className="input input-bordered bg-gray-100">{((newProductForm.width * newProductForm.height) / 1_000_000).toFixed(2)}</div>
                                </div>
                                <div>
                                    <label className="block mb-1 font-medium">Đơn giá (₫/m²)</label>
                                    <div className="input input-bordered bg-gray-100">
                                        {(() => {
                                            const s = glassStructures.find((g) => g.id === newProductForm.glassStructureId);
                                            return ((s?.unitPrice || 0)).toFixed(0);
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
