'use client';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { ProductionPlanProductDetail, ProductionPlanMaterialProduct } from '@/app/(defaults)/production-plans/service';

interface PourGlueModalProps {
    isOpen: boolean;
    onClose: () => void;
    products: ProductionPlanProductDetail[];
    materialProducts: ProductionPlanMaterialProduct[];
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

interface MaterialItem {
    id: number;
    name: string;
    quantity: number;
    isEditable?: boolean;
}

const PourGlueModal = ({ isOpen, onClose, products, materialProducts, productionPlanId, onSave }: PourGlueModalProps) => {
    const [productQuantities, setProductQuantities] = useState<{ [productId: number]: number }>({});
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [materialItems, setMaterialItems] = useState<MaterialItem[]>([]);

    // Initialize quantities when modal opens
    useEffect(() => {
        if (isOpen) {
            const initialQuantities: { [productId: number]: number } = {};
            products.forEach((product) => {
                initialQuantities[product.id] = 0;
            });
            setProductQuantities(initialQuantities);
            setSelectedProductId(null);
            setMaterialItems([]);
        }
    }, [isOpen, products]);



    // Update material items when a product is selected
    const updateMaterialItems = (productId: number, quantity: number) => {
        const product = products.find(p => p.id === productId);
        const materialProduct = materialProducts.find(mp => mp.productName === product?.productName);
        
        if (!product || !materialProduct) {
            setMaterialItems([]);
            return;
        }

        const newMaterialItems: MaterialItem[] = [];

        // First material: Product name + "chưa đổ keo"
        newMaterialItems.push({
            id: 1,
            name: `${product.productName} chưa đổ keo`,
            quantity: quantity,
            isEditable: false
        });

        // Second material: Keo Nano or Chất đông keo (Keo Mềm)
        const glueType = product.productName.includes('VNG-N') ? 'Keo Nano' : 'Chất đông keo (Keo Mềm)';
        const glueQuantity = materialProduct.totalGlue || 0;
        
        newMaterialItems.push({
            id: 2,
            name: glueType,
            quantity: glueQuantity,
            isEditable: true
        });

        setMaterialItems(newMaterialItems);
    };

    // Handler for changing quantity in product table
    const handleProductQuantityChange = (productId: number, value: string) => {
        const newQuantities = {
            ...productQuantities,
            [productId]: Number(value),
        };
        setProductQuantities(newQuantities);
        
        // Update material items if this product is selected
        if (selectedProductId === productId) {
            updateMaterialItems(productId, Number(value));
        }
    };

    // Handler for selecting a product to view its materials
    const handleProductSelect = (productId: number) => {
        setSelectedProductId(productId);
        const quantity = productQuantities[productId] || 0;
        updateMaterialItems(productId, quantity);
    };

    // Handler for changing material item quantity
    const handleMaterialQuantityChange = (index: number, value: string) => {
        const newMaterialItems = [...materialItems];
        newMaterialItems[index] = {
            ...newMaterialItems[index],
            quantity: Number(value)
        };
        setMaterialItems(newMaterialItems);
    };

    // Handler for changing material item name
    const handleMaterialNameChange = (index: number, value: string) => {
        const newMaterialItems = [...materialItems];
        newMaterialItems[index] = {
            ...newMaterialItems[index],
            name: value
        };
        setMaterialItems(newMaterialItems);
    };

    // Add new material item row
    const addMaterialItemRow = () => {
        const newId = Math.max(...materialItems.map(item => item.id), 0) + 1;
        setMaterialItems([
            ...materialItems,
            {
                id: newId,
                name: '',
                quantity: 0,
                isEditable: true
            }
        ]);
    };

    // Remove material item row
    const removeMaterialItemRow = (index: number) => {
        const newMaterialItems = materialItems.filter((_, i) => i !== index);
        setMaterialItems(newMaterialItems);
    };

    // Handle save
    const handleSave = () => {
        const orderData: PourGlueOrderData = {
            productionPlanId: productionPlanId,
            productQuantities,
            finishedProducts: []
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
                                        <div className="table-responsive">
                                            <table className="table-striped w-full">
                                                <thead>
                                                    <tr>
                                                        <th>STT</th>
                                                        <th>Tên sản phẩm</th>
                                                        <th>Số lượng cần đổ</th>
                                                        <th>Số lượng đã đổ</th>
                                                        <th>Số lượng còn lại</th>
                                                        <th>Thao tác</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {products.map((product, idx) => {
                                                        const remainingQuantity = product.totalQuantity - product.daDoKeo;
                                                        const selectedQuantity = productQuantities[product.id] || 0;
                                                        const isSelected = selectedProductId === product.id;
                                                        
                                                        return (
                                                            <tr key={product.id} className={isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                                                                <td>{idx + 1}</td>
                                                                <td>{product.productName}</td>
                                                                <td>
                                                                    <input
                                                                        type="number"
                                                                        min={0}
                                                                        max={remainingQuantity}
                                                                        className="form-input w-24"
                                                                        value={productQuantities[product.id] ?? 0}
                                                                        onChange={e => handleProductQuantityChange(product.id, e.target.value)}
                                                                    />
                                                                </td>
                                                                <td className="text-center">{product.daDoKeo}</td>
                                                                <td className="text-center">{remainingQuantity}</td>
                                                                <td>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleProductSelect(product.id)}
                                                                        className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline-primary'}`}
                                                                        disabled={selectedQuantity === 0}
                                                                    >
                                                                        Xem NVL
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Material Items Table - Only show when a product is selected */}
                                    {selectedProductId && (
                                        <div className="mb-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <h6 className="text-lg font-semibold">Nguyên vật liệu</h6>
                                                <button
                                                    type="button"
                                                    onClick={addMaterialItemRow}
                                                    className="btn btn-sm btn-primary"
                                                >
                                                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path d="M12 5v14M5 12h14" />
                                                    </svg>
                                                    Thêm hàng
                                                </button>
                                            </div>
                                            <div className="table-responsive">
                                                <table className="table-striped w-full">
                                                    <thead>
                                                        <tr>
                                                            <th>STT</th>
                                                            <th>Tên NVL</th>
                                                            <th>Số lượng</th>
                                                            <th>Thao tác</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {materialItems.length === 0 ? (
                                                            <tr>
                                                                <td colSpan={4} className="text-center py-4 text-gray-500">
                                                                    Chưa có nguyên vật liệu nào
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            materialItems.map((item, idx) => (
                                                                <tr key={item.id}>
                                                                    <td>{idx + 1}</td>
                                                                    <td>
                                                                        {item.isEditable ? (
                                                                            <input
                                                                                type="text"
                                                                                className="form-input"
                                                                                value={item.name}
                                                                                onChange={e => handleMaterialNameChange(idx, e.target.value)}
                                                                            />
                                                                        ) : (
                                                                            <span>{item.name}</span>
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        {item.isEditable ? (
                                                                            <input
                                                                                type="number"
                                                                                min={0}
                                                                                className="form-input w-24"
                                                                                value={item.quantity}
                                                                                onChange={e => handleMaterialQuantityChange(idx, e.target.value)}
                                                                            />
                                                                        ) : (
                                                                            <span className="text-center">{item.quantity}</span>
                                                                        )}
                                                                    </td>
                                                                    <td>
                                                                        {item.isEditable && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => removeMaterialItemRow(idx)}
                                                                                className="btn btn-sm btn-outline-danger"
                                                                            >
                                                                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                                                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                                                                                </svg>
                                                                            </button>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}


                                </div>
                                
                                {/* Footer - Fixed */}
                                <div className="flex justify-end items-center p-5 border-t border-gray-200 dark:border-gray-700 bg-[#fbfbfb] dark:bg-[#121c2c]">
                                    <button onClick={onClose} type="button" className="btn btn-outline-danger">
                                        Hủy
                                    </button>
                                    <button onClick={handleSave} type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                        Tạo lệnh đổ keo
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