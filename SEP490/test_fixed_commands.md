# 🧪 TEST FIXED ZALO WEBHOOK API

## 🚀 1. Khởi động server:
```bash
cd "D:\Work Space\SEP490_G92\SEP490"
dotnet run
```

## 📱 2. Test Webhook với tiếng Việt có dấu (FIXED):

### PowerShell/CMD (Windows):
```powershell
$body = @{
    app_id = "1823865030574396868"
    sender = @{ id = "3621469840359096133" }
    recipient = @{ id = "1823865030574396868" }
    event = "user_send_text"
    message = @{
        text = "Đặt hàng: GL001 1000x800x6 x2"
        msg_id = "msg_123456"
    }
    timestamp = 1640995200000
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "https://localhost:7075/api/ZaloWebhook/message" `
    -Method POST `
    -Body $body `
    -ContentType "application/json; charset=utf-8" `
    -SkipCertificateCheck
```

### Postman Request:
```
POST https://localhost:7075/api/ZaloWebhook/message
Content-Type: application/json; charset=utf-8

{
  "app_id": "1823865030574396868",
  "sender": {
    "id": "3621469840359096133"
  },
  "recipient": {
    "id": "1823865030574396868"
  },
  "event": "user_send_text",
  "message": {
    "text": "Đặt hàng: GL001 1000x800x6 x2",
    "msg_id": "msg_123456"
  },
  "timestamp": 1640995200000
}
```

### CURL với UTF-8:
```bash
curl -X POST "https://localhost:7075/api/ZaloWebhook/message" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{
    "app_id": "1823865030574396868",
    "sender": { "id": "3621469840359096133" },
    "recipient": { "id": "1823865030574396868" },
    "event": "user_send_text",
    "message": {
      "text": "Đặt hàng: GL001 1000x800x6 x2",
      "msg_id": "msg_123456"
    },
    "timestamp": 1640995200000
  }' --insecure
```

## 📝 3. Test với file JSON:
```bash
# Windows PowerShell
Invoke-RestMethod -Uri "https://localhost:7075/api/ZaloWebhook/message" `
    -Method POST `
    -InFile "test_webhook_utf8.json" `
    -ContentType "application/json; charset=utf-8" `
    -SkipCertificateCheck

# Linux/Mac CURL
curl -X POST "https://localhost:7075/api/ZaloWebhook/message" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d @test_webhook_utf8.json --insecure
```

## ✅ 4. Expected Success Response:
```json
{
  "status": 200,
  "message": "OK"
}
```

## 📊 5. Check Console Logs:
Nếu thành công, bạn sẽ thấy:
```
info: Received Zalo webhook: {"app_id":"1823865030574396868"...}
info: Send message to user test_user_id: ✅ ĐƠN HÀNG ĐÃ TẠO THÀNH CÔNG...
ZALO MESSAGE TO test_user_id: [Full confirmation message]
```

## 🔧 6. Troubleshooting nếu vẫn lỗi:

### Lỗi 400 - Bad Request:
- Check UTF-8 encoding trong tool test
- Verify JSON syntax đúng
- Ensure Content-Type header có charset=utf-8

### Lỗi 500 - Internal Server Error:
- Check database connection
- Verify Customer với phone "0123456789" exists
- Verify GlassStructure với ProductCode "GL001" exists

## 🎯 7. Test Zalo Token & Messaging:

### Check Zalo status:
```bash
curl -X GET "https://localhost:7075/api/ZaloTest/status" --insecure
```

### Test gửi tin nhắn (auto-refresh token):
```bash
curl -X POST "https://localhost:7075/api/ZaloTest/test-debug" --insecure
```

### Test với user cụ thể:
```bash
curl -X POST "https://localhost:7075/api/ZaloTest/send-message" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "3621469840359096133",
    "message": "Test message from API 🚀"
  }' --insecure
```

### Lấy user info:
```bash
curl -X GET "https://localhost:7075/api/ZaloTest/user-info/3621469840359096133" --insecure
```

## 🎯 8. Các test case webhook khác:

### Multiple products:
```json
{
  "message": {
    "text": "Đặt hàng: GL001 1000x800x6 x2, GL002 1200x900x8 x1"
  }
}
```

### Invalid format (should return instructions):
```json
{
  "message": {
    "text": "Xin chào, tôi muốn đặt hàng"
  }
}
```

### Decimal thickness:
```json
{
  "message": {
    "text": "Đặt hàng: GL001 1000x800x6.5 x3"
  }
}
```

## ✅ 9. Expected Results sau khi fix token:

### Zalo Status API:
```json
{
  "status": "running",
  "timestamp": "2024-12-15T10:30:00",
  "message": "Zalo integration is active",
  "note": "Token will auto-refresh if expired"
}
```

### Debug Message Success:
```json
{
  "success": true,
  "message": "Debug message sent successfully",
  "timestamp": "2024-12-15T10:30:00"
}
```

### Console logs khi API v3 hoạt động thành công:
```
warn: First attempt failed, trying to refresh token...
info: Successfully refreshed Zalo access token
info: Message sent successfully after token refresh
info: Zalo message sent successfully to 3621469840359096133. Response: {"error":0,"message":"Success"}
``` 