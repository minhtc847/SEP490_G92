'use client';

import React, { useState, useEffect } from 'react';
import { CreateInventorySlipDto, CreateInventorySlipDetailDto, ProductionOrderInfo, ProductInfo, ProductionMaterial, fetchMaterialsByProductionOutput, createMaterialExportSlip } from '../../service';

interface MaterialExportSlipFormProps {
    productionOrderInfo: ProductionOrderInfo;
    onSlipCreated: (slip: any) => void;
    onCancel: () => void;
}

interface TargetProduct {
    id: number;
    productId: number;
    productName: string;
    productCode: string;
    uom: string;
    amount: number;
    selected: boolean;
    targetQuantity: number;
}

interface MaterialForTarget {
    productionOutputId: number;
    productId: number;
    productName: string;
    productCode: string;
    uom: string;
    amount: number;
    quantity: number;
    note: string;
}

export default function MaterialExportSlipForm({
    productionOrderInfo,
    onSlipCreated,
    onCancel
}: MaterialExportSlipFormProps) {
    const [formData, setFormData] = useState<CreateInventorySlipDto>({
        productionOrderId: productionOrderInfo.id,
        description: '',
        details: [],
        mappings: []
    });

    const [targetProducts, setTargetProducts] = useState<TargetProduct[]>([]);
    const [selectedMaterials, setSelectedMaterials] = useState<MaterialForTarget[]>([]);
    const [loading, setLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const isButylGlueSlip = productionOrderInfo.type === 'Ghép kính';
    const isChemicalExportSlip = ['Sản xuất keo', 'Đổ keo'].includes(productionOrderInfo.type);

    useEffect(() => {
        if (productionOrderInfo) {
            loadTargetProducts();
        }

        return () => {
            setLoading(false);
            setShowConfirmModal(false);
        };
    }, [productionOrderInfo]);

    const loadTargetProducts = async () => {
        if (!productionOrderInfo.productionOutputs || productionOrderInfo.productionOutputs.length === 0) {
            return;
        }

        const targets: TargetProduct[] = productionOrderInfo.productionOutputs.map(output => ({
            id: output.id,
            productId: output.productId,
            productName: output.productName || `Sản phẩm ${output.productId}`,
            productCode: productionOrderInfo.availableProducts?.find(p => p.id === output.productId)?.productCode || '',
            uom: output.uom || 'tấm',
            amount: output.amount || 0,
            selected: false,
            targetQuantity: 0
        }));

        setTargetProducts(targets);
    };

    const handleTargetProductToggle = (targetId: number) => {
        setTargetProducts(prev => prev.map(target =>
            target.id === targetId ? { ...target, selected: !target.selected } : target
        ));
    };

    const handleTargetQuantityChange = (targetId: number, quantity: number) => {
        setTargetProducts(prev => prev.map(target =>
            target.id === targetId ? { ...target, targetQuantity: quantity } : target
        ));
    };

    const handleLoadMaterialsForTarget = async (targetId: number) => {
        const target = targetProducts.find(t => t.id === targetId);
        if (!target) return;

        try {
            const materials = await fetchMaterialsByProductionOutput(target.id);

            if (materials && materials.length > 0) {
                // Chuyển đổi ProductionMaterial thành MaterialForTarget
                const targetMaterials: MaterialForTarget[] = materials.map(material => ({
                    productionOutputId: material.productionOutputId,
                    productId: material.productId,
                    productName: material.productName,
                    productCode: material.productCode,
                    uom: material.uom,
                    amount: material.amount,
                    quantity: 0,
                    note: ''
                }));

                setSelectedMaterials(prev => {
                    const filtered = prev.filter(m => m.productionOutputId !== target.id);
                    return [...filtered, ...targetMaterials];
                });
            } else {
                alert('Không có nguyên liệu nào được định nghĩa cho sản phẩm mục tiêu này');
            }
        } catch (error) {
            console.error('Error loading materials:', error);
            alert('Có lỗi xảy ra khi tải danh sách nguyên liệu');
        }
    };

    const handleUpdateMaterial = (productionOutputId: number, productId: number, field: 'quantity' | 'note', value: any) => {
        setSelectedMaterials(prev => prev.map(material =>
            material.productionOutputId === productionOutputId && material.productId === productId
                ? { ...material, [field]: value }
                : material
        ));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Ngăn chặn double submit
        if (loading || showConfirmModal) {
            console.log('Form đang được xử lý hoặc modal đang mở, bỏ qua submit');
            return;
        }

        const selectedTargets = targetProducts.filter(t => t.selected);
        if (selectedTargets.length === 0) {
            alert('Vui lòng chọn ít nhất một sản phẩm mục tiêu');
            return;
        }

        const invalidTargets = selectedTargets.filter(t => t.targetQuantity <= 0);
        if (invalidTargets.length > 0) {
            alert('Vui lòng nhập số lượng mục tiêu > 0 cho tất cả sản phẩm đã chọn');
            return;
        }

        const validMaterials = selectedMaterials.filter(m => m.quantity > 0);
        if (validMaterials.length === 0) {
            alert('Vui lòng nhập số lượng > 0 cho ít nhất một nguyên liệu');
            return;
        }

        // Chuyển đổi selectedMaterials thành formData.details
        const details: CreateInventorySlipDetailDto[] = validMaterials.map((material, index) => ({
            productId: material.productId,
            quantity: material.quantity,
            note: material.note,
            sortOrder: index,
            productionOutputId: material.productionOutputId // Sử dụng production_output_id để gom nhóm
        }));

        // Tạo ProductionOutputTargets từ các sản phẩm mục tiêu đã chọn
        const productionOutputTargets = selectedTargets.map(target => ({
            productionOutputId: target.id,
            targetQuantity: target.targetQuantity
        }));

        setFormData(prev => ({
            ...prev,
            details,
            productionOutputTargets
        }));
        setShowConfirmModal(true);
    };

    const handleConfirmCreate = async () => {
        // Ngăn chặn double click
        if (loading) {
            return;
        }

        try {
            setLoading(true);

            setShowConfirmModal(false);

            onSlipCreated(formData);

        } catch (error) {
            alert('Có lỗi xảy ra khi xử lý form');
        } finally {
            setLoading(false);
        }
    };

    const getSlipTypeText = () => {
        if (isButylGlueSlip) return 'phiếu xuất keo butyl';
        if (isChemicalExportSlip) return 'phiếu xuất hóa chất';
        return 'phiếu xuất vật liệu';
    };

    const getSlipTypeDescription = () => {
        if (isButylGlueSlip) return 'Xuất keo butyl cho quá trình ghép kính';
        if (isChemicalExportSlip) return 'Xuất hóa chất cho quá trình sản xuất keo';
        return 'Xuất vật liệu cho quá trình sản xuất';
    };

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">
                Tạo {getSlipTypeText()} mới
            </h2>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mã lệnh sản xuất
                        </label>
                        <input
                            type="text"
                            value={productionOrderInfo.productionOrderCode}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Loại lệnh sản xuất
                        </label>
                        <input
                            type="text"
                            value={productionOrderInfo.type}
                            disabled
                            className="w-full px-3 py-3 border border-gray-300 rounded-md bg-gray-50"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mô tả
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md resize-vertical"
                            placeholder={`Nhập mô tả ${getSlipTypeText()}...`}
                            rows={3}
                        />
                    </div>
                </div>

                {/* Step 1: Select Target Products */}
                <div className="border-t pt-6 mb-6">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-blue-800 mb-2">
                            Bước 1: Chọn sản phẩm mục tiêu
                        </h3>
                        <p className="text-sm text-gray-600">
                            Chọn các sản phẩm mục tiêu mà bạn muốn tạo phiếu xuất nguyên liệu
                        </p>
                    </div>

                    {targetProducts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            {targetProducts.map((target) => (
                                <div
                                    key={target.id}
                                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${target.selected
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-300 bg-white hover:bg-gray-50'
                                        }`}
                                    onClick={() => handleTargetProductToggle(target.id)}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h4 className={`font-medium ${target.selected ? 'text-blue-900' : 'text-gray-900'
                                                }`}>
                                                {target.productName}
                                            </h4>
                                            <p className={`text-sm ${target.selected ? 'text-blue-700' : 'text-gray-700'
                                                }`}>
                                                Mã: {target.productCode}
                                            </p>
                                            <p className={`text-sm ${target.selected ? 'text-blue-600' : 'text-gray-600'
                                                }`}>
                                                Đơn vị: {target.uom}
                                            </p>
                                            <p className={`text-sm ${target.selected ? 'text-blue-600' : 'text-gray-600'
                                                }`}>
                                                Số lượng mục tiêu: {target.amount}
                                            </p>
                                            {target.selected && (
                                                <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                                                    <label className="block text-sm font-medium text-blue-700 mb-1" onClick={(e) => e.stopPropagation()}>
                                                        Số lượng cần sản xuất <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0.01"
                                                        value={target.targetQuantity}
                                                        onChange={(e) => handleTargetQuantityChange(target.id, parseFloat(e.target.value) || 0)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className={`w-full px-3 py-2 border rounded-md text-sm ${target.targetQuantity <= 0 ? 'border-red-500 bg-red-50' : 'border-blue-300 bg-white'
                                                            }`}
                                                        placeholder="0.00"
                                                    />
                                                    {target.targetQuantity <= 0 && (
                                                        <p className="text-red-500 text-xs mt-1">Số lượng phải lớn hơn 0</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${target.selected
                                            ? 'border-blue-500 bg-blue-500'
                                            : 'border-gray-300'
                                            }`}>
                                            {target.selected && (
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>

                                    {target.selected && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleLoadMaterialsForTarget(target.id);
                                            }}
                                            className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                                        >
                                            Tải nguyên liệu
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            Không có sản phẩm mục tiêu nào cho lệnh sản xuất này.
                        </div>
                    )}
                </div>

                {/* Step 2: Materials for Selected Targets */}
                {selectedMaterials.length > 0 && (
                    <div className="border-t pt-6 mb-6">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-green-800 mb-2">
                                Bước 2: Nguyên liệu và thành phẩm mục tiêu
                            </h3>
                            <p className="text-sm text-gray-600">
                                Nhập số lượng nguyên liệu cần xuất. Nguyên liệu có số lượng = 0 sẽ không được thêm vào phiếu.
                                Thành phẩm mục tiêu sẽ được tự động thêm vào phiếu.
                            </p>
                        </div>

                        {/* Group materials by production output */}
                        {targetProducts
                            .filter(target => target.selected)
                            .map(target => {
                                const targetMaterials = selectedMaterials.filter(m => m.productionOutputId === target.id);
                                if (targetMaterials.length === 0) return null;

                                return (
                                    <div key={target.id} className="mb-6 border border-green-200 rounded-lg p-4 bg-green-50">
                                        <h4 className="text-lg font-medium text-green-800 mb-4 border-b border-green-300 pb-2">
                                            {target.productName} ({target.productCode})
                                        </h4>

                                        <div className="space-y-4">
                                            <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                                                <strong> Hướng dẫn:</strong> Nhập số lượng {'>'} 0 cho nguyên liệu cần sử dụng. Để trống hoặc nhập 0 cho nguyên liệu không sử dụng.
                                            </div>

                                            {/* semi product */}
                                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                                <h5 className="text-sm font-medium text-yellow-800 mb-2">
                                                    Thành phẩm mục tiêu sẽ được nhập kho:
                                                </h5>
                                                <div className="text-sm text-yellow-700">
                                                    <p><strong>Sản phẩm:</strong> {target.productName} ({target.productCode})</p>
                                                    <p><strong>Số lượng:</strong> {target.targetQuantity} {target.uom}</p>
                                                </div>
                                            </div>

                                            {/* mat */}
                                            <div className="space-y-3">
                                                <h5 className="text-sm font-medium text-green-700 mb-2">
                                                    Nguyên liệu cần xuất:
                                                </h5>
                                                {targetMaterials.map((material, index) => (
                                                    <div key={`${target.id}-${material.productId}`} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-3 bg-white rounded border border-green-200">
                                                        <div>
                                                            <label className="block text-sm font-medium text-green-700 mb-2">
                                                                Nguyên liệu
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={material.productName}
                                                                disabled
                                                                className="w-full px-3 py-2 border border-green-300 rounded-md bg-gray-50"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-green-700 mb-2">
                                                                Mã
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={material.productCode}
                                                                disabled
                                                                className="w-full px-3 py-2 border border-green-300 rounded-md bg-gray-50"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-green-700 mb-2">
                                                                Số lượng
                                                            </label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                value={material.quantity}
                                                                onChange={(e) => handleUpdateMaterial(
                                                                    material.productionOutputId,
                                                                    material.productId,
                                                                    'quantity',
                                                                    parseFloat(e.target.value) || 0
                                                                )}
                                                                className={`w-full px-3 py-2 border rounded-md ${material.quantity > 0 ? 'border-green-300 bg-white' : 'border-gray-300 bg-gray-50'
                                                                    }`}
                                                                placeholder="0.00"
                                                            />
                                                            <p className="text-gray-500 text-xs mt-1">
                                                                {material.quantity > 0 ? 'Sẽ được thêm vào phiếu' : 'Để trống nếu không sử dụng'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-green-700 mb-2">
                                                                Ghi chú
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={material.note}
                                                                onChange={(e) => handleUpdateMaterial(
                                                                    material.productionOutputId,
                                                                    material.productId,
                                                                    'note',
                                                                    e.target.value
                                                                )}
                                                                className="w-full px-3 py-2 border border-green-300 rounded-md bg-white"
                                                                placeholder="Ghi chú..."
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                )}

                {/* Confirmation Modal */}
                {showConfirmModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <div className="flex items-center mb-4">
                                <div className="flex-shrink-0">
                                    <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Xác nhận tạo phiếu
                                    </h3>
                                </div>
                            </div>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    Bạn có chắc chắn muốn tạo {getSlipTypeText()} này không?
                                </p>
                            </div>
                            <div className="mt-4 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmCreate}
                                    disabled={loading}
                                    className={`px-4 py-2 rounded-md transition-colors ${loading
                                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                        : 'bg-blue-500 text-white hover:bg-blue-600'
                                        }`}
                                >
                                    {loading ? 'Đang tạo...' : 'Xác nhận'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={
                            targetProducts.filter(t => t.selected).length === 0 ||
                            targetProducts.filter(t => t.selected && t.targetQuantity <= 0).length > 0 ||
                            loading
                        }
                        className={`px-6 py-2 rounded-md transition-colors ${targetProducts.filter(t => t.selected).length === 0 ||
                            targetProducts.filter(t => t.selected && t.targetQuantity <= 0).length > 0 ||
                            loading
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                    >
                        {loading ? 'Đang xử lý...' : 'Tạo phiếu'}
                    </button>
                </div>
            </form>
        </div>
    );
}
