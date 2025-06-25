'use client';
import { Transition, Dialog, TransitionChild, DialogPanel } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { useParams } from 'next/navigation';
import { getProductionOutputs, ProductionOutputDto, getProductionOrderById, ProductionOrderDto } from './services';

const ChemicalIssuancePage = () => {
    const { id } = useParams();
    const [addProductModal, setAddProductModal] = useState<any>(false);
    const [addMaterialModal, setAddMaterialModal] = useState<any>(false);
    const [loading, setLoading] = useState(false);
    const [productionOrderLoading, setProductionOrderLoading] = useState(false);

    const [value, setValue] = useState<any>('list');
    const [defaultProductParams] = useState({
        id: null,
        productId: '',
        productName: '',
        uom: '',
        amount: '',
        orderId: '',
        costObject: '',
    });

    const [defaultMaterialParams] = useState({
        id: null,
        materialType: '',
        quantity: '',
        unit: '',
        note: '',
    });

    const [productParams, setProductParams] = useState<any>(JSON.parse(JSON.stringify(defaultProductParams)));
    const [materialParams, setMaterialParams] = useState<any>(JSON.parse(JSON.stringify(defaultMaterialParams)));

    // Replace hardcoded product list with API data
    const [productionOutputs, setProductionOutputs] = useState<ProductionOutputDto[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<ProductionOutputDto[]>([]);

    // Add production order state
    const [productionOrder, setProductionOrder] = useState<ProductionOrderDto | null>(null);

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

    // Fetch production outputs on component mount
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

    const changeProductValue = (e: any) => {
        const { value, id } = e.target;
        setProductParams({ ...productParams, [id]: value });
    };

    const changeMaterialValue = (e: any) => {
        const { value, id } = e.target;
        setMaterialParams({ ...materialParams, [id]: value });
    };

    // Remove hardcoded material list - start with empty array
    const [filteredMaterials, setFilteredMaterials] = useState<any[]>([]);

    const saveProduct = () => {
        if (!productParams.productId) {
            showMessage('Product ID is required.', 'error');
            return true;
        }
        if (!productParams.productName) {
            showMessage('Product Name is required.', 'error');
            return true;
        }
        if (!productParams.uom) {
            showMessage('UOM is required.', 'error');
            return true;
        }
        if (!productParams.amount) {
            showMessage('Amount is required.', 'error');
            return true;
        }

        if (productParams.id) {
            //update product
            let product: any = filteredProducts.find((d: ProductionOutputDto) => d.productId === productParams.productId);
            if (product) {
                product.productName = productParams.productName;
                product.uom = productParams.uom;
                product.amount = productParams.amount;
                product.orderId = productParams.orderId;
                product.costObject = productParams.costObject;
            }
        } else {
            //add product
            let maxProductId = filteredProducts.length ? Math.max(...filteredProducts.map((p: ProductionOutputDto) => p.productId)) : 0;

            let product: ProductionOutputDto = {
                productId: maxProductId + 1,
                productName: productParams.productName,
                uom: productParams.uom,
                amount: productParams.amount,
                orderId: productParams.orderId,
                costObject: productParams.costObject,
            };
            filteredProducts.splice(0, 0, product);
        }

        showMessage('Product has been saved successfully.');
        setAddProductModal(false);
    };

    const saveMaterial = () => {
        if (!materialParams.materialType) {
            showMessage('Material Type is required.', 'error');
            return true;
        }
        if (!materialParams.quantity) {
            showMessage('Quantity is required.', 'error');
            return true;
        }
        if (!materialParams.unit) {
            showMessage('Unit is required.', 'error');
            return true;
        }

        if (materialParams.id) {
            //update material
            let material: any = filteredMaterials.find((d: any) => d.id === materialParams.id);
            material.materialType = materialParams.materialType;
            material.quantity = materialParams.quantity;
            material.unit = materialParams.unit;
            material.note = materialParams.note;
        } else {
            //add material
            let maxMaterialId = filteredMaterials.length ? filteredMaterials.reduce((max: any, character: any) => (character.id > max ? character.id : max), filteredMaterials[0].id) : 0;

            let material = {
                id: maxMaterialId + 1,
                materialType: materialParams.materialType,
                quantity: materialParams.quantity,
                unit: materialParams.unit,
                note: materialParams.note,
            };
            filteredMaterials.splice(0, 0, material);
        }

        showMessage('Material has been saved successfully.');
        setAddMaterialModal(false);
    };

    const editProduct = (product: ProductionOutputDto | null = null) => {
        const json = JSON.parse(JSON.stringify(defaultProductParams));
        setProductParams(json);
        if (product) {
            let json1 = JSON.parse(JSON.stringify(product));
            setProductParams(json1);
        }
        setAddProductModal(true);
    };

    const editMaterial = (material: any = null) => {
        const json = JSON.parse(JSON.stringify(defaultMaterialParams));
        setMaterialParams(json);
        if (material) {
            let json1 = JSON.parse(JSON.stringify(material));
            setMaterialParams(json1);
        }
        setAddMaterialModal(true);
    };

    const deleteProduct = (product: ProductionOutputDto | null = null) => {
        if (product) {
            setFilteredProducts(filteredProducts.filter((d: ProductionOutputDto) => d.productId !== product.productId));
            showMessage('Product has been deleted successfully.');
        }
    };

    const deleteMaterial = (material: any = null) => {
        setFilteredMaterials(filteredMaterials.filter((d: any) => d.id !== material.id));
        showMessage('Material has been deleted successfully.');
    };

    const showMessage = (msg = '', type = 'success') => {
        const toast: any = Swal.mixin({
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
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Nguyên vật liệu sản xuất</h1>

            </div>

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

            <div className="mb-6">
                

                <div className="table-responsive mb-6 overflow-x-auto">
                    <h2 className="text-xl font-semibold mb-4">Danh sách thành phẩm</h2>
                    {loading ? (
                        <div className="text-center py-4">Đang tải dữ liệu...</div>
                    ) : (
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
                                {filteredProducts.map((product: ProductionOutputDto, idx: number) => (
                                    <tr key={product.productId}>
                                        <td className="border p-2 text-center">{idx + 1}</td>
                                        <td className="border p-2">{product.productId}</td>
                                        <td className="border p-2">{product.productName}</td>
                                        <td className="border p-2">{product.uom}</td>
                                        <td className="border p-2 text-right">{product.amount}</td>
                                        <td className="border p-2">{product.orderId}</td>
                                        <td className="border p-2">{product.costObject}</td>
                                        <td className="border p-2">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => editProduct(product)} className="px-3 py-1 bg-blue-500 text-white rounded text-sm">
                                                    Sửa
                                                </button>
                                                <button onClick={() => deleteProduct(product)} className="px-3 py-1 bg-red-500 text-white rounded text-sm">
                                                    Xóa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="table-responsive mb-6 overflow-x-auto">
                    <h2 className="text-xl font-semibold mb-4">Định mức xuất NVL cho: productID</h2>
                    {filteredMaterials.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">Chưa có dữ liệu nguyên vật liệu</div>
                    ) : (
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
                                {filteredMaterials.map((material: any, idx: number) => (
                                    <tr key={material.id}>
                                        <td className="border p-2 text-center">{idx + 1}</td>
                                        <td className="border p-2">{material.materialType}</td>
                                        <td className="border p-2 text-right">{material.quantity}</td>
                                        <td className="border p-2">{material.unit}</td>
                                        <td className="border p-2">{material.note}</td>
                                        <td className="border p-2">{material.note}</td>
                                        <td className="border p-2">
                                            <div className="flex justify-center gap-2">
                                                <button onClick={() => editMaterial(material)} className="px-3 py-1 bg-blue-500 text-white rounded text-sm">
                                                    Sửa
                                                </button>
                                                <button onClick={() => deleteMaterial(material)} className="px-3 py-1 bg-red-500 text-white rounded text-sm">
                                                    Xóa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
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
                                    <div className="mt-2">
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Mã sản phẩm</label>
                                            <input
                                                type="text"
                                                id="productId"
                                                value={productParams.productId}
                                                onChange={changeProductValue}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Tên sản phẩm</label>
                                            <input
                                                type="text"
                                                id="productName"
                                                value={productParams.productName}
                                                onChange={changeProductValue}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Đơn vị tính</label>
                                            <input
                                                type="text"
                                                id="uom"
                                                value={productParams.uom}
                                                onChange={changeProductValue}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Số lượng</label>
                                            <input
                                                type="number"
                                                id="amount"
                                                value={productParams.amount}
                                                onChange={changeProductValue}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Đơn đặt hàng</label>
                                            <input
                                                type="number"
                                                id="orderId"
                                                value={productParams.orderId}
                                                onChange={changeProductValue}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div className="mb-4">
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
                                    <div className="mt-4 flex justify-end space-x-2">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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
                                    <div className="mt-2">
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Loại vật tư</label>
                                            <input
                                                type="text"
                                                id="materialType"
                                                value={materialParams.materialType}
                                                onChange={changeMaterialValue}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Số lượng</label>
                                            <input
                                                type="number"
                                                id="quantity"
                                                value={materialParams.quantity}
                                                onChange={changeMaterialValue}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Đơn vị</label>
                                            <input
                                                type="text"
                                                id="unit"
                                                value={materialParams.unit}
                                                onChange={changeMaterialValue}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
                                            <textarea
                                                id="note"
                                                value={materialParams.note}
                                                onChange={changeMaterialValue}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-end space-x-2">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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

export default ChemicalIssuancePage; 