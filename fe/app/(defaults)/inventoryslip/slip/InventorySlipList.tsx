'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { InventorySlip, InventorySlipDetail, MaterialOutputMappingDto, fetchInventorySlipById, updateInventorySlip, finalizeInventorySlip, callImportExportInvoice, updateMisaStatus, checkSlipProductsMisaStatus } from '../service';
import InventorySlipForm from './InventorySlipForm';
import MaterialExportSlipForm from './MaterialExportSlipForm';
import Swal from 'sweetalert2';
import IconEye from '@/components/icon/icon-eye';
import IconArrowLeft from '@/components/icon/icon-arrow-left';
import { usePermissions } from '@/hooks/usePermissions';

interface InventorySlipListProps {
    slips: InventorySlip[];
    onRefresh: () => void;
    productionOrderInfo?: any;
}

const InventorySlipList = ({ slips, onRefresh, productionOrderInfo }: InventorySlipListProps) => {
    const [expandedSlips, setExpandedSlips] = useState<Set<number>>(new Set());
    const [expandedMaterials, setExpandedMaterials] = useState<Set<number>>(new Set());
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [selectedSlip, setSelectedSlip] = useState<InventorySlip | null>(null);
    const [updateDescription, setUpdateDescription] = useState('');
    const [updatePayload, setUpdatePayload] = useState<any>(null);
    const [updateType, setUpdateType] = useState<'cut-glass' | 'material-export' | 'other'>('other');
    const [isMisaUpdating, setIsMisaUpdating] = useState(false);

    // Permissions
    const { isProductionStaff } = usePermissions();

    const toggleExpanded = (slipId: number) => {
        const newExpanded = new Set(expandedSlips);
        if (newExpanded.has(slipId)) {
            newExpanded.delete(slipId);
        } else {
            newExpanded.add(slipId);
        }
        setExpandedSlips(newExpanded);
    };

    const toggleMaterialsExpanded = (productionOutputId: number) => {
        const newExpanded = new Set(expandedMaterials);
        if (newExpanded.has(productionOutputId)) {
            newExpanded.delete(productionOutputId);
        } else {
            newExpanded.add(productionOutputId);
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

    const openUpdateModal = async (slip: InventorySlip) => {
        try {
            const fullSlip = await fetchInventorySlipById(slip.id);
            if (!fullSlip) return;
            setSelectedSlip(fullSlip);
            setUpdateDescription(fullSlip.description || '');
            const type = fullSlip.productionOrderType === 'Cắt kính'
                ? 'cut-glass'
                : (['Ghép kính', 'Sản xuất keo', 'Đổ keo'].includes(fullSlip.productionOrderType || '') ? 'material-export' : 'other');
            setUpdateType(type);
            const details = (fullSlip.details || []).map((d, idx) => ({
                productId: d.productId ?? undefined,
                quantity: d.quantity,
                note: d.note,
                sortOrder: typeof (d as any).sortOrder === 'number' ? (d as any).sortOrder : idx,
                productionOutputId: d.productionOutputId ?? undefined,
            }));
            setUpdatePayload({
                productionOrderId: fullSlip.productionOrderId,
                description: fullSlip.description || '',
                details,
                mappings: [],
            });
            setShowUpdateModal(true);
        } catch (e) {
            console.error('Failed to load slip for update', e);
        }
    };

    const submitUpdate = async () => {
        if (!selectedSlip || !updatePayload) return;
        try {
            setUpdating(true);
            const dto = { ...updatePayload, description: updateDescription };
            const result = await updateInventorySlip(selectedSlip.id, dto);
            if (result) {
                setShowUpdateModal(false);
                setSelectedSlip(null);
                onRefresh();
                Swal.fire({
                    title: 'Cập nhật phiếu thành công!',
                    toast: true,
                    position: 'bottom-start',
                    showConfirmButton: false,
                    timer: 2500,
                    showCloseButton: true,
                });
            } else {
                Swal.fire({
                    title: 'Cập nhật phiếu thất bại',
                    icon: 'error',
                    confirmButtonText: 'Đã hiểu',
                });
            }
        } finally {
            setUpdating(false);
        }
    };

    // Mount flag for portal & lock body scroll when modal open
    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (showUpdateModal) {
            document.body.style.overflow = 'hidden';
            const htmlEl = document.documentElement as HTMLElement;
            const bodyEl = document.body as HTMLElement;
            const nextEl = document.getElementById('__next') as HTMLElement | null;

            const prev = {
                htmlTransform: htmlEl.style.transform,
                bodyTransform: bodyEl.style.transform,
                nextTransform: nextEl?.style.transform,
                htmlZoom: (htmlEl.style as any).zoom,
                bodyZoom: (bodyEl.style as any).zoom,
                nextZoom: nextEl ? (nextEl.style as any).zoom : undefined,
            } as any;
            (window as any).__modal_prev_transform__ = prev;

            htmlEl.style.transform = 'none';
            bodyEl.style.transform = 'none';
            if (nextEl) nextEl.style.transform = 'none';
            (htmlEl.style as any).zoom = '';
            (bodyEl.style as any).zoom = '';
            if (nextEl) (nextEl.style as any).zoom = '';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
            const prev = (window as any).__modal_prev_transform__;
            if (prev) {
                const htmlEl = document.documentElement as HTMLElement;
                const bodyEl = document.body as HTMLElement;
                const nextEl = document.getElementById('__next') as HTMLElement | null;
                htmlEl.style.transform = prev.htmlTransform || '';
                bodyEl.style.transform = prev.bodyTransform || '';
                if (nextEl) nextEl.style.transform = prev.nextTransform || '';
                (htmlEl.style as any).zoom = prev.htmlZoom || '';
                (bodyEl.style as any).zoom = prev.bodyZoom || '';
                if (nextEl) (nextEl.style as any).zoom = prev.nextZoom || '';
                (window as any).__modal_prev_transform__ = null;
            }
        };
    }, [showUpdateModal]);

    if (slips.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                Chưa có phiếu kho nào cho lệnh sản xuất này.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {isMisaUpdating && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
                    <div className="bg-white rounded shadow p-4 text-center">
                        <div className="animate-spin inline-block w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full mr-2"></div>
                        <span>Đang đồng bộ MISA, vui lòng không thao tác...</span>
                    </div>
                </div>
            )}
            {slips.map((slip) => (
                <div key={slip.id} className="border rounded-lg overflow-hidden">
                    {/* Slip Header */}
                    <div className="bg-gray-50 p-4 border-b">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-2">
                                    <h4 className="text-lg font-semibold text-blue-600">
                                        {slip.slipCode}
                                    </h4>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200`}>
                                        {getSlipTypeText(slip.productionOrderType)}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <p><strong>Ngày tạo:</strong> {new Date(slip.createdAt).toLocaleDateString()}</p>
                                    <p><strong>Người tạo:</strong> {slip.createdByEmployeeName}</p>
                                    <p><strong>Trạng thái:</strong> 
                                        {slip.isFinalized ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2">
                                                Đã cập nhật số lượng
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 ml-2">
                                                Chưa cập nhật số lượng
                                            </span>
                                        )}
                                    </p>
                                    <p><strong>Misa:</strong> 
                                        {slip.isUpdateMisa ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">
                                                Đã đồng bộ lên Misa
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ml-2">
                                                Chưa đồng bộ lên Misa
                                            </span>
                                        )}
                                    </p>
                                    {slip.description && (
                                        <p><strong>Mô tả:</strong> {slip.description}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => toggleExpanded(slip.id)}
                                    className="px-3 py-1 text-sm border border-blue-300 text-blue-700 bg-white hover:bg-blue-50 rounded-md transition-colors"
                                    title={expandedSlips.has(slip.id) ? 'Thu gọn' : 'Mở rộng'}
                                >
                                    <IconEye className="w-4 h-4" />
                                    {expandedSlips.has(slip.id) ? ' Thu gọn' : ' Chi tiết'}
                                </button>
                                {!slip.isFinalized && (
                                    <button
                                        onClick={() => openUpdateModal(slip)}
                                        className="px-3 py-1 text-sm border border-amber-300 text-amber-700 bg-white hover:bg-amber-50 rounded-md transition-colors"
                                        title="Cập nhật phiếu"
                                    >
                                        Cập nhật
                                    </button>
                                )}
                                {!slip.isFinalized && !isProductionStaff() && (
                                    <button
                                        onClick={async () => {
                                            try {
                                                const { default: Swal } = await import('sweetalert2');
                                                const result = await Swal.fire({
                                                    title: 'Xác nhận cập nhật số lượng',
                                                    text: 'Bạn có chắc chắn muốn cập nhật số lượng sản phẩm từ phiếu này lên kho?',
                                                    icon: 'question',
                                                    showCancelButton: true,
                                                    confirmButtonText: 'Cập nhật',
                                                    cancelButtonText: 'Hủy',
                                                });
                                                
                                                if (result.isConfirmed) {
                                                    try {
                                                        await finalizeInventorySlip(slip.id);
                                                        onRefresh();
                                                        Swal.fire({
                                                            title: 'Cập nhật số lượng thành công!',
                                                            toast: true,
                                                            position: 'bottom-start',
                                                            showConfirmButton: false,
                                                            timer: 3000,
                                                            showCloseButton: true,
                                                        });
                                                    } catch (error) {
                                                        console.error('Error finalizing slip:', error);
                                                        Swal.fire({
                                                            title: 'Lỗi',
                                                            text: 'Không thể cập nhật số lượng. Vui lòng thử lại.',
                                                            icon: 'error',
                                                            confirmButtonText: 'Đã hiểu',
                                                        });
                                                    }
                                                }
                                            } catch (error) {
                                                console.error('Error showing confirmation:', error);
                                            }
                                        }}
                                        className="px-3 py-1 text-sm border border-green-300 text-green-700 bg-white hover:bg-green-50 rounded-md transition-colors"
                                        title="Cập nhật số lượng"
                                    >
                                        Cập nhật số lượng
                                    </button>
                                )}
                                {!slip.isUpdateMisa && !isProductionStaff() && (
                                    <button
                                        onClick={async () => {
                                            try {
                                                const { default: Swal } = await import('sweetalert2');
                                                const result = await Swal.fire({
                                                    title: 'Xác nhận đồng bộ lên Misa',
                                                    text: 'Bạn có chắc chắn muốn đồng bộ phiếu này lên phần mềm Misa?',
                                                    icon: 'question',
                                                    showCancelButton: true,
                                                    confirmButtonText: 'Cập nhật',
                                                    cancelButtonText: 'Hủy',
                                                });
                                                
                                                if (result.isConfirmed) {
                                                    try {
                                                        setIsMisaUpdating(true);
                                                        if (typeof document !== 'undefined') document.body.classList.add('pointer-events-none');
                                                        // Kiểm tra trạng thái MISA của các sản phẩm trước
                                                        const misaCheckResult = await checkSlipProductsMisaStatus(slip.id);
                                                        
                                                        if (!misaCheckResult.success) {
                                                            throw new Error(misaCheckResult.message || 'Không thể kiểm tra trạng thái MISA của sản phẩm');
                                                        }
                                                        
                                                        if (!misaCheckResult.canUpdateMisa) {
                                                            // Hiển thị thông báo lỗi với danh sách sản phẩm chưa update MISA
                                                            const notUpdatedProducts = misaCheckResult.notUpdatedProducts || [];
                                                            const productList = notUpdatedProducts.map((p: any) => {
                                                                const productName = p.ProductName || p.productName || 'Không có tên';
                                                                const productCode = p.ProductCode || p.productCode || 'Không có mã';
                                                                return `${productName} (${productCode})`;
                                                            }).join(', ');
                                                            
                                                            Swal.fire({
                                                                title: 'Không thể đồng bộ MISA',
                                                                text: `Các sản phẩm sau chưa được đồng bộ MISA: ${productList}`,
                                                                icon: 'error',
                                                                confirmButtonText: 'Đã hiểu',
                                                            });
                                                            return;
                                                        }
                                                        
                                                        // Nếu tất cả sản phẩm đã update MISA, tiến hành cập nhật phiếu
                                                        // Gọi API import-export-invoice
                                                        const importExportResult = await callImportExportInvoice(slip.id);
                                                        if (!importExportResult) {
                                                            throw new Error('Không thể gọi API import-export-invoice');
                                                        }
                                                        
                                                        // Cập nhật trạng thái isUpdateMisa
                                                        const updateStatusResult = await updateMisaStatus(slip.id);
                                                        if (!updateStatusResult) {
                                                            throw new Error('Không thể cập nhật trạng thái Misa');
                                                        }
                                                        
                                                        Swal.fire({
                                                            title: 'Đồng bộ lên Misa thành công!',
                                                            toast: true,
                                                            position: 'bottom-start',
                                                            showConfirmButton: false,
                                                            timer: 3000,
                                                            showCloseButton: true,
                                                        });
                                                        
                                                        // Refresh the list to update the status
                                                        onRefresh();
                                                    } catch (error) {
                                                        console.error('Error updating Misa:', error);
                                                        Swal.fire({
                                                            title: 'Lỗi',
                                                            text: 'Không thể đồng bộ lên Misa. Vui lòng thử lại.',
                                                            icon: 'error',
                                                            confirmButtonText: 'Đã hiểu',
                                                        });
                                                    } finally {
                                                        setIsMisaUpdating(false);
                                                        if (typeof document !== 'undefined') document.body.classList.remove('pointer-events-none');
                                                    }
                                                }
                                            } catch (error) {
                                                console.error('Error showing confirmation:', error);
                                            }
                                        }}
                                        disabled={isMisaUpdating}
                                        className={`px-3 py-1 text-sm border rounded-md transition-colors ${isMisaUpdating ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed' : 'border-purple-300 text-purple-700 bg-white hover:bg-purple-50'}`}
                                        title="Đồng bộ Misa"
                                    >
                                        {isMisaUpdating ? 'Đang đồng bộ Misa...' : 'đồng bộ lên Misa'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Slip Details */}
                    {expandedSlips.has(slip.id) && (
                        <div className="p-4">
                            <h5 className="font-medium mb-3">Chi tiết phiếu:</h5>

                            {/* For Cut Glass Slips - Show hierarchical structure */}
                            {slip.productionOrderType === 'Cắt kính' ? (
                                <CutGlassSlipDetails slip={slip} />
                            ) : ['Ghép kính', 'Sản xuất keo', 'Đổ keo'].includes(slip.productionOrderType || '') ? (
                                /* For material export slips - Show grouped structure */
                                <MaterialExportSlipDetails
                                    slip={slip}
                                    expandedMaterials={expandedMaterials}
                                    toggleMaterialsExpanded={toggleMaterialsExpanded}
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
                    )}
                </div>
            ))}
            {isMounted && showUpdateModal && selectedSlip && createPortal(
                <div className="fixed inset-0 z-[1000]">
                    <div className="fixed inset-0 bg-black/50" onClick={() => !updating && setShowUpdateModal(false)} />
                    <div data-modal-root="inventory-update" className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-end items-center rounded-t-lg">
                            <button onClick={() => !updating && setShowUpdateModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full" title="Đóng">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {updateType === 'cut-glass' && productionOrderInfo ? (
                                <div className="">
                                    {/* Reuse InventorySlipForm for cut-glass with initial data */}
                                    <InventorySlipForm
                                        productionOrderInfo={productionOrderInfo}
                                        initialSlip={selectedSlip}
                                        isUpdateMode
                                        onSlipCreated={async (dto: any, mappingInfo?: any) => {
                                            // For update, reuse update API
                                            const success = await updateInventorySlip(selectedSlip.id, dto, mappingInfo);
                                            if (success) {
                                                setShowUpdateModal(false);
                                                setSelectedSlip(null);
                                                onRefresh();
                                                Swal.fire({ title: 'Cập nhật phiếu thành công!', toast: true, position: 'bottom-start', showConfirmButton: false, timer: 2500, showCloseButton: true });
                                            }
                                        }}
                                        onCancel={() => setShowUpdateModal(false)}
                                        onRefreshProductionOrderInfo={onRefresh}
                                    />
                                </div>
                            ) : updateType === 'material-export' && productionOrderInfo ? (
                                <div className="">
                                    {/* Reuse MaterialExportSlipForm for material-export */}
                                    <MaterialExportSlipForm
                                        productionOrderInfo={productionOrderInfo}
                                        initialSlip={selectedSlip}
                                        onSlipCreated={async (dto: any) => {
                                            const success = await updateInventorySlip(selectedSlip.id, dto);
                                            if (success) {
                                                setShowUpdateModal(false);
                                                setSelectedSlip(null);
                                                onRefresh();
                                                Swal.fire({ title: 'Cập nhật phiếu thành công!', toast: true, position: 'bottom-start', showConfirmButton: false, timer: 2500, showCloseButton: true });
                                            }
                                        }}
                                        onCancel={() => setShowUpdateModal(false)}
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                                    <textarea
                                        value={updateDescription}
                                        onChange={(e) => setUpdateDescription(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md resize-vertical"
                                        placeholder="Nhập mô tả phiếu..."
                                        rows={3}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-4 border-t flex justify-end gap-3">
                            {updateType === 'other' && (
                                <button disabled={updating} onClick={submitUpdate} className={`px-4 py-2 rounded-md text-white ${updating ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}>{updating ? 'Đang lưu...' : 'Lưu'}</button>
                            )}
                        </div>
                    </div>
                </div>, document.body)
            }
        </div>
    );
};

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

    // get semi finished products from production outputs
    const semiFinishedProducts = slip.details.filter(detail =>
        detail.productId !== null &&
        (detail.productType === 'Bán thành phẩm' || detail.productType === 'BTP' || detail.productType === 'semi_finished')
    );

    // get waste glass from material_output_mappings
    const wasteGlass = slip.details.filter(detail =>
        detail.productId !== null &&
        (detail.productType === 'Kính dư' || detail.productType === 'Kính')
    );

    const targetProducts = slip.details.filter(detail =>
        detail.productId === null // Thành phẩm mục tiêu
    );

    // Create a mapping from raw material to its output products
    const materialOutputMap = new Map<number, InventorySlipDetail[]>();



    // Use the actual mappings from the backend
    rawMaterials.forEach(material => {
        if (material.outputMappings && material.outputMappings.length > 0) {
            // Use actual mappings if available
            const outputs = material.outputMappings.map(mapping => {
                const outputDetail = [...semiFinishedProducts, ...wasteGlass].find(d => d.id === mapping.outputDetailId);
                return outputDetail;
            }).filter(Boolean) as InventorySlipDetail[];

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
                                                <IconArrowLeft className="w-4 h-4 text-blue-600 rotate-90" />
                                            ) : (
                                                <IconArrowLeft className="w-4 h-4 text-blue-600 -rotate-90" />
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

                                {/* Output Products - Expandable */}
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

                                {/* No Output Products Message */}
                                {isExpanded && outputs.length === 0 && (
                                    <div className="border-t bg-white p-3">
                                        <div className="text-center text-gray-500 text-sm py-4">
                                            Chưa có sản phẩm đầu ra nào được liên kết với nguyên vật liệu này.
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
                    {targetProducts.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm text-gray-700">
                                <strong>🎯 Tổng số lượng thành phẩm sẽ được nhập kho:</strong> {
                                    targetProducts.reduce((total, target) => total + (target.quantity || 0), 0)
                                } cái
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

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
        detail.productId === null // Thành phẩm mục tiêu
    );

    const rawMaterials = slip.details.filter(detail =>
        detail.productId !== null // Nguyên liệu thực
    );

    // Group nguyên liệu by production_output_id (loại bỏ thành phẩm mục tiêu)
    const groupedDetails = rawMaterials.reduce((groups, detail) => {
        const key = detail.productionOutputId || 0;
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(detail);
        return groups;
    }, {} as Record<number, InventorySlipDetail[]>);

    const productionOutputs = rawMaterials
        .filter(d => d.productionOutputId)
        .map(d => d.productionOutputId!)
        .filter((value, index, self) => self.indexOf(value) === index);

    // Helper function to get target product info 
    const getTargetProductInfo = (productionOutputId: number) => {
        const targetProduct = slip.details.find(d =>
            d.productionOutputId === productionOutputId &&
            d.productId === null // Thành phẩm mục tiêu
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

                    // Chỉ hiển thị nếu có nguyên liệu thực
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

                            {/* Materials List - Expandable */}
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

export default InventorySlipList;
