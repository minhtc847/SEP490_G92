"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface MaterialItem {
  productCode: string;
  productName: string;
  uom: string;
  quantityPer: number;
  totalQuantity: number;
}

interface ProductItem {
  productCode: string;
  productName: string;
  uom: string;
  quantity: number;
}

export default function ProductionOrderView({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [finishedProducts, setFinishedProducts] = useState<ProductItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [currentMaterials, setCurrentMaterials] = useState<MaterialItem[]>([]);

  // Lấy danh sách thành phẩm
  useEffect(() => {
    fetch(`https://localhost:7075/api/ProductionAccountantControllers/production-ordersDetails/${params.id}`)
      .then((res) => res.json())
      .then((data: ProductItem[]) => {
        setFinishedProducts(data || []);
        setSelectedProduct(data?.[0]?.productCode || "");
      })
      .catch((err) => console.error("Failed to fetch production products:", err));
  }, [params.id]);

  // Lấy nguyên vật liệu theo thành phẩm đã chọn
  useEffect(() => {
    if (!selectedProduct) return;

    fetch(`https://localhost:7075/api/ProductionAccountantControllers/products/${params.id}?productCode=${selectedProduct}`)
      .then((res) => res.json())
      .then((data: { product: ProductItem; materials: MaterialItem[] }[]) => {
        setCurrentMaterials(data?.[0]?.materials || []);
      })
      .catch((err) => console.error("Failed to fetch materials:", err));
  }, [params.id, selectedProduct]);

  const handleProductSelect = (productCode: string) => {
    setSelectedProduct(productCode);
  };

  const handleGoBack = () => {
    router.push("/production-orders/view");
  };

  const totalQuantity = finishedProducts.reduce((sum, item) => sum + item.quantity, 0);
  const totalMaterialQuantity = currentMaterials.reduce((sum, item) => sum + item.quantityPer, 0);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Lệnh sản xuất: {params.id}</h1>
        <button
          onClick={handleGoBack}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-sm rounded"
        >
          ← Quay lại
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Bảng thành phẩm */}
        <div>
          <h2 className="font-semibold mb-2">Thành phẩm</h2>
          <table className="w-full border">
            <thead>
              <tr>
                <th className="border p-2">#</th>
                <th className="border p-2">Mã TP</th>
                <th className="border p-2">Tên TP</th>
                <th className="border p-2">ĐVT</th>
                <th className="border p-2">Số lượng</th>
              </tr>
            </thead>
            <tbody>
              {finishedProducts.map((item, index) => (
                <tr
                  key={item.productCode}
                  className={`cursor-pointer ${selectedProduct === item.productCode ? "bg-blue-100" : ""}`}
                  onClick={() => handleProductSelect(item.productCode)}
                >
                  <td className="border p-2">{index + 1}</td>
                  <td className="border p-2">{item.productCode}</td>
                  <td className="border p-2">{item.productName}</td>
                  <td className="border p-2">{item.uom}</td>
                  <td className="border p-2">{item.quantity}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="border p-2 font-semibold text-right">Tổng:</td>
                <td className="border p-2 font-semibold">{totalQuantity}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Bảng nguyên vật liệu */}
        <div>
          <h2 className="font-semibold mb-2">Định mức NVL cho: {selectedProduct}</h2>
          <table className="w-full border">
          <thead>
              <tr>
                <th className="border p-2">#</th>
                <th className="border p-2">Mã NVL</th>
                <th className="border p-2">Tên NVL</th>
                <th className="border p-2">ĐVT</th>
                <th className="border p-2">Số lượng</th>
                <th className="border p-2">Số lượng / 1 SP</th>
              </tr>
            </thead>
            <tbody>
              {currentMaterials.length > 0 ? (
                currentMaterials.map((item, index) => {
                  const selectedQty =
                    finishedProducts.find(p => p.productCode === selectedProduct)?.quantity || 0;
                  const quantityPerUnit =
                    selectedQty > 0
                      ? (item.totalQuantity / selectedQty).toFixed(3)
                      : "0";

                  return (
                    <tr key={index}>
                      <td className="border p-2">{index + 1}</td>
                      <td className="border p-2">{item.productCode}</td>
                      <td className="border p-2">{item.productName}</td>
                      <td className="border p-2">{item.uom}</td>
                      <td className="border p-2">{item.totalQuantity}</td>
                      <td className="border p-2">{quantityPerUnit}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="border p-2 text-center text-gray-500 italic">
                    Không có dữ liệu nguyên vật liệu
                  </td>
                </tr>
              )}
            </tbody>

            <tfoot>
              <tr>
                <td colSpan={5} className="border p-2 font-semibold text-right">Tổng:</td>
                <td className="border p-2 font-semibold">{totalMaterialQuantity}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
