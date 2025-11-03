# Invoice OrderSelectionModal

## Mô tả
Component `OrderSelectionModal` được sử dụng để chọn đơn mua hàng đã nhập hàng để tạo hóa đơn.

## Tính năng
- Hiển thị danh sách các đơn mua hàng có trạng thái "Đã nhập hàng" (Imported)
- Tìm kiếm theo mã đơn hàng, nhà cung cấp hoặc khách hàng
- Xem chi tiết đơn mua hàng
- Chọn đơn hàng để tạo hóa đơn
- Chuyển hướng đến trang tạo hóa đơn với dữ liệu đơn hàng đã chọn

## Cách sử dụng

```tsx
import OrderSelectionModal from '@/components/invoices/OrderSelectionModal';

const YourComponent = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div>
            <button onClick={() => setIsModalOpen(true)}>
                Tạo hóa đơn từ đơn mua hàng
            </button>
            
            <OrderSelectionModal 
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

## Luồng hoạt động

1. **Mở modal**: Component sẽ tự động tải danh sách đơn mua hàng có trạng thái "Imported"
2. **Tìm kiếm**: Người dùng có thể tìm kiếm theo mã đơn hàng, nhà cung cấp hoặc khách hàng
3. **Chọn đơn hàng**: Click vào đơn hàng để chọn
4. **Xem chi tiết**: Click nút "Xem" để mở chi tiết đơn hàng trong tab mới
5. **Tạo hóa đơn**: Click "Tạo hóa đơn" để chuyển đến trang tạo hóa đơn với dữ liệu đơn hàng đã chọn

## Dữ liệu được truyền

Khi tạo hóa đơn, dữ liệu đơn hàng được encode và truyền qua URL parameter:
```
/invoices/create?order={encodedOrderData}
```

Dữ liệu bao gồm:
- `id`: ID đơn hàng
- `code`: Mã đơn hàng
- `date`: Ngày đặt hàng
- `description`: Mô tả
- `totalValue`: Tổng giá trị
- `status`: Trạng thái
- `supplierName`: Tên nhà cung cấp
- `customerName`: Tên khách hàng
- `employeeName`: Tên nhân viên

## Lưu ý

- Chỉ hiển thị đơn mua hàng có trạng thái "Imported" (đã nhập hàng)
- Component sử dụng API `getPurchaseOrders()` từ service
- Hỗ trợ responsive design
- Có loading state và error handling
- Sử dụng Tailwind CSS cho styling 