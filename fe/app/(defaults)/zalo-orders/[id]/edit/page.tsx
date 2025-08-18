'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import IconArrowLeft from '@/components/icon/icon-arrow-left';
import IconPlus from '@/components/icon/icon-plus';
import IconTrash from '@/components/icon/icon-trash';
import zaloOrderService, { ZaloOrder, UpdateZaloOrder, UpdateZaloOrderDetail } from '@/app/(defaults)/zalo-orders/zaloOrderService';

const EditZaloOrder = () => {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [zaloOrder, setZaloOrder] = useState<ZaloOrder | null>(null);
    const [formData, setFormData] = useState<UpdateZaloOrder>({
        orderCode: '',
        customerName: '',
        customerPhone: '',
        customerAddress: '',
        orderDate: new Date().toISOString().split('T')[0],
        totalAmount: 0,
        status: 'Pending',
        note: '',
        zaloOrderDetails: []
    });

    const [orderDetails, setOrderDetails] = useState<UpdateZaloOrderDetail[]>([]);

    useEffect(() => {
        if (params.id) {
            fetchZaloOrder(params.id as string);
        }
    }, [params.id]);

    const fetchZaloOrder = async (id: string) => {
        try {
            const data = await zaloOrderService.getZaloOrderById(parseInt(id));
            setZaloOrder(data);
            
            // Set form data
            setFormData({
                orderCode: data.orderCode || '',
                customerName: data.customerName || '',
                customerPhone: data.customerPhone || '',
                customerAddress: data.customerAddress || '',
                orderDate: data.orderDate.split('T')[0],
                totalAmount: data.totalAmount,
                status: data.status,
                note: data.note || '',
                zaloOrderDetails: data.zaloOrderDetails.map(detail => ({
                    id: detail.id,
                    productName: detail.productName,
                    productCode: detail.productCode,
                    height: detail.height,
                    width: detail.width,
                    thickness: detail.thickness,
                    quantity: detail.quantity,
                    unitPrice: detail.unitPrice,
                    totalPrice: detail.totalPrice
                }))
            });

            // Set order details
            setOrderDetails(data.zaloOrderDetails.map(detail => ({
                id: detail.id,
                productName: detail.productName,
                productCode: detail.productCode,
                height: detail.height,
                width: detail.width,
                thickness: detail.thickness,
                quantity: detail.quantity,
                unitPrice: detail.unitPrice,
                totalPrice: detail.totalPrice
            })));
        } catch (error) {
            console.error('Error fetching Zalo order:', error);
            alert('Có lỗi xảy ra khi tải thông tin đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const addOrderDetail = () => {
        const newDetail: UpdateZaloOrderDetail = {
            id: Date.now(), // Temporary ID for new items
            productName: '',
            productCode: '',
            height: '',
            width: '',
            thickness: '',
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

    const updateOrderDetail = (index: number, field: keyof UpdateZaloOrderDetail, value: string | number) => {
        const updatedDetails = [...orderDetails];
        updatedDetails[index] = { ...updatedDetails[index], [field]: value };

        // Calculate total price for this detail
        if (field === 'quantity' || field === 'unitPrice') {
            const quantity = field === 'quantity' ? Number(value) : updatedDetails[index].quantity;
            const unitPrice = field === 'unitPrice' ? Number(value) : updatedDetails[index].unitPrice;
            // Giữ nguyên độ chính xác của phép nhân
            updatedDetails[index].totalPrice = Math.round(quantity * unitPrice * 100) / 100;
        }

        setOrderDetails(updatedDetails);
        updateTotalAmount(updatedDetails);
    };

    const updateTotalAmount = (details: UpdateZaloOrderDetail[]) => {
        const total = details.reduce((sum, detail) => sum + detail.totalPrice, 0);
        // Giữ nguyên độ chính xác của tổng
        setFormData(prev => ({ ...prev, totalAmount: Math.round(total * 100) / 100 }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const submitData = {
                ...formData,
                zaloOrderDetails: orderDetails
            };

            await zaloOrderService.updateZaloOrder(parseInt(params.id as string), submitData);
            alert('Cập nhật đơn hàng thành công!');
            router.push(`/zalo-orders/${params.id}`);
        } catch (error) {
            console.error('Error updating Zalo order:', error);
            alert('Có lỗi xảy ra khi cập nhật đơn hàng');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin border-4 border-primary border-l-transparent rounded-full w-12 h-12"></div>
            </div>
        );
    }

    if (!zaloOrder) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-gray-500 text-lg">Không tìm thấy đơn hàng</div>
                    <button
                        type="button"
                        className="btn btn-primary mt-4"
                        onClick={() => router.push('/zalo-orders')}
                    >
                        <IconArrowLeft className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                        Quay Lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="panel mt-6">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => router.push(`/zalo-orders/${params.id}`)}
                        >
                            <IconArrowLeft className="w-4 h-4" />
                        </button>
                        <h5 className="font-semibold text-lg dark:text-white-light">
                            Chỉnh Sửa Đơn Hàng: {zaloOrder.orderCode}
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
                                        value={zaloOrder.zaloUserId}
                                        disabled
                                        placeholder="Zalo User ID"
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
                                            <th>Mã Sản Phẩm</th>
                                            <th>Kích Thước</th>
                                            <th>Số Lượng</th>
                                            <th>Đơn Giá</th>
                                            <th>Thành Tiền</th>
                                            <th>Thao Tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orderDetails.map((detail, index) => (
                                            <tr key={detail.id}>
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
                                                        type="text"
                                                        className="form-input"
                                                        value={detail.productCode}
                                                        onChange={(e) => updateOrderDetail(index, 'productCode', e.target.value)}
                                                        placeholder="Mã sản phẩm"
                                                    />
                                                </td>
                                                <td>
                                                    <div className="flex gap-1">
                                                        <input
                                                            type="text"
                                                            className="form-input w-16"
                                                            value={detail.height || ''}
                                                            onChange={(e) => updateOrderDetail(index, 'height', e.target.value)}
                                                            placeholder="Cao"
                                                        />
                                                        <span className="text-gray-500">×</span>
                                                        <input
                                                            type="text"
                                                            className="form-input w-16"
                                                            value={detail.width || ''}
                                                            onChange={(e) => updateOrderDetail(index, 'width', e.target.value)}
                                                            placeholder="Rộng"
                                                        />
                                                        <span className="text-gray-500">×</span>
                                                        <input
                                                            type="text"
                                                            className="form-input w-16"
                                                            value={detail.thickness || ''}
                                                            onChange={(e) => updateOrderDetail(index, 'thickness', e.target.value)}
                                                            placeholder="Dày"
                                                        />
                                                    </div>
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
                                                        onChange={(e) => updateOrderDetail(index, 'unitPrice', Number(e.target.value) || 0)}
                                                        min="0"
                                                        step="0.01"
                                                        required
                                                    />
                                                </td>
                                                <td>
                                                    <div className="font-semibold">
                                                        {new Intl.NumberFormat('vi-VN', {
                                                            style: 'currency',
                                                            currency: 'VND',
                                                            minimumFractionDigits: 0,
                                                            maximumFractionDigits: 0
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
                                            <td colSpan={5} className="text-right">Tổng Cộng:</td>
                                            <td>
                                                {new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND',
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 0
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
                            onClick={() => router.push(`/zalo-orders/${params.id}`)}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={saving || orderDetails.length === 0}
                        >
                            {saving ? 'Đang cập nhật...' : 'Cập Nhật Đơn Hàng'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditZaloOrder;
