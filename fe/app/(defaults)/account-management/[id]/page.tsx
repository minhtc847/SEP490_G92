'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import IconArrowLeft from '@/components/icon/icon-arrow-left';
import IconEdit from '@/components/icon/icon-edit';
import IconLock from '@/components/icon/icon-lock';

import IconTrashLines from '@/components/icon/icon-trash-lines';
import Swal from 'sweetalert2';
import { AccountDetail, getAccountById, toggleAccountStatus, deleteAccount, changeAccountPassword } from '../service';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const AccountDetailPage = () => {
    const params = useParams<{ id: string }>()!;
    const router = useRouter();
    const accountId = Number(params.id);
    const [account, setAccount] = useState<AccountDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (accountId) {
            fetchAccountDetail();
        }
    }, [accountId]);

    const fetchAccountDetail = async () => {
        try {
            setLoading(true);
            const data = await getAccountById(accountId);
            setAccount(data);
        } catch (error) {
            console.error('Lỗi tải chi tiết tài khoản:', error);
            alert('Không thể tải thông tin tài khoản.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!account) return;

        const action = account.isActive ? 'khóa' : 'mở khóa';
        if (window.confirm(`Bạn có chắc muốn ${action} tài khoản "${account.username}"?`)) {
            try {
                const result = await toggleAccountStatus(account.id);
                if (result.success) {
                    setAccount(prev => prev ? { ...prev, isActive: !prev.isActive } : null);
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

    const handleDelete = async () => {
        if (!account) return;

        if (window.confirm(`Bạn có chắc muốn xoá tài khoản "${account.username}"?`)) {
            try {
                const result = await deleteAccount(account.id);
                if (result.success) {
                    alert(result.message);
                    router.push('/account-management');
                } else {
                    alert(result.message);
                }
            } catch (err) {
                console.error('Lỗi xoá:', err);
                alert('Không thể xoá tài khoản.');
            }
        }
    };

    if (loading) return <div className="panel">Đang tải dữ liệu...</div>;

    if (!account) {
        return (
            <ProtectedRoute requiredRole={1}>
                <div className="panel">
                    <div className="text-center py-8">
                        <h2 className="text-xl font-semibold mb-4">Không tìm thấy tài khoản</h2>
                        <Link href="/account-management">
                            <button className="btn btn-primary">Quay lại danh sách</button>
                        </Link>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute requiredRole={1}>
            <div className="panel">
                <div className="mb-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <Link href="/account-management" className="mr-3">
                                <IconArrowLeft className="w-5 h-5" />
                            </Link>
                            <h2 className="text-xl font-semibold">Chi tiết tài khoản</h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                className={`btn btn-sm ${account.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                onClick={handleToggleStatus}
                            >
                                {account.isActive ? <IconLock className="mr-1" /> : <IconLock className="mr-1" />}
                                {account.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                            </button>
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
                                <IconEdit className="mr-1" />
                                Đổi mật khẩu
                            </button>
                            <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={handleDelete}
                            >
                                <IconTrashLines className="mr-1" />
                                Xóa tài khoản
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Thông tin tài khoản */}
                        <div className="bg-white rounded-lg border p-6">
                            <h3 className="text-lg font-semibold mb-4 text-blue-600">Thông tin tài khoản</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tên đăng nhập
                                    </label>
                                    <div className="text-gray-900 font-medium">{account.username}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Vai trò
                                    </label>
                                    <span className="badge badge-outline-primary">{account.roleName}</span>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Trạng thái
                                    </label>
                                    <span className={`badge ${account.isActive ? 'badge-outline-success' : 'badge-outline-danger'}`}>
                                        {account.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                                    </span>
                                </div>
                             
                            </div>
                        </div>

                        {/* Thông tin nhân viên */}
                        <div className="bg-white rounded-lg border p-6">
                            <h3 className="text-lg font-semibold mb-4 text-green-600">Thông tin nhân viên</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Họ và tên
                                    </label>
                                    <div className="text-gray-900 font-medium">{account.employeeName}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Số điện thoại
                                    </label>
                                    <div className="text-gray-900">{account.employeePhone || 'Chưa có'}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <div className="text-gray-900">{account.employeeEmail || 'Chưa có'}</div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Địa chỉ
                                    </label>
                                    <div className="text-gray-900">{account.employeeAddress || 'Chưa có'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thống kê hoạt động (có thể mở rộng sau) */}
                    {/* <div className="mt-6 bg-white rounded-lg border p-6">
                        <h3 className="text-lg font-semibold mb-4 text-purple-600">Thống kê hoạt động</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">0</div>
                                <div className="text-sm text-gray-600">Lần đăng nhập</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">0</div>
                                <div className="text-sm text-gray-600">Thao tác thực hiện</div>
                            </div>
                            <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                <div className="text-2xl font-bold text-yellow-600">0</div>
                                <div className="text-sm text-gray-600">Lần cập nhật</div>
                            </div>
                        </div>
                    </div> */}

                    {/* Nút quay lại */}
                    <div className="mt-6 flex justify-center">
                        <Link href="/account-management">
                            <button className="btn btn-outline-secondary">
                                <IconArrowLeft className="mr-2" />
                                Quay lại danh sách
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default AccountDetailPage;
