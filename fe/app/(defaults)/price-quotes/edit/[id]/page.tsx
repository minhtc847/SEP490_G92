'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockPriceQuotes } from '@/app/data/price-quotes';

interface PriceQuote {
    id: string;
    productName: string;
    type: string;
    category: string;
    thickness: number;
    weight: number;
    price: number;
}

const PriceQuoteEditPage = () => {
    const { id } = useParams();
    const router = useRouter();

    const quote = mockPriceQuotes.find((q) => q.id === id);
    const [formData, setFormData] = useState<PriceQuote | null>(quote || null);

    if (!formData) {
        return <div className="p-6 text-red-600">Không tìm thấy báo giá với ID: {id}</div>;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) =>
            prev
                ? {
                      ...prev,
                      [name]: ['price', 'weight', 'thickness'].includes(name) ? Number(value) : value,
                  }
                : null
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Updated data:', formData);
        router.push('/price-quotes');
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-6">Chỉnh sửa báo giá</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                    <input
                        type="text"
                        name="productName"
                        value={formData.productName}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded-lg shadow-sm focus:ring focus:ring-blue-200"
                    />
                </div>
                <div>
                    <label className="block font-medium text-gray-700 mb-1">Loại</label>
                    <input
                        type="text"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded-lg shadow-sm focus:ring focus:ring-blue-200"
                    />
                </div>
                <div>
                    <label className="block font-medium text-gray-700 mb-1">Phân loại</label>
                    <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full border px-3 py-2 rounded-lg shadow-sm focus:ring focus:ring-blue-200"
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Độ dày (mm)</label>
                        <input
                            type="number"
                            name="thickness"
                            value={formData.thickness}
                            onChange={handleChange}
                            className="w-full border px-3 py-2 rounded-lg shadow-sm focus:ring focus:ring-blue-200"
                        />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Trọng lượng (kg/m2)</label>
                        <input
                            type="number"
                            name="weight"
                            value={formData.weight}
                            onChange={handleChange}
                            className="w-full border px-3 py-2 rounded-lg shadow-sm focus:ring focus:ring-blue-200"
                        />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Đơn giá (₫)</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            className="w-full border px-3 py-2 rounded-lg shadow-sm focus:ring focus:ring-blue-200"
                        />
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                    >
                        ◀ Quay lại
                    </button>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Lưu thay đổi
                    </button>
                    
                </div>
            </form>
        </div>
    );
};

export default PriceQuoteEditPage;
