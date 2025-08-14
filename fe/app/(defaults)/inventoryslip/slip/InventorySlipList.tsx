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
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã SP</th>
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

// Component for displaying cut glass slip details in hierarchical structure
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

    // Separate raw materials from output products
    // Check for all possible raw material productType values
    const rawMaterials = slip.details.filter(detail => {
        const isRawMaterial = detail.productType === 'NVL' || 
                             detail.productType === 'Nguyên vật liệu' || 
                             detail.productType === 'raw_material';
        
        return isRawMaterial;
    });
    
    const outputProducts = slip.details.filter(detail => {
        const isOutputProduct = detail.productType === 'Bán thành phẩm' || 
                               detail.productType === 'BTP' || 
                               detail.productType === 'semi_finished' ||
                               detail.productType === 'Kính dư' ||
                               detail.productType === 'Kính';
        
        return isOutputProduct;
    });

    // Create a mapping from raw material to its output products
    const materialOutputMap = new Map<number, InventorySlipDetail[]>();
    
    // Use the actual mappings from the backend
    rawMaterials.forEach(material => {
        if (material.outputMappings && material.outputMappings.length > 0) {
            // Use actual mappings if available
            const outputs = material.outputMappings.map(mapping => {
                const outputDetail = outputProducts.find(d => d.id === mapping.outputDetailId);
                return outputDetail;
            }).filter(Boolean) as InventorySlipDetail[];
            
            materialOutputMap.set(material.id, outputs);
        } else {
            // If no mappings, show empty array (don't show all output products)
            materialOutputMap.set(material.id, []);
        }
    });

    return (
        <div className="space-y-4">
            {/* Raw Materials Section */}
            <div>
                <h6 className="font-medium text-blue-800 mb-3">Nguyên vật liệu (Kính lớn)</h6>
                <div className="space-y-3">
                    {rawMaterials.map((material) => {
                        const outputs = materialOutputMap.get(material.id) || [];
                        const isExpanded = expandedMaterials.has(material.id);
                        
                        return (
                            <div key={material.id} className="border rounded-lg overflow-hidden">
                                {/* Material Header - Clickable */}
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
                                                    Mã: {material.productCode} | 
                                                    Số lượng: {material.quantity} {material.uom || 'cái'} | 
                                                    {outputs.length > 0 ? ` Tạo ra ${outputs.length} sản phẩm` : ' Chưa có sản phẩm đầu ra'}
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
                                                {outputs.map((output) => (
                                                    <div key={output.id} className="flex items-center justify-between p-2 bg-gray-50 rounded border-l-4 border-green-400">
                                                        <div className="flex-1">
                                                            <div className="font-medium text-gray-800">
                                                                {output.productName}
                                                            </div>
                                                            <div className="text-sm text-gray-600">
                                                                Mã: {output.productCode} | 
                                                                Số lượng: {output.quantity} {output.uom || 'cái'} | 
                                                                Loại: {output.productType}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                                output.productType === 'Bán thành phẩm' || output.productType === 'BTP' || output.productType === 'semi_finished'
                                                                    ? 'bg-green-100 text-green-800 border border-green-200' 
                                                                    : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                                            }`}>
                                                                {output.productType === 'Bán thành phẩm' || output.productType === 'BTP' || output.productType === 'semi_finished'
                                                                    ? 'Bán thành phẩm' 
                                                                    : 'Kính dư'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
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
                    <p><strong>Tổng cộng:</strong> {rawMaterials.length} nguyên vật liệu, {outputProducts.length} sản phẩm đầu ra</p>
                </div>
            </div>
        </div>
    );
};

// Component for displaying material export slip details (chemical export, glue butyl)
const MaterialExportSlipDetails = ({ 
    slip, 
    expandedMaterials, 
    toggleMaterialsExpanded 
}: { 
    slip: InventorySlip;
    expandedMaterials: Set<number>;
    toggleMaterialsExpanded: (id: number) => void;
}) => {
    // Group details by production_output_id
    const groupedDetails = slip.details.reduce((groups, detail) => {
        const key = detail.productionOutputId || 0;
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(detail);
        return groups;
    }, {} as Record<number, InventorySlipDetail[]>);

    // Get production output info for each group
    const productionOutputs = slip.details
        .filter(d => d.productionOutputId)
        .map(d => d.productionOutputId!)
        .filter((value, index, self) => self.indexOf(value) === index);

    return (
        <div className="space-y-4">
            {productionOutputs.length > 0 ? (
                productionOutputs.map((productionOutputId) => {
                    const materials = groupedDetails[productionOutputId] || [];
                    const isExpanded = expandedMaterials.has(productionOutputId);
                    
                    return (
                        <div key={productionOutputId} className="border border-green-200 rounded-lg overflow-hidden">
                            {/* Production Output Header - Clickable */}
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
                                                {materials[0]?.targetProductName || `Sản phẩm mục tiêu #${productionOutputId}`}
                                            </div>
                                            <div className="text-sm text-green-700">
                                                {materials[0]?.targetProductCode && `Mã: ${materials[0].targetProductCode} | `}
                                                {materials.length} nguyên liệu được sử dụng
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
                                                            Mã: {material.productCode} | 
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
                    Không có thông tin sản phẩm mục tiêu nào.
                </div>
            )}

            {/* Summary */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                    <p><strong>Tổng cộng:</strong> {productionOutputs.length} sản phẩm mục tiêu, {slip.details.length} nguyên liệu</p>
                </div>
            </div>
        </div>
    );
};

export default InventorySlipList;
