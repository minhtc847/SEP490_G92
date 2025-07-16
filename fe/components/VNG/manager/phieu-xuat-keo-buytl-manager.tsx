'use client';
import { PhieuXuatKeoButylData } from "@/app/(defaults)/production-plans/service";
import React, { useState } from "react";

interface PhieuXuatKeoButylManagerProps {
    data: PhieuXuatKeoButylData;
}

const PhieuXuatKeoButylManager: React.FC<PhieuXuatKeoButylManagerProps> = ({ data }) => {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const toggleExpand = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <div className="panel">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Phiếu Xuất Keo/Butyl - Chi Tiết</h1>
                <h3 className="text-lg font-semibold mb-3 text-white-dark">
                    Ngày tạo: <span className="text-dark">{data.createdAt.slice(0, 10)}</span>
                </h3>
                <h3 className="text-lg font-semibold mb-3 text-white-dark">
                    Nhân viên xuất kho: <span className="text-dark">{data.employeeName}</span>
                </h3>
            </div>

            {/* Bảng Thành Phẩm */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3">Danh sách thành phẩm</h3>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 text-sm">
                        <thead className="bg-gray-100 font-semibold text-gray-800">
                        <tr>
                            <th className="border border-gray-300 p-3 text-left w-2/3">Tên sản phẩm (kính)</th>
                            <th className="border border-gray-300 p-3 text-left w-1/3">Số lượng cần xuất</th>
                        </tr>
                        </thead>
                        <tbody>
                        {data.products.map((p, i) => (
                            <React.Fragment key={i}>
                                <tr
                                    onClick={() => toggleExpand(i)}
                                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                >
                                    <td className="border border-gray-300 p-3 font-medium text-base flex items-center gap-2">
                                        <span className="text-lg font-bold text-dark">{p.name}</span>
                                        <span className="text-gray-500 text-xs">{expandedIndex === i ? '▲' : '▼'}</span>
                                    </td>
                                    <td className="border border-gray-300 p-3">{p.quantity}</td>
                                </tr>
                                {expandedIndex === i && (
                                    <tr>
                                        <td colSpan={2} className="border border-gray-300 p-3 bg-gray-50 dark:bg-gray-800">
                                            <div className="ml-2">
                                                <h4 className="font-semibold mb-2 text-gray-700 dark:text-white">Chi tiết hóa chất sử dụng:</h4>
                                                <table className="w-full border-collapse border border-gray-300 text-sm">
                                                    <thead className="bg-gray-100 font-semibold text-gray-800">
                                                    <tr>
                                                        <th className="border border-gray-300 p-2 text-left">Tên hóa chất</th>
                                                        <th className="border border-gray-300 p-2 text-left">Đơn vị</th>
                                                        <th className="border border-gray-300 p-2 text-left">Số lượng</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {p.glueButyls.map((chem, j) => (
                                                        <tr key={j}>
                                                            <td className="border border-gray-300 p-2">{chem.type}</td>
                                                            <td className="border border-gray-300 p-2">{chem.uom}</td>
                                                            <td className="border border-gray-300 p-2">{chem.quantity}</td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PhieuXuatKeoButylManager;
