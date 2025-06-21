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

const GlueAndButylIssuancePage = () => {
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
            glass5: 4,
            glass6: 5,
            quantity: 50,
        },
        {
            id: 2,
            productCode: 'SP002',
            thickness: 12,
            width: 120,
            height: 180,
            glass4: 4,
            glass5: 5,
            glass6: 6,
            quantity: 30,
        },
        {
            id: 3,
            productCode: 'SP003',
            thickness: 8,
            width: 150,
            height: 250,
            glass4: 5,
            glass5: 6,
            glass6: 7,
            quantity: 20,
        },
        {
            id: 4,
            productCode: 'SP004',
            thickness: 15,
            width: 80,
            height: 220,
            glass4: 6,
            glass5: 7,
            glass6: 8,
            quantity: 40,
        },
        {
            id: 5,
            productCode: 'SP005',
            thickness: 9,
            width: 110,
            height: 190,
            glass4: 7,
            glass5: 8,
            glass6: 9,
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
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Xuất keo và butyl</h1>
                <div className="space-x-2">
                    <button onClick={() => editProduct()} className="px-4 py-1 bg-blue-500 text-white rounded">
                        📝 Thêm sản phẩm
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
                <div>
                    <strong>Mã lệnh sản xuất:</strong> LSX00132
                </div>
                <div>
                    <strong>Ngày xuất:</strong> 13/06/2025
                </div>
                <div>
                    <strong>Diễn giải:</strong> Lệnh xuất keo, butyl ngày 13/06/2025
                </div>
                <div>
                    <strong>Tham chiếu:</strong> XK00253
                </div>
                <div>
                    <strong>Tình trạng:</strong> Hoàn thành
                </div>
            </div>

            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Danh sách vật tư</h2>
                <div className="space-y-4">
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
                                placeholder="Số lượng"
                                className="rounded border px-3 py-2 shadow"
                                value={item.quantity}
                                onChange={(e) => {
                                    const updated = [...materials];
                                    updated[index].quantity = e.target.value;
                                    setMaterials(updated);
                                }}
                            />
                            <input
                                type="text"
                                placeholder="Đơn vị"
                                className="rounded border px-3 py-2 shadow"
                                value={item.unit}
                                readOnly
                            />
                            <input
                                type="text"
                                placeholder="Ghi chú"
                                className="rounded border px-3 py-2 shadow"
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
            </div>

            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Danh sách sản phẩm</h2>
                <div className="table-responsive mb-6 overflow-x-auto">
                    <table className="w-full border-collapse border text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2">STT</th>
                                <th className="border p-2">Mã sản phẩm</th>
                                <th className="border p-2">Độ dày (mm)</th>
                                <th className="border p-2">Rộng (mm)</th>
                                <th className="border p-2">Cao (mm)</th>
                                <th className="border p-2">Kính 4</th>
                                <th className="border p-2">Kính 5</th>
                                <th className="border p-2">Kính 6</th>
                                <th className="border p-2">Số lượng</th>
                                <th className="border p-2">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map((product: any, idx: number) => (
                                <tr key={product.id}>
                                    <td className="border p-2 text-center">{idx + 1}</td>
                                    <td className="border p-2">{product.productCode}</td>
                                    <td className="border p-2 text-right">{product.thickness}</td>
                                    <td className="border p-2 text-right">{product.width}</td>
                                    <td className="border p-2 text-right">{product.height}</td>
                                    <td className="border p-2 text-center">{product.glass4}</td>
                                    <td className="border p-2 text-center">{product.glass5}</td>
                                    <td className="border p-2 text-center">{product.glass6}</td>
                                    <td className="border p-2 text-right">{product.quantity}</td>
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
            </div>

            {/* Add Product Modal */}
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
                                        {params.id ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Mã sản phẩm</label>
                                            <input
                                                type="text"
                                                id="productCode"
                                                value={params.productCode}
                                                onChange={changeValue}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Độ dày (mm)</label>
                                            <input
                                                type="number"
                                                id="thickness"
                                                value={params.thickness}
                                                onChange={changeValue}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Rộng (mm)</label>
                                            <input
                                                type="number"
                                                id="width"
                                                value={params.width}
                                                onChange={changeValue}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Cao (mm)</label>
                                            <input
                                                type="number"
                                                id="height"
                                                value={params.height}
                                                onChange={changeValue}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Kính 4</label>
                                            <input
                                                type="number"
                                                id="glass4"
                                                value={params.glass4}
                                                onChange={changeValue}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Kính 5</label>
                                            <input
                                                type="number"
                                                id="glass5"
                                                value={params.glass5}
                                                onChange={changeValue}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Kính 6</label>
                                            <input
                                                type="number"
                                                id="glass6"
                                                value={params.glass6}
                                                onChange={changeValue}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700">Số lượng</label>
                                            <input
                                                type="number"
                                                id="quantity"
                                                value={params.quantity}
                                                onChange={changeValue}
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
        </div>
    );
};

export default GlueAndButylIssuancePage;
