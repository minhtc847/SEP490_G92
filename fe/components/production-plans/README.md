# Tính năng chọn đơn hàng để tạo kế hoạch sản xuất

## Mô tả
Tính năng này cho phép người dùng chọn đơn hàng có trạng thái "Chờ xử lý" (status = 0) để tạo kế hoạch sản xuất thay vì phải nhập thủ công thông tin đơn hàng.

## Cách hoạt động

### 1. Modal chọn đơn hàng
- Khi click vào button "Thêm mới" trên trang danh sách kế hoạch sản xuất
- Modal sẽ hiển thị danh sách tất cả đơn hàng có status = 0 (pending)
- Người dùng có thể tìm kiếm theo mã đơn hàng hoặc tên khách hàng
- Click vào đơn hàng để chọn

### 2. Thông tin hiển thị trong modal
- Mã đơn hàng
- Tên khách hàng
- Ngày đặt hàng
- Tổng giá trị đơn hàng
- Trạng thái "Chờ xử lý"
- Nút xem chi tiết đơn hàng

### 3. Chuyển dữ liệu
- Thông tin đơn hàng được encode và truyền qua URL parameter
- Trang tạo kế hoạch sản xuất sẽ tự động load thông tin đơn hàng
- Người dùng có thể chỉnh sửa các thông số sản xuất

## Các file liên quan

### Frontend
- `fe/components/production-plans/OrderSelectionModal.tsx` - Modal chọn đơn hàng
- `fe/app/(defaults)/production-plans/page.tsx` - Trang danh sách kế hoạch sản xuất
- `fe/components/VNG/manager/production-plans/create.tsx` - Component tạo kế hoạch sản xuất
- `fe/app/(defaults)/sales-order/service.ts` - Service lấy danh sách đơn hàng

### Backend
- API endpoint `/api/orders` - Lấy danh sách đơn hàng
- API endpoint `/api/orders/{id}` - Lấy chi tiết đơn hàng

## Luồng hoạt động

1. **Bước 1**: Người dùng click "Thêm mới" trên trang production-plans
2. **Bước 2**: Modal hiển thị danh sách đơn hàng pending
3. **Bước 3**: Người dùng tìm kiếm và chọn đơn hàng
4. **Bước 4**: Click "Tạo kế hoạch sản xuất"
5. **Bước 5**: Chuyển đến trang create với thông tin đơn hàng
6. **Bước 6**: Người dùng chỉnh sửa và tạo kế hoạch sản xuất

## Tính năng bổ sung

### Tìm kiếm
- Tìm theo mã đơn hàng
- Tìm theo tên khách hàng
- Tìm kiếm real-time

### Xem chi tiết
- Nút xem chi tiết đơn hàng trong modal
- Mở trong tab mới để không mất dữ liệu đã chọn

### Validation
- Kiểm tra đơn hàng có status = 0
- Hiển thị thông báo khi không có đơn hàng phù hợp
- Disable button khi chưa chọn đơn hàng

### UX/UI
- Loading state khi tải dữ liệu
- Highlight đơn hàng đã chọn
- Thông tin tổng quan về đơn hàng đã chọn
- Responsive design

## Lưu ý kỹ thuật

### URL Parameter
```typescript
// Encode order data
const orderData = encodeURIComponent(JSON.stringify(selectedOrder));
router.push(`/production-plans/create?order=${orderData}`);

// Decode order data
const decodedOrder = JSON.parse(decodeURIComponent(orderParam)) as OrderDto;
```

### Error Handling
- Xử lý lỗi khi parse JSON
- Xử lý lỗi khi tải danh sách đơn hàng
- Fallback khi không có dữ liệu

### Performance
- Chỉ tải dữ liệu khi modal mở
- Debounce search input
- Lazy loading cho danh sách lớn

## Tương lai

### Cải tiến có thể thêm
1. **Filter nâng cao**: Filter theo ngày, giá trị, loại sản phẩm
2. **Bulk selection**: Chọn nhiều đơn hàng cùng lúc
3. **Template**: Lưu template cho kế hoạch sản xuất
4. **Auto-suggest**: Gợi ý đơn hàng dựa trên lịch sử
5. **Integration**: Tích hợp với hệ thống quản lý kho 