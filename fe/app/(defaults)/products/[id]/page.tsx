'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProductById, getGlassStructureById, ProductDetail, GlassStructureOption } from './service';

const ProductDetailPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [glassStructureName, setGlassStructureName] = useState<string>('');

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
                    setGlassStructureName(''); // ← đảm bảo xoá tên cũ nếu không có
                }
            } catch (err) {
                console.error('Lỗi khi tải dữ liệu sản phẩm hoặc cấu trúc kính:', err);
            }
        };

        fetchData();
    }, [id]);

    if (!product) return <div className="p-6 text-red-600">Đang tải dữ liệu...</div>;

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-6">Chi tiết sản phẩm</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                    <input type="text" value={product.productName ?? ''} disabled className="w-full border px-3 py-2 rounded-lg bg-gray-100" />
                </div>
                <div>
                    <label className="block font-medium text-gray-700 mb-1">Chủng loại</label>
                    <input type="text" value={product.productType ?? ''} disabled className="w-full border px-3 py-2 rounded-lg bg-gray-100" />
                </div>
                <div>
                    <label className="block font-medium text-gray-700 mb-1">Đơn vị tính</label>
                    <input type="text" value={product.uom ?? ''} disabled className="w-full border px-3 py-2 rounded-lg bg-gray-100" />
                </div>
                <div>
                    <label className="block font-medium text-gray-700 mb-1">Chiều cao</label>
                    <input type="text" value={product.height ?? ''} disabled className="w-full border px-3 py-2 rounded-lg bg-gray-100" />
                </div>
                <div>
                    <label className="block font-medium text-gray-700 mb-1">Chiều rộng</label>
                    <input type="text" value={product.width ?? ''} disabled className="w-full border px-3 py-2 rounded-lg bg-gray-100" />
                </div>
                <div>
                    <label className="block font-medium text-gray-700 mb-1">Độ dày (mm)</label>
                    <input type="number" value={product.thickness ?? ''} disabled className="w-full border px-3 py-2 rounded-lg bg-gray-100" />
                </div>
                <div>
                    <label className="block font-medium text-gray-700 mb-1">Trọng lượng (kg)</label>
                    <input type="number" value={product.weight ?? ''} disabled className="w-full border px-3 py-2 rounded-lg bg-gray-100" />
                </div>
                <div>
                    <label className="block font-medium text-gray-700 mb-1">Đơn giá (₫)</label>
                    <input
                        type="text"
                        value={product.unitPrice !== undefined && product.unitPrice !== null ? product.unitPrice.toLocaleString() + ' ₫' : ''}
                        disabled
                        className="w-full border px-3 py-2 rounded-lg bg-gray-100"
                    />
                </div>
                <div>
                    <label className="block font-medium text-gray-700 mb-1">Cấu trúc kính</label>
                    <input type="text" value={glassStructureName || ''} disabled className="w-full border px-3 py-2 rounded-lg bg-gray-100" />
                </div>
            </div>

            <div className="pt-6 flex gap-4">
                <button onClick={() => router.back()} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition">
                    ◀ Quay lại
                </button>
                <button onClick={() => router.push(`/products/edit/${product.id}`)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    ✏️ Sửa sản phẩm
                </button>
            </div>
        </div>
    );
};

export default ProductDetailPage;
