'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
    fetchInventorySlipsByProductionOrder, 
    fetchProductionOrderInfo,
    searchProducts,
    InventorySlip,
    ProductionOrderInfo,
    PaginatedProductsDto,
    ProductSearchRequestDto
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

    // New state for paginated products
    const [paginatedProducts, setPaginatedProducts] = useState<PaginatedProductsDto | null>(null);
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [selectedProductType, setSelectedProductType] = useState<string>('all');
    const [currentProductPage, setCurrentProductPage] = useState(1);
    const [productPageSize] = useState(5); // Show only 5 products per page
    const [productSortBy, setProductSortBy] = useState<string>('ProductName');
    const [productSortDescending, setProductSortDescending] = useState(false);

    useEffect(() => {
        if (productionOrderId) {
            loadData();
        }
    }, [productionOrderId]);

    useEffect(() => {
        if (productionOrderInfo && productionOrderInfo.type === 'Cắt kính') {
            setCurrentProductPage(1); 
            loadPaginatedProducts();
        }
    }, [productionOrderInfo, selectedProductType, productSearchTerm, productSortBy, productSortDescending]);

    useEffect(() => {
        if (productionOrderInfo && productionOrderInfo.type === 'Cắt kính' && currentProductPage > 0) {
            loadPaginatedProducts();
        }
    }, [currentProductPage]);

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

    const loadPaginatedProducts = async () => {
        if (!productionOrderInfo || productionOrderInfo.type !== 'Cắt kính') return;
        
        try {
            const request: ProductSearchRequestDto = {
                productionOrderId: productionOrderId,
                productType: selectedProductType === 'all' ? undefined : selectedProductType,
                searchTerm: productSearchTerm || undefined,
                pageNumber: currentProductPage,
                pageSize: productPageSize,
                sortBy: productSortBy,
                sortDescending: productSortDescending
            };
            
            const result = await searchProducts(request);
            if (result) {
                setPaginatedProducts(result);
            }
        } catch (error) {
            console.error('Error loading paginated products:', error);
        }
    };

    const handleProductTypeChange = (type: string) => {
        setSelectedProductType(type);
        setCurrentProductPage(1); // Reset to first page
    };

    const handleProductSearch = (term: string) => {
        setProductSearchTerm(term);
        setCurrentProductPage(1); 
    };

    const handleProductSort = (sortBy: string) => {
        if (productSortBy === sortBy) {
            setProductSortDescending(!productSortDescending);
        } else {
            setProductSortBy(sortBy);
            setProductSortDescending(false);
        }
        setCurrentProductPage(1); 
    };

    const handleProductPageChange = (page: number) => {
        setCurrentProductPage(page);
    };

    const handleSlipCreated = (newSlip: InventorySlip) => {
        setInventorySlips(prev => [newSlip, ...prev]);
        setShowCreateForm(false);
        setSelectedSlip(null);
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
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Tạo phiếu cắt kính
                            </button>
                        )}
                        {(productionOrderInfo.type === 'Ghép kính' || ['Sản xuất keo', 'Đổ keo'].includes(productionOrderInfo.type)) && (
                            <button
                                onClick={() => router.push(`/inventoryslip/${productionOrderId}/material-export`)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                {productionOrderInfo.type === 'Ghép kính' ? 'Tạo phiếu xuất keo butyl' : 'Tạo phiếu xuất hóa chất'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Production Outputs Summary */}
            <div className="bg-white border rounded-lg shadow-sm p-6 mb-6">
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
                <div className="bg-white border rounded-lg shadow-sm p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Sản phẩm có sẵn cho phiếu cắt kính</h3>                    
                    {/* Search and Filter Controls */}
                    <div className="mb-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Product Type Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Loại sản phẩm
                                </label>
                                <select
                                    value={selectedProductType}
                                    onChange={(e) => handleProductTypeChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                >
                                    <option value="all">Tất cả</option>
                                    <option value="NVL">Nguyên vật liệu (NVL)</option>
                                    <option value="Bán thành phẩm">Bán thành phẩm</option>
                                    <option value="Kính dư">Kính dư</option>
                                </select>
                            </div>
                            
                            {/* Search Term */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tìm kiếm
                                </label>
                                <input
                                    type="text"
                                    value={productSearchTerm}
                                    onChange={(e) => handleProductSearch(e.target.value)}
                                    placeholder="Tên hoặc mã sản phẩm..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            
                            {/* Sort Options */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sắp xếp theo
                                </label>
                                <select
                                    value={productSortBy}
                                    onChange={(e) => handleProductSort(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                >
                                    <option value="ProductName">Tên sản phẩm</option>
                                    <option value="ProductCode">Mã sản phẩm</option>
                                    <option value="Id">ID</option>
                                </select>
                            </div>
                        </div>
                        
                        {/* Sort Direction Toggle */}
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setProductSortDescending(!productSortDescending)}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                    productSortDescending 
                                        ? 'bg-blue-500 text-white' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {productSortDescending ? '↓ Giảm dần' : '↑ Tăng dần'}
                            </button>
                        </div>
                    </div>
                    
                    {/* Products Display */}
                    {paginatedProducts ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {paginatedProducts.products.map((product) => (
                                    <div key={product.id} className={`border rounded p-3 ${
                                        product.productType === 'NVL' || product.productType === 'Nguyên vật liệu' 
                                            ? 'bg-blue-50 border-blue-200' 
                                            : product.productType === 'Bán thành phẩm' || product.productType === 'BTP'
                                                ? 'bg-green-50 border-green-200'
                                                : 'bg-yellow-50 border-yellow-200'
                                    }`}>
                                        <div className="font-medium text-sm">{product.productName}</div>
                                        <div className="text-xs text-gray-600">Mã: {product.productCode}</div>
                                        <div className="text-xs text-gray-600">Đơn vị: {product.uom || 'N/A'}</div>
                                        <div className="text-xs text-gray-600">Loại: {product.productType}</div>
                                    </div>
                                ))}
                            </div>
                            
                            {paginatedProducts.totalPages > 1 && (
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Hiển thị {((paginatedProducts.pageNumber - 1) * paginatedProducts.pageSize) + 1} - {Math.min(paginatedProducts.pageNumber * paginatedProducts.pageSize, paginatedProducts.totalCount)} trong tổng số {paginatedProducts.totalCount} sản phẩm
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleProductPageChange(paginatedProducts.pageNumber - 1)}
                                            disabled={!paginatedProducts.hasPreviousPage}
                                            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                                paginatedProducts.hasPreviousPage
                                                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                        >
                                            ← Trước
                                        </button>
                                        
                                        <div className="flex items-center space-x-1">
                                            {Array.from({ length: Math.min(5, paginatedProducts.totalPages) }, (_, i) => {
                                                let pageNum;
                                                if (paginatedProducts.totalPages <= 5) {
                                                    pageNum = i + 1;
                                                } else if (paginatedProducts.pageNumber <= 3) {
                                                    pageNum = i + 1;
                                                } else if (paginatedProducts.pageNumber >= paginatedProducts.totalPages - 2) {
                                                    pageNum = paginatedProducts.totalPages - 4 + i;
                                                } else {
                                                    pageNum = paginatedProducts.pageNumber - 2 + i;
                                                }
                                                
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => handleProductPageChange(pageNum)}
                                                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                                            pageNum === paginatedProducts.pageNumber
                                                                ? 'bg-blue-500 text-white'
                                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                        }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        
                                        <button
                                            onClick={() => handleProductPageChange(paginatedProducts.pageNumber + 1)}
                                            disabled={!paginatedProducts.hasNextPage}
                                            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                                paginatedProducts.hasNextPage
                                                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                        >
                                            Sau →
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {paginatedProducts.products.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    Không tìm thấy sản phẩm nào phù hợp với tiêu chí tìm kiếm.
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-2 text-gray-600">Đang tải danh sách sản phẩm...</p>
                        </div>
                    )}
                </div>
            )}

            {showCreateForm && (
                <div className="bg-white border rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">
                            {selectedSlip ? 'Chỉnh sửa phiếu' : 'Tạo phiếu mới'}
                        </h3>
                        <button
                            onClick={() => {
                                setShowCreateForm(false);
                                setSelectedSlip(null);
                            }}
                            className="px-3 py-1 text-sm border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-md transition-colors"
                        >
                            Đóng
                        </button>
                    </div>
                    
                    {selectedSlip ? (
                        <div className="space-y-6">
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                                <h4 className="font-medium text-blue-800 mb-2">📝 Chỉnh sửa phiếu: {selectedSlip.slipCode}</h4>
                                <p className="text-sm text-blue-700">
                                    Bạn có thể chỉnh sửa từng sản phẩm riêng biệt. Mối quan hệ mapping sẽ được giữ nguyên.
                                </p>
                            </div>

                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                                <h5 className="font-medium text-gray-800 mb-3">📊 Tóm tắt phiếu</h5>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div className="flex items-center space-x-2">
                                        <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                                        <span className="font-medium text-blue-600">Nguyên vật liệu:</span>
                                        <span className="text-gray-700">
                                            {selectedSlip.details?.filter(d =>                                                 
                                                d.outputMappings && d.outputMappings.length > 0
                                            ).length || 0} sản phẩm
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="font-medium text-green-600">Bán thành phẩm:</span>
                                        <span className="text-gray-700">
                                            {selectedSlip.details?.filter(d =>                                                 
                                                productionOrderInfo.productionOutputs?.some(po => po.productId === d.productId)
                                            ).length || 0} sản phẩm
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                                        <span className="font-medium text-yellow-600">Kính dư:</span>
                                        <span className="text-gray-700">
                                            {selectedSlip.details?.filter(d =>                                                 
                                                !(d.outputMappings && d.outputMappings.length > 0) && 
                                                !productionOrderInfo.productionOutputs?.some(po => po.productId === d.productId)
                                            ).length || 0} sản phẩm
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-orange-50 border border-orange-200 rounded-md">
                                <h5 className="font-medium text-orange-800 mb-2">⚠️ Lưu ý khi chỉnh sửa</h5>
                                <div className="text-sm text-orange-700 space-y-1">
                                    <p>• <strong>Có thể chỉnh sửa:</strong> Số lượng, ghi chú, mô tả phiếu</p>
                                    <p>• <strong>Không thể thay đổi:</strong> Loại sản phẩm, mối quan hệ mapping giữa các sản phẩm</p>
                                    <p>• <strong>Mapping sẽ được giữ nguyên:</strong> Mối quan hệ giữa nguyên vật liệu và sản phẩm đầu ra</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mô tả
                                    </label>
                                    <input
                                        type="text"
                                        value={selectedSlip.description || ''}
                                        onChange={(e) => setSelectedSlip(prev => prev ? {...prev, description: e.target.value} : null)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        placeholder="Nhập mô tả phiếu..."
                                    />
                                </div>
                            </div>

                                                        {/* Product Details */}
                            <div className="border-t pt-6">
                                <h4 className="text-lg font-semibold mb-4">Chỉnh sửa từng thành phần</h4>
                                {selectedSlip.details && selectedSlip.details.some(d => 
                                    d.outputMappings && d.outputMappings.length > 0
                                ) && (
                                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-md">
                                        <h5 className="font-medium text-blue-800 mb-3">🔗 Sơ đồ mối quan hệ sản phẩm</h5>
                                        <div className="space-y-3">
                                            {selectedSlip.details.filter(d => 
                                                d.outputMappings && d.outputMappings.length > 0
                                            ).map((rawMaterialDetail: any, index: number) => {
                                                const rawMaterial = productionOrderInfo.availableProducts?.find(p => p.id === rawMaterialDetail.productId);
                                                const mappings = rawMaterialDetail.outputMappings || [];
                                                
                                                if (mappings.length === 0) return null;
                                                
                                                return (
                                                    <div key={index} className="flex items-center space-x-3">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="text-blue-600">🔵</span>
                                                            <span className="text-sm font-medium text-blue-800">
                                                                {rawMaterial?.productName || `NVL ${rawMaterialDetail.productId}`}
                                                            </span>
                                                            <span className="text-xs text-blue-600">
                                                                ({rawMaterialDetail.quantity} {rawMaterial?.uom || 'N/A'})
                                                            </span>
                                                        </div>
                                                        <span className="text-gray-400">→</span>
                                                        <div className="flex items-center space-x-2">
                                                            {mappings.map((mapping: any, mappingIndex: number) => {
                                                                const outputDetail = selectedSlip.details.find((d: any) => d.id === mapping.outputDetailId);
                                                                const outputProduct = productionOrderInfo.availableProducts?.find(p => p.id === outputDetail?.productId);
                                                                const isOutputSemiFinished = productionOrderInfo.productionOutputs?.some(po => po.productId === outputDetail?.productId);
                                                                const isOutputGlassProduct = !(outputDetail?.outputMappings && outputDetail.outputMappings.length > 0) && 
                                                                                           !productionOrderInfo.productionOutputs?.some(po => po.productId === outputDetail?.productId);
                                                                
                                                                let outputIcon = '🟢';
                                                                if (isOutputGlassProduct) outputIcon = '🟡';
                                                                
                                                                return (
                                                                    <div key={mappingIndex} className="flex items-center space-x-1">
                                                                        <span className="text-lg">{outputIcon}</span>
                                                                        <span className="text-sm text-gray-700">
                                                                            {outputProduct?.productName || `SP ${outputDetail?.productId}`}
                                                                        </span>
                                                                        <span className="text-xs text-gray-500">
                                                                            ({outputDetail?.quantity} {outputProduct?.uom || 'N/A'})
                                                                        </span>
                                                                        {mappingIndex < mappings.length - 1 && <span className="text-gray-400">,</span>}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                
                                {selectedSlip.details && selectedSlip.details.some(d => 
                                    d.outputMappings && d.outputMappings.length > 0
                                ) && (
                                    <div className="mb-6">
                                        <h5 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                                            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                                            Nguyên vật liệu (Kính lớn)
                                        </h5>
                                        <div className="space-y-3">
                                            {selectedSlip.details.filter(d => 
                                                d.outputMappings && d.outputMappings.length > 0
                                            ).map((detail: any, index: number) => {
                                                const product = productionOrderInfo.availableProducts?.find(p => p.id === detail.productId);
                                                const originalIndex = selectedSlip.details.findIndex(d => d.id === detail.id);
                                                
                                                return (
                                                    <div key={detail.id} className="border-l-4 border-blue-500 bg-blue-50 rounded-r-md p-4">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-lg">🔵</span>
                                                                <div>
                                                                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                                                        Nguyên vật liệu
                                                                    </span>
                                                                    <h6 className="font-medium mt-2">
                                                                        {product?.productName || `NVL ${detail.productId}`}
                                                                    </h6>
                                                                    <p className="text-sm text-gray-600">
                                                                        Mã: {product?.productCode || 'N/A'} | Đơn vị: {product?.uom || 'N/A'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-blue-700 mb-2">
                                                                    Số lượng <span className="text-red-500">*</span>
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0.01"
                                                                    value={detail.quantity}
                                                                    onChange={(e) => {
                                                                        const newDetails = [...selectedSlip.details];
                                                                        newDetails[originalIndex] = {...newDetails[originalIndex], quantity: parseFloat(e.target.value)};
                                                                        setSelectedSlip(prev => prev ? {...prev, details: newDetails} : null);
                                                                    }}
                                                                    className={`w-full px-3 py-2 border rounded-md ${
                                                                        detail.quantity <= 0 ? 'border-red-500 bg-red-50' : 'border-blue-300'
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
                                                                    value={detail.note || ''}
                                                                    onChange={(e) => {
                                                                        const newDetails = [...selectedSlip.details];
                                                                        newDetails[originalIndex] = {...newDetails[originalIndex], note: e.target.value};
                                                                        setSelectedSlip(prev => prev ? {...prev, details: newDetails} : null);
                                                                    }}
                                                                    className="w-full px-3 py-2 border border-blue-300 rounded-md"
                                                                    placeholder="Ghi chú..."
                                                                />
                                                            </div>
                                                        </div>

                                                        {detail.outputMappings && detail.outputMappings.length > 0 && (
                                                            <div className="mt-3 p-3 bg-green-50 rounded-md border border-green-200">
                                                                <h6 className="text-sm font-medium text-green-800 mb-2">
                                                                    🔗 Đã liên kết với {detail.outputMappings.length} sản phẩm:
                                                                </h6>
                                                                <div className="space-y-1">
                                                                    {detail.outputMappings.map((mapping: any, mappingIndex: number) => {
                                                                        const outputDetail = selectedSlip.details.find((d: any) => d.id === mapping.outputDetailId);
                                                                        const outputProduct = productionOrderInfo.availableProducts?.find(p => p.id === outputDetail?.productId);
                                                                        const isOutputSemiFinished = productionOrderInfo.productionOutputs?.some(po => po.productId === outputDetail?.productId);
                                                                        const isOutputGlassProduct = !(outputDetail?.outputMappings && outputDetail.outputMappings.length > 0) && 
                                                                                                   !productionOrderInfo.productionOutputs?.some(po => po.productId === outputDetail?.productId);
                                                                        
                                                                        let outputIcon = '🟢';
                                                                        if (isOutputGlassProduct) outputIcon = '🟡';
                                                                        
                                                                        return (
                                                                            <div key={mappingIndex} className="text-sm text-green-700 flex items-center space-x-2">
                                                                                <span>{outputIcon}</span>
                                                                                <span>{outputProduct?.productName || `Sản phẩm ${outputDetail?.productId}`}</span>
                                                                                {mapping.note && (
                                                                                    <span className="text-xs text-gray-500">({mapping.note})</span>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {selectedSlip.details && selectedSlip.details.some(d => 
                                    productionOrderInfo.productionOutputs?.some(po => po.productId === d.productId)
                                ) && (
                                    <div className="mb-6">
                                        <h5 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                                            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                            Bán thành phẩm (Kính nhỏ)
                                        </h5>
                                        <div className="space-y-3">
                                            {selectedSlip.details.filter(d => 
                                                productionOrderInfo.productionOutputs?.some(po => po.productId === d.productId)
                                            ).map((detail: any, index: number) => {
                                                const product = productionOrderInfo.availableProducts?.find(p => p.id === detail.productId);
                                                const originalIndex = selectedSlip.details.findIndex(d => d.id === detail.id);
                                                
                                                return (
                                                    <div key={detail.id} className="border-l-4 border-green-500 bg-green-50 rounded-r-md p-4">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-lg">🟢</span>
                                                                <div>
                                                                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                                                        Bán thành phẩm
                                                                    </span>
                                                                    <h6 className="font-medium mt-2">
                                                                        {product?.productName || `BTP ${detail.productId}`}
                                                                    </h6>
                                                                    <p className="text-sm text-gray-600">
                                                                        Mã: {product?.productCode || 'N/A'} | Đơn vị: {product?.uom || 'N/A'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-green-700 mb-2">
                                                                    Số lượng <span className="text-red-500">*</span>
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0.01"
                                                                    value={detail.quantity}
                                                                    onChange={(e) => {
                                                                        const newDetails = [...selectedSlip.details];
                                                                        newDetails[originalIndex] = {...newDetails[originalIndex], quantity: parseFloat(e.target.value)};
                                                                        setSelectedSlip(prev => prev ? {...prev, details: newDetails} : null);
                                                                    }}
                                                                    className={`w-full px-3 py-2 border rounded-md ${
                                                                        detail.quantity <= 0 ? 'border-red-500 bg-red-50' : 'border-green-300'
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
                                                                    value={detail.note || ''}
                                                                    onChange={(e) => {
                                                                        const newDetails = [...selectedSlip.details];
                                                                        newDetails[originalIndex] = {...newDetails[originalIndex], note: e.target.value};
                                                                        setSelectedSlip(prev => prev ? {...prev, details: newDetails} : null);
                                                                    }}
                                                                    className="w-full px-3 py-2 border border-green-300 rounded-md"
                                                                    placeholder="Ghi chú..."
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {selectedSlip.details && selectedSlip.details.some(d =>                                     
                                    !(d.outputMappings && d.outputMappings.length > 0) && 
                                    !productionOrderInfo.productionOutputs?.some(po => po.productId === d.productId)
                                ) && (
                                    <div className="mb-6">
                                        <h5 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
                                            <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                                            Kính dư (Tái sử dụng)
                                        </h5>
                                        <div className="space-y-3">
                                            {selectedSlip.details.filter(d => 
                                                // Use same logic as backend: no OutputMappings and not in ProductionOutputs
                                                !(d.outputMappings && d.outputMappings.length > 0) && 
                                                !productionOrderInfo.productionOutputs?.some(po => po.productId === d.productId)
                                            ).map((detail: any, index: number) => {
                                                const product = productionOrderInfo.availableProducts?.find(p => p.id === detail.productId);
                                                const originalIndex = selectedSlip.details.findIndex(d => d.id === detail.id);
                                                
                                                return (
                                                    <div key={detail.id} className="border-l-4 border-yellow-500 bg-yellow-50 rounded-r-md p-4">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-lg">🟡</span>
                                                                <div>
                                                                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                                                                        Kính dư
                                                                    </span>
                                                                    <h6 className="font-medium mt-2">
                                                                        {product?.productName || `Kính ${detail.productId}`}
                                                                    </h6>
                                                                    <p className="text-sm text-gray-600">
                                                                        Mã: {product?.productCode || 'N/A'} | Đơn vị: {product?.uom || 'N/A'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-yellow-700 mb-2">
                                                                    Số lượng <span className="text-red-500">*</span>
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0.01"
                                                                    value={detail.quantity}
                                                                    onChange={(e) => {
                                                                        const newDetails = [...selectedSlip.details];
                                                                        newDetails[originalIndex] = {...newDetails[originalIndex], quantity: parseFloat(e.target.value)};
                                                                        setSelectedSlip(prev => prev ? {...prev, details: newDetails} : null);
                                                                    }}
                                                                    className={`w-full px-3 py-2 border rounded-md ${
                                                                        detail.quantity <= 0 ? 'border-red-500 bg-red-50' : 'border-yellow-300'
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
                                                                    value={detail.note || ''}
                                                                    onChange={(e) => {
                                                                        const newDetails = [...selectedSlip.details];
                                                                        newDetails[originalIndex] = {...newDetails[originalIndex], note: e.target.value};
                                                                        setSelectedSlip(prev => prev ? {...prev, details: newDetails} : null);
                                                                    }}
                                                                    className="w-full px-3 py-2 border border-yellow-300 rounded-md"
                                                                    placeholder="Ghi chú..."
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Cancel Button */}
                            <div className="flex justify-end space-x-4 pt-6 border-t">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        setSelectedSlip(null);
                                    }}
                                    className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    ) : (
                        // Create Form 
                        <InventorySlipForm
                            productionOrderInfo={productionOrderInfo}
                            onSlipCreated={handleSlipCreated}
                            onCancel={() => {
                                setShowCreateForm(false);
                                setSelectedSlip(null);
                            }}
                        />
                    )}
                </div>
            )}

            {/* Inventory Slips List */}
            <div className="bg-white border rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Danh sách phiếu kho</h3>
                <InventorySlipList
                    slips={inventorySlips}
                    onRefresh={loadData}
                />
            </div>
        </div>
    );
};

export default ProductionOrderInventorySlipPage;
