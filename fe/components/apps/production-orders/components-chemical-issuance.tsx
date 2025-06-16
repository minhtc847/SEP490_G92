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

const ComponentsChemicalIssuance = () => {
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

    const [search, setSearch] = useState<any>('');
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
        <div>
            <div className="rounded bg-blue-100 p-6 shadow">
                <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex-1 min-w-[250px]">
                        {/* <h2 className="text-2xl font-bold mb-3">Lệnh sản xuất LSX00132</h2> */}
                        <label className="block mb-1 font-medium">Diễn giải</label>
                        <textarea
                            className="w-full rounded border px-3 py-2 shadow resize-none"
                            rows={2}
                            defaultValue="Lệnh xuất hóa chất ngày 14/06/2025"
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
                        <div className="table-responsive">
                            <table className="table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>Loại NVL</th>
                                        <th>Số lượng</th>
                                        <th>Đơn vị tính</th>
                                        <th>Ghi chú</th>
                                        <th className="!text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMaterials.map((material: any) => {
                                        return (
                                            <tr key={material.id}>
                                                <td>{material.id}</td>
                                                <td>{material.materialType}</td>
                                                <td className="whitespace-nowrap">{material.quantity}</td>
                                                <td className="whitespace-nowrap">{material.unit}</td>
                                                <td className="whitespace-nowrap">{material.note}</td>
                                                <td>
                                                    <div className="flex items-center justify-center gap-4">
                                                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => editMaterial(material)}>
                                                            Edit
                                                        </button>
                                                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => deleteMaterial(material)}>
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
                        <div className="table-responsive">
                            <table className="table-striped table-hover">
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>Mã sản phẩm</th>
                                        <th>Độ dày</th>
                                        <th>Rộng</th>
                                        <th>Cao</th>
                                        <th>Số lượng</th>
                                        <th>Ghi chú</th>
                                        <th className="!text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map((product: any) => {
                                        return (
                                            <tr key={product.id}>
                                                <td>{product.id}</td>
                                                <td>{product.productCode}</td>
                                                <td className="whitespace-nowrap">{product.thickness}</td>
                                                <td className="whitespace-nowrap">{product.width}</td>
                                                <td className="whitespace-nowrap">{product.height}</td>
                                                <td className="whitespace-nowrap">{product.quantity}</td>
                                                <td className="whitespace-nowrap">{product.note}</td>
                                                <td>
                                                    <div className="flex items-center justify-center gap-4">
                                                        <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => editProduct(product)}>
                                                            Edit
                                                        </button>
                                                        <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => deleteProduct(product)}>
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

            <Transition appear show={addProductModal} as={Fragment}>
                <Dialog as="div" open={addProductModal} onClose={() => setAddProductModal(false)} className="relative z-50">
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
                                        onClick={() => setAddProductModal(false)}
                                        className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                    >
                                        <IconX />
                                    </button>
                                    <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                                        {productParams.id ? 'Edit Product' : 'Add Product'}
                                    </div>
                                    <div className="p-5">
                                        <form>
                                            <div className="mb-5">
                                                <label htmlFor="productCode">Product Code</label>
                                                <input id="productCode" type="text" placeholder="Enter Product Code" className="form-input" value={productParams.productCode} onChange={(e) => changeProductValue(e)} />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="thickness">Thickness</label>
                                                <input id="thickness" type="text" placeholder="Enter Thickness" className="form-input" value={productParams.thickness} onChange={(e) => changeProductValue(e)} />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="width">Width</label>
                                                <input id="width" type="text" placeholder="Enter Width" className="form-input" value={productParams.width} onChange={(e) => changeProductValue(e)} />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="height">Height</label>
                                                <input id="height" type="text" placeholder="Enter Height" className="form-input" value={productParams.height} onChange={(e) => changeProductValue(e)} />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="quantity">Quantity</label>
                                                <input id="quantity" type="text" placeholder="Enter Quantity" className="form-input" value={productParams.quantity} onChange={(e) => changeProductValue(e)} />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="note">Note</label>
                                                <textarea
                                                    id="note"
                                                    rows={3}
                                                    placeholder="Enter Note"
                                                    className="form-textarea min-h-[130px] resize-none"
                                                    value={productParams.note}
                                                    onChange={(e) => changeProductValue(e)}
                                                ></textarea>
                                            </div>
                                            <div className="mt-8 flex items-center justify-end">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setAddProductModal(false)}>
                                                    Cancel
                                                </button>
                                                <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={saveProduct}>
                                                    {productParams.id ? 'Update' : 'Add'}
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

            <Transition appear show={addMaterialModal} as={Fragment}>
                <Dialog as="div" open={addMaterialModal} onClose={() => setAddMaterialModal(false)} className="relative z-50">
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
                                        onClick={() => setAddMaterialModal(false)}
                                        className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                    >
                                        <IconX />
                                    </button>
                                    <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                                        {materialParams.id ? 'Edit Material' : 'Add Material'}
                                    </div>
                                    <div className="p-5">
                                        <form>
                                            <div className="mb-5">
                                                <label htmlFor="materialType">Material Type</label>
                                                <input id="materialType" type="text" placeholder="Enter Material Type" className="form-input" value={materialParams.materialType} onChange={(e) => changeMaterialValue(e)} />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="quantity">Quantity</label>
                                                <input id="quantity" type="text" placeholder="Enter Quantity" className="form-input" value={materialParams.quantity} onChange={(e) => changeMaterialValue(e)} />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="unit">Unit</label>
                                                <input id="unit" type="text" placeholder="Enter Unit" className="form-input" value={materialParams.unit} onChange={(e) => changeMaterialValue(e)} />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="note">Note</label>
                                                <textarea
                                                    id="note"
                                                    rows={3}
                                                    placeholder="Enter Note"
                                                    className="form-textarea min-h-[130px] resize-none"
                                                    value={materialParams.note}
                                                    onChange={(e) => changeMaterialValue(e)}
                                                ></textarea>
                                            </div>
                                            <div className="mt-8 flex items-center justify-end">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setAddMaterialModal(false)}>
                                                    Cancel
                                                </button>
                                                <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={saveMaterial}>
                                                    {materialParams.id ? 'Update' : 'Add'}
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
                            <button type="button" className="btn btn-primary" onClick={() => editMaterial()}>
                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                Thêm NVL
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
                    <div className="flex gap-3">
                        <div>
                            <button type="button" className="btn btn-primary" onClick={() => editProduct()}>
                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                Thêm sản phẩm
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComponentsChemicalIssuance;
