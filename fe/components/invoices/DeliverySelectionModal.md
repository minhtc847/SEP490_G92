# DeliverySelectionModal

## Mô tả
Component `DeliverySelectionModal` được sử dụng để chọn đơn giao hàng đã hoàn thành để tạo hóa đơn bán hàng.

## Tính năng
- Hiển thị danh sách các đơn giao hàng có trạng thái "Đã giao hàng" (FullyDelivered - status = 2)
- Tìm kiếm theo mã đơn hàng hoặc tên khách hàng
- Xem chi tiết đơn giao hàng bao gồm thông tin khách hàng, ngày giao hàng, tổng tiền
- Chọn/bỏ chọn đơn giao hàng để tạo hóa đơn bán hàng
- Hiển thị thông tin đơn giao hàng đã chọn
- Chuyển hướng đến trang tạo hóa đơn với dữ liệu đơn giao hàng đã chọn

## Cách sử dụng

```tsx
import DeliverySelectionModal from '@/components/invoices/DeliverySelectionModal';

const YourComponent = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div>
            <button onClick={() => setIsModalOpen(true)}>
                Tạo hóa đơn từ đơn giao hàng
            </button>
            
            <DeliverySelectionModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};
```

## Props

| Prop | Type | Required | Mô tả |
|------|------|----------|-------|
| `isOpen` | `boolean` | ✅ | Trạng thái hiển thị modal |
| `onClose` | `() => void` | ✅ | Callback khi đóng modal |

## Trạng thái giao hàng

Component này chỉ hiển thị các đơn giao hàng có trạng thái:
- `2` - FullyDelivered (Đã giao hàng)

Các trạng thái khác:
- `0` - NotDelivered (Chưa giao hàng)
- `1` - Delivering (Đang giao hàng)
- `3` - Cancelled (Đã hủy)

## Luồng hoạt động

1. **Mở modal**: Component sẽ tự động tải danh sách đơn giao hàng
2. **Lọc dữ liệu**: Chỉ hiển thị đơn giao hàng có trạng thái "Đã giao hàng"
3. **Tìm kiếm**: Người dùng có thể tìm kiếm theo mã đơn hàng hoặc tên khách hàng
4. **Chọn đơn hàng**: Click vào đơn giao hàng để chọn
5. **Bỏ chọn**: Click lại vào đơn hàng đã chọn hoặc sử dụng nút "Bỏ chọn"
6. **Xem thông tin đã chọn**: Hiển thị thông tin đơn giao hàng đã chọn ở đầu danh sách
7. **Tạo hóa đơn**: Click nút "Tạo hóa đơn" để chuyển đến trang tạo hóa đơn với dữ liệu đã chọn

## Dữ liệu truyền đi

Khi tạo hóa đơn, component sẽ truyền dữ liệu đơn giao hàng qua URL parameter:
```
/invoices/create?delivery={encoded_delivery_data}
```

Dữ liệu bao gồm:
- `id`: ID đơn giao hàng
- `orderCode`: Mã đơn hàng
- `customerName`: Tên khách hàng
- `deliveryDate`: Ngày giao hàng
- `totalAmount`: Tổng tiền
- `note`: Ghi chú (nếu có)

## Tích hợp với AddInvoiceComponent

Component này được thiết kế để hoạt động cùng với `AddInvoiceComponent` trong trang tạo hóa đơn. Khi nhận được dữ liệu đơn giao hàng, `AddInvoiceComponent` sẽ tự động điền thông tin khách hàng và tạo hóa đơn bán hàng. 