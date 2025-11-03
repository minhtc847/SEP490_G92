# Zalo Order Module

## Overview
Module xử lý webhook từ Zalo để hỗ trợ đặt hàng qua chat. Module này chỉ xử lý tin nhắn văn bản và cung cấp phản hồi thích hợp cho các loại sự kiện khác.

## Tính năng chính

### ✅ Hỗ trợ
- **Tin nhắn văn bản**: Xử lý đầy đủ các tin nhắn text từ người dùng
- **4 lệnh chính**: Chỉ xử lý đúng text được chỉ định
- **Đặt hàng**: Hỗ trợ quy trình đặt hàng qua chat với luồng hoàn chỉnh
- **Kiểm tra đơn hàng**: Xem trạng thái đơn hàng
- **Tư vấn sản phẩm**: Cung cấp thông tin về các loại kính
- **Liên hệ nhân viên**: Hỗ trợ kết nối với nhân viên

### ❌ Không hỗ trợ
- **Hình ảnh**: `user_send_image`
- **File**: `user_send_file`
- **Sticker**: `user_send_sticker`
- **Vị trí**: `user_send_location`
- **Danh bạ**: `user_send_contact`
- **Link**: `user_send_link`
- **Text không đúng**: Chỉ xử lý 4 lệnh chính

## 4 Lệnh chính

### 1. "Đặt hàng" - Luồng hoàn chỉnh
- **Bước 1**: Người dùng nhắn "Đặt hàng"
  - **Phản hồi**: "🎉 Bạn đã bắt đầu quá trình đặt hàng!\n\n📞 Vui lòng nhập số điện thoại của bạn để chúng tôi có thể phục vụ tốt hơn:"
  - **Trạng thái**: Chuyển sang `WAITING_FOR_PHONE`

- **Bước 2**: Người dùng nhập số điện thoại
  - **TH1 - Số điện thoại sai định dạng**: 
    - **Phản hồi**: "❌ Số điện thoại không đúng định dạng. Vui lòng nhập lại số điện thoại hợp lệ (VD: 0123456789):"
    - **Trạng thái**: Giữ nguyên `WAITING_FOR_PHONE`
  
  - **TH2 - Số điện thoại đúng định dạng**:
    - **Tìm kiếm customer**: Hệ thống tìm kiếm customer theo số điện thoại
    - **Nếu có customer**: 
      - **Phản hồi**: "Xin chào {CustomerName}!\n\n🎯 Đã bắt đầu tiến hành đặt hàng. Bạn vui lòng nhập thông tin sản phẩm theo định dạng:\n📝 Mã sản phẩm + Loại sản phẩm + Kích thước + Số lượng\n\n💡 Ví dụ: GL001 Kính cường lực 1000x2000mm 2"
    - **Nếu không có customer**:
      - **Phản hồi**: "🎯 Đã bắt đầu tiến hành đặt hàng. Bạn vui lòng nhập thông tin sản phẩm theo định dạng:\n📝 Mã sản phẩm + Loại sản phẩm + Kích thước + Số lượng\n\n💡 Ví dụ: GL001 Kính cường lực 1000x2000mm 2\n\nℹ️ Lưu ý: Thông tin khách hàng sẽ được tạo sau khi hoàn thành đơn hàng."
    - **Trạng thái**: Chuyển sang `WAITING_FOR_PRODUCT_INFO`

