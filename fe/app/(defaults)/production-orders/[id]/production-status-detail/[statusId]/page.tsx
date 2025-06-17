'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Mock data for production status detail
const mockProductionStatus = {
    id: 'PS001',
    orderDate: '2024-03-20',
    status: 'Đang sản xuất',
    items: [
        {
            id: 1,
            productCode: 'SP001',
            productName: 'Kính cường lực 2 lớp',
            glueLayers: 2,
            glassPanels: 2,
            thickness: 6,
            width: 1000,
            height: 2000,
            butylType: 0.5,
            quantity: 10
        },
        {
            id: 2,
            productCode: 'SP002',
            productName: 'Kính cường lực 3 lớp',
            glueLayers: 2,
            glassPanels: 3,
            thickness: 8,
            width: 1200,
            height: 1800,
            butylType: 0.4,
            quantity: 8
        }
    ],
    calculations: {
        glassArea: 4.8, // m2
        perimeter: 6.4, // m
        glueArea: 0.32, // m2
        gluePerLayer: 0.16, // kg
        totalGlue: 0.32, // kg
        butylLength: 12.8, // m
        chemicalA: 0.5, // kg
        koh: 0.2, // kg
        h2o: 0.3 // kg
    }
};

const ProductionStatusDetailPage = () => {
    const params = useParams();
    const router = useRouter();
    const orderId = params.id;
    const statusId = params.statusId;

    const [checkboxes, setCheckboxes] = useState({
        exportChemicals: false,
        mixGlue: false,
        cutGlass: false,
        exportGlueButyl: false,
        glueGlass: false
    });

    const handleCheckboxChange = (name: keyof typeof checkboxes) => {
        setCheckboxes(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    const handleEdit = () => {
        router.push(`/production-orders/${orderId}/production-status-detail/${statusId}/edit`);
    };

    const handleExportGlueButyl = () => {
        router.push(`/production-orders/${orderId}/production-status-detail/glue-and-butyl-issuance/${statusId}`);
    };

    const handleExportChemicals = () => {
        router.push(`/production-orders/${orderId}/production-status-detail/chemical-issuance/${statusId}`);
    };

    const handleCutGlass = () => {
        router.push(`/production-orders/${orderId}/production-status-detail/cut-glass-1/${statusId}`);
    };

    const handleImportFinished = () => {
        alert('Nhập kho thành phẩm thành công!');
    };

    const handleBack = () => {
        router.push(`/production-orders/${orderId}`);
    };

    const totalQuantity = mockProductionStatus.items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Chi tiết trạng thái sản xuất: {statusId}</h1>
                <div className="space-x-2">
                    <button onClick={handleEdit} className="px-4 py-1 bg-blue-500 text-white rounded">
                        📝 Sửa
                    </button>
                    <button onClick={handleExportGlueButyl} className="px-4 py-1 bg-green-600 text-white rounded">
                        🧪 Xuất keo, butyl
                    </button>
                    <button onClick={handleExportChemicals} className="px-4 py-1 bg-yellow-500 text-black rounded">
                        🧪 Xuất hóa chất
                    </button>
                    <button onClick={handleCutGlass} className="px-4 py-1 bg-purple-500 text-white rounded">
                        ✂️ Cắt kính
                    </button>
                    <button onClick={handleImportFinished} className="px-4 py-1 bg-indigo-500 text-white rounded">
                        📦 Nhập kho thành phẩm
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                    <strong>Mã lệnh sản xuất:</strong> {orderId}
                </div>
                <div>
                    <strong>Mã trạng thái:</strong> {statusId}
                </div>
                <div>
                    <strong>Ngày tạo:</strong> {mockProductionStatus.orderDate}
                </div>
                <div>
                    <strong>Trạng thái:</strong> {mockProductionStatus.status}
                </div>
            </div>

            <h2 className="text-xl font-semibold mb-4">Sản phẩm</h2>
            <div className="table-responsive mb-6 overflow-x-auto">
                <table className="w-full border-collapse border text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2">STT</th>
                            <th className="border p-2">Mã SP</th>
                            <th className="border p-2">Tên SP</th>
                            <th className="border p-2">Số lớp keo</th>
                            <th className="border p-2">Số tấm kính</th>
                            <th className="border p-2">Dày (mm)</th>
                            <th className="border p-2">Rộng (mm)</th>
                            <th className="border p-2">Cao (mm)</th>
                            <th className="border p-2">Loại Butyl (mm)</th>
                            <th className="border p-2">Số lượng</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mockProductionStatus.items.map((item, idx) => (
                            <tr key={item.id}>
                                <td className="border p-2 text-center">{idx + 1}</td>
                                <td className="border p-2">{item.productCode}</td>
                                <td className="border p-2">{item.productName}</td>
                                <td className="border p-2 text-right">{item.glueLayers}</td>
                                <td className="border p-2 text-right">{item.glassPanels}</td>
                                <td className="border p-2 text-right">{item.thickness}</td>
                                <td className="border p-2 text-right">{item.width}</td>
                                <td className="border p-2 text-right">{item.height}</td>
                                <td className="border p-2 text-right">{item.butylType}</td>
                                <td className="border p-2 text-right">{item.quantity}</td>
                            </tr>
                        ))}
                        <tr className="bg-gray-50 font-bold">
                            <td colSpan={9} className="border p-2 text-right">Tổng cộng:</td>
                            <td className="border p-2 text-right">{totalQuantity}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h2 className="text-xl font-semibold mb-4">Tính toán</h2>
            <div className="table-responsive mb-6 overflow-x-auto">
                <table className="w-full border-collapse border text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2">Diện tích kính (m²)</th>
                            <th className="border p-2">Chu vi (m)</th>
                            <th className="border p-2">Diện tích keo (m²)</th>
                            <th className="border p-2">Lượng keo/1 lớp (kg)</th>
                            <th className="border p-2">Tổng lượng keo (kg)</th>
                            <th className="border p-2">Chiều dài butyl (m)</th>
                            <th className="border p-2">Chất A (kg)</th>
                            <th className="border p-2">KOH (kg)</th>
                            <th className="border p-2">H2O (kg)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="border p-2 text-right">{mockProductionStatus.calculations.glassArea}</td>
                            <td className="border p-2 text-right">{mockProductionStatus.calculations.perimeter}</td>
                            <td className="border p-2 text-right">{mockProductionStatus.calculations.glueArea}</td>
                            <td className="border p-2 text-right">{mockProductionStatus.calculations.gluePerLayer}</td>
                            <td className="border p-2 text-right">{mockProductionStatus.calculations.totalGlue}</td>
                            <td className="border p-2 text-right">{mockProductionStatus.calculations.butylLength}</td>
                            <td className="border p-2 text-right">{mockProductionStatus.calculations.chemicalA}</td>
                            <td className="border p-2 text-right">{mockProductionStatus.calculations.koh}</td>
                            <td className="border p-2 text-right">{mockProductionStatus.calculations.h2o}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="flex gap-8 mb-6">
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={checkboxes.exportChemicals}
                        onChange={() => handleCheckboxChange('exportChemicals')}
                        className="checkbox"
                    />
                    <span>Xuất hóa chất</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={checkboxes.mixGlue}
                        onChange={() => handleCheckboxChange('mixGlue')}
                        className="checkbox"
                    />
                    <span>Trộn keo</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={checkboxes.cutGlass}
                        onChange={() => handleCheckboxChange('cutGlass')}
                        className="checkbox"
                    />
                    <span>Cắt kính</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={checkboxes.exportGlueButyl}
                        onChange={() => handleCheckboxChange('exportGlueButyl')}
                        className="checkbox"
                    />
                    <span>Xuất keo, butyl</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={checkboxes.glueGlass}
                        onChange={() => handleCheckboxChange('glueGlass')}
                        className="checkbox"
                    />
                    <span>Dán kính</span>
                </label>
            </div>

            <button onClick={handleBack} className="px-3 py-1 bg-gray-300 text-black rounded mt-4">
                ◀ Quay lại
            </button>
        </div>
    );
};

export default ProductionStatusDetailPage; 