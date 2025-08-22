'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import IconArrowLeft from '@/components/icon/icon-arrow-left';
import { CreateAccountRequest, EmployeeWithoutAccount, Role, createAccount, getEmployeesWithoutAccount, getRoles, checkUsernameExists } from '../service';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Swal from 'sweetalert2';

const CreateAccountPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [employees, setEmployees] = useState<EmployeeWithoutAccount[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [formData, setFormData] = useState<CreateAccountRequest>({
        username: '',
        password: '',
        employeeId: '',
        roleId: ''
    });
    const [errors, setErrors] = useState<Partial<CreateAccountRequest>>({});
    const [usernameChecking, setUsernameChecking] = useState(false);
    const [usernameExists, setUsernameExists] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    //username validation
    useEffect(() => {
        if (formData.username.length >= 3) {
            const timer = setTimeout(async () => {
                setUsernameChecking(true);
                try {
                    const result = await checkUsernameExists(formData.username);
                    setUsernameExists(result.exists);
                    if (result.exists) {
                        setErrors(prev => ({ ...prev, username: 'Tên đăng nhập đã tồn tại. Vui lòng chọn tên đăng nhập khác.' }));
                    } else {
                        setErrors(prev => ({ ...prev, username: undefined }));
                    }
                } catch (error) {
                    console.error('Lỗi kiểm tra tên đăng nhập:', error);
                } finally {
                    setUsernameChecking(false);
                }
            }, 500); //delay

            return () => clearTimeout(timer);
        } else {
            setUsernameExists(false);
            setErrors(prev => ({ ...prev, username: undefined }));
        }
    }, [formData.username]);

    // Kiểm tra và thông báo khi không có nhân viên nào
    useEffect(() => {
    }, [employees, roles, loading, dataLoaded, router]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [employeesData, rolesData] = await Promise.all([
                getEmployeesWithoutAccount(),
                getRoles()
            ]);
            setEmployees(employeesData);
            setRoles(rolesData);
            setDataLoaded(true);
        } catch (error) {
            console.error('Lỗi tải dữ liệu:', error);
            Swal.fire({
                title: 'Lỗi!',
                text: 'Có lỗi xảy ra khi tải dữ liệu.',
                icon: 'error',
                customClass: { popup: 'sweet-alerts' },
            });
        } finally {
            setLoading(false);
        }
    };

    const validateForm = async () => {
        const newErrors: Partial<CreateAccountRequest> = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Tên đăng nhập là bắt buộc';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
        } else if (usernameExists) {
            newErrors.username = 'Tên đăng nhập đã tồn tại. Vui lòng chọn tên đăng nhập khác.';
        }

        if (!formData.password) {
            newErrors.password = 'Mật khẩu là bắt buộc';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        if (!formData.employeeId) {
            newErrors.employeeId = 'Hãy chọn nhân viên';
        }

        if (!formData.roleId) {
            newErrors.roleId = 'Hãy chọn vai trò';
        } else {
            const selectedRole = roles.find(role => role.id === parseInt(formData.roleId));
            if (!selectedRole) {
                newErrors.roleId = 'Vai trò được chọn không hợp lệ';
            }
        }

        setErrors(newErrors);
        
        if (Object.keys(newErrors).length > 0) {
            const errorMessages = Object.values(newErrors).filter(Boolean).join('\n');
            Swal.fire({
                title: 'Vui lòng kiểm tra lại thông tin',
                text: errorMessages,
                icon: 'warning',
                customClass: { popup: 'sweet-alerts' },
            });
        }
        
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!await validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const result = await createAccount(formData);
            
            if (result.success) {
                await Swal.fire({
                    title: 'Thành công!',
                    text: result.message,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: { popup: 'sweet-alerts' },
                });
                
                router.push('/account-management');
            } else {
                Swal.fire({
                    title: 'Không thể tạo tài khoản',
                    text: result.message,
                    icon: 'error',
                    customClass: { popup: 'sweet-alerts' },
                });
            }
        } catch (error) {
            console.error('Lỗi tạo tài khoản:', error);
            Swal.fire({
                title: 'Lỗi hệ thống',
                text: 'Có lỗi xảy ra khi tạo tài khoản. Vui lòng thử lại sau.',
                icon: 'error',
                customClass: { popup: 'sweet-alerts' },
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        const hasData = formData.username || formData.password || formData.employeeId || formData.roleId;
        
        if (hasData) {
            const result = await Swal.fire({
                title: 'Bạn có chắc muốn hủy?',
                text: 'Dữ liệu đã nhập sẽ bị mất.',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Hủy bỏ',
                cancelButtonText: 'Tiếp tục',
                reverseButtons: true,
                customClass: { popup: 'sweet-alerts' },
            });

            if (result.isConfirmed) {
                router.push('/account-management');
            }
        } else {
            router.push('/account-management');
        }
    };

    const handleInputChange = (field: keyof CreateAccountRequest, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    if (loading && !dataLoaded) {
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
                        <div className="text-center py-10">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-gray-600">Đang tải dữ liệu...</p>
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
                                <div className="relative">
                                    <input
                                        id="username"
                                        type="text"
                                        className={`form-input pr-10 ${errors.username ? 'border-red-500' : usernameExists ? 'border-red-500' : formData.username.length >= 3 && !usernameExists ? 'border-green-500' : ''}`}
                                        placeholder="Nhập tên đăng nhập"
                                        value={formData.username}
                                        onChange={(e) => handleInputChange('username', e.target.value)}
                                    />
                                    {usernameChecking && (
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                        </div>
                                    )}
                                    {!usernameChecking && formData.username.length >= 3 && (
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                            {usernameExists ? (
                                                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {errors.username && (
                                    <div className="text-red-500 text-sm mt-1">{errors.username}</div>
                                )}
                                {formData.username.length >= 3 && !usernameChecking && !usernameExists && (
                                    <div className="text-green-600 text-sm mt-1">✓ Tên đăng nhập có thể sử dụng</div>
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
                                disabled={employees.length === 0}
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
                            {employees.length === 0 && dataLoaded && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-2">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-yellow-800">
                                                Không có nhân viên nào
                                            </h3>
                                            <div className="mt-2 text-sm text-yellow-700">
                                                <p>Tất cả nhân viên đã có tài khoản. Vui lòng thêm nhân viên mới trước khi tạo tài khoản.</p>
                                            </div>
                                            <div className="mt-4">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-warning"
                                                    onClick={() => router.push('/account-management')}
                                                >
                                                    Về trang danh sách
                                                </button>
                                            </div>
                                        </div>
                                    </div>
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
                        {parseInt(formData.employeeId) > 0 && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-medium mb-2">Thông tin nhân viên</h3>
                                {(() => {
                                    const selectedEmployee = employees.find(emp => emp.id === parseInt(formData.employeeId));
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
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                Hủy
                            </button>
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
