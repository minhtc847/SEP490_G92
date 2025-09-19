'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import IconDownload from '@/components/icon/icon-download';
import IconEye from '@/components/icon/icon-eye';
import IconSave from '@/components/icon/icon-save';
import IconEdit from '@/components/icon/icon-edit';
import IconX from '@/components/icon/icon-x';
import { getDeliveryDetail, updateDelivery, DeliveryDetailDto, DeliveryDetailItemDto, UpdateDeliveryDto, UpdateDeliveryDetailDto } from '@/app/(defaults)/delivery/service';

const DetailDeliveryComponent = () => {
    const router = useRouter();
    const params = useParams();
    const deliveryId = params.id as string;
    
    const statusList = ['NotDelivered', 'Delivering', 'FullyDelivered', 'Cancelled'];
    
    // State for delivery details
    const [delivery, setDelivery] = useState<DeliveryDetailDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form state
    const [deliveryDate, setDeliveryDate] = useState<string>('');
    const [exportDate, setExportDate] = useState<string>('');
    const [status, setStatus] = useState<string>('NotDelivered');
    const [note, setNote] = useState<string>('');
    const [items, setItems] = useState<DeliveryDetailItemDto[]>([]);

    // Load delivery details on component mount
    useEffect(() => {
        const loadDeliveryDetail = async () => {
            if (!deliveryId) return;
            
            try {
                setLoading(true);
                const data = await getDeliveryDetail(parseInt(deliveryId));
                setDelivery(data);
                
                // Initialize form state
                setDeliveryDate(data.deliveryDate || '');
                setExportDate(data.exportDate || '');
                setStatus(statusList[data.status]);
                setNote(data.note || '');
                setItems(data.deliveryDetails);
            } catch (error) {
                console.error('Lỗi khi tải chi tiết phiếu giao hàng:', error);
                alert('Không thể tải chi tiết phiếu giao hàng');
            } finally {
                setLoading(false);
            }
        };
        
        loadDeliveryDetail();
    }, [deliveryId]);

    const handleQuantityChange = (itemId: number, quantity: number) => {
        setItems(items.map(item => 
            item.id === itemId 
                ? {
                    ...item,
                    quantity: quantity,
                    amount: quantity * item.unitPrice,
                }
                : item
        ));
    };

    const totalAmount = items.reduce((sum: number, item: DeliveryDetailItemDto) => sum + item.amount, 0);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset form to original values
        if (delivery) {
            setDeliveryDate(delivery.deliveryDate || '');
            setExportDate(delivery.exportDate || '');
            setStatus(statusList[delivery.status]);
            setNote(delivery.note || '');
            setItems(delivery.deliveryDetails);
        }
    };

    const handleSubmit = async () => {
        if (!delivery) return;

        setIsSubmitting(true);
        try {
            const updateData: UpdateDeliveryDto = {
                deliveryDate: deliveryDate || undefined,
                exportDate: exportDate || undefined,
                status: statusList.indexOf(status),
                note: note || undefined,
                deliveryDetails: items.map(item => ({
                    id: item.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    note: item.note
                }))
            };

            await updateDelivery(delivery.id, updateData);
            alert('Cập nhật phiếu giao hàng thành công!');
            setIsEditing(false);
            
            // Reload delivery data
            const updatedData = await getDeliveryDetail(delivery.id);
            setDelivery(updatedData);
        } catch (error: any) {
            console.error('Lỗi khi cập nhật phiếu giao hàng:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật phiếu giao hàng');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="p-6">Đang tải chi tiết phiếu giao hàng...</div>;
    }

    if (!delivery) {
        return <div className="p-6">Không tìm thấy phiếu giao hàng</div>;
    }

    return (
        <div className="flex flex-col gap-2.5 xl:flex-row">
            <div className="panel flex-1 px-0 py-6 ltr:xl:mr-6 rtl:xl:ml-6">
                <div className="flex flex-wrap justify-between px-4">
                    <div className="mb-6 w-full lg:w-1/2">
                        <div className="flex shrink-0 items-center text-black dark:text-white">
                            <img src="/assets/images/logo.svg" alt="img" className="w-14" />
                        </div>
                        <div className="mt-6 space-y-1 text-gray-500 dark:text-gray-400">
                            <div>{delivery.customerName}</div>
                            <div>{delivery.customerAddress}</div>
                            <div>{delivery.customerPhone}</div>
                        </div>
                    </div>
                    <div className="w-full lg:w-1/2 lg:max-w-fit">
                        <div className="mt-4 flex items-center">
                            <label htmlFor="orderCode" className="mb-0 flex-1 ltr:mr-2 rtl:ml-2">
                                Mã đơn hàng
                            </label>
                            <div className="form-input w-2/3 lg:w-[250px] bg-gray-100">
                                {delivery.orderCode}
                            </div>
                        </div>
                        <div className="mt-4 flex items-center">
                            <label htmlFor="exportDate" className="mb-0 flex-1 ltr:mr-2 rtl:ml-2">
                                Ngày xuất kho
                            </label>
                            {isEditing ? (
                                <input 
                                    id="exportDate" 
                                    type="date" 
                                    value={exportDate}
                                    onChange={(e) => setExportDate(e.target.value)}
                                    className="form-input w-2/3 lg:w-[250px]" 
                                />
                            ) : (
                                <div className="form-input w-2/3 lg:w-[250px] bg-gray-100">
                                    {exportDate ? new Date(exportDate).toLocaleDateString('vi-VN') : '-'}
                                </div>
                            )}
                        </div>
                        <div className="mt-4 flex items-center">
                            <label htmlFor="deliveryDate" className="mb-0 flex-1 ltr:mr-2 rtl:ml-2">
                                Ngày giao hàng
                            </label>
                            {isEditing ? (
                                <input 
                                    id="deliveryDate" 
                                    type="date" 
                                    value={deliveryDate}
                                    onChange={(e) => setDeliveryDate(e.target.value)}
                                    className="form-input w-2/3 lg:w-[250px]" 
                                />
                            ) : (
                                <div className="form-input w-2/3 lg:w-[250px] bg-gray-100">
                                    {deliveryDate ? new Date(deliveryDate).toLocaleDateString('vi-VN') : 'Chưa giao'}
                                </div>
                            )}
                        </div>
                        <div className="mt-4 flex items-center">
                            <label htmlFor="status" className="mb-0 flex-1 ltr:mr-2 rtl:ml-2">
                                Trạng thái
                            </label>
                            {isEditing ? (
                                <select 
                                    id="status" 
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="form-select w-2/3 lg:w-[250px]"
                                >
                                    {statusList.map((statusOption) => (
                                        <option key={statusOption} value={statusOption}>{statusOption}</option>
                                    ))}
                                </select>
                            ) : (
                                <div className="form-input w-2/3 lg:w-[250px] bg-gray-100">
                                    {status}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <hr className="my-6 border-white-light dark:border-[#1b2e4b]" />

                <div className="mt-8">
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Sản phẩm</th>
                                    <th className="w-1">Số lượng</th>
                                    <th className="w-1">Đơn giá</th>
                                    <th className="w-1">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="!text-center font-semibold">
                                            Không có sản phẩm nào
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((item: DeliveryDetailItemDto) => (
                                        <tr className="align-top" key={item.id}>
                                            <td>
                                                <div className="form-input min-w-[200px] bg-gray-100">
                                                    {item.productName}
                                                </div>
                                            </td>
                                            <td>
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        className="form-input w-32"
                                                        placeholder="Số lượng"
                                                        value={item.quantity}
                                                        min={1}
                                                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                                                    />
                                                ) : (
                                                    <div className="form-input w-32 bg-gray-100">
                                                        {item.quantity}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                <div className="form-input w-32 bg-gray-100">
                                                    {item.unitPrice.toLocaleString()}₫
                                                </div>
                                            </td>
                                            <td>
                                                <div className="form-input w-32 bg-gray-100">
                                                    {item.amount.toLocaleString()}₫
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-6 flex flex-col justify-between px-4 sm:flex-row">
                        <div className="mb-6 sm:mb-0">
                            {isEditing ? (
                                <div className="flex gap-2">
                                    <button 
                                        type="button" 
                                        className="btn btn-primary" 
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary" 
                                        onClick={handleCancel}
                                    >
                                        Hủy
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    type="button" 
                                    className={`btn ${delivery.status === 0 ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={handleEdit}
                                    disabled={delivery.status !== 0}
                                >
                                    <IconEdit className="mr-2" />
                                    Chỉnh sửa
                                </button>
                            )}
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-semibold">
                                Tổng tiền: {totalAmount.toLocaleString()}₫
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-8 px-4">
                    <label htmlFor="notes">Ghi chú</label>
                    {isEditing ? (
                        <textarea 
                            id="notes" 
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="form-textarea min-h-[130px]" 
                            placeholder="Ghi chú...."
                        ></textarea>
                    ) : (
                        <div className="form-textarea min-h-[130px] bg-gray-100">
                            {note || '-'}
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-6 w-full xl:mt-0 xl:w-96">
                <div className="panel">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-1">
                        

                        <button 
                            type="button" 
                            className="btn btn-outline-primary w-full gap-2"
                            onClick={() => router.push('/delivery')}
                        >
                            <IconX className="shrink-0 ltr:mr-2 rtl:ml-2" />
                            Quay lại
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailDeliveryComponent;
