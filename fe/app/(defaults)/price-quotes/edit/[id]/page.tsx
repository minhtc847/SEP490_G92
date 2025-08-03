'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPriceQuoteById, updatePriceQuote, PriceQuoteDetail, deletePriceQuote } from './service';

const PriceQuoteEditPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const [formData, setFormData] = useState<PriceQuoteDetail | null>(null);

    useEffect(() => {
        if (id) {
            getPriceQuoteById(String(id))
                .then(setFormData)
                .catch((err) => {
                    console.error('Lỗi khi tải báo giá:', err);
                });
        }
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) =>
            prev
                ? {
                      ...prev,
                      [name]: ['glassLayers', 'adhesiveLayers', 'adhesiveThickness', 'unitPrice'].includes(name) ? Number(value) : value,
                  }
                : null,
        );
    };

    const handleDelete = async () => {
        if (!formData) return;
        const confirmDelete = confirm(`Bạn có chắc chắn muốn xoá báo giá: ${formData.productName}?`);
        if (!confirmDelete) return;

        try {
            await deletePriceQuote(String(formData.id));
            alert(`Đã xoá báo giá cho sản phẩm: ${formData.productName}`);
            router.push(`/price-quotes`);
        } catch (err) {
            console.error('Lỗi khi xoá báo giá:', err);
            alert('Xoá báo giá thất bại!');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;
        try {
            await updatePriceQuote(formData.id, formData);
            alert(`Đã cập nhật báo giá cho sản phẩm: ${formData.productName}`);
            router.push(`/price-quotes/${formData.id}`);
        } catch (err) {
            console.error('Lỗi khi cập nhật báo giá:', err);
        }
    };

    if (!formData) {
        return <div className="p-6 text-red-600">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-6">Chỉnh sửa báo giá</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Mã sản phẩm</label>
                        <input type="text" name="productCode" value={formData.productCode} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg shadow-sm" />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                        <input type="text" name="productName" value={formData.productName} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg shadow-sm" />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Phân loại</label>
                        <input type="text" name="category" value={formData.category} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg shadow-sm" />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Loại cạnh</label>
                        <input type="text" name="edgeType" value={formData.edgeType} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg shadow-sm" />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Loại keo</label>
                        <input type="text" name="adhesiveType" value={formData.adhesiveType} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg shadow-sm" />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Thành phần</label>
                        <input type="text" name="composition" value={formData.composition} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg shadow-sm" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Số lớp kính</label>
                        <input style={{ height: 35 }} type="number" name="glassLayers" value={formData.glassLayers} onChange={handleChange} className="input w-full" />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Số lớp keo</label>
                        <input style={{ height: 35 }} type="number" name="adhesiveLayers" value={formData.adhesiveLayers} onChange={handleChange} className="input w-full" />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Độ dày keo (mm)</label>
                        <input style={{ height: 35 }} type="number" name="adhesiveThickness" value={formData.adhesiveThickness} onChange={handleChange} className="input w-full" />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Đơn giá (₫)</label>
                        <input style={{ height: 35 }} type="number" name="unitPrice" value={formData.unitPrice} onChange={handleChange} className="input w-full" />
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                    <button type="button" onClick={() => router.back()} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition">
                        ◀ Quay lại
                    </button>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                        💾 Lưu thay đổi
                    </button>
                    <button type="button" onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
                        🗑️ Xoá báo giá
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PriceQuoteEditPage;