- **Bước 3**: Người dùng nhập thông tin sản phẩm
  - **Định dạng**: "Mã sản phẩm + Loại sản phẩm + Kích thước + Số lượng"
  - **Ví dụ**: "GL001 Kính cường lực 1000x2000mm 2"
  - **Nếu đúng định dạng**:
    - **Phản hồi**: "✅ Đã thêm sản phẩm: {ProductCode} - {ProductType} - {Size} - SL: {Quantity}\n\n📝 Nếu quý khách muốn sửa thông tin đơn hàng thì hãy cập nhật lại sản phẩm\n\n🎯 Nếu đã xác nhận hãy nhắn \"Kết thúc\" tôi sẽ gửi bạn bản xác nhận đơn hàng"
  - **Nếu sai định dạng**:
    - **Phản hồi**: "❌ Thông tin sản phẩm không đúng định dạng. Vui lòng nhập lại theo định dạng:\n📝 Mã sản phẩm + Loại sản phẩm + Kích thước + Số lượng\n\n💡 Ví dụ: GL001 Kính cường lực 1000x2000mm 2\n\n🎯 Hoặc nhắn \"Kết thúc\" để hoàn thành đơn hàng"

- **Bước 4**: Người dùng nhắn "Kết thúc"
  - **Nếu chưa có sản phẩm**: "❌ Chưa có sản phẩm nào trong đơn hàng. Vui lòng nhập thông tin sản phẩm trước:"
  - **Nếu đã có sản phẩm**:
    - **Phản hồi**: "🎉 Đơn hàng của bạn đã được tạo thành công!\n\n📋 CHI TIẾT ĐƠN HÀNG:\n\n• {ProductCode} - {ProductType} - {Size} - SL: {Quantity}\n\n📞 Số điện thoại: {PhoneNumber}\n👤 Khách hàng: {CustomerName}\n\n📞 Nhân viên sẽ liên hệ với bạn trong vòng 30 phút để xác nhận đơn hàng.\n📋 Đơn hàng sẽ được xử lý trong 3-5 ngày làm việc.\n🚚 Giao hàng miễn phí trong phạm vi 50km.\n\nCảm ơn bạn đã tin tưởng VNG Glass!"
    - **Trạng thái**: Chuyển sang `CONFIRMING`

### 2. "Đơn hàng"
- **Mô tả**: Xem trạng thái đơn hàng
- **Phản hồi**: Hướng dẫn cung cấp mã đơn hàng hoặc số điện thoại
- **Trạng thái**: Kết thúc cuộc hội thoại

### 3. "Sản phẩm"
- **Mô tả**: Nhận thông tin tư vấn về sản phẩm
- **Phản hồi**: Danh sách các loại kính và thông tin chi tiết
- **Trạng thái**: Giữ nguyên trạng thái hiện tại

### 4. "Nhân viên"
- **Mô tả**: Gọi nhân viên hỗ trợ
- **Phản hồi**: Thông tin liên hệ và giờ làm việc
- **Trạng thái**: Kết thúc cuộc hội thoại

### 4. "Nhân viên" - Chế độ liên hệ trực tiếp
- **Bước 1**: Người dùng nhắn "Nhân viên"
  - **Phản hồi**: "👨‍💼 Bạn đã được kết nối với nhân viên hỗ trợ!\n\n💬 Bạn có thể nhắn tin trực tiếp với nhân viên. Nhân viên sẽ phản hồi trong vòng 15 phút.\n\n🔚 Để kết thúc cuộc trò chuyện với nhân viên, hãy nhắn 'Kết thúc' hoặc 'Quay lại'."
  - **Trạng thái**: Chuyển sang `CONTACTING_STAFF`

- **Bước 2**: Người dùng nhắn tin tự do
  - **Xử lý**: Tin nhắn được forward đến nhân viên thực
  - **Bot response**: Không có (để nhân viên trả lời trực tiếp)
  - **Trạng thái**: Giữ nguyên `CONTACTING_STAFF`

- **Bước 3**: Người dùng nhắn "Kết thúc" hoặc "Quay lại"
  - **Phản hồi**: "✅ Đã kết thúc cuộc trò chuyện với nhân viên.\n\n🔄 Bạn đã quay lại trạng thái ban đầu.\n\n💡 Bạn có thể tiếp tục sử dụng các lệnh:\n• 'Đặt hàng' - Bắt đầu đặt hàng\n• 'Nhân viên' - Liên hệ nhân viên hỗ trợ\n• 'Hủy' - Hủy đơn hàng hiện tại"
  - **Trạng thái**: Quay lại trạng thái `NEW`

