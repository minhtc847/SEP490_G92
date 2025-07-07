'use client';
import React from "react";

interface Product {
  name: string;
  quantity: number;
}

interface Chemical {
  name: string;
  unit: string;
  quantity: number;
}

interface PhieuXuatKeoButylData {
  products: Product[];
  chemicals: Chemical[];
}

const sampleData: PhieuXuatKeoButylData = {
  products: [
    { name: "Kính cường lực 5mm", quantity: 10 },
    { name: "Kính dán 8mm", quantity: 5 },
  ],
  chemicals: [
    { name: "Keo silicone", unit: "kg", quantity: 20 },
    { name: "Butyl sealant", unit: "m", quantity: 100 },
    { name: "Chất xúc tác", unit: "lít", quantity: 2 },
  ],
};

const PhieuXuatKeoButylManager: React.FC = () => {
  return (
    <div className="panel">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Phiếu Xuất Keo/Butyl - Chi Tiết</h1>
      </div>

      {/* Bảng Thành Phẩm */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-3">Thành Phẩm</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Tên sản phẩm</th>
                <th className="border border-gray-300 p-2 text-left">Số lượng</th>
              </tr>
            </thead>
            <tbody>
              {sampleData.products.map((p, i) => (
                <tr key={i}>
                  <td className="border border-gray-300 p-2">{p.name}</td>
                  <td className="border border-gray-300 p-2">{p.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bảng Hóa Chất */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Hóa Chất/Keo/Butyl</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2 text-left">Tên hóa chất</th>
                <th className="border border-gray-300 p-2 text-left">Đơn vị</th>
                <th className="border border-gray-300 p-2 text-left">Số lượng</th>
              </tr>
            </thead>
            <tbody>
              {sampleData.chemicals.map((c, i) => (
                <tr key={i}>
                  <td className="border border-gray-300 p-2">{c.name}</td>
                  <td className="border border-gray-300 p-2">{c.unit}</td>
                  <td className="border border-gray-300 p-2">{c.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PhieuXuatKeoButylManager;
