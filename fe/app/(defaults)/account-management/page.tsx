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
import IconLock from '@/components/icon/icon-lock';
import { AccountDetail, getAccountList, toggleAccountStatus, deleteAccount } from './service';
import { FiSearch } from 'react-icons/fi';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const AccountManagementPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [accounts, setAccounts] = useState<AccountDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;

    useEffect(() => {
        fetchAccounts();
    }, [currentPage]);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const data = await getAccountList(currentPage, pageSize);
            setAccounts(data.accounts);
            setTotalPages(data.totalPages);
            setTotalCount(data.totalCount);
        } catch (error) {
            console.error('Lỗi tải danh sách tài khoản:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        const action = currentStatus ? 'khóa' : 'mở khóa';
        if (window.confirm(`Bạn có chắc muốn ${action} tài khoản này?`)) {
            try {
                const result = await toggleAccountStatus(id);
                if (result.success) {
                    setAccounts(prev => prev.map(account => 
                        account.id === id ? { ...account, isActive: !account.isActive } : account
                    ));
                    alert(result.message);
                } else {
                    alert(result.message);
                }
            } catch (err) {
                console.error('Lỗi thay đổi trạng thái:', err);
                alert('Có lỗi xảy ra khi thay đổi trạng thái tài khoản.');
            }
        }
    };

    const handleDelete = async (id: number, username: string) => {
        if (window.confirm(`Bạn có chắc muốn xoá tài khoản "${username}"?`)) {
            try {
                const result = await deleteAccount(id);
                if (result.success) {
                    setAccounts(prev => prev.filter(account => account.id !== id));
                    alert(result.message);
                } else {
                    alert(result.message);
                }
            } catch (err) {
                console.error('Lỗi xoá:', err);
                alert('Không thể xoá tài khoản.');
            }
        }
    };

    const filtered = accounts.filter((account) => {
        const matchesSearch = 
            account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.roleName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = 
            statusFilter === 'all' || 
            (statusFilter === 'active' && account.isActive) || 
            (statusFilter === 'inactive' && !account.isActive);

        return matchesSearch && matchesStatus;
    });

    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`px-3 py-1 mx-1 rounded ${
                        currentPage === i
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    {i}
                </button>
            );
        }
        return pages;
    };

    if (loading) return <div className="panel">Đang tải dữ liệu...</div>;

    return (
        <ProtectedRoute requiredRole={1}>
            <div className="panel">
                <div className="mb-5">
                    <h2 className="text-xl font-semibold mb-4">Quản lý tài khoản</h2>

                    <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex w-full max-w-[710px] gap-3">
                            <div className="relative flex-1 min-w-[200px]">
                                <input 
                                    type="text" 
                                    placeholder="Tìm kiếm theo tên đăng nhập, nhân viên, vai trò" 
                                    className="form-input flex-1 min-w-[200px]" 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                />
                                <button
                                    type="button"
                                    className="absolute top-1/2 right-2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center shadow z-10"
                                >
                                    <FiSearch className="text-white w-4 h-4" />
                                </button>
                            </div>
                            <select 
                                className="form-select w-68 sm:w-56" 
                                value={statusFilter} 
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                            >
                                <option value="all">Tất cả trạng thái</option>
                                <option value="active">Đang hoạt động</option>
                                <option value="inactive">Đã khóa</option>
                            </select>
                        </div>

                        <Link href="/account-management/create">
                            <button className="btn btn-success">
                                <IconPlus className="mr-2" />
                                Tạo tài khoản
                            </button>
                        </Link>
                    </div>
                    <br />

                    {/* Bảng */}
                    <div className="table-responsive">
                        <table className="table-hover">
                            <thead>
                                <tr>
                                    <th>Tên đăng nhập</th>
                                    <th>Nhân viên</th>
                                    <th>Vai trò</th>
                                    <th>Trạng thái</th>
                                    <th className="text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((account) => (
                                    <tr key={account.id}>
                                        <td>
                                            <div className="flex items-center">
                                                <IconUser className="w-5 h-5 mr-2 text-gray-500" />
                                                <span className="font-medium">{account.username}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div>
                                                <div className="font-medium">{account.employeeName}</div>
                                                <div className="text-sm text-gray-500">{account.employeePhone}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge badge-outline-primary">{account.roleName}</span>
                                        </td>
                                        <td>
                                            <span className={`badge ${account.isActive ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                                                {account.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Tippy content="Xem chi tiết">
                                                    <Link href={`/account-management/${account.id}`}>
                                                        <button className="btn btn-sm btn-outline-primary">
                                                            <IconEye />
                                                        </button>
                                                    </Link>
                                                </Tippy>
                                                <Tippy content={account.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}>
                                                    <button 
                                                        className={`btn btn-sm ${account.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                                        onClick={() => handleToggleStatus(account.id, account.isActive)}
                                                    >
                                                        {account.isActive ? <IconLock /> : <IconLock />}
                                                    </button>
                                                </Tippy>
                                                <Tippy content="Xóa tài khoản">
                                                    <button 
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDelete(account.id, account.username)}
                                                    >
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

                    {/* Phân trang */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-4">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                                >
                                    Trước
                                </button>
                                {renderPagination()}
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                                >
                                    Sau
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Thống kê */}
                    <div className="mt-4 text-sm text-gray-600">
                        Hiển thị {filtered.length} trong tổng số {totalCount} tài khoản
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default AccountManagementPage;
