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
import { AccountDetail, getAccountList, toggleAccountStatus, deleteAccount, changeAccountPassword } from './service';
import { FiSearch } from 'react-icons/fi';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Swal from 'sweetalert2';

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
            Swal.fire({
                title: 'Lỗi!',
                text: 'Không thể tải danh sách tài khoản. Vui lòng thử lại.',
                icon: 'error',
                customClass: { popup: 'sweet-alerts' },
            });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        const action = currentStatus ? 'khóa' : 'mở khóa';
        const result = await Swal.fire({
            title: `Bạn có chắc muốn ${action} tài khoản này?`,
            text: currentStatus 
                ? 'Tài khoản sẽ bị khóa và không thể đăng nhập' 
                : 'Tài khoản sẽ được mở khóa và có thể đăng nhập bình thường',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: currentStatus ? '#d33' : '#3085d6',
            cancelButtonColor: '#6c757d',
            confirmButtonText: `Đồng ý ${action}`,
            cancelButtonText: 'Hủy',
            reverseButtons: true,
            customClass: { popup: 'sweet-alerts' },
        });

        if (result.isConfirmed) {
            try {
                const toggleResult = await toggleAccountStatus(id);
                if (toggleResult.success) {
                    setAccounts(prev => prev.map(account => 
                        account.id === id ? { ...account, isActive: !account.isActive } : account
                    ));
                    Swal.fire({
                        title: 'Thành công!',
                        text: toggleResult.message,
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false,
                        customClass: { popup: 'sweet-alerts' },
                    });
                } else {
                    Swal.fire({
                        title: 'Thất bại!',
                        text: toggleResult.message,
                        icon: 'error',
                        customClass: { popup: 'sweet-alerts' },
                    });
                }
            } catch (err) {
                console.error('Lỗi thay đổi trạng thái:', err);
                Swal.fire({
                    title: 'Lỗi!',
                    text: 'Có lỗi xảy ra khi thay đổi trạng thái tài khoản.',
                    icon: 'error',
                    customClass: { popup: 'sweet-alerts' },
                });
            }
        }
    };

    const handleDelete = async (id: number, username: string) => {
        const result = await Swal.fire({
            title: `Bạn có chắc muốn xoá tài khoản "${username}"?`,
            text: 'Hành động này không thể hoàn tác! Tài khoản sẽ bị xóa vĩnh viễn.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Xóa tài khoản',
            cancelButtonText: 'Hủy',
            reverseButtons: true,
            customClass: { popup: 'sweet-alerts' },
        });

        if (result.isConfirmed) {
            try {
                const deleteResult = await deleteAccount(id);
                if (deleteResult.success) {
                    setAccounts(prev => prev.filter(account => account.id !== id));
                    Swal.fire({
                        title: 'Đã xóa!',
                        text: deleteResult.message,
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false,
                        customClass: { popup: 'sweet-alerts' },
                    });
                } else {
                    Swal.fire({
                        title: 'Thất bại!',
                        text: deleteResult.message,
                        icon: 'error',
                        customClass: { popup: 'sweet-alerts' },
                    });
                }
            } catch (err) {
                console.error('Lỗi xoá:', err);
                Swal.fire({
                    title: 'Lỗi!',
                    text: 'Không thể xoá tài khoản.',
                    icon: 'error',
                    customClass: { popup: 'sweet-alerts' },
                });
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

    if (accounts.length === 0 && !loading) {
        return (
            <ProtectedRoute requiredRole={1}>
                <div className="panel">
                    <div className="mb-5">
                        <h2 className="text-xl font-semibold mb-4">Quản lý tài khoản</h2>
                        <div className="text-center py-10">
                            <IconUsers className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-600 mb-2">Chưa có tài khoản nào</h3>
                            <p className="text-gray-500 mb-4">Bắt đầu tạo tài khoản đầu tiên cho nhân viên</p>
                            <Link href="/account-management/create">
                                <button className="btn btn-success">
                                    <IconPlus className="mr-2" />
                                    Tạo tài khoản đầu tiên
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

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
                                                <Tippy content="Đổi mật khẩu">
                                                    <button 
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={async () => {
                                                            const { value: newPassword } = await Swal.fire({
                                                                title: `Đổi mật khẩu - ${account.username}`,
                                                                html: `
                                                                    <div class="text-left">
                                                                        <label class="block text-sm font-medium mb-1">Mật khẩu mới</label>
                                                                        <input id="swal-new-password" type="password" class="swal2-input" placeholder=">= 6 ký tự" />
                                                                        <label class="block text-sm font-medium mb-1 mt-2">Xác nhận mật khẩu</label>
                                                                        <input id="swal-confirm-password" type="password" class="swal2-input" placeholder="Nhập lại mật khẩu" />
                                                                    </div>
                                                                `,
                                                                focusConfirm: false,
                                                                showCancelButton: true,
                                                                confirmButtonText: 'Cập nhật',
                                                                cancelButtonText: 'Hủy',
                                                                preConfirm: () => {
                                                                    const pw = (document.getElementById('swal-new-password') as HTMLInputElement)?.value || '';
                                                                    const pw2 = (document.getElementById('swal-confirm-password') as HTMLInputElement)?.value || '';
                                                                    if (!pw || pw.length < 6) {
                                                                        Swal.showValidationMessage('Mật khẩu phải có ít nhất 6 ký tự');
                                                                        return null;
                                                                    }
                                                                    if (pw !== pw2) {
                                                                        Swal.showValidationMessage('Mật khẩu xác nhận không khớp');
                                                                        return null;
                                                                    }
                                                                    return pw;
                                                                },
                                                                customClass: { popup: 'sweet-alerts' },
                                                            });

                                                            if (newPassword) {
                                                                try {
                                                                    const res = await changeAccountPassword(account.id, newPassword);
                                                                    if (res.success) {
                                                                        Swal.fire({
                                                                            title: 'Thành công!',
                                                                            text: res.message,
                                                                            icon: 'success',
                                                                            timer: 2000,
                                                                            showConfirmButton: false,
                                                                            customClass: { popup: 'sweet-alerts' },
                                                                        });
                                                                    } else {
                                                                        Swal.fire({ title: 'Thất bại!', text: res.message, icon: 'error', customClass: { popup: 'sweet-alerts' } });
                                                                    }
                                                                } catch (e) {
                                                                    Swal.fire({ title: 'Lỗi!', text: 'Không thể đổi mật khẩu.', icon: 'error', customClass: { popup: 'sweet-alerts' } });
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        <IconEdit />
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
