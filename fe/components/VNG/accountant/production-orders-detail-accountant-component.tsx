'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { DataTable } from 'mantine-datatable';

interface ProductionOrderDetail {
    id: number;
    orderDate: string;
    type: string;
    description: string;
    productionStatus: string;
    products: ProductionOrderProduct[];
}

interface ProductionOrderProduct {
    id: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

const ProductionOrdersDetailAccountantComponent: React.FC = () => {
    const params = useParams();
    const [detail, setDetail] = useState<ProductionOrderDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                // Mock data - replace with actual API call
                const mockDetail: ProductionOrderDetail = {
                    id: parseInt(params.id as string),
                    orderDate: new Date().toISOString(),
                    type: 'Cắt kính',
                    description: 'Lệnh sản xuất cắt kính theo đơn hàng',
                    productionStatus: '1',
                    products: [
                        {
                            id: 1,
                            productName: 'Kính cường lực 6mm',
                            quantity: 100,
                            unitPrice: 150000,
                            totalPrice: 15000000
                        }
                    ]
                };
                setDetail(mockDetail);
            } catch (error) {
                console.error('Error fetching production order detail:', error);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchDetail();
        }
    }, [params.id]);

    const getStatusText = (status: string) => {
        switch (status) {
            case '0': return 'Pending';
            case '1': return 'InProgress';
            case '2': return 'Completed';
            case '3': return 'Cancelled';
            default: return status;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case '0': return 'badge-outline-warning';
            case '1': return 'badge-outline-info';
            case '2': return 'badge-outline-success';
            case '3': return 'badge-outline-danger';
            default: return 'badge-outline-secondary';
        }
    };

    if (loading) {
        return (
            <div className="panel mt-6">
                <div className="flex items-center justify-center h-32">
                    <div className="animate-spin border-4 border-primary border-l-transparent rounded-full w-8 h-8"></div>
                </div>
            </div>
        );
    }

    if (!detail) {
        return (
            <div className="panel mt-6">
                <div className="text-center py-8">
                    <p className="text-gray-500">Không tìm thấy thông tin lệnh sản xuất</p>
                </div>
            </div>
        );
    }

    return (
        <div className="panel mt-6">
            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Chi tiết lệnh sản xuất #{detail.id}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-700">Ngày lên lệnh</h3>
                        <p className="text-lg font-semibold">
                            {detail.orderDate ? new Date(detail.orderDate).toLocaleDateString('vi-VN') : '-'}
                        </p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-700">Loại</h3>
                        <p className="text-lg font-semibold">{detail.type}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-700">Trạng thái</h3>
                        <span className={`badge ${getStatusBadge(detail.productionStatus)} text-sm`}>
                            {getStatusText(detail.productionStatus)}
                        </span>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-700">Mô tả</h3>
                        <p className="text-sm text-gray-600">{detail.description}</p>
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Danh sách sản phẩm</h3>
                <div className="table-responsive">
                    <table className="table-striped">
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Tên sản phẩm</th>
                                <th>Số lượng</th>
                                <th>Đơn giá</th>
                                <th>Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {detail.products.map((product, index) => (
                                <tr key={product.id}>
                                    <td>{index + 1}</td>
                                    <td>{product.productName}</td>
                                    <td>{product.quantity.toLocaleString()}</td>
                                    <td>{product.unitPrice.toLocaleString('vi-VN')} VNĐ</td>
                                    <td>{product.totalPrice.toLocaleString('vi-VN')} VNĐ</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-end">
                <div className="bg-primary/10 p-4 rounded-lg">
                    <h3 className="font-semibold text-primary">Tổng giá trị</h3>
                    <p className="text-2xl font-bold text-primary">
                        {detail.products.reduce((sum, product) => sum + product.totalPrice, 0).toLocaleString('vi-VN')} VNĐ
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProductionOrdersDetailAccountantComponent;
