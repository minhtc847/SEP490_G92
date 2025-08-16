'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AsyncSelect from 'react-select/async';
import { createProduct, checkProductNameExists, getGlassStructures, GlassStructure } from './service';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const ProductCreatePage = () => {
    const router = useRouter();
    const [glassStructures, setGlassStructures] = useState<GlassStructure[]>([]);
    const [isProductNameDuplicate, setIsProductNameDuplicate] = useState(false);
    const [isLoadingStructures, setIsLoadingStructures] = useState(true);
    const [structureError, setStructureError] = useState<string | null>(null);

    const [form, setForm] = useState({
        productName: '',
        width: '',
        height: '',
        thickness: '',
        unitPrice: 0,
        glassStructureId: undefined as number | undefined,
        isupdatemisa: 0,
        isTempered: false,
    });

    // Hàm sinh tên tự động từ dữ liệu form
    function generateProductName(structure: GlassStructure | undefined, width: string, height: string, thickness: string, isTempered: boolean) {
        if (!width || !height || !thickness) return '';
        
        if (structure) {
            return `Kính ${structure.productCode} phút, KT: ${width}*${height}*${thickness} mm`;
        } else {
            const glassType = isTempered ? 'cường lực trắng' : 'trắng';
            return `Kính ${glassType}, KT: ${width}*${height}*${thickness} mm`;
        }
    }

    // Validate chỉ nhập số
    const validateNumberInput = (value: string): string => {
        return value.replace(/[^0-9]/g, '');
    };

    // Auto tính giá & tên khi thay đổi cấu trúc kính hoặc kích thước
    useEffect(() => {
        const structure = glassStructures.find((g) => g.id === form.glassStructureId);
        if (!structure) return;

        const width = parseFloat(form.width) || 0;
        const height = parseFloat(form.height) || 0;
        const area = (width * height) / 1_000_000;
        const unitPrice = +(area * (structure?.unitPrice ?? 0)).toFixed(0);

        setForm((prev) => {
            const updatedForm = { ...prev };

            // Tính giá
            if (unitPrice !== prev.unitPrice) {
                updatedForm.unitPrice = unitPrice;
            }

            // Sinh tên tự động
            if (prev.width && prev.height && prev.thickness) {
                updatedForm.productName = generateProductName(structure, prev.width, prev.height, prev.thickness, prev.isTempered);
            }

            return updatedForm;
        });
    }, [form.width, form.height, form.thickness, form.glassStructureId, form.isTempered, glassStructures]);

    // Tạo tên sản phẩm và reset giá khi không có cấu trúc kính
    useEffect(() => {
        if (!form.glassStructureId && form.width && form.height && form.thickness) {
            const productName = generateProductName(undefined, form.width, form.height, form.thickness, form.isTempered);
            setForm(prev => ({ 
                ...prev, 
                productName,
                unitPrice: 0 // Reset giá về 0 khi không có cấu trúc kính
            }));
        }
    }, [form.width, form.height, form.thickness, form.isTempered, form.glassStructureId]);

    useEffect(() => {
        (async () => {
            try {
                setIsLoadingStructures(true);
                setStructureError(null);
                const data = await getGlassStructures();
                setGlassStructures(data);
            } catch (error) {
                setStructureError('Không thể tải danh sách cấu trúc kính. Vui lòng thử lại sau.');
            } finally {
                setIsLoadingStructures(false);
            }
        })();
    }, []);

    const handleProductNameChange = async (val: string) => {
        const trimmed = val.trim();
        const exists = await checkProductNameExists(trimmed);
        setIsProductNameDuplicate(exists);
        setForm((prev) => ({ ...prev, productName: val }));
    };

    const handleWidthChange = (value: string) => {
        const validatedValue = validateNumberInput(value);
        setForm((prev) => ({ ...prev, width: validatedValue }));
    };

    const handleHeightChange = (value: string) => {
        const validatedValue = validateNumberInput(value);
        setForm((prev) => ({ ...prev, height: validatedValue }));
    };

    const handleThicknessChange = (value: string) => {
        const validatedValue = validateNumberInput(value);
        setForm((prev) => ({ ...prev, thickness: validatedValue }));
    };

    const handleSave = async () => {
        try {
            if (isProductNameDuplicate) {
                alert('Tên sản phẩm đã tồn tại.');
                return;
            }

            if (!form.productName.trim()) {
                alert('Vui lòng nhập tên sản phẩm!');
                return;
            }

            const isExisted = await checkProductNameExists(form.productName);
            if (isExisted) {
                alert('Tên sản phẩm đã tồn tại, vui lòng chọn tên khác!');
                return;
            }

            if (!form.width || !form.height || !form.thickness) {
                alert('Vui lòng nhập đầy đủ kích thước (rộng, cao, dày)!');
                return;
            }

            // Create payload with automatic product type detection
            const payload = {
                ProductName: form.productName,
                Width: form.width,
                Height: form.height,
                Thickness: parseFloat(form.thickness),
                UOM: 'Tấm',
                ProductType: form.glassStructureId ? 'Thành phẩm' : 'NVL',
                UnitPrice: form.unitPrice,
                GlassStructureId: form.glassStructureId || null,
                Isupdatemisa: form.isupdatemisa === 1,
            };

            const res = await createProduct(payload);
            alert('Đã tạo sản phẩm: ' + res.productName);
            router.push(`/products/${res.id}`);
        } catch (e: any) {
            const errorMessage = e.response?.data?.message || e.response?.data?.error || e.message || 'Tạo sản phẩm thất bại';
            alert(`Tạo sản phẩm thất bại: ${errorMessage}`);
        }
    };

    const calculateArea = () => {
        const width = parseFloat(form.width) || 0;
        const height = parseFloat(form.height) || 0;
        return ((width * height) / 1_000_000).toFixed(2);
    };

    return (
        <ProtectedRoute requiredRole={[1, 2]}>
            <div className="max-w-4xl mx-auto p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Thêm sản phẩm</h1>
                    <p className="text-gray-600">
                        {form.glassStructureId ? 'Tạo sản phẩm thành phẩm với cấu trúc kính' : 'Tạo sản phẩm nguyên vật liệu'}
                    </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                    <div className="mb-6">
                        <h4 className="text-lg font-semibold mb-3 text-gray-800">Thông tin sản phẩm</h4>

                        <div className="mb-4">
                            <label className="block mb-2 font-medium text-gray-700">Tên sản phẩm</label>
                            <input
                                className="input input-bordered w-full bg-gray-50 text-gray-700"
                                value={form.productName}
                                disabled
                                placeholder="Tên sẽ được tự động tạo..."
                            />
                            {isProductNameDuplicate && (
                                <p className="text-red-500 text-sm mt-1">Tên sản phẩm đã tồn tại. Vui lòng nhập tên khác.</p>
                            )}
                        </div>
                    </div>

                    <div className="mb-6">
                        <h4 className="text-lg font-semibold mb-3 text-gray-800">Kích thước</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block mb-2 font-medium text-gray-700">Rộng (mm)</label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full focus:ring-2 focus:ring-blue-500"
                                    value={form.width}
                                    onChange={(e) => handleWidthChange(e.target.value)}
                                    placeholder="Nhập số..."
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-medium text-gray-700">Cao (mm)</label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full focus:ring-2 focus:ring-blue-500"
                                    value={form.height}
                                    onChange={(e) => handleHeightChange(e.target.value)}
                                    placeholder="Nhập số..."
                                />
                            </div>
                            <div>
                                <label className="block mb-2 font-medium text-gray-700">Dày (mm)</label>
                                <input
                                    type="text"
                                    className="input input-bordered w-full focus:ring-2 focus:ring-blue-500"
                                    value={form.thickness}
                                    onChange={(e) => handleThicknessChange(e.target.value)}
                                    placeholder="Nhập số..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h4 className="text-lg font-semibold mb-3 text-gray-800">Cấu trúc kính</h4>
                        <div>
                            {!form.glassStructureId && (
                                <div className="mb-4">
                                    <label className="flex items-center space-x-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                            checked={form.isTempered}
                                            onChange={(e) => setForm((p) => ({ ...p, isTempered: e.target.checked }))}
                                        />
                                        <div>
                                            <span className="font-medium text-gray-700">Kính cường lực</span>
                                            
                                        </div>
                                    </label>
                                </div>
                            )}
                            
                            {isLoadingStructures && (
                                <div className="flex items-center space-x-2 text-gray-600">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                    <span>Đang tải danh sách cấu trúc kính...</span>
                                </div>
                            )}
                            
                            {structureError && (
                                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3">
                                    <p className="text-red-600 text-sm">{structureError}</p>
                                    <div className="flex gap-2 mt-2">
                                        <button 
                                            className="text-blue-600 text-sm underline"
                                            onClick={() => window.location.reload()}
                                        >
                                            Thử lại
                                        </button>
                                        <button 
                                            className="text-green-600 text-sm underline"
                                            onClick={async () => {
                                                try {
                                                    setIsLoadingStructures(true);
                                                    setStructureError(null);
                                                    const data = await getGlassStructures();
                                                    setGlassStructures(data);
                                                } catch (error) {
                                                    setStructureError('Thử lại thất bại. Vui lòng thử lại sau.');
                                                } finally {
                                                    setIsLoadingStructures(false);
                                                }
                                            }}
                                        >
                                            Test API
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            
                            
                            {!isLoadingStructures && !structureError && glassStructures.length > 0 && (
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <AsyncSelect
                                            cacheOptions
                                            defaultOptions
                                            className="w-full"
                                            classNamePrefix="select"
                                            loadOptions={(input, cb) => {
                                                const filteredOptions = glassStructures
                                                    .filter((g) => 
                                                        g.productCode?.toLowerCase().includes(input.toLowerCase())
                                                    )
                                                    .map((g) => ({ 
                                                        label: g.productCode, 
                                                        value: g.id 
                                                    }));
                                                
                                                cb(filteredOptions);
                                            }}
                                            onChange={(opt) => setForm((p) => ({ ...p, glassStructureId: opt && opt.value !== null ? opt.value : undefined }))}
                                            value={
                                                form.glassStructureId 
                                                    ? glassStructures
                                                        .filter((g) => g.id === form.glassStructureId)
                                                        .map((g) => ({ 
                                                            label: g.productCode, 
                                                            value: g.id 
                                                        }))[0] || null
                                                    : null
                                            }
                                            placeholder="Chọn cấu trúc kính..."
                                            noOptionsMessage={() => "Không tìm thấy cấu trúc kính"}
                                        />
                                    </div>
                                    {form.glassStructureId && (
                                        <button
                                            type="button"
                                            onClick={() => setForm((p) => ({ ...p, glassStructureId: undefined }))}
                                            className="btn btn-outline btn-error px-3 py-2"
                                            title="Xóa cấu trúc kính"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            )}
                            
                            
                        </div>
                    </div>

                    <div className="mb-6">
                        <h4 className="text-lg font-semibold mb-3 text-gray-800">Thông tin tính toán</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 font-medium text-gray-700">Diện tích (m²)</label>
                                <div className="input input-bordered bg-gray-50 text-gray-700 font-medium">
                                    {calculateArea()}
                                </div>
                            </div>
                            <div>
                                <label className="block mb-2 font-medium text-gray-700">Đơn giá (₫)</label>
                                <div className="input input-bordered bg-gray-50 text-gray-700 font-medium">
                                    {form.unitPrice.toLocaleString('vi-VN')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                checked={form.isupdatemisa === 1}
                                onChange={(e) => setForm((p) => ({ ...p, isupdatemisa: e.target.checked ? 1 : 0 }))}
                            />
                            <div>
                                <span className="font-medium text-gray-700">Cập nhật MISA</span>
                               
                            </div>
                        </label>
                    </div>

                    <div className="flex gap-4">
                        <button 
                            className="btn btn-primary px-6 py-2" 
                            onClick={handleSave}
                            disabled={!form.width || !form.height || !form.thickness || isLoadingStructures || !!structureError}
                        >
                            {isLoadingStructures ? 'Đang tải...' : 'Lưu sản phẩm'}
                        </button>
                        <button 
                            className="btn btn-outline px-6 py-2" 
                            onClick={() => router.push('/products')}
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default ProductCreatePage;
