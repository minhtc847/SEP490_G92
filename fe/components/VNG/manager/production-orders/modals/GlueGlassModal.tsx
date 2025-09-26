'use client';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { ProductionPlanProductDetail, ProductionPlanMaterialProduct } from '@/app/(defaults)/production-plans/service';
import Swal from 'sweetalert2';

interface GlueGlassModalProps {
    isOpen: boolean;
    onClose: () => void;
    products: ProductionPlanProductDetail[];
    materialProducts: ProductionPlanMaterialProduct[];
    productionPlanId: number;
    onSave: (data: GlueGlassOrderData) => void;
}

interface GlueGlassOrderData {
    productionPlanId: number;
    productQuantities: { [productionPlanDetailId: number]: number }; // Sử dụng ID của ProductionPlanDetail
    finishedProducts: FinishedProduct[];
}

interface FinishedProduct {
    productName: string;
    quantity: number;
    sourceProductId?: number; // Track which product this finished product comes from
    outputFor?: number; // ID của ProductionPlanDetail mà output này phục vụ
}

interface ValidationErrors {
    productQuantities?: string;
    finishedProducts?: string;
    general?: string;
}

const GlueGlassModal = ({ isOpen, onClose, products, materialProducts, productionPlanId, onSave }: GlueGlassModalProps) => {
    const [productQuantities, setProductQuantities] = useState<{ [productId: number]: number }>({});
    const [finishedProducts, setFinishedProducts] = useState<FinishedProduct[]>([]);
    const [errors, setErrors] = useState<ValidationErrors>({});

    // Initialize quantities when modal opens
    useEffect(() => {
        if (isOpen) {
            const initialQuantities: { [productId: number]: number } = {};
            setProductQuantities(initialQuantities);
            updateFinishedProducts(initialQuantities);
            setErrors({});
        }
    }, [isOpen, products]);

    // Validation
    const validateProductQuantities = (): boolean => {
        const hasValidQuantity = Object.values(productQuantities).some((qty) => qty > 0);
        if (!hasValidQuantity) {
            setErrors((prev) => ({ ...prev, productQuantities: 'Vui lòng nhập ít nhất một sản phẩm cần ghép' }));
            return false;
        }
        setErrors((prev) => ({ ...prev, productQuantities: undefined }));
        return true;
    };

    const validateFinishedProducts = (): boolean => {
        if (finishedProducts.length === 0) {
            setErrors((prev) => ({ ...prev, finishedProducts: 'Vui lòng thêm ít nhất một thành phẩm' }));
            return false;
        }
        for (let i = 0; i < finishedProducts.length; i++) {
            const product = finishedProducts[i];
            if (!product.productName.trim()) {
                setErrors((prev) => ({ ...prev, finishedProducts: `Thành phẩm ${i + 1}: Tên sản phẩm không được để trống` }));
                return false;
            }
            if (product.quantity <= 0) {
                setErrors((prev) => ({ ...prev, finishedProducts: `Thành phẩm ${i + 1}: Số lượng phải lớn hơn 0` }));
                return false;
            }
        }
        setErrors((prev) => ({ ...prev, finishedProducts: undefined }));
        return true;
    };

    // Update finished products when quantities change
    const updateFinishedProducts = (quantities: { [productId: number]: number }) => {
        const newFinishedProducts: FinishedProduct[] = [];
        
        products.forEach((product) => {
            const quantity = quantities[product.id] || 0;
            if (quantity > 0) {
                // Create finished product entry with "chưa đổ keo" suffix
                const finishedProduct: FinishedProduct = {
                    productName: `${product.productName} chưa đổ keo`,
                    quantity: quantity, // Số lượng bằng với số lượng cần ghép
                    sourceProductId: product.id,
                    outputFor: product.id // Set outputFor to the ProductionPlanDetail ID
                };
                
                newFinishedProducts.push(finishedProduct);
            }
        });
        
        setFinishedProducts(newFinishedProducts);
    };

    // Handler for changing quantity in product table
    const handleProductQuantityChange = (productId: number, value: string) => {
        const numValue = Number(value) || 0;
        
        // Validate quantity limit for "Số lượng cần ghép"
        if (numValue > 9999) {
            Swal.fire({
                title: 'Cảnh báo',
                text: 'Số lượng cần ghép không được vượt quá 9999',
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
        updateFinishedProducts(newQuantities);
        if (errors.productQuantities) {
            setErrors((prev) => ({ ...prev, productQuantities: undefined }));
        }
    };

    // Handler for changing finished product data
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
            [field]: field === 'quantity' ? Number(value) : value
        };
        setFinishedProducts(newFinishedProducts);
        if (errors.finishedProducts) {
            setErrors((prev) => ({ ...prev, finishedProducts: undefined }));
        }
    };

    // Add new finished product row
    const addFinishedProductRow = () => {
        setFinishedProducts([
            ...finishedProducts,
            {
                productName: '',
                quantity: 0
            }
        ]);
    };

    // Remove finished product row
    const removeFinishedProductRow = (index: number) => {
        const newFinishedProducts = finishedProducts.filter((_, i) => i !== index);
        setFinishedProducts(newFinishedProducts);
    };

    // Handle save
    const handleSave = () => {
        const isProductQuantitiesValid = validateProductQuantities();
        const isFinishedProductsValid = validateFinishedProducts();

        if (!isProductQuantitiesValid || !isFinishedProductsValid) {
            return;
        }

        const orderData: GlueGlassOrderData = {
            productionPlanId: productionPlanId,
            productQuantities,
            finishedProducts,
        };
        onSave(orderData);
        onClose();
    };

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
                                    <h5 className="font-bold text-lg">Lệnh sản xuất - Ghép kính</h5>
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
                                        <h6 className="text-lg font-semibold mb-4">Chọn sản phẩm cần ghép</h6>
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
                                                        <th>Số lượng cần ghép</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {products.map((product, idx) => {
                                                        const selectedQuantity = productQuantities[product.id] || 0;
                                                        
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
                                                                        value={productQuantities[product.id] ?? 0}
                                                                        onChange={e => handleProductQuantityChange(product.id, e.target.value)}
                                                                    />
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Finished Products Table */}
                                    <div className="mb-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h6 className="text-lg font-semibold">Thành phẩm ghép kính</h6>
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
                                                                Chưa có thành phẩm nào được tạo
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        finishedProducts.map((product, idx) => {
                                                            // Check if this is an auto-generated product
                                                            const isAutoGenerated = product.sourceProductId !== undefined;
                                                            const sourceProduct = isAutoGenerated ? products.find(p => p.id === product.sourceProductId) : null;
                                                            const sourceQuantity = sourceProduct ? (productQuantities[sourceProduct.id] || 0) : 0;
                                                            
                                                            return (
                                                                <tr key={idx}>
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
                                                                                <span className="text-xs text-gray-500">
                                                                                    (Từ: {sourceQuantity})
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
                                
                                {/* Footer - Fixed */}
                                <div className="flex justify-end items-center p-5 border-t border-gray-200 dark:border-gray-700 bg-[#fbfbfb] dark:bg-[#121c2c]">
                                    <button onClick={onClose} type="button" className="btn btn-outline-danger">
                                        Hủy
                                    </button>
                                    <button onClick={handleSave} type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                        Tạo lệnh ghép kính
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

export default GlueGlassModal; 