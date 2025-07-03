'use client';
import { Transition, Dialog, TransitionChild, DialogPanel } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useParams } from 'next/navigation';
import { getProductionOutputs, ProductionOutputDto, getProductionOrderById, ProductionOrderDto, getMaterialsByProductId, addMaterialsForProduct } from './services';

interface ProductParams {
    id: number | null;
    productId: string;
    productName: string;
    productCode: string;
    uom: string;
    amount: string;
    orderId: string;
    costObject: string;
}

interface MaterialParams {
    id: number | null;
    materialType: string;
    quantity: string;
    unit: string;
    note: string;
}

const ProductionOrderDetailPage = () => {
    const { id } = useParams();
    
    // Modal states
    const [addProductModal, setAddProductModal] = useState(false);
    const [addMaterialModal, setAddMaterialModal] = useState(false);
    
    // Loading states
    const [loading, setLoading] = useState(false);
    const [productionOrderLoading, setProductionOrderLoading] = useState(false);

    // Default parameters
    const defaultProductParams: ProductParams = {
        id: null,
        productId: '',
        productName: '',
        productCode: '',
        uom: '',
        amount: '',
        orderId: '',
        costObject: '',
    };

    const defaultMaterialParams: MaterialParams = {
        id: null,
        materialType: '',
        quantity: '',
        unit: '',
        note: '',
    };

    // Form states
    const [productParams, setProductParams] = useState<ProductParams>({ ...defaultProductParams });
    const [materialParams, setMaterialParams] = useState<MaterialParams>({ ...defaultMaterialParams });

    // Data states
    const [productionOutputs, setProductionOutputs] = useState<ProductionOutputDto[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<ProductionOutputDto[]>([]);
    const [filteredMaterials, setFilteredMaterials] = useState<any[]>([]);
    const [productionOrder, setProductionOrder] = useState<ProductionOrderDto | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<ProductionOutputDto | null>(null);
    const [materialsLoading, setMaterialsLoading] = useState(false);

    // Fetch production order details
    useEffect(() => {
        if (!id) return;
        
        const fetchProductionOrder = async () => {
            setProductionOrderLoading(true);
            try {
                const order = await getProductionOrderById(Number(id));
                setProductionOrder(order);
            } catch (error) {
                console.error('Error fetching production order:', error);
                showMessage('Không thể tải thông tin lệnh sản xuất', 'error');
            } finally {
                setProductionOrderLoading(false);
            }
        };

        fetchProductionOrder();
    }, [id]);

    // Fetch production outputs
    useEffect(() => {
        if (!id) return;
        
        const fetchProductionOutputs = async () => {
            setLoading(true);
            try {
                const outputs = await getProductionOutputs(Number(id));
                setProductionOutputs(outputs);
                setFilteredProducts(outputs);
            } catch (error) {
                console.error('Error fetching production outputs:', error);
                showMessage('Không thể tải danh sách thành phẩm', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchProductionOutputs();
    }, [id]);

    // Event handlers
    const changeProductValue = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, id } = e.target;
        setProductParams(prev => ({ ...prev, [id]: value }));
    };

    const changeMaterialValue = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { value, id } = e.target;
        setMaterialParams(prev => ({ ...prev, [id]: value }));
    };

    const saveProduct = () => {
        // Validation
        if (!productParams.productId || !productParams.productName || !productParams.uom || !productParams.amount) {
            showMessage('Vui lòng điền đầy đủ thông tin bắt buộc.', 'error');
            return;
        }

        if (productParams.id) {
            // Update existing product
            const product = filteredProducts.find(p => p.productId === Number(productParams.productId));
            if (product) {
                Object.assign(product, {
                    productionOutputId: Number(productParams.id),
                    productName: productParams.productName,
                    uom: productParams.uom,
                    amount: productParams.amount,
                    orderId: productParams.orderId,
                    costObject: productParams.costObject,
                });
            }
        } else {
            // Add new product
            const maxProductId = filteredProducts.length ? Math.max(...filteredProducts.map(p => p.productId)) : 0;
            const newProduct: ProductionOutputDto = {
                productionOutputId: Number(productParams.productId),
                productId:  Number(productParams.productId),
                productName: productParams.productName,
                productCode: productParams.productCode,
                uom: productParams.uom,
                amount: Number(productParams.amount),
                orderId: Number(productParams.orderId),
                costObject: productParams.costObject,
            };
            setFilteredProducts(prev => [newProduct, ...prev]);
        }

        showMessage('Sản phẩm đã được lưu thành công.');
        setAddProductModal(false);
        resetProductForm();
    };

    const saveMaterial = () => {
        // Validation
        if (!materialParams.materialType || !materialParams.quantity || !materialParams.unit) {
            showMessage('Vui lòng điền đầy đủ thông tin bắt buộc.', 'error');
            return;
        }

        if (materialParams.id) {
            // Update existing material
            const material = filteredMaterials.find(m => m.id === materialParams.id);
            if (material) {
                Object.assign(material, {
                    materialType: materialParams.materialType,
                    quantity: materialParams.quantity,
                    unit: materialParams.unit,
                    note: materialParams.note,
                });
            }
        } else {
            // Add new material
            const maxMaterialId = filteredMaterials.length ? Math.max(...filteredMaterials.map(m => m.id)) : 0;
            const newMaterial = {
                id: maxMaterialId + 1,
                materialType: materialParams.materialType,
                quantity: materialParams.quantity,
                unit: materialParams.unit,
                note: materialParams.note,
            };
            setFilteredMaterials(prev => [newMaterial, ...prev]);
        }

        showMessage('Vật tư đã được lưu thành công.');
        setAddMaterialModal(false);
        resetMaterialForm();
    };

    const editProduct = (product: ProductionOutputDto | null = null) => {
        if (product) {
            setProductParams({
                id: product.productionOutputId,
                productId: product.productId.toString() || '',
                productCode: product.productCode,
                productName: product.productName,
                uom: product.uom,
                amount: product.amount.toString(),
                orderId: product.orderId.toString(),
                costObject: product.costObject,
            });
        } else {
            resetProductForm();
        }
        setAddProductModal(true);
    };

    const editMaterial = (material: any = null) => {
        if (material) {
            setMaterialParams({
                id: material.id,
                materialType: material.materialType,
                quantity: material.quantity,
                unit: material.unit,
                note: material.note,
            });
        } else {
            resetMaterialForm();
        }
        setAddMaterialModal(true);
    };

    const deleteProduct = (product: ProductionOutputDto) => {
        setFilteredProducts(prev => prev.filter(p => p.productId !== product.productId));
        showMessage('Sản phẩm đã được xóa thành công.');
    };

    const deleteMaterial = (material: any) => {
        setFilteredMaterials(prev => prev.filter(m => m.id !== material.id));
        showMessage('Vật tư đã được xóa thành công.');
    };

    const resetProductForm = () => {
        setProductParams({ ...defaultProductParams });
    };

    const resetMaterialForm = () => {
        setMaterialParams({ ...defaultMaterialParams });
    };

    const handleProductSelect = async (product: ProductionOutputDto) => {
        console.log('🔍 Selected product:', product);
        console.log('📊 Product ID:', product.productId);
        console.log('🆔 Production Output ID:', product.productionOutputId);
        
        // Validate that product.productionOutputId exists
        if (!product.productionOutputId) {
            console.error('❌ Production Output ID is missing!');
            showMessage('Sản phẩm không có ID hợp lệ', 'error');
            return;
        }
        
        setSelectedProduct(product);
        setMaterialsLoading(true);
        try {
            console.log('🚀 Calling getMaterialsByProductId with:', { 
                productId: product.productId, 
                productionOutputId: product.productionOutputId 
            });
            const materials = await getMaterialsByProductId(product.productId, product.productionOutputId);
            console.log('✅ Materials received:', materials);
            console.log('📦 Materials count:', materials.length);
            console.log('🔍 Materials structure:', materials[0]);
            setFilteredMaterials(materials);
            console.log('💾 Filtered materials state updated');
        } catch (error) {
            console.error('❌ Error fetching materials:', error);
            showMessage('Không thể tải danh sách nguyên vật liệu', 'error');
            setFilteredMaterials([]);
        } finally {
            setMaterialsLoading(false);
        }
    };

    const handleAddMaterials = async () => {
        if (!selectedProduct) {
            showMessage('Vui lòng chọn một sản phẩm trước', 'error');
            return;
        }

        try {
            setMaterialsLoading(true);
            await addMaterialsForProduct(selectedProduct.productId, selectedProduct.productionOutputId);
            showMessage('Đã thêm materials thành công');
            
            // Refresh materials list
            const materials = await getMaterialsByProductId(selectedProduct.productId, selectedProduct.productionOutputId);
            setFilteredMaterials(materials);
        } catch (error) {
            console.error('Error adding materials:', error);
            showMessage('Không thể thêm materials', 'error');
        } finally {
            setMaterialsLoading(false);
        }
    };

    const showMessage = (msg = '', type: 'success' | 'error' = 'success') => {
        const toast = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            customClass: { container: 'toast' },
        });
        toast.fire({
            icon: type,
            title: msg,
            padding: '10px 20px',
        });
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Nguyên vật liệu sản xuất</h1>
            </div>

            {/* Order Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                    <strong>Mã lệnh sản xuất:</strong> {productionOrderLoading ? 'Đang tải...' : productionOrder?.productionOrderCode || 'N/A'}
                </div>
                <div>
                    <strong>Ngày xuất:</strong> {productionOrderLoading ? 'Đang tải...' : productionOrder?.orderDate ? new Date(productionOrder.orderDate).toLocaleDateString('vi-VN') : 'N/A'}
                </div>
                <div>
                    <strong>Trạng thái:</strong> {productionOrderLoading ? 'Đang tải...' : productionOrder?.productionStatus || 'N/A'}
                </div>
                <div>
                    <strong>Diễn giải:</strong> {productionOrderLoading ? 'Đang tải...' : productionOrder?.description || 'N/A'}
                </div>
                <div>
                    <strong>Tham chiếu:</strong> XK102,NK123,..
                </div>
            </div>

            {/* Products Table */}
            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Danh sách thành phẩm</h2>
                {loading ? (
                    <div className="text-center py-4">Đang tải dữ liệu...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border p-2">STT</th>
                                    <th className="border p-2">Mã thành phẩm</th>
                                    <th className="border p-2">Tên thành phẩm</th>
                                    <th className="border p-2">Đơn vị tính</th>
                                    <th className="border p-2">Số lượng</th>
                                    <th className="border p-2">Đơn đặt hàng</th>
                                    <th className="border p-2">Đối tượng THCP</th>
                                    <th className="border p-2">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product, idx) => (
                                    <tr 
                                        key={product.productId}
                                        className={`cursor-pointer hover:bg-gray-50 ${selectedProduct?.productionOutputId === product.productionOutputId ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                                        onClick={() => handleProductSelect(product)}
                                    >
                                        <td className="border p-2 text-center">{idx + 1}</td>
                                        <td className="border p-2">{product.productCode}</td>
                                        <td className="border p-2">{product.productName}</td>
                                        <td className="border p-2">{product.uom}</td>
                                        <td className="border p-2 text-right">{product.amount}</td>
                                        <td className="border p-2">{product.orderId}</td>
                                        <td className="border p-2">{product.costObject}</td>
                                        <td className="border p-2">
                                            <div className="flex justify-center gap-2">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        editProduct(product);
                                                    }} 
                                                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                                                >
                                                    Sửa
                                                </button>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteProduct(product);
                                                    }} 
                                                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Materials Table */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                        Định mức xuất NVL cho: {selectedProduct ? `${selectedProduct.productName} (${selectedProduct.productCode})` : 'Chưa chọn sản phẩm'}
                    </h2>
                    {selectedProduct && filteredMaterials.length === 0 && (
                        <button
                            onClick={handleAddMaterials}
                            disabled={materialsLoading}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {materialsLoading ? 'Đang thêm...' : 'Thêm Materials'}
                        </button>
                    )}
                </div>
                {!selectedProduct ? (
                    <div className="text-center py-8 text-gray-500">
                        Vui lòng chọn một sản phẩm từ bảng trên để xem nguyên vật liệu
                    </div>
                ) : materialsLoading ? (
                    <div className="text-center py-4">Đang tải dữ liệu nguyên vật liệu...</div>
                ) : filteredMaterials.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">Chưa có dữ liệu nguyên vật liệu cho sản phẩm này</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border p-2">STT</th>
                                    <th className="border p-2">Mã NVL</th>
                                    <th className="border p-2">Tên NVL</th>
                                    <th className="border p-2">Đơn vị</th>
                                    <th className="border p-2">Số lượng</th>
                                    <th className="border p-2">Đối tượng THCP</th>
                                    <th className="border p-2">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMaterials.map((material, idx) => (
                                    <tr key={material.id}>
                                        <td className="border p-2 text-center">{idx + 1}</td>
                                        <td className="border p-2">{material.productionId}</td>
                                        <td className="border p-2">{material.productionName}</td>
                                        <td className="border p-2">{material.uom}</td>
                                        <td className="border p-2 text-right">{material.amount || 0}</td>
                                        <td className="border p-2">{material.costObject || 'N/A'}</td>
                                        <td className="border p-2">
                                            <div className="flex justify-center gap-2">
                                                <button 
                                                    onClick={() => editMaterial(material)} 
                                                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                                                >
                                                    Sửa
                                                </button>
                                                <button 
                                                    onClick={() => deleteMaterial(material)} 
                                                    className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Product Modal */}
            <Transition appear show={addProductModal} as={Fragment}>
                <Dialog as="div" open={addProductModal} onClose={() => setAddProductModal(false)} className="relative z-50">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/30" />
                    </TransitionChild>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <TransitionChild
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                                        {productParams.id ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
                                    </Dialog.Title>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Mã sản phẩm</label>
                                            <input
                                                type="text"
                                                id="productId"
                                                value={productParams.productId}
                                                onChange={changeProductValue}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Tên sản phẩm</label>
                                            <input
                                                type="text"
                                                id="productName"
                                                value={productParams.productName}
                                                onChange={changeProductValue}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Đơn vị tính</label>
                                            <input
                                                type="text"
                                                id="uom"
                                                value={productParams.uom}
                                                onChange={changeProductValue}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Số lượng</label>
                                            <input
                                                type="number"
                                                id="amount"
                                                value={productParams.amount}
                                                onChange={changeProductValue}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Đơn đặt hàng</label>
                                            <input
                                                type="number"
                                                id="orderId"
                                                value={productParams.orderId}
                                                onChange={changeProductValue}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Đối tượng THCP</label>
                                            <input
                                                type="text"
                                                id="costObject"
                                                value={productParams.costObject}
                                                onChange={changeProductValue}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-6 flex justify-end space-x-2">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                                            onClick={() => setAddProductModal(false)}
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                            onClick={saveProduct}
                                        >
                                            Lưu
                                        </button>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Material Modal */}
            <Transition appear show={addMaterialModal} as={Fragment}>
                <Dialog as="div" open={addMaterialModal} onClose={() => setAddMaterialModal(false)} className="relative z-50">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/30" />
                    </TransitionChild>
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <TransitionChild
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                                        {materialParams.id ? 'Sửa vật tư' : 'Thêm vật tư'}
                                    </Dialog.Title>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Loại vật tư</label>
                                            <input
                                                type="text"
                                                id="materialType"
                                                value={materialParams.materialType}
                                                onChange={changeMaterialValue}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Số lượng</label>
                                            <input
                                                type="number"
                                                id="quantity"
                                                value={materialParams.quantity}
                                                onChange={changeMaterialValue}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Đơn vị</label>
                                            <input
                                                type="text"
                                                id="unit"
                                                value={materialParams.unit}
                                                onChange={changeMaterialValue}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
                                            <textarea
                                                id="note"
                                                value={materialParams.note}
                                                onChange={changeMaterialValue}
                                                rows={3}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-6 flex justify-end space-x-2">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                                            onClick={() => setAddMaterialModal(false)}
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                            onClick={saveMaterial}
                                        >
                                            Lưu
                                        </button>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default ProductionOrderDetailPage; 