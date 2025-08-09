# Zalo Order Module

## Overview
Module xử lý webhook từ Zalo để hỗ trợ đặt hàng qua chat. Module này chỉ xử lý tin nhắn văn bản và cung cấp phản hồi thích hợp cho các loại sự kiện khác.

## Tính năng chính

### ✅ Hỗ trợ
- **Tin nhắn văn bản**: Xử lý đầy đủ các tin nhắn text từ người dùng
- **4 lệnh chính**: Chỉ xử lý đúng text được chỉ định
- **Đặt hàng**: Hỗ trợ quy trình đặt hàng qua chat
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

### 1. "Đặt hàng"
- **Mô tả**: Bắt đầu quá trình đặt hàng
- **Phản hồi**: Hướng dẫn cung cấp thông tin sản phẩm
- **Trạng thái**: Chuyển sang `ORDERING`

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
│   ├── ConversationState.cs         # Trạng thái cuộc hội thoại
│   ├── MessageResponse.cs           # Phản hồi tin nhắn
│   ├── ZaloWebhookRequest.cs        # Request từ Zalo
│   └── ZaloWebhookResponse.cs       # Response cho Zalo
├── Services/
│   ├── IZaloWebhookService.cs       # Interface webhook service
│   ├── ZaloWebhookService.cs        # Service xử lý webhook chính
│   ├── ZaloMessageProcessorService.cs # Xử lý tin nhắn
│   ├── ZaloResponseService.cs       # Tạo phản hồi
│   └── ZaloConversationStateService.cs # Quản lý trạng thái
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
1. **"Đặt hàng"** - Bắt đầu quá trình đặt hàng
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
  "Zalo": {
    "AccessToken": "your_access_token_here"
  }
}
```

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

## Logging

Module ghi log chi tiết cho:
- Sự kiện webhook nhận được
- Tin nhắn xử lý thành công/thất bại
- Sự kiện không được hỗ trợ
- Lỗi hệ thống

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
   - `Đặt hàng` - Để bắt đầu đặt hàng
   - `Đơn hàng` - Để xem trạng thái đơn hàng
   - `Sản phẩm` - Để xem thông tin sản phẩm
   - `Nhân viên` - Để liên hệ nhân viên hỗ trợ

2. **Lưu ý quan trọng:**
   - Phải gõ chính xác text (không phân biệt hoa thường)
   - Không gõ thêm ký tự khác
   - Nếu gõ sai sẽ nhận thông báo hướng dẫn

3. **Nếu gửi hình ảnh/file**, sẽ nhận được hướng dẫn liên hệ hỗ trợ

### Cho developer
1. Đảm bảo cấu hình access token
2. Kiểm tra logs để debug
3. Sử dụng test endpoints trong development
4. Monitor health check endpoint
5. Test với đúng 4 lệnh chính

## Troubleshooting

### Lỗi thường gặp
1. **Access token không hợp lệ**: Kiểm tra cấu hình
2. **Redis không kết nối**: Kiểm tra connection string
3. **Webhook không nhận được**: Kiểm tra URL và signature

### Debug
1. Kiểm tra logs
2. Sử dụng test endpoints
3. Verify webhook URL trong Zalo Developer Console