### Lưu ý quan trọng
- **Chỉ xử lý đúng text**: Phải gõ chính xác "Đặt hàng", "Đơn hàng", "Sản phẩm", "Nhân viên"
- **Không phân biệt hoa thường**: "đặt hàng" = "Đặt hàng" = "ĐẶT HÀNG"
- **Text khác**: Sẽ nhận thông báo "Lệnh không đúng. Vui lòng thử lại."

## Cấu trúc module

```
ZaloOrderModule/
├── Constants/
│   └── ZaloWebhookConstants.cs      # Các hằng số và cấu hình
├── Controllers/
│   └── ZaloWebhookController.cs     # Controller xử lý webhook
├── DTO/
│   ├── ConversationState.cs         # Trạng thái cuộc hội thoại (DTO)
│   ├── MessageResponse.cs           # Phản hồi tin nhắn
│   ├── ZaloWebhookRequest.cs        # Request từ Zalo
│   └── ZaloWebhookResponse.cs       # Response cho Zalo
├── Services/
│   ├── IZaloWebhookService.cs       # Interface webhook service
│   ├── ZaloWebhookService.cs        # Service xử lý webhook chính
│   ├── ZaloMessageProcessorService.cs # Xử lý tin nhắn
│   ├── ZaloResponseService.cs       # Tạo phản hồi
│   ├── ZaloConversationStateService.cs # Quản lý trạng thái (Database)
│   ├── IZaloCustomerService.cs      # Interface customer service
│   ├── ZaloCustomerService.cs       # Service tìm kiếm customer
│   ├── IZaloStaffForwardService.cs  # Interface staff forward service
│   └── ZaloStaffForwardService.cs   # Service forward tin nhắn đến nhân viên
```

## Database Models

Module sử dụng các model database sau để lưu trữ dữ liệu:

```
DB/Models/
├── ZaloConversationState.cs         # Trạng thái cuộc hội thoại
├── ZaloConversationMessage.cs       # Lịch sử tin nhắn
└── ZaloConversationOrderItem.cs     # Sản phẩm trong đơn hàng
```

## Xử lý sự kiện

### Sự kiện được hỗ trợ
- `user_send_text`: Tin nhắn văn bản (chỉ xử lý 4 lệnh chính)

### Sự kiện không được hỗ trợ
Khi nhận được các sự kiện khác, hệ thống sẽ:
1. Ghi log cảnh báo
2. Gửi tin nhắn thông báo cho người dùng
3. Cung cấp thông tin liên hệ hỗ trợ

### Xử lý tin nhắn văn bản
Hệ thống chỉ xử lý 4 lệnh chính:
1. **"Đặt hàng"** - Bắt đầu quá trình đặt hàng (luồng hoàn chỉnh)
2. **"Đơn hàng"** - Xem trạng thái đơn hàng
3. **"Sản phẩm"** - Thông tin tư vấn sản phẩm
4. **"Nhân viên"** - Liên hệ nhân viên hỗ trợ

**Tin nhắn mẫu cho lệnh không đúng:**
```
Lệnh không đúng. Vui lòng thử lại.

Các lệnh có sẵn:
1. "Đặt hàng" - Bắt đầu đặt hàng
2. "Đơn hàng" - Xem trạng thái đơn hàng
3. "Sản phẩm" - Thông tin tư vấn sản phẩm
4. "Nhân viên" - Gọi nhân viên hỗ trợ
```

## Trạng thái cuộc hội thoại

### Các trạng thái mới
- `WAITING_FOR_PHONE`: Đang chờ người dùng nhập số điện thoại
- `WAITING_FOR_PRODUCT_INFO`: Đang chờ người dùng nhập thông tin sản phẩm
- `CONTACTING_STAFF`: Đang trong chế độ liên hệ với nhân viên

