'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getProducts, Product, getProductsNotUpdated, updateManyProducts, createProductApi, getGlassStructureOptionsForProducts, GlassStructureOption, CreateProductProductDto } from './service';
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
    const [importing, setImporting] = useState(false);
    const [importErrors, setImportErrors] = useState<string[]>([]);
    const [glassOptions, setGlassOptions] = useState<GlassStructureOption[]>([]);
    const [showImportResult, setShowImportResult] = useState(false);
    const searchParams = useSearchParams();

    const success = searchParams?.get('success');
    const deleted = searchParams?.get('deleted');

    useEffect(() => {
        Promise.all([
            getProducts(),
            getGlassStructureOptionsForProducts()
        ])
            .then(([data, options]) => {
                setProducts(data);
                setFilteredProducts(data);
                setGlassOptions(options || []);
            })
            .catch((err) => console.error('Lỗi khi tải sản phẩm hoặc cấu trúc:', err));
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
            'Mã': p.productCode || (p as any).ProductCode || '-',
            'Tên': p.productName || '-',
            'Tính chất': p.productType || '-',
            'Đơn vị tính chính': p.uom || '-',
            'Cập nhật MISA': p.isupdatemisa === 1 ? 'Đã cập nhật' : 'Chưa cập nhật',
        }));

        // Thêm STT
        data.forEach((item, index) => {
            item['STT'] = (index + 1).toString();
        });

        const headers = ['STT', 'Mã', 'Tên', 'Tính chất', 'Đơn vị tính chính', 'Cập nhật MISA'];

        // Tạo workbook mới
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sản Phẩm');

        // Thêm tiêu đề
        const titleRow = worksheet.addRow(['DANH SÁCH SẢN PHẨM']);
        titleRow.height = 30;
        worksheet.mergeCells('A1:F1');
        
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
        data.forEach((row) => {
            const dataRow = worksheet.addRow(headers.map(header => (row as any)[header]));
            dataRow.height = 20;
            
            dataRow.eachCell((cell, colNumber) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });


        // Auto-size columns
        worksheet.columns.forEach(column => {
            let maxLength = 0;
            if (column.eachCell) {
                column.eachCell({ includeEmpty: true }, (cell) => {
                    const columnLength = cell.value?.toString()?.length || 10;
                    if (columnLength > maxLength) {
                        maxLength = columnLength;
                    }
                });
            }
            column.width = Math.min(Math.max(maxLength + 2, 10), 50);
        });

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
                        <label className="inline-flex items-center px-4 py-2 text-sm text-white rounded shadow bg-purple-600 hover:bg-purple-700 cursor-pointer">
                            Import excel
                            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={async (e) => {
                                const inputEl = e.currentTarget as HTMLInputElement | null;
                                const file = inputEl?.files?.[0];
                                if (!file) return;
                                setImportErrors([]);
                                setImporting(true);
                                try {
                                    const wb = new ExcelJS.Workbook();
                                    const data = await file.arrayBuffer();
                                    await wb.xlsx.load(data);
                                    if (wb.worksheets.length === 0) {
                                        setImportErrors([`File không có worksheet nào.`]);
                                        setShowImportResult(true);
                                        setImporting(false);
                                        return;
                                    }
                                    const ws = wb.worksheets[0];
                                    const headers = ['STT','Mã','Tên','Tính chất','Đơn vị tính chính','Rộng','Cao','Dày','Cấu trúc'];
                                    const headerMap: Record<string, number> = {};
                                    const possibleHeaderRows = [2, 1];
                                    for (const idx of possibleHeaderRows) {
                                        const row = ws.getRow(idx);
                                        const tempMap: Record<string, number> = {};
                                        row.eachCell((cell, colNumber) => {
                                            const val = (cell.value || '').toString().trim();
                                            if (headers.includes(val)) tempMap[val] = colNumber;
                                        });
                                        if (Object.keys(tempMap).length >= 4) {
                                            Object.assign(headerMap, tempMap);
                                            break;
                                        }
                                    }
                                    const missing = headers.filter(h => !headerMap[h]);
                                    if (missing.length > 0) {
                                        setImportErrors([`Thiếu cột: ${missing.join(', ')}. Hãy đảm bảo header nằm ở dòng 2 (hoặc dòng 1) và đúng tên cột.`]);
                                        setShowImportResult(true);
                                        setImporting(false);
                                        return;
                                    }

                                    const existingCodes = new Set(products.map(p => (p.productCode || (p as any).ProductCode || '').toLowerCase()).filter(Boolean));
                                    const existingNames = new Set(products.map(p => (p.productName || '').toLowerCase()).filter(Boolean));

                                    const errors: string[] = [];
                                    const validPayloads: CreateProductProductDto[] = [];

                                    for (let r = 3; r <= ws.rowCount; r++) {
                                        const row = ws.getRow(r);
                                        const code = (row.getCell(headerMap['Mã']).value || '').toString().trim();
                                        const name = (row.getCell(headerMap['Tên']).value || '').toString().trim();
                                        const type = (row.getCell(headerMap['Tính chất']).value || '').toString().trim();
                                        const uom = (row.getCell(headerMap['Đơn vị tính chính']).value || '').toString().trim();
                                        const width = (row.getCell(headerMap['Rộng']).value || '').toString().trim();
                                        const height = (row.getCell(headerMap['Cao']).value || '').toString().trim();
                                        const thicknessRaw = row.getCell(headerMap['Dày']).value as any;
                                        const structureCell = row.getCell(headerMap['Cấu trúc']).value as any;
                                        const structureIdStr = (structureCell ?? '').toString().trim();

                                        if (!name) {
                                            if (!row.hasValues) continue;
                                            errors.push(`Dòng ${r}: Thiếu Tên`);
                                            continue;
                                        }

                                        // duplicate checks
                                        if (code && existingCodes.has(code.toLowerCase())) {
                                            errors.push(`Dòng ${r}: Mã '${code}' đã tồn tại`);
                                            continue;
                                        }
                                        if (existingNames.has(name.toLowerCase())) {
                                            errors.push(`Dòng ${r}: Tên '${name}' đã tồn tại`);
                                            continue;
                                        }

                                        let glassStructureId = 0;
                                        if (structureIdStr) {
                                            const parsedId = Number(structureIdStr);
                                            if (!Number.isInteger(parsedId) || parsedId <= 0) {
                                                errors.push(`Dòng ${r}: Giá trị 'Cấu trúc' phải là số nguyên dương (GlassStructureId).`);
                                                continue;
                                            }
                                            // Optional: verify existence
                                            const exists = glassOptions.some(g => g.id === parsedId);
                                            if (!exists) {
                                                errors.push(`Dòng ${r}: Không tồn tại GlassStructureId = ${parsedId}.`);
                                                continue;
                                            }
                                            glassStructureId = parsedId;
                                        }

                                        const thickness = thicknessRaw ? Number(thicknessRaw) : null;
                                        const payload: CreateProductProductDto = {
                                            ProductCode: code || null,
                                            ProductName: name,
                                            ProductType: type || null,
                                            UOM: uom || null,
                                            Width: width || null,
                                            Height: height || null,
                                            Thickness: thickness === null || Number.isNaN(thickness) ? null : thickness,
                                            UnitPrice: null,
                                            Weight: null,
                                            GlassStructureId: glassStructureId,
                                            isupdatemisa: 1,
                                        };

                                        validPayloads.push(payload);
                                    }

                                    if (errors.length > 0 && validPayloads.length === 0) {
                                        setImportErrors(errors);
                                        setShowImportResult(true);
                                        setImporting(false);
                                        return;
                                    }

                                    for (const p of validPayloads) {
                                        try {
                                            await createProductApi(p);
                                        } catch (e: any) {
                                            errors.push(`Lỗi tạo sản phẩm '${p.ProductName}': ${e?.response?.data?.message || e.message}`);
                                        }
                                    }

                                    setImportErrors(errors);
                                    setShowImportResult(true);
                                    // refresh list
                                    const refreshed = await getProducts();
                                    setProducts(refreshed);
                                    setFilteredProducts(refreshed);
                                } catch (err) {
                                    setImportErrors([`Lỗi đọc file: ${(err as any).message}`]);
                                    setShowImportResult(true);
                                } finally {
                                    setImporting(false);
                                    if (inputEl) inputEl.value = '';
                                }
                            }} />
                        </label>
                        <button 
                            onClick={handleUpdateAllProducts} 
                            disabled={isUpdating}
                            className="px-4 py-2 text-sm text-white rounded shadow bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUpdating ? 'Đang cập nhật...' : 'Cập nhật tất cả sản phẩm chưa cập nhật'}
                        </button>
                        <button onClick={handleExportToExcel} className="px-4 py-2 text-sm text-white rounded shadow bg-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed">
                            Xuất excel
                        </button>
                        <button onClick={() => router.push('/products/create')} className="px-4 py-2 text-sm text-white rounded shadow bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
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
                {importing && (
                    <div className="mb-4 p-3 rounded-xl bg-purple-100 text-purple-800 border border-purple-300">
                        ⏳ Đang import...
                    </div>
                )}
                {showImportResult && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/40" onClick={() => setShowImportResult(false)}></div>
                        <div className="relative bg-white w-[90%] max-w-2xl rounded-xl shadow-lg">
                            <div className="flex items-center justify-between px-4 py-3 border-b">
                                <div className="font-semibold">Kết quả import</div>
                                <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowImportResult(false)}>✕</button>
                            </div>
                            <div className="p-4">
                                {importErrors.length === 0 ? (
                                    <div className="text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">✅ Import thành công.</div>
                                ) : (
                                    <div className="text-red-800">
                                        <div className="mb-2 text-sm">Có {importErrors.length} lỗi. Những dòng lỗi đã không được import.</div>
                                        <div className="border rounded-lg max-h-96 overflow-y-auto p-3 bg-red-50 border-red-200 text-sm">
                                            <ul className="list-disc pl-6 space-y-1">
                                                {importErrors.map((err, idx) => (
                                                    <li key={idx}>{err}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="px-4 py-3 border-t flex justify-end">
                                <button className="px-4 py-2 text-sm rounded shadow bg-gray-200 hover:bg-gray-300 text-gray-800" onClick={() => setShowImportResult(false)}>Đóng</button>
                            </div>
                        </div>
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
                                <th>Mã SP</th>
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
                                    <td>{product.productCode || (product as any).ProductCode || '-'}</td>
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
