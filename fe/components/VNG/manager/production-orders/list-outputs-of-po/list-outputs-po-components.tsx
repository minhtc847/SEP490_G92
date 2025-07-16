import React, { useEffect, useState } from 'react';
import { fetchProductionOutputsByOrderId, ProductionOutput } from './service';

interface ListOutputsPOProps {
  productionOrderId: number;
}

const ListOutputsPO: React.FC<ListOutputsPOProps> = ({ productionOrderId }) => {
  const [outputs, setOutputs] = useState<ProductionOutput[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchProductionOutputsByOrderId(productionOrderId)
      .then(setOutputs)
      .finally(() => setLoading(false));
  }, [productionOrderId]);

  

  return (
    <div className="panel mt-6">
      <h3 className="text-lg font-semibold mb-4">Danh sách sản phẩm đã hoàn thành</h3>
      <div className="table-responsive">
        <table className="table-striped">
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên sản phẩm</th>
              <th>Số lượng</th>
              <th>Số lượng đã hoàn thành</th>
              <th>Ghi chú</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-4">Đang tải dữ liệu...</td>
              </tr>
            ) : outputs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4">Không có sản phẩm nào</td>
              </tr>
            ) : (
              outputs.map((item, idx) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td>{item.productName}</td>
                  <td>{item.amount ?? 0}</td>
                  <td>{item.done ?? 0}</td>
                  <td>{item.note ?? ''}</td>
                  <td>
                    <button className="btn btn-sm btn-primary">Nhập kho</button>
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

export default ListOutputsPO;
