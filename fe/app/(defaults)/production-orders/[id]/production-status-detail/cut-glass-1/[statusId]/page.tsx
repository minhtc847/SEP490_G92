'use client';
import IconFacebook from '@/components/icon/icon-facebook';
import IconInstagram from '@/components/icon/icon-instagram';
import IconLayoutGrid from '@/components/icon/icon-layout-grid';
import IconLinkedin from '@/components/icon/icon-linkedin';
import IconListCheck from '@/components/icon/icon-list-check';
import IconSearch from '@/components/icon/icon-search';
import IconTwitter from '@/components/icon/icon-twitter';
import IconUser from '@/components/icon/icon-user';
import IconUserPlus from '@/components/icon/icon-user-plus';
import IconX from '@/components/icon/icon-x';
import { Transition, Dialog, TransitionChild, DialogPanel } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const CutGlass1 = () => {
    const [addRawMaterialModal, setAddRawMaterialModal] = useState<any>(false);
    const [addFinishedProductModal, setAddFinishedProductModal] = useState<any>(false);

    const [value, setValue] = useState<any>('list');
    const [defaultRawMaterialParams] = useState({
        id: null,
        height: '',
        width: '',
        quantity: '',
    });

    const [defaultFinishedProductParams] = useState({
        id: null,
        height: '',
        width: '',
        quantity: '',
    });

    const [rawMaterialParams, setRawMaterialParams] = useState<any>(JSON.parse(JSON.stringify(defaultRawMaterialParams)));
    const [finishedProductParams, setFinishedProductParams] = useState<any>(JSON.parse(JSON.stringify(defaultFinishedProductParams)));

    const changeRawMaterialValue = (e: any) => {
        const { value, id } = e.target;
        setRawMaterialParams({ ...rawMaterialParams, [id]: value });
    };

    const changeFinishedProductValue = (e: any) => {
        const { value, id } = e.target;
        setFinishedProductParams({ ...finishedProductParams, [id]: value });
    };

    const [search, setSearch] = useState<any>('');
    const [rawMaterialList] = useState<any>([
        {
            id: 1,
            height: 200,
            width: 100,
            quantity: 50,
        },
        {
            id: 2,
            height: 180,
            width: 120,
            quantity: 30,
        },
        {
            id: 3,
            height: 250,
            width: 150,
            quantity: 20,
        },
    ]);

    const [finishedProductList] = useState<any>([
        {
            id: 1,
            height: 190,
            width: 90,
            quantity: 45,
        },
        {
            id: 2,
            height: 170,
            width: 110,
            quantity: 25,
        },
        {
            id: 3,
            height: 240,
            width: 140,
            quantity: 15,
        },
    ]);

    const [filteredRawMaterials, setFilteredRawMaterials] = useState<any>(rawMaterialList);
    const [filteredFinishedProducts, setFilteredFinishedProducts] = useState<any>(finishedProductList);

    const saveRawMaterial = () => {
        if (!rawMaterialParams.height) {
            showMessage('Chiều cao là bắt buộc.', 'error');
            return true;
        }
        if (!rawMaterialParams.width) {
            showMessage('Chiều rộng là bắt buộc.', 'error');
            return true;
        }
        if (!rawMaterialParams.quantity) {
            showMessage('Số lượng là bắt buộc.', 'error');
            return true;
        }

        if (rawMaterialParams.id) {
            let material: any = filteredRawMaterials.find((d: any) => d.id === rawMaterialParams.id);
            material.height = rawMaterialParams.height;
            material.width = rawMaterialParams.width;
            material.quantity = rawMaterialParams.quantity;
        } else {
            let maxMaterialId = filteredRawMaterials.length ? filteredRawMaterials.reduce((max: any, character: any) => (character.id > max ? character.id : max), filteredRawMaterials[0].id) : 0;

            let material = {
                id: maxMaterialId + 1,
                height: rawMaterialParams.height,
                width: rawMaterialParams.width,
                quantity: rawMaterialParams.quantity,
            };
            filteredRawMaterials.splice(0, 0, material);
        }

        showMessage('Đã lưu nguyên liệu thành công.');
        setAddRawMaterialModal(false);
    };

    const saveFinishedProduct = () => {
        if (!finishedProductParams.height) {
            showMessage('Chiều cao là bắt buộc.', 'error');
            return true;
        }
        if (!finishedProductParams.width) {
            showMessage('Chiều rộng là bắt buộc.', 'error');
            return true;
        }
        if (!finishedProductParams.quantity) {
            showMessage('Số lượng là bắt buộc.', 'error');
            return true;
        }

        if (finishedProductParams.id) {
            let product: any = filteredFinishedProducts.find((d: any) => d.id === finishedProductParams.id);
            product.height = finishedProductParams.height;
            product.width = finishedProductParams.width;
            product.quantity = finishedProductParams.quantity;
        } else {
            let maxProductId = filteredFinishedProducts.length ? filteredFinishedProducts.reduce((max: any, character: any) => (character.id > max ? character.id : max), filteredFinishedProducts[0].id) : 0;

            let product = {
                id: maxProductId + 1,
                height: finishedProductParams.height,
                width: finishedProductParams.width,
                quantity: finishedProductParams.quantity,
            };
            filteredFinishedProducts.splice(0, 0, product);
        }

        showMessage('Đã lưu thành phẩm thành công.');
        setAddFinishedProductModal(false);
    };

    const editRawMaterial = (material: any = null) => {
        const json = JSON.parse(JSON.stringify(defaultRawMaterialParams));
        setRawMaterialParams(json);
        if (material) {
            let json1 = JSON.parse(JSON.stringify(material));
            setRawMaterialParams(json1);
        }
        setAddRawMaterialModal(true);
    };

    const editFinishedProduct = (product: any = null) => {
        const json = JSON.parse(JSON.stringify(defaultFinishedProductParams));
        setFinishedProductParams(json);
        if (product) {
            let json1 = JSON.parse(JSON.stringify(product));
            setFinishedProductParams(json1);
        }
        setAddFinishedProductModal(true);
    };

    const deleteRawMaterial = (material: any = null) => {
        setFilteredRawMaterials(filteredRawMaterials.filter((d: any) => d.id !== material.id));
        showMessage('Đã xóa nguyên liệu thành công.');
    };

    const deleteFinishedProduct = (product: any = null) => {
        setFilteredFinishedProducts(filteredFinishedProducts.filter((d: any) => d.id !== product.id));
        showMessage('Đã xóa thành phẩm thành công.');
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
                <h1 className="text-2xl font-bold">Cắt kính 1</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                    <strong>Mã lệnh sản xuất:</strong> LSX00132
                </div>
                <div>
                    <strong>Ngày xuất:</strong> 14/06/2025
                </div>
                <div>
                    <strong>Diễn giải:</strong> Lệnh cắt kính ngày 14/06/2025
                </div>
                <div>
                    <strong>Tham chiếu:</strong> XK00253
                </div>
                <div>
                    <strong>Tình trạng:</strong> Đang xử lý
                </div>
            </div>

            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Danh sách nguyên liệu</h2>
                <div className="table-responsive mb-6 overflow-x-auto">
                    <table className="w-full border-collapse border text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2">STT</th>
                                <th className="border p-2">Chiều cao (mm)</th>
                                <th className="border p-2">Chiều rộng (mm)</th>
                                <th className="border p-2">Số lượng</th>
                                <th className="border p-2">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRawMaterials.map((material: any, idx: number) => (
                                <tr key={material.id}>
                                    <td className="border p-2 text-center">{idx + 1}</td>
                                    <td className="border p-2 text-right">{material.height}</td>
                                    <td className="border p-2 text-right">{material.width}</td>
                                    <td className="border p-2 text-right">{material.quantity}</td>
                                    <td className="border p-2">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => editRawMaterial(material)} className="px-3 py-1 bg-blue-500 text-white rounded text-sm">
                                                Sửa
                                            </button>
                                            <button onClick={() => deleteRawMaterial(material)} className="px-3 py-1 bg-red-500 text-white rounded text-sm">
                                                Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-end">
                    <button onClick={() => editRawMaterial()} className="px-4 py-2 bg-blue-500 text-white rounded">
                        📝 Thêm nguyên liệu
                    </button>
                </div>
            </div>

            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Danh sách thành phẩm</h2>
                <div className="table-responsive mb-6 overflow-x-auto">
                    <table className="w-full border-collapse border text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2">STT</th>
                                <th className="border p-2">Chiều cao (mm)</th>
                                <th className="border p-2">Chiều rộng (mm)</th>
                                <th className="border p-2">Số lượng</th>
                                <th className="border p-2">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFinishedProducts.map((product: any, idx: number) => (
                                <tr key={product.id}>
                                    <td className="border p-2 text-center">{idx + 1}</td>
                                    <td className="border p-2 text-right">{product.height}</td>
                                    <td className="border p-2 text-right">{product.width}</td>
                                    <td className="border p-2 text-right">{product.quantity}</td>
                                    <td className="border p-2">
                                        <div className="flex justify-center gap-2">
                                            <button onClick={() => editFinishedProduct(product)} className="px-3 py-1 bg-blue-500 text-white rounded text-sm">
                                                Sửa
                                            </button>
                                            <button onClick={() => deleteFinishedProduct(product)} className="px-3 py-1 bg-red-500 text-white rounded text-sm">
                                                Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-end">
                    <button onClick={() => editFinishedProduct()} className="px-4 py-2 bg-blue-500 text-white rounded">
                        📝 Thêm thành phẩm
                    </button>
                </div>
            </div>

            {/* Add Raw Material Modal */}
            <Transition appear show={addRawMaterialModal} as={Fragment}>
                <Dialog as="div" open={addRawMaterialModal} onClose={() => setAddRawMaterialModal(false)} className="relative z-50">
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
                                        {rawMaterialParams.id ? 'Sửa nguyên liệu' : 'Thêm nguyên liệu'}
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Chiều cao (mm)</label>
                                            <input
                                                type="number"
                                                id="height"
                                                value={rawMaterialParams.height}
                                                onChange={changeRawMaterialValue}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Chiều rộng (mm)</label>
                                            <input
                                                type="number"
                                                id="width"
                                                value={rawMaterialParams.width}
                                                onChange={changeRawMaterialValue}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Số lượng</label>
                                            <input
                                                type="number"
                                                id="quantity"
                                                value={rawMaterialParams.quantity}
                                                onChange={changeRawMaterialValue}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-end space-x-2">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                            onClick={() => setAddRawMaterialModal(false)}
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                            onClick={saveRawMaterial}
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

            {/* Add Finished Product Modal */}
            <Transition appear show={addFinishedProductModal} as={Fragment}>
                <Dialog as="div" open={addFinishedProductModal} onClose={() => setAddFinishedProductModal(false)} className="relative z-50">
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
                                        {finishedProductParams.id ? 'Sửa thành phẩm' : 'Thêm thành phẩm'}
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Chiều cao (mm)</label>
                                            <input
                                                type="number"
                                                id="height"
                                                value={finishedProductParams.height}
                                                onChange={changeFinishedProductValue}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Chiều rộng (mm)</label>
                                            <input
                                                type="number"
                                                id="width"
                                                value={finishedProductParams.width}
                                                onChange={changeFinishedProductValue}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Số lượng</label>
                                            <input
                                                type="number"
                                                id="quantity"
                                                value={finishedProductParams.quantity}
                                                onChange={changeFinishedProductValue}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-end space-x-2">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                            onClick={() => setAddFinishedProductModal(false)}
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                            onClick={saveFinishedProduct}
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

export default CutGlass1;
