'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getProducts, Product } from './service';
import IconEye from '@/components/icon/icon-eye';
import IconEdit from '@/components/icon/icon-edit';
import IconTrash from '@/components/icon/icon-trash-lines';
import { deleteProduct } from './service';

const Pagination = ({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) => {
    return (
        <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="w-8 h-8 rounded-full bg-gray-200 disabled:opacity-50">
                &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => onPageChange(page)} className={`w-8 h-8 rounded-full ${page === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-300'}`}>
                    {page}
                </button>
            ))}
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="w-8 h-8 rounded-full bg-gray-200 disabled:opacity-50">
                &gt;
            </button>
        </div>
    );
};

const ProductListPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [productTypeFilter, setProductTypeFilter] = useState('');
    const [uomFilter, setUomFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const router = useRouter();
    const searchParams = useSearchParams();

    const success = searchParams.get('success');
    const deleted = searchParams.get('deleted');

    useEffect(() => {
        getProducts()
            .then((data) => {
                setProducts(data);
                setFilteredProducts(data);
            })
            .catch((err) => console.error('Lỗi khi tải sản phẩm:', err));
    }, []);

    useEffect(() => {
        let result = [...products];
        if (searchTerm) {
            result = result.filter((p) => p.productName?.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (productTypeFilter) {
            result = result.filter((p) => p.productType === productTypeFilter);
        }
        if (uomFilter) {
            result = result.filter((p) => p.uom === uomFilter);
        }
        setFilteredProducts(result);
        setCurrentPage(1);
    }, [searchTerm, productTypeFilter, uomFilter, products]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

    const uniqueProductTypes = Array.from(new Set(products.map((p) => p.productType).filter(Boolean)));
    const uniqueUoms = Array.from(new Set(products.map((p) => p.uom).filter(Boolean)));

    const handleDelete = async (id: string, name?: string) => {
        const confirmed = confirm(`Bạn có chắc chắn muốn xoá sản phẩm: ${name ?? 'này'}?`);
        if (!confirmed) return;

        try {
            await deleteProduct(id);
            alert(`Xoá sản phẩm ${name ?? ''} thành công!`);
            router.refresh(); 
        } catch (err) {
            console.error('Lỗi khi xoá sản phẩm:', err);
            alert('Xoá sản phẩm thất bại!');
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Danh sách sản phẩm</h2>
                <button onClick={() => router.push('/products/create')} className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-xl shadow">
                    + Thêm sản phẩm
                </button>
            </div>

            {success && (
                <div className="mb-4 p-3 rounded-xl bg-green-100 text-green-800 border border-green-300">
                    ✅ Đã lưu sản phẩm thành công: <strong>{success}</strong>
                </div>
            )}
            {deleted && (
                <div className="mb-4 p-3 rounded-xl bg-red-100 text-red-800 border border-red-300">
                    🗑️ Đã xoá sản phẩm: <strong>{deleted}</strong>
                </div>
            )}

            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <input
                    type="text"
                    placeholder="Tìm theo tên sản phẩm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input input-bordered w-full md:w-1/3 px-4 py-2 rounded-lg shadow-sm"
                />
                <div className="flex flex-wrap items-center gap-4">
                    <select className="select select-bordered" value={productTypeFilter} onChange={(e) => setProductTypeFilter(e.target.value)}>
                        <option value="">Tất cả chủng loại</option>
                        {uniqueProductTypes.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                    <select className="select select-bordered" value={uomFilter} onChange={(e) => setUomFilter(e.target.value)}>
                        <option value="">Tất cả đơn vị</option>
                        {uniqueUoms.map((uom) => (
                            <option key={uom} value={uom}>
                                {uom}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-3 text-sm text-gray-600">
                <span>
                    Hiển thị {startIndex + 1} đến {Math.min(startIndex + itemsPerPage, filteredProducts.length)} trong tổng {filteredProducts.length} sản phẩm.
                </span>
                <select
                    className="select select-bordered border-gray-300 px-4 py-2 rounded-lg shadow-sm"
                    value={itemsPerPage}
                    onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                    }}
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                </select>
            </div>

            <div className="overflow-x-auto mb-5">
                <table className="table w-full">
                    <thead>
                        <tr>
                            <th>Tên sản phẩm</th>
                            <th>Chủng loại</th>
                            <th>Đơn vị tính</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedProducts.map((product) => (
                            <tr key={product.id}>
                                <td>{product.productName}</td>
                                <td>{product.productType}</td>
                                <td>{product.uom}</td>
                                <td className="flex gap-2">
                                    <button onClick={() => router.push(`/products/${product.id}`)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-300 transition" title="Chi tiết">
                                        <IconEye className="w-5 h-5 text-gray-700" />
                                    </button>
                                    <button onClick={() => router.push(`/products/edit/${product.id}`)} className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 transition" title="Sửa">
                                        <IconEdit className="w-5 h-5 text-blue-700" />
                                    </button>
                                    <button onClick={() => handleDelete(product.id, product.productName)} className="p-2 bg-red-100 rounded-full hover:bg-red-200 transition" title="Xoá">
                                        <IconTrash className="w-5 h-5 text-red-700" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
    );
};

export default ProductListPage;
