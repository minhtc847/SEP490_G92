'use client';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { ProductionPlanProductDetail, ProductionPlanMaterialProduct, fetchProductionPlanMaterialDetail } from '@/app/(defaults)/production-plans/service';
import { createGelOrder, CreateGelOrderDto } from '@/app/(defaults)/production-plans/create/service';
import Swal from 'sweetalert2';

interface PourGlueModalProps {
    isOpen: boolean;
    onClose: () => void;
    products: ProductionPlanProductDetail[];
    productionPlanId: number;
    onSave: (data: PourGlueOrderData) => void;
}

interface PourGlueOrderData {
    productionPlanId: number;
    productQuantities: { [productionPlanDetailId: number]: number };
    finishedProducts: FinishedProduct[];
}

interface FinishedProduct {
    productName: string;
    quantity: number;
    sourceProductId?: number;
}

interface ValidationErrors {
    productQuantities?: string;
    general?: string;
}

// Công thức tính tổng keo
function calculateTotalGlue(width: number, height: number, thickness: number, glass4mm: number, glass5mm: number) {
    // Diện tích keo (m2)
    const areaKeo = ((width - 20) * (height - 20)) / 1_000_000;
    // Độ dày keo
    const doDayKeo = thickness - (glass4mm * 4) - (glass5mm * 5);
    // Tổng keo
    return areaKeo * doDayKeo * 1.2;
}

