'use client';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useRouter, useParams } from 'next/navigation';
import { fetchProductionOrderInfo, ProductionOrderInfo, createMaterialExportSlip } from '../../service';
import MaterialExportSlipForm from './MaterialExportSlipForm';

const MaterialExportSlipPage = () => {
    const MySwal = withReactContent(Swal);
    const router = useRouter();
    const params = useParams();
    const [productionOrderInfo, setProductionOrderInfo] = useState<ProductionOrderInfo | null>(null);
    const [loading, setLoading] = useState(false);

    const productionOrderId = parseInt(params?.productionOrderId as string || '0');

    useEffect(() => {
        if (!productionOrderId || isNaN(productionOrderId)) {
            MySwal.fire({
                title: 'ID lệnh sản xuất không hợp lệ',
                toast: true,
                position: 'bottom-start',
                showConfirmButton: false,
                timer: 3000,
                showCloseButton: true,
            });
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
                // Kiểm tra loại lệnh sản xuất có phải là "Ghép kính", "Sản xuất keo" hoặc "Đổ keo" không
                if (!['Ghép kính', 'Sản xuất keo', 'Đổ keo'].includes(info.type)) {
                    MySwal.fire({
                        title: 'Lệnh sản xuất này không phải là loại "Ghép kính", "Sản xuất keo" hoặc "Đổ keo"',
                        toast: true,
                        position: 'bottom-start',
                        showConfirmButton: false,
                        timer: 3000,
                        showCloseButton: true,
                    });
                    router.push(`/inventoryslip/${productionOrderId}`);
                    return;
                }
                setProductionOrderInfo(info);
            } else {
                MySwal.fire({
                    title: 'Không tìm thấy thông tin lệnh sản xuất',
                    toast: true,
                    position: 'bottom-start',
                    showConfirmButton: false,
                    timer: 3000,
                    showCloseButton: true,
                });
                router.push('/inventoryslip');
            }
        } catch (error) {
            console.error('Error loading production order info:', error);
            MySwal.fire({
                title: 'Có lỗi xảy ra khi tải thông tin lệnh sản xuất',
                toast: true,
                position: 'bottom-start',
                showConfirmButton: false,
                timer: 3000,
                showCloseButton: true,
            });
            router.push('/inventoryslip');
        } finally {
            setLoading(false);
        }
    };

    const handleSlipCreated = async (formData: any) => {
        try {
            // Create the slip using the service
            const createdSlip = await createMaterialExportSlip(formData);
            
            if (!createdSlip) {
                throw new Error('Failed to create slip');
            }

            const slipTypeText = productionOrderInfo?.type === 'Ghép kính' 
                ? 'phiếu xuất keo butyl' 
                : 'phiếu xuất hóa chất';
            
            MySwal.fire({
                title: `Tạo ${slipTypeText} thành công!`,
                toast: true,
                position: 'bottom-start',
                showConfirmButton: false,
                timer: 3000,
                showCloseButton: true,
            });
            router.push(`/inventoryslip/${productionOrderId}`);
        } catch (error) {
            console.error('Error creating slip:', error);
            if (error instanceof Error) {
                MySwal.fire({
                    title: `Có lỗi xảy ra khi tạo phiếu: ${error.message}`,
                    toast: true,
                    position: 'bottom-start',
                    showConfirmButton: false,
                    timer: 3000,
                    showCloseButton: true,
                });
            } else {
                MySwal.fire({
                    title: 'Có lỗi xảy ra khi tạo phiếu',
                    toast: true,
                    position: 'bottom-start',
                    showConfirmButton: false,
                    timer: 3000,
                    showCloseButton: true,
                });
            }
        }
    };

    const handleCancel = () => {
        router.push(`/inventoryslip/${productionOrderId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!productionOrderInfo) {
        return (
            <div className="text-center py-8">
                <h2 className="text-xl text-red-500">Không tìm thấy thông tin lệnh sản xuất</h2>
                <button
                    onClick={() => router.push('/inventoryslip')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mt-4"
                >
                    Quay lại danh sách
                </button>
            </div>
        );
    }

    const getSlipTypeText = () => {
        switch (productionOrderInfo.type) {
            case 'Ghép kính': return 'Phiếu xuất keo butyl';
            case 'Sản xuất keo':
            case 'Đổ keo': return 'Phiếu xuất hóa chất';
            default: return 'Phiếu xuất vật liệu';
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Tạo {getSlipTypeText()}</h1>
                <div className="text-gray-600">
                    <p><strong>Lệnh sản xuất:</strong> {productionOrderInfo.productionOrderCode}</p>
                    <p><strong>Loại:</strong> {productionOrderInfo.type}</p>
                    <p><strong>Mô tả:</strong> {productionOrderInfo.description || 'Không có mô tả'}</p>
                </div>
            </div>

            <div className="bg-white border rounded-lg shadow-sm p-6">
                <MaterialExportSlipForm
                    productionOrderInfo={productionOrderInfo}
                    onSlipCreated={handleSlipCreated}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    );
};

export default MaterialExportSlipPage;
