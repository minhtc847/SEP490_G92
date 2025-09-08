'use client';

import React, { useState } from 'react';
import RawMaterialForm from './RawMaterialForm';
import SemiFinishedProductForm from './SemiFinishedProductForm';
import GlassProductForm from './GlassProductForm';
import { ProductionOrderInfo } from '../service';

interface ProductSelectionModalProps {
    productionOrderInfo: ProductionOrderInfo;
    onRawMaterialAdded: (rawMaterial: any) => void;
    onSemiFinishedProductAdded: (semiFinishedProduct: any) => void;
    onGlassProductAdded: (glassProduct: any) => void;
    onCancel: () => void;
    // Add new prop to check if slip has existing details
    hasExistingDetails?: boolean;
}

export default function ProductSelectionModal({
    productionOrderInfo,
    onRawMaterialAdded,
    onSemiFinishedProductAdded,
    onGlassProductAdded,
    onCancel,
    hasExistingDetails = false
}: ProductSelectionModalProps) {
    // When slip is empty, only show raw material form
    // When slip has details, show product type selection
    const [selectedProductType, setSelectedProductType] = useState<'rawMaterial' | 'semiFinished' | 'glassProduct' | null>(
        hasExistingDetails ? null : 'rawMaterial'
    );

    const handleRawMaterialAdded = (rawMaterial: any) => {
        onRawMaterialAdded(rawMaterial);
    };

    const handleSemiFinishedProductAdded = (semiFinishedProduct: any) => {
        onSemiFinishedProductAdded(semiFinishedProduct);
    };

    const handleGlassProductAdded = (glassProduct: any) => {
        onGlassProductAdded(glassProduct);
    };

    // If slip is empty, directly show raw material form
    if (!hasExistingDetails) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Thêm nguyên vật liệu (Kính lớn)
                        </h2>
                        <button
                            onClick={onCancel}
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
                        onCancel={onCancel}
                    />
                </div>
            </div>
        );
    }

    // If slip has details, show product type selection
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Chọn loại sản phẩm cần thêm
                    </h2>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {!selectedProductType ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Raw Material Option */}
                        <div 
                            className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center cursor-pointer hover:bg-blue-50 transition-colors"
                            onClick={() => setSelectedProductType('rawMaterial')}
                        >
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-blue-800 mb-2">Nguyên vật liệu</h3>
                            <p className="text-sm text-blue-600">Thêm kính lớn làm nguyên liệu đầu vào</p>
                        </div>

                        {/* Semi-finished Product Option */}
                        <div 
                            className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center cursor-pointer hover:bg-green-50 transition-colors"
                            onClick={() => setSelectedProductType('semiFinished')}
                        >
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-green-800 mb-2">Bán thành phẩm</h3>
                            <p className="text-sm text-green-600">Thêm kính nhỏ từ danh sách có sẵn</p>
                        </div>

                        {/* Glass Product Option */}
                        <div 
                            className="border-2 border-dashed border-yellow-300 rounded-lg p-6 text-center cursor-pointer hover:bg-yellow-50 transition-colors"
                            onClick={() => setSelectedProductType('glassProduct')}
                        >
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Kính dư</h3>
                            <p className="text-sm text-yellow-600">Thêm kính dư để tái sử dụng</p>
                        </div>
                    </div>
                ) : (
                    <div>
                        {/* Back Button */}
                        <button
                            onClick={() => setSelectedProductType(null)}
                            className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Quay lại chọn loại sản phẩm
                        </button>

                        {/* Render selected form */}
                        {selectedProductType === 'rawMaterial' && (
                            <RawMaterialForm
                                productionOrderInfo={productionOrderInfo}
                                onRawMaterialAdded={handleRawMaterialAdded}
                                onCancel={onCancel}
                            />
                        )}

                        {selectedProductType === 'semiFinished' && (
                            <SemiFinishedProductForm
                                productionOrderInfo={productionOrderInfo}
                                onSemiFinishedProductAdded={handleSemiFinishedProductAdded}
                                onCancel={onCancel}
                            />
                        )}

                        {selectedProductType === 'glassProduct' && (
                            <GlassProductForm
                                productionOrderInfo={productionOrderInfo}
                                onGlassProductAdded={handleGlassProductAdded}
                                onCancel={onCancel}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