const PourGlueModal = ({ isOpen, onClose, products, productionPlanId, onSave }: PourGlueModalProps) => {
    const [productQuantities, setProductQuantities] = useState<{ [productId: number]: number }>({});
    const [loading, setLoading] = useState(false);
    const [materialProducts, setMaterialProducts] = useState<ProductionPlanMaterialProduct[]>([]);
    const [errors, setErrors] = useState<ValidationErrors>({});

    // Fetch material details when modal opens
    useEffect(() => {
        if (isOpen && productionPlanId) {
            fetchProductionPlanMaterialDetail(productionPlanId)
                .then((materialDetail) => {
                    setMaterialProducts(materialDetail.products || []);
                })
                .catch(() => {
                    setErrors((prev) => ({ ...prev, general: 'Không tải được dữ liệu vật tư' }));
                });
        }
    }, [isOpen, productionPlanId]);

    // Initialize quantities when modal opens
    useEffect(() => {
        if (isOpen) {
            const initialQuantities: { [productId: number]: number } = {};
            setProductQuantities(initialQuantities);
            setErrors({});
        }
    }, [isOpen, products]);

    // Handler for changing quantity in product table
    const handleProductQuantityChange = (productId: number, value: string) => {
        const numValue = Number(value) || 0;
        
        // Validate quantity limit for "Số lượng cần đổ"
        if (numValue > 99999) {
            Swal.fire({
                title: 'Cảnh báo',
                text: 'Số lượng cần đổ không được vượt quá 99999',
                icon: 'warning',
                toast: true,
                position: 'bottom-start',
                showConfirmButton: false,
                timer: 3000,
                showCloseButton: true,
            });
            return;
        }
        
        const newQuantities = {
            ...productQuantities,
            [productId]: numValue,
        };
        setProductQuantities(newQuantities);
        if (errors.productQuantities) {
            setErrors((prev) => ({ ...prev, productQuantities: undefined }));
        }
    };

    // Calculate total glue needed based on selected products
    const calculateTotalGlueNeeded = () => {
        let totalKeoNano = 0;
        let totalKeoMem = 0;

        products.forEach((product) => {
            const quantity = productQuantities[product.id] || 0;
            if (quantity > 0) {
                // Find corresponding material product to get detailed specs
                const materialProduct = materialProducts.find(mp => mp.productName === product.productName);
                
                if (materialProduct) {
                    const gluePerUnit = calculateTotalGlue(
                        parseFloat(materialProduct.width) || 0,
                        parseFloat(materialProduct.height) || 0,
                        materialProduct.thickness,
                        materialProduct.glass4mm,
                        materialProduct.glass5mm
                    );
                    const totalGlueForProduct = gluePerUnit * quantity;

                    // Phân loại theo adhesive type
                    if (materialProduct.adhesiveType?.toLowerCase() === 'nano') {
                        totalKeoNano += totalGlueForProduct;
                    } else if (materialProduct.adhesiveType?.toLowerCase() === 'mềm') {
                        totalKeoMem += totalGlueForProduct;
                    }
                }
            }
        });

        return { totalKeoNano, totalKeoMem };
    };

    // Handle save - Create both gel order and pour glue order
    const handleSave = async () => {
        const hasValidQuantity = Object.values(productQuantities).some((qty) => qty > 0);
        if (!hasValidQuantity) {
            setErrors((prev) => ({ ...prev, productQuantities: 'Vui lòng nhập ít nhất một sản phẩm cần đổ' }));
            return;
        }

        setLoading(true);
        try {
            const { totalKeoNano, totalKeoMem } = calculateTotalGlueNeeded();

            // 1. Create Gel Order (Lệnh sản xuất keo)
            if (totalKeoNano > 0 || totalKeoMem > 0) {
                const gelOrderData: CreateGelOrderDto = {
                    productionPlanId: productionPlanId,
                    productQuantities: productQuantities,
                    totalKeoNano: totalKeoNano,
                    totalKeoMem: totalKeoMem
                };

                await createGelOrder(gelOrderData);
            }

            // 2. Create Pour Glue Order (Lệnh đổ keo)
            const orderData: PourGlueOrderData = {
                productionPlanId: productionPlanId,
                productQuantities,
                finishedProducts: []
            };
            onSave(orderData);
            onClose();
        } catch (error) {
            setErrors((prev) => ({ ...prev, general: 'Có lỗi xảy ra khi tạo lệnh sản xuất!' }));
        } finally {
            setLoading(false);
        }
    };

    const { totalKeoNano, totalKeoMem } = calculateTotalGlueNeeded();

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" open={isOpen} onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0" />
                </Transition.Child>
                <div className="fixed inset-0 bg-[black]/60 z-[999]">
                    <div className="flex items-start justify-center min-h-screen px-4 py-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-6xl max-h-[90vh] flex flex-col text-black dark:text-white-dark">
                                {/* Header - Fixed */}
                                <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700">
                                    <h5 className="font-bold text-lg">Lệnh sản xuất - Đổ keo</h5>
                                    <button onClick={onClose} type="button" className="text-white-dark hover:text-dark">
                                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                
                                {/* Content - Scrollable */}
                                <div className="flex-1 overflow-y-auto p-5">
                                    {/* Product Selection Table */}
                                    <div className="mb-6">
                                        <h6 className="text-lg font-semibold mb-4">Thành phẩm cần đổ keo</h6>
                                        {errors.productQuantities && (
                                            <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                                                {errors.productQuantities}
                                            </div>
                                        )}
                                        <div className="table-responsive">
                                            <table className="table-striped w-full">
                                                <thead>
                                                    <tr>
                                                        <th>STT</th>
                                                        <th>Tên sản phẩm</th>
                                                        <th>Loại keo</th>
                                                        <th>Tổng keo (kg)</th>
                                                        <th>Số lượng cần đổ</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {products.map((product, idx) => {
                                                        //const remainingQuantity = product.totalQuantity - product.daDoKeo;
                                                        const materialProduct = materialProducts.find(mp => mp.productName === product.productName);
                                                        const totalGlue = materialProduct?.totalGlue || 0;
                                                        
                                                        return (
                                                            <tr key={product.id}>
                                                                <td>{idx + 1}</td>
                                                                <td>{product.productName}</td>
                                                                <td className="text-center">{materialProduct?.adhesiveType || 'N/A'}</td>
                                                                <td className="text-center">{totalGlue.toFixed(2)}</td>
                                                                <td>
                                                                    <input
                                                                        type="number"
                                                                        min={0}
                                                                        max={99999}
                                                                        className="form-input w-24"
                                                                        value={productQuantities[product.id] ?? 0}
                                                                        onChange={e => handleProductQuantityChange(product.id, e.target.value)}
                                                                    />
                                                                </td>
                                                                {/* <td className="text-center">{product.daDoKeo}</td>
                                                                <td className="text-center">{remainingQuantity}</td> */}
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Glue Summary */}
                                    {(totalKeoNano > 0 || totalKeoMem > 0) && (
                                        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <h6 className="text-lg font-semibold mb-3">Tổng hợp keo cần sản xuất</h6>
                                            <div className="grid grid-cols-2 gap-4">
                                                {totalKeoNano > 0 && (
                                                    <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                                                        <span className="font-medium">Keo Nano:</span>
                                                        <span className="font-bold">{totalKeoNano.toFixed(2)} kg</span>
                                                    </div>
                                                )}
                                                {totalKeoMem > 0 && (
                                                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
                                                        <span className="font-medium">Keo Mềm:</span>
                                                        <span className="font-bold">{totalKeoMem.toFixed(2)} kg</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                                                * Hệ thống sẽ tạo lệnh sản xuất keo trước, sau đó tạo lệnh đổ keo
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Footer - Fixed */}
                                <div className="flex justify-end items-center p-5 border-t border-gray-200 dark:border-gray-700 bg-[#fbfbfb] dark:bg-[#121c2c]">
                                    <button onClick={onClose} type="button" className="btn btn-outline-danger" disabled={loading}>
                                        Hủy
                                    </button>
                                    <button 
                                        onClick={handleSave} 
                                        type="button" 
                                        className="btn btn-primary ltr:ml-4 rtl:mr-4"
                                        disabled={loading}
                                    >
                                        {loading ? 'Đang tạo lệnh...' : 'Tạo lệnh đổ keo'}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default PourGlueModal; 