### Dữ liệu cuộc hội thoại
- `CustomerPhone`: Số điện thoại khách hàng
- `CustomerId`: ID khách hàng (nếu tìm thấy)
- `OrderItems`: Danh sách sản phẩm trong đơn hàng
- `IsWaitingForPhone`: Đang chờ số điện thoại
- `IsWaitingForProductInfo`: Đang chờ thông tin sản phẩm

## API Endpoints

### Webhook chính
```
POST /api/zalo-order/webhook
```
Xử lý webhook từ Zalo

### Test endpoints (chỉ development)
```
POST /api/zalo-order/test-webhook
POST /api/zalo-order/send-message
GET /api/zalo-order/health
```

## Cấu hình

### appsettings.json
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "server=localhost;port=3307;database=vng_glass3;user=root;password=tuankietnvu00"
  },
  "Zalo": {
    "AccessToken": "your_access_token_here"
  }
}
```

**Lưu ý**: Module sử dụng Database để lưu trữ dữ liệu conversation. Không cần cấu hình Redis.

## Testing

Chạy tests:
```bash
dotnet test TestVNG/Serivces/ZaloWebhookServiceTests.cs
```

### Test cases
- ✅ Xử lý tin nhắn văn bản thành công
- ✅ Bỏ qua các sự kiện không hỗ trợ
- ✅ Gửi thông báo phù hợp cho người dùng
- ✅ Xử lý lỗi và null request
- ✅ Luồng đặt hàng hoàn chỉnh
- ✅ Validation số điện thoại
- ✅ Tìm kiếm customer
- ✅ Xử lý thông tin sản phẩm

## Logging

Module ghi log chi tiết cho:
- Sự kiện webhook nhận được
- Tin nhắn xử lý thành công/thất bại
- Sự kiện không được hỗ trợ
- Lỗi hệ thống
- Luồng đặt hàng (số điện thoại, customer lookup, sản phẩm)

## Monitoring

### Health check
```
GET /api/zalo-order/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "service": "ZaloOrderWebhook",
  "version": "1.0.0"
}
```

## Hướng dẫn sử dụng

### Cho người dùng
1. **Gõ chính xác** một trong 4 lệnh sau:
   - `Đặt hàng` - Để bắt đầu đặt hàng (luồng hoàn chỉnh)
   - `Đơn hàng` - Để xem trạng thái đơn hàng
   - `Sản phẩm` - Để xem thông tin sản phẩm
   - `Nhân viên` - Để liên hệ nhân viên hỗ trợ

2. **Luồng đặt hàng**:
   - Bước 1: Gõ "Đặt hàng"
   - Bước 2: Nhập số điện thoại (VD: 0123456789)
   - Bước 3: Nhập thông tin sản phẩm (VD: GL001 Kính cường lực 1000x2000mm 2)
   - Bước 4: Gõ "Kết thúc" để hoàn thành

3. **Lưu ý quan trọng:**
   - Phải gõ chính xác text (không phân biệt hoa thường)
   - Không gõ thêm ký tự khác
   - Nếu gõ sai sẽ nhận thông báo hướng dẫn

4. **Nếu gửi hình ảnh/file**, sẽ nhận được hướng dẫn liên hệ hỗ trợ

### Cho developer
1. Đảm bảo cấu hình access token và database connection
2. Kiểm tra logs để debug
3. Sử dụng test endpoints trong development
4. Monitor health check endpoint
5. Test với đúng 4 lệnh chính và luồng đặt hàng

## Troubleshooting

### Lỗi thường gặp
1. **Access token không hợp lệ**: Kiểm tra cấu hình
2. **Database không kết nối**: Kiểm tra connection string
3. **Webhook không nhận được**: Kiểm tra URL và signature
4. **Customer service lỗi**: Kiểm tra database connection

### Debug
1. Kiểm tra logs
2. Sử dụng test endpoints
3. Verify webhook URL trong Zalo Developer Console
4. Kiểm tra Database connection
5. Test customer lookup functionality
