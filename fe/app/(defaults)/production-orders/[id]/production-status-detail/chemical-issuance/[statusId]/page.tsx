'use client';
import IconFacebook from '@/components/icon/icon-facebook';
import IconInstagram from '@/components/icon/icon-instagram';
import IconLayoutGrid from '@/components/icon/icon-layout-grid';
import IconLinkedin from '@/components/icon/icon-linkedin';
import IconListCheck from '@/components/icon/icon-list-check';
import IconTwitter from '@/components/icon/icon-twitter';
import IconUser from '@/components/icon/icon-user';
import IconUserPlus from '@/components/icon/icon-user-plus';
import IconX from '@/components/icon/icon-x';
import { Transition, Dialog, TransitionChild, DialogPanel } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const ChemicalIssuancePage = () => {
    const [addProductModal, setAddProductModal] = useState<any>(false);
    const [addMaterialModal, setAddMaterialModal] = useState<any>(false);

    const [value, setValue] = useState<any>('list');
    const [defaultProductParams] = useState({
        id: null,
        productCode: '',
        thickness: '',
        width: '',
        height: '',
        quantity: '',
        note: '',
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

    const changeProductValue = (e: any) => {
        const { value, id } = e.target;
        setProductParams({ ...productParams, [id]: value });
    };

    const changeMaterialValue = (e: any) => {
        const { value, id } = e.target;
        setMaterialParams({ ...materialParams, [id]: value });
    };

   
    const [productList] = useState<any>([
        {
            id: 1,
            productCode: 'SP001',
            thickness: 10,
            width: 100,
            height: 200,
            quantity: 50,
            note: 'Sản phẩm đặc biệt',
        },
        {
            id: 2,
            productCode: 'SP002',
            thickness: 12,
            width: 120,
            height: 180,
            quantity: 30,
            note: 'Yêu cầu xử lý cẩn thận',
        },
        {
            id: 3,
            productCode: 'SP003',
            thickness: 8,
            width: 150,
            height: 250,
            quantity: 20,
            note: 'Sản phẩm mẫu',
        },
    ]);

    const [materialList] = useState<any>([
        {
            id: 1,
            materialType: 'Chất A',
            quantity: 5,
            unit: 'Lít',
            note: 'Hóa chất',
        },
        {
            id: 2,
            materialType: 'KOH',
            quantity: 3,
            unit: 'Lít',
            note: 'Butyl đen',
        },
        {
            id: 3,
            materialType: 'Spacer',
            quantity: 100,
            unit: 'Mét',
            note: 'Spacer 12mm',
        },
    ]);

    const [filteredProducts, setFilteredProducts] = useState<any>(productList);
    const [filteredMaterials, setFilteredMaterials] = useState<any>(materialList);

    const saveProduct = () => {
        if (!productParams.productCode) {
            showMessage('Product Code is required.', 'error');
            return true;
        }
        if (!productParams.thickness) {
            showMessage('thickness is required.', 'error');
            return true;
        }
        if (!productParams.width) {
            showMessage('width is required.', 'error');
            return true;
        }
        if (!productParams.height) {
            showMessage('height is required.', 'error');
            return true;
        }
        if (!productParams.quantity) {
            showMessage('quantity is required.', 'error');
            return true;
        }

        if (productParams.id) {
            //update product
            let product: any = filteredProducts.find((d: any) => d.id === productParams.id);
            product.productCode = productParams.productCode;
            product.thickness = productParams.thickness;
            product.width = productParams.width;
            product.height = productParams.height;
            product.quantity = productParams.quantity;
            product.note = productParams.note;
        } else {
            //add product
            let maxProductId = filteredProducts.length ? filteredProducts.reduce((max: any, character: any) => (character.id > max ? character.id : max), filteredProducts[0].id) : 0;

            let product = {
                id: maxProductId + 1,
                productCode: productParams.productCode,
                thickness: productParams.thickness,
                width: productParams.width,
                height: productParams.height,
                quantity: productParams.quantity,
                note: productParams.note,
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

    const editProduct = (product: any = null) => {
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

    const deleteProduct = (product: any = null) => {
        setFilteredProducts(filteredProducts.filter((d: any) => d.id !== product.id));
        showMessage('Product has been deleted successfully.');
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
                <h1 className="text-2xl font-bold">Xuất hóa chất</h1>
                <div className="space-x-2">
                    <button onClick={() => editProduct()} className="px-4 py-1 bg-blue-500 text-white rounded">
                        📝 Thêm sản phẩm
                    </button>
                    <button onClick={() => editMaterial()} className="px-4 py-1 bg-green-600 text-white rounded">
                        🧪 Thêm vật tư
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                    <strong>Mã lệnh sản xuất:</strong> LSX0001
                </div>
                <div>
                    <strong>Ngày xuất:</strong> {new Date().toLocaleDateString()}
                </div>
                <div>
                    <strong>Người xuất:</strong> Nguyễn Văn A
                </div>
                <div>
                    <strong>Trạng thái:</strong> Đang xử lý
                </div>
                <div>
                    <strong>Ghi chú:</strong> Xuất hóa chất cho đơn hàng
                </div>
                <div>
                    <strong>Người duyệt:</strong> Trần Văn B
                </div>
            </div>

            <div className="mb-6">
                

                <div className="table-responsive mb-6 overflow-x-auto">
                    <h2 className="text-xl font-semibold mb-4">Danh sách sản phẩm</h2>
                    <table className="w-full border-collapse border text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2">STT</th>
                                <th className="border p-2">Mã sản phẩm</th>
                                <th className="border p-2">Độ dày (mm)</th>
                                <th className="border p-2">Rộng (mm)</th>
                                <th className="border p-2">Cao (mm)</th>
                                <th className="border p-2">Số lượng</th>
                                <th className="border p-2">Ghi chú</th>
                                <th className="border p-2">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product: any, idx: number) => (
                                <tr key={product.id}>
                                    <td className="border p-2 text-center">{idx + 1}</td>
                                    <td className="border p-2">{product.productCode}</td>
                                    <td className="border p-2 text-right">{product.thickness}</td>
                                    <td className="border p-2 text-right">{product.width}</td>
                                    <td className="border p-2 text-right">{product.height}</td>
                                    <td className="border p-2 text-right">{product.quantity}</td>
                                    <td className="border p-2">{product.note}</td>
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
                </div>

                <div className="table-responsive mb-6 overflow-x-auto">
                    <h2 className="text-xl font-semibold mb-4">Danh sách hóa chất</h2>
                    <table className="w-full border-collapse border text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2">STT</th>
                                <th className="border p-2">Loại vật tư</th>
                                <th className="border p-2">Số lượng</th>
                                <th className="border p-2">Đơn vị</th>
                                <th className="border p-2">Ghi chú</th>
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
                                                id="productCode"
                                                value={productParams.productCode}
                                                onChange={changeProductValue}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Độ dày (mm)</label>
                                            <input
                                                type="number"
                                                id="thickness"
                                                value={productParams.thickness}
                                                onChange={changeProductValue}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Rộng (mm)</label>
                                            <input
                                                type="number"
                                                id="width"
                                                value={productParams.width}
                                                onChange={changeProductValue}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Cao (mm)</label>
                                            <input
                                                type="number"
                                                id="height"
                                                value={productParams.height}
                                                onChange={changeProductValue}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Số lượng</label>
                                            <input
                                                type="number"
                                                id="quantity"
                                                value={productParams.quantity}
                                                onChange={changeProductValue}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
                                            <textarea
                                                id="note"
                                                value={productParams.note}
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