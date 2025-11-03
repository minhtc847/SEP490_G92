import { PhieuXuatKeoButylData, fetchAllPhieuXuatKeoButylData } from '@/app/(defaults)/production-plans/service';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

interface ListExportsPOProps {
    productionOrderId: number;
}

const ListExportsPO: React.FC<ListExportsPOProps> = ({ productionOrderId }) => {
    const [exportList, setExportList] = useState<PhieuXuatKeoButylData[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {

        const fetchData = async () => {
            try {
                setLoading(true);
                const [exportList] = await Promise.all([
                    fetchAllPhieuXuatKeoButylData(productionOrderId),
                ]);
                setExportList(exportList);
            } catch (err) {
                console.error('Lỗi khi fetch dữ liệu glue-butyl:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);



    return (
        <div className="panel mt-6">
            <h3 className="text-lg font-semibold mb-4">Danh sách sản phẩm đã hoàn thành</h3>
            <div className="table-responsive">
                <table className="table-striped">
                    <thead>
                    <tr>
                        <th>STT</th>
                        <th>Nhân viên phụ trách</th>
                        <th>Tổng số lượng sản phẩm</th>
                        <th>Ngày tạo</th>
                        <th>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={5} className="text-center py-4">Đang tải dữ liệu...</td>
                        </tr>
                    ) : exportList.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="text-center py-4">Không có sản phẩm nào</td>
                        </tr>
                    ) : (
                        exportList.map((item, idx) => (
                            <tr key={item.id}>
                                <td>{idx + 1}</td>
                                <td>Tran Cao Minh</td>
                                <td>{item.products.reduce((sum, product) => sum + (product.quantity ?? 0), 0)}</td>
                                <td>{item.createdAt.slice(0, 10)}</td>
                                <td>
                                    <button className="btn btn-sm btn-primary"><Link
                                        href={`/production-plans/glue-butyl-export/${item.id}`}>Chi tiết</Link></button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ListExportsPO;
