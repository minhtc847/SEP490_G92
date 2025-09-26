'use client';

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { ProductInfo } from '../service';

interface SemiFinishedProductFormProps {
    productionOrderInfo: any;
    onSemiFinishedProductAdded: (semiFinishedProduct: any) => void;
    onCancel: () => void;
    selectedRawMaterial?: any; // Thêm prop này để nhận nguyên vật liệu đã chọn từ component cha
}

export default function SemiFinishedProductForm({
    productionOrderInfo,
    onSemiFinishedProductAdded,
    onCancel,
    selectedRawMaterial
}: SemiFinishedProductFormProps) {
    const MySwal = withReactContent(Swal);
    const [formData, setFormData] = useState({
        productId: 0,
        quantity: '',
        note: ''
    });


    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Lọc bán thành phẩm được liên kết với lệnh sản xuất này
    const availableSemiFinishedProducts = productionOrderInfo.semiFinishedProducts?.filter((p: ProductInfo) =>
        productionOrderInfo.productionOutputs?.some((po: any) => po.productId === p.id)
    ) || [];



    const handleInputChange = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.productId) {
            newErrors.productId = 'Vui lòng chọn bán thành phẩm';
        }
        if (!formData.quantity || parseInt(formData.quantity) <= 0) {
            newErrors.quantity = 'Số lượng phải lớn hơn 0';
        }
        if (!selectedRawMaterial) {
            newErrors.rawMaterial = 'Vui lòng chọn nguyên vật liệu từ bên ngoài trước khi mở form này';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            return;
        }

        const selectedProduct = availableSemiFinishedProducts.find((p: ProductInfo) => p.id === formData.productId);

        if (!selectedProduct) {
            MySwal.fire({
                title: 'Không tìm thấy bán thành phẩm đã chọn',
                toast: true,
                position: 'bottom-start',
                showConfirmButton: false,
                timer: 3000,
                showCloseButton: true,
            });
            return;
        }

        const semiFinishedProduct = {
            productId: selectedProduct.id,
            productCode: selectedProduct.productCode,
            productName: selectedProduct.productName,
            productType: 'Bán thành phẩm',
            uom: selectedProduct.uom,
            height: selectedProduct.height,
            width: selectedProduct.width,
            thickness: selectedProduct.thickness,
            weight: selectedProduct.weight,
            unitPrice: selectedProduct.unitPrice,
            quantity: parseInt(formData.quantity),
            note: formData.note,
            rawMaterialId: selectedRawMaterial?.id,
            rawMaterialName: selectedRawMaterial?.productName,
            isExisting: true
        };

        onSemiFinishedProductAdded(semiFinishedProduct);
    };

    const handleReset = () => {
        setFormData({
            productId: 0,
            quantity: '',
            note: ''
        });
        setErrors({});
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-green-800">Thêm Bán Thành Phẩm</h3>
                <button
                    onClick={onCancel}
                    className="text-gray-500 hover:text-gray-700"
                    title="Đóng form"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div className="space-y-6">
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                    <h4 className="text-md font-medium text-green-800 mb-3">📋 Thông tin quan trọng</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                        <li>• Bán thành phẩm được lấy từ danh sách có sẵn của lệnh sản xuất</li>
                        <li>• Đơn vị đo: tấm (số nguyên)</li>
                        <li>• Số lượng phải lớn hơn 0</li>
                    </ul>
                </div>

                {/* Hiển thị nguyên vật liệu đã chọn từ component cha */}
                {selectedRawMaterial && (() => {
                    const rawMaterialInfo = productionOrderInfo.rawMaterials?.find((p: any) => p.id === selectedRawMaterial.productId);
                    return rawMaterialInfo ? (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                            <h4 className="text-md font-medium text-blue-800 mb-3">
                                ✓ Nguyên vật liệu đã chọn
                            </h4>
                            <div className="p-3 bg-blue-100 border border-blue-300 rounded-md">
                                <p className="text-sm text-blue-800">
                                    <strong>{rawMaterialInfo.productName}</strong> ({rawMaterialInfo.productCode})
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                    Số lượng có sẵn: {selectedRawMaterial.quantity} {rawMaterialInfo.uom}
                                </p>
                            </div>
                        </div>
                    ) : null;
                })()}

                <div className="p-4 bg-white border border-gray-200 rounded-md">
                    <h4 className="text-md font-medium text-gray-800 mb-4">Thông tin bán thành phẩm</h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Chọn bán thành phẩm <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.productId}
                                onChange={(e) => {
                                    const newProductId = parseInt(e.target.value);
                                    handleInputChange('productId', newProductId);
                                    
                                    // Check if current quantity exceeds the new product's requirement
                                    if (newProductId > 0 && formData.quantity) {
                                        const intQuantity = parseInt(formData.quantity);
                                        if (intQuantity > 0) {
                                            const productionOutput = productionOrderInfo.productionOutputs?.find((po: any) => po.productId === newProductId);
                                            if (productionOutput && intQuantity > productionOutput.amount) {
                                                Swal.fire({
                                                    title: 'Cảnh báo',
                                                    text: `Số lượng bán thành phẩm (${intQuantity}) vượt quá số lượng yêu cầu của lệnh sản xuất (${productionOutput.amount}) cho sản phẩm "${productionOutput.productName}"`,
                                                    icon: 'warning',
                                                    toast: true,
                                                    position: 'bottom-start',
                                                    showConfirmButton: false,
                                                    timer: 4000,
                                                    showCloseButton: true,
                                                });
                                            }
                                        }
                                    }
                                }}
                                className={`w-full px-3 py-2 border rounded-md ${errors.productId ? 'border-red-500 bg-red-50' : 'border-green-300'
                                    }`}
                            >
                                <option value={0}>Chọn bán thành phẩm...</option>
                                {availableSemiFinishedProducts.map((product: ProductInfo) => (
                                    <option key={product.id} value={product.id}>
                                        {product.productName}
                                    </option>
                                ))}
                            </select>
                            {errors.productId && (
                                <p className="text-red-500 text-xs mt-1">{errors.productId}</p>
                            )}

                            {formData.productId > 0 && (
                                <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded-md">
                                    {(() => {
                                        const selectedProduct = availableSemiFinishedProducts.find((p: ProductInfo) => p.id === formData.productId);
                                        return selectedProduct ? (
                                            <div>
                                                <p className="text-sm text-green-800">
                                                    ✓ Đã chọn: <strong>{selectedProduct.productName}</strong>
                                                </p>                                                
                                                {selectedProduct.height && selectedProduct.width && (
                                                    <p className="text-xs text-green-600">
                                                        Kích thước: {selectedProduct.height} x {selectedProduct.width} x {selectedProduct.thickness} mm
                                                    </p>
                                                )}
                                            </div>
                                        ) : null;
                                    })()}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Số lượng (tấm) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    step="1"
                                    min="1"
                                    max="999999"
                                    value={formData.quantity}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        // Giới hạn số lượng để tránh scientific notation và chỉ nhận số nguyên
                                        const intValue = parseInt(value);
                                        if (intValue > 999999) {
                                            handleInputChange('quantity', '999999');
                                        } else if (intValue < 1) {
                                            handleInputChange('quantity', '1');
                                        } else {
                                            // Check if quantity exceeds production order requirement
                                            const productionOutput = productionOrderInfo.productionOutputs?.find((po: any) => po.productId === formData.productId);
                                            if (productionOutput && intValue > productionOutput.amount) {
                                                Swal.fire({
                                                    title: 'Cảnh báo',
                                                    text: `Số lượng bán thành phẩm (${intValue}) vượt quá số lượng yêu cầu của lệnh sản xuất (${productionOutput.amount}) cho sản phẩm "${productionOutput.productName}"`,
                                                    icon: 'warning',
                                                    toast: true,
                                                    position: 'bottom-start',
                                                    showConfirmButton: false,
                                                    timer: 4000,
                                                    showCloseButton: true,
                                                });
                                            }
                                            handleInputChange('quantity', intValue.toString());
                                        }
                                    }}
                                    className={`w-full px-3 py-2 border rounded-md ${errors.quantity ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                        }`}
                                    placeholder="0"
                                />
                                {errors.quantity && (
                                    <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ghi chú
                                </label>
                                <textarea
                                    value={formData.note}
                                    onChange={(e) => handleInputChange('note', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    rows={3}
                                    placeholder="Ghi chú về bán thành phẩm..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Reset
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!selectedRawMaterial || !formData.productId || !formData.quantity}
                        className={`px-4 py-2 rounded-md transition-colors ${!selectedRawMaterial || !formData.productId || !formData.quantity
                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                : 'bg-green-500 text-white hover:bg-green-600'
                            }`}
                    >
                        Thêm bán thành phẩm
                    </button>
                </div>
            </div>
        </div>
    );
}
