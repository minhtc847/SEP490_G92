'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAllInventorySlips, InventorySlipListItem, finalizeInventorySlip, fetchInventorySlipById, InventorySlip, getInventorySlipsNotUpdated, callManyImportExportInvoices, checkSlipProductsMisaStatus, testMisaStatus } from './service';
import IconEye from '@/components/icon/icon-eye';
import IconPlus from '@/components/icon/icon-plus';
import { createPortal } from 'react-dom';

const PAGE_SIZES = [10, 20, 50, 100];

const getSlipTypeText = (productionOrderType: string | undefined) => {
    switch (productionOrderType) {
        case 'Cắt kính': return 'Phiếu cắt kính';
        case 'Ghép kính': return 'Phiếu xuất keo butyl';
        case 'Sản xuất keo': return 'Phiếu xuất hóa chất';
        case 'Đổ keo': return 'Phiếu xuất hóa chất';
        default: return productionOrderType || '-';
    }
};

const InventorySlipPage = () => {
    const [slips, setSlips] = useState<InventorySlipListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [records, setRecords] = useState<InventorySlipListItem[]>([]);
    const [filterType, setFilterType] = useState<string>('all');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedSlip, setSelectedSlip] = useState<InventorySlip | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [isUpdatingMany, setIsUpdatingMany] = useState(false);
    const [updateMessage, setUpdateMessage] = useState<string>('');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const fetchSlips = async () => {
        setLoading(true);
        try {
            const data = await fetchAllInventorySlips();
            const sorted = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setSlips(sorted);
        } catch (error) {
            console.error('Error fetching slips:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSlips();
    }, []);

    useEffect(() => {
        let filtered = [...slips];
        
        // Filter by slip type - map production order types to slip types
        if (filterType !== 'all') {
            filtered = filtered.filter(slip => {
                switch (filterType) {
                    case 'cut-glass':
                        return slip.productionOrderType === 'Cắt kính';
                    case 'butyl-glue':
                        return slip.productionOrderType === 'Ghép kính';
                    case 'chemical':
                        return slip.productionOrderType === 'Sản xuất keo' || slip.productionOrderType === 'Đổ keo';
                    default:
                        return true;
                }
            });
        }
        
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecords(filtered.slice(from, to));
    }, [slips, page, pageSize, filterType]);

    const handleViewDetails = async (slipId: number) => {
        try {
            setDetailLoading(true);
            const fullSlip = await fetchInventorySlipById(slipId);
            if (fullSlip) {
                setSelectedSlip(fullSlip);
                setShowDetailModal(true);
            }
        } catch (error) {
            console.error('Error loading slip details:', error);
        } finally {
            setDetailLoading(false);
        }
    };

    const closeDetailModal = () => {
        setShowDetailModal(false);
        setSelectedSlip(null);
    };

    const handleUpdateManySlips = async () => {
        try {
            setIsUpdatingMany(true);
            setUpdateMessage('Đang lấy danh sách phiếu chưa cập nhật...');
            
            // Lấy danh sách phiếu chưa cập nhật MISA
            const slipsNotUpdated = await getInventorySlipsNotUpdated();
            
            if (slipsNotUpdated.length === 0) {
                setUpdateMessage('Không có phiếu nào cần cập nhật MISA');
                return;
            }

            setUpdateMessage(`Đang kiểm tra trạng thái sản phẩm trong ${slipsNotUpdated.length} phiếu...`);
            
            // Kiểm tra trạng thái MISA của sản phẩm trong từng phiếu
            const slipsWithIssues = [];
            const validSlips = [];
            
            for (const slip of slipsNotUpdated) {
                try {
                    // Sử dụng API test mới để debug
                    const misaStatus = await testMisaStatus(slip.id);
                    
                    if (misaStatus.success && misaStatus.canUpdateMisa) {
                        validSlips.push(slip);
                    } else {
                        slipsWithIssues.push({
                            slip: slip,
                            message: misaStatus.message || 'Có sản phẩm chưa cập nhật MISA'
                        });
                    }
                } catch (error) {
                    console.error(`Error checking slip ${slip.id}:`, error);
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    slipsWithIssues.push({
                        slip: slip,
                        message: `Lỗi khi kiểm tra trạng thái MISA: ${errorMessage}`
                    });
                }
            }

            // Nếu có phiếu có vấn đề, hiển thị lỗi và dừng
            if (slipsWithIssues.length > 0) {
                const errorMessage = `Không thể cập nhật vì có ${slipsWithIssues.length} phiếu chứa sản phẩm chưa cập nhật MISA:\n\n` +
                    slipsWithIssues.map(issue => 
                        `- Phiếu ${issue.slip.slipCode}: ${issue.message}`
                    ).join('\n');
                
                setUpdateMessage(`❌ ${errorMessage}`);
                return;
            }

            // Nếu không có phiếu nào hợp lệ
            if (validSlips.length === 0) {
                setUpdateMessage('Không có phiếu nào đủ điều kiện để cập nhật MISA');
                return;
            }

            // Xác nhận với người dùng
            const confirmed = window.confirm(
                `Tất cả sản phẩm trong ${validSlips.length} phiếu đã được cập nhật MISA.\n\nBạn có chắc chắn muốn cập nhật ${validSlips.length} phiếu không?`
            );

            if (!confirmed) {
                setUpdateMessage('Đã hủy cập nhật');
                return;
            }

            setUpdateMessage(`Đang cập nhật ${validSlips.length} phiếu...`);
            
            // Gọi API cập nhật nhiều phiếu
            const slipIds = validSlips.map(slip => slip.id);
            const success = await callManyImportExportInvoices(slipIds);
            
            if (success) {
                setUpdateMessage(`✅ Đã gửi yêu cầu cập nhật ${validSlips.length} phiếu thành công!`);
                // Refresh danh sách phiếu
                await fetchSlips();
            } else {
                setUpdateMessage('❌ Có lỗi xảy ra khi cập nhật phiếu');
            }
        } catch (error) {
            console.error('Error updating many slips:', error);
            setUpdateMessage('❌ Có lỗi xảy ra khi cập nhật phiếu');
        } finally {
            setIsUpdatingMany(false);
        }
    };

    const filteredSlips = slips.filter(slip => {
        if (filterType === 'all') return true;
        
        switch (filterType) {
            case 'cut-glass':
                return slip.productionOrderType === 'Cắt kính';
            case 'butyl-glue':
                return slip.productionOrderType === 'Ghép kính';
            case 'chemical':
                return slip.productionOrderType === 'Sản xuất keo' || slip.productionOrderType === 'Đổ keo';
            default:
                return true;
        }
    });

    return (
        <div>           

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Loại phiếu:</label>
                        <select 
                            className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="all">Tất cả phiếu</option>
                            <option value="cut-glass">Phiếu cắt kính</option>
                            <option value="butyl-glue">Phiếu xuất keo butyl</option>
                            <option value="chemical">Phiếu xuất hóa chất</option>
                        </select>
                    </div>
                    <div>
                        <button
                            onClick={handleUpdateManySlips}
                            disabled={isUpdatingMany}
                            className={`px-4 py-2 rounded-md font-medium ${
                                isUpdatingMany 
                                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            {isUpdatingMany ? 'Đang cập nhật...' : 'Cập nhật tất cả phiếu chưa cập nhật MISA'}
                        </button>
                    </div>
                </div>
                
                {/* Update Message */}
                {updateMessage && (
                    <div className={`mt-4 p-3 rounded-md ${
                        updateMessage.includes('❌') 
                            ? 'bg-red-50 border border-red-200' 
                            : updateMessage.includes('✅')
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-blue-50 border border-blue-200'
                    }`}>
                        <p className={`text-sm whitespace-pre-line ${
                            updateMessage.includes('❌') 
                                ? 'text-red-800' 
                                : updateMessage.includes('✅')
                                ? 'text-green-800'
                                : 'text-blue-800'
                        }`}>{updateMessage}</p>
                    </div>
                )}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mt-6">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã phiếu</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại phiếu</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID lệnh sản xuất</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Người tạo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MISA</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                                                        {loading ? (
                                <tr>
                                    <td colSpan={10} className="px-6 py-4 text-center text-sm text-gray-500">
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : records.length === 0 ? (
                                <tr>
                                    <td colSpan={10} className="px-6 py-4 text-center text-sm text-gray-500">
                                        Không có dữ liệu phiếu kho
                                    </td>
                                </tr>
                            ) : (
                                records.map((item, idx) => (
                                    <tr key={item.id} className="bg-white hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(page - 1) * pageSize + idx + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-semibold text-blue-600">
                                                {item.slipCode}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getSlipTypeText(item.productionOrderType)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                                {item.productionOrderId}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.createdByEmployeeName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {item.isFinalized ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                     Đã cập nhật
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                     Chưa cập nhật
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {item.isUpdateMisa ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                     Đã đồng bộ MISA
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                     Chưa đồng bộ MISA
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={item.description}>
                                            {item.description || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleViewDetails(item.id)}
                                                    disabled={detailLoading}
                                                    className="p-2 bg-sky-100 rounded-full hover:bg-sky-200 transition inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Xem chi tiết"
                                                >
                                                    <IconEye className="w-4 h-4" />
                                                </button>                                                
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredSlips.length > pageSize && (
                    <div className="flex justify-between items-center mt-4">
                        <div>
                            Hiển thị {((page - 1) * pageSize) + 1} đến {Math.min(page * pageSize, filteredSlips.length)} trong tổng số {filteredSlips.length} phiếu
                        </div>
                        <div className="flex gap-2">
                                                         <button
                                 className="px-3 py-1 text-sm border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                 onClick={() => setPage(Math.max(1, page - 1))}
                                 disabled={page === 1}
                             >
                                 Trước
                             </button>
                            <span className="px-3 py-2">
                                Trang {page} / {Math.ceil(filteredSlips.length / pageSize)}
                            </span>
                                                         <button
                                 className="px-3 py-1 text-sm border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                 onClick={() => setPage(Math.min(Math.ceil(filteredSlips.length / pageSize), page + 1))}
                                 disabled={page >= Math.ceil(filteredSlips.length / pageSize)}
                             >
                                 Sau
                             </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {isMounted && showDetailModal && selectedSlip && createPortal(
                <div className="fixed inset-0 z-[1000]">
                    <div className="fixed inset-0 bg-black/50" onClick={closeDetailModal} />
                    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-lg">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Chi tiết phiếu: {selectedSlip.slipCode}
                            </h3>
                            <button onClick={closeDetailModal} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full" title="Đóng">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6">
                            {detailLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <span className="ml-2 text-gray-600">Đang tải chi tiết...</span>
                                </div>
                            ) : (
                                <SlipDetailContent slip={selectedSlip} />
                            )}
                        </div>
                    </div>
                </div>, document.body
            )}
        </div>
    );
};

// Slip Detail Content Component
const SlipDetailContent = ({ slip }: { slip: InventorySlip }) => {
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

    const getSlipTypeText = (productionOrderType: string | undefined) => {
        switch (productionOrderType) {
            case 'Cắt kính': return 'Phiếu cắt kính';
            case 'Ghép kính': return 'Phiếu xuất keo butyl';
            case 'Sản xuất keo':
            case 'Đổ keo': return 'Phiếu xuất hóa chất';
            default: return productionOrderType || '-';
        }
    };

    return (
        <div className="space-y-6">
            {/* Slip Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <span className="text-sm font-medium text-gray-500">Mã phiếu:</span>
                        <p className="text-lg font-semibold text-blue-600">{slip.slipCode}</p>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-gray-500">Lệnh sản xuất:</span>
                        <p className="text-sm font-semibold text-purple-600">{slip.productionOrderCode || `#${slip.productionOrderId}`}</p>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-gray-500">Loại phiếu:</span>
                        <p className="text-sm text-gray-900">{getSlipTypeText(slip.productionOrderType)}</p>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-gray-500">Ngày tạo:</span>
                        <p className="text-sm text-gray-900">{new Date(slip.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-gray-500">Người tạo:</span>
                        <p className="text-sm text-gray-900">{slip.createdByEmployeeName}</p>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-gray-500">Trạng thái:</span>
                        <p className="text-sm">
                            {slip.isFinalized ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Đã cập nhật
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    Chưa cập nhật
                                </span>
                            )}
                        </p>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-gray-500">MISA:</span>
                        <p className="text-sm">
                            {slip.isUpdateMisa ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Đã đồng bộ MISA
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    Chưa đồng bộ MISA
                                </span>
                            )}
                        </p>
                    </div>
                </div>
                {slip.description && (
                    <div className="mt-4">
                        <span className="text-sm font-medium text-gray-500">Mô tả:</span>
                        <p className="text-sm text-gray-900 mt-1">{slip.description}</p>
                    </div>
                )}
            </div>

            {/* Slip Details */}
            <div>
                <h4 className="text-lg font-semibold mb-4">Chi tiết sản phẩm:</h4>
                
                {/* For Cut Glass Slips - Show hierarchical structure */}
                {slip.productionOrderType === 'Cắt kính' ? (
                    <CutGlassSlipDetails slip={slip} />
                ) : ['Ghép kính', 'Sản xuất keo', 'Đổ keo'].includes(slip.productionOrderType || '') ? (
                    /* For material export slips - Show grouped structure */
                    <MaterialExportSlipDetails
                        slip={slip}
                        expandedMaterials={expandedMaterials}
                        toggleMaterialsExpanded={toggleExpanded}
                    />
                ) : (
                    /* For other slip types - Show flat structure */
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên sản phẩm</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn vị</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ghi chú</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(slip.details || []).map((detail, index) => (
                                    <tr key={detail.id} className="bg-white hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
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
        </div>
    );
};

// Cut Glass Slip Details Component
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

    const rawMaterials = slip.details.filter(detail =>
        detail.productId !== null && detail.productType === 'NVL'
    );

    const semiFinishedProducts = slip.details.filter(detail =>
        detail.productId !== null &&
        (detail.productType === 'Bán thành phẩm' || detail.productType === 'BTP' || detail.productType === 'semi_finished')
    );

    const wasteGlass = slip.details.filter(detail =>
        detail.productId !== null &&
        (detail.productType === 'Kính dư' || detail.productType === 'Kính')
    );

    const targetProducts = slip.details.filter(detail =>
        detail.productId === null
    );

    const materialOutputMap = new Map<number, any[]>();

    rawMaterials.forEach(material => {
        if (material.outputMappings && material.outputMappings.length > 0) {
            const outputs = material.outputMappings.map(mapping => {
                const outputDetail = [...semiFinishedProducts, ...wasteGlass].find(d => d.id === mapping.outputDetailId);
                return outputDetail;
            }).filter(Boolean);
            materialOutputMap.set(material.id, outputs);
        } else {
            materialOutputMap.set(material.id, []);
        }
    });

    return (
        <div className="space-y-4">
            <div>
                <h6 className="font-medium text-blue-800 mb-3">Nguyên vật liệu (Kính lớn)</h6>
                <div className="space-y-3">
                    {rawMaterials.map((material) => {
                        const outputs = materialOutputMap.get(material.id) || [];
                        const isExpanded = expandedMaterials.has(material.id);

                        return (
                            <div key={material.id} className="border rounded-lg overflow-hidden">
                                <div
                                    className="bg-blue-50 p-3 cursor-pointer hover:bg-blue-100 transition-colors"
                                    onClick={() => toggleExpanded(material.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            {isExpanded ? (
                                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            )}
                                            <div className="flex-1">
                                                <div className="font-medium text-blue-900">
                                                    {material.productName}
                                                </div>
                                                <div className="text-sm text-blue-700">
                                                    Số lượng: {material.quantity} {material.uom || 'cái'} |
                                                    {outputs.length > 0 ? (
                                                        <>
                                                            Tạo ra {outputs.length} sản phẩm
                                                            {targetProducts.length > 0 && (
                                                                <span className="ml-2 text-green-600">
                                                                    Thành phẩm mục tiêu: {
                                                                        targetProducts.reduce((total, target) => total + (target.quantity || 0), 0)
                                                                    } cái
                                                                </span>
                                                            )}
                                                        </>
                                                    ) : ' Chưa có sản phẩm đầu ra'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && outputs.length > 0 && (
                                    <div className="border-t bg-white">
                                        <div className="p-3">
                                            <h6 className="font-medium text-gray-700 mb-2 block">
                                                Sản phẩm đầu ra:
                                            </h6>
                                            <div className="space-y-2">
                                                {outputs.map((output) => {
                                                    const isSemiFinished = semiFinishedProducts.some(p => p.id === output.id);
                                                    const isWasteGlass = wasteGlass.some(p => p.id === output.id);

                                                    return (
                                                        <div key={output.id} className={`flex items-center justify-between p-2 rounded border-l-4 ${isSemiFinished
                                                                ? 'bg-green-50 border-green-400'
                                                                : 'bg-yellow-50 border-yellow-400'
                                                            }`}>
                                                            <div className="flex-1">
                                                                <div className="font-medium text-gray-800">
                                                                    {output.productName}
                                                                </div>
                                                                <div className="text-sm text-gray-600">
                                                                    Số lượng: {output.quantity} {output.uom || 'cái'} |
                                                                    Loại: {output.productType}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isSemiFinished
                                                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                                                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                                                    }`}>
                                                                    {isSemiFinished ? 'Bán thành phẩm' : 'Kính dư'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">{rawMaterials.length}</div>
                            <div className="text-xs text-gray-500">Nguyên vật liệu</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-green-600">{semiFinishedProducts.length}</div>
                            <div className="text-xs text-gray-500">Bán thành phẩm</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-orange-600">{wasteGlass.length}</div>
                            <div className="text-xs text-gray-500">Kính dư</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-purple-600">{targetProducts.length}</div>
                            <div className="text-xs text-gray-500">Thành phẩm mục tiêu</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Material Export Slip Details Component
const MaterialExportSlipDetails = ({
    slip,
    expandedMaterials,
    toggleMaterialsExpanded
}: {
    slip: InventorySlip;
    expandedMaterials: Set<number>;
    toggleMaterialsExpanded: (id: number) => void;
}) => {
    const targetProducts = slip.details.filter(detail =>
        detail.productId === null
    );

    const rawMaterials = slip.details.filter(detail =>
        detail.productId !== null
    );

    const groupedDetails = rawMaterials.reduce((groups, detail) => {
        const key = detail.productionOutputId || 0;
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(detail);
        return groups;
    }, {} as Record<number, any[]>);

    const productionOutputs = rawMaterials
        .filter(d => d.productionOutputId)
        .map(d => d.productionOutputId!)
        .filter((value, index, self) => self.indexOf(value) === index);

    const getTargetProductInfo = (productionOutputId: number) => {
        const targetProduct = slip.details.find(d =>
            d.productionOutputId === productionOutputId &&
            d.productId === null
        );
        return targetProduct;
    };

    return (
        <div className="space-y-4">
            {productionOutputs.length > 0 ? (
                productionOutputs.map((productionOutputId) => {
                    const materials = groupedDetails[productionOutputId] || [];
                    const isExpanded = expandedMaterials.has(productionOutputId);
                    const targetProduct = getTargetProductInfo(productionOutputId);

                    if (materials.length === 0) return null;

                    return (
                        <div key={productionOutputId} className="border border-green-200 rounded-lg overflow-hidden">
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
                                                {targetProduct?.note?.replace('Thành phẩm mục tiêu: ', '') || `Sản phẩm mục tiêu #${productionOutputId}`}
                                            </div>
                                            <div className="text-sm text-green-700">
                                                {targetProduct ? (
                                                    <>
                                                        <span className="font-semibold text-green-800 bg-green-100 px-2 py-1 rounded">
                                                            Số lượng: {targetProduct.quantity} {targetProduct.uom || 'cái'}
                                                        </span>
                                                        {' | '}
                                                    </>
                                                ) : null}
                                                <span className="text-blue-600">
                                                    {materials.length} nguyên liệu được sử dụng
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

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
                    <div className="mb-2">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-1">Không có thông tin nguyên liệu</p>
                    <p className="text-sm">Phiếu này không có nguyên liệu nào được định nghĩa</p>
                </div>
            )}

            {/* Summary */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">{targetProducts.length}</div>
                            <div className="text-xs text-gray-500">Sản phẩm mục tiêu</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-green-600">{
                                targetProducts.reduce((total, targetProduct) => {
                                    return total + (targetProduct.quantity || 0);
                                }, 0)
                            }</div>
                            <div className="text-xs text-gray-500">Tổng số lượng thành phẩm</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-orange-600">{rawMaterials.length}</div>
                            <div className="text-xs text-gray-500">Nguyên liệu</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InventorySlipPage;
