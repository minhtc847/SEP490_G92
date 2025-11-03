# Tính năng chọn đơn hàng để tạo kế hoạch sản xuất

## Mô tả
Tính năng này cho phép người dùng chọn đơn hàng có trạng thái "Chưa thực hiện" (status = 0) để tạo kế hoạch sản xuất thay vì phải nhập thủ công thông tin đơn hàng.

## Cách hoạt động

### 1. Modal chọn đơn hàng
- Khi click vào button "Thêm mới" trên trang danh sách kế hoạch sản xuất
- Modal sẽ hiển thị danh sách tất cả đơn hàng có status = 0 (Chưa thực hiện)
- Người dùng có thể tìm kiếm theo mã đơn hàng hoặc tên khách hàng
- Click vào đơn hàng để chọn

### 2. Thông tin hiển thị trong modal
- Mã đơn hàng
- Tên khách hàng
- Ngày đặt hàng
- Tổng giá trị đơn hàng
- Trạng thái "Chưa thực hiện"
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
- `fe/app/(defaults)/production-plans/create/service.ts` - Service tạo kế hoạch sản xuất và cập nhật trạng thái

### Backend
- API endpoint `/api/orders` - Lấy danh sách đơn hàng
- API endpoint `/api/orders/{id}` - Lấy chi tiết đơn hàng
- API endpoint `/api/orders/{id}/status` - Cập nhật trạng thái đơn hàng
- `SEP490/Modules/OrderModule/ManageOrder/Controller/OrderController.cs` - Controller xử lý API
- `SEP490/Modules/OrderModule/ManageOrder/Service/OrderService.cs` - Service xử lý logic
- `SEP490/Modules/OrderModule/ManageOrder/DTO/UpdateOrderStatusDto.cs` - DTO cho cập nhật trạng thái

## Luồng hoạt động

1. **Bước 1**: Người dùng click "Thêm mới" trên trang production-plans
2. **Bước 2**: Modal hiển thị danh sách đơn hàng chưa thực hiện
3. **Bước 3**: Người dùng tìm kiếm và chọn đơn hàng
4. **Bước 4**: Click "Tạo kế hoạch sản xuất"
5. **Bước 5**: Chuyển đến trang create với thông tin đơn hàng
6. **Bước 6**: Người dùng chỉnh sửa và tạo kế hoạch sản xuất
7. **Bước 7**: Hệ thống tự động cập nhật trạng thái đơn hàng sang "Đang thực hiện" (status = 1)

## Tính năng bổ sung

### Tìm kiếm
- Tìm theo mã đơn hàng
- Tìm theo tên khách hàng
- Tìm kiếm real-time

### Xem chi tiết
- Nút xem chi tiết đơn hàng trong modal
- Mở trong tab mới để không mất dữ liệu đã chọn

### Validation
- Kiểm tra đơn hàng có status = 0 (Chưa thực hiện)
- Hiển thị thông báo khi không có đơn hàng phù hợp
- Disable button khi chưa chọn đơn hàng

### Cập nhật trạng thái tự động
- Tự động cập nhật trạng thái đơn hàng từ "Chưa thực hiện" (0) sang "Đang thực hiện" (1)
- Xử lý lỗi khi không thể cập nhật trạng thái
- Thông báo kết quả cập nhật cho người dùng

### UX/UI
- Loading state khi tải dữ liệu
- Highlight đơn hàng đã chọn
- Thông tin tổng quan về đơn hàng đã chọn
- Responsive design

## Trạng thái đơn hàng

### Các trạng thái
- **0 (Pending)**: Chưa thực hiện - Đơn hàng mới được tạo
- **1 (Processing)**: Đang thực hiện - Đã tạo kế hoạch sản xuất
- **2 (Delivered)**: Hoàn thành - Đã giao hàng
- **3 (Cancelled)**: Đã hủy - Đơn hàng bị hủy

### Luồng chuyển trạng thái
1. Đơn hàng được tạo → Status = 0 (Chưa thực hiện)
2. Tạo kế hoạch sản xuất → Status = 1 (Đang thực hiện) ← **Tính năng mới**
3. Giao hàng → Status = 2 (Hoàn thành)
4. Hủy đơn hàng → Status = 3 (Đã hủy)

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