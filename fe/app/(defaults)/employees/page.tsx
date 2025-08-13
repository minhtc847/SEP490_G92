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
import { EmployeeListDto, getEmployeeList, deleteEmployeeById } from './service';
import { FiSearch } from 'react-icons/fi';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const EmployeesListPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [accountFilter, setAccountFilter] = useState<'all' | 'with-account' | 'without-account'>('all');
    const [employees, setEmployees] = useState<EmployeeListDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await getEmployeeList();
                setEmployees(data);
            } catch (error) {
                console.error('Lỗi tải danh sách nhân viên:', error);
            } finally {
                setLoading(false);
            }
        };

        fetch();
    }, []);

    const handleDelete = async (id: number, name: string) => {
        if (window.confirm(`Bạn có chắc muốn xoá nhân viên "${name}"?`)) {
            try {
                await deleteEmployeeById(id);
                setEmployees((prev) => prev.filter((e) => e.id !== id));
                alert('Xoá thành công!');
            } catch (err) {
                console.error('Lỗi xoá:', err);
                alert('Không thể xoá nhân viên đã có tài khoản. Vui lòng xoá tài khoản trước.');
            }
        }
    };

    const filtered = employees.filter((employee) => {
        const matchesSearch = (employee.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) || 
                             (employee.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
                             (employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

        const matchesAccount = accountFilter === 'all' || 
                              (accountFilter === 'with-account' && employee.hasAccount) || 
                              (accountFilter === 'without-account' && !employee.hasAccount);

        return matchesSearch && matchesAccount;
    });

    if (loading) return <div className="panel">Đang tải dữ liệu...</div>;

    return (
        <ProtectedRoute requiredRole={1}>
            <div className="panel">
                <div className="mb-5">
                    <h2 className="text-xl font-semibold mb-4">Danh sách nhân viên</h2>

                    <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex w-full max-w-[710px] gap-3">
                            <div className="relative flex-1 min-w-[200px]">
                                <input 
                                    type="text" 
                                    placeholder="Tìm kiếm theo tên, SĐT, email" 
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
                                value={accountFilter} 
                                onChange={(e) => setAccountFilter(e.target.value as any)}
                            >
                                <option value="all">Tất cả nhân viên</option>
                                <option value="with-account">Có tài khoản</option>
                                <option value="without-account">Chưa có tài khoản</option>
                            </select>
                        </div>

                        <Link href="/employees/create">
                            <button className="btn btn-success">
                                <IconPlus className="mr-2" />
                                Thêm nhân viên
                            </button>
                        </Link>
                    </div>
                    <br />

                    {/* Bảng */}
                    <div className="table-responsive">
                        <table className="table-hover">
                            <thead>
                                <tr>
                                    <th>Họ và tên</th>
                                    <th>Số điện thoại</th>
                                    <th>Email</th>
                                    <th>Địa chỉ</th>
                                    <th>Tài khoản</th>
                                    <th className="text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((employee) => (
                                    <tr key={employee.id}>
                                        <td>{employee.fullName}</td>
                                        <td>{employee.phone}</td>
                                        <td>{employee.email}</td>
                                        <td>{employee.address}</td>
                                        <td>
                                            <span className={employee.hasAccount ? 'text-green-600' : 'text-gray-500'}>
                                                {employee.hasAccount ? 'Có tài khoản' : 'Chưa có tài khoản'}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <div className="flex justify-center gap-2">
                                                <Tippy content="Xem">
                                                    <Link href={`/employees/${employee.id}`}>
                                                        <button className="btn btn-sm btn-outline-primary">
                                                            <IconEye />
                                                        </button>
                                                    </Link>
                                                </Tippy>
                                                <Tippy content="Sửa">
                                                    <Link href={`/employees/${employee.id}/edit`}>
                                                        <button className="btn btn-sm btn-outline-warning">
                                                            <IconEdit />
                                                        </button>
                                                    </Link>
                                                </Tippy>
                                                <Tippy content="Xoá">
                                                    <button 
                                                        className="btn btn-sm btn-outline-danger" 
                                                        onClick={() => handleDelete(employee.id, employee.fullName)}
                                                        disabled={employee.hasAccount}
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

                    {filtered.length === 0 && <div className="text-center py-8 text-gray-500">Không tìm thấy nhân viên nào</div>}
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default EmployeesListPage;
