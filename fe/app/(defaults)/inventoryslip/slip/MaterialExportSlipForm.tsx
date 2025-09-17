'use client';

import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { CreateInventorySlipDto, CreateInventorySlipDetailDto, ProductionOrderInfo, ProductInfo, ProductionMaterial, fetchMaterialsByProductionOutput, createMaterialExportSlip, InventorySlip } from '../service';

interface MaterialExportSlipFormProps {
    productionOrderInfo: ProductionOrderInfo;
    onSlipCreated: (slip: any) => void;
    onCancel: () => void;
    initialSlip?: InventorySlip | null; // Prefill for update
    asModal?: boolean; // Render with its own modal shell
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
    onCancel,
    initialSlip,
    asModal = false,
}: MaterialExportSlipFormProps) {
    const MySwal = withReactContent(Swal);
    const [formData, setFormData] = useState<CreateInventorySlipDto>({
        productionOrderId: productionOrderInfo.id,
        description: '',
        details: [],
        mappings: []
    });

    const [targetProducts, setTargetProducts] = useState<TargetProduct[]>([]);
    const [selectedMaterials, setSelectedMaterials] = useState<MaterialForTarget[]>([]);
    const [loading, setLoading] = useState(false);
    const [plannedMaterialsMap, setPlannedMaterialsMap] = useState<Record<number, Record<number, number>>>({});

    const isButylGlueSlip = productionOrderInfo.type === 'Ghép kính';
    const isChemicalExportSlip = ['Sản xuất keo', 'Đổ keo'].includes(productionOrderInfo.type);
    const isUpdateMode = Boolean(initialSlip);

    useEffect(() => {
        if (productionOrderInfo) {
            loadTargetProducts();
        }

        return () => {
            setLoading(false);
        };
    }, [productionOrderInfo]);

    // Prefill from initialSlip (for update)
    useEffect(() => {
        if (!initialSlip) return;
        setFormData(prev => ({ ...prev, description: initialSlip.description || '' }));

        // Build base targets from productionOrderInfo.productionOutputs to ensure consistent list
        const baseTargets: TargetProduct[] = (productionOrderInfo?.productionOutputs || []).map((output: any) => ({
            id: output.id,
            productId: output.productId,
            productName: output.productName || `Sản phẩm ${output.productId}`,
            productCode: productionOrderInfo.availableProducts?.find((p: any) => p.id === output.productId)?.productCode || '',
            uom: output.uom || '',
            amount: output.amount || 0,
            selected: false,
            targetQuantity: 0,
        }));

        const targetsFromSlip = (initialSlip.details || [])
            .filter(d => d.productId === null && d.productionOutputId)
            .map(d => ({ productionOutputId: d.productionOutputId!, targetQuantity: d.quantity }));

        const mergedTargets = baseTargets.map(t => ({
            ...t,
            selected: targetsFromSlip.some(x => x.productionOutputId === t.id),
            targetQuantity: targetsFromSlip.find(x => x.productionOutputId === t.id)?.targetQuantity || 0,
        }));
        setTargetProducts(mergedTargets);


        // Prefill materials 
        const materials = (initialSlip.details || []).filter(d => d.productId !== null && d.productionOutputId);
        const prefillSelectedMaterials = materials.map(m => ({
            productionOutputId: m.productionOutputId!,
            productId: m.productId!,
            productName: m.productName || `Sản phẩm ${m.productId}`,
            productCode: m.productCode || '',
            uom: m.uom || '',
            amount: 0,
            quantity: m.quantity,
            note: m.note || '',
        }));
        setSelectedMaterials(prefillSelectedMaterials);

        // Load planned materials for existing targets to enable over-usage check on update
        (async () => {
            try {
                const targetIds = Array.from(new Set((targetsFromSlip || []).map(x => x.productionOutputId)));
                if (targetIds.length === 0) return;
                const results = await Promise.all(targetIds.map(id => fetchMaterialsByProductionOutput(id)));
                const map: Record<number, Record<number, number>> = {};
                results.forEach((arr, idx) => {
                    const tId = targetIds[idx];
                    map[tId] = {};
                    (arr || []).forEach((pm: ProductionMaterial) => {
                        map[tId][pm.productId] = Number(pm.amount || 0);
                    });
                });
                setPlannedMaterialsMap(map);
                
                setSelectedMaterials(prev => prev.map(m => ({
                    ...m,
                    amount: map[m.productionOutputId]?.[m.productId] ?? m.amount ?? 0,
                })));
            } catch (e) {  }
        })();
    }, [initialSlip, productionOrderInfo]);

    const loadTargetProducts = async () => {
        if (!productionOrderInfo.productionOutputs || productionOrderInfo.productionOutputs.length === 0) {
            return;
        }

        const targets: TargetProduct[] = productionOrderInfo.productionOutputs.map(output => ({
            id: output.id,
            productId: output.productId,
            productName: output.productName || `Sản phẩm ${output.productId}`,
            productCode: productionOrderInfo.availableProducts?.find(p => p.id === output.productId)?.productCode || '',
            uom: output.uom || '',
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
                MySwal.fire({
                    title: 'Không có nguyên liệu nào được định nghĩa cho sản phẩm mục tiêu này',
                    toast: true,
                    position: 'bottom-start',
                    showConfirmButton: false,
                    timer: 3000,
                    showCloseButton: true,
                });
            }
        } catch (error) {
            console.error('Error loading materials:', error);
            MySwal.fire({
                title: 'Có lỗi xảy ra khi tải danh sách nguyên liệu',
                toast: true,
                position: 'bottom-start',
                showConfirmButton: false,
                timer: 3000,
                showCloseButton: true,
            });
        }
    };

    const handleUpdateMaterial = (productionOutputId: number, productId: number, field: 'quantity' | 'note', value: any) => {
        setSelectedMaterials(prev => prev.map(material =>
            material.productionOutputId === productionOutputId && material.productId === productId
                ? { ...material, [field]: value }
                : material
        ));
        
        // Force re-render để cập nhật validation status
        setFormData(prev => ({ ...prev }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Ngăn chặn double submit
        if (loading) {
            console.log('Form đang được xử lý hoặc modal đang mở, bỏ qua submit');
            return;
        }

        const selectedTargets = targetProducts.filter(t => t.selected);
        if (selectedTargets.length === 0) {
            MySwal.fire({
                title: 'Vui lòng chọn ít nhất một sản phẩm mục tiêu',
                toast: true,
                position: 'bottom-start',
                showConfirmButton: false,
                timer: 3000,
                showCloseButton: true,
            });
            return;
        }

        const invalidTargets = selectedTargets.filter(t => t.targetQuantity <= 0);
        if (invalidTargets.length > 0) {
            MySwal.fire({
                title: 'Vui lòng nhập số lượng mục tiêu > 0 cho tất cả sản phẩm đã chọn',
                toast: true,
                position: 'bottom-start',
                showConfirmButton: false,
                timer: 3000,
                showCloseButton: true,
            });
            return;
        }

        // validate
        const validationErrors: string[] = [];
        
        for (const target of selectedTargets) {
            const targetMaterials = selectedMaterials.filter(m => m.productionOutputId === target.id);
            const hasValidMaterial = targetMaterials.some(m => m.quantity > 0);
            
            if (!hasValidMaterial) {
                validationErrors.push(`Sản phẩm "${target.productName}" chưa có nguyên liệu nào được điền số lượng > 0`);
            }
        }
        
        if (validationErrors.length > 0) {
            MySwal.fire({
                title: 'Vui lòng kiểm tra lại thông tin',
                html: validationErrors.map(error => `<div class="text-left mb-2">• ${error}</div>`).join(''),
                icon: 'warning',
                confirmButtonText: 'Đã hiểu',
                customClass: { popup: 'sweet-alerts' },
            });
            return;
        }

        const validMaterials = selectedMaterials.filter(m => m.quantity > 0);
        if (validMaterials.length === 0) {
            MySwal.fire({
                title: 'Vui lòng nhập số lượng > 0 cho ít nhất một nguyên liệu',
                toast: true,
                position: 'bottom-start',
                showConfirmButton: false,
                timer: 3000,
                showCloseButton: true,
            });
            return;
        }



        let overUsageWarnings: string[] = [];
        if (isChemicalExportSlip) {
            // Index targets by id for quick lookup
            const targetById = new Map<number, TargetProduct>();
            targetProducts.forEach(tp => targetById.set(tp.id, tp));

            // Group entered materials by productionOutputId
            const grouped: Record<number, MaterialForTarget[]> = {} as any;
            validMaterials.forEach(m => {
                if (!grouped[m.productionOutputId]) grouped[m.productionOutputId] = [] as MaterialForTarget[];
                grouped[m.productionOutputId].push(m);
            });

            Object.keys(grouped).forEach(key => {
                const productionOutputId = Number(key);
                const t = targetById.get(productionOutputId);
                if (!t) return;
                const totalPlanned = Number(t.amount || 0);
                const produceQty = Number(t.targetQuantity || 0);
                if (totalPlanned <= 0 || produceQty <= 0) return;

                grouped[productionOutputId].forEach(mat => {
                    const plannedMat = Number((mat.amount || plannedMaterialsMap[productionOutputId]?.[mat.productId]) || 0);
                    const entered = Number(mat.quantity || 0);
                    if (plannedMat <= 0 || entered <= 0) return;
                    const perUnit = plannedMat / totalPlanned;
                    const expected = perUnit * produceQty;
                    if (entered > expected + 1e-6) {
                        overUsageWarnings.push(`• Nguyên liệu "${mat.productName}" nhập ${entered} > định mức ${expected.toFixed(2)} cho sản phẩm "${t.productName}" (${produceQty} ${t.uom || ''})`);
                    }
                });
            });
        }

        // convert selectedMaterials to formData.details
        const details: CreateInventorySlipDetailDto[] = validMaterials.map((material, index) => ({
            productId: material.productId,
            quantity: material.quantity,
            note: material.note,
            sortOrder: index,
            productionOutputId: material.productionOutputId // use production_output_id to group
        }));

        // add target product details (với productId: undefined)
        const targetProductDetails: CreateInventorySlipDetailDto[] = selectedTargets.map((target, index) => ({
            productId: undefined,
            quantity: target.targetQuantity,
            note: `Thành phẩm mục tiêu: ${target.productName}`,
            sortOrder: details.length + index, // Sắp xếp sau nguyên liệu
            productionOutputId: target.id
        }));

        // Kết hợp nguyên liệu và thành phẩm mục tiêu
        const allDetails = [...details, ...targetProductDetails];

        const productionOutputTargets = selectedTargets.map(target => ({
            productionOutputId: target.id,
            targetQuantity: target.targetQuantity
        }));

        // Xây dựng DTO ngay lập tức để không phụ thuộc vào setState bất đồng bộ
        const builtDto: CreateInventorySlipDto = {
            productionOrderId: productionOrderInfo.id,
            description: formData.description,
            details: allDetails, 
            mappings: [],
            productionOutputTargets
        };

        const confirmOptions: any = {
            title: isUpdateMode ? 'Xác nhận cập nhật phiếu' : 'Xác nhận tạo phiếu',
            icon: overUsageWarnings.length > 0 ? 'warning' : 'question',
            showCancelButton: true,
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Hủy',
            customClass: { popup: 'sweet-alerts' },
        };
        if (overUsageWarnings.length > 0) {
            confirmOptions.html = `<div class="text-left">${overUsageWarnings.map(w => `<div class=\"mb-1\">${w}</div>`).join('')}</div>`;
        } else {
            confirmOptions.text = isUpdateMode ? 'Bạn có chắc chắn muốn cập nhật phiếu xuất này?' : 'Bạn có chắc chắn muốn tạo phiếu xuất này?';
        }

        MySwal.fire(confirmOptions).then((result: any) => {
            if (result.isConfirmed) {
                handleConfirmCreate(builtDto);
            }
        });
    };

    const handleConfirmCreate = async (dto: CreateInventorySlipDto) => {
        // Ngăn chặn double click
        if (loading) {
            console.log('Already loading, skipping...');
            return;
        }

        try {
            setLoading(true);

            onSlipCreated(dto);

        } catch (error) {
            console.error('Error in handleConfirmCreate:', error);
            MySwal.fire({
                title: 'Có lỗi xảy ra khi xử lý form',
                toast: true,
                position: 'bottom-start',
                showConfirmButton: false,
                timer: 3000,
                showCloseButton: true,
            });
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

    //validate form
    const isFormValid = (): boolean => {
        const selectedTargets = targetProducts.filter(t => t.selected);
        
        if (selectedTargets.length === 0) {
            return false;
        }
        
        if (selectedTargets.some(t => t.targetQuantity <= 0)) {
            return false;
        }
        
        for (const target of selectedTargets) {
            const targetMaterials = selectedMaterials.filter(m => m.productionOutputId === target.id);
            const hasValidMaterial = targetMaterials.some(m => m.quantity > 0);
            
            if (!hasValidMaterial) {
                return false;
            }
        }
        
        return true;
    };

    const content = (
        <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-2">
                {isUpdateMode ? `Cập nhật ${getSlipTypeText()}` : `Tạo ${getSlipTypeText()} mới`}
            </h2>
            <div className="mb-6 text-sm text-gray-600">
                <div><strong>Thuộc lệnh sản xuất:</strong> {productionOrderInfo.id}</div>
                <div><strong>Loại:</strong> {getSlipTypeText()}</div>
                {productionOrderInfo.description && (
                    <div><strong>Mô tả:</strong> {productionOrderInfo.description}</div>
                )}
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Loại lệnh sản xuất
                        </label>
                        <input
                            type="text"
                            value={productionOrderInfo.type}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
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
                                                        step={(target.uom || '').toLowerCase() === 'tấm' ? 1 : 0.01}
                                                        min={(target.uom || '').toLowerCase() === 'tấm' ? 1 : 0.01}
                                                        max={999999}
                                                        value={target.targetQuantity}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            const isSheet = (target.uom || '').toLowerCase() === 'tấm';
                                                            const raw = e.target.value;
                                                            const parsed = isSheet ? parseInt(raw || '0', 10) : parseFloat(raw || '0');
                                                            const minVal = isSheet ? 1 : 0.01;
                                                            const clamped = isNaN(parsed) ? minVal : Math.max(minVal, Math.min(999999, parsed));
                                                            handleTargetQuantityChange(target.id, isSheet ? Math.trunc(clamped) : clamped);
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className={`w-full px-3 py-2 border rounded-md text-sm ${target.targetQuantity <= 0 ? 'border-red-500 bg-red-50' : 'border-blue-300 bg-white'
                                                            }`}
                                                        placeholder={(target.uom || '').toLowerCase() === 'tấm' ? '1' : '0.01'}
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
                                        <div className="space-y-2">
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
                                            
                                            {/* Validation indicator */}
                                            {(() => {
                                                const targetMaterials = selectedMaterials.filter(m => m.productionOutputId === target.id);
                                                const hasValidMaterial = targetMaterials.some(m => m.quantity > 0);
                                                const hasMaterials = targetMaterials.length > 0;
                                                
                                                if (!hasMaterials) {
                                                    return (
                                                        <div className="text-xs text-gray-500 text-center">
                                                            Chưa tải nguyên liệu
                                                        </div>
                                                    );
                                                }
                                                
                                                if (!hasValidMaterial) {
                                                    return (
                                                        <div className="text-xs text-red-500 text-center flex items-center justify-center">
                                                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                            Cần điền số lượng &gt; 0 cho ít nhất 1 nguyên liệu
                                                        </div>
                                                    );
                                                }
                                                
                                                return (
                                                    <div className="text-xs text-green-500 text-center flex items-center justify-center">
                                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                        Đã hợp lệ
                                                    </div>
                                                );
                                            })()}
                                        </div>
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

                {selectedMaterials.length > 0 && (
                    <div className="border-t pt-6 mb-6">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-green-800 mb-2">
                                Bước 2: Thêm nguyên liệu ứng với sản phẩm mục tiêu  
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
                                            {target.productName}
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
                                                    <div key={`${target.id}-${material.productId}`} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-white rounded border border-green-200">
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
                                                                Số lượng
                                                            </label>
                                                            <input
                                                                type="number"
                                                                step={(material.uom || '').toLowerCase() === 'tấm' ? 1 : 0.01}
                                                                min={0}
                                                                max={999999}
                                                                value={(() => {
                                                                    const isSheet = (material.uom || '').toLowerCase() === 'tấm';
                                                                    const q = Number(material.quantity) || 0;
                                                                    if (isSheet) {
                                                                        return Math.max(0, Math.min(999999, Math.trunc(q)));
                                                                    }
                                                                    return Math.max(0, Math.min(999999, Number(q.toFixed(2))));
                                                                })()}
                                                                onChange={(e) => {
                                                                    const isSheet = (material.uom || '').toLowerCase() === 'tấm';
                                                                    const raw = e.target.value;
                                                                    const parsed = isSheet ? parseInt(raw || '0', 10) : parseFloat(raw || '0');
                                                                    const clamped = isNaN(parsed) ? 0 : Math.max(0, Math.min(999999, parsed));
                                                                    handleUpdateMaterial(
                                                                        material.productionOutputId,
                                                                        material.productId,
                                                                        'quantity',
                                                                        isSheet ? Math.trunc(clamped) : clamped
                                                                    );
                                                                }}
                                                                className={`w-full px-3 py-2 border rounded-md ${material.quantity > 0 ? 'border-green-300 bg-white' : 'border-gray-300 bg-gray-50'
                                                                    }`}
                                                                placeholder={(material.uom || '').toLowerCase() === 'tấm' ? '0' : '0.00'}
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


                {/* Form Actions */}
                <div className="flex flex-col space-y-4 pt-6 border-t">
                    {/* Validation Status */}
                    {!isFormValid() && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <div className="text-sm text-yellow-800">
                                    <strong>Lưu ý:</strong> Vui lòng đảm bảo mỗi sản phẩm mục tiêu đã chọn có ít nhất một nguyên liệu được điền số lượng &gt; 0
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="flex justify-end space-x-4">
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
                                !isFormValid() ||
                                loading
                            }
                            className={`px-6 py-2 rounded-md transition-colors ${targetProducts.filter(t => t.selected).length === 0 ||
                                targetProducts.filter(t => t.selected && t.targetQuantity <= 0).length > 0 ||
                                !isFormValid() ||
                                loading
                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                        >
                            {loading ? 'Đang xử lý...' : (isUpdateMode ? 'Cập nhật phiếu' : 'Tạo phiếu')}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );

    if (!asModal) return content;

    return (
        <div className="fixed inset-0 z-[1000]">
            <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-end items-center rounded-t-lg">
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full" title="Đóng">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6">
                    {content}
                </div>
            </div>
        </div>
    );
}


