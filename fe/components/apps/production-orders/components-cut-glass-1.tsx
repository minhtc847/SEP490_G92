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

const ComponentsCutGlass1 = () => {
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
            showMessage('Height is required.', 'error');
            return true;
        }
        if (!rawMaterialParams.width) {
            showMessage('Width is required.', 'error');
            return true;
        }
        if (!rawMaterialParams.quantity) {
            showMessage('Quantity is required.', 'error');
            return true;
        }

        if (rawMaterialParams.id) {
            //update raw material
            let material: any = filteredRawMaterials.find((d: any) => d.id === rawMaterialParams.id);
            material.height = rawMaterialParams.height;
            material.width = rawMaterialParams.width;
            material.quantity = rawMaterialParams.quantity;
        } else {
            //add raw material
            let maxMaterialId = filteredRawMaterials.length ? filteredRawMaterials.reduce((max: any, character: any) => (character.id > max ? character.id : max), filteredRawMaterials[0].id) : 0;

            let material = {
                id: maxMaterialId + 1,
                height: rawMaterialParams.height,
                width: rawMaterialParams.width,
                quantity: rawMaterialParams.quantity,
            };
            filteredRawMaterials.splice(0, 0, material);
        }

        showMessage('Raw Material has been saved successfully.');
        setAddRawMaterialModal(false);
    };

    const saveFinishedProduct = () => {
        if (!finishedProductParams.height) {
            showMessage('Height is required.', 'error');
            return true;
        }
        if (!finishedProductParams.width) {
            showMessage('Width is required.', 'error');
            return true;
        }
        if (!finishedProductParams.quantity) {
            showMessage('Quantity is required.', 'error');
            return true;
        }

        if (finishedProductParams.id) {
            //update finished product
            let product: any = filteredFinishedProducts.find((d: any) => d.id === finishedProductParams.id);
            product.height = finishedProductParams.height;
            product.width = finishedProductParams.width;
            product.quantity = finishedProductParams.quantity;
        } else {
            //add finished product
            let maxProductId = filteredFinishedProducts.length ? filteredFinishedProducts.reduce((max: any, character: any) => (character.id > max ? character.id : max), filteredFinishedProducts[0].id) : 0;

            let product = {
                id: maxProductId + 1,
                height: finishedProductParams.height,
                width: finishedProductParams.width,
                quantity: finishedProductParams.quantity,
            };
            filteredFinishedProducts.splice(0, 0, product);
        }

        showMessage('Finished Product has been saved successfully.');
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
        showMessage('Raw Material has been deleted successfully.');
    };

    const deleteFinishedProduct = (product: any = null) => {
        setFilteredFinishedProducts(filteredFinishedProducts.filter((d: any) => d.id !== product.id));
        showMessage('Finished Product has been deleted successfully.');
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
        <div>
            <div className="rounded bg-blue-100 p-6 shadow">
                <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex-1 min-w-[250px]">
                        <label className="block mb-1 font-medium">Diễn giải</label>
                        <textarea
                            className="w-full rounded border px-3 py-2 shadow resize-none"
                            rows={2}
                            defaultValue="Lệnh cắt kính ngày 14/06/2025"
                        />
                        <div>
                            <label className="block mb-1 font-medium">Đơn hàng</label>
                            <input
                                type="text"
                                value="ĐH00132"
                                className="w-full rounded border px-3 py-2 shadow bg-gray-100"
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Khách hàng</label>
                            <input
                                type="text"
                                value="Công ty TNHH Thương mại và Dịch vụ Vũ Hưng"
                                className="w-full rounded border px-3 py-2 shadow bg-gray-100"
                                readOnly
                            />
                        </div>
                        <div className="mt-2">
                            <span className="font-medium">Tham chiếu: </span>
                            <a href="#" className="text-blue-600 hover:underline">XK00253</a>,{' '}
                            <a href="#" className="text-blue-600 hover:underline">NK0000135</a>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div>
                            <label className="block mb-1 font-medium">Ngày</label>
                            <input
                                type="date"
                                defaultValue="2025-06-13"
                                className="w-full rounded border px-3 py-2 shadow"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Số lệnh</label>
                            <input
                                type="text"
                                value="LSX00132"
                                className="w-full rounded border px-3 py-2 shadow bg-gray-100"
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Tình trạng</label>
                            <select className="w-full rounded border px-3 py-2 shadow">
                                <option>Hoàn thành</option>
                                <option>Chưa xong</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {value === 'list' && (
                <>
                    <div className="panel mt-5 overflow-hidden border-0 p-0">
                        <h2 className="text-xl font-bold mb-4">Bảng nguyên liệu</h2>
                        <div className="table-responsive">
                            <table className="table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>Chiều cao</th>
                                        <th>Chiều rộng</th>
                                        <th>Số lượng</th>
                                        <th className="!text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRawMaterials.map((material: any) => {
                                        return (
                                            <tr key={material.id}>
                                                <td>{material.id}</td>
                                                <td>{material.height}</td>
                                                <td>{material.width}</td>
                                                <td>{material.quantity}</td>
                                                <td>
                                                    <div className="flex items-center justify-center gap-4">
                                                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => editRawMaterial(material)}>
                                                            Edit
                                                        </button>
                                                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => deleteRawMaterial(material)}>
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="panel mt-5 overflow-hidden border-0 p-0">
                        <h2 className="text-xl font-bold mb-4">Bảng thành phẩm</h2>
                        <div className="table-responsive">
                            <table className="table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>Chiều cao</th>
                                        <th>Chiều rộng</th>
                                        <th>Số lượng</th>
                                        <th className="!text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredFinishedProducts.map((product: any) => {
                                        return (
                                            <tr key={product.id}>
                                                <td>{product.id}</td>
                                                <td>{product.height}</td>
                                                <td>{product.width}</td>
                                                <td>{product.quantity}</td>
                                                <td>
                                                    <div className="flex items-center justify-center gap-4">
                                                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => editFinishedProduct(product)}>
                                                            Edit
                                                        </button>
                                                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => deleteFinishedProduct(product)}>
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            <Transition appear show={addRawMaterialModal} as={Fragment}>
                <Dialog as="div" open={addRawMaterialModal} onClose={() => setAddRawMaterialModal(false)} className="relative z-50">
                    <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
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
                                <DialogPanel className="panel w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <button
                                        type="button"
                                        onClick={() => setAddRawMaterialModal(false)}
                                        className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                    >
                                        <IconX />
                                    </button>
                                    <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                                        {rawMaterialParams.id ? 'Edit Raw Material' : 'Add Raw Material'}
                                    </div>
                                    <div className="p-5">
                                        <form>
                                            <div className="mb-5">
                                                <label htmlFor="height">Height</label>
                                                <input id="height" type="text" placeholder="Enter Height" className="form-input" value={rawMaterialParams.height} onChange={(e) => changeRawMaterialValue(e)} />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="width">Width</label>
                                                <input id="width" type="text" placeholder="Enter Width" className="form-input" value={rawMaterialParams.width} onChange={(e) => changeRawMaterialValue(e)} />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="quantity">Quantity</label>
                                                <input id="quantity" type="text" placeholder="Enter Quantity" className="form-input" value={rawMaterialParams.quantity} onChange={(e) => changeRawMaterialValue(e)} />
                                            </div>
                                            <div className="mt-8 flex items-center justify-end">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setAddRawMaterialModal(false)}>
                                                    Cancel
                                                </button>
                                                <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={saveRawMaterial}>
                                                    {rawMaterialParams.id ? 'Update' : 'Add'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            <Transition appear show={addFinishedProductModal} as={Fragment}>
                <Dialog as="div" open={addFinishedProductModal} onClose={() => setAddFinishedProductModal(false)} className="relative z-50">
                    <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
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
                                <DialogPanel className="panel w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                    <button
                                        type="button"
                                        onClick={() => setAddFinishedProductModal(false)}
                                        className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                    >
                                        <IconX />
                                    </button>
                                    <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                                        {finishedProductParams.id ? 'Edit Finished Product' : 'Add Finished Product'}
                                    </div>
                                    <div className="p-5">
                                        <form>
                                            <div className="mb-5">
                                                <label htmlFor="height">Height</label>
                                                <input id="height" type="text" placeholder="Enter Height" className="form-input" value={finishedProductParams.height} onChange={(e) => changeFinishedProductValue(e)} />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="width">Width</label>
                                                <input id="width" type="text" placeholder="Enter Width" className="form-input" value={finishedProductParams.width} onChange={(e) => changeFinishedProductValue(e)} />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="quantity">Quantity</label>
                                                <input id="quantity" type="text" placeholder="Enter Quantity" className="form-input" value={finishedProductParams.quantity} onChange={(e) => changeFinishedProductValue(e)} />
                                            </div>
                                            <div className="mt-8 flex items-center justify-end">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setAddFinishedProductModal(false)}>
                                                    Cancel
                                                </button>
                                                <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={saveFinishedProduct}>
                                                    {finishedProductParams.id ? 'Update' : 'Add'}
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            <div className="flex flex-wrap gap-4 mt-5">
                <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
                    <div className="flex gap-3">
                        <div>
                            <button type="button" className="btn btn-primary" onClick={() => editRawMaterial()}>
                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                Thêm nguyên liệu
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
                    <div className="flex gap-3">
                        <div>
                            <button type="button" className="btn btn-primary" onClick={() => editFinishedProduct()}>
                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                Thêm thành phẩm
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComponentsCutGlass1;
