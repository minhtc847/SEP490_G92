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

const ComponentsGlueButylIssuance = () => {
    const [addProductModal, setAddProductModal] = useState<any>(false);

    const [value, setValue] = useState<any>('list');
    const [defaultParams] = useState({
        id: null,
        productCode: '',
        thickness: '',
        width: '',
        height: '',
        glass4: '',
        glass5: '',
        glass6: '',
        quantity: '',
    });

    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultParams)));

    const changeValue = (e: any) => {
        const { value, id } = e.target;
        setParams({ ...params, [id]: value });
    };

    const [search, setSearch] = useState<any>('');
    const [productionList] = useState<any>([
        {
            id: 1,
            productCode: 'SP001',
            thickness: 10,
            width: 100,
            height: 200,
            glass4: 3,
            glass5: false,
            glass6: false,
            quantity: 50,
        },
        {
            id: 2,
            productCode: 'SP002',
            thickness: 12,
            width: 120,
            height: 180,
            glass4: false,
            glass5: 4,
            glass6: false,
            quantity: 30,
        },
        {
            id: 3,
            productCode: 'SP003',
            thickness: 8,
            width: 150,
            height: 250,
            glass4: true,
            glass5: true,
            glass6: 6,
            quantity: 20,
        },
        {
            id: 4,
            productCode: 'SP004',
            thickness: 15,
            width: 80,
            height: 220,
            glass4: false,
            glass5: 2,
            glass6: true,
            quantity: 40,
        },
        {
            id: 5,
            productCode: 'SP005',
            thickness: 9,
            width: 110,
            height: 190,
            glass4: 1,
            glass5: false,
            glass6: true,
            quantity: 25,
        },
    ]);

    const [filteredItems, setFilteredItems] = useState<any>(productionList);


    const saveProduct = () => {
        if (!params.productCode) {
            showMessage('Product Code is required.', 'error');
            return true;
        }
        if (!params.thickness) {
            showMessage('thickness is required.', 'error');
            return true;
        }
        if (!params.width) {
            showMessage('width is required.', 'error');
            return true;
        }
        if (!params.height) {
            showMessage('height is required.', 'error');
            return true;
        }
        if (!params.quantity) {
            showMessage('quantity is required.', 'error');
            return true;
        }

        if (params.id) {
            //update user
            let product: any = filteredItems.find((d: any) => d.id === params.id);
            product.productCode = params.productCode;
            product.thickness = params.thickness;
            product.width = params.width;
            product.height = params.height;
            product.glass4 = params.glass4;
            product.glass5 = params.glass5;
            product.glass6 = params.glass6;
            product.quantity = params.quantity;
        } else {
            //add user
            let maxProductId = filteredItems.length ? filteredItems.reduce((max: any, character: any) => (character.id > max ? character.id : max), filteredItems[0].id) : 0;

            let product = {
                id: maxProductId + 1,
                productCode: params.productCode,
                thickness: params.thickness,
                width: params.width,
                height: params.height,
                glass4: params.glass4,
                glass5: params.glass5,
                glass6: params.glass6,
                quantity: params.quantity,

            };
            filteredItems.splice(0, 0, product);
            //   searchContacts();
        }

        showMessage('Product has been saved successfully.');
        setAddProductModal(false);
    };

    const editProduct = (product: any = null) => {
        const json = JSON.parse(JSON.stringify(defaultParams));
        setParams(json);
        if (product) {
            let json1 = JSON.parse(JSON.stringify(product));
            setParams(json1);
        }
        setAddProductModal(true);
    };

    const deleteProduct = (product: any = null) => {
        setFilteredItems(filteredItems.filter((d: any) => d.id !== product.id));
        showMessage('Product has been deleted successfully.');
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
    const [materials, setMaterials] = useState([
        { type: 'Butyl 5', quantity: '', unit: 'm', note: '' },
        { type: 'Keo', quantity: '', unit: 'Chai', note: '' },
        { type: 'Keo', quantity: '', unit: 'Túi', note: '' },
    ]);

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
                            defaultValue="Lệnh xuất keo, butyl ngày 13/06/2025"
                        />
                        <div className="mt-2">
                            <span className="font-medium">Tham chiếu: </span>
                            <a href="#" className="text-blue-600 hover:underline">XK00253</a>,{' '}
                            {/* <a href="#" className="text-blue-600 hover:underline">NK0000135</a>, ... */}
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

            <div className="space-y-4 mt-5">
                {materials.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2">
                        <select
                            className="rounded border px-3 py-2 shadow"
                            value={item.type}
                            onChange={(e) => {
                                const updated = [...materials];
                                updated[index].type = e.target.value;
                                setMaterials(updated);
                            }}
                        >
                            <option value="Butyl 5">Butyl 5</option>
                            <option value="Keo">Keo</option>
                        </select>
                        <input
                            type="text"
                            className="rounded border px-3 py-2 shadow"
                            placeholder="Số lượng"
                            value={item.quantity}
                            onChange={(e) => {
                                const updated = [...materials];
                                updated[index].quantity = e.target.value;
                                setMaterials(updated);
                            }}
                        />
                        <div>{item.unit}</div>
                        <input
                            type="text"
                            className="rounded border px-3 py-2 shadow"
                            placeholder="Ghi chú"
                            value={item.note}
                            onChange={(e) => {
                                const updated = [...materials];
                                updated[index].note = e.target.value;
                                setMaterials(updated);
                            }}
                        />
                    </div>
                ))}
            </div>

           
            {value === 'list' && (
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
                                    <th>Kính 4</th>
                                    <th>Kính 5</th>
                                    <th>Kính 6</th>
                                    <th>Số lượng</th>
                                    <th className="!text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.map((product: any) => {
                                    return (
                                        <tr key={product.id}>
                                            <td>
                                                <div className="flex w-max items-center">

                                                    <div>{product.id}</div>
                                                </div>
                                            </td>
                                            <td>{product.productCode}</td>
                                            <td className="whitespace-nowrap">{product.thickness}</td>
                                            <td className="whitespace-nowrap">{product.width}</td>
                                            <td className="whitespace-nowrap">{product.height}</td>
                                            <td className="whitespace-nowrap">{product.glass4}</td>
                                            <td className="whitespace-nowrap">{product.glass5}</td>
                                            <td className="whitespace-nowrap">{product.glass6}</td>
                                            <td className="whitespace-nowrap">{product.quantity}</td>

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
                                        {params.id ? 'Edit Product' : 'Add Product'}
                                    </div>
                                    <div className="p-5">
                                        <form>
                                            <div className="mb-5">
                                                <label htmlFor="productCode">Product Code</label>
                                                <input id="productCode" type="text" placeholder="Enter Product Code" className="form-input" value={params.productCode} onChange={(e) => changeValue(e)} />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="thickness">Thickness</label>
                                                <input id="thickness" type="text" placeholder="Enter Thickness" className="form-input" value={params.thickness} onChange={(e) => changeValue(e)} />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="width">Width</label>
                                                <input id="width" type="text" placeholder="Enter Width" className="form-input" value={params.width} onChange={(e) => changeValue(e)} />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="height">Height</label>
                                                <input id="height" type="text" placeholder="Enter Height" className="form-input" value={params.height} onChange={(e) => changeValue(e)} />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="glass4">Glass 4</label>
                                                <input id="glass4" type="text" placeholder="Enter Glass 4" className="form-input" value={params.glass4} onChange={(e) => changeValue(e)} />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="glass5">Glass 5</label>
                                                <input id="glass5" type="text" placeholder="Enter Glass 5" className="form-input" value={params.glass5} onChange={(e) => changeValue(e)} />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="glass6">Glass 6</label>
                                                <input id="glass6" type="text" placeholder="Enter Glass 6" className="form-input" value={params.glass6} onChange={(e) => changeValue(e)} />
                                            </div>
                                            <div className="mb-5">
                                                <label htmlFor="quantity">Quantity</label>
                                                <input id="quantity" type="text" placeholder="Enter Quantity" className="form-input" value={params.quantity} onChange={(e) => changeValue(e)} />
                                            </div>
                                            {/* <div className="mb-5">
                                                <label htmlFor="address">Address</label>
                                                <textarea
                                                    id="location"
                                                    rows={3}
                                                    placeholder="Enter Address"
                                                    className="form-textarea min-h-[130px] resize-none"
                                                    value={params.location}
                                                    onChange={(e) => changeValue(e)}
                                                ></textarea>
                                            </div> //text area, o nhap text to*/}
                                            <div className="mt-8 flex items-center justify-end">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setAddProductModal(false)}>
                                                    Cancel
                                                </button>
                                                <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={saveProduct}>
                                                    {params.id ? 'Update' : 'Add'}
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
                            <button type="button" className="btn btn-primary" onClick={() => editProduct()}>
                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                Thêm sản phẩm
                            </button>
                        </div>

                    </div>

                </div><div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
                    <div className="flex gap-3">
                        <div>
                            <button type="button" className="btn btn-primary" onClick={() => editProduct()}>
                                <IconUserPlus className="ltr:mr-2 rtl:ml-2" />
                                Xuất keo, butyl
                            </button>
                        </div>

                    </div>

                </div>
            </div>  
        </div>
    );
};

export default ComponentsGlueButylIssuance;
