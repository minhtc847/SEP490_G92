'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
    fetchInventorySlipsByProductionOrder, 
    fetchProductionOrderInfo,
    deleteInventorySlip,
    InventorySlip,
    ProductionOrderInfo 
} from '../service';
import InventorySlipForm from '../slip/InventorySlipForm';
import InventorySlipList from '../slip/InventorySlipList';
import IconPlus from '@/components/icon/icon-plus';

const ProductionOrderInventorySlipPage = () => {
    const params = useParams();
    const router = useRouter();
    const productionOrderId = parseInt(params?.productionOrderId as string || '0');
    
    if (!productionOrderId || isNaN(productionOrderId)) {
        return <div className="text-center py-8">
            <h2 className="text-xl text-red-500">ID lệnh sản xuất không hợp lệ</h2>
        </div>;
    }
    
    const [productionOrderInfo, setProductionOrderInfo] = useState<ProductionOrderInfo | null>(null);
    const [inventorySlips, setInventorySlips] = useState<InventorySlip[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedSlip, setSelectedSlip] = useState<InventorySlip | null>(null);

    useEffect(() => {
        if (productionOrderId) {
            loadData();
        }
    }, [productionOrderId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [orderInfo, slips] = await Promise.all([
                fetchProductionOrderInfo(productionOrderId),
                fetchInventorySlipsByProductionOrder(productionOrderId)
            ]);
            
            setProductionOrderInfo(orderInfo);
            setInventorySlips(slips);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSlipCreated = (newSlip: InventorySlip) => {
        setInventorySlips(prev => [newSlip, ...prev]);
        setShowCreateForm(false);
        setSelectedSlip(null);
    };

    const handleSlipUpdated = (updatedSlip: InventorySlip) => {
        setInventorySlips(prev => prev.map(slip => 
            slip.id === updatedSlip.id ? updatedSlip : slip
        ));
        setSelectedSlip(null);
    };

    const handleSlipDeleted = async (slipId: number) => {
        try {
            console.log(`handleSlipDeleted: Starting delete process for slip ${slipId}`);
            const success = await deleteInventorySlip(slipId);
            console.log(`handleSlipDeleted: Delete API call result: ${success}`);
            
            if (success) {
                console.log(`handleSlipDeleted: Updating local state to remove slip ${slipId}`);
                setInventorySlips(prev => {
                    const newList = prev.filter(slip => slip.id !== slipId);
                    console.log(`handleSlipDeleted: Previous count: ${prev.length}, New count: ${newList.length}`);
                    return newList;
                });
            } else {
                console.error('Failed to delete inventory slip');
                // Optionally show an error message to the user
            }
        } catch (error) {
            console.error('Error deleting inventory slip:', error);
            // Optionally show an error message to the user
        }
    };

    const handleEditSlip = (slip: InventorySlip) => {
        setSelectedSlip(slip);
        setShowCreateForm(true);
    };

    const getSlipTypeText = (type: string | undefined) => {
        switch (type) {
            case 'Cắt kính': return 'Phiếu cắt kính';
            case 'Ghép kính': return 'Phiếu xuất keo butyl';
            case 'Sản xuất keo':
            case 'Đổ keo': return 'Phiếu xuất hóa chất';
            default: return type || '-';
        }
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
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">
                            Quản lý phiếu kho - Lệnh sản xuất {productionOrderInfo.productionOrderCode}
                        </h1>
                        <div className="text-gray-600">
                            <p><strong>Loại:</strong> {getSlipTypeText(productionOrderInfo.type)}</p>
                            <p><strong>Mô tả:</strong> {productionOrderInfo.description || 'Không có mô tả'}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {productionOrderInfo.type === 'Cắt kính' && (
                            <button
                                onClick={() => router.push(`/inventoryslip/${productionOrderId}/cut-glass`)}
                                className="btn btn-primary"
                            >
                                <IconPlus className="w-4 h-4 mr-2" />
                                Tạo phiếu cắt kính
                            </button>
                        )}
                        {productionOrderInfo.type === 'Ghép kính' && (
                            <button
                                onClick={() => router.push(`/inventoryslip/${productionOrderId}/butyl-glue-export`)}
                                className="btn btn-primary"
                            >
                                <IconPlus className="w-4 h-4 mr-2" />
                                Tạo phiếu xuất keo butyl
                            </button>
                        )}
                        {['Sản xuất keo', 'Đổ keo'].includes(productionOrderInfo.type) && (
                            <button
                                onClick={() => router.push(`/inventoryslip/${productionOrderId}/chemical-export`)}
                                className="btn btn-primary"
                            >
                                <IconPlus className="w-4 h-4 mr-2" />
                                Tạo phiếu xuất hóa chất
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Production Outputs Summary */}
            <div className="panel mb-6">
                <h3 className="text-lg font-semibold mb-4">Thành phẩm yêu cầu</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {productionOrderInfo.productionOutputs.map((output) => (
                        <div key={output.id} className="border rounded-lg p-4 bg-gray-50">
                            <h4 className="font-medium text-gray-800">{output.productName}</h4>
                            <div className="text-sm text-gray-600 mt-2">
                                <p>Số lượng: {output.amount} {output.uom || 'cái'}</p>
                                <p>Hoàn thành: {output.finished}</p>
                                <p>Lỗi: {output.defected}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Available Products for Cut Glass Slips */}
            {productionOrderInfo.type === 'Cắt kính' && (
                <div className="panel mb-6">
                    <h3 className="text-lg font-semibold mb-4">Sản phẩm có sẵn cho phiếu cắt kính</h3>
                    
                    {/* Raw Materials */}
                    {productionOrderInfo.rawMaterials && productionOrderInfo.rawMaterials.length > 0 && (
                        <div className="mb-6">
                            <h4 className="font-medium text-blue-800 mb-3">Nguyên vật liệu (NVL)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {productionOrderInfo.rawMaterials.map((product) => (
                                    <div key={product.id} className="border rounded p-3 bg-blue-50">
                                        <div className="font-medium text-sm">{product.productName}</div>
                                        <div className="text-xs text-gray-600">Mã: {product.productCode}</div>
                                        <div className="text-xs text-gray-600">Đơn vị: {product.uom || 'N/A'}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Semi-finished Products */}
                    {productionOrderInfo.semiFinishedProducts && productionOrderInfo.semiFinishedProducts.length > 0 && (
                        <div className="mb-6">
                            <h4 className="font-medium text-green-800 mb-3">Bán thành phẩm</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {productionOrderInfo.semiFinishedProducts.map((product) => (
                                    <div key={product.id} className="border rounded p-3 bg-green-50">
                                        <div className="font-medium text-sm">{product.productName}</div>
                                        <div className="text-xs text-gray-600">Mã: {product.productCode}</div>
                                        <div className="text-xs text-gray-600">Đơn vị: {product.uom || 'N/A'}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Glass Products */}
                    {productionOrderInfo.glassProducts && productionOrderInfo.glassProducts.length > 0 && (
                        <div className="mb-6">
                            <h4 className="font-medium text-purple-800 mb-3">Kính có sẵn</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {productionOrderInfo.glassProducts.map((product) => (
                                    <div key={product.id} className="border rounded p-3 bg-purple-50">
                                        <div className="font-medium text-sm">{product.productName}</div>
                                        <div className="text-xs text-gray-600">Mã: {product.productCode}</div>
                                        <div className="text-xs text-gray-600">Đơn vị: {product.uom || 'N/A'}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit Form */}
            {showCreateForm && (
                <div className="panel mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">
                            {selectedSlip ? 'Chỉnh sửa phiếu' : 'Tạo phiếu mới'}
                        </h3>
                        <button
                            onClick={() => {
                                setShowCreateForm(false);
                                setSelectedSlip(null);
                            }}
                            className="btn btn-outline-secondary btn-sm"
                        >
                            Đóng
                        </button>
                    </div>
                    <InventorySlipForm
                        productionOrderInfo={productionOrderInfo}
                        existingSlip={selectedSlip}
                        onSlipCreated={handleSlipCreated}
                        onSlipUpdated={handleSlipUpdated}
                        onCancel={() => {
                            setShowCreateForm(false);
                            setSelectedSlip(null);
                        }}
                    />
                </div>
            )}

            {/* Inventory Slips List */}
            <div className="panel">
                <h3 className="text-lg font-semibold mb-4">Danh sách phiếu kho</h3>
                <InventorySlipList
                    slips={inventorySlips}
                    onEdit={handleEditSlip}
                    onDelete={handleSlipDeleted}
                    onRefresh={loadData}
                />
            </div>
        </div>
    );
};

export default ProductionOrderInventorySlipPage;
