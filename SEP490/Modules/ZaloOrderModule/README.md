# Zalo Order Module

## Overview
Module xử lý webhook từ Zalo để hỗ trợ đặt hàng qua chat. Module này chỉ xử lý tin nhắn văn bản và cung cấp phản hồi thích hợp cho các loại sự kiện khác.

## Tính năng chính

### ✅ Hỗ trợ
- **Tin nhắn văn bản**: Xử lý đầy đủ các tin nhắn text từ người dùng
- **Đặt hàng**: Hỗ trợ quy trình đặt hàng qua chat
- **Tư vấn sản phẩm**: Cung cấp thông tin về các loại kính
- **Báo giá**: Hỗ trợ tư vấn giá cả
- **Quản lý trạng thái**: Theo dõi trạng thái cuộc hội thoại

### ❌ Không hỗ trợ
- **Hình ảnh**: `user_send_image`
- **File**: `user_send_file`
- **Sticker**: `user_send_sticker`
- **Vị trí**: `user_send_location`
- **Danh bạ**: `user_send_contact`
- **Link**: `user_send_link`

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
- `user_send_text`: Tin nhắn văn bản

### Sự kiện không được hỗ trợ
Khi nhận được các sự kiện khác, hệ thống sẽ:
1. Ghi log cảnh báo
2. Gửi tin nhắn thông báo cho người dùng
3. Cung cấp thông tin liên hệ hỗ trợ

**Tin nhắn mẫu:**
```
Xin lỗi, tôi chỉ có thể xử lý tin nhắn văn bản. Vui lòng gửi tin nhắn bằng chữ hoặc liên hệ nhân viên hỗ trợ.

📞 Hotline: 1900-xxxx
📧 Email: support@vngglass.com
💬 Zalo: @vngglass_support
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
1. Gửi tin nhắn văn bản để tương tác
2. Sử dụng các từ khóa: "đặt hàng", "sản phẩm", "giá", "liên hệ"
3. Nếu gửi hình ảnh/file, sẽ nhận được hướng dẫn liên hệ hỗ trợ

### Cho developer
1. Đảm bảo cấu hình access token
2. Kiểm tra logs để debug
3. Sử dụng test endpoints trong development
4. Monitor health check endpoint

## Troubleshooting

### Lỗi thường gặp
1. **Access token không hợp lệ**: Kiểm tra cấu hình
2. **Redis không kết nối**: Kiểm tra connection string
3. **Webhook không nhận được**: Kiểm tra URL và signature

### Debug
1. Kiểm tra logs
2. Sử dụng test endpoints
3. Verify webhook URL trong Zalo Developer Console
