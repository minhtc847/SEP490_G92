'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getProducts, Product, getProductsNotUpdated, updateManyProducts } from './service';
import IconEye from '@/components/icon/icon-eye';
import IconEdit from '@/components/icon/icon-edit';
import IconTrash from '@/components/icon/icon-trash-lines';
import { deleteProduct } from './service';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ExcelJS from 'exceljs';

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
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();

    const success = searchParams?.get('success');
    const deleted = searchParams?.get('deleted');

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

    const handleUpdateAllProducts = async () => {
        try {
            setIsUpdating(true);
            setUpdateMessage('');
            
            // Lấy danh sách sản phẩm chưa cập nhật
            const productsNotUpdated = await getProductsNotUpdated();
            
            if (productsNotUpdated.length === 0) {
                setUpdateMessage('Không có sản phẩm nào cần cập nhật!');
                return;
            }

            const confirmed = confirm(`Bạn có chắc chắn muốn cập nhật ${productsNotUpdated.length} sản phẩm chưa cập nhật lên MISA?`);
            if (!confirmed) return;

            // Gọi API update tất cả sản phẩm
            await updateManyProducts(productsNotUpdated);
            
            setUpdateMessage(`Đã gửi yêu cầu cập nhật ${productsNotUpdated.length} sản phẩm lên MISA. Quá trình này sẽ chạy trong background.`);
            
            // Refresh danh sách sản phẩm sau 2 giây
            setTimeout(() => {
                router.refresh();
            }, 2000);
            
        } catch (err) {
            console.error('Lỗi khi cập nhật sản phẩm:', err);
            setUpdateMessage('Có lỗi xảy ra khi cập nhật sản phẩm!');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleExportToExcel = async () => {
        const data = filteredProducts.map((p) => ({
            'STT': '',
            'Tên sản phẩm': p.productName || '-',
            'Loại SP': p.productType || '-',
            'Đơn vị tính': p.uom || '-',
            'Cập nhật MISA': p.isupdatemisa === 1 ? 'Đã cập nhật' : 'Chưa cập nhật',
        }));

        // Thêm STT
        data.forEach((item, index) => {
            item['STT'] = (index + 1).toString();
        });

        const headers = ['STT', 'Tên sản phẩm', 'Loại SP', 'Đơn vị tính', 'Cập nhật MISA'];

        // Tạo workbook mới
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sản Phẩm');

        // Thêm tiêu đề
        const titleRow = worksheet.addRow(['DANH SÁCH SẢN PHẨM']);
        titleRow.height = 30;
        worksheet.mergeCells('A1:E1');
        
        // Định dạng tiêu đề
        const titleCell = worksheet.getCell('A1');
        titleCell.font = { bold: true, size: 18 };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        titleCell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        // Thêm header
        const headerRow = worksheet.addRow(headers);
        headerRow.height = 25;
        
        // Định dạng header
        headerRow.eachCell((cell, colNumber) => {
            cell.font = { bold: true };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD3D3D3' }
            };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Thêm dữ liệu
        // data.forEach((row) => {
        //     const dataRow = worksheet.addRow(headers.map(header => row[header]));
        //     dataRow.height = 20;
            
        //     dataRow.eachCell((cell, colNumber) => {
        //         cell.border = {
        //             top: { style: 'thin' },
        //             left: { style: 'thin' },
        //             bottom: { style: 'thin' },
        //             right: { style: 'thin' }
        //         };
        //     });
        // });


        // Auto-size columns
        // worksheet.columns.forEach(column => {
        //     let maxLength = 0;
        //     column.eachCell({ includeEmpty: true }, (cell) => {
        //         const columnLength = cell.value != null ? cell.value.toString().length : 10;
        //         if (columnLength > maxLength) {
        //             maxLength = columnLength;
        //         }
        //     });
        //     column.width = Math.min(Math.max(maxLength + 2, 10), 50);
        // });

        // Xuất file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `SanPham_${new Date().toLocaleDateString('vi-VN').replaceAll('/', '-')}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <ProtectedRoute requiredRole={[1, 2]}>
            <div className="p-6 bg-white rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Danh sách sản phẩm</h2>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handleUpdateAllProducts} 
                            disabled={isUpdating}
                            className="px-4 py-2 text-sm text-white bg-orange-600 rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUpdating ? 'Đang cập nhật...' : 'Cập nhật tất cả sản phẩm chưa cập nhật'}
                        </button>
                        <button onClick={handleExportToExcel} className="px-4 py-2 text-sm text-white bg-gray-600 rounded hover:bg-gray-700">
                            Xuất excel
                        </button>
                        <button onClick={() => router.push('/products/create')} className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-xl shadow">
                            + Thêm sản phẩm
                        </button>
                    </div>
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
                {updateMessage && (
                    <div className={`mb-4 p-3 rounded-xl border ${
                        updateMessage.includes('lỗi') || updateMessage.includes('thất bại') 
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : 'bg-blue-100 text-blue-800 border-blue-300'
                    }`}>
                        {updateMessage.includes('lỗi') || updateMessage.includes('thất bại') ? '❌' : '🔄'} {updateMessage}
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
                                <th>Loại SP</th>
                                <th>Đơn vị tính</th>
                                <th>Cập nhật MISA</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedProducts.map((product) => (
                                <tr key={product.id}>
                                    <td>{product.productName}</td>
                                    <td>{product.productType}</td>
                                    <td>{product.uom}</td>
                                    <td>
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
                                    </td>
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
        </ProtectedRoute>
    );
};

export default ProductListPage;
