'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { fetchProductionOrderInfo, ProductionOrderInfo, createCutGlassSlip, updateInventorySlip, addMappings } from '../../service';
import InventorySlipForm from '../../slip/InventorySlipForm';

const CutGlassSlipPage = () => {
    const router = useRouter();
    const params = useParams();
    const [productionOrderInfo, setProductionOrderInfo] = useState<ProductionOrderInfo | null>(null);
    const [loading, setLoading] = useState(false);

    const productionOrderId = parseInt(params?.productionOrderId as string || '0');

    useEffect(() => {
        if (!productionOrderId || isNaN(productionOrderId)) {
            alert('ID lệnh sản xuất không hợp lệ');
            router.push('/inventoryslip');
            return;
        }
        loadProductionOrderInfo();
    }, [productionOrderId, router]);

    const loadProductionOrderInfo = async () => {
        if (!productionOrderId) return;
        
        setLoading(true);
        try {
            const info = await fetchProductionOrderInfo(productionOrderId);
            if (info) {
                // Kiểm tra loại lệnh sản xuất có phải là "Cắt kính" không
                if (info.type !== 'Cắt kính') {
                    alert('Lệnh sản xuất này không phải là loại "Cắt kính"');
                    router.push(`/inventoryslip/${productionOrderId}`);
                    return;
                }
                setProductionOrderInfo(info);
            } else {
                alert('Không tìm thấy thông tin lệnh sản xuất');
                router.push('/inventoryslip');
            }
        } catch (error) {
            console.error('Error loading production order info:', error);
            alert('Có lỗi xảy ra khi tải thông tin lệnh sản xuất');
            router.push('/inventoryslip');
        } finally {
            setLoading(false);
        }
    };

    const handleSlipCreated = async (slip: any, mappingInfo?: any) => {
        try {
            // Create the slip using the service
            const createdSlip = await createCutGlassSlip(slip);
            
            if (!createdSlip) {
                throw new Error('Failed to create slip');
            }

            // If we have mapping info, process it
            if (mappingInfo && mappingInfo.tempMappings && mappingInfo.tempMappings.length > 0) {
                // Convert index-based mappings to actual detail IDs
                const actualMappings = mappingInfo.tempMappings.map(mapping => {
                    // Find the actual detail IDs by matching product IDs
                    const inputDetail = createdSlip.details.find(d => 
                        d.productId === slip.details[mapping.inputDetailId]?.productId
                    );
                    const outputDetail = createdSlip.details.find(d => 
                        d.productId === slip.details[mapping.outputDetailId]?.productId
                    );
                    
                    return {
                        inputDetailId: inputDetail?.id || 0,
                        outputDetailId: outputDetail?.id || 0,
                        note: mapping.note
                    };
                }).filter(m => m.inputDetailId > 0 && m.outputDetailId > 0);

                if (actualMappings.length > 0) {
                    const mappingSuccess = await addMappings(createdSlip.id, actualMappings);
                    if (!mappingSuccess) {
                        console.warn('Failed to add mappings, but slip was created');
                    }
                }
            }

            alert('Tạo phiếu cắt kính thành công!');
            router.push(`/inventoryslip/${productionOrderId}`);
        } catch (error) {
            console.error('Error creating slip:', error);
            alert('Có lỗi xảy ra khi tạo phiếu');
        }
    };

    const handleSlipUpdated = async (slip: any) => {
        try {
            // Update the slip using the service
            const updatedSlip = await updateInventorySlip(slip.id, slip);
            
            if (!updatedSlip) {
                throw new Error('Failed to update slip');
            }

            alert('Cập nhật phiếu cắt kính thành công!');
            router.push(`/inventoryslip/${productionOrderId}`);
        } catch (error) {
            console.error('Error updating slip:', error);
            alert('Có lỗi xảy ra khi cập nhật phiếu');
        }
    };

    const handleCancel = () => {
        router.push(`/inventoryslip/${productionOrderId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!productionOrderInfo) {
        return (
            <div className="text-center py-8">
                <h2 className="text-xl text-red-500">Không tìm thấy thông tin lệnh sản xuất</h2>
                <button
                    onClick={() => router.push('/inventoryslip')}
                    className="btn btn-primary mt-4"
                >
                    Quay lại danh sách
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Tạo phiếu cắt kính</h1>
                <div className="text-gray-600">
                    <p><strong>Lệnh sản xuất:</strong> {productionOrderInfo.productionOrderCode}</p>
                    <p><strong>Loại:</strong> {productionOrderInfo.type}</p>
                    <p><strong>Mô tả:</strong> {productionOrderInfo.description || 'Không có mô tả'}</p>
                </div>
            </div>

            <div className="panel">
                <InventorySlipForm
                    productionOrderInfo={productionOrderInfo}
                    existingSlip={null}
                    onSlipCreated={handleSlipCreated}
                    onSlipUpdated={handleSlipUpdated}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
};

export default CutGlassSlipPage;
