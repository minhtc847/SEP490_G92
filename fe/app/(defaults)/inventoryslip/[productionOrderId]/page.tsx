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

    const [paginatedProducts, setPaginatedProducts] = useState<PaginatedProductsDto | null>(null);
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [selectedProductType, setSelectedProductType] = useState<string>('all');
    const [currentProductPage, setCurrentProductPage] = useState(1);
    const [productPageSize] = useState(5);
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
        setCurrentProductPage(1);
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
                        <button
                            onClick={() => router.push(`/production-orders/view/${productionOrderId}`)}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                        >
                            ← Xem lệnh sản xuất
                        </button>
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

            {productionOrderInfo.type === 'Cắt kính' && (
                <div className="bg-white border rounded-lg shadow-sm p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Sản phẩm có sẵn cho phiếu cắt kính</h3>
                    <div className="mb-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                    <option value="Id">ID</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setProductSortDescending(!productSortDescending)}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${productSortDescending
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
                                {paginatedProducts.products
                                    .filter((product) => (product.uom || '').toLowerCase() === 'tấm')
                                    .map((product) => (
                                    <div key={product.id} className={`border rounded p-3 ${product.productType === 'NVL' || product.productType === 'Nguyên vật liệu'
                                        ? 'bg-blue-50 border-blue-200'
                                        : product.productType === 'Bán thành phẩm' || product.productType === 'BTP'
                                            ? 'bg-green-50 border-green-200'
                                            : 'bg-yellow-50 border-yellow-200'
                                        }`}>
                                        <div className="font-medium text-sm">{product.productName}</div>
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
                                            className={`px-3 py-1 text-sm rounded-md transition-colors ${paginatedProducts.hasPreviousPage
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
                                                        className={`px-3 py-1 text-sm rounded-md transition-colors ${pageNum === paginatedProducts.pageNumber
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
                                            className={`px-3 py-1 text-sm rounded-md transition-colors ${paginatedProducts.hasNextPage
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
                            Tạo phiếu mới
                        </h3>
                        <button
                            onClick={() => {
                                setShowCreateForm(false);
                            }}
                            className="px-3 py-1 text-sm border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-md transition-colors"
                        >
                            Đóng
                        </button>
                    </div>

                    <InventorySlipForm
                        productionOrderInfo={productionOrderInfo}
                        onSlipCreated={handleSlipCreated}
                        onCancel={() => {
                            setShowCreateForm(false);
                        }}
                    />
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
