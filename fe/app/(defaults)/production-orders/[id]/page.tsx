"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DataTable } from "mantine-datatable";

const columns = [
  { accessor: "productId", title: "ID" },
  { accessor: "productionOrderCode", title: "Mã Sản phẩm" },
  { accessor: "productName", title: "Tên sản phẩm" },
  { accessor: "adhesiveLayers", title: "Số lớp keo" },
  { accessor: "glassLayers", title: "Số tấm kính" },
  { accessor: "thickness", title: "Dày" },
  { accessor: "width", title: "Rộng" },
  { accessor: "height", title: "Cao" },
  { accessor: "butylThickness", title: "Loại butyl" },
  { accessor: "quantity", title: "Số lượng" },
];

const calculationColumns = [
  { accessor: "glassArea", title: "Diện tích kính (m²)" },
  { accessor: "perimeter", title: "Chu vi (m)" },
  { accessor: "adhesiveArea", title: "Diện tích keo (m²)" },
  { accessor: "adhesivePerLayer", title: "Lượng keo / 1 lớp (kg)" },
  { accessor: "totalAdhesive", title: "Tổng lượng keo (kg)" },
  { accessor: "butylLength", title: "Chiều dài butyl (m)" },
  { accessor: "substanceA", title: "Chất A (kg)" },
  { accessor: "koh", title: "KOH (kg)" },
  { accessor: "h2O", title: "H2O (kg)" },
];

const ProductionOrderDetailPage = () => {
  const { id } = useParams();
  const [data, setData] = useState<any[]>([]);
  const [calculationData, setCalculationData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculationLoading, setCalculationLoading] = useState(false);
  const [checkboxes, setCheckboxes] = useState({
    exportChemicals: false,
    mixAdhesive: false,
    cutGlass: false,
    exportButyl: false,
    stackGlass: false
  });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`https://localhost:7075/api/ProductionOrders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleRowClick = (record: any) => {
    if (!record.productId) {
      console.error('ProductId not found in record:', record);
      return;
    }
    
    setCalculationLoading(true);
    fetch(`https://localhost:7075/api/ProductionOrders/${id}/calculate/${record.productId}`)
      .then((res) => res.json())
      .then((calculationResult) => {
        setCalculationData([calculationResult]);
        setCalculationLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching calculation:', error);
        setCalculationLoading(false);
      });
  };

  const handleCheckboxChange = (key: string) => {
    setCheckboxes(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Chi tiết lệnh sản xuất: {id}</h1>
      <div className="panel mb-6">
        <DataTable
          highlightOnHover
          className="table-hover whitespace-nowrap"
          columns={columns}
          records={data}
          minHeight={200}
          fetching={loading}
          onRowClick={handleRowClick}
        />
      </div>

      <h2 className="text-xl font-bold mb-4">Tính toán</h2>
      <div className="panel mb-6">
        <DataTable
          highlightOnHover
          className="table-hover whitespace-nowrap"
          columns={calculationColumns}
          records={calculationData}
          minHeight={200}
          fetching={calculationLoading}
        />
      </div>

      <div className="panel">
        <h3 className="text-lg font-semibold mb-4">Công đoạn sản xuất</h3>
        <div className="flex gap-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={checkboxes.exportChemicals}
              onChange={() => handleCheckboxChange('exportChemicals')}
              className="form-checkbox h-4 w-4 text-primary"
            />
            <span className="ml-2">Xuất hóa chất</span>
          </label>
          
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={checkboxes.mixAdhesive}
              onChange={() => handleCheckboxChange('mixAdhesive')}
              className="form-checkbox h-4 w-4 text-primary"
            />
            <span className="ml-2">Trộn keo</span>
          </label>
          
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={checkboxes.cutGlass}
              onChange={() => handleCheckboxChange('cutGlass')}
              className="form-checkbox h-4 w-4 text-primary"
            />
            <span className="ml-2">Cắt kính</span>
          </label>
          
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={checkboxes.exportButyl}
              onChange={() => handleCheckboxChange('exportButyl')}
              className="form-checkbox h-4 w-4 text-primary"
            />
            <span className="ml-2">Xuất keo butyl</span>
          </label>
          
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={checkboxes.stackGlass}
              onChange={() => handleCheckboxChange('stackGlass')}
              className="form-checkbox h-4 w-4 text-primary"
            />
            <span className="ml-2">Dán kính</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ProductionOrderDetailPage; 