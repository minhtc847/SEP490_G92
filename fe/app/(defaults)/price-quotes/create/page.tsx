'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PriceQuoteDetail, createPriceQuote, checkProductCodeExists, checkProductNameExists, getAllCategories } from './service';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Swal from 'sweetalert2';

const PriceQuoteCreatePage = () => {
    const router = useRouter();
    const [formData, setFormData] = useState<PriceQuoteDetail>({
        id: 0,
        productCode: '',
        productName: '',
        edgeType: '',
        adhesiveType: '',
        composition: '',
        glassLayers: 0,
        adhesiveLayers: 0,
        adhesiveThickness: 0,
        unitPrice: 0,
    });

    const [categories, setCategories] = useState<string[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        getAllCategories().then(setCategories).catch(console.error);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        const limits: Record<string, number> = {
            glassLayers: 99999,
            adhesiveLayers: 99999,
            adhesiveThickness: 99999,
            unitPrice: 999999999,
        };

        if (['glassLayers', 'adhesiveLayers', 'adhesiveThickness', 'unitPrice'].includes(name)) {
            const parsed = Number(value);
            const max = limits[name];

            if (!Number.isInteger(parsed) || parsed <= 0) {
                Swal.fire({
                    title: 'Cảnh báo',
                    text: 'Giá trị phải là số nguyên dương và lớn hơn 0',
                    icon: 'warning',
                    toast: true,
                    position: 'bottom-start',
                    showConfirmButton: false,
                    timer: 2500,
                    showCloseButton: true,
                });
                return;
            }
            if (parsed > max) {
                Swal.fire({
                    title: 'Cảnh báo',
                    text: `Giá trị không được vượt quá ${max.toLocaleString('vi-VN')}`,
                    icon: 'warning',
                    toast: true,
                    position: 'bottom-start',
                    showConfirmButton: false,
                    timer: 2500,
                    showCloseButton: true,
                });
                return;
            }
        }

        setFormData((prev) => ({
            ...prev,
            [name]: ['glassLayers', 'adhesiveLayers', 'adhesiveThickness', 'unitPrice'].includes(name) ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const errors: string[] = [];

        try {
            const [codeExists, nameExists] = await Promise.all([checkProductCodeExists(formData.productCode), checkProductNameExists(formData.productName)]);

            if (codeExists) errors.push('❌ Mã sản phẩm đã tồn tại!');
            if (nameExists) errors.push('❌ Tên sản phẩm đã tồn tại!');

            if (errors.length > 0) {
                setError(errors.join('\n'));
                return;
            }

            const newQuote = await createPriceQuote(formData);
            alert(`Đã tạo báo giá cho sản phẩm: ${formData.productName}`);
            router.push(`/price-quotes/${newQuote.id}`);
        } catch (err: any) {
            console.error('Lỗi khi tạo báo giá:', err);

            const message = err.response?.data && typeof err.response.data === 'string' ? `❌ ${err.response.data}` : '❌ Tạo báo giá thất bại!';

            setError(message);
        }
    };

    return (
        <ProtectedRoute requiredRole={[1, 2]}>

        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Tạo báo giá mới</h2>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg whitespace-pre-line border border-red-300">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                        <input type="text" name="productName" value={formData.productName} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg shadow-sm" required />
                    </div>

                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Mã sản phẩm</label>
                        <input type="text" name="productCode" value={formData.productCode} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg shadow-sm" required />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Cạnh</label>
                        <input type="text" name="edgeType" value={formData.edgeType} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg shadow-sm" required />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Keo</label>
                        <input type="text" name="adhesiveType" value={formData.adhesiveType} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg shadow-sm" required />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Cấu tạo</label>
                        <input type="text" name="composition" value={formData.composition} onChange={handleChange} className="w-full border px-3 py-2 rounded-lg shadow-sm" required />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Số lớp kính</label>
                        <input type="number" name="glassLayers" value={formData.glassLayers} onChange={handleChange} className="input w-full" required min={1} max={99999} step={1} />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Số lớp keo</label>
                        <input type="number" name="adhesiveLayers" value={formData.adhesiveLayers} onChange={handleChange} className="input w-full" required min={1} max={99999} step={1} />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Độ dày keo (mm)</label>
                        <input type="number" name="adhesiveThickness" value={formData.adhesiveThickness} onChange={handleChange} className="input w-full" required min={1} max={99999} step={1} />
                    </div>
                    <div>
                        <label className="block font-medium text-gray-700 mb-1">Đơn giá (₫)</label>
                        <input type="number" name="unitPrice" value={formData.unitPrice} onChange={handleChange} className="input w-full" required min={1} max={999999999} step={1} />
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => router.back()} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition">
                        ◀ Quay lại
                    </button>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                        ➕ Thêm báo giá
                    </button>
                </div>
            </form>
        </div>
        </ProtectedRoute>

    );
};

export default PriceQuoteCreatePage;
