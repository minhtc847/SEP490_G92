'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import IconArrowLeft from '@/components/icon/icon-arrow-left';
import { CreateAccountRequest, EmployeeWithoutAccount, Role, createAccount, getEmployeesWithoutAccount, getRoles } from '../service';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const CreateAccountPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState<EmployeeWithoutAccount[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [formData, setFormData] = useState<CreateAccountRequest>({
        username: '',
        password: '',
        employeeId: 0,
        roleId: 0
    });
    const [errors, setErrors] = useState<Partial<CreateAccountRequest>>({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [employeesData, rolesData] = await Promise.all([
                getEmployeesWithoutAccount(),
                getRoles()
            ]);
            setEmployees(employeesData);
            setRoles(rolesData);
        } catch (error) {
            console.error('Lỗi tải dữ liệu:', error);
            alert('Có lỗi xảy ra khi tải dữ liệu.');
        }
    };

    const validateForm = () => {
        const newErrors: Partial<CreateAccountRequest> = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Tên đăng nhập là bắt buộc';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
        }

        if (!formData.password) {
            newErrors.password = 'Mật khẩu là bắt buộc';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        if (!formData.employeeId) {
            newErrors.employeeId = 0;
        }

        if (!formData.roleId) {
            newErrors.roleId = 0;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const result = await createAccount(formData);
            if (result.success) {
                alert(result.message);
                router.push('/account-management');
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error('Lỗi tạo tài khoản:', error);
            alert('Có lỗi xảy ra khi tạo tài khoản.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof CreateAccountRequest, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <ProtectedRoute requiredRole={1}>
            <div className="panel">
                <div className="mb-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <Link href="/account-management" className="mr-3">
                                <IconArrowLeft className="w-5 h-5" />
                            </Link>
                            <h2 className="text-xl font-semibold">Tạo tài khoản mới</h2>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Thông tin tài khoản */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="username" className="form-label">
                                    Tên đăng nhập <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    className={`form-input ${errors.username ? 'border-red-500' : ''}`}
                                    placeholder="Nhập tên đăng nhập"
                                    value={formData.username}
                                    onChange={(e) => handleInputChange('username', e.target.value)}
                                />
                                {errors.username && (
                                    <div className="text-red-500 text-sm mt-1">{errors.username}</div>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="form-label">
                                    Mật khẩu <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    className={`form-input ${errors.password ? 'border-red-500' : ''}`}
                                    placeholder="Nhập mật khẩu"
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                />
                                {errors.password && (
                                    <div className="text-red-500 text-sm mt-1">{errors.password}</div>
                                )}
                            </div>
                        </div>

                        {/* Chọn nhân viên */}
                        <div>
                            <label htmlFor="employeeId" className="form-label">
                                Chọn nhân viên <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="employeeId"
                                className={`form-select ${errors.employeeId ? 'border-red-500' : ''}`}
                                value={formData.employeeId}
                                onChange={(e) => handleInputChange('employeeId', parseInt(e.target.value))}
                            >
                                <option value={0}>-- Chọn nhân viên --</option>
                                {employees.map((employee) => (
                                    <option key={employee.id} value={employee.id}>
                                        {employee.fullName} - {employee.phone}
                                    </option>
                                ))}
                            </select>
                            {errors.employeeId && (
                                <div className="text-red-500 text-sm mt-1">{errors.employeeId}</div>
                            )}
                            {employees.length === 0 && (
                                <div className="text-yellow-600 text-sm mt-1">
                                    Không có nhân viên nào chưa có tài khoản
                                </div>
                            )}
                        </div>

                        {/* Chọn vai trò */}
                        <div>
                            <label htmlFor="roleId" className="form-label">
                                Chọn vai trò <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="roleId"
                                className={`form-select ${errors.roleId ? 'border-red-500' : ''}`}
                                value={formData.roleId}
                                onChange={(e) => handleInputChange('roleId', parseInt(e.target.value))}
                            >
                                <option value={0}>-- Chọn vai trò --</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.roleName}
                                    </option>
                                ))}
                            </select>
                            {errors.roleId && (
                                <div className="text-red-500 text-sm mt-1">{errors.roleId}</div>
                            )}
                        </div>

                        {/* Thông tin nhân viên được chọn */}
                        {formData.employeeId > 0 && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-medium mb-2">Thông tin nhân viên</h3>
                                {(() => {
                                    const selectedEmployee = employees.find(emp => emp.id === formData.employeeId);
                                    if (selectedEmployee) {
                                        return (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="font-medium">Họ tên:</span> {selectedEmployee.fullName}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Số điện thoại:</span> {selectedEmployee.phone}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Email:</span> {selectedEmployee.email || 'Chưa có'}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Địa chỉ:</span> {selectedEmployee.address || 'Chưa có'}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </div>
                        )}

                        {/* Nút thao tác */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Link href="/account-management">
                                <button type="button" className="btn btn-outline-secondary">
                                    Hủy
                                </button>
                            </Link>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default CreateAccountPage;
