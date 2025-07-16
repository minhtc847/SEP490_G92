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

const CustomersListPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [customerTypeFilter, setCustomerTypeFilter] = useState<'all' | 'customer' | 'supplier'>('all');
    const [customers, setCustomers] = useState<CustomerListDto[]>([]);
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

    if (loading) return <div className="panel">Đang tải dữ liệu...</div>;

    return (
        <div className="panel">
            <div className="mb-5">
                <h2 className="text-xl font-semibold mb-4">Danh sách khách hàng và nhà cung cấp</h2>

                <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex w-full max-w-[710px] gap-3">
                        <input type="text" placeholder="Tìm kiếm theo tên khách hàng" className="form-input flex-1 min-w-[200px]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

                        <select className="form-select w-68 sm:w-56" value={customerTypeFilter} onChange={(e) => setCustomerTypeFilter(e.target.value as any)}>
                            <option value="all">Khách hàng và nhà cung cấp</option>
                            <option value="customer">Khách hàng</option>
                            <option value="supplier">Nhà cung cấp</option>
                        </select>
                    </div>

                    <Link href="/customers/create">
                        <button className="btn btn-success">
                            <IconPlus className="mr-2" />
                            Thêm khách hàng
                        </button>
                    </Link>
                </div>
                <br />

                {/* Bảng */}
                <div className="table-responsive">
                    <table className="table-hover">
                        <thead>
                            <tr>
                                <th>Tên</th>
                                <th>SĐT</th>
                                <th>Địa chỉ</th>
                                <th>Loại</th>
                                <th>Chiết khấu</th>
                                <th className="text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((c) => (
                                <tr key={c.id}>
                                    <td>{c.customerName}</td>
                                    <td>{c.phone}</td>
                                    <td>{c.address}</td>
                                    <td>
                                        <span className={c.isSupplier ? 'text-orange-600' : 'text-blue-600'}>{c.isSupplier ? 'Nhà cung cấp' : 'Khách hàng'}</span>
                                    </td>
                                    <td>{(c.discount ?? 0) * 100}%</td>
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
            </div>
        </div>
    );
};

export default CustomersListPage;
