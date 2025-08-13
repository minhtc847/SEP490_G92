'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import IconPlus from '@/components/icon/icon-plus';
import IconEye from '@/components/icon/icon-eye';

interface ProductionOrder {
    id: number;
    productionOrderCode: string;
    type: string;
    description?: string;
    status: string;
    createdAt: string;
}

const CreateInventorySlipPage = () => {
    const router = useRouter();
    const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>('all');

    useEffect(() => {
        loadProductionOrders();
    }, []);

    const loadProductionOrders = async () => {
        setLoading(true);
        try {
            // TODO: Implement API call to fetch production orders
            // For now, using mock data
            const mockOrders: ProductionOrder[] = [
                {
                    id: 1,
                    productionOrderCode: 'PO-001',
                    type: 'Cắt kính',
                    description: 'Cắt kính cho dự án A',
                    status: 'In Progress',
                    createdAt: '2024-01-15'
                },
                {
                    id: 2,
                    productionOrderCode: 'PO-002',
                    type: 'Ghép kính',
                    description: 'Ghép kính cho dự án B',
                    status: 'In Progress',
                    createdAt: '2024-01-16'
                },
                {
                    id: 3,
                    productionOrderCode: 'PO-003',
                    type: 'Sản xuất keo',
                    description: 'Sản xuất keo chống cháy',
                    status: 'In Progress',
                    createdAt: '2024-01-17'
                }
            ];
            setProductionOrders(mockOrders);
        } catch (error) {
            console.error('Error loading production orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSlipTypeText = (type: string) => {
        switch (type) {
            case 'Cắt kính': return 'Phiếu cắt kính';
            case 'Ghép kính': return 'Phiếu xuất keo butyl';
            case 'Sản xuất keo':
            case 'Đổ keo': return 'Phiếu xuất hóa chất';
            default: return type;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'In Progress': return 'badge-outline-warning';
            case 'Completed': return 'badge-outline-success';
            case 'Pending': return 'badge-outline-secondary';
            default: return 'badge-outline-secondary';
        }
    };

    const filteredOrders = productionOrders.filter(order => {
        if (filterType !== 'all' && order.type !== filterType) return false;
        return true;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Chọn lệnh sản xuất để tạo phiếu</h1>
                        <p className="text-gray-600">Chọn lệnh sản xuất mà bạn muốn tạo phiếu kho</p>
                    </div>
                    <Link href="/inventoryslip" className="btn btn-outline-secondary">
                        Quay lại
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="panel mb-6">
                <div className="flex flex-wrap gap-4">
                    <div>
                        <label className="form-label">Loại lệnh sản xuất:</label>
                        <select 
                            className="form-select w-48"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="all">Tất cả</option>
                            <option value="Cắt kính">Cắt kính</option>
                            <option value="Ghép kính">Ghép kính</option>
                            <option value="Sản xuất keo">Sản xuất keo</option>
                            <option value="Đổ keo">Đổ keo</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Production Orders List */}
            <div className="panel">
                <div className="table-responsive">
                    <table className="table-striped">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Mã lệnh sản xuất</th>
                                <th>Loại</th>
                                <th>Mô tả</th>
                                <th>Trạng thái</th>
                                <th>Ngày tạo</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-4">
                                        Không có lệnh sản xuất nào
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order, idx) => (
                                    <tr key={order.id}>
                                        <td>{idx + 1}</td>
                                        <td>
                                            <span className="font-semibold text-primary">
                                                {order.productionOrderCode}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge badge-outline-primary">
                                                {getSlipTypeText(order.type)}
                                            </span>
                                        </td>
                                        <td className="max-w-xs truncate" title={order.description}>
                                            {order.description || '-'}
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusBadge(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => router.push(`/inventoryslip/${order.id}/create`)}
                                                    className="btn btn-primary btn-sm"
                                                >
                                                    <IconPlus className="w-4 h-4 mr-2" />
                                                    Tạo phiếu
                                                </button>
                                                <Link
                                                    href={`/inventoryslip/${order.id}`}
                                                    className="btn btn-outline-info btn-sm"
                                                >
                                                    <IconEye className="w-4 h-4 mr-2" />
                                                    Xem phiếu
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CreateInventorySlipPage;
