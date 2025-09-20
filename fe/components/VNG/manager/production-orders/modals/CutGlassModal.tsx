'use client';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { ProductionPlanProductDetail, ProductionPlanMaterialProduct } from '@/app/(defaults)/production-plans/service';
import Swal from 'sweetalert2';

// Toast Component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-4 right-4 z-[9999] p-4 rounded-lg shadow-lg max-w-sm ${
            type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    {type === 'success' ? (
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    )}
                    <span className="text-sm font-medium">{message}</span>
                </div>
                <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

interface CutGlassModalProps {
    isOpen: boolean;
    onClose: () => void;
    products: ProductionPlanProductDetail[];
    materialProducts: ProductionPlanMaterialProduct[];
    productionPlanId: number;
    onSave: (data: CutGlassOrderData) => void;
}

interface CutGlassOrderData {
    productionPlanId: number;
    productQuantities: { [productionPlanDetailId: number]: number };
    finishedProducts: FinishedProduct[];
}

interface FinishedProduct {
    productName: string;
    quantity: number;
    sourceProductId?: number;
    outputFor?: number;
}

interface ValidationErrors {
    productQuantities?: string;
    finishedProducts?: string;
    general?: string;
}

const CutGlassModal = ({ isOpen, onClose, products, materialProducts, productionPlanId, onSave }: CutGlassModalProps) => {
    const [productQuantities, setProductQuantities] = useState<{ [productId: number]: number }>({});
    const [finishedProducts, setFinishedProducts] = useState<FinishedProduct[]>([]);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            const initialQuantities: { [productId: number]: number } = {};
            setProductQuantities(initialQuantities);
            setFinishedProducts([]);
            setErrors({});
        }
    }, [isOpen, products]);

    // Validation functions
    const validateProductQuantities = (): boolean => {
        const hasValidQuantity = Object.values(productQuantities).some(qty => qty > 0);
        if (!hasValidQuantity) {
            setErrors(prev => ({ ...prev, productQuantities: 'Vui lòng nhập ít nhất một sản phẩm cần cắt' }));
            return false;
        }
        setErrors(prev => ({ ...prev, productQuantities: undefined }));
        return true;
    };

    const validateFinishedProducts = (): boolean => {
        if (finishedProducts.length === 0) {
            setErrors(prev => ({ ...prev, finishedProducts: 'Vui lòng thêm ít nhất một thành phẩm' }));
            return false;
        }

        for (let i = 0; i < finishedProducts.length; i++) {
            const product = finishedProducts[i];
            if (!product.productName.trim()) {
                setErrors(prev => ({ ...prev, finishedProducts: `Thành phẩm ${i + 1}: Tên sản phẩm không được để trống` }));
                return false;
            }
            if (product.quantity <= 0) {
                setErrors(prev => ({ ...prev, finishedProducts: `Thành phẩm ${i + 1}: Số lượng phải lớn hơn 0` }));
                return false;
            }
        }
        setErrors(prev => ({ ...prev, finishedProducts: undefined }));
        return true;
    };

    // Auto-generate finished products based on selected quantities
    const generateFinishedProducts = (quantities: { [productId: number]: number }) => {
        const newFinishedProducts: FinishedProduct[] = [];
        
        products.forEach((product) => {
            const quantity = quantities[product.id] || 0;
            if (quantity > 0) {
                const materialProduct = materialProducts.find(mp => mp.productName === product.productName);
                
                if (materialProduct) {
                    // Extract dimensions more flexibly
                    const dimensionMatch = materialProduct.productName.match(/(\d+)\*(\d+)/);
                    if (dimensionMatch) {
                        const width = dimensionMatch[1];
                        const height = dimensionMatch[2];
                        const calculatedQuantity = quantity * materialProduct.glassLayers;
                        
                        const finishedProduct: FinishedProduct = {
                            productName: `Kính trắng KT: ${width}*${height}*5 mm`,
                            quantity: calculatedQuantity,
                            sourceProductId: product.id,
                            outputFor: product.id
                        };
                        
                        newFinishedProducts.push(finishedProduct);
                    }
                }
            }
        });
        
        setFinishedProducts(newFinishedProducts);
    };

    const handleProductQuantityChange = (productId: number, value: string) => {
        const numValue = Number(value) || 0;
        
        // Validate quantity limit for "Số lượng cần cắt"
        if (numValue > 9999) {
            Swal.fire({
                title: 'Cảnh báo',
                text: 'Số lượng cần cắt không được vượt quá 9999',
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
        
        // Auto-generate finished products when quantities change
        generateFinishedProducts(newQuantities);
        
        // Clear validation errors when user makes changes
        if (errors.productQuantities) {
            setErrors(prev => ({ ...prev, productQuantities: undefined }));
        }
    };

    const handleFinishedProductChange = (index: number, field: keyof FinishedProduct, value: string | number) => {
        // Validate quantity limit for finished products
        if (field === 'quantity') {
            const numValue = Number(value) || 0;
            if (numValue > 99999) {
                Swal.fire({
                    title: 'Cảnh báo',
                    text: 'Số lượng thành phẩm không được vượt quá 99999',
                    icon: 'warning',
                    toast: true,
                    position: 'bottom-start',
                    showConfirmButton: false,
                    timer: 3000,
                    showCloseButton: true,
                });
                return;
            }
        }
        
        const newFinishedProducts = [...finishedProducts];
        newFinishedProducts[index] = {
            ...newFinishedProducts[index],
            [field]: field === 'quantity' ? Number(value) || 0 : value
        };
        setFinishedProducts(newFinishedProducts);
        
        // Clear validation errors when user makes changes
        if (errors.finishedProducts) {
            setErrors(prev => ({ ...prev, finishedProducts: undefined }));
        }
    };

    const addFinishedProductRow = () => {
        setFinishedProducts([
            ...finishedProducts,
            {
                productName: '',
                quantity: 0
            }
        ]);
    };

    const removeFinishedProductRow = (index: number) => {
        const newFinishedProducts = finishedProducts.filter((_, i) => i !== index);
        setFinishedProducts(newFinishedProducts);
    };

    const handleSave = async () => {
        // Validate before saving
        const isProductQuantitiesValid = validateProductQuantities();
        const isFinishedProductsValid = validateFinishedProducts();

        if (!isProductQuantitiesValid || !isFinishedProductsValid) {
            return;
        }

        setIsLoading(true);
        try {
            const orderData: CutGlassOrderData = {
                productionPlanId,
                productQuantities,
                finishedProducts
            };
            await onSave(orderData);
            setToast({ message: 'Lệnh cắt kính đã được tạo thành công!', type: 'success' });
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            setToast({ message: 'Có lỗi xảy ra khi tạo lệnh cắt kính', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}
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
                                <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700">
                                    <h5 className="font-bold text-lg">Lệnh sản xuất - Cắt kính</h5>
                                    <button onClick={onClose} type="button" className="text-white-dark hover:text-dark">
                                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto p-5">
                                    {/* Error Messages */}
                                    {errors.general && (
                                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                            {errors.general}
                                        </div>
                                    )}

                                    <div className="mb-6">
                                        <h6 className="text-lg font-semibold mb-4">Chọn sản phẩm cần cắt</h6>
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
                                                        <th>Số lượng cần cắt</th>
                                                        <th>Số lớp kính</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {products.map((product, idx) => {
                                                        const materialProduct = materialProducts.find(mp => mp.productName === product.productName);
                                                        const glassLayers = materialProduct?.glassLayers || 0;
                                                        const currentQty = productQuantities[product.id] || 0;
                                                        
                                                        return (
                                                            <tr key={product.id}>
                                                                <td>{idx + 1}</td>
                                                                <td>{product.productName}</td>
                                                                <td>
                                                                    <input
                                                                        type="number"
                                                                        min={0}
                                                                        max={9999}
                                                                        className="form-input w-24"
                                                                        value={currentQty}
                                                                        onChange={e => handleProductQuantityChange(product.id, e.target.value)}
                                                                        placeholder="0"
                                                                    />
                                                                </td>
                                                                <td className="text-center">{glassLayers}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h6 className="text-lg font-semibold">Thành phẩm cắt kính</h6>
                                            <button
                                                type="button"
                                                onClick={addFinishedProductRow}
                                                className="btn btn-sm btn-primary"
                                            >
                                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path d="M12 5v14M5 12h14" />
                                                </svg>
                                                Thêm hàng
                                            </button>
                                        </div>
                                        {errors.finishedProducts && (
                                            <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                                                {errors.finishedProducts}
                                            </div>
                                        )}
                                        <div className="table-responsive">
                                            <table className="table-striped w-full">
                                                <thead>
                                                    <tr>
                                                        <th>STT</th>
                                                        <th>Tên thành phẩm</th>
                                                        <th>Số lượng</th>
                                                        <th>Thao tác</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {finishedProducts.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={4} className="text-center py-4 text-gray-500">
                                                                Chọn sản phẩm cần cắt để tự động tạo thành phẩm
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        finishedProducts.map((product, idx) => {
                                                            const sourceProduct = product.sourceProductId ? products.find(p => p.id === product.sourceProductId) : null;
                                                            const materialProduct = sourceProduct ? materialProducts.find(mp => mp.productName === sourceProduct.productName) : null;
                                                            const sourceQuantity = sourceProduct ? (productQuantities[sourceProduct.id] || 0) : 0;
                                                            const glassLayers = materialProduct?.glassLayers || 0;
                                                            const autoCalculatedQuantity = sourceQuantity * glassLayers;
                                                            const isAutoGenerated = product.sourceProductId !== undefined;
                                                            
                                                            return (
                                                                <tr key={idx} className={isAutoGenerated ? 'bg-blue-50' : ''}>
                                                                    <td>{idx + 1}</td>
                                                                    <td>
                                                                        <input
                                                                            type="text"
                                                                            className="form-input"
                                                                            value={product.productName}
                                                                            onChange={e => handleFinishedProductChange(idx, 'productName', e.target.value)}
                                                                        />
                                                                    </td>
                                                                    <td>
                                                                        <div className="flex items-center gap-2">
                                                                            <input
                                                                                type="number"
                                                                                min={0}
                                                                                max={99999}
                                                                                className="form-input w-24"
                                                                                value={product.quantity}
                                                                                onChange={e => handleFinishedProductChange(idx, 'quantity', e.target.value)}
                                                                            />
                                                                            {isAutoGenerated && (
                                                                                <span className="text-xs text-blue-600">
                                                                                    ({sourceQuantity} × {glassLayers} = {autoCalculatedQuantity})
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeFinishedProductRow(idx)}
                                                                            className="btn btn-sm btn-outline-danger"
                                                                        >
                                                                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                                                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                                                                            </svg>
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex justify-end items-center p-5 border-t border-gray-200 dark:border-gray-700 bg-[#fbfbfb] dark:bg-[#121c2c]">
                                    <button 
                                        onClick={onClose} 
                                        type="button" 
                                        className="btn btn-outline-danger"
                                        disabled={isLoading}
                                    >
                                        Hủy
                                    </button>
                                    <button 
                                        onClick={handleSave} 
                                        type="button" 
                                        className="btn btn-primary ltr:ml-4 rtl:mr-4"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Đang tạo...
                                            </>
                                        ) : (
                                            'Tạo lệnh cắt kính'
                                        )}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
        </>
    );
};

export default CutGlassModal;
