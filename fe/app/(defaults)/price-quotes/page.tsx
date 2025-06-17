'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { mockPriceQuotes as initialQuotes } from '@/app/data/price-quotes';
import { useSearchParams } from 'next/navigation';

const Pagination = ({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) => {
    const renderPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition ${currentPage === i ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-300'}`}
                >
                    {i}
                </button>,
            );
        }
        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
            >
                &lt;
            </button>
            {renderPageNumbers()}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
            >
                &gt;
            </button>
        </div>
    );
};

const PriceQuotePage = () => {
    const [quotes, setQuotes] = useState(initialQuotes);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [priceSort, setPriceSort] = useState<'asc' | 'desc' | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const router = useRouter();
    const [message, setMessage] = useState('');

    const handleDelete = (id: string) => {
        const deletedItem = quotes.find((q) => q.id === id);
        if (deletedItem && confirm(`Bạn có chắc chắn muốn xóa báo giá: ${deletedItem.productName}?`)) {
            setQuotes((prev) => prev.filter((q) => q.id !== id));
            setMessage(`🗑️ Đã xóa báo giá thành công: ${deletedItem.productName}`);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const filteredQuotes = quotes
        .filter((item) => item.productName.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter((item) => (typeFilter ? item.type === typeFilter : true))
        .filter((item) => (categoryFilter ? item.category === categoryFilter : true))
        .sort((a, b) => {
            if (priceSort === 'asc') return a.price - b.price;
            if (priceSort === 'desc') return b.price - a.price;
            return 0;
        });

    const handleCreateNew = () => {
        router.push('/price-quotes/create');
    };

    const totalPages = Math.ceil(filteredQuotes.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedQuotes = filteredQuotes.slice(startIndex, startIndex + itemsPerPage);
    const searchParams = useSearchParams();
    const successMessage = searchParams.get('success');

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Báo giá</h2>
                <button onClick={handleCreateNew} className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-xl shadow transition duration-200">
                    + Thêm báo giá
                </button>
            </div>
            
            {successMessage && (
                <div className="mb-4 p-3 rounded-xl bg-green-100 text-green-800 border border-green-300">
                    Đã thêm báo giá thành công cho <strong>{successMessage}</strong>.
                </div>
            )}
            {message && <div className="mb-4 p-3 rounded bg-green-100 text-green-800 border border-green-300">{message}</div>}

            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <input
                    type="text"
                    placeholder="Tìm theo tên hàng..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="input input-bordered w-full md:w-1/3 pl-4 pr-4 py-2 rounded-lg shadow-sm"
                />
                <div className="flex flex-wrap items-center gap-4">
                    <select
                        className="select select-bordered pl-4 pr-4 py-2 rounded-lg shadow-sm"
                        value={categoryFilter}
                        onChange={(e) => {
                            setCategoryFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="">Tất cả phân loại</option>
                        {Array.from(new Set(initialQuotes.map((q) => q.category))).map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                    <select
                        className="select select-bordered pl-4 pr-4 py-2 rounded-lg shadow-sm"
                        value={typeFilter}
                        onChange={(e) => {
                            setTypeFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="">Tất cả loại</option>
                        {Array.from(new Set(initialQuotes.map((q) => q.type))).map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                    <select
                        onChange={(e) => {
                            const val = e.target.value;
                            setPriceSort(val === 'asc' ? 'asc' : val === 'desc' ? 'desc' : null);
                            setCurrentPage(1);
                        }}
                        className="select select-bordered pl-4 pr-4 py-2 rounded-lg shadow-sm"
                        defaultValue=""
                    >
                        <option value="">Đơn giá</option>
                        <option value="asc">Thấp → Cao</option>
                        <option value="desc">Cao → Thấp</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-3 text-sm text-gray-600">
                <span>
                    Hiển thị {startIndex + 1} đến {Math.min(startIndex + itemsPerPage, filteredQuotes.length)} trong tổng {filteredQuotes.length} báo giá.
                </span>
                <select
                    className="select select-bordered border-gray-300 pl-4 pr-4 py-2 rounded-lg shadow-sm"
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
                            <th>Tên</th>
                            <th>Phân loại</th>
                            <th>Chủng loại</th>
                            <th>Độ dày</th>
                            <th>Trọng lượng</th>
                            <th>Đơn giá</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedQuotes.map((item, index) => (
                            <tr key={index}>
                                <td>{item.productName}</td>
                                <td>{item.category}</td>
                                <td>{item.type}</td>
                                <td>{item.thickness}mm</td>
                                <td>{item.weight}kg/m2</td>
                                <td>{item.price.toLocaleString()}₫</td>
                                <td className="flex gap-2">
                                    <button className="px-2 py-1 text-sm text-white bg-gray-600 rounded hover:bg-gray-800 transition" onClick={() => router.push(`/price-quotes/${item.id}`)}>
                                        Chi tiết
                                    </button>
                                    <button onClick={() => router.push(`/price-quotes/edit/${item.id}`)} className="px-2 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-800 transition">
                                        Sửa
                                    </button>
                                    <button onClick={() => handleDelete(item.id)} className="px-2 py-1 text-sm text-white bg-red-600 rounded hover:bg-red-800 transition">
                                        Xóa
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

export default PriceQuotePage;
