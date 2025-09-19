'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProductById, getGlassStructureById, updateMisaProduct, updateProductMisaStatus, ProductDetail, GlassStructureOption } from './service';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const ProductDetailPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [glassStructureName, setGlassStructureName] = useState<string>('');
    const [isUpdatingMisa, setIsUpdatingMisa] = useState<boolean>(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
    const [showErrorMessage, setShowErrorMessage] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

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

    const handleUpdateMisa = async () => {
        if (!product) return;

        setIsUpdatingMisa(true);
        setShowSuccessMessage(false);
        setShowErrorMessage(false);
        setErrorMessage('');

        try {
            // Gọi API cập nhật MISA
            await updateMisaProduct(product).then(
                async () => {
                    const updatedProduct = await getProductById(String(product.id));
                    setProduct(updatedProduct);
                }
            );

            // Sau khi cập nhật MISA thành công, cập nhật trạng thái isupdatemisa thành true
             await updateProductMisaStatus(product.id);

            // Cập nhật trạng thái ngay lập tức trong state để UI phản hồi ngay
            setProduct(prev => prev ? { ...prev, isupdatemisa: 2 } : null);


            // Hiển thị thông báo thành công
            // setShowSuccessMessage(true);

            // Ẩn thông báo sau 3 giây
            setTimeout(() => {
                setShowSuccessMessage(false);
            }, 3000);

        } catch (error: any) {
            console.error('Lỗi khi cập nhật MISA:', error);
            setErrorMessage(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật MISA');
            setShowErrorMessage(true);

            // Ẩn thông báo lỗi sau 5 giây
            setTimeout(() => {
                setShowErrorMessage(false);
            }, 5000);
        } finally {
            setIsUpdatingMisa(false);
        }
    };

    if (!product) return <div className="p-6 text-red-600">Đang tải dữ liệu...</div>;

    return (
        <ProtectedRoute requiredRole={[1, 2]}>
        <div className="relative p-6 bg-white rounded-lg shadow-md">
            {/* Loading Overlay */}
            {isUpdatingMisa && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50 rounded-lg">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                        <p className="text-lg font-medium text-gray-700">Đang cập nhật MISA...</p>
                        <p className="text-sm text-gray-500 mt-2">Vui lòng không thao tác trong khi đang xử lý</p>
                    </div>
                </div>
            )}
            <h2 className="text-xl font-bold mb-6">Chi tiết sản phẩm</h2>

            {/* Success Message */}
            {showSuccessMessage && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                    ✅ Cập nhật MISA thành công!
                </div>
            )}

            {/* Error Message */}
            {showErrorMessage && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    ❌ {errorMessage}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block font-medium text-gray-700 mb-1">Tên sản phẩm</label>
                    <input type="text" value={product.productName ?? ''} disabled className="w-full border px-3 py-2 rounded-lg bg-gray-100" />
                </div>
                <div>
                    <label className="block font-medium text-gray-700 mb-1">Loại SP</label>
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
                <div>
                    <label className="block font-medium text-gray-700 mb-1">Trạng thái cập nhật MISA</label>
                    <div className="w-full border px-3 py-2 rounded-lg bg-gray-100">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.isupdatemisa === 1
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}>
                            {product.isupdatemisa === 1
                                ? 'Đã cập nhật'
                                : product.isupdatemisa === 2
                                    ? 'Đang cập nhật'
                                    : 'Chưa cập nhật'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="pt-6 flex gap-4">
                <button onClick={() => router.back()} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition">
                    ◀ Quay lại
                </button>
                <button onClick={() => router.push(`/products/edit/${product.id}`)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    ✏️ Sửa sản phẩm
                </button>
                <button
                    onClick={handleUpdateMisa}
                    disabled={isUpdatingMisa || product.isupdatemisa === 1}
                    className={`px-4 py-2 rounded-lg transition ${
                        isUpdatingMisa
                            ? 'bg-orange-400 text-white cursor-not-allowed'
                            : product.isupdatemisa === 1
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                >
                    {isUpdatingMisa ? (
                        <>
                            <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                            Đang cập nhật MISA...
                        </>
                    ) : product.isupdatemisa === 1 ? (
                        '✅ Đã cập nhật MISA'
                    ) : (
                        product.isupdatemisa === 2 ? 'Đang cập nhật MISA...': 'Cập nhật MISA'
                    )}
                </button>
            </div>
        </div>
        </ProtectedRoute>
    );
};

export default ProductDetailPage;
