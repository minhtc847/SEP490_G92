'use client';

import React, { useState, useEffect, Fragment } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { CreateInventorySlipDto, CreateInventorySlipDetailDto, CreateMaterialOutputMappingDto, ProductionOrderInfo, ProductInfo, createInventoryProduct } from '../service';
import RawMaterialForm from './RawMaterialForm';
import SemiFinishedProductForm from './SemiFinishedProductForm';
import GlassProductForm from './GlassProductForm';

interface InventorySlipFormProps {
    productionOrderInfo: ProductionOrderInfo;
    onSlipCreated: (slip: any, mappingInfo?: any) => void;
    onCancel: () => void;
    onRefreshProductionOrderInfo?: () => void; // Callback để refresh productionOrderInfo
}

export default function InventorySlipForm({ 
    productionOrderInfo, 
    onSlipCreated, 
    onCancel, 
    onRefreshProductionOrderInfo
}: InventorySlipFormProps) {
    const MySwal = withReactContent(Swal);
    const [formData, setFormData] = useState<CreateInventorySlipDto>({
        productionOrderId: productionOrderInfo.id,
        description: '',
        details: [],
        mappings: []
    });

    const [tempMappings, setTempMappings] = useState<CreateMaterialOutputMappingDto[]>([]);
    const [showMappingModal, setShowMappingModal] = useState(false);
    const [selectedInputDetail, setSelectedInputDetail] = useState<CreateInventorySlipDetailDto | null>(null);
    const [showRawMaterialForm, setShowRawMaterialForm] = useState(false);
    const [showSemiFinishedForm, setShowSemiFinishedForm] = useState(false);
    const [showGlassProductForm, setShowGlassProductForm] = useState(false);

    const [mappingDisplay, setMappingDisplay] = useState<{[key: number]: number[]}>({});
    // Cache các sản phẩm mới tạo cục bộ để hiển thị tên/mã mà không cần refresh toàn trang
    const [localNewProducts, setLocalNewProducts] = useState<ProductInfo[]>([]);
    const [selectedRawMaterial, setSelectedRawMaterial] = useState<CreateInventorySlipDetailDto | null>(null);


    const [rawMaterialDetailIndices, setRawMaterialDetailIndices] = useState<Set<number>>(new Set());

    const isCutGlassSlip = productionOrderInfo.type === 'Cắt kính';

    const validateProductUniqueness = (productId: number, currentIndex: number) => {
        const existingIndex = formData.details.findIndex((detail, index) => 
            detail.productId === productId && index !== currentIndex
        );
        
        if (existingIndex !== -1) {
            const existingDetail = formData.details[existingIndex];
            const isExistingRawMaterial = rawMaterialDetailIndices.has(existingIndex);
            
            if (isExistingRawMaterial) {
                return {
                    isValid: false,
                    message: `Sản phẩm này đã được thêm vào danh sách nguyên vật liệu ở dòng ${existingIndex + 1}`
                };
            } else {
                return {
                    isValid: false,
                    message: `Sản phẩm này đã được thêm vào danh sách sản phẩm đầu ra ở dòng ${existingIndex + 1}`
                };
            }
        }
        
        return { isValid: true, message: '' };
    };

    const classifyProduct = (productId: number, index: number) => {
        // ƯU TIÊN 1: Kiểm tra xem sản phẩm có phải là bán thành phẩm của lệnh sản xuất không
        // Bán thành phẩm cố định có độ ưu tiên tuyệt đối
        const isSemiFinished = productionOrderInfo.productionOutputs?.some(po => po.productId === productId);
        
        if (isSemiFinished) {
            return 'Bán thành phẩm';
        }
        
        // ƯU TIÊN 2: Kiểm tra xem sản phẩm có phải là nguyên vật liệu không
        // Nguyên vật liệu là các sản phẩm được sử dụng làm đầu vào (có OutputMappings)
        // NHƯNG chỉ khi nó KHÔNG phải là bán thành phẩm
        const isRawMaterial = productionOrderInfo.rawMaterials?.some(p => p.id === productId);
        
        if (isRawMaterial) {
            return 'NVL';
        }
        
        // ƯU TIÊN 3: Nếu không phải cả hai, thì là kính dư
        return 'Kính dư';
    };

    // Lọc danh sách nguyên vật liệu để loại bỏ bán thành phẩm đã định nghĩa
    const getFilteredRawMaterials = () => {
        if (!productionOrderInfo.rawMaterials) return [];
        
        // Lấy danh sách productId của các bán thành phẩm đã định nghĩa
        const semiFinishedProductIds = productionOrderInfo.productionOutputs?.map(po => po.productId) || [];
        
        // Lọc ra các nguyên vật liệu KHÔNG phải là bán thành phẩm
        return productionOrderInfo.rawMaterials.filter(rawMaterial => 
            !semiFinishedProductIds.includes(rawMaterial.id)
        );
    };

    // Lọc danh sách kính dư để loại bỏ bán thành phẩm đã định nghĩa
    // Kính dư là tất cả sản phẩm có product_type = "NVL" TRỪ ĐI bán thành phẩm
    const getFilteredGlassProducts = () => {
        // Sử dụng glassProducts từ backend đã được lọc sẵn
        if (!productionOrderInfo.glassProducts) return [];
        
        // Backend đã lọc sẵn, chỉ cần kiểm tra thêm để đảm bảo an toàn
        const semiFinishedProductIds = productionOrderInfo.productionOutputs?.map(po => po.productId) || [];
        
        // Lọc ra các kính dư từ backend + cộng thêm cache local
        let filteredGlassProducts = [
            ...productionOrderInfo.glassProducts,
            ...localNewProducts,
        ].filter(product => !semiFinishedProductIds.includes(product.id));
        
        // Thêm vào các sản phẩm mới được tạo trong form (nếu có)
        const newProductsInForm = formData.details
            .filter((detail, index) => !rawMaterialDetailIndices.has(index)) // Không phải nguyên vật liệu
            .filter(detail => detail.productId && detail.quantity > 0) // Có productId và số lượng
            .map(detail => {
                // Tìm thông tin sản phẩm từ availableProducts
                const productInfo = productionOrderInfo.availableProducts?.find(p => p.id === detail.productId)
                    || localNewProducts.find(p => p.id === detail.productId);
                if (productInfo) {
                    return {
                        ...productInfo,
                        // Đánh dấu là kính dư mới được tạo
                        isNewlyCreated: true
                    };
                }
                return null;
            })
            .filter(Boolean); // Loại bỏ null
        
        // Gộp danh sách và loại bỏ trùng lặp
        const allGlassProducts = [...filteredGlassProducts, ...newProductsInForm];
        const uniqueGlassProducts = allGlassProducts.filter((product, index, self) => 
            product && index === self.findIndex(p => p && p.id === product.id)
        );
        
        return uniqueGlassProducts;
    };


    const handleAddDetail = () => {
        const newDetail: CreateInventorySlipDetailDto = {
            productId: 0,
            quantity: 0,
            note: '',
            sortOrder: formData.details.length,
            productionOutputId: undefined
        };

        setFormData(prev => ({
            ...prev,
            details: [...prev.details, newDetail]
        }));
    };

    const handleUpdateDetail = (index: number, field: keyof CreateInventorySlipDetailDto, value: any) => {
        if (field === 'productId') {
            // Validation khi thay đổi productId
            const validation = validateProductUniqueness(value, index);
            if (!validation.isValid) {
                MySwal.fire({
                    title: validation.message,
                    toast: true,
                    position: 'bottom-start',
                    showConfirmButton: false,
                    timer: 3000,
                    showCloseButton: true,
                });
                return;
            }
            
            // Tự động phân loại sản phẩm dựa trên productId
            const productType = classifyProduct(value, index);
            
            // Cập nhật rawMaterialDetailIndices dựa trên phân loại
            if (productType === 'NVL') {
                setRawMaterialDetailIndices(prev => {
                    const updated = new Set(prev);
                    updated.add(index);
                    return updated;
                });
            } else {
                setRawMaterialDetailIndices(prev => {
                    const updated = new Set(prev);
                    updated.delete(index);
                    return updated;
                });
            }
        }
        
        setFormData((prev: CreateInventorySlipDto) => ({
            ...prev,
            details: prev.details.map((detail: CreateInventorySlipDetailDto, i: number) => 
                i === index ? { ...detail, [field]: value } : detail
            )
        }));
    };

    const handleRemoveDetail = (index: number) => {
        setFormData(prev => ({
            ...prev,
            details: prev.details.filter((_, i) => i !== index)
        }));

        // Remove from rawMaterialDetailIndices
        setRawMaterialDetailIndices(prev => {
            const updated = new Set(prev);
            updated.delete(index);
            return updated;
        });

        // Remove from tempMappings
        setTempMappings(prev => prev.filter(mapping => 
            mapping.inputDetailId !== index && mapping.outputDetailId !== index
        ));

        // Remove from mappingDisplay
        setMappingDisplay(prev => {
            const updated = { ...prev };
            delete updated[index];
            return updated;
        });
    };

    const handleAddMapping = (inputIndex: number, outputIndex: number) => {
        const inputDetail = formData.details[inputIndex];
        const outputDetail = formData.details[outputIndex];
        
        if (inputDetail && outputDetail) {
            const mapping: CreateMaterialOutputMappingDto = {
                inputDetailId: inputIndex, // Use index for now, will be converted to actual detail ID later
                outputDetailId: outputIndex, 
                note: ''
            };
            
            setTempMappings((prev: CreateMaterialOutputMappingDto[]) => {
                const newMappings = [...prev, mapping];
                return newMappings;
            });
            
            setMappingDisplay(prev => {
                const newDisplay = {
                    ...prev,
                    [inputIndex]: [...(prev[inputIndex] || []), outputIndex]
                };
                return newDisplay;
            });
        }
    };

    const handleCreateMapping = (index: number) => {
        const detail = formData.details[index];
        if (detail) {
            setSelectedInputDetail(detail);
            setShowMappingModal(true);
        }
    };
    
    // Helper function to get product type label
    const getProductTypeLabel = (productId: number) => {
        const product = productionOrderInfo.rawMaterials?.find(p => p.id === productId) ||
                       productionOrderInfo.semiFinishedProducts?.find(p => p.id === productId) ||
                       productionOrderInfo.availableProducts?.find(p => p.id === productId);
        
        if (product) {
            if (productionOrderInfo.rawMaterials?.some(p => p.id === productId)) {
                return 'Nguyên vật liệu';
            } else if (productionOrderInfo.semiFinishedProducts?.some(p => p.id === productId)) {
                return 'Bán thành phẩm';
            } else if (productionOrderInfo.availableProducts?.some(p => p.id === productId && (p.productType === 'NVL' || p.productType === 'Nguyên vật liệu'))) {
                return 'Kính dư';
            }
        }
        return 'Sản phẩm';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.details.length === 0) {
            MySwal.fire({
                title: 'Vui lòng thêm ít nhất một sản phẩm vào phiếu',
                toast: true,
                position: 'bottom-start',
                showConfirmButton: false,
                timer: 3000,
                showCloseButton: true,
            });
            return;
        }

        // Validate that all details have productId and quantity
        const invalidDetails = formData.details.filter(detail => 
            !detail.productId || !detail.quantity || detail.quantity <= 0 || isNaN(detail.quantity)
        );

        if (invalidDetails.length > 0) {
            MySwal.fire({
                title: 'Vui lòng chọn sản phẩm và nhập số lượng hợp lệ (lớn hơn 0) cho tất cả các dòng',
                toast: true,
                position: 'bottom-start',
                showConfirmButton: false,
                timer: 3000,
                showCloseButton: true,
            });
            return;
        }

        // For cut glass slips, validate mapping and show confirmation modal
        if (isCutGlassSlip) {
            // Kiểm tra logic nghiệp vụ: phải có ít nhất 1 nguyên vật liệu và 1 sản phẩm đầu ra
            const rawMaterialCount = formData.details.filter((detail, index) => 
                rawMaterialDetailIndices.has(index)
            ).length;
            
            const outputProductCount = formData.details.filter((detail, index) => 
                !rawMaterialDetailIndices.has(index)
            ).length;
            
            if (rawMaterialCount === 0) {
                MySwal.fire({
                    title: 'Phiếu cắt kính phải có ít nhất 1 nguyên vật liệu (kính lớn)',
                    toast: true,
                    position: 'bottom-start',
                    showConfirmButton: false,
                    timer: 3000,
                    showCloseButton: true,
                });
                return;
            }
            
            if (outputProductCount === 0) {
                MySwal.fire({
                    title: 'Phiếu cắt kính phải có ít nhất 1 sản phẩm đầu ra (bán thành phẩm hoặc kính dư)',
                    toast: true,
                    position: 'bottom-start',
                    showConfirmButton: false,
                    timer: 3000,
                    showCloseButton: true,
                });
                return;
            }
            
            // Check if all raw materials have been mapped (at least one mapping per raw material)
            const unmappedRawMaterials = formData.details.filter((detail, index) => 
                rawMaterialDetailIndices.has(index) && 
                !tempMappings.some(m => m.inputDetailId === index)
            );
            
            if (unmappedRawMaterials.length > 0) {
                MySwal.fire({
                    title: `Vui lòng tạo mapping cho tất cả nguyên vật liệu. Còn ${unmappedRawMaterials.length} nguyên vật liệu chưa được mapping.`,
                    toast: true,
                    position: 'bottom-start',
                    showConfirmButton: false,
                    timer: 3500,
                    showCloseButton: true,
                });
                return;
            }
            MySwal.fire({
                title: 'Xác nhận tạo phiếu cắt kính',
                text: 'Bạn có chắc chắn muốn tạo phiếu này?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Xác nhận',
                cancelButtonText: 'Hủy',
                customClass: { popup: 'sweet-alerts' },
            }).then((result) => {
                if (result.isConfirmed) {
                    handleConfirmCreate();
                }
            });
        } else {
            // For non-cut glass slips, use simple mapping
            const finalMappings = tempMappings.map(mapping => ({
                inputDetailId: mapping.inputDetailId,
                outputDetailId: mapping.outputDetailId,
                note: mapping.note
            }));
            onSlipCreated(formData, finalMappings);
        }
    };

    // Callback functions for ProductSelectionModal
    const handleRawMaterialAdded = (rawMaterial: any) => {
        // Kiểm tra xem sản phẩm đã tồn tại trong form chưa
        const existingDetail = formData.details.find(d => d.productId === rawMaterial.productId);
        if (existingDetail) {
            alert(`Sản phẩm ${rawMaterial.productName} đã được thêm vào form. Không thể thêm trùng lặp.`);
            return;
        }

        const newDetail: CreateInventorySlipDetailDto = {
            productId: rawMaterial.productId,
            quantity: rawMaterial.quantity,
            note: rawMaterial.note,
            sortOrder: formData.details.length,
            productionOutputId: undefined
        };

        const newDetailIndex = formData.details.length;
        setFormData(prev => ({
            ...prev,
            details: [...prev.details, newDetail]
        }));

        // Mark this newly added detail as raw material
        setRawMaterialDetailIndices(prev => {
            const updated = new Set(prev);
            updated.add(newDetailIndex);
            return updated;
        });

        setShowRawMaterialForm(false);
    };

    const handleSemiFinishedProductAdded = (semiFinishedProduct: any) => {
        // Kiểm tra xem sản phẩm đã tồn tại trong form chưa
        const existingDetail = formData.details.find(d => d.productId === semiFinishedProduct.productId);
        if (existingDetail) {
            MySwal.fire({
                title: `Sản phẩm ${semiFinishedProduct.productName} đã được thêm vào form. Không thể thêm trùng lặp.`,
                toast: true,
                position: 'bottom-start',
                showConfirmButton: false,
                timer: 3000,
                showCloseButton: true,
            });
            return;
        }

        const newDetail: CreateInventorySlipDetailDto = {
            productId: semiFinishedProduct.productId,
            quantity: semiFinishedProduct.quantity,
            note: semiFinishedProduct.note,
            sortOrder: formData.details.length,
            productionOutputId: undefined
        };

        const newDetailIndex = formData.details.length;
        setFormData(prev => ({
            ...prev,
            details: [...prev.details, newDetail]
        }));

        // Auto-mapping for cut glass slips - chỉ map với nguyên vật liệu được chọn
        if (isCutGlassSlip && selectedRawMaterial) {
            const inputDetailIndex = formData.details.findIndex(d => d.productId === selectedRawMaterial.productId);
            if (inputDetailIndex !== -1) {
                const mapping: CreateMaterialOutputMappingDto = {
                    inputDetailId: inputDetailIndex,
                    outputDetailId: newDetailIndex,
                    note: `Mapping từ ${selectedRawMaterial.productId} đến ${semiFinishedProduct.productId}`
                };
                
                setTempMappings(prev => [...prev, mapping]);
                
                setMappingDisplay(prev => ({
                    ...prev,
                    [inputDetailIndex]: [...(prev[inputDetailIndex] || []), newDetailIndex]
                }));
            }
        }

        setShowSemiFinishedForm(false);
    };

    const handleGlassProductAdded = (glassProduct: any) => {
        // Kiểm tra xem sản phẩm đã tồn tại trong form chưa
        const existingDetail = formData.details.find(d => d.productId === glassProduct.productId);
        if (existingDetail) {
            MySwal.fire({
                title: `Sản phẩm ${glassProduct.productName} đã được thêm vào form. Không thể thêm trùng lặp.`,
                toast: true,
                position: 'bottom-start',
                showConfirmButton: false,
                timer: 3000,
                showCloseButton: true,
            });
            return;
        }

        const newDetail: CreateInventorySlipDetailDto = {
            productId: glassProduct.productId,
            quantity: glassProduct.quantity,
            note: glassProduct.note,
            sortOrder: formData.details.length,
            productionOutputId: undefined
        };

        const newDetailIndex = formData.details.length;
        setFormData(prev => ({
            ...prev,
            details: [...prev.details, newDetail]
        }));

        // Auto-mapping for cut glass slips - chỉ map với nguyên vật liệu được chọn
        if (isCutGlassSlip && selectedRawMaterial) {
            const inputDetailIndex = formData.details.findIndex(d => d.productId === selectedRawMaterial.productId);
            if (inputDetailIndex !== -1) {
                const mapping: CreateMaterialOutputMappingDto = {
                    inputDetailId: inputDetailIndex,
                    outputDetailId: newDetailIndex,
                    note: `Mapping từ ${selectedRawMaterial.productId} đến ${glassProduct.productId}`
                };
                
                setTempMappings(prev => [...prev, mapping]);
                
                setMappingDisplay(prev => ({
                    ...prev,
                    [inputDetailIndex]: [...(prev[inputDetailIndex] || []), newDetailIndex]
                }));
            }
        }
        setShowGlassProductForm(false);
        
        // Thêm sản phẩm mới vào cache local để hiển thị tức thì
        setLocalNewProducts(prev => {
            const exists = prev.some(p => p.id === glassProduct.productId);
            if (exists) return prev;
            return [
                ...prev,
                {
                    id: glassProduct.productId,
                    productCode: glassProduct.productCode,
                    productName: glassProduct.productName,
                    productType: 'Kính dư',
                    uom: glassProduct.uom || 'tấm',
                    height: glassProduct.height,
                    width: glassProduct.width,
                    thickness: glassProduct.thickness,
                    weight: glassProduct.weight,
                    unitPrice: glassProduct.unitPrice,
                } as ProductInfo,
            ];
        });

        // Optional: nếu muốn sync backend ngay lập tức (có thể gây reload hơi chậm)
        // if (onRefreshProductionOrderInfo) onRefreshProductionOrderInfo();
    };

    const handleConfirmCreate = () => {
        // Create new slip after confirmation
        if (isCutGlassSlip) {
            // Tạo tempMappings dựa trên productClassifications
            const generatedTempMappings: CreateMaterialOutputMappingDto[] = [];
            
            // Lấy ra nguyên vật liệu (NVL) - sử dụng logic phân loại tự động
            const rawMaterialDetails = formData.details.filter((detail, index) => 
                rawMaterialDetailIndices.has(index)
            );
            
            // Lấy ra bán thành phẩm và kính dư (không phải NVL)
            const outputDetails = formData.details.filter((detail, index) => 
                !rawMaterialDetailIndices.has(index)
            );
            
            // Sử dụng tempMappings đã được tạo từ quá trình thêm sản phẩm
            if (tempMappings.length > 0) {
                generatedTempMappings.push(...tempMappings);
            } else {
                // Fallback: tạo mapping theo thứ tự nếu không có mapping nào được tạo trước đó
                const minLength = Math.min(rawMaterialDetails.length, outputDetails.length);
                for (let i = 0; i < minLength; i++) {
                    const inputDetailIndex = formData.details.findIndex(d => d.productId === rawMaterialDetails[i].productId);
                    const outputDetailIndex = formData.details.findIndex(d => d.productId === outputDetails[i].productId);
                    
                    if (inputDetailIndex !== -1 && outputDetailIndex !== -1) {
                        const mapping: CreateMaterialOutputMappingDto = {
                            inputDetailId: inputDetailIndex,
                            outputDetailId: outputDetailIndex,
                            note: `Mapping từ ${rawMaterialDetails[i].productId} đến ${outputDetails[i].productId}`
                        };
                        generatedTempMappings.push(mapping);
                    }
                }
            }
            
            const mappingInfo = {
                tempMappings: generatedTempMappings,
                productClassifications: formData.details.map((detail, index) => {
                    // Sử dụng logic phân loại tự động thay vì dựa vào rawMaterialDetailIndices
                    // Kiểm tra productId có tồn tại không trước khi gọi classifyProduct
                    if (!detail.productId) {
                        return {
                            index,
                            productId: 0,
                            productType: 'NVL',
                            productionOutputId: null
                        };
                    }
                    
                    const productType = classifyProduct(detail.productId, index);
                    
                    let finalProductionOutputId = detail.productionOutputId;
                    if (productType === 'Bán thành phẩm' && !finalProductionOutputId) {
                        const correspondingProductionOutput = productionOrderInfo.productionOutputs?.find(
                            po => po.productId === detail.productId
                        );
                        if (correspondingProductionOutput) {
                            finalProductionOutputId = correspondingProductionOutput.id;
                        }
                    }
                    
                    const classification = {
                        index,
                        productId: detail.productId,
                        productType: productType === 'NVL' ? 'NVL' : 
                                    productType === 'Bán thành phẩm' ? 'Bán thành phẩm' : 
                                    'Kính dư',
                        productionOutputId: finalProductionOutputId
                    };
                
                    console.log(`Classification for detail ${index}:`, classification);
                    return classification;
                })
            };
            
            // Ensure all properties are serializable
            const serializableMappingInfo = {
                tempMappings: mappingInfo.tempMappings,
                productClassifications: mappingInfo.productClassifications.map(c => ({
                    index: c.index,
                    productId: c.productId,
                    productType: c.productType,
                    productionOutputId: c.productionOutputId || null
                }))
            };           
            
            onSlipCreated(formData, serializableMappingInfo);
        } else {
            onSlipCreated(formData);
        }
    
        // no-op: confirm handled by SweetAlert2
    };



    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
            {/* Header với nút quay lại */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                        title="Quay lại trang trước"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="text-sm font-medium">Quay lại</span>
                    </button>
                    <div className="w-px h-6 bg-gray-300"></div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Tạo phiếu kho mới
                    </h2>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Production Order Info */}
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

                <div className="grid grid-cols-1 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mô tả
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md resize-vertical"
                            placeholder="Nhập mô tả phiếu..."
                            rows={3}
                        />
                    </div>
                </div>

                {/* Product Details Section */}
                <div className="border-t pt-6">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold">Chi tiết phiếu</h3>
                    </div>                    
                    

                    {isCutGlassSlip && (
                        <div className="mb-4 p-4 bg-blue-50 rounded-md">
                            <h4 className="font-medium text-blue-800 mb-2">Hướng dẫn phiếu cắt kính:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h5 className="font-medium text-blue-700 mb-2">🔄 Quy trình thực hiện:</h5>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>• <strong>Bước 1:</strong> Thêm nguyên vật liệu (kính lớn) với số lượng {'>'} 0</li>
                                        <li>• <strong>Bước 2:</strong> Chọn 1 nguyên vật liệu từ danh sách, sau đó thêm bán thành phẩm tương ứng</li>
                                        <li>• <strong>Bước 3:</strong> Chọn 1 nguyên vật liệu khác từ danh sách, sau đó thêm kính dư (nếu có)</li>                                        
                                        <li>• <strong>Lưu ý:</strong> Bán thành phẩm chỉ được chọn từ danh sách có sẵn, không thể tạo mới</li>
                                    </ul>
                                </div>
                                <div>                                    
                                    <div className="space-y-2 text-blue-700 text-sm">
                                        <div className="flex items-center space-x-2">
                                            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                                            <span><strong>Xanh dương:</strong> Nguyên vật liệu (kính lớn)</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                            <span><strong>Xanh lá:</strong> Bán thành phẩm (kính nhỏ)</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                                            <span><strong>Vàng:</strong> Kính dư (tái sử dụng)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                     {/* Raw Materials Section */}
                     {isCutGlassSlip && (
                         <div className="mb-6">
                             <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center justify-between">
                                 <div className="flex items-center">
                                     <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                                     Bước 1: Nguyên vật liệu (Kính lớn)
                                 </div>
                                 <div className="text-sm text-blue-600">
                                     {formData.details.filter((_, index) => rawMaterialDetailIndices.has(index)).length} nguyên vật liệu
                                     {tempMappings.length > 0 && ` • ${tempMappings.length} mapping đã tạo`}
                                 </div>
                             </h4>
                             <div className="space-y-3">
                                                                 {formData.details.map((detail, index) => {
                                    // Only show raw materials (marked as input details)
                                    if (!rawMaterialDetailIndices.has(index)) return null;
                                    
                                    return (
                                        <div key={index} className="border-l-4 border-blue-500 bg-blue-50 rounded-r-md p-4">
                                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                 <div>
                                                     <label className="block text-sm font-medium text-blue-700 mb-2">
                                                         Nguyên vật liệu
                                                     </label>
                                                     <select
                                                         value={detail.productId}
                                                         onChange={(e) => handleUpdateDetail(index, 'productId', parseInt(e.target.value))}
                                                         className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white"
                                                     >
                                                         <option value={0}>Chọn nguyên vật liệu...</option>
                                                         {getFilteredRawMaterials().map(product => (
                                                             <option key={product.id} value={product.id}>
                                                                 {product.productName} ({product.productCode})
                                                             </option>
                                                         ))}
                                                     </select>
                                                 </div>
                                                 <div>
                                                     <label className="block text-sm font-medium text-blue-700 mb-2">
                                                         Số lượng (tấm) <span className="text-red-500">*</span>
                                                     </label>
                                                     <input
                                                         type="number"
                                                         step="1"
                                                         min="1"
                                                         max="999999"
                                                         value={detail.quantity}
                                                         onChange={(e) => {
                                                             const value = e.target.value;
                                                             // Nguyên vật liệu chỉ nhận số nguyên (tấm)
                                                             const intValue = parseInt(value);
                                                             if (intValue > 999999) {
                                                                 handleUpdateDetail(index, 'quantity', 999999);
                                                             } else if (intValue < 1) {
                                                                 handleUpdateDetail(index, 'quantity', 1);
                                                             } else {
                                                                 handleUpdateDetail(index, 'quantity', intValue);
                                                             }
                                                         }}
                                                         className={`w-full px-3 py-2 border rounded-md ${
                                                             detail.quantity <= 0 ? 'border-red-500 bg-red-50' : 'border-blue-300 bg-white'
                                                         }`}
                                                         placeholder="1"
                                                     />
                                                     {detail.quantity <= 0 && (
                                                         <p className="text-red-500 text-xs mt-1">Số lượng phải lớn hơn 0</p>
                                                     )}
                                                     <p className="text-xs text-blue-600 mt-1">
                                                         Đơn vị: tấm (số nguyên)
                                                     </p>
                                                 </div>
                                                 <div>
                                                     <label className="block text-sm font-medium text-blue-700 mb-2">
                                                         Ghi chú
                                                     </label>
                                                     <input
                                                         type="text"
                                                         value={detail.note}
                                                         onChange={(e) => handleUpdateDetail(index, 'note', e.target.value)}
                                                         className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white"
                                                         placeholder="Ghi chú..."
                                                     />
                                                 </div>
                                             </div>

                                             <div className="flex justify-between items-center">
                                                 <div className="flex items-center space-x-2">
                                                     {tempMappings.some(m => m.inputDetailId === index) ? (
                                                         <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                                             ✅ Đã mapping
                                                         </span>
                                                     ) : (
                                                         <span className="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                                                             ⏳ Chưa mapping
                                                         </span>
                                                     )}
                                                 </div>
                                                 <button
                                                     type="button"
                                                     onClick={() => handleRemoveDetail(index)}
                                                     className="text-red-500 hover:text-red-700"
                                                 >
                                                     Xóa
                                                 </button>
                                             </div>
                                             
                                             {mappingDisplay[index] && mappingDisplay[index].length > 0 && (
                                                 <div className="mt-3 p-3 bg-green-50 rounded-md border border-green-200">
                                                     <h5 className="text-sm font-medium text-green-800 mb-2">
                                                         ✅ Đã liên kết với {mappingDisplay[index].length} sản phẩm:
                                                     </h5>
                                                     <div className="space-y-2">
                                                         {mappingDisplay[index].map((outputIndex) => {
                                                             const outputDetail = formData.details[outputIndex];
                                                             if (!outputDetail) return null;
                                                             
                                                             let productInfo: ProductInfo | undefined;
                                                             if (productionOrderInfo.semiFinishedProducts) {
                                                                 productInfo = productionOrderInfo.semiFinishedProducts.find(p => p.id === outputDetail.productId);
                                                             }
                                                             if (!productInfo && productionOrderInfo.glassProducts) {
                                                                 productInfo = productionOrderInfo.glassProducts.find(p => p.id === outputDetail.productId);
                                                             }
                                                             
                                                             return (
                                                                 <div key={outputIndex} className="flex items-center justify-between text-sm p-2 bg-white rounded border border-green-200">
                                                                     <div className="flex items-center space-x-2">
                                                                         <span className="text-green-700 font-medium">
                                                                             {productInfo?.productName || `Sản phẩm ${outputDetail.productId}`}
                                                                         </span>
                                                                         <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                                                             {productInfo?.productType === 'Kính dư' ? 'Kính dư' : 'Bán thành phẩm'}
                                                                         </span>
                                                                     </div>
                                                                     <button
                                                                         type="button"
                                                                         onClick={() => {
                                                                             // Remove mapping using indices
                                                                             setTempMappings(prev => 
                                                                                 prev.filter(m => 
                                                                                     !(m.inputDetailId === index && m.outputDetailId === outputIndex)
                                                                                 )
                                                                             );
                                                                             setMappingDisplay(prev => ({
                                                                                 ...prev,
                                                                                 [index]: prev[index].filter(i => i !== outputIndex)
                                                                             }));
                                                                         }}
                                                                         className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50"
                                                                         title="Xóa liên kết"
                                                                     >
                                                                         ✕
                                                                     </button>
                                                                 </div>
                                                             );
                                                         })}
                                                     </div>
                                                 </div>
                                             )}
                                         </div>
                                     );
                                 })}
                                 
                                 {/* Add Raw Material Button */}
                                 <button
                                     type="button"
                                     onClick={() => setShowRawMaterialForm(true)}
                                     className="w-full p-3 border-2 border-dashed border-blue-300 rounded-md text-blue-600 hover:bg-blue-50 transition-colors"
                                 >
                                     + Thêm nguyên vật liệu
                                 </button>
                             </div>
                         </div>
                     )}

                    {isCutGlassSlip && formData.details.some((detail, idx) => {
                        // Only show step 2 if there are raw materials (marked as input details)
                        return rawMaterialDetailIndices.has(idx) && detail.quantity > 0;
                    }) && (
                         <div className="mb-6">
                             <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                                 <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                 Bước 2: Sản phẩm đầu ra
                             </h4>
                             
                             {/* Semi-finished Products */}
                             <div className="mb-4">
                                 <h5 className="text-md font-medium text-green-700 mb-3">Bán thành phẩm (Kính nhỏ)</h5>
                                 <div className="space-y-3">
            {formData.details.map((detail, index) => {
                // Show semi-finished products that are NOT marked as raw materials
                // AND either have productionOutputId OR are in productionOutputs
                const isRawMaterial = rawMaterialDetailIndices.has(index);
                const hasProductionOutput = detail.productionOutputId || 
                    productionOrderInfo.productionOutputs?.some(po => po.productId === detail.productId);
                
                if (isRawMaterial || !hasProductionOutput) return null;
                
                return (
                    <div key={index} className="border-l-4 border-green-500 bg-green-50 rounded-r-md p-4">
                                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                     <div>
                                                         <label className="block text-sm font-medium text-green-700 mb-2">
                                                             Bán thành phẩm
                                                         </label>
                                                         <select
                                                             value={detail.productId}
                                                             onChange={(e) => handleUpdateDetail(index, 'productId', parseInt(e.target.value))}
                                                             className="w-full px-3 py-2 border border-green-300 rounded-md bg-white"
                                                         >
                                                             <option value={0}>Chọn bán thành phẩm...</option>
                                                             {/* Only show semi-finished products linked to this production order's ProductionOutput */}
                                                             {(productionOrderInfo.semiFinishedProducts?.filter(p => 
                                                                 productionOrderInfo.productionOutputs?.some(po => po.productId === p.id)
                                                             ) || []).map(product => (
                                                                 <option key={product.id} value={product.id}>
                                                                     {product.productName} ({product.productCode})
                                                                 </option>
                                                             ))}
                                                         </select>
                                                     </div>
                                                     <div>
                                                         <label className="block text-sm font-medium text-green-700 mb-2">
                                                             Số lượng (tấm) <span className="text-red-500">*</span>
                                                         </label>
                                                         <input
                                                             type="number"
                                                             step="1"
                                                             min="1"
                                                             max="999999"
                                                             value={detail.quantity}
                                                             onChange={(e) => {
                                                                 const value = e.target.value;
                                                                 // Bán thành phẩm chỉ nhận số nguyên (tấm)
                                                                 const intValue = parseInt(value);
                                                                 if (intValue > 999999) {
                                                                     handleUpdateDetail(index, 'quantity', 999999);
                                                                 } else if (intValue < 1) {
                                                                     handleUpdateDetail(index, 'quantity', 1);
                                                                 } else {
                                                                     handleUpdateDetail(index, 'quantity', intValue);
                                                                 }
                                                             }}
                                                             className={`w-full px-3 py-2 border rounded-md ${
                                                                 detail.quantity <= 0 ? 'border-red-500 bg-red-50' : 'border-green-300 bg-white'
                                                             }`}
                                                             placeholder="1"
                                                         />
                                                         {detail.quantity <= 0 && (
                                                             <p className="text-red-500 text-xs mt-1">Số lượng phải lớn hơn 0</p>
                                                         )}
                                                         <p className="text-xs text-green-600 mt-1">
                                                             Đơn vị: tấm (số nguyên)
                                                         </p>
                                                     </div>
                                                     <div>
                                                         <label className="block text-sm font-medium text-green-700 mb-2">
                                                             Ghi chú
                                                         </label>
                                                         <input
                                                             type="text"
                                                             value={detail.note}
                                                             onChange={(e) => handleUpdateDetail(index, 'note', e.target.value)}
                                                             className="w-full px-3 py-2 border border-green-300 rounded-md bg-white"
                                                             placeholder="Ghi chú..."
                                                         />
                                                     </div>
                                                 </div>
                                                 <div className="flex justify-end">
                                                     <button
                                                         type="button"
                                                         onClick={() => handleRemoveDetail(index)}
                                                         className="text-red-500 hover:text-red-700"
                                                     >
                                                         Xóa
                                                     </button>
                                                 </div>
                                             </div>
                                         );
                                     })}
                                     
                                     {/* Raw Material Selection for Semi-finished Products */}
                                     <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                                         <label className="block text-sm font-medium text-gray-700 mb-2">
                                             Chọn nguyên vật liệu để tạo bán thành phẩm:
                                         </label>
                                         <select
                                             value={selectedRawMaterial?.productId || 0}
                                             onChange={(e) => {
                                                 const selectedId = parseInt(e.target.value);
                                                 const selectedDetail = formData.details.find(d => d.productId === selectedId);
                                                 setSelectedRawMaterial(selectedDetail || null);
                                             }}
                                             className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                         >
                                             <option value={0}>Chọn nguyên vật liệu...</option>
                                             {formData.details.filter((detail, index) => {
                                                 // Show all raw materials (marked as input details) that have quantity > 0
                                                 // Allow mapping with multiple output products
                                                 const isRawMaterial = rawMaterialDetailIndices.has(index) && detail.quantity > 0;
                                                 return isRawMaterial;
                                             }).map((detail, index) => {
                                                 const product = getFilteredRawMaterials().find(p => p.id === detail.productId);
                                                 const mappingCount = tempMappings.filter(m => m.inputDetailId === index).length;
                                                 return (
                                                     <option key={detail.productId} value={detail.productId}>
                                                         {product?.productName} ({product?.productCode}) - SL: {detail.quantity}
                                                         {mappingCount > 0 && ` (đã map ${mappingCount} sản phẩm)`}
                                                     </option>
                                                 );
                                             })}
                                         </select>
                                         {selectedRawMaterial && (
                                             <p className="text-sm text-green-600 mt-1">
                                                 ✓ Đang chọn: {getFilteredRawMaterials().find(p => p.id === selectedRawMaterial.productId)?.productName}
                                             </p>
                                         )}
                                         {formData.details.filter((detail, index) => 
                                             rawMaterialDetailIndices.has(index) && detail.quantity > 0
                                         ).length === 0 && (
                                             <p className="text-sm text-orange-600 mt-1">
                                                 ⚠️ Không có nguyên vật liệu nào để chọn
                                             </p>
                                         )}
                                     </div>

                                                                           {/* Add Semi-finished Product Button */}
                                      <button
                                          type="button"
                                          onClick={() => {
                                              if (!selectedRawMaterial) {
                                                  MySwal.fire({
                                                      title: 'Vui lòng chọn nguyên vật liệu trước khi thêm bán thành phẩm',
                                                      toast: true,
                                                      position: 'bottom-start',
                                                      showConfirmButton: false,
                                                      timer: 3000,
                                                      showCloseButton: true,
                                                  });
                                                  return;
                                              }
                                              
                                              // Open modal to select semi-finished product
                                              setShowSemiFinishedForm(true);
                                          }}
                                          disabled={!selectedRawMaterial}
                                          className={`w-full p-3 border-2 border-dashed rounded-md transition-colors ${
                                              selectedRawMaterial 
                                                  ? 'border-green-300 text-green-600 hover:bg-green-50' 
                                                  : 'border-gray-300 text-gray-400 cursor-not-allowed'
                                          }`}
                                      >
                                          + Thêm bán thành phẩm
                                          {selectedRawMaterial && ` (cho ${getFilteredRawMaterials().find(p => p.id === selectedRawMaterial.productId)?.productName})`}
                                      </button>
                                 </div>
                             </div>

                             {/* Glass Products */}
                             <div className="mb-4">
                                 <h5 className="text-md font-medium text-yellow-700 mb-3">Kính dư (Tái sử dụng)</h5>
                                 <div className="space-y-3">
                                     {formData.details.map((detail, index) => {
                                         const isRawMaterial = rawMaterialDetailIndices.has(index);
                                         const isSemiFinished = detail.productionOutputId || 
                                             productionOrderInfo.productionOutputs?.some(po => po.productId === detail.productId);
                                         
                                         if (isRawMaterial || isSemiFinished) return null;
                                         
                                         return (
                                             <Fragment key={index}>
                                             <div className="border-l-4 border-yellow-500 bg-yellow-50 rounded-r-md p-4">
                                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                     <div>
                                                         <label className="block text-sm font-medium text-yellow-700 mb-2">
                                                             Kính dư
                                                         </label>
                                                                                                                  <select
                                                             value={detail.productId}
                                                             onChange={(e) => handleUpdateDetail(index, 'productId', parseInt(e.target.value))}
                                                             className="w-full px-3 py-2 border border-yellow-300 rounded-md bg-white"
                                                         >
                                                             <option value={0}>Chọn kính dư...</option>
                                                             {getFilteredGlassProducts().map(product => (
                                                                 <option key={product?.id} value={product?.id}>
                                                                     {product?.productName} ({product?.productCode})
                                                                 </option>
                                                             ))}
                                                         </select>
                                                             

                                                         </div>
                                                     </div>
                                                     <div>
                                                         <label className="block text-sm font-medium text-yellow-700 mb-2">
                                                             Số lượng (tấm) <span className="text-red-500">*</span>
                                                         </label>
                                                         <input
                                                             type="number"
                                                             step="1"
                                                             min="1"
                                                             max="999999"
                                                             value={detail.quantity}
                                                             onChange={(e) => {
                                                                 const value = e.target.value;
                                                                 // Kính dư chỉ nhận số nguyên (tấm)
                                                                 const intValue = parseInt(value);
                                                                 if (intValue > 999999) {
                                                                     handleUpdateDetail(index, 'quantity', 999999);
                                                                 } else if (intValue < 1) {
                                                                     handleUpdateDetail(index, 'quantity', 1);
                                                                 } else {
                                                                     handleUpdateDetail(index, 'quantity', intValue);
                                                                 }
                                                             }}
                                                             className={`w-full px-3 py-2 border rounded-md ${
                                                                 detail.quantity <= 0 ? 'border-red-500 bg-red-50' : 'border-yellow-300 bg-white'
                                                             }`}
                                                             placeholder="1"
                                                         />
                                                         {detail.quantity <= 0 && (
                                                             <p className="text-red-500 text-xs mt-1">Số lượng phải lớn hơn 0</p>
                                                         )}
                                                         <p className="text-xs text-yellow-600 mt-1">
                                                             Đơn vị: tấm (số nguyên)
                                                         </p>
                                                     </div>
                                                     <div>
                                                         <label className="block text-sm font-medium text-yellow-700 mb-2">
                                                             Ghi chú
                                                         </label>
                                                         <input
                                                             type="text"
                                                             value={detail.note}
                                                             onChange={(e) => handleUpdateDetail(index, 'note', e.target.value)}
                                                             className="w-full px-3 py-2 border border-yellow-300 rounded-md bg-white"
                                                             placeholder="Ghi chú..."
                                                         />
                                                     </div>
                                                 </div>
                                                 <div className="flex justify-end">
                                                     <button
                                                         type="button"
                                                         onClick={() => handleRemoveDetail(index)}
                                                         className="text-red-500 hover:text-red-700"
                                                     >
                                                         Xóa
                                                     </button>
                                                 </div>                                             
                                             </Fragment>
                                         );
                                     })}
                                     
                                     {/* Raw Material Selection for Glass Products */}
                                     <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                                         <label className="block text-sm font-medium text-gray-700 mb-2">
                                             Chọn nguyên vật liệu để tạo kính dư:
                                         </label>
                                         <select
                                             value={selectedRawMaterial?.productId || 0}
                                             onChange={(e) => {
                                                 const selectedId = parseInt(e.target.value);
                                                 const selectedDetail = formData.details.find(d => d.productId === selectedId);
                                                 setSelectedRawMaterial(selectedDetail || null);
                                             }}
                                             className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                         >
                                             <option value={0}>Chọn nguyên vật liệu...</option>
                                             {formData.details.filter((detail, index) => {
                                                 // Show all raw materials (marked as input details) that have quantity > 0
                                                 // Allow mapping with multiple output products
                                                 const isRawMaterial = rawMaterialDetailIndices.has(index) && detail.quantity > 0;
                                                 return isRawMaterial;
                                             }).map((detail, index) => {
                                                 const product = getFilteredRawMaterials().find(p => p.id === detail.productId);
                                                 const mappingCount = tempMappings.filter(m => m.inputDetailId === index).length;
                                                 return (
                                                     <option key={detail.productId} value={detail.productId}>
                                                         {product?.productName} ({product?.productCode}) - SL: {detail.quantity}
                                                         {mappingCount > 0 && ` (đã map ${mappingCount} sản phẩm)`}
                                                     </option>
                                                 );
                                             })}
                                         </select>
                                         {selectedRawMaterial && (
                                             <p className="text-sm text-yellow-600 mt-1">
                                                 ✓ Đang chọn: {getFilteredRawMaterials().find(p => p.id === selectedRawMaterial.productId)?.productName}
                                             </p>
                                         )}
                                         {formData.details.filter((detail, index) => 
                                             rawMaterialDetailIndices.has(index) && detail.quantity > 0
                                         ).length === 0 && (
                                             <p className="text-sm text-orange-600 mt-1">
                                                 ⚠️ Không có nguyên vật liệu nào để chọn
                                             </p>
                                         )}
                                     </div>

                                     {/* Add Glass Product Button */}
                                     <button
                                         type="button"
                                         onClick={() => {
                                             if (!selectedRawMaterial) {
                                                 MySwal.fire({
                                                     title: 'Vui lòng chọn nguyên vật liệu trước khi tạo kính dư',
                                                     toast: true,
                                                     position: 'bottom-start',
                                                     showConfirmButton: false,
                                                     timer: 3000,
                                                     showCloseButton: true,
                                                 });
                                                 return;
                                             }
                                             setShowGlassProductForm(true);
                                         }}
                                         disabled={!selectedRawMaterial}
                                         className={`w-full p-3 border-2 border-dashed rounded-md transition-colors ${
                                             selectedRawMaterial 
                                                 ? 'border-yellow-300 text-yellow-600 hover:bg-yellow-50' 
                                                 : 'border-gray-300 text-gray-400 cursor-not-allowed'
                                         }`}
                                     >
                                         + Thêm kính dư
                                         {selectedRawMaterial && ` (cho ${getFilteredRawMaterials().find(p => p.id === selectedRawMaterial.productId)?.productName})`}
                                     </button>
                                 </div>
                             </div>
                         </div>
                     )}

                     {/* For non-cut glass slips, show flat structure */}
                     {!isCutGlassSlip && formData.details.map((detail, index) => (
                         <div key={index} className="border rounded-md p-4 mb-4">
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                 <div>
                                     <label className="block text-sm font-medium text-gray-700 mb-2">
                                         Sản phẩm
                                     </label>
                                     <select
                                         value={detail.productId}
                                         onChange={(e) => handleUpdateDetail(index, 'productId', parseInt(e.target.value))}
                                         className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                     >
                                         <option value={0}>Chọn sản phẩm...</option>
                                         {productionOrderInfo.availableProducts?.map(product => (
                                             <option key={product.id} value={product.id}>
                                                 {product.productName} ({product.productCode})
                                             </option>
                                         ))}
                                     </select>
                                 </div>
                                 <div>
                                     <label className="block text-sm font-medium text-gray-700 mb-2">
                                         Số lượng (tấm) <span className="text-red-500">*</span>
                                     </label>
                                     <input
                                         type="number"
                                         step="1"
                                         min="1"
                                         max="999999"
                                         value={detail.quantity}
                                         onChange={(e) => {
                                             const value = e.target.value;
                                             // Tất cả sản phẩm chỉ nhận số nguyên (tấm)
                                             const intValue = parseInt(value);
                                             if (intValue > 999999) {
                                                 handleUpdateDetail(index, 'quantity', 999999);
                                             } else if (intValue < 1) {
                                                 handleUpdateDetail(index, 'quantity', 1);
                                             } else {
                                                 handleUpdateDetail(index, 'quantity', intValue);
                                             }
                                         }}
                                         className={`w-full px-3 py-2 border rounded-md ${
                                             detail.quantity <= 0 ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                         }`}
                                         placeholder="1"
                                     />
                                     {detail.quantity <= 0 && (
                                         <p className="text-red-500 text-xs mt-1">Số lượng phải lớn hơn 0</p>
                                     )}
                                     <p className="text-xs text-gray-600 mt-1">
                                         Đơn vị: tấm (số nguyên)
                                     </p>
                                 </div>
                                 <div>
                                     <label className="block text-sm font-medium text-gray-700 mb-2">
                                         Ghi chú
                                     </label>
                                     <input
                                         type="text"
                                         value={detail.note}
                                         onChange={(e) => handleUpdateDetail(index, 'note', e.target.value)}
                                         className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                         placeholder="Ghi chú..."
                                     />
                                 </div>
                             </div>
                             <div className="flex justify-end">
                                 <button
                                     type="button"
                                     onClick={() => handleRemoveDetail(index)}
                                     className="text-red-500 hover:text-red-700"
                                 >
                                     Xóa
                                 </button>
                             </div>
                         </div>
                     ))}
                </div>

                {/* Raw Material Form Modal */}
                {showRawMaterialForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Thêm nguyên vật liệu (Kính lớn)
                                </h2>
                                <button
                                    onClick={() => setShowRawMaterialForm(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <RawMaterialForm
                        productionOrderInfo={productionOrderInfo}
                        onRawMaterialAdded={handleRawMaterialAdded}
                                onCancel={() => setShowRawMaterialForm(false)}
                            />
                        </div>
                    </div>
                )}

                {/* Semi-finished Product Form Modal */}
                {showSemiFinishedForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Thêm bán thành phẩm (Kính nhỏ)
                                </h2>
                                <button
                                    onClick={() => setShowSemiFinishedForm(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <SemiFinishedProductForm
                                productionOrderInfo={productionOrderInfo}
                        onSemiFinishedProductAdded={handleSemiFinishedProductAdded}
                                onCancel={() => setShowSemiFinishedForm(false)}
                                selectedRawMaterial={selectedRawMaterial}
                            />
                        </div>
                    </div>
                )}

                {/* Glass Product Form Modal */}
                {showGlassProductForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    Thêm kính dư (Tái sử dụng)
                                </h2>
                                <button
                                    onClick={() => setShowGlassProductForm(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <GlassProductForm
                                productionOrderInfo={productionOrderInfo}
                        onGlassProductAdded={handleGlassProductAdded}
                                onCancel={() => setShowGlassProductForm(false)}
                                selectedRawMaterial={selectedRawMaterial}
                    />
                        </div>
                    </div>
                )}

                {/* Confirmation handled by SweetAlert2 */}

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
                        className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
                    >
                        Tạo phiếu
                    </button>
                </div>
            </form>
        </div>
    );
}
