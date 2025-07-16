'use client';
import { PhieuXuatKeoButylData, ProductionPlanDetail } from "@/app/(defaults)/production-plans/service";
import Link from "next/link";
import React from "react";

const sampleData: PhieuXuatKeoButylData = {
    products: [
        { name: 'Kính cường lực 5mm', quantity: 10 },
        { name: 'Kính dán 8mm', quantity: 5 }
    ],
    glueButyls: [
        { type: 'Keo silicone', uom: 'kg', quantity: 20 },
        { type: 'Butyl sealant', uom: 'm', quantity: 100 },
        { type: 'Chất xúc tác', uom: 'lít', quantity: 2 }
    ],
    id: 0,
    employeeName: '',
    productionPlanId: 0,
    createdAt: ''
};


interface PhieuXuatKeoButylManagerProps {
    data: PhieuXuatKeoButylData;
    planDetail: ProductionPlanDetail | null
}

const PhieuXuatKeoButylManager:  React.FC<PhieuXuatKeoButylManagerProps> = ({ data, planDetail }) => {
  return (
    <div className="panel">
        <div className="mb-6">
            <h1 className="text-2xl font-bold">Phiếu Xuất Keo/Butyl - Chi Tiết</h1>
            <h3 className="text-lg font-semibold mb-3 text-white-dark">Đơn hàng: <span className="text-primary"><Link
                href={`/production-plans/${data.productionPlanId}`}>{planDetail?.orderCode}</Link></span></h3>
            <h3 className="text-lg font-semibold mb-3 text-white-dark">Ngày tạo: <span
                className="text-dark">{data.createdAt.slice(0, 10)}</span></h3>
            <h3 className="text-lg font-semibold mb-3 text-white-dark">Nhân viên xuất kho: <span
                className="text-dark">{data.employeeName}</span></h3>
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
              {data.products.map((p, i) => (
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
              {data.glueButyls.map((c, i) => (
                <tr key={i}>
                  <td className="border border-gray-300 p-2">{c.type}</td>
                  <td className="border border-gray-300 p-2">{c.uom}</td>
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
