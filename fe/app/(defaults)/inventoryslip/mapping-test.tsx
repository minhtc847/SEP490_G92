'use client';

import React, { useState } from 'react';

// Test component để kiểm tra logic mapping
export default function MappingTest() {
    const [mappings, setMappings] = useState<{[key: number]: number[]}>({});
    const [tempMappings, setTempMappings] = useState<Array<{inputDetailId: number, outputDetailId: number}>>([]);
    
    const [details] = useState([
        { id: 1, productId: 101, productName: 'Kính lớn', productType: 'NVL' },
        { id: 2, productId: 201, productName: 'Kính nhỏ', productType: 'BTP' },
        { id: 3, productId: 301, productName: 'Kính dư', productType: 'KD' }
    ]);

    const handleAddMapping = (inputIndex: number, outputIndex: number) => {
        console.log(`Adding mapping: ${inputIndex} -> ${outputIndex}`);
        
        // Check if mapping already exists
        const existingMapping = tempMappings.find(m => 
            m.inputDetailId === inputIndex && m.outputDetailId === outputIndex
        );
        
        if (!existingMapping) {
            const newMapping = { inputDetailId: inputIndex, outputDetailId: outputIndex };
            setTempMappings(prev => [...prev, newMapping]);
            
            // Update display mapping
            setMappings(prev => ({
                ...prev,
                [inputIndex]: [...(prev[inputIndex] || []), outputIndex]
            }));
            
            console.log('Mapping added successfully');
        } else {
            console.log('Mapping already exists');
        }
    };

    const handleRemoveMapping = (inputIndex: number, outputIndex: number) => {
        console.log(`Removing mapping: ${inputIndex} -> ${outputIndex}`);
        
        // Remove from tempMappings
        setTempMappings(prev => 
            prev.filter(m => !(m.inputDetailId === inputIndex && m.outputDetailId === outputIndex))
        );
        
        // Remove from display mappings
        setMappings(prev => ({
            ...prev,
            [inputIndex]: (prev[inputIndex] || []).filter(i => i !== outputIndex)
        }));
        
        console.log('Mapping removed successfully');
    };

    const isMapped = (inputIndex: number, outputIndex: number) => {
        return tempMappings.some(m => 
            m.inputDetailId === inputIndex && m.outputDetailId === outputIndex
        );
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Mapping Test Component</h1>
            
            <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Current Mappings:</h2>
                <pre className="bg-gray-100 p-3 rounded text-sm">
                    {JSON.stringify({ mappings, tempMappings }, null, 2)}
                </pre>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Input Materials */}
                <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Nguyên vật liệu (Input)</h3>
                    {details.filter(d => d.productType === 'NVL').map((detail, index) => (
                        <div key={detail.id} className="mb-3 p-3 bg-blue-50 rounded">
                            <div className="font-medium">{detail.productName}</div>
                            <div className="text-sm text-gray-600">Index: {index}</div>
                            <div className="text-sm text-gray-600">Product ID: {detail.productId}</div>
                            
                            {/* Show current mappings */}
                            {mappings[index] && mappings[index].length > 0 && (
                                <div className="mt-2 p-2 bg-blue-100 rounded text-xs">
                                    <div className="font-medium">Mapped to:</div>
                                    {mappings[index].map(outputIndex => {
                                        const outputDetail = details[outputIndex];
                                        return (
                                            <div key={outputIndex} className="flex items-center justify-between">
                                                <span>{outputDetail?.productName}</span>
                                                <button
                                                    onClick={() => handleRemoveMapping(index, outputIndex)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Output Products */}
                <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Sản phẩm đầu ra (Output)</h3>
                    {details.filter(d => d.productType !== 'NVL').map((detail, index) => {
                        const actualIndex = details.findIndex(d => d.id === detail.id);
                        return (
                            <div key={detail.id} className="mb-3 p-3 bg-green-50 rounded">
                                <div className="font-medium">{detail.productName}</div>
                                <div className="text-sm text-gray-600">Index: {actualIndex}</div>
                                <div className="text-sm text-gray-600">Product ID: {detail.productId}</div>
                                <div className="text-sm text-gray-600">Type: {detail.productType}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Mapping Controls */}
                <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">Mapping Controls</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium mb-2">Input Material:</label>
                            <select 
                                id="inputSelect"
                                className="w-full p-2 border rounded"
                                defaultValue=""
                            >
                                <option value="">Chọn nguyên liệu...</option>
                                {details.filter(d => d.productType === 'NVL').map((detail, index) => (
                                    <option key={detail.id} value={index}>
                                        {detail.productName} (Index: {index})
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-2">Output Product:</label>
                            <select 
                                id="outputSelect"
                                className="w-full p-2 border rounded"
                                defaultValue=""
                            >
                                <option value="">Chọn sản phẩm...</option>
                                {details.filter(d => d.productType !== 'NVL').map((detail, index) => {
                                    const actualIndex = details.findIndex(d => d.id === detail.id);
                                    return (
                                        <option key={detail.id} value={actualIndex}>
                                            {detail.productName} (Index: {actualIndex})
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                        
                        <button
                            onClick={() => {
                                const inputSelect = document.getElementById('inputSelect') as HTMLSelectElement;
                                const outputSelect = document.getElementById('outputSelect') as HTMLSelectElement;
                                
                                const inputIndex = parseInt(inputSelect.value);
                                const outputIndex = parseInt(outputSelect.value);
                                
                                if (!isNaN(inputIndex) && !isNaN(outputIndex)) {
                                    handleAddMapping(inputIndex, outputIndex);
                                } else {
                                    alert('Vui lòng chọn cả nguyên liệu và sản phẩm');
                                }
                            }}
                            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                        >
                            Thêm Mapping
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded">
                <h3 className="font-semibold mb-3">Debug Info:</h3>
                <div className="text-sm space-y-2">
                    <div><strong>Total mappings:</strong> {tempMappings.length}</div>
                    <div><strong>Mappings by input:</strong> {Object.keys(mappings).length}</div>
                    <div><strong>Current state:</strong></div>
                    <pre className="bg-white p-2 rounded text-xs overflow-auto">
                        {JSON.stringify({ mappings, tempMappings, details }, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
}
