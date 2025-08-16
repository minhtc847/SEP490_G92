'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getPriceQuotes, PriceQuote, PriceQuoteDetail, deletePriceQuote } from '@/app/(defaults)/price-quotes/service';
import IconEye from '@/components/icon/icon-eye';
import IconEdit from '@/components/icon/icon-edit';
import IconTrash from '@/components/icon/icon-trash-lines';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

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
    const [quotes, setQuotes] = useState<PriceQuote[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    const [priceSort, setPriceSort] = useState<'asc' | 'desc' | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const router = useRouter();
    const [message, setMessage] = useState('');
    const searchParams = useSearchParams();
    const deletedMessage = searchParams.get('deleted');
    const [formData, setFormData] = useState<PriceQuoteDetail | null>(null);
    const successMessage = searchParams.get('success');

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await getPriceQuotes();
                console.log('DATA:', data);
                setQuotes(data);
            } catch (err) {
                console.error('Lỗi khi tải báo giá:', err);
            }
        };
        fetch();
    }, []);

    const handleDelete = async (id: string) => {
        const deletedItem = quotes.find((q) => q.id === id);
        if (!deletedItem) return;

        const confirmDelete = confirm(`Bạn có chắc chắn muốn xoá báo giá: ${deletedItem.productName}?`);
        if (!confirmDelete) return;

        try {
            await deletePriceQuote(id);
            alert(`Đã xoá báo giá: ${deletedItem.productName}`);
            router.refresh();
        } catch (err) {
            console.error('Lỗi khi xoá báo giá:', err);
            alert('Xoá báo giá thất bại! Không thể xoá báo giá được sử dụng');
        }
    };

    const filteredQuotes = quotes
        .filter((item) => item.productName.toLowerCase().includes(searchTerm.toLowerCase()) || item.productCode.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter((item) => (typeFilter ? item.productCode === typeFilter : true))
        .sort((a, b) => {
            if (priceSort === 'asc') return a.unitPrice - b.unitPrice;
            if (priceSort === 'desc') return b.unitPrice - a.unitPrice;
            return 0;
        });

    const totalPages = Math.ceil(filteredQuotes.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedQuotes = filteredQuotes.slice(startIndex, startIndex + itemsPerPage);

    const handleCreateNew = () => {
        router.push('/price-quotes/create');
    };

    return (
        <ProtectedRoute requiredRole={[1, 2]}>
            <div className="p-6 bg-white rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Báo giá</h2>
                    <button onClick={handleCreateNew} className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-xl shadow transition duration-200">
                        + Thêm báo giá
                    </button>
                </div>

                {message && <div className="mb-4 p-3 rounded bg-green-100 text-green-800 border border-green-300">{message}</div>}

                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <input
                        type="text"
                        placeholder="Tìm theo tên hoặc mã sản phẩm..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="input input-bordered w-full md:w-1/3 pl-4 pr-4 py-2 rounded-lg shadow-sm"
                    />
                    <div className="flex flex-wrap items-center gap-4">


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
                                <th>Mã SP</th>
                                <th>Đơn giá</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedQuotes.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.productName}</td>
                                    <td>{item.productCode}</td>
                                    <td>{item.unitPrice.toLocaleString()}₫</td>
                                    <td className="flex gap-2">
                                        <button onClick={() => router.push(`/price-quotes/${item.id}`)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-300 transition" title="Chi tiết">
                                            <IconEye className="w-5 h-5 text-gray-700" />
                                        </button>
                                        <button onClick={() => router.push(`/price-quotes/edit/${item.id}`)} className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 transition" title="Sửa">
                                            <IconEdit className="w-5 h-5 text-blue-700" />
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-100 rounded-full hover:bg-red-200 transition" title="Xoá">
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
        </ProtectedRoute>
    );
};

export default PriceQuotePage;
