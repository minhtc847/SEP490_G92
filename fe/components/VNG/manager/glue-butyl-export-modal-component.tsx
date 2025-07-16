'use client'

import { Chemical, Product, createPhieuXuatKeoButylData } from "@/app/(defaults)/production-plans/service"
import IconPlus from "@/components/icon/icon-plus"
import { Fragment, useState } from "react"
import { Transition, Dialog, DialogPanel, TransitionChild } from '@headlessui/react';
import IconX from "@/components/icon/icon-x";

interface GlueButylExportModalComponentProps {
    products: Product[]
    type: string
    productionOrderId: number
    employees : {
        id: number
        name: string
    }[]
}
interface GlueButylExportRequest {
    products: Product[]
    glueButyls: Chemical[]
    employeeId: number
    productionOrderId: number
    type: string
}
const GlueButylExportModalComponent: React.FC<GlueButylExportModalComponentProps> = ({ products, type, productionOrderId, employees }) => {
    const [addExportModal, setExportModal] = useState(false);

    const [formProducts, setFormProducts] = useState<Product[]>(
        products.map((p) => ({ ...p, quantity: 0 }))
    );

    const [uoms, setUoms] = useState<string[]>(['kg', 'm', 'lit']);

    const [formChemicals, setFormChemicals] = useState<Chemical[]>([
        { type: 'Keo silicone', uom: 'kg', quantity: 0 },
        { type: 'Butyl sealant', uom: 'kg', quantity: 0 },
        { type: 'Chất xúc tác', uom: 'kg', quantity: 0 },
    ]);

    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | ''>('');

    const handleChangeProductQuantity = (index: number, quantity: number) => {
        const newProducts = [...formProducts];
        newProducts[index].quantity = quantity;
        setFormProducts(newProducts);
    };

    const handleChangeChemical = (index: number, field: 'uom' | 'quantity', value: string | number) => {
        const newChemicals = [...formChemicals];
        (newChemicals[index] as any)[field] = value;
        setFormChemicals(newChemicals);
    };

    const handleSubmit = async () => {
        if (!selectedEmployeeId) {
            alert('Vui lòng chọn người xuất kho');
            return;
        }

        // Validate product quantities
        for (let i = 0; i < formProducts.length; i++) {
            const quantity = formProducts[i].quantity;
            const max = products[i].quantity;

            if (quantity < 0) {
                alert(`Sản phẩm "${formProducts[i].name}" phải có số lượng lớn hơn 0.`);
                return;
            }

            if (quantity > max) {
                alert(`Số lượng sản phẩm "${formProducts[i].name}" không được vượt quá ${max}.`);
                return;
            }
        }

        // Validate chemical quantities (optional, you can remove if not needed)
        for (let chem of formChemicals) {
            if (chem.quantity < 0) {
                alert(`Hóa chất "${chem.type}" phải có số lượng lớn hơn 0.`);
                return;
            }
        }

        const payload: GlueButylExportRequest = {
            products: formProducts,
            glueButyls: formChemicals,
            employeeId: selectedEmployeeId,
            productionOrderId,
            type,
        };

        try {
            await createPhieuXuatKeoButylData(payload);
            alert('Tạo phiếu xuất kho thành công!');
            setExportModal(false);
        } catch (err) {
            alert('Lỗi khi tạo phiếu xuất kho!');
            console.error(err);
        }
    };

    return (
        <div>
            <button className="btn btn-primary w-full" onClick={() => setExportModal(true)}>
                <IconPlus className="h-5 w-5 shrink-0 ltr:mr-2 rtl:ml-2" />
                Thêm phiếu xuất kho
            </button>

            <Transition appear show={addExportModal} as={Fragment}>
                <Dialog as="div" open={addExportModal} onClose={() => setExportModal(false)} className="relative z-50">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
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
                                <DialogPanel className="panel w-full max-w-2xl rounded-lg p-5 text-black dark:text-white-dark bg-white dark:bg-[#121c2c]">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-semibold">Thêm phiếu xuất kho</h3>
                                        <button onClick={() => setExportModal(false)} className="text-gray-500 hover:text-gray-800">
                                            <IconX />
                                        </button>
                                    </div>

                                    <div className="mt-5 space-y-4">
                                        <div>
                                            <label className="block mb-1">Loại lệnh sản xuất</label>
                                            <input type="text" className="form-input" value={type} readOnly />
                                        </div>

                                        <div>
                                            <label className="block mb-1">Danh sách sản phẩm</label>
                                            {formProducts.map((product, idx) => (
                                                <div key={idx} className="flex items-center gap-2 mb-2">
                                                    <span
                                                        className="w-2/3">{product.name} (Tối đa: {products[idx].quantity})</span>
                                                    <input
                                                        type="number"
                                                        className="form-input w-1/3"
                                                        min={1}
                                                        max={products[idx].quantity}
                                                        value={product.quantity}
                                                        onChange={(e) => handleChangeProductQuantity(idx, Number(e.target.value))}
                                                        placeholder="Số lượng"
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <div>
                                            <label className="block mb-1">Hóa chất</label>
                                            {formChemicals.map((chem, idx) => (
                                                <div key={idx} className="flex items-center gap-2 mb-2">
                                                    <span className="w-1/4">{chem.type}</span>
                                                    <select
                                                        className="form-select w-1/4"
                                                        value={chem.uom}
                                                        onChange={(e) => handleChangeChemical(idx, 'uom', e.target.value)}
                                                    >
                                                        {uoms.map((uom) => (
                                                            <option key={uom} value={uom}>
                                                                {uom}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <input
                                                        type="number"
                                                        className="form-input w-1/4"
                                                        value={chem.quantity}
                                                        onChange={(e) => handleChangeChemical(idx, 'quantity', Number(e.target.value))}
                                                        placeholder="Số lượng"
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <div>
                                            <label className="block mb-1">Người xuất kho</label>
                                            <select
                                                className="form-select w-full"
                                                value={selectedEmployeeId}
                                                onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
                                            >
                                                <option value="">Chọn nhân viên</option>
                                                {employees.map((emp) => (
                                                    <option key={emp.id} value={emp.id}>
                                                        {emp.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <button className="btn btn-outline-danger" onClick={() => setExportModal(false)}>
                                            Hủy
                                        </button>
                                        <button className="btn btn-primary" onClick={handleSubmit}>
                                            Tạo phiếu
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

export default GlueButylExportModalComponent
