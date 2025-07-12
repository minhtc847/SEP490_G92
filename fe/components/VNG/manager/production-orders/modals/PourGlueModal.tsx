'use client';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { ProductionPlanProductDetail } from '@/app/(defaults)/production-plans/service';

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



const PourGlueModal = ({ isOpen, onClose, products, productionPlanId, onSave }: PourGlueModalProps) => {
    const [productQuantities, setProductQuantities] = useState<{ [productId: number]: number }>({});

    // Initialize quantities when modal opens
    useEffect(() => {
        if (isOpen) {
            const initialQuantities: { [productId: number]: number } = {};
            products.forEach((product) => {
                initialQuantities[product.id] = 0;
            });
            setProductQuantities(initialQuantities);
        }
    }, [isOpen, products]);

    // Handler for changing quantity in product table
    const handleProductQuantityChange = (productId: number, value: string) => {
        const newQuantities = {
            ...productQuantities,
            [productId]: Number(value),
        };
        setProductQuantities(newQuantities);
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
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {products.map((product, idx) => {
                                                        const remainingQuantity = product.totalQuantity - product.daDoKeo;
                                                        
                                                        return (
                                                            <tr key={product.id}>
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
                                                            </tr>
                                                        );
                                                    })}
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