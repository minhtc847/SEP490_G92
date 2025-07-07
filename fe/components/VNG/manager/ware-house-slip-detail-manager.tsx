'use client';
import React from "react";

interface GlassSheet {
  id: number;
  size: string; // e.g., "1830 x 2440"
  quantity: number;
  products: {
    size: string;
    quantity: number;
  }[];
  waste: {
    size: string;
    quantity: number;
  }[];
}

const sampleData: GlassSheet[] = [
  {
    id: 1,
    size: "1830 x 2440",
    quantity: 4,
    products: [
      { size: "740 x 2135", quantity: 4 },
      { size: "740 x 302", quantity: 4 },
    ],
    waste: [
      { size: "350 x 2440", quantity: 2 },
      { size: "350 x 440", quantity: 2 },
    ],
  },
  {
    id: 2,
    size: "2140 x 2440",
    quantity: 2,
    products: [
      { size: "325 x 625", quantity: 4 },
      { size: "1490 x 880", quantity: 1 },
    ],
    waste: [
      { size: "320 x 325", quantity: 1 },
    ],
  },
];

const WareHouseSlipDetailManager: React.FC = () => {
  return (
    <div className="panel">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Phiếu Cắt Kính - Chi Tiết</h1>
      </div>

      {sampleData.map((sheet) => (
        <div key={sheet.id} className="mb-6 border border-gray-200 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Nguyên Liệu */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Nguyên Liệu</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Kích thước:</span> {sheet.size}
                </div>
                <div>
                  <span className="font-medium">Số lượng:</span> {sheet.quantity}
                </div>
              </div>
            </div>

            {/* Thành Phẩm */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Thành Phẩm</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 p-2 text-left">Kích thước</th>
                      <th className="border border-gray-300 p-2 text-left">Số lượng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sheet.products.map((p, i) => (
                      <tr key={i}>
                        <td className="border border-gray-300 p-2">{p.size}</td>
                        <td className="border border-gray-300 p-2">{p.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Kính Dư (DC) */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Kính Dư (DC)</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 p-2 text-left">Kích thước</th>
                      <th className="border border-gray-300 p-2 text-left">Số lượng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sheet.waste.map((w, i) => (
                      <tr key={i}>
                        <td className="border border-gray-300 p-2">{w.size}</td>
                        <td className="border border-gray-300 p-2">{w.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WareHouseSlipDetailManager;
