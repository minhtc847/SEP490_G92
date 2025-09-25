'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconEdit from '@/components/icon/icon-edit';
import IconEye from '@/components/icon/icon-eye';
import IconPlus from '@/components/icon/icon-plus';
import IconUser from '@/components/icon/icon-user';
import IconUsers from '@/components/icon/icon-users';
import { CustomerListDto, getCustomerList, deleteCustomerById } from './service';
import { FiSearch } from 'react-icons/fi';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import ExcelJS from 'exceljs';

const CustomersListPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [customerTypeFilter, setCustomerTypeFilter] = useState<'all' | 'customer' | 'supplier'>('all');
    const [customers, setCustomers] = useState<CustomerListDto[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await getCustomerList();
                setCustomers(data);
            } catch (error) {
                console.error('Lỗi tải danh sách khách hàng:', error);
            } finally {
                setLoading(false);
            }
        };

        fetch();
    }, []);

    const handleDelete = async (id: number, name: string) => {
        if (window.confirm(`Bạn có chắc muốn xoá khách hàng "${name}"?`)) {
            try {
                await deleteCustomerById(id);
                setCustomers((prev) => prev.filter((c) => c.id !== id));
                alert('Xoá thành công!');
            } catch (err) {
                console.error('Lỗi xoá:', err);
                alert('Không thể xoá khách hàng đã có đơn hang hoặc giao dịch.');
            }
        }
    };

    const filtered = customers.filter((customer) => {
        const matchesSearch = (customer.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) || (customer.customerCode?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

        const matchesType = customerTypeFilter === 'all' || (customerTypeFilter === 'customer' && !customer.isSupplier) || (customerTypeFilter === 'supplier' && customer.isSupplier);

        return matchesSearch && matchesType;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = filtered.slice(startIndex, startIndex + itemsPerPage);
    const goToPage = (p: number) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

    const handleExportToExcel = async () => {
        const data = filtered.map((c) => ({
            'STT': '',
            'Tên': c.customerName || '-',
            'SĐT': c.phone || '-',
            'Địa chỉ': c.address || '-',
            'Loại': c.isSupplier ? 'Nhà cung cấp' : 'Khách hàng',
        }));

        // Thêm STT
        data.forEach((item, index) => {
            item['STT'] = (index + 1).toString();
        });

        const headers = ['STT', 'Tên', 'SĐT', 'Địa chỉ', 'Loại'];

        // Tạo workbook mới
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Khách Hàng');

        // Thêm tiêu đề
        const titleRow = worksheet.addRow(['DANH SÁCH KHÁCH HÀNG']);
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
        link.download = `KhachHang_${new Date().toLocaleDateString('vi-VN').replaceAll('/', '-')}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading) return <div className="panel">Đang tải dữ liệu...</div>;

    return (
        <ProtectedRoute requiredRole={[1,2]}>
            <div className="panel">
                <div className="mb-5">
                    <h2 className="text-xl font-semibold mb-4">Danh sách khách hàng và nhà cung cấp</h2>

                    <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex w-full max-w-[710px] gap-3">
                            <div className="relative flex-1 min-w-[200px]">
                                <input type="text" placeholder="Tìm kiếm theo tên khách hàng" className="form-input flex-1 min-w-[200px]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                <button
                                    type="button"
                                    className="absolute top-1/2 right-2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center shadow z-10"
                                >
                                    <FiSearch className="text-white w-4 h-4" />
                                </button>
                            </div>
                            <select className="form-select w-68 sm:w-56" value={customerTypeFilter} onChange={(e) => setCustomerTypeFilter(e.target.value as any)}>
                                <option value="all">Khách hàng và nhà cung cấp</option>
                                <option value="customer">Khách hàng</option>
                                <option value="supplier">Nhà cung cấp</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="btn btn-secondary" onClick={handleExportToExcel}>Xuất excel</button>
                            <Link href="/customers/create">
                                <button className="btn btn-success">
                                    <IconPlus className="mr-2" />
                                    Thêm khách hàng
                                </button>
                            </Link>
                        </div>
                    </div>
                    <br />

                    {filtered.length > 0 && (
                        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                            <span>
                                Hiển thị {startIndex + 1} đến {Math.min(startIndex + itemsPerPage, filtered.length)} trong tổng {filtered.length} khách hàng.
                            </span>
                            <div className="ml-auto flex items-center gap-2">
                                <select
                                    className="form-select w-24"
                                    value={itemsPerPage}
                                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Bảng */}
                    <div className="table-responsive">
                        <table className="table-hover">
                            <thead>
                                <tr>
                                    <th>Tên</th>
                                    <th>SĐT</th>
                                    <th>Địa chỉ</th>
                                    <th>Loại</th>
                                    <th className="text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((c) => (
                                    <tr key={c.id}>
                                        <td>{c.customerName}</td>
                                        <td>{c.phone}</td>
                                        <td>{c.address}</td>
                                        <td>
                                            <span className={c.isSupplier ? 'text-orange-600' : 'text-blue-600'}>{c.isSupplier ? 'Nhà cung cấp' : 'Khách hàng'}</span>
                                        </td>
                                        <td className="text-center">
                                            <div className="flex justify-center gap-2">
                                                <Tippy content="Xem">
                                                    <Link href={`/customers/${c.id}`}>
                                                        <button className="btn btn-sm btn-outline-primary">
                                                            <IconEye />
                                                        </button>
                                                    </Link>
                                                </Tippy>
                                                <Tippy content="Sửa">
                                                    <Link href={`/customers/${c.id}/edit`}>
                                                        <button className="btn btn-sm btn-outline-warning">
                                                            <IconEdit />
                                                        </button>
                                                    </Link>
                                                </Tippy>
                                                <Tippy content="Xoá">
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c.id, c.customerName)}>
                                                        <IconTrashLines />
                                                    </button>
                                                </Tippy>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filtered.length === 0 && <div className="text-center py-8 text-gray-500">Không tìm thấy khách hàng nào</div>}

                    {filtered.length > 0 && (
                        <div className="mt-4 flex justify-center">
                            <div className="flex items-center gap-2">
                                <button
                                    className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-800 disabled:opacity-50"
                                    disabled={currentPage===1}
                                    onClick={()=>goToPage(currentPage-1)}
                                >&lt;</button>
                                <div className="flex items-center gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => goToPage(page)}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center transition ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-300'}`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-gray-800 disabled:opacity-50"
                                    disabled={currentPage===(totalPages||1)}
                                    onClick={()=>goToPage(currentPage+1)}
                                >&gt;</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default CustomersListPage;
