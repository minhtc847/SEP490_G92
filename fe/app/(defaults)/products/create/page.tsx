'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AsyncSelect from 'react-select/async';
import { createProduct } from './service';
import { searchGlassStructures } from '@/app/(defaults)/products/edit/[id]/service';

type GlassStructureOption = {
    id: number;
    productName: string;
    unitPrice: number;
};

type ProductDetail = {
    id?: number;
    productCode?: string;
    productName: string;
    productType: string;
    uom: string;
    height?: string;
    width?: string;
    thickness?: number;
    weight?: number;
    unitPrice?: number;
    glassStructureId: number;
};

const ProductCreatePage = () => {
    const router = useRouter();

    const [isAddMode, setIsAddMode] = useState<'simple' | 'full' | null>(null);
    const [glassStructures, setGlassStructures] = useState<GlassStructureOption[]>([]);

    // --- Form 1: đầy đủ ---
    const [formData, setFormData] = useState<ProductDetail>({
        productName: '',
        productType: '',
        uom: '',
        height: '',
        width: '',
        thickness: 0,
        weight: 0,
        unitPrice: 0,
        glassStructureId: 0,
    });

    // --- Form 2: thành phẩm ---
    const [simpleForm, setSimpleForm] = useState<{
        productName: string;
        width: number;
        height: number;
        thickness: number;
        glassStructureId?: number;
    }>({
        productName: '',
        width: 0,
        height: 0,
        thickness: 0,
        glassStructureId: undefined,
    });

    const handleGlassStructureChange = (selected: GlassStructureOption | null) => {
        if (!selected) return;
        setFormData((prev) => ({ ...prev, glassStructureId: selected.id }));
    };

    const handleFullChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: ['thickness', 'weight', 'unitPrice'].includes(name) ? Number(value) : value,
        }));
    };

    const handleSubmitFull = async (e: React.FormEvent) => {
        e.preventDefault();
        await createProduct(formData);
        router.push(`/products?success=${formData.productName}`);
    };

    const handleSubmitSimple = async () => {
        const selectedStructure = glassStructures.find((gs) => gs.id === simpleForm.glassStructureId);
        if (!selectedStructure) return alert('Chưa chọn cấu trúc kính');

        const area = (simpleForm.width * simpleForm.height) / 1_000_000;
        const calculatedPrice = +(selectedStructure.unitPrice * area).toFixed(0);

        const dto: ProductDetail = {
            productName: simpleForm.productName,
            productType: 'Thành phẩm',
            uom: 'Tấm',
            height: simpleForm.height.toString(),
            width: simpleForm.width.toString(),
            thickness: simpleForm.thickness,
            glassStructureId: selectedStructure.id,
            unitPrice: calculatedPrice,
        };

        await createProduct(dto);
        router.push(`/products?success=${dto.productName}`);
    };

    useEffect(() => {
        fetch('/api/product/all')
            .then((res) => res.json())
            .then(setGlassStructures);
    }, []);

    return (
        <div className="p-6 bg-white rounded shadow">
            <h1 className="text-2xl font-bold mb-4">Tạo sản phẩm</h1>

            {!isAddMode && (
                <div className="space-x-4">
                    <button onClick={() => setIsAddMode('simple')} className="btn btn-primary">
                        + Tạo sản phẩm thành phẩm
                    </button>
                    <button onClick={() => setIsAddMode('full')} className="btn btn-secondary">
                        + Tạo sản phẩm
                    </button>
                </div>
            )}

            {/* Full form */}
            {isAddMode === 'full' && (
                <form onSubmit={handleSubmitFull} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        { label: 'Tên sản phẩm', name: 'productName' },
                        { label: 'Loại', name: 'productType' },
                        { label: 'Đơn vị tính', name: 'uom' },
                        { label: 'Chiều cao', name: 'height' },
                        { label: 'Chiều rộng', name: 'width' },
                        { label: 'Độ dày', name: 'thickness', type: 'number' },
                        { label: 'Trọng lượng', name: 'weight', type: 'number' },
                        { label: 'Đơn giá', name: 'unitPrice', type: 'number' },
                    ].map((field) => (
                        <div key={field.name}>
                            <label className="block font-medium mb-1">{field.label}</label>
                            <input name={field.name} type={field.type ?? 'text'} value={(formData as any)[field.name] ?? ''} onChange={handleFullChange} className="input input-bordered w-full" />
                        </div>
                    ))}

                    <div className="md:col-span-2">
                        <label className="block font-medium mb-1">Cấu trúc kính</label>
                        <AsyncSelect
                            cacheOptions
                            defaultOptions
                            loadOptions={(inputValue, callback) => {
                                searchGlassStructures(inputValue).then((results) => {
                                    callback(results as GlassStructureOption[]);
                                });
                            }}
                            onChange={handleGlassStructureChange}
                            getOptionLabel={(option: GlassStructureOption) => option.productName}
                            getOptionValue={(option: GlassStructureOption) => String(option.id)}
                            placeholder="Chọn cấu trúc kính"
                        />
                    </div>

                    <div className="md:col-span-2 flex gap-4">
                        <button type="submit" className="btn btn-success">
                            Lưu
                        </button>
                        <button type="button" onClick={() => setIsAddMode(null)} className="btn btn-ghost">
                            ✕ Hủy
                        </button>
                    </div>
                </form>
            )}

            {/* Simple form */}
            {isAddMode === 'simple' && (
                <div className="mt-6">
                    <div className="text-sm text-gray-500 italic mb-4">
                        ⚠️ Tên sản phẩm phải theo định dạng: <strong>Kính EI60 phút, KT: 300*500*30 mm, mô tả thêm</strong>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="col-span-full">
                            <label className="block font-medium mb-1">Tên sản phẩm</label>
                            <input className="input input-bordered w-full" value={simpleForm.productName} onChange={(e) => setSimpleForm({ ...simpleForm, productName: e.target.value })} />
                        </div>

                        <div>
                            <label className="block font-medium mb-1">Rộng (mm)</label>
                            <input type="number" className="input input-bordered w-full" value={simpleForm.width} onChange={(e) => setSimpleForm({ ...simpleForm, width: +e.target.value })} />
                        </div>

                        <div>
                            <label className="block font-medium mb-1">Cao (mm)</label>
                            <input type="number" className="input input-bordered w-full" value={simpleForm.height} onChange={(e) => setSimpleForm({ ...simpleForm, height: +e.target.value })} />
                        </div>

                        <div>
                            <label className="block font-medium mb-1">Dày (mm)</label>
                            <input type="number" className="input input-bordered w-full" value={simpleForm.thickness} onChange={(e) => setSimpleForm({ ...simpleForm, thickness: +e.target.value })} />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block font-medium mb-1">Cấu trúc kính</label>
                            <AsyncSelect
                                cacheOptions
                                defaultOptions
                                loadOptions={(inputValue, callback) => {
                                    searchGlassStructures(inputValue).then((results) => {
                                        callback(results as GlassStructureOption[]);
                                    });
                                }}
                                onChange={handleGlassStructureChange}
                                getOptionLabel={(option: GlassStructureOption) => option.productName}
                                getOptionValue={(option: GlassStructureOption) => String(option.id)}
                                placeholder="Chọn cấu trúc kính"
                            />
                        </div>

                        <div>
                            <label className="block font-medium mb-1">Diện tích (m²)</label>
                            <div className="input bg-gray-100">{((simpleForm.width * simpleForm.height) / 1_000_000).toFixed(2)}</div>
                        </div>

                        <div>
                            <label className="block font-medium mb-1">Đơn giá (₫)</label>
                            <div className="input bg-gray-100">
                                {(() => {
                                    const area = (simpleForm.width * simpleForm.height) / 1_000_000;
                                    const struct = glassStructures.find((gs) => gs.id === simpleForm.glassStructureId);
                                    return ((struct?.unitPrice || 0) * area).toFixed(0);
                                })()}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex gap-4">
                        <button className="btn btn-primary" onClick={handleSubmitSimple}>
                            Lưu sản phẩm
                        </button>
                        <button className="btn btn-ghost text-red-500" onClick={() => setIsAddMode(null)}>
                            ✕ Huỷ
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductCreatePage;
