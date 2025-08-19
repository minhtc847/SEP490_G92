'use client';
import { useState } from 'react';
import { InventorySlip, InventorySlipDetail, MaterialOutputMappingDto } from '../service';
import IconEye from '@/components/icon/icon-eye';
import IconArrowLeft from '@/components/icon/icon-arrow-left';

interface InventorySlipListProps {
    slips: InventorySlip[];
    onRefresh: () => void;
}

const InventorySlipList = ({ slips, onRefresh }: InventorySlipListProps) => {
    const [expandedSlips, setExpandedSlips] = useState<Set<number>>(new Set());
    const [expandedMaterials, setExpandedMaterials] = useState<Set<number>>(new Set());

    const toggleExpanded = (slipId: number) => {
        const newExpanded = new Set(expandedSlips);
        if (newExpanded.has(slipId)) {
            newExpanded.delete(slipId);
        } else {
            newExpanded.add(slipId);
        }
        setExpandedSlips(newExpanded);
    };

    const toggleMaterialsExpanded = (productionOutputId: number) => {
        const newExpanded = new Set(expandedMaterials);
        if (newExpanded.has(productionOutputId)) {
            newExpanded.delete(productionOutputId);
        } else {
            newExpanded.add(productionOutputId);
        }
        setExpandedMaterials(newExpanded);
    };



    const getSlipTypeText = (productionOrderType: string | undefined) => {
        switch (productionOrderType) {
            case 'Cắt kính': return 'Phiếu cắt kính';
            case 'Ghép kính': return 'Phiếu xuất keo butyl';
            case 'Sản xuất keo':
            case 'Đổ keo': return 'Phiếu xuất hóa chất';
            default: return productionOrderType || '-';
        }
    };

    if (slips.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                Chưa có phiếu kho nào cho lệnh sản xuất này.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {slips.map((slip) => (
                <div key={slip.id} className="border rounded-lg overflow-hidden">
                    {/* Slip Header */}
                    <div className="bg-gray-50 p-4 border-b">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-2">
                                    <h4 className="text-lg font-semibold text-blue-600">
                                        {slip.slipCode}
                                    </h4>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200`}>
                                        {getSlipTypeText(slip.productionOrderType)}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <p><strong>Ngày tạo:</strong> {new Date(slip.createdAt).toLocaleDateString()}</p>
                                    <p><strong>Người tạo:</strong> {slip.createdByEmployeeName}</p>
                                    {slip.description && (
                                        <p><strong>Mô tả:</strong> {slip.description}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => toggleExpanded(slip.id)}
                                    className="px-3 py-1 text-sm border border-blue-300 text-blue-700 bg-white hover:bg-blue-50 rounded-md transition-colors"
                                    title={expandedSlips.has(slip.id) ? 'Thu gọn' : 'Mở rộng'}
                                >
                                    <IconEye className="w-4 h-4" />
                                    {expandedSlips.has(slip.id) ? ' Thu gọn' : ' Chi tiết'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Slip Details */}
                    {expandedSlips.has(slip.id) && (
                        <div className="p-4">
                            <h5 className="font-medium mb-3">Chi tiết phiếu:</h5>

                            {/* For Cut Glass Slips - Show hierarchical structure */}
                            {slip.productionOrderType === 'Cắt kính' ? (
                                <CutGlassSlipDetails slip={slip} />
                            ) : ['Ghép kính', 'Sản xuất keo', 'Đổ keo'].includes(slip.productionOrderType || '') ? (
                                /* For material export slips - Show grouped structure */
                                <MaterialExportSlipDetails
                                    slip={slip}
                                    expandedMaterials={expandedMaterials}
                                    toggleMaterialsExpanded={toggleMaterialsExpanded}
                                />
                            ) : (
                                /* For other slip types - Show flat structure */
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên sản phẩm</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn vị</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ghi chú</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {slip.details.map((detail, index) => (
                                                <tr key={detail.id} className="bg-white hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-900">
                                                        {detail.productCode}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                                        {detail.productName}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                                            {detail.productType}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                                                        {detail.quantity}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{detail.uom || '-'}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={detail.note}>
                                                        {detail.note || '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}


        </div>
    );
};

const CutGlassSlipDetails = ({ slip }: { slip: InventorySlip }) => {
    const [expandedMaterials, setExpandedMaterials] = useState<Set<number>>(new Set());

    const toggleExpanded = (materialId: number) => {
        const newExpanded = new Set(expandedMaterials);
        if (newExpanded.has(materialId)) {
            newExpanded.delete(materialId);
        } else {
            newExpanded.add(materialId);
        }
        setExpandedMaterials(newExpanded);
    };

    const rawMaterials = slip.details.filter(detail =>
        detail.productId !== null && detail.productType === 'NVL'
    );

    // get semi finished products from production outputs
    const semiFinishedProducts = slip.details.filter(detail =>
        detail.productId !== null &&
        (detail.productType === 'Bán thành phẩm' || detail.productType === 'BTP' || detail.productType === 'semi_finished')
    );

    // get waste glass from material_output_mappings
    const wasteGlass = slip.details.filter(detail =>
        detail.productId !== null &&
        (detail.productType === 'Kính dư' || detail.productType === 'Kính')
    );

    const targetProducts = slip.details.filter(detail =>
        detail.productId === null // Thành phẩm mục tiêu
    );

    // Create a mapping from raw material to its output products
    const materialOutputMap = new Map<number, InventorySlipDetail[]>();

    // Debug logging
    console.log('Raw materials:', rawMaterials);
    console.log('Semi-finished products:', semiFinishedProducts);
    console.log('Waste glass:', wasteGlass);

    // Use the actual mappings from the backend
    rawMaterials.forEach(material => {
        console.log(`Processing material ${material.id} (${material.productName}):`);
        console.log('  OutputMappings:', material.outputMappings);
        
        if (material.outputMappings && material.outputMappings.length > 0) {
            // Use actual mappings if available
            const outputs = material.outputMappings.map(mapping => {
                console.log(`  Mapping: ${mapping.inputDetailId} -> ${mapping.outputDetailId}`);
                const outputDetail = [...semiFinishedProducts, ...wasteGlass].find(d => d.id === mapping.outputDetailId);
                console.log(`  Found output detail:`, outputDetail);
                return outputDetail;
            }).filter(Boolean) as InventorySlipDetail[];

            console.log(`  Final outputs for material ${material.id}:`, outputs);
            materialOutputMap.set(material.id, outputs);
        } else {
            console.log(`  No output mappings for material ${material.id}`);
            materialOutputMap.set(material.id, []);
        }
    });

    console.log('Final materialOutputMap:', materialOutputMap);

    return (
        <div className="space-y-4">
            <div>
                <h6 className="font-medium text-blue-800 mb-3">Nguyên vật liệu (Kính lớn)</h6>
                <div className="space-y-3">
                    {rawMaterials.map((material) => {
                        const outputs = materialOutputMap.get(material.id) || [];
                        const isExpanded = expandedMaterials.has(material.id);

                        return (
                            <div key={material.id} className="border rounded-lg overflow-hidden">
                                <div
                                    className="bg-blue-50 p-3 cursor-pointer hover:bg-blue-100 transition-colors"
                                    onClick={() => toggleExpanded(material.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            {isExpanded ? (
                                                <IconArrowLeft className="w-4 h-4 text-blue-600 rotate-90" />
                                            ) : (
                                                <IconArrowLeft className="w-4 h-4 text-blue-600 -rotate-90" />
                                            )}
                                            <div className="flex-1">
                                                <div className="font-medium text-blue-900">
                                                    {material.productName}
                                                </div>
                                                <div className="text-sm text-blue-700">
                                                    Số lượng: {material.quantity} {material.uom || 'cái'} |
                                                    {outputs.length > 0 ? (
                                                        <>
                                                            Tạo ra {outputs.length} sản phẩm
                                                            {targetProducts.length > 0 && (
                                                                <span className="ml-2 text-green-600">
                                                                    Thành phẩm mục tiêu: {
                                                                        targetProducts.reduce((total, target) => total + (target.quantity || 0), 0)
                                                                    } cái
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : ' Chưa có sản phẩm đầu ra'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Output Products - Expandable */}
                                {isExpanded && outputs.length > 0 && (
                                    <div className="border-t bg-white">
                                        <div className="p-3">
                                            <h6 className="font-medium text-gray-700 mb-2 block">
                                                Sản phẩm đầu ra:
                                            </h6>
                                            <div className="space-y-2">
                                                {outputs.map((output) => {
                                                    const isSemiFinished = semiFinishedProducts.some(p => p.id === output.id);
                                                    const isWasteGlass = wasteGlass.some(p => p.id === output.id);

                                                    return (
                                                        <div key={output.id} className={`flex items-center justify-between p-2 rounded border-l-4 ${isSemiFinished
                                                                ? 'bg-green-50 border-green-400'
                                                                : 'bg-yellow-50 border-yellow-400'
                                                            }`}>
                                                            <div className="flex-1">
                                                                <div className="font-medium text-gray-800">
                                                                    {output.productName}
                                                                </div>
                                                                <div className="text-sm text-gray-600">
                                                                    Số lượng: {output.quantity} {output.uom || 'cái'} |
                                                                    Loại: {output.productType}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isSemiFinished
                                                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                                                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                                                    }`}>
                                                                    {isSemiFinished ? 'Bán thành phẩm' : 'Kính dư'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* No Output Products Message */}
                                {isExpanded && outputs.length === 0 && (
                                    <div className="border-t bg-white p-3">
                                        <div className="text-center text-gray-500 text-sm py-4">
                                            Chưa có sản phẩm đầu ra nào được liên kết với nguyên vật liệu này.
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Summary */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">{rawMaterials.length}</div>
                            <div className="text-xs text-gray-500">Nguyên vật liệu</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-green-600">{semiFinishedProducts.length}</div>
                            <div className="text-xs text-gray-500">Bán thành phẩm</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-orange-600">{wasteGlass.length}</div>
                            <div className="text-xs text-gray-500">Kính dư</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-purple-600">{targetProducts.length}</div>
                            <div className="text-xs text-gray-500">Thành phẩm mục tiêu</div>
                        </div>
                    </div>
                    {targetProducts.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-700">
                                <strong>🎯 Tổng số lượng thành phẩm sẽ được nhập kho:</strong> {
                                    targetProducts.reduce((total, target) => total + (target.quantity || 0), 0)
                                } cái
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const MaterialExportSlipDetails = ({
    slip,
    expandedMaterials,
    toggleMaterialsExpanded
}: {
    slip: InventorySlip;
    expandedMaterials: Set<number>;
    toggleMaterialsExpanded: (id: number) => void;
}) => {
    const targetProducts = slip.details.filter(detail =>
        detail.productId === null // Thành phẩm mục tiêu
    );

    const rawMaterials = slip.details.filter(detail =>
        detail.productId !== null // Nguyên liệu thực
    );

    // Group nguyên liệu by production_output_id (loại bỏ thành phẩm mục tiêu)
    const groupedDetails = rawMaterials.reduce((groups, detail) => {
        const key = detail.productionOutputId || 0;
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(detail);
        return groups;
    }, {} as Record<number, InventorySlipDetail[]>);

    const productionOutputs = rawMaterials
        .filter(d => d.productionOutputId)
        .map(d => d.productionOutputId!)
        .filter((value, index, self) => self.indexOf(value) === index);

    // Helper function to get target product info 
    const getTargetProductInfo = (productionOutputId: number) => {
        const targetProduct = slip.details.find(d =>
            d.productionOutputId === productionOutputId &&
            d.productId === null // Thành phẩm mục tiêu
        );
        return targetProduct;
    };

    return (
        <div className="space-y-4">
            {productionOutputs.length > 0 ? (
                productionOutputs.map((productionOutputId) => {
                    const materials = groupedDetails[productionOutputId] || [];
                    const isExpanded = expandedMaterials.has(productionOutputId);
                    const targetProduct = getTargetProductInfo(productionOutputId);

                    // Chỉ hiển thị nếu có nguyên liệu thực
                    if (materials.length === 0) return null;

                    return (
                        <div key={productionOutputId} className="border border-green-200 rounded-lg overflow-hidden">
                            <div
                                className="bg-green-50 p-3 cursor-pointer hover:bg-green-100 transition-colors"
                                onClick={() => toggleMaterialsExpanded(productionOutputId)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        {isExpanded ? (
                                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        )}
                                        <div className="flex-1">
                                            <div className="font-medium text-green-900">
                                                {targetProduct?.note?.replace('Thành phẩm mục tiêu: ', '') || `Sản phẩm mục tiêu #${productionOutputId}`}
                                            </div>
                                            <div className="text-sm text-green-700">
                                                {targetProduct ? (
                                                    <>
                                                        <span className="font-semibold text-green-800 bg-green-100 px-2 py-1 rounded">
                                                            Số lượng: {targetProduct.quantity} {targetProduct.uom || 'cái'}
                                                        </span>
                                                        {' | '}
                                                    </>
                                                ) : null}
                                                <span className="text-blue-600">
                                                    {materials.length} nguyên liệu được sử dụng
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Materials List - Expandable */}
                            {isExpanded && (
                                <div className="border-t bg-white">
                                    <div className="p-3">
                                        <h6 className="font-medium text-gray-700 mb-2">
                                            Nguyên liệu đã xuất:
                                        </h6>
                                        <div className="space-y-2">
                                            {materials.map((material) => (
                                                <div key={material.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border-l-4 border-blue-400">
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-800">
                                                            {material.productName}
                                                        </div>
                                                        <div className="text-sm text-gray-600">
                                                            Số lượng: {material.quantity} {material.uom || 'cái'} |
                                                            Loại: {material.productType}
                                                        </div>
                                                        {material.note && (
                                                            <div className="text-sm text-gray-500 mt-1">
                                                                Ghi chú: {material.note}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <div className="mb-2">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-1">Không có thông tin nguyên liệu</p>
                    <p className="text-sm">Phiếu này không có nguyên liệu nào được định nghĩa</p>
                </div>
            )}

            {/* Summary */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">{targetProducts.length}</div>
                            <div className="text-xs text-gray-500">Sản phẩm mục tiêu</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-green-600">{
                                targetProducts.reduce((total, targetProduct) => {
                                    return total + (targetProduct.quantity || 0);
                                }, 0)
                            }</div>
                            <div className="text-xs text-gray-500">Tổng số lượng thành phẩm</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-orange-600">{rawMaterials.length}</div>
                            <div className="text-xs text-gray-500">Nguyên liệu</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventorySlipList;
