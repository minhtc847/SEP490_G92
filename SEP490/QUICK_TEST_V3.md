# 🚀 QUICK TEST - ZALO API V3

## ⚡ **TEST NGAY - CHỈ CẦN 3 BƯỚC:**

### **Bước 1: Start Server**
```bash
cd "D:\Work Space\SEP490_G92\SEP490"
dotnet run
```

### **Bước 2: Test API v3 Debug**
```bash
curl -X POST "https://localhost:7075/api/ZaloTest/test-debug" --insecure
```

### **Bước 3: Test Webhook với User ID thật**
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

## ✅ **EXPECTED SUCCESS:**

### **API Debug Response:**
```json
{
  "success": true,
  "message": "Debug message sent successfully",
  "timestamp": "2024-12-15T..."
}
```

### **Console Success Logs:**
```
info: Successfully refreshed Zalo access token
info: Zalo message sent successfully to 3621469840359096133. Response: {"error":0,"message":"Success"}
```

### **Webhook Response:**
```
HTTP 200 OK
```

## ❌ **IF STILL FAILING:**

### **Possible Issues:**

1. **User not following OA:**
   - User 3621469840359096133 chưa follow Zalo OA
   - Solution: Follow OA trước khi test

2. **Token still invalid:**
   - Check logs cho token refresh attempts
   - Verify App Secret trong appsettings.json

3. **API v3 format issue:**
   - Check response error codes
   - May need additional v3 specific parameters

## 🔧 **ALTERNATIVE TESTS:**

### **Test với PowerShell (Windows):**
```powershell
# Test Debug
Invoke-RestMethod -Uri "https://localhost:7075/api/ZaloTest/test-debug" -Method POST -SkipCertificateCheck

# Test Custom Message
$body = @{
    userId = "3621469840359096133"
    message = "Test từ PowerShell 🎉"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://localhost:7075/api/ZaloTest/send-message" -Method POST -Body $body -ContentType "application/json" -SkipCertificateCheck
```

### **Check Status:**
```bash
curl -X GET "https://localhost:7075/api/ZaloTest/status" --insecure
```

### **Debug User Info (xem Zalo API trả về gì):**
```bash
curl -X GET "https://localhost:7075/api/ZaloTest/user-debug/3621469840359096133" --insecure
```

## 📊 **WHAT TO WATCH IN CONSOLE:**

### **Success Indicators:**
- ✅ "Successfully refreshed Zalo access token"
- ✅ "Message sent successfully after token refresh"  
- ✅ Response contains `{"error":0,"message":"Success"}`

### **Failure Indicators:**
- ❌ Error -201: User ID invalid
- ❌ Error -240: Still using v2 API
- ❌ Error -216: Token issues

## 🎯 **NEXT ACTION BASED ON RESULTS:**

### **IF SUCCESS:**
🎉 **API v3 migration complete!** Ready for production testing

### **IF FAILURE:**
📋 **Copy paste exact error message** và console logs để debug tiếp

## 🚀 **READY TO TEST!**

**Copy paste các commands trên vào terminal để test ngay!** 

System đã được migrate lên **Zalo API v3** với **real user ID** - should work now! 🎯 