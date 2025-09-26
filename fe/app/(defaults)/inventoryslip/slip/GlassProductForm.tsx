'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { ProductInfo, createInventoryProduct } from '../service';

interface GlassProductFormProps {
    productionOrderInfo: any;
    onGlassProductAdded: (glassProduct: any) => void;
    onCancel: () => void;
    selectedRawMaterial?: any; // Thêm prop này để nhận nguyên vật liệu đã chọn từ component cha
}

export default function GlassProductForm({ 
    productionOrderInfo, 
    onGlassProductAdded, 
    onCancel,
    selectedRawMaterial
}: GlassProductFormProps) {
    const MySwal = withReactContent(Swal);
    const [formData, setFormData] = useState({
        productName: '',
        uom: 'tấm', 
        height: '',
        width: '',
        thickness: '',
        weight: '',
        unitPrice: '',
        quantity: '',
        note: ''
    });
    
    const [productSearch, setProductSearch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<ProductInfo | null>(null);
    const [filteredProducts, setFilteredProducts] = useState<ProductInfo[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const [isCreatingNewProduct, setIsCreatingNewProduct] = useState(false);
    const [errors, setErrors] = useState<{[key: string]: string}>({});

    const getFilteredGlassProducts = () => {
        if (!productionOrderInfo.glassProducts) return [];
        const semiFinishedProductIds = productionOrderInfo.productionOutputs?.map((po: any) => po.productId) || [];
        return productionOrderInfo.glassProducts
            .filter((glassProduct: any) => !semiFinishedProductIds.includes(glassProduct.id))
            .filter((glassProduct: any) => (glassProduct.uom || '').toLowerCase() === 'tấm');
    };

    // Memoize to avoid new array reference each render → prevents infinite useEffect loops
    const availableGlassProducts = useMemo(() => getFilteredGlassProducts(), [
        productionOrderInfo?.glassProducts,
        productionOrderInfo?.productionOutputs,
    ]);

    useEffect(() => {
        const term = productSearch.trim().toLowerCase();
        if (term) {
            const filtered = availableGlassProducts.filter((product: ProductInfo) =>
                (product.productName || '').toLowerCase().includes(term) ||
                (product.productCode || '').toLowerCase().includes(term)
            );
            setFilteredProducts(filtered);
        } else {
            setFilteredProducts(availableGlassProducts);
        }
        // availableGlassProducts is memoized, so this effect won't thrash
    }, [productSearch, availableGlassProducts]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};
        
        if (!formData.height) {
            newErrors.height = 'Chiều dài là bắt buộc';
        }
        if (!formData.width) {
            newErrors.width = 'Chiều rộng là bắt buộc';
        }
        if (!formData.thickness) {
            newErrors.thickness = 'Chiều dày là bắt buộc';
        }
        if (!formData.quantity || parseInt(formData.quantity) <= 0) {
            newErrors.quantity = 'Số lượng phải lớn hơn 0';
        }
        if (!selectedRawMaterial) {
            newErrors.rawMaterial = 'Vui lòng chọn nguyên vật liệu để liên kết';
        }

        // Validate upper bounds 0..99999
        const h = parseFloat(formData.height || '0');
        const w = parseFloat(formData.width || '0');
        const t = parseFloat(formData.thickness || '0');
        if (!isNaN(h) && h > 99999) newErrors.height = 'Chiều dài tối đa 99999';
        if (!isNaN(w) && w > 99999) newErrors.width = 'Chiều rộng tối đa 99999';
        if (!isNaN(t) && t > 99999) newErrors.thickness = 'Chiều dày tối đa 99999';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleProductSearch = (searchTerm: string) => {
        setProductSearch(searchTerm);
        if (!searchTerm.trim()) {
            setSelectedProduct(null);
            setShowDropdown(false);
        } else if (selectedProduct) {
            setSelectedProduct(null);
            setFormData(prev => ({ ...prev, quantity: '', note: '' }));
            setShowDropdown(true); 
        }
    };

    const handleProductSelect = (product: ProductInfo) => {
        setSelectedProduct(product);
        setProductSearch(product.productName || '');
        setShowDropdown(false); 
        setFormData(prev => ({ ...prev, quantity: '' })); // Reset số lượng
    };

    const handleUseExistingProduct = (product: ProductInfo) => {
        if (!selectedRawMaterial) {
            MySwal.fire({
                title: 'Vui lòng chọn nguyên vật liệu để mapping trước',
                toast: true,
                position: 'bottom-start',
                showConfirmButton: false,
                timer: 3000,
                showCloseButton: true,
            });
            return;
        }

        const quantity = parseInt(formData.quantity);
        if (isNaN(quantity) || quantity <= 0) {
            MySwal.fire({
                title: 'Vui lòng nhập số lượng hợp lệ (lớn hơn 0)',
                toast: true,
                position: 'bottom-start',
                showConfirmButton: false,
                timer: 3000,
                showCloseButton: true,
            });
            return;
        }

        const glassProduct = {
            productId: product.id,
            productCode: product.productCode,
            productName: product.productName,
            productType: 'Kính dư',
            uom: product.uom,
            height: product.height,
            width: product.width,
            thickness: product.thickness,
            weight: product.weight,
            unitPrice: product.unitPrice,
            quantity: quantity,
            note: formData.note,
            rawMaterialId: selectedRawMaterial.id,
            rawMaterialName: selectedRawMaterial.productName,
            isExisting: true
        };
        onGlassProductAdded(glassProduct);
    };

    const handleCreateNewProduct = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setIsCreatingNewProduct(true);
            
            let autoProductName = 'Kính trắng KT';
            if (formData.height && formData.width && formData.thickness) {
                autoProductName = `Kính trắng KT: ${formData.height}*${formData.width}*${formData.thickness} mm`;
            } else if (formData.height && formData.width) {
                autoProductName = `Kính trắng KT: ${formData.height}*${formData.width} mm`;
            }
            
            // Pre-check if a glass with same dimensions exists in availableGlassProducts
            const exists = availableGlassProducts.some((p: any) => {
                const h = (p.height ?? '').toString();
                const w = (p.width ?? '').toString();
                const t = p.thickness != null ? p.thickness.toString() : '';
                return h === (formData.height || '') && w === (formData.width || '') && t === (formData.thickness || '');
            });
            if (exists) {
                await MySwal.fire({
                    title: 'Kính đã tồn tại',
                    text: 'Đã có kính dư với kích thước dài*rộng*dày giống nhau. Vui lòng sử dụng kính sẵn có.',
                    icon: 'warning',
                    confirmButtonText: 'Đã hiểu'
                });
                return;
            }

            const newProductInfo = await createInventoryProduct({
                productCode: '',
                productName: autoProductName, 
                productType: 'Kính dư',
                uom: 'tấm', 
                height: formData.height || undefined,
                width: formData.width || undefined,
                thickness: formData.thickness ? parseFloat(formData.thickness) : undefined,
                weight: formData.weight ? parseFloat(formData.weight) : undefined,
                unitPrice: formData.unitPrice ? parseFloat(formData.unitPrice) : undefined
            });

            if (!newProductInfo) {
                throw new Error('Không thể tạo sản phẩm mới');
            }
            
            const glassProduct = {
                productId: newProductInfo.id,
                productCode: newProductInfo.productCode,
                productName: autoProductName, 
                productType: 'Kính dư',
                uom: 'tấm', 
                height: newProductInfo.height,
                width: newProductInfo.width,
                thickness: newProductInfo.thickness,
                weight: newProductInfo.weight,
                unitPrice: newProductInfo.unitPrice,
                quantity: parseInt(formData.quantity),
                note: formData.note,
                rawMaterialId: selectedRawMaterial.id,
                rawMaterialName: selectedRawMaterial.productName,
                isExisting: false
            };

            onGlassProductAdded(glassProduct);
        } catch (error) {
            console.error('Error creating product:', error);
            MySwal.fire({
                title: 'Có lỗi xảy ra khi tạo kính dư mới',
                toast: true,
                position: 'bottom-start',
                showConfirmButton: false,
                timer: 3000,
                showCloseButton: true,
            });
        } finally {
            setIsCreatingNewProduct(false);
        }
    };

    const handleReset = () => {
        setFormData({
            productName: '',
            uom: 'tấm', 
            height: '',
            width: '',
            thickness: '',
            weight: '',
            unitPrice: '',
            quantity: '',
            note: ''
        });
        setProductSearch('');
        setSelectedProduct(null);
        setFilteredProducts([]);
        setShowDropdown(false);
        setErrors({});
    };

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-yellow-800">Thêm Kính Dư</h3>
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
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                    <h4 className="text-md font-medium text-yellow-800 mb-3">📋 Thông tin quan trọng</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Kính dư sẽ được tái sử dụng cho các lệnh sản xuất khác</li>
                        <li>• Đơn vị đo: tấm (số nguyên)</li>
                        <li>• Số lượng phải lớn hơn 0</li>
                    </ul>
                </div>

                {selectedRawMaterial && (() => {                  
                    const rawMaterialInfo = productionOrderInfo.rawMaterials?.find((p: ProductInfo) => p.id === selectedRawMaterial.productId);
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
                    <h4 className="text-md font-medium text-gray-800 mb-4">Tìm kiếm kính dư có sẵn</h4>
                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                value={productSearch}
                                onChange={(e) => handleProductSearch(e.target.value)}
                                onFocus={() => {
                                    if (availableGlassProducts.length > 0) {
                                        setFilteredProducts(availableGlassProducts);
                                        setShowDropdown(true);
                                    }
                                }}
                                onBlur={() => {
                                    setTimeout(() => setShowDropdown(false), 200);
                                }}
                                className="w-full px-3 py-2 border border-green-300 rounded-md"
                                placeholder="Nhập tên hoặc mã kính dư..."
                            />
                            
                            {showDropdown && filteredProducts.length > 0 && !selectedProduct && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                    {filteredProducts.map((product: ProductInfo) => (
                                        <div
                                            key={product.id}
                                            onClick={() => handleProductSelect(product)}
                                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                        >
                                            <div className="text-sm text-gray-600">
                                                {product.productName}
                                            </div>                                            
                                            {product.height && product.width && (
                                                <div className="text-xs text-gray-500">
                                                    Kích thước: {product.height} x {product.width} x {product.thickness} mm
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {selectedProduct && (
                            <div className="p-3 bg-green-100 border border-green-300 rounded-md">
                                <p className="text-sm text-green-800">
                                    <strong>Kính dư có sẵn:</strong> {selectedProduct.productName} ({selectedProduct.productCode})
                                </p>
                                <p className="text-sm text-green-600 mt-1">
                                    Nhập số lượng để sử dụng kính dư này
                                </p>
                                
                                <div className="mt-3 p-3 bg-white border border-green-300 rounded-md">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-green-700 mb-2">
                                                Số lượng <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                step="1"
                                                min="1"
                                                max="999999"
                                                value={formData.quantity}
                                                // onChange={(e) => handleInputChange('quantity', e.target.value)}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    // Giới hạn số lượng để tránh scientific notation và chỉ nhận số nguyên
                                                    const intValue = parseInt(value);
                                                    if (intValue > 999999) {
                                                        handleInputChange('quantity', '999999');
                                                    } else if (intValue < 1) {
                                                        handleInputChange('quantity', '1');
                                                    } else {
                                                        handleInputChange('quantity', intValue.toString());
                                                    }
                                                }}
                                                className="w-full px-3 py-2 border border-green-300 rounded-md"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-green-700 mb-2">
                                                Ghi chú
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.note}
                                                onChange={(e) => handleInputChange('note', e.target.value)}
                                                className="w-full px-3 py-2 border border-green-300 rounded-md"
                                                placeholder="Ghi chú..."
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="mt-3 flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleUseExistingProduct(selectedProduct)}
                                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                            disabled={!selectedRawMaterial || !formData.quantity || parseFloat(formData.quantity) <= 0}
                                        >
                                            ✅ Sử dụng kính dư này
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedProduct(null);
                                                setProductSearch('');
                                                setFormData(prev => ({ ...prev, quantity: '', note: '' }));
                                            }}
                                            className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                                        >
                                            ❌ Xóa lựa chọn
                                        </button>
                                    </div>
                                </div>
                                
                                {!selectedRawMaterial && (
                                    <p className="text-xs text-red-600 mt-2">
                                        ⚠️ Vui lòng chọn nguyên vật liệu để liên kết trước
                                    </p>
                                )}
                            </div>
                        )}

                        {availableGlassProducts.length === 0 && (
                            <div className="p-3 bg-gray-100 border border-gray-300 rounded-md">
                                <p className="text-sm text-gray-600">
                                    Không có kính dư nào có sẵn. Bạn có thể tạo mới bên dưới.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Form tạo kính dư mới */}
                <div className="p-4 bg-white border border-gray-200 rounded-md">
                    <h4 className="text-md font-medium text-gray-800 mb-4">Tạo kính dư mới</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Removed product code input per requirement */}

                        <div>
                            <label className="block text-sm font-medium text-yellow-700 mb-2">
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
                                    const intValue = parseInt(value);
                                    if (intValue > 999999) {
                                        handleInputChange('quantity', '999999');
                                    } else if (intValue < 1) {
                                        handleInputChange('quantity', '1');
                                    } else {
                                        handleInputChange('quantity', intValue.toString());
                                    }
                                }}
                                className={`w-full px-3 py-2 border rounded-md ${
                                    errors.quantity ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="0"
                            />
                            {errors.quantity && (
                                <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
                            )}                            
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Dài (mm) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="99999"
                                value={formData.height}
                                onChange={(e) => {
                                    const raw = e.target.value;
                                    let val = parseFloat(raw);
                                    if (isNaN(val) || val < 0) val = 0;
                                    if (val > 99999) val = 99999;
                                    handleInputChange('height', val.toString());
                                }}
                                className={`w-full px-3 py-2 border rounded-md ${
                                    !formData.height ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="0.0"
                            />
                            {errors.height && (
                                <p className="text-red-500 text-xs mt-1">{errors.height}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rộng (mm) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="99999"
                                value={formData.width}
                                onChange={(e) => {
                                    const raw = e.target.value;
                                    let val = parseFloat(raw);
                                    if (isNaN(val) || val < 0) val = 0;
                                    if (val > 99999) val = 99999;
                                    handleInputChange('width', val.toString());
                                }}
                                className={`w-full px-3 py-2 border rounded-md ${
                                    !formData.width ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="0.0"
                            />
                            {errors.width && (
                                <p className="text-red-500 text-xs mt-1">{errors.width}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Dày (mm) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="99999"
                                value={formData.thickness}
                                onChange={(e) => {
                                    const raw = e.target.value;
                                    let val = parseFloat(raw);
                                    if (isNaN(val) || val < 0) val = 0;
                                    if (val > 99999) val = 99999;
                                    handleInputChange('thickness', val.toString());
                                }}
                                className={`w-full px-3 py-2 border rounded-md ${
                                    !formData.thickness ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="0.0"
                            />
                            {errors.thickness && (
                                <p className="text-red-500 text-xs mt-1">{errors.thickness}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ghi chú
                            </label>
                            <input
                                type="text"
                                value={formData.note}
                                onChange={(e) => handleInputChange('note', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="Ghi chú về kính dư..."
                            />
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
                    
                    {selectedProduct && (
                        <button
                            type="button"
                            onClick={() => handleUseExistingProduct(selectedProduct)}
                            disabled={!selectedRawMaterial || !formData.quantity || parseFloat(formData.quantity) <= 0}
                            className={`px-4 py-2 rounded-md transition-colors ${
                                !selectedRawMaterial || !formData.quantity || parseFloat(formData.quantity) <= 0
                                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                        >
                            Sử dụng sản phẩm có sẵn
                        </button>
                    )}
                    
                    {!selectedProduct && (
                        <button
                            type="button"
                            onClick={handleCreateNewProduct}
                            disabled={isCreatingNewProduct || !selectedRawMaterial}
                            className={`px-4 py-2 rounded-md transition-colors ${
                                !selectedRawMaterial
                                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
                            }`}
                        >
                            {isCreatingNewProduct ? 'Đang tạo...' : 'Tạo kính dư mới'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
