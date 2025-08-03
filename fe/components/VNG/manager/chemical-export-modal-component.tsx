'use client'

import { Fragment, useState, useEffect } from "react"
import { Transition, Dialog, DialogPanel, TransitionChild } from '@headlessui/react';
import IconX from "@/components/icon/icon-x";
import IconPlus from "@/components/icon/icon-plus";
import { 
  chemicalExportService, 
  ChemicalExportProduct, 
  ChemicalExportMaterial, 
  ProductionOrderProductsDto,
  ProductionOutputDto,
  ProductionMaterialDto 
} from "@/services/chemicalExportService";

interface ChemicalExportModalComponentProps {
    productionOrderId: number
    onSuccess: () => void
    isOpen: boolean
    onClose: () => void
}

const ChemicalExportModalComponent: React.FC<ChemicalExportModalComponentProps> = ({ 
    productionOrderId, 
    onSuccess, 
    isOpen, 
    onClose 
}) => {
    const [products, setProducts] = useState<ProductionOrderProductsDto | null>(null);
    const [formProducts, setFormProducts] = useState<ChemicalExportProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const [note, setNote] = useState('');

    const uoms = ['kg', 'm', 'l', 'ml', 'g', 'Tấm'];

    useEffect(() => {
        if (isOpen && productionOrderId) {
            loadProductionOrderProducts();
        }
    }, [isOpen, productionOrderId]);

    const loadProductionOrderProducts = async () => {
        try {
            setLoading(true);
            const data = await chemicalExportService.getProductionOrderProducts(productionOrderId);
            setProducts(data);
            
            // Initialize form products from outputs
            const initialFormProducts: ChemicalExportProduct[] = data.outputs.map(output => ({
                productId: output.productId,
                productName: output.productName || '',
                quantity: 0,
                uom: output.uom || 'kg',
                materials: []
            }));
            
            setFormProducts(initialFormProducts);
        } catch (error) {
            console.error('Error loading production order products:', error);
            alert('Lỗi khi tải thông tin sản phẩm!');
        } finally {
            setLoading(false);
        }
    };

    const handleProductQuantityChange = (index: number, quantity: number) => {
        const newProducts = [...formProducts];
        newProducts[index].quantity = quantity;
        setFormProducts(newProducts);
    };

    const handleProductUOMChange = (index: number, uom: string) => {
        const newProducts = [...formProducts];
        newProducts[index].uom = uom;
        setFormProducts(newProducts);
    };

    const addMaterialToProduct = (productIndex: number) => {
        if (!products) return;

        const newProducts = [...formProducts];
        const newMaterial: ChemicalExportMaterial = {
            productId: 0,
            productName: '',
            quantity: 0,
            uom: 'kg'
        };
        
        newProducts[productIndex].materials.push(newMaterial);
        setFormProducts(newProducts);
    };

    const removeMaterialFromProduct = (productIndex: number, materialIndex: number) => {
        const newProducts = [...formProducts];
        newProducts[productIndex].materials.splice(materialIndex, 1);
        setFormProducts(newProducts);
    };

    const handleMaterialChange = (
        productIndex: number, 
        materialIndex: number, 
        field: keyof ChemicalExportMaterial, 
        value: string | number
    ) => {
        const newProducts = [...formProducts];
        const material = newProducts[productIndex].materials[materialIndex];
        
        if (field === 'quantity') {
            material[field] = Number(value);
        } else {
            material[field] = String(value);
        }
        
        setFormProducts(newProducts);
    };

    const handleMaterialProductSelect = (productIndex: number, materialIndex: number, material: ProductionMaterialDto) => {
        const newProducts = [...formProducts];
        newProducts[productIndex].materials[materialIndex] = {
            productId: material.productId,
            productName: material.productName || '',
            quantity: 0,
            uom: material.uom || 'kg'
        };
        setFormProducts(newProducts);
    };

    const validateForm = (): boolean => {
        // Check if at least one product has quantity > 0
        const hasValidProduct = formProducts.some(product => product.quantity > 0);
        if (!hasValidProduct) {
            alert('Vui lòng nhập số lượng cho ít nhất một sản phẩm!');
            return false;
        }

        // Check if products with quantity > 0 have materials
        for (let i = 0; i < formProducts.length; i++) {
            const product = formProducts[i];
            if (product.quantity > 0 && product.materials.length === 0) {
                alert(`Sản phẩm "${product.productName}" cần có ít nhất một nguyên vật liệu!`);
                return false;
            }

            // Validate materials
            for (let j = 0; j < product.materials.length; j++) {
                const material = product.materials[j];
                if (material.quantity <= 0) {
                    alert(`Vui lòng nhập số lượng cho nguyên vật liệu "${material.productName}"!`);
                    return false;
                }
            }
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            
            // Filter products that have quantity > 0
            const validProducts = formProducts.filter(product => product.quantity > 0);
            
            await chemicalExportService.createChemicalExport({
                productionOrderId,
                products: validProducts,
                note
            });

            alert('Tạo phiếu xuất hóa chất thành công!');
            onClose();
            onSuccess?.();
        } catch (error) {
            console.error('Error creating chemical export:', error);
            alert('Lỗi khi tạo phiếu xuất hóa chất!');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !products) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" open={isOpen} onClose={onClose} className="relative z-50">
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-[black]/60" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center px-4 py-8">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel className="panel w-full max-w-4xl rounded-lg p-5 text-black dark:text-white-dark bg-white dark:bg-[#121c2c] max-h-[90vh] overflow-y-auto">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Tạo phiếu xuất hóa chất</h3>
                                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                                        <IconX />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block mb-1">Ghi chú</label>
                                        <textarea 
                                            className="form-textarea w-full" 
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            placeholder="Nhập ghi chú (tùy chọn)"
                                            rows={2}
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-2 font-medium">Danh sách sản phẩm</label>
                                        {formProducts.map((product, productIndex) => (
                                            <div key={productIndex} className="border p-4 rounded mb-4 bg-gray-50 dark:bg-white/5">
                                                <div className="flex items-center gap-4 mb-3">
                                                    <span className="w-1/3 font-medium">
                                                        {product.productName}
                                                    </span>
                                                    <input
                                                        type="number"
                                                        className="form-input w-1/6"
                                                        min={0}
                                                        value={product.quantity}
                                                        onChange={(e) => handleProductQuantityChange(productIndex, Number(e.target.value))}
                                                        placeholder="Số lượng"
                                                    />
                                                    <select
                                                        className="form-select w-1/6"
                                                        value={product.uom}
                                                        onChange={(e) => handleProductUOMChange(productIndex, e.target.value)}
                                                    >
                                                        {uoms.map((uom) => (
                                                            <option key={uom} value={uom}>
                                                                {uom}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="ml-4">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <label className="text-sm text-gray-600 font-medium">Nguyên vật liệu</label>
                                                        <button
                                                            type="button"
                                                            onClick={() => addMaterialToProduct(productIndex)}
                                                            className="btn btn-sm btn-primary"
                                                        >
                                                            <IconPlus className="w-4 h-4" />
                                                            Thêm NVL
                                                        </button>
                                                    </div>
                                                    
                                                    {product.materials.map((material, materialIndex) => (
                                                        <div key={materialIndex} className="flex items-center gap-2 mb-2 p-2 bg-white dark:bg-gray-800 rounded">
                                                            <select
                                                                className="form-select w-1/3"
                                                                value={material.productId || ''}
                                                                onChange={(e) => {
                                                                    const selectedMaterial = products?.materials.find(m => m.productId === Number(e.target.value));
                                                                    if (selectedMaterial) {
                                                                        handleMaterialProductSelect(productIndex, materialIndex, selectedMaterial);
                                                                    }
                                                                }}
                                                            >
                                                                <option value="">Chọn nguyên vật liệu</option>
                                                                {products?.materials.map((m) => (
                                                                    <option key={m.id} value={m.productId}>
                                                                        {m.productName}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <input
                                                                type="number"
                                                                className="form-input w-1/6"
                                                                min={0}
                                                                value={material.quantity}
                                                                onChange={(e) => handleMaterialChange(productIndex, materialIndex, 'quantity', Number(e.target.value))}
                                                                placeholder="Số lượng"
                                                            />
                                                            <select
                                                                className="form-select w-1/6"
                                                                value={material.uom}
                                                                onChange={(e) => handleMaterialChange(productIndex, materialIndex, 'uom', e.target.value)}
                                                            >
                                                                {uoms.map((uom) => (
                                                                    <option key={uom} value={uom}>
                                                                        {uom}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeMaterialFromProduct(productIndex, materialIndex)}
                                                                className="btn btn-sm btn-outline-danger"
                                                            >
                                                                <IconX className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button 
                                        className="btn btn-outline-danger" 
                                        onClick={onClose}
                                        disabled={loading}
                                    >
                                        Hủy
                                    </button>
                                    <button 
                                        className="btn btn-primary" 
                                        onClick={handleSubmit}
                                        disabled={loading}
                                    >
                                        {loading ? 'Đang tạo...' : 'Tạo phiếu'}
                                    </button>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default ChemicalExportModalComponent; 