'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPriceQuoteById, PriceQuoteDetail } from './service';

const PriceQuoteDetailPage = () => {
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

    if (!formData) {
        return <div className="p-6 text-red-600">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-6">Chi tiết báo giá</h2>
            <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['productCode', 'productName', 'category', 'edgeType', 'adhesiveType', 'composition'].map((field) => (
                        <div key={field}>
                            <label className="block font-medium text-gray-700 mb-1 capitalize">{field}</label>
                            <input type="text" name={field} value={(formData as any)[field]} disabled className="w-full border px-3 py-2 rounded-lg shadow-sm bg-gray-100 cursor-not-allowed" />
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Số lớp kính</label>
                        <input style={{ height: 35 }} type="number" name="glassLayers" value={formData.glassLayers} disabled className="input w-full bg-gray-100 cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Số lớp keo</label>
                        <input style={{ height: 35 }} type="number" name="adhesiveLayers" value={formData.adhesiveLayers} disabled className="input w-full bg-gray-100 cursor-not-allowed" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Độ dày keo (mm)</label>
                        <input style={{ height: 35 }} type="number" name="adhesiveThickness" value={formData.adhesiveThickness} disabled className="input w-full bg-gray-100 cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Đơn giá (₫)</label>
                        <input style={{ height: 35 }} type="number" name="unitPrice" value={formData.unitPrice} disabled className="input w-full bg-gray-100 cursor-not-allowed" />
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => router.back()} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition">
                        ◀ Quay lại
                    </button>
                    <button type="button" onClick={() => router.push(`/price-quotes/edit/${formData.id}`)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                        ✎ Sửa báo giá
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PriceQuoteDetailPage;
