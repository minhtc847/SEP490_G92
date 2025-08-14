'use client';

import React, { useState, useEffect } from 'react';
import { CreateInventorySlipDto, CreateInventorySlipDetailDto, CreateMaterialOutputMappingDto, ProductionOrderInfo, ProductInfo, createInventoryProduct } from '../service';

interface InventorySlipFormProps {
    productionOrderInfo: ProductionOrderInfo;
    onSlipCreated: (slip: any, mappingInfo?: any) => void;
    onCancel: () => void;
}

export default function InventorySlipForm({ 
    productionOrderInfo, 
    onSlipCreated, 
    onCancel 
}: InventorySlipFormProps) {
    const [formData, setFormData] = useState<CreateInventorySlipDto>({
        productionOrderId: productionOrderInfo.id,
        description: '',
        details: [],
        mappings: []
    });

    const [tempMappings, setTempMappings] = useState<CreateMaterialOutputMappingDto[]>([]);
    const [showMappingModal, setShowMappingModal] = useState(false);
    const [selectedInputDetail, setSelectedInputDetail] = useState<CreateInventorySlipDetailDto | null>(null);
    const [showNewProductModal, setShowNewProductModal] = useState(false);
    const [mappingDisplay, setMappingDisplay] = useState<{[key: number]: number[]}>({});
    const [newProduct, setNewProduct] = useState({
        productCode: '',
        productName: '',
        productType: 'NVL',
        uom: '',
        height: '',
        width: '',
        thickness: '',
        weight: '',
        unitPrice: '',
        quantity: '',
        note: ''
    });
    
    const [productSearch, setProductSearch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<ProductInfo | null>(null);
    const [isCreatingNewProduct, setIsCreatingNewProduct] = useState(false);
    const [selectedRawMaterial, setSelectedRawMaterial] = useState<CreateInventorySlipDetailDto | null>(null);
    const [rawMaterialDetailIndices, setRawMaterialDetailIndices] = useState<Set<number>>(new Set());
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const isCutGlassSlip = productionOrderInfo.type === 'Cắt kính';



    const handleAddDetail = () => {
        const newDetail: CreateInventorySlipDetailDto = {
            productId: 0,
            quantity: 0,
            note: '',
            sortOrder: formData.details.length,
            productionOutputId: undefined
        };
        setFormData((prev: CreateInventorySlipDto) => ({
            ...prev,
            details: [...prev.details, newDetail]
        }));
    };

    const handleUpdateDetail = (index: number, field: keyof CreateInventorySlipDetailDto, value: any) => {
        setFormData((prev: CreateInventorySlipDto) => ({
            ...prev,
            details: prev.details.map((detail: CreateInventorySlipDetailDto, i: number) => 
                i === index ? { ...detail, [field]: value } : detail
            )
        }));
    };

    const handleRemoveDetail = (index: number) => {
        setFormData((prev: CreateInventorySlipDto) => ({
            ...prev,
            details: prev.details.filter((_: CreateInventorySlipDetailDto, i: number) => i !== index)
        }));

        setRawMaterialDetailIndices(prev => {
            const updated = new Set<number>();
            prev.forEach((i: number) => {
                if (i === index) {
                    return;
                }
                updated.add(i > index ? i - 1 : i);
            });
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
        if (productionOrderInfo.rawMaterials?.some(p => p.id === productId)) {
            return 'Nguyên vật liệu';
        } else if (productionOrderInfo.semiFinishedProducts?.some(p => p.id === productId)) {
            return 'Bán thành phẩm';
        } else if (productionOrderInfo.glassProducts?.some(p => p.id === productId)) {
            return 'Kính dư';
        }
        return 'Sản phẩm';
    };

    const handleCreateNewProduct = async () => {
        // Check if user has selected an existing product
        if (selectedProduct) {
            alert('Bạn đã chọn sản phẩm có sẵn. Vui lòng sử dụng button "Sử dụng sản phẩm này" hoặc xóa lựa chọn để tạo mới.');
            return;
        }

        if (!newProduct.productCode || !newProduct.productName || !newProduct.uom) {
            alert('Vui lòng nhập đầy đủ thông tin sản phẩm');
            return;
        }

        try {
            setIsCreatingNewProduct(true);
            
            const newProductInfo = await createInventoryProduct({
                productCode: newProduct.productCode,
                productName: newProduct.productName,
                productType: newProduct.productType,
                uom: newProduct.uom,
                height: newProduct.height || undefined,
                width: newProduct.width || undefined,
                thickness: newProduct.thickness ? parseFloat(newProduct.thickness) : undefined,
                weight: newProduct.weight ? parseFloat(newProduct.weight) : undefined,
                unitPrice: newProduct.unitPrice ? parseFloat(newProduct.unitPrice) : undefined
            });

            // Add to form details
            if (!newProductInfo) {
                throw new Error('Failed to create product');
            }
            
            const newDetail: CreateInventorySlipDetailDto = {
                productId: newProductInfo.id,
                quantity: 0,
                note: '',
                sortOrder: formData.details.length,
                productionOutputId: newProduct.productType === 'Kính dư' ? -1 : undefined
            };

            const newDetailIndex = formData.details.length;
            setFormData((prev: CreateInventorySlipDto) => ({
                ...prev,
                details: [...prev.details, newDetail]
            }));

            // Mark this newly added detail as raw material if it's NVL
            if (newProduct.productType === 'NVL') {
                setRawMaterialDetailIndices(prev => {
                    const updated = new Set(prev);
                    updated.add(newDetailIndex);
                    return updated;
                });
            }

            // Only auto-map if this is an OUTPUT product (Kính dư) AND we have a selected raw material
            if (isCutGlassSlip && selectedRawMaterial && newProduct.productType === 'Kính dư') {
                const inputDetailIndex = formData.details.findIndex(d => d.productId === selectedRawMaterial.productId);
                if (inputDetailIndex !== -1) {
                    // Add to tempMappings
                    const mapping: CreateMaterialOutputMappingDto = {
                        inputDetailId: inputDetailIndex,
                        outputDetailId: newDetailIndex,
                        note: `Tự động mapping từ Kính dư mới`
                    };
                    
                    setTempMappings((prev: CreateMaterialOutputMappingDto[]) => [...prev, mapping]);
                    
                    setMappingDisplay(prev => ({
                        ...prev,
                        [inputDetailIndex]: [...(prev[inputDetailIndex] || []), newDetailIndex]
                    }));
                    
                    const rawMaterialName = productionOrderInfo.rawMaterials?.find(p => p.id === selectedRawMaterial.productId)?.productName;
                    alert(`Kính dư mới đã được tạo và tự động mapping vào nguyên vật liệu: ${rawMaterialName}`);
                    
                    setSelectedRawMaterial(null);
                }
            }

             if (newProduct.productType === 'NVL' && productionOrderInfo.rawMaterials) {
                 productionOrderInfo.rawMaterials.push(newProductInfo);
             } else if (newProduct.productType === 'Kính dư' && productionOrderInfo.rawMaterials) {
                 productionOrderInfo.rawMaterials.push(newProductInfo);
             }

            setShowNewProductModal(false);
            setNewProduct({
                productCode: '',
                productName: '',
                productType: 'NVL',
                uom: 'kg',
                height: '',
                width: '',
                thickness: '',
                weight: '',
                unitPrice: '',
                quantity: '',
                note: ''
            });
            setSelectedProduct(null);
            setProductSearch('');

            const productTypeText = newProduct.productType === 'NVL' ? 'nguyên vật liệu' : 'kính dư';
            alert(`Tạo ${productTypeText} mới thành công!`);
        } catch (error) {
            console.error('Error creating product:', error);
            const productTypeText = newProduct.productType === 'NVL' ? 'nguyên vật liệu' : 'kính dư';
            alert(`Có lỗi xảy ra khi tạo ${productTypeText} mới`);
        } finally {
            setIsCreatingNewProduct(false);
        }
    };



    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.details.length === 0) {
            alert('Vui lòng thêm ít nhất một sản phẩm vào phiếu');
            return;
        }

        if (isCutGlassSlip) {
            const invalidDetails = formData.details.filter(detail => detail.quantity <= 0);
            if (invalidDetails.length > 0) {
                alert('Vui lòng nhập số lượng > 0 cho tất cả sản phẩm');
                return;
            }

            const hasRawMaterial = formData.details.some(detail => {
                const product = productionOrderInfo.rawMaterials?.find(p => p.id === detail.productId);
                return product && detail.quantity > 0;
            });

            const hasOutputProduct = formData.details.some(detail => {
                const isSemiFinished = productionOrderInfo.semiFinishedProducts?.some(p => p.id === detail.productId);
                const isGlassProduct = productionOrderInfo.glassProducts?.some(p => p.id === detail.productId);
                return (isSemiFinished || isGlassProduct) && detail.quantity > 0;
            });

            if (!hasRawMaterial) {
                alert('Phiếu kho phải có ít nhất một nguyên vật liệu (kính lớn)');
                return;
            }

            if (!hasOutputProduct) {
                alert('Phiếu kho phải có ít nhất một sản phẩm đầu ra (bán thành phẩm hoặc kính dư)');
                return;
            }

            const rawMaterialDetails = formData.details.filter((detail, index) => {
                return rawMaterialDetailIndices.has(index);
            });

            const unmappedRawMaterials = rawMaterialDetails.filter((detail, index) => {
                const hasMapping = tempMappings.some(mapping => mapping.inputDetailId === index);
                return !hasMapping;
            });

            if (unmappedRawMaterials.length > 0) {
                const unmappedNames = unmappedRawMaterials.map(detail => {
                    const product = productionOrderInfo.rawMaterials?.find(p => p.id === detail.productId);
                    return product?.productName || 'Unknown';
                }).join(', ');
                alert(`Các nguyên vật liệu sau chưa được liên kết với sản phẩm đầu ra: ${unmappedNames}`);
                return;
            }
        }

        // Show confirmation popup instead of creating slip immediately
        setShowConfirmModal(true);
    };

    const handleConfirmCreate = () => {
        // Create new slip after confirmation
            if (isCutGlassSlip) {
                const mappingInfo = {
                    tempMappings,
                    productClassifications: formData.details.map((detail, index) => {
                        const isRawMaterial = rawMaterialDetailIndices.has(index);
                        const isSemiFinished = productionOrderInfo.productionOutputs?.some(po => po.productId === detail.productId);
                        
                        let finalProductionOutputId = detail.productionOutputId;
                        if (isSemiFinished && !finalProductionOutputId) {
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
                            productType: isRawMaterial ? 'NVL' : 
                                        isSemiFinished ? 'Bán thành phẩm' : 
                                        'Kính dư', // Everything else is glass remnant
                            productionOutputId: finalProductionOutputId
                        };
                    
                    console.log(`Classification for detail ${index}:`, classification);
                    return classification;
                })
            };
            
            console.log('Final mappingInfo:', mappingInfo);
            console.log('productClassifications count:', mappingInfo.productClassifications.length);
            console.log('formData.details:', formData.details);
            console.log('rawMaterialDetailIndices:', Array.from(rawMaterialDetailIndices));
            console.log('productionOrderInfo.productionOutputs:', productionOrderInfo.productionOutputs);
                
                onSlipCreated(formData, mappingInfo);
            } else {
                onSlipCreated(formData);
            }
        
        setShowConfirmModal(false);
    };



    const handleProductTypeChange = (productType: string) => {
        setNewProduct(prev => ({ ...prev, productType }));
        setProductSearch('');
        setSelectedProduct(null);
        
        // Set default UOM based on product type
        if (productType === 'Kính dư') {
            setNewProduct(prev => ({ ...prev, uom: 'cái' }));
        } else if (productType === 'Bán thành phẩm') {
            setNewProduct(prev => ({ ...prev, uom: 'cái' }));
        } else if (productType === 'NVL') {
            setNewProduct(prev => ({ ...prev, uom: 'cái' }));
        }
    };

    const handleProductSearch = (searchValue: string) => {
        setProductSearch(searchValue);
        
        let foundProduct: ProductInfo | null = null;
        
        if (newProduct.productType === 'Kính dư') {
            foundProduct = productionOrderInfo.rawMaterials?.find(p => 
                p.productName?.toLowerCase().includes(searchValue.toLowerCase())
            ) || null;
        } else if (newProduct.productType === 'Bán thành phẩm') {
            const linkedSemiFinishedProducts = productionOrderInfo.semiFinishedProducts?.filter(p => {
                return productionOrderInfo.productionOutputs?.some(po => po.productId === p.id);
            }) || [];
            
            foundProduct = linkedSemiFinishedProducts.find(p => 
                p.productName?.toLowerCase().includes(searchValue.toLowerCase())
            ) || null;
        } else if (newProduct.productType === 'NVL') {
            foundProduct = productionOrderInfo.rawMaterials?.find(p => 
                p.productName?.toLowerCase().includes(searchValue.toLowerCase())
            ) || null;
        }
        
        setSelectedProduct(foundProduct);
        
        if (foundProduct) {
            setNewProduct(prev => ({
                ...prev,
                productCode: foundProduct.productCode || '',
                productName: foundProduct.productName || '',
                uom: foundProduct.uom || ''
            }));
        }
    };

    const handleUseExistingProduct = (product: ProductInfo) => {
        const newDetail: CreateInventorySlipDetailDto = {
            productId: product.id,
            quantity: 0,
            note: '',
            sortOrder: formData.details.length,
            productionOutputId: undefined
        };

        const newDetailIndex = formData.details.length;
        setFormData((prev: CreateInventorySlipDto) => ({
            ...prev,
            details: [...prev.details, newDetail]
        }));

        // If user is currently adding a raw material (NVL), mark this detail as raw material
        if (newProduct.productType === 'NVL') {
            setRawMaterialDetailIndices(prev => {
                const updated = new Set(prev);
                updated.add(newDetailIndex);
                return updated;
            });
        }

        // Auto-mapping for cut glass slips: ONLY when user explicitly selects a raw material
        if (isCutGlassSlip && selectedRawMaterial) {
            const inputDetailIndex = formData.details.findIndex(d => d.productId === selectedRawMaterial.productId);
            if (inputDetailIndex !== -1) {
                // Add to tempMappings using indices
                const mapping: CreateMaterialOutputMappingDto = {
                    inputDetailId: inputDetailIndex,
                    outputDetailId: newDetailIndex,
                    note: `Tự động mapping từ sản phẩm có sẵn: ${product.productName}`
                };
                
                setTempMappings((prev: CreateMaterialOutputMappingDto[]) => [...prev, mapping]);
                
                // Update mappingDisplay using indices for display purposes
                setMappingDisplay(prev => ({
                    ...prev,
                    [inputDetailIndex]: [...(prev[inputDetailIndex] || []), newDetailIndex]
                }));
                
                const rawMaterialName = productionOrderInfo.rawMaterials?.find(p => p.id === selectedRawMaterial.productId)?.productName;
                alert(`Sản phẩm có sẵn đã được thêm và tự động mapping vào nguyên vật liệu: ${rawMaterialName}`);
                
                setSelectedRawMaterial(null);
            }
        }
        // Close modal and reset
        setShowNewProductModal(false);
        setNewProduct({
            productCode: '',
            productName: '',
            productType: 'NVL',
            uom: 'kg',
            height: '',
            width: '',
            thickness: '',
            weight: '',
            unitPrice: '',
            quantity: '',
            note: ''
        });
        setSelectedProduct(null);
        setProductSearch('');

        alert(`Đã thêm sản phẩm có sẵn: ${product.productName} vào phiếu!`);
    };

    const handleCreateKinhDu = async () => {
        // Check if user has selected an existing product
        if (selectedProduct) {
            alert('Bạn đã chọn kính dư có sẵn. Vui lòng sử dụng button "Sử dụng sản phẩm này" hoặc xóa lựa chọn để tạo mới.');
            return;
        }

        if (!newProduct.height || !newProduct.width || !newProduct.thickness) {
            alert('Vui lòng nhập đầy đủ kích thước (dài, rộng, dày)');
            return;
        }
        
        // Check if there are any raw materials in the form
        const hasRawMaterials = formData.details.some((detail, index) => {
            // Raw materials are details marked as input details
            return rawMaterialDetailIndices.has(index);
        });
        
        if (!hasRawMaterials) {
            alert('Vui lòng thêm nguyên vật liệu trước khi thêm kính dư');
            return;
        }

        try {
            const productName = `Kính trắng KT: ${newProduct.height}*${newProduct.width}*${newProduct.thickness} mm`;
            
                         const newProductInfo = await createInventoryProduct({
                 productCode: `KT_${newProduct.height}x${newProduct.width}x${newProduct.thickness}`,
                 productName: productName,
                 productType: 'NVL', 
                 uom: 'm2',
                 height: newProduct.height,
                 width: newProduct.width,
                 thickness: parseFloat(newProduct.thickness),
                 weight: undefined,
                 unitPrice: undefined
             });

            if (!newProductInfo) {
                throw new Error('Failed to create glass product');
            }
            // Add to form details
            const newDetailIndex = formData.details.length;
            setFormData((prev: CreateInventorySlipDto) => ({
                ...prev,
                details: [...prev.details, {
                    productId: newProductInfo.id,
                    quantity: 1, 
                    note: newProduct.note || 'Kính dư mới',
                    sortOrder: prev.details.length,
                    productionOutputId: undefined, 
                }]                                  
            }));

            // Mark this newly added detail as output product (not raw material)
            // Kính dư không được đánh dấu là raw material

            if (isCutGlassSlip && selectedRawMaterial) {
                const inputDetailIndex = formData.details.findIndex(d => d.productId === selectedRawMaterial.productId);
                if (inputDetailIndex !== -1) {
                    // Add to tempMappings using indices (will be converted to actual detail IDs later)
                    const mapping: CreateMaterialOutputMappingDto = {
                        inputDetailId: inputDetailIndex, 
                        outputDetailId: newDetailIndex,
                        note: `Tự động mapping từ Kính dư mới`
                    };
                    
                    setTempMappings((prev: CreateMaterialOutputMappingDto[]) => [...prev, mapping]);
                    
                    setMappingDisplay(prev => ({
                        ...prev,
                        [inputDetailIndex]: [...(prev[inputDetailIndex] || []), newDetailIndex]
                    }));
                    
                    const rawMaterialName = productionOrderInfo.rawMaterials?.find(p => p.id === selectedRawMaterial.productId)?.productName;
                    alert(`Kính dư mới đã được thêm và tự động mapping vào nguyên vật liệu: ${rawMaterialName}`);
                    
                    setSelectedRawMaterial(null);
                }
            }

             if (productionOrderInfo.rawMaterials) {
                 productionOrderInfo.rawMaterials.push(newProductInfo);
             }

            setShowNewProductModal(false);
            setNewProduct({
                productCode: '',
                productName: '',
                productType: 'Kính dư',
                uom: 'm2',
                height: '',
                width: '',
                thickness: '',
                weight: '',
                unitPrice: '',
                quantity: '',
                note: ''
            });
            setSelectedProduct(null);
            setProductSearch('');

            alert('Tạo kính dư mới thành công!');
        } catch (error) {
            console.error('Error creating glass product:', error);
            alert('Có lỗi xảy ra khi tạo kính dư mới');
        }
    };

    const handleAddSemiFinishedProduct = () => {
        if (!selectedProduct) {
            alert('Vui lòng chọn bán thành phẩm từ danh sách');
            return;
        }

        if (!newProduct.quantity || parseFloat(newProduct.quantity) <= 0) {
            alert('Vui lòng nhập số lượng > 0');
            return;
        }
        
        const hasRawMaterials = formData.details.some((detail, index) => {
            return rawMaterialDetailIndices.has(index);
        });
        
        if (!hasRawMaterials) {
            alert('Vui lòng thêm nguyên vật liệu trước khi thêm bán thành phẩm');
            return;
        }

        const newDetail: CreateInventorySlipDetailDto = {
            productId: selectedProduct.id,
            quantity: parseFloat(newProduct.quantity),
            note: newProduct.note || '',
            sortOrder: formData.details.length,
            productionOutputId: undefined, // Will be set dynamically below
        };

        // Find the actual productionOutputId from productionOrderInfo.productionOutputs
        const correspondingProductionOutput = productionOrderInfo.productionOutputs?.find(
            po => po.productId === selectedProduct.id
        );
        
        if (correspondingProductionOutput) {
            newDetail.productionOutputId = correspondingProductionOutput.id;
        } else {
            alert('Không tìm thấy thông tin đầu ra sản xuất cho bán thành phẩm đã chọn. Vui lòng liên hệ quản trị viên.');
            return;
        }

        const newDetailIndex = formData.details.length;
        setFormData((prev: CreateInventorySlipDto) => ({
            ...prev,
            details: [...prev.details, newDetail]
        }));
        // Auto-mapping for cut glass slips: ONLY when user explicitly selects a raw material
        if (isCutGlassSlip && selectedRawMaterial) {
            const inputDetailIndex = formData.details.findIndex(d => d.productId === selectedRawMaterial.productId);
            if (inputDetailIndex !== -1) {
                // Add to tempMappings using indices (will be converted to actual detail IDs later)
                const mapping: CreateMaterialOutputMappingDto = {
                    inputDetailId: inputDetailIndex, 
                    outputDetailId: newDetailIndex, 
                    note: `Tự động mapping từ bán thành phẩm: ${selectedProduct.productName}`
                };
                
                setTempMappings((prev: CreateMaterialOutputMappingDto[]) => [...prev, mapping]);
                
                setMappingDisplay(prev => ({
                    ...prev,
                    [inputDetailIndex]: [...(prev[inputDetailIndex] || []), newDetailIndex]
                }));
                
                const rawMaterialName = productionOrderInfo.rawMaterials?.find(p => p.id === selectedRawMaterial.productId)?.productName;
                alert(`Bán thành phẩm đã được thêm và tự động mapping vào nguyên vật liệu: ${rawMaterialName}`);
                
                setSelectedRawMaterial(null);
            }
        }

        setShowNewProductModal(false);
        setNewProduct({
            productCode: '',
            productName: '',
            productType: 'Bán thành phẩm',
            uom: 'cái',
            height: '',
            width: '',
            thickness: '',
            weight: '',
            unitPrice: '',
            quantity: '',
            note: ''
        });
        setSelectedProduct(null);
        setProductSearch('');

        alert(`Đã thêm bán thành phẩm: ${selectedProduct.productName} vào phiếu!`);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6">
                Tạo phiếu kho mới
            </h2>

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
                                        <li>• <strong>Bước 2:</strong> Chọn bán thành phẩm từ danh sách có sẵn của lệnh sản xuất với số lượng {'>'} 0</li>
                                        <li>• <strong>Bước 3:</strong> Chọn nguyên vật liệu từ dropdown, sau đó thêm kính dư (nếu có) với số lượng {'>'} 0</li>
                                        <li>• <strong>Bước 4:</strong> Mapping chỉ được tạo khi bạn chủ động chọn nguyên vật liệu!</li>
                                        <li>• <strong>Lưu ý:</strong> Bán thành phẩm chỉ được chọn từ danh sách có sẵn, không thể tạo mới</li>
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-medium text-blue-700 mb-2">🎨 Màu sắc và ý nghĩa:</h5>
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
                             <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                                 <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                                 Bước 1: Nguyên vật liệu (Kính lớn)
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
                                                         {productionOrderInfo.rawMaterials?.map(product => (
                                                             <option key={product.id} value={product.id}>
                                                                 {product.productName} ({product.productCode})
                                                             </option>
                                                         ))}
                                                     </select>
                                                 </div>
                                                 <div>
                                                     <label className="block text-sm font-medium text-blue-700 mb-2">
                                                         Số lượng <span className="text-red-500">*</span>
                                                     </label>
                                                     <input
                                                         type="number"
                                                         step="0.01"
                                                         min="0.01"
                                                         value={detail.quantity}
                                                         onChange={(e) => handleUpdateDetail(index, 'quantity', parseFloat(e.target.value))}
                                                         className={`w-full px-3 py-2 border rounded-md ${
                                                             detail.quantity <= 0 ? 'border-red-500 bg-red-50' : 'border-blue-300 bg-white'
                                                         }`}
                                                         placeholder="0.00"
                                                     />
                                                     {detail.quantity <= 0 && (
                                                         <p className="text-red-500 text-xs mt-1">Số lượng phải lớn hơn 0</p>
                                                     )}
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
                                                 <div className="flex space-x-2">
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
                                     onClick={() => {
                                         setNewProduct({
                                             productCode: '',
                                             productName: '',
                                             productType: 'NVL',
                                             uom: 'kg',
                                             height: '',
                                             width: '',
                                             thickness: '',
                                             weight: '',
                                             unitPrice: '',
                                             quantity: '',
                                             note: ''
                                         });
                                         setShowNewProductModal(true);
                                     }}
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
                                                             Số lượng <span className="text-red-500">*</span>
                                                         </label>
                                                         <input
                                                             type="number"
                                                             step="0.01"
                                                             min="0.01"
                                                             value={detail.quantity}
                                                             onChange={(e) => handleUpdateDetail(index, 'quantity', parseFloat(e.target.value))}
                                                             className={`w-full px-3 py-2 border rounded-md ${
                                                                 detail.quantity <= 0 ? 'border-red-500 bg-red-50' : 'border-green-300 bg-white'
                                                             }`}
                                                             placeholder="0.00"
                                                         />
                                                         {detail.quantity <= 0 && (
                                                             <p className="text-red-500 text-xs mt-1">Số lượng phải lớn hơn 0</p>
                                                         )}
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
                                                 // Only show raw materials (marked as input details)
                                                 return rawMaterialDetailIndices.has(index) && detail.quantity > 0;
                                             }).map(detail => {
                                                 const product = productionOrderInfo.rawMaterials?.find(p => p.id === detail.productId);
                                                 return (
                                                     <option key={detail.productId} value={detail.productId}>
                                                         {product?.productName} ({product?.productCode}) - SL: {detail.quantity}
                                                     </option>
                                                 );
                                             })}
                                         </select>
                                         {selectedRawMaterial && (
                                             <p className="text-sm text-green-600 mt-1">
                                                 ✓ Đang chọn: {productionOrderInfo.rawMaterials?.find(p => p.id === selectedRawMaterial.productId)?.productName}
                                             </p>
                                         )}
                                     </div>

                                                                           {/* Add Semi-finished Product Button */}
                                      <button
                                          type="button"
                                          onClick={() => {
                                              if (!selectedRawMaterial) {
                                                  alert('Vui lòng chọn nguyên vật liệu trước khi thêm bán thành phẩm');
                                                  return;
                                              }
                                              
                                              // Open modal to select semi-finished product
                                              setNewProduct({
                                                  productCode: '',
                                                  productName: '',
                                                  productType: 'Bán thành phẩm',
                                                  uom: 'cái',
                                                  height: '',
                                                  width: '',
                                                  thickness: '',
                                                  weight: '',
                                                  unitPrice: '',
                                                  quantity: '',
                                                  note: ''
                                              });
                                              setShowNewProductModal(true);
                                          }}
                                          disabled={!selectedRawMaterial}
                                          className={`w-full p-3 border-2 border-dashed rounded-md transition-colors ${
                                              selectedRawMaterial 
                                                  ? 'border-green-300 text-green-600 hover:bg-green-50' 
                                                  : 'border-gray-300 text-gray-400 cursor-not-allowed'
                                          }`}
                                      >
                                          + Thêm bán thành phẩm
                                          {selectedRawMaterial && ` (cho ${productionOrderInfo.rawMaterials?.find(p => p.id === selectedRawMaterial.productId)?.productName})`}
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
                                             <div key={index} className="border-l-4 border-yellow-500 bg-yellow-50 rounded-r-md p-4">
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

                                                             {productionOrderInfo.rawMaterials?.map(product => (
                                                                 <option key={product.id} value={product.id}>
                                                                     {product.productName} ({product.productCode})
                                                                 </option>
                                                             ))}
                                                         </select>
                                                     </div>
                                                     <div>
                                                         <label className="block text-sm font-medium text-yellow-700 mb-2">
                                                             Số lượng <span className="text-red-500">*</span>
                                                         </label>
                                                         <input
                                                             type="number"
                                                             step="0.01"
                                                             min="0.01"
                                                             value={detail.quantity}
                                                             onChange={(e) => handleUpdateDetail(index, 'quantity', parseFloat(e.target.value))}
                                                             className={`w-full px-3 py-2 border rounded-md ${
                                                                 detail.quantity <= 0 ? 'border-red-500 bg-red-50' : 'border-yellow-300 bg-white'
                                                             }`}
                                                             placeholder="0.00"
                                                         />
                                                         {detail.quantity <= 0 && (
                                                             <p className="text-red-500 text-xs mt-1">Số lượng phải lớn hơn 0</p>
                                                         )}
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
                                             </div>
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
                                                 // Only show raw materials (marked as input details)
                                                 return rawMaterialDetailIndices.has(index) && detail.quantity > 0;
                                             }).map(detail => {
                                                 const product = productionOrderInfo.rawMaterials?.find(p => p.id === detail.productId);
                                                 return (
                                                     <option key={detail.productId} value={detail.productId}>
                                                         {product?.productName} ({product?.productCode}) - SL: {detail.quantity}
                                                     </option>
                                                 );
                                             })}
                                         </select>
                                         {selectedRawMaterial && (
                                             <p className="text-sm text-yellow-600 mt-1">
                                                 ✓ Đang chọn: {productionOrderInfo.rawMaterials?.find(p => p.id === selectedRawMaterial.productId)?.productName}
                                             </p>
                                         )}
                                     </div>

                                     {/* Add Glass Product Button */}
                                     <button
                                         type="button"
                                         onClick={() => {
                                             if (!selectedRawMaterial) {
                                                 alert('Vui lòng chọn nguyên vật liệu trước khi tạo kính dư');
                                                 return;
                                             }
                                             setNewProduct({
                                                 productCode: '',
                                                 productName: '',
                                                 productType: 'Kính dư',
                                                 uom: 'm2',
                                                 height: '',
                                                 width: '',
                                                 thickness: '',
                                                 weight: '',
                                                 unitPrice: '',
                                                 quantity: '',
                                                 note: ''
                                             });
                                             setShowNewProductModal(true);
                                         }}
                                         disabled={!selectedRawMaterial}
                                         className={`w-full p-3 border-2 border-dashed rounded-md transition-colors ${
                                             selectedRawMaterial 
                                                 ? 'border-yellow-300 text-yellow-600 hover:bg-yellow-50' 
                                                 : 'border-gray-300 text-gray-400 cursor-not-allowed'
                                         }`}
                                     >
                                         + Thêm kính dư
                                         {selectedRawMaterial && ` (cho ${productionOrderInfo.rawMaterials?.find(p => p.id === selectedRawMaterial.productId)?.productName})`}
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
                                         Số lượng <span className="text-red-500">*</span>
                                     </label>
                                     <input
                                         type="number"
                                         step="0.01"
                                         min="0.01"
                                         value={detail.quantity}
                                         onChange={(e) => handleUpdateDetail(index, 'quantity', parseFloat(e.target.value))}
                                         className={`w-full px-3 py-2 border rounded-md ${
                                             detail.quantity <= 0 ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                         }`}
                                         placeholder="0.00"
                                     />
                                     {detail.quantity <= 0 && (
                                         <p className="text-red-500 text-xs mt-1">Số lượng phải lớn hơn 0</p>
                                     )}
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

                {/* New Product Modal */}
                {showNewProductModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-full max-w-md">
                            <h3 className="text-lg font-semibold mb-4">Tạo sản phẩm mới</h3>
                            
                            {/* Product Type Selection - Only show when not creating raw material */}
                            {newProduct.productType !== 'NVL' && newProduct.productType !== 'Bán thành phẩm' && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Loại sản phẩm
                                    </label>
                                    <div className="flex gap-2">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="productType"
                                                value="Kính dư"
                                                checked={newProduct.productType === 'Kính dư'}
                                                onChange={() => handleProductTypeChange('Kính dư')}
                                                className="form-radio"
                                            />
                                            Kính dư
                                        </label>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2">
                                        <strong>Lưu ý:</strong> Bán thành phẩm chỉ được chọn từ danh sách có sẵn của lệnh sản xuất, không thể tạo mới.
                                    </p>
                                </div>
                            )}

                            {/* Show fixed label for semi-finished products */}
                            {newProduct.productType === 'Bán thành phẩm' && (
                                <div className="mb-4">
                                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                                        <p className="text-sm text-green-800 font-medium">
                                             Chọn bán thành phẩm có sẵn
                                        </p>
                                        <p className="text-xs text-green-600 mt-1">
                                            Loại sản phẩm: <strong>Bán thành phẩm</strong> - Chỉ được chọn từ danh sách có sẵn
                                        </p>
                                        <p className="text-xs text-blue-600 mt-1">
                                            <strong>Lưu ý:</strong> Chỉ hiển thị những bán thành phẩm được liên kết với lệnh sản xuất này
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Show fixed label for raw materials */}
                            {newProduct.productType === 'NVL' && (
                                <div className="mb-4">
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                                        <p className="text-sm text-blue-800 font-medium">
                                             Tạo nguyên vật liệu mới
                                        </p>
                                        <p className="text-xs text-blue-600 mt-1">
                                            Loại sản phẩm: <strong>Nguyên vật liệu (NVL)</strong>
                                        </p>
                                        <p className="text-xs text-green-600 mt-1">
                                            <strong>Lưu ý:</strong> Hiển thị tất cả nguyên vật liệu có sẵn (product_type = "NVL")
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Product Search/Selection */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {newProduct.productType === 'Kính dư' ? 'Tìm kiếm kính dư có sẵn' : 
                                     newProduct.productType === 'Bán thành phẩm' ? 'Tìm kiếm bán thành phẩm có sẵn' :
                                     'Tìm kiếm nguyên vật liệu có sẵn'}
                                </label>
                                <p className="text-xs text-gray-600 mb-2">
                                    {newProduct.productType === 'Kính dư' ? 'Nhập tên kính dư để tìm kiếm sản phẩm có sẵn' : 
                                     newProduct.productType === 'Bán thành phẩm' ? 'Nhập tên bán thành phẩm để tìm kiếm sản phẩm có sẵn' :
                                     'Nhập tên nguyên vật liệu để tìm kiếm sản phẩm có sẵn'}
                                </p>
                                <input
                                    type="text"
                                    value={productSearch}
                                    onChange={(e) => handleProductSearch(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    placeholder={newProduct.productType === 'Kính dư' ? 'Tìm kính dư...' : 
                                               newProduct.productType === 'Bán thành phẩm' ? 'Tìm bán thành phẩm...' :
                                               'Tìm nguyên vật liệu...'}
                                    list={`product-list-${newProduct.productType}`}
                                />
                                <datalist id={`product-list-${newProduct.productType}`}>
                                    {(newProduct.productType === 'Kính dư' ? productionOrderInfo.rawMaterials : 
                                      newProduct.productType === 'Bán thành phẩm' ? 
                                        // Only show semi-finished products linked to this production order's ProductionOutput
                                        (productionOrderInfo.semiFinishedProducts?.filter(p => 
                                            productionOrderInfo.productionOutputs?.some(po => po.productId === p.id)
                                        ) || []) :
                                      productionOrderInfo.rawMaterials)?.map(product => (
                                        <option key={product.id} value={product.productName || ''} />
                                    ))}
                                </datalist>
                            </div>

                            {/* Show existing product info if found */}
                            {selectedProduct && (
                                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                                    <p className="text-sm text-green-800">
                                        <strong>Sản phẩm có sẵn:</strong> {selectedProduct.productName} ({selectedProduct.productCode})
                                    </p>
                                    <p className="text-sm text-green-600 mt-1">
                                        Bạn có thể sử dụng sản phẩm này hoặc tạo mới bên dưới
                                    </p>
                                    <div className="mt-3 flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleUseExistingProduct(selectedProduct)}
                                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                        >
                                            ✅ Sử dụng sản phẩm này
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedProduct(null);
                                                setProductSearch('');
                                            }}
                                            className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                                        >
                                            ❌ Xóa lựa chọn
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Quantity and Note fields for Bán thành phẩm */}
                            {newProduct.productType === 'Bán thành phẩm' && selectedProduct && (
                                <div className="mb-4 space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Số lượng <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            value={newProduct.quantity || ''}
                                            onChange={(e) => setNewProduct(prev => ({ ...prev, quantity: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ghi chú
                                        </label>
                                        <input
                                            type="text"
                                            value={newProduct.note || ''}
                                            onChange={(e) => setNewProduct(prev => ({ ...prev, note: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="Ghi chú..."
                                        />
                                    </div>
                                </div>
                            )}

                            {/* New Product Creation Form - Only show for NVL and Kính dư, not for Bán thành phẩm */}
                            {newProduct.productType !== 'Bán thành phẩm' && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {newProduct.productType === 'NVL' ? 'Thông tin nguyên vật liệu mới' : 'Hoặc tạo sản phẩm mới'}
                                    </label>
                                
                                <div className="space-y-3">
                                    <div>
                                        <input
                                            type="text"
                                            value={newProduct.productCode}
                                            onChange={(e) => setNewProduct(prev => ({ ...prev, productCode: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="Mã sản phẩm"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            value={newProduct.productName}
                                            onChange={(e) => setNewProduct(prev => ({ ...prev, productName: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder={newProduct.productType === 'Kính dư' ? 'Tên kính dư' : 'Tên nguyên vật liệu'}
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            value={newProduct.uom}
                                            onChange={(e) => setNewProduct(prev => ({ ...prev, uom: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            placeholder="Đơn vị đo"
                                        />
                                    </div>

                                    {/* Special fields for Kính dư */}
                                    {newProduct.productType === 'Kính dư' && (
                                        <div className="grid grid-cols-3 gap-2">
                                            <div>
                                                <input
                                                    type="text"
                                                    value={newProduct.height}
                                                    onChange={(e) => setNewProduct(prev => ({ ...prev, height: e.target.value }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                    placeholder="Dài (mm)"
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    value={newProduct.width}
                                                    onChange={(e) => setNewProduct(prev => ({ ...prev, width: e.target.value }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                    placeholder="Rộng (mm)"
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="text"
                                                    value={newProduct.thickness}
                                                    onChange={(e) => setNewProduct(prev => ({ ...prev, thickness: e.target.value }))}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                                    placeholder="Dày (mm)"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            )}

                            <div className="flex justify-end space-x-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowNewProductModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    onClick={newProduct.productType === 'Kính dư' ? handleCreateKinhDu : 
                                            newProduct.productType === 'Bán thành phẩm' ? handleAddSemiFinishedProduct : handleCreateNewProduct}
                                    className={`px-4 py-2 rounded-md transition-colors ${
                                        selectedProduct !== null 
                                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                                            : 'bg-blue-500 text-white hover:bg-blue-600'
                                    }`}
                                    disabled={selectedProduct !== null}
                                    title={selectedProduct !== null ? 'Vui lòng sử dụng sản phẩm đã chọn hoặc xóa lựa chọn để tạo mới' : ''}
                                >
                                    {newProduct.productType === 'Kính dư' ? 'Tạo kính dư mới' : 
                                     newProduct.productType === 'Bán thành phẩm' ? 'Thêm bán thành phẩm' : 'Tạo nguyên vật liệu mới'}
                                </button>
                            </div>
                        </div>
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
                                    Bạn có chắc chắn muốn tạo phiếu kho này không? Hành động này sẽ cập nhật số lượng hoàn thành trong kế hoạch sản xuất.
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
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                >
                                    Xác nhận
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
                        className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
                    >
                        Tạo phiếu
                    </button>
                </div>
            </form>
        </div>
    );
}
