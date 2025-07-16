import React, { useEffect, useState } from 'react';
import { fetchProductionPlanOutputs, ProductionPlanOutput } from './service';

interface ListOutputsPPProps {
  productionPlanId: number;
}

const ListOutputsPP: React.FC<ListOutputsPPProps> = ({ productionPlanId }) => {
  const [outputs, setOutputs] = useState<ProductionPlanOutput[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchProductionPlanOutputs(productionPlanId)
      .then(setOutputs)
      .finally(() => setLoading(false));
  }, [productionPlanId]);

  return (
    <div className="panel mt-6">
      <h3 className="text-lg font-semibold mb-4">Danh sách sản phẩm trong kế hoạch sản xuất</h3>
      <div className="table-responsive">
        <table className="table-striped">
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên sản phẩm</th>
              <th>Tổng số lượng</th>
              <th>Đã hoàn thành</th>
              <th>Đã hỏng</th>
              <th>Lí do hỏng</th>

            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-4">Đang tải dữ liệu...</td>
              </tr>
            ) : outputs.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4">Không có sản phẩm nào</td>
              </tr>
            ) : (
              outputs.map((item, idx) => (
                <tr key={item.outputId}>
                  <td>{idx + 1}</td>
                  <td>{item.productName}</td>
                  <td>{item.totalAmount ?? 0}</td>
                  <td>{item.done ?? 0}</td>
                  <td>{item.broken ?? 0}</td>
                  <td>{item.brokenDescription ?? ''}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListOutputsPP;
