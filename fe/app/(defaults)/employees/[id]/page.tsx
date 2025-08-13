'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getEmployeeById, EmployeeDto } from '../service';
import IconEdit from '@/components/icon/icon-edit';
import IconArrowLeft from '@/components/icon/icon-arrow-left';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const EmployeeDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const [employee, setEmployee] = useState<EmployeeDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const id = parseInt(params.id as string);
                const data = await getEmployeeById(id);
                setEmployee(data);
            } catch (error) {
                console.error('Lỗi tải thông tin nhân viên:', error);
                alert('Không tìm thấy nhân viên');
                router.push('/employees');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchEmployee();
        }
    }, [params.id, router]);

    if (loading) return <div className="panel">Đang tải dữ liệu...</div>;

    if (!employee) return <div className="panel">Không tìm thấy nhân viên</div>;

    return (
        <ProtectedRoute requiredRole={1}>
            <div className="panel">
                <div className="mb-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Link href="/employees">
                                <button className="btn btn-outline-secondary btn-sm">
                                    <IconArrowLeft className="mr-1" />
                                    Quay lại
                                </button>
                            </Link>
                            <h2 className="text-xl font-semibold">Thông tin nhân viên</h2>
                        </div>
                        <Link href={`/employees/${employee.id}/edit`}>
                            <button className="btn btn-warning">
                                <IconEdit className="mr-2" />
                                Chỉnh sửa
                            </button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="form-label font-semibold text-gray-700">Họ và tên</label>
                                <div className="form-input bg-gray-50 border-gray-200">
                                    {employee.fullName || 'Chưa cập nhật'}
                                </div>
                            </div>

                            <div>
                                <label className="form-label font-semibold text-gray-700">Số điện thoại</label>
                                <div className="form-input bg-gray-50 border-gray-200">
                                    {employee.phone || 'Chưa cập nhật'}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="form-label font-semibold text-gray-700">Email</label>
                                <div className="form-input bg-gray-50 border-gray-200">
                                    {employee.email || 'Chưa cập nhật'}
                                </div>
                            </div>

                            <div>
                                <label className="form-label font-semibold text-gray-700">Địa chỉ</label>
                                <div className="form-input bg-gray-50 border-gray-200">
                                    {employee.address || 'Chưa cập nhật'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="form-label font-semibold text-gray-700">Trạng thái tài khoản</label>
                        <div className="form-input bg-gray-50 border-gray-200">
                            <span className={employee.hasAccount ? 'text-green-600 font-medium' : 'text-gray-500'}>
                                {employee.hasAccount ? '✓ Có tài khoản' : '✗ Chưa có tài khoản'}
                            </span>
                        </div>
                    </div>

                    {employee.hasAccount && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-blue-800 text-sm">
                                <strong>Lưu ý:</strong> Nhân viên này đã có tài khoản hệ thống. 
                                Nếu muốn xóa nhân viên, vui lòng xóa tài khoản trước.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default EmployeeDetailPage;
