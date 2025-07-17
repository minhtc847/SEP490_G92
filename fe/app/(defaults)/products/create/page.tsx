'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AsyncSelect from 'react-select/async';
import { createProductNVL, createProduct, checkProductNameExists, getGlassStructures, GlassStructure } from './service';

const PRODUCT_NAME_REGEX = /^Kính .+ KT: \d+\*\d+\*\d+ mm$/;

export type OrderItem = {
    id: number;
    productId?: number | null;
    productName: string;
    width: number | null;
    height: number | null;
    thickness: number | null;
    quantity: number;
    uom?: string;
    isFromDatabase?: boolean;
};

const ProductCreatePage = () => {
    const router = useRouter();
    const [glassStructures, setGlassStructures] = useState<GlassStructure[]>([]);
    const [isProductNameDuplicate, setIsProductNameDuplicate] = useState(false);
    const [isProductNameDuplicateNVL, setIsProductNameDuplicateNVL] = useState(false);

    const [newFinishedProductForm, setNewFinishedProductForm] = useState({
        productName: '',
        width: 0,
        height: 0,
        thickness: 0,
        unitPrice: 0,
        glassStructureId: undefined as number | undefined,
    });

    const [newMaterialProductForm, setNewMaterialProductForm] = useState({
        productName: '',
        width: 0,
        height: 0,
        thickness: 0,
    });

    const [form, setForm] = useState({
        customer: '',
        description: '',
        orderCode: '',
        status: '',
        createdDate: '',
        items: [] as OrderItem[],
    });

    const [showAddProductForm, setShowAddProductForm] = useState(false);

    useEffect(() => {
        (async () => {
            const data = await getGlassStructures();
            setGlassStructures(data);
        })();
    }, []);

    const handleMaterialProductNameChange = async (val: string) => {
        const exists = await checkProductNameExists(val.trim());
        setIsProductNameDuplicateNVL(exists);
        setNewMaterialProductForm((prev) => ({ ...prev, productName: val }));
    };

    const handleFinishedProductNameChange = async (val: string) => {
        const exists = await checkProductNameExists(val.trim());
        setIsProductNameDuplicate(exists);
        setNewFinishedProductForm((prev) => ({ ...prev, productName: val }));
    };

    const handleSaveProduct = async () => {
        try {
            if (!newMaterialProductForm.productName.trim()) throw new Error('Vui lòng nhập tên sản phẩm');
            if (!PRODUCT_NAME_REGEX.test(newMaterialProductForm.productName)) throw new Error('Tên sản phẩm sai định dạng');
            if (isProductNameDuplicateNVL) throw new Error('Tên sản phẩm đã tồn tại');
            if (await checkProductNameExists(newMaterialProductForm.productName)) throw new Error('Tên sản phẩm đã tồn tại, vui lòng chọn tên khác!');

            const payload = {
                productName: newMaterialProductForm.productName,
                width: newMaterialProductForm.width?.toString() ?? null,
                height: newMaterialProductForm.height?.toString() ?? null,
                thickness: newMaterialProductForm.thickness,
                unitPrice: 0,
            };
            const p = await createProductNVL(payload);

            const newItem: OrderItem = {
                id: Date.now(),
                productId: p.id,
                productName: p.productName,
                width: p.width ? Number(p.width) : null,
                height: p.height ? Number(p.height) : null,
                thickness: p.thickness ? Number(p.thickness) : null,
                quantity: 1,
                isFromDatabase: true,
            };
            setForm((f) => ({ ...f, items: [...f.items, newItem] }));
            setShowAddProductForm(false);
            setNewMaterialProductForm({ productName: '', width: 0, height: 0, thickness: 0 });

            alert(`Đã tạo sản phẩm thành công: ${p.productName}`);
            router.push(`/products/${p.id}`);
        } catch (err: any) {
            alert(err.message || 'Lỗi tạo sản phẩm');
        }
    };

    const handleSave = async () => {
        if (isProductNameDuplicate) {
            alert('Tên sản phẩm đã tồn tại.');
            return;
        }
        const regex = /^Kính .+ phút, KT: \d+\*\d+\*\d+ mm, .+$/;
        if (!regex.test(newFinishedProductForm.productName)) {
            alert('Tên sản phẩm sai định dạng.\n\nVí dụ đúng: Kính EI60 phút, KT: 300*500*30 mm, VNG-MK cữ kính đứng');
            return;
        }
        if (!newFinishedProductForm.glassStructureId) {
            alert('Vui lòng chọn cấu trúc kính.');
            return;
        }

        const payload = {
            productName: newFinishedProductForm.productName,
            width: newFinishedProductForm.width.toString(),
            height: newFinishedProductForm.height.toString(),
            thickness: newFinishedProductForm.thickness,
            unitPrice: 0,
            glassStructureId: newFinishedProductForm.glassStructureId,
        };

        try {
            const res = await createProduct(payload);
            alert('Đã tạo sản phẩm: ' + res.productName);
            router.push(`/products/${res.id}`);
        } catch (e) {
            console.error(e);
            alert('Tạo sản phẩm thất bại');
        }
    };

    return (
        <div>
            <div>
                <h1 className="text-xl font-bold">Thêm sản phẩm (Thành Phẩm)</h1>

                <div className="border rounded-lg p-4 mb-6 bg-gray-50">
                    <div>
                        <h4 className="text-lg font-semibold mb-2">Thêm sản phẩm mới</h4>
                        <p className="text-sm text-gray-500 italic mb-2">
                            ⚠️ Tên sản phẩm phải theo định dạng: <strong>Kính [loại] phút, KT: [rộng]*[cao]*[dày] mm, [mô tả thêm]</strong>
                            <br />
                            <span>
                                Ví dụ: <code>Kính EI60 phút, KT: 300*500*30 mm, VNG-MK cữ kính đứng</code>
                            </span>
                        </p>

                        <label className="block mb-1 font-medium">Tên sản phẩm</label>
                        <input
                            className="input input-bordered w-full"
                            value={newFinishedProductForm.productName}
                            onChange={(e) => handleFinishedProductNameChange(e.target.value)}
                            placeholder="VD: Kính EI60 phút, KT: 300*500*30 mm, VNG-MK cữ kính đứng"
                        />
                        {isProductNameDuplicate && <p className="text-red-500 text-sm">Tên sản phẩm đã tồn tại. Vui lòng nhập tên khác.</p>}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block mb-1 font-medium">Rộng (mm)</label>
                            <input
                                type="number"
                                className="input input-bordered w-full"
                                value={newFinishedProductForm.width}
                                onChange={(e) => setNewFinishedProductForm((p) => ({ ...p, width: +e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Cao (mm)</label>
                            <input
                                type="number"
                                className="input input-bordered w-full"
                                value={newFinishedProductForm.height}
                                onChange={(e) => setNewFinishedProductForm((p) => ({ ...p, height: +e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Dày (mm)</label>
                            <input
                                type="number"
                                className="input input-bordered w-full"
                                value={newFinishedProductForm.thickness}
                                onChange={(e) => setNewFinishedProductForm((p) => ({ ...p, thickness: +e.target.value }))}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Cấu trúc kính</label>
                        <AsyncSelect
                            cacheOptions
                            defaultOptions
                            loadOptions={(input, cb) =>
                                cb(glassStructures.filter((g) => g.productName.toLowerCase().includes(input.toLowerCase())).map((g) => ({ label: g.productName, value: g.id })))
                            }
                            onChange={(opt) => setNewFinishedProductForm((p) => ({ ...p, glassStructureId: opt ? opt.value : undefined }))}
                            value={glassStructures.filter((g) => g.id === newFinishedProductForm.glassStructureId).map((g) => ({ label: g.productName, value: g.id }))[0] || null}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 font-medium">Diện tích (m²)</label>
                            <div className="input input-bordered bg-gray-100">{((newFinishedProductForm.width * newFinishedProductForm.height) / 1_000_000).toFixed(2)}</div>
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">Đơn giá (₫)</label>
                            <div className="input input-bordered bg-gray-100">
                                {(() => {
                                    const area = (newFinishedProductForm.width * newFinishedProductForm.height) / 1_000_000;
                                    const s = glassStructures.find((g) => g.id === newFinishedProductForm.glassStructureId);
                                    return ((s?.unitPrice || 0) * area).toFixed(0);
                                })()}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex gap-4">
                        <button className="btn btn-sm btn-primary" onClick={handleSave}>
                            Lưu sản phẩm
                        </button>
                    </div>
                </div>
            </div>
            <div>
                <h1 className="text-xl font-bold">Thêm sản phẩm (Nguyên Vật liệu)</h1>

                <div className="border rounded-lg p-4 mb-6 bg-gray-50">
                    <h4 className="text-lg font-semibold mb-2">Thêm sản phẩm mới</h4>
                    <p className="text-sm text-gray-500 italic mb-2">
                        ⚠️ Tên sản phẩm phải theo định dạng: <strong>Kính [loại kính] KT: [rộng]*[cao]*[dày] mm</strong>
                        <br />
                        <span>
                            Ví dụ: <code>Kính cường lực tôi trắng KT: 200*200*5 mm</code>
                        </span>
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="col-span-full">
                            <label className="block mb-1 font-medium">Tên sản phẩm</label>
                            <input
                                className="input input-sm input-bordered w-full"
                                placeholder="VD: Kính EI60 phút, KT: 300*500*30 mm, ..."
                                value={newMaterialProductForm.productName}
                                onChange={(e) => handleMaterialProductNameChange(e.target.value)}
                            />
                            {isProductNameDuplicateNVL && <p className="text-red-500 text-sm mt-1">Tên sản phẩm đã tồn tại. Vui lòng nhập tên khác.</p>}
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Rộng (mm)</label>
                            <input
                                className="input input-sm input-bordered w-full"
                                type="number"
                                value={newMaterialProductForm.width ?? ''}
                                onChange={(e) => setNewMaterialProductForm((prev) => ({ ...prev, width: e.target.value === '' ? 0 : +e.target.value }))}
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Cao (mm)</label>
                            <input
                                className="input input-sm input-bordered w-full"
                                type="number"
                                value={newMaterialProductForm.height ?? ''}
                                onChange={(e) => setNewMaterialProductForm((prev) => ({ ...prev, height: e.target.value === '' ? 0 : +e.target.value }))}
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Dày (mm)</label>
                            <input
                                className="input input-sm input-bordered w-full"
                                type="number"
                                value={newMaterialProductForm.thickness ?? ''}
                                onChange={(e) => setNewMaterialProductForm((prev) => ({ ...prev, thickness: e.target.value === '' ? 0 : +e.target.value }))}
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-medium">Diện tích (m²)</label>
                            <div className="input input-sm bg-gray-100 flex items-center">{(((newMaterialProductForm.width ?? 0) * (newMaterialProductForm.height ?? 0)) / 1_000_000).toFixed(2)}</div>
                        </div>
                    </div>

                    <div className="mt-4 flex gap-4">
                        <button className="btn btn-sm btn-primary" onClick={handleSaveProduct}>
                            Lưu sản phẩm
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCreatePage;
