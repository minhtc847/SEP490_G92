'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AsyncSelect from 'react-select/async';
import { createProduct, ProductDetail } from '@/app/(defaults)/products/create/service';
import { searchGlassStructures, GlassStructureOption } from '../edit/[id]/service';

const ProductCreatePage = () => {
    const router = useRouter();
    const [formData, setFormData] = useState<ProductDetail>({
        id: 0,
        productName: '',
        productType: '',
        uom: '',
        height: '',
        width: '',
        thickness: 0,
        weight: 0,
        unitPrice: 0,
        glassStructureId: 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: ['thickness', 'weight', 'unitPrice'].includes(name) ? Number(value) : value,
        }));
    };

    const handleStructureChange = (selected: GlassStructureOption | null) => {
        if (!selected) return;
        setFormData((prev) => ({ ...prev, glassStructureId: selected.id }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createProduct(formData);
            router.push(`/products?success=${encodeURIComponent(formData.productName ?? '')}`);
        } catch (err) {
            console.error('Lỗi khi tạo sản phẩm:', err);
            alert('Tạo sản phẩm thất bại!');
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-6">Tạo sản phẩm mới</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                        <input name="productName" value={formData.productName} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg shadow-sm" required/>
                    </div>

                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Loại</label>
                        <input name="productType" value={formData.productType} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg shadow-sm" required/>
                    </div>

                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Đơn vị tính</label>
                        <input name="uom" value={formData.uom} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg shadow-sm" required />
                    </div>

                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Chiều cao</label>
                        <input name="height" value={formData.height} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg shadow-sm" />
                    </div>

                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Chiều rộng</label>
                        <input name="width" value={formData.width} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg shadow-sm" />
                    </div>

                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Độ dày (mm)</label>
                        <input type="number" name="thickness" value={formData.thickness} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg shadow-sm" />
                    </div>

                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Trọng lượng (kg)</label>
                        <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg shadow-sm" />
                    </div>

                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Đơn giá (₫)</label>
                        <input type="number" name="unitPrice" value={formData.unitPrice} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg shadow-sm" />
                    </div>

                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Cấu trúc kính</label>
                        <AsyncSelect
                            cacheOptions
                            defaultOptions
                            loadOptions={searchGlassStructures}
                            onChange={handleStructureChange}
                            getOptionLabel={(e) => e.productName}
                            getOptionValue={(e) => String(e.id)}
                            placeholder="Tìm cấu trúc kính..."
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                    <button type="button" onClick={() => router.back()} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition">
                        ◀ Quay lại
                    </button>
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                        + Tạo sản phẩm
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductCreatePage;
