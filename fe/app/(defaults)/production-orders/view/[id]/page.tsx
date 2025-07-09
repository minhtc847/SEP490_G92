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

interface ApiResponse {
  product: ProductItem;
  materials: MaterialItem[];
}

export default function ProductionOrderView({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [finishedProducts, setFinishedProducts] = useState<ProductItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [currentMaterials, setCurrentMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(false);

  const productsWithMaterials = ["VT00372", "VT00090"];

  useEffect(() => {
    fetch(`https://localhost:7075/api/ProductionAccountantControllers/production-ordersDetails/${params.id}`)
      .then((res) => res.json())
      .then((data: ProductItem[]) => {
        setFinishedProducts(data || []);
        if (data && data.length > 0) {
          const productWithMaterials = data.find((p) => p.productCode === "VT00372") || data[0];
          setSelectedProduct(productWithMaterials.productCode);
        }
      })
      .catch((err) => console.error("❌ Lỗi khi fetch thành phẩm:", err));
  }, [params.id]);

  useEffect(() => {
    if (!selectedProduct) return;

    setLoading(true);
    setCurrentMaterials([]);

    const url = `https://localhost:7075/api/ProductionAccountantControllers/products-productionName/${params.id}?productCode=${selectedProduct}`;

    fetch(url)
      .then((res) => {
        if (res.status === 404) return { notFound: true };
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then((data: ApiResponse[] | { notFound: boolean }) => {
        if ("notFound" in data) {
          setCurrentMaterials([]);
          return;
        }

        if (Array.isArray(data) && data.length > 0) {
          const responseItem = data[0];
          if (responseItem && responseItem.materials) {
            setCurrentMaterials(responseItem.materials);
          } else {
            setCurrentMaterials([]);
          }
        } else {
          setCurrentMaterials([]);
        }
      })
      .catch((err) => {
        console.error("❌ API Error:", err);
        setCurrentMaterials([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params.id, selectedProduct]);

  const handleProductSelect = (productCode: string) => {
    if (productCode !== selectedProduct) {
      setSelectedProduct(productCode);
      setCurrentMaterials([]);
    }
  };

  const handleGoBack = () => {
    router.push("/production-orders/view");
  };

  const totalQuantity = finishedProducts.reduce((sum, item) => sum + item.quantity, 0);
  const totalMaterialQuantity = currentMaterials.reduce((sum, item) => sum + item.totalQuantity, 0);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-[#4361ee]">Lệnh sản xuất: {params.id}</h1>
        <div className="flex items-center gap-4">
          <select className="px-4 py-2 border border-[#4361ee] text-[#4361ee] rounded shadow-sm focus:ring-2 focus:ring-[#4361ee] focus:outline-none text-sm">
            <option value="">Chọn thao tác</option>
            <option value="xuat-hoa-chat">Xuất hóa chất</option>
            <option value="xuat-keo-bytul">Xuất keo bytul</option>
            <option value="cat-kinh">Cắt kính</option>
          </select>
          <button
            onClick={handleGoBack}
            className="px-4 py-2 bg-[#4361ee] hover:bg-[#364fc7] text-white text-sm rounded shadow"
          >
            ← Quay lại
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Thành phẩm */}
        <div>
          <h2 className="font-semibold text-[#4361ee] mb-2">Thành phẩm</h2>
          <table className="w-full border rounded shadow text-sm">
            <thead className="bg-[#edf0ff]">
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
                  key={`${item.productCode}-${index}`}
                  className={`cursor-pointer hover:bg-blue-50 transition-colors ${
                    selectedProduct === item.productCode
                      ? "bg-[#edf0ff] border-l-4 border-[#4361ee] font-bold"
                      : ""
                  }`}
                  onClick={() => handleProductSelect(item.productCode)}
                >
                  <td className="border p-2">{index + 1}</td>
                  <td className="border p-2 text-[#4361ee] font-mono">{item.productCode}</td>
                  <td className="border p-2">{item.productName}</td>
                  <td className="border p-2">{item.uom}</td>
                  <td className="border p-2 text-right">{item.quantity}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#f4f7ff]">
                <td colSpan={4} className="border p-2 text-right font-semibold">
                  Tổng:
                </td>
                <td className="border p-2 text-right font-semibold">{totalQuantity}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Nguyên vật liệu */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-[#4361ee]">
              Định mức NVL cho:{" "}
              <span className="bg-[#edf0ff] text-[#4361ee] px-2 py-1 rounded font-mono">{selectedProduct}</span>
            </h2>
            {loading && (
              <div className="text-sm text-[#4361ee] flex items-center">
                <div className="animate-spin h-4 w-4 border-b-2 border-[#4361ee] rounded-full mr-2" />
                Đang tải...
              </div>
            )}
          </div>
          <table className="w-full border rounded shadow text-sm" key={`materials-${selectedProduct}`}>
            <thead className="bg-[#edf0ff]">
              <tr>
                <th className="border p-2">#</th>
                <th className="border p-2">Mã NVL</th>
                <th className="border p-2">Tên NVL</th>
                <th className="border p-2">ĐVT</th>
                <th className="border p-2">Tổng SL</th>
                <th className="border p-2">SL / 1 SP</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500 italic">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : currentMaterials.length > 0 ? (
                currentMaterials.map((material, index) => (
                  <tr key={`${selectedProduct}-${material.productCode}-${index}`} className="hover:bg-blue-50">
                    <td className="border p-2">{index + 1}</td>
                    <td className="border p-2 text-[#4361ee] font-mono">{material.productCode}</td>
                    <td className="border p-2 truncate" title={material.productName}>{material.productName}</td>
                    <td className="border p-2">{material.uom}</td>
                    <td className="border p-2 text-right">{material.totalQuantity}</td>
                    <td className="border p-2 text-right">{material.quantityPer}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="border p-4 text-center text-gray-500 italic">
                    {selectedProduct ? `Không có nguyên vật liệu cho sản phẩm ${selectedProduct}` : "Chọn sản phẩm để xem nguyên vật liệu"}
                  </td>
                </tr>
              )}
            </tbody>
            {currentMaterials.length > 0 && (
              <tfoot>
                <tr className="bg-[#f4f7ff]">
                  <td colSpan={4} className="border p-2 text-right font-semibold">
                    Tổng:
                  </td>
                  <td className="border p-2 text-right font-semibold">{totalMaterialQuantity}</td>
                  <td className="border p-2" />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
