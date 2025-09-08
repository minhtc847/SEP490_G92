'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AsyncSelect from 'react-select/async';
import { getProductById, updateProduct, deleteProduct, ProductDetail, getGlassStructureById, updateProductMisa, InputUpdateProduct } from './service';
import { searchGlassStructures, GlassStructureOption } from '@/app/(defaults)/products/edit/[id]/service';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const ProductEditPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [glassStructureName, setGlassStructureName] = useState<string>('');
    const [formData, setFormData] = useState<ProductDetail | null>(null);
    const [glassStructureOptions, setGlassStructureOptions] = useState<GlassStructureOption[]>([]);
    const [selectedGlassStructure, setSelectedGlassStructure] = useState<GlassStructureOption | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!id) return;

                const productData = await getProductById(String(id));
                setProduct(productData);

                if (productData.glassStructureId) {
                    const structure = await getGlassStructureById(productData.glassStructureId);
                    if (structure?.productName) {
                        setGlassStructureName(structure.productName);
                    }
                } else {
                    setGlassStructureName('');
                }

                setFormData(productData);
                if (productData.glassStructureId) {
                    const options = await searchGlassStructures('');
                    setGlassStructureOptions(options);
                    const matched = options.find((opt) => opt.id === productData.glassStructureId);
                    setSelectedGlassStructure(matched ?? null);
                }

                const allOptions = await searchGlassStructures('');
                setGlassStructureOptions(allOptions);
            } catch (err) {
                console.error('Lỗi khi tải dữ liệu sản phẩm hoặc cấu trúc kính:', err);
            }
        };

        fetchData();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) =>
            prev
                ? {
                      ...prev,
                      [name]: ['thickness', 'weight', 'unitPrice'].includes(name) ? Number(value) : value
                  }
                : null,
        );
    };

    const handleStructureChange = (selected: GlassStructureOption | null) => {
        setSelectedGlassStructure(selected);
        setFormData((prev) => (prev ? { ...prev, glassStructureId: selected ? selected.id : undefined } : null));
    };

    const handleDelete = async () => {
        if (!formData) return;
        const confirmDelete = confirm(`Bạn có chắc chắn muốn xoá sản phẩm: ${formData.productName}?`);
        if (!confirmDelete) return;

        try {
            await deleteProduct(String(formData.id));
            alert(`Xoá sản phẩm ${formData.productName ?? ''} thành công!`);
            router.push('/products');
        } catch (err) {
            console.error('Lỗi khi xoá sản phẩm:', err);
            alert('Xoá sản phẩm thất bại!');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;
        try {
            const changed =
                (product?.productName ?? '') !== (formData.productName ?? '') ||
                (product?.uom ?? '') !== (formData.uom ?? '') ||
                (product?.productCode ?? '') !== (formData.productCode ?? '');
            await updateProduct(formData.id, formData);
            if (changed) {
                try {
                    const latest = await getProductById(String(formData.id));
                    const payload: InputUpdateProduct = {
                        productCode: latest.productCode ?? '',
                        name: latest.productName ?? '',
                        unit: latest.uom ?? ''
                    };
                    await updateProductMisa(payload);
                } catch (misaErr) {
                    console.error('Lỗi khi cập nhật MISA:', misaErr);
                }
            }
            alert(`Cập nhật sản phẩm ${formData.productName ?? ''} thành công!`);
            router.push(`/products/${formData.id}`);
        } catch (err) {
            console.error('Lỗi khi cập nhật sản phẩm:', err);
        }
    };

    if (!formData) return <div className="p-6 text-red-600">Đang tải dữ liệu...</div>;

    return (
        <ProtectedRoute requiredRole={[1, 2]}>

        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-6">Chỉnh sửa sản phẩm</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                        <input type="text" name="productName" value={formData.productName ?? ''} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg shadow-sm" />
                    </div>

                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Loại SP</label>
                        <input disabled type="text" name="productType" value={formData.productType ?? ''} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg shadow-sm" />
                    </div>

                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Đơn vị tính</label>
                        <input type="text" name="uom" value={formData.uom ?? ''} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg shadow-sm" />
                    </div>

                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Chiều cao</label>
                        <input type="text" name="height" value={formData.height ?? ''} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg shadow-sm" />
                    </div>

                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Chiều rộng</label>
                        <input type="text" name="width" value={formData.width ?? ''} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg shadow-sm" />
                    </div>

                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Độ dày (mm)</label>
                        <input type="number" name="thickness" value={formData.thickness ?? ''} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg shadow-sm" />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Trọng lượng (kg)</label>
                        <input type="number" name="weight" value={formData.weight ?? ''} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg shadow-sm" />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Đơn giá (₫)</label>
                        <input type="number" name="unitPrice" value={formData.unitPrice ?? ''} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg shadow-sm" />
                    </div>

                    <div className="block font-medium text-gray-700 mb-1">
                        <label className="block font-medium text-gray-700 mb-1">Cấu trúc kính</label>
                        <input type="text" value={glassStructureName || ''} disabled className="w-full border px-3 py-2 rounded-lg bg-gray-100" />
                    </div>
                    <div className="block font-medium text-gray-700 mb-1">
                        <label className="block font-medium text-gray-700 mb-1">Cấu trúc kính thay thế</label>
                        <AsyncSelect
                            cacheOptions
                            defaultOptions
                            loadOptions={searchGlassStructures}
                            onChange={handleStructureChange}
                            getOptionLabel={(e) => e.productName}
                            getOptionValue={(e) => String(e.id)}
                            placeholder="Tìm kiếm cấu trúc kính..."
                            isClearable
                            value={selectedGlassStructure}
                        />
                    </div>
                    <div>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                name="isupdatemisa"
                                checked={formData.isupdatemisa === 1}
                                onChange={(e) => setFormData(prev => prev ? { ...prev, isupdatemisa: e.target.checked ? 1 : 0 } : null)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <span className="font-medium text-gray-700">Cập nhật MISA</span>
                        </label>
                        <p className="text-sm text-gray-500 mt-1">Đánh dấu nếu sản phẩm đã được cập nhật vào hệ thống MISA</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                    <button type="button" onClick={() => router.back()} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition">
                        ◀ Quay lại
                    </button>
                    <button type="submit" onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                        💾 Lưu thay đổi
                    </button>
                    <button type="button" onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                        🗑️ Xoá sản phẩm
                    </button>
                </div>
            </form>
        </div>
        </ProtectedRoute>

    );
};

export default ProductEditPage;
