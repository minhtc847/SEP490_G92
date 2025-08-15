'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import IconArrowLeft from '@/components/icon/icon-arrow-left';
import IconPlus from '@/components/icon/icon-plus';
import IconTrash from '@/components/icon/icon-trash';
import zaloOrderService, { CreateZaloOrder, CreateZaloOrderDetail } from '@/services/zaloOrderService';

const CreateZaloOrders = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CreateZaloOrder>({
        orderCode: '',
        zaloUserId: '',
        customerName: '',
        customerPhone: '',
        customerAddress: '',
        orderDate: new Date().toISOString().split('T')[0],
        totalAmount: 0,
        status: 'Pending',
        note: '',
        zaloOrderDetails: []
    });

    const [orderDetails, setOrderDetails] = useState<CreateZaloOrderDetail[]>([]);

    const addOrderDetail = () => {
        const newDetail: CreateZaloOrderDetail = {
            productName: '',
            quantity: 1,
            unitPrice: 0,
            totalPrice: 0
        };
        setOrderDetails([...orderDetails, newDetail]);
    };

    const removeOrderDetail = (index: number) => {
        const updatedDetails = orderDetails.filter((_, i) => i !== index);
        setOrderDetails(updatedDetails);
        updateTotalAmount(updatedDetails);
    };

    const updateOrderDetail = (index: number, field: keyof CreateZaloOrderDetail, value: string | number) => {
        const updatedDetails = [...orderDetails];
        updatedDetails[index] = { ...updatedDetails[index], [field]: value };

        // Calculate total price for this detail
        if (field === 'quantity' || field === 'unitPrice') {
            const quantity = field === 'quantity' ? Number(value) : updatedDetails[index].quantity;
            const unitPrice = field === 'unitPrice' ? Number(value) : updatedDetails[index].unitPrice;
            updatedDetails[index].totalPrice = quantity * unitPrice;
        }

        setOrderDetails(updatedDetails);
        updateTotalAmount(updatedDetails);
    };

    const updateTotalAmount = (details: CreateZaloOrderDetail[]) => {
        const total = details.reduce((sum, detail) => sum + detail.totalPrice, 0);
        setFormData(prev => ({ ...prev, totalAmount: total }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submitData = {
                ...formData,
                zaloOrderDetails: orderDetails
            };

            await zaloOrderService.createZaloOrder(submitData);
            router.push('/zalo-orders');
        } catch (error) {
            console.error('Error creating Zalo order:', error);
            alert('Có lỗi xảy ra khi tạo đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="panel mt-6">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => router.push('/zalo-orders')}
                        >
                            <IconArrowLeft className="w-4 h-4" />
                        </button>
                        <h5 className="font-semibold text-lg dark:text-white-light">
                            Tạo Đơn Hàng Zalo Mới
                        </h5>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Order Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="panel">
                            <h6 className="text-lg font-semibold mb-4">Thông Tin Đơn Hàng</h6>
                            <div className="space-y-4">
                                <div>
                                    <label className="form-label">Mã Đơn Hàng</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.orderCode}
                                        onChange={(e) => setFormData(prev => ({ ...prev, orderCode: e.target.value }))}
                                        placeholder="Nhập mã đơn hàng"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Zalo User ID</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.zaloUserId}
                                        onChange={(e) => setFormData(prev => ({ ...prev, zaloUserId: e.target.value }))}
                                        placeholder="Nhập Zalo User ID"
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Ngày Đặt</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={formData.orderDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, orderDate: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Trạng Thái</label>
                                    <select
                                        className="form-select"
                                        value={formData.status}
                                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                    >
                                        <option value="Pending">Chờ xử lý</option>
                                        <option value="Confirmed">Đã xác nhận</option>
                                        <option value="Processing">Đang xử lý</option>
                                        <option value="Completed">Hoàn thành</option>
                                        <option value="Cancelled">Đã hủy</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="panel">
                            <h6 className="text-lg font-semibold mb-4">Thông Tin Khách Hàng</h6>
                            <div className="space-y-4">
                                <div>
                                    <label className="form-label">Tên Khách Hàng</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.customerName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                                        placeholder="Nhập tên khách hàng"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Số Điện Thoại</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.customerPhone}
                                        onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                                        placeholder="Nhập số điện thoại"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Địa Chỉ</label>
                                    <textarea
                                        className="form-textarea"
                                        value={formData.customerAddress}
                                        onChange={(e) => setFormData(prev => ({ ...prev, customerAddress: e.target.value }))}
                                        placeholder="Nhập địa chỉ"
                                        rows={3}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Ghi Chú</label>
                                    <textarea
                                        className="form-textarea"
                                        value={formData.note}
                                        onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                                        placeholder="Nhập ghi chú (nếu có)"
                                        rows={2}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Details */}
                    <div className="panel mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h6 className="text-lg font-semibold">Chi Tiết Sản Phẩm</h6>
                            <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={addOrderDetail}
                            >
                                <IconPlus className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                                Thêm Sản Phẩm
                            </button>
                        </div>

                        {orderDetails.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                Chưa có sản phẩm nào. Vui lòng thêm sản phẩm.
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table-striped">
                                    <thead>
                                        <tr>
                                            <th>Tên Sản Phẩm</th>
                                            <th>Số Lượng</th>
                                            <th>Đơn Giá</th>
                                            <th>Thành Tiền</th>
                                            <th>Thao Tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orderDetails.map((detail, index) => (
                                            <tr key={index}>
                                                <td>
                                                    <input
                                                        type="text"
                                                        className="form-input"
                                                        value={detail.productName}
                                                        onChange={(e) => updateOrderDetail(index, 'productName', e.target.value)}
                                                        placeholder="Tên sản phẩm"
                                                        required
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-input"
                                                        value={detail.quantity}
                                                        onChange={(e) => updateOrderDetail(index, 'quantity', parseInt(e.target.value) || 0)}
                                                        min="1"
                                                        required
                                                    />
                                                </td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-input"
                                                        value={detail.unitPrice}
                                                        onChange={(e) => updateOrderDetail(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                        min="0"
                                                        step="1000"
                                                        required
                                                    />
                                                </td>
                                                <td>
                                                    <div className="font-semibold">
                                                        {new Intl.NumberFormat('vi-VN', {
                                                            style: 'currency',
                                                            currency: 'VND'
                                                        }).format(detail.totalPrice)}
                                                    </div>
                                                </td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => removeOrderDetail(index)}
                                                    >
                                                        <IconTrash className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="font-semibold">
                                            <td colSpan={3} className="text-right">Tổng Cộng:</td>
                                            <td>
                                                {new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND'
                                                }).format(formData.totalAmount)}
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex items-center justify-end gap-4">
                        <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() => router.push('/zalo-orders')}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || orderDetails.length === 0}
                        >
                            {loading ? 'Đang tạo...' : 'Tạo Đơn Hàng'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateZaloOrders;
