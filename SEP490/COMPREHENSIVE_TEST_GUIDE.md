# 🧪 VNG GLASS - COMPREHENSIVE TESTING GUIDE

## 📋 OVERVIEW

Hướng dẫn test toàn diện cho hệ thống **conversation-based multi-step ordering** sau khi cleanup và refactor.

---

## 🚀 QUICK START TESTING

### **Start Server:**
```bash
cd "D:\Work Space\SEP490_G92\SEP490"
dotnet run
```

### **Main Endpoints:**
- **Conversation API:** `http://localhost:5000/api/ZaloDynamic/chat`
- **Webhook API:** `http://localhost:5000/api/ZaloWebhook/message`  
- **Test Endpoints:** `http://localhost:5000/api/ZaloTest/*`

---

## 🎯 CORE FUNCTIONALITY TESTS

### **1. Session Control**

```bash
# Test Session Start
curl -X POST "http://localhost:5000/api/ZaloDynamic/chat" \
-H "Content-Type: application/json; charset=utf-8" \
-d '{"userId":"session_test","message":"Bắt đầu"}'

# Expected: Session start message with buttons

# Test Session End  
curl -X POST "http://localhost:5000/api/ZaloDynamic/chat" \
-H "Content-Type: application/json; charset=utf-8" \
-d '{"userId":"session_test","message":"Kết thúc"}'

# Expected: Session end message
```

### **2. Step-by-Step Ordering**

```bash
# Step 1: Start ordering
curl -X POST "http://localhost:5000/api/ZaloDynamic/chat" \
-H "Content-Type: application/json; charset=utf-8" \
-d '{"userId":"step_test","message":"Đặt hàng","userPhone":"0914913696"}'

# Step 2: Product code
curl -X POST "http://localhost:5000/api/ZaloDynamic/chat" \
-H "Content-Type: application/json; charset=utf-8" \
-d '{"userId":"step_test","message":"N-EI 15"}'

# Step 3: Dimensions
curl -X POST "http://localhost:5000/api/ZaloDynamic/chat" \
-H "Content-Type: application/json; charset=utf-8" \
-d '{"userId":"step_test","message":"1000x800x6"}'

# Step 4: Quantity
curl -X POST "http://localhost:5000/api/ZaloDynamic/chat" \
-H "Content-Type: application/json; charset=utf-8" \
-d '{"userId":"step_test","message":"2"}'

# Step 5: Confirm
curl -X POST "http://localhost:5000/api/ZaloDynamic/chat" \
-H "Content-Type: application/json; charset=utf-8" \
-d '{"userId":"step_test","message":"Xác nhận"}'
```

### **3. Multiple Items**

```bash
# After step 4, choose to add more products
curl -X POST "http://localhost:5000/api/ZaloDynamic/chat" \
-H "Content-Type: application/json; charset=utf-8" \
-d '{"userId":"multi_test","message":"Thêm sản phẩm"}'

# Add second product: GL001
curl -X POST "http://localhost:5000/api/ZaloDynamic/chat" \
-H "Content-Type: application/json; charset=utf-8" \
-d '{"userId":"multi_test","message":"GL001"}'

# Continue with dimensions and quantity...
```

### **4. Backward Compatibility**

```bash
# Single product full order
curl -X POST "http://localhost:5000/api/ZaloDynamic/chat" \
-H "Content-Type: application/json; charset=utf-8" \
-d '{"userId":"compat_test","message":"Đặt hàng: N-EI 15 1000x800x6 x2","userPhone":"0914913696"}'

# Multiple products full order
curl -X POST "http://localhost:5000/api/ZaloDynamic/chat" \
-H "Content-Type: application/json; charset=utf-8" \
-d '{"userId":"compat_test2","message":"Đặt hàng: N-EI 15 1000x800x6 x2, GL001 1200x900x8 x1","userPhone":"0914913696"}'
```

---

## 🔧 PRODUCT CODE VARIATIONS

### **Test Different Product Code Formats:**

```bash
# Basic alphanumeric
curl -X POST "http://localhost:5000/api/ZaloDynamic/chat" \
-H "Content-Type: application/json; charset=utf-8" \
-d '{"userId":"code_test1","message":"GL001","userPhone":"0914913696"}'

# With hyphen (no space)
curl -X POST "http://localhost:5000/api/ZaloDynamic/chat" \
-H "Content-Type: application/json; charset=utf-8" \
-d '{"userId":"code_test2","message":"N-EI15","userPhone":"0914913696"}'

# With hyphen and space (FIXED!)
curl -X POST "http://localhost:5000/api/ZaloDynamic/chat" \
-H "Content-Type: application/json; charset=utf-8" \
-d '{"userId":"code_test3","message":"N-EI 15","userPhone":"0914913696"}'

# Complex codes
curl -X POST "http://localhost:5000/api/ZaloDynamic/chat" \
-H "Content-Type: application/json; charset=utf-8" \
-d '{"userId":"code_test4","message":"ABC-XYZ 30","userPhone":"0914913696"}'
```

---

## ❌ ERROR HANDLING TESTS

### **1. Invalid Inputs**

```bash
# Invalid product code
curl -X POST "http://localhost:5000/api/ZaloDynamic/chat" \
-H "Content-Type: application/json; charset=utf-8" \
-d '{"userId":"error_test","message":"X","userPhone":"0914913696"}'

# Invalid dimensions
curl -X POST "http://localhost:5000/api/ZaloDynamic/chat" \
-H "Content-Type: application/json; charset=utf-8" \
-d '{"userId":"error_test","message":"invalid dimensions","userPhone":"0914913696"}'

# Invalid quantity
curl -X POST "http://localhost:5000/api/ZaloDynamic/chat" \
-H "Content-Type: application/json; charset=utf-8" \
-d '{"userId":"error_test","message":"abc","userPhone":"0914913696"}'
```

### **2. Cancel and Recovery**

```bash
# Cancel order
curl -X POST "http://localhost:5000/api/ZaloDynamic/chat" \
-H "Content-Type: application/json; charset=utf-8" \
-d '{"userId":"cancel_test","message":"Hủy","userPhone":"0914913696"}'

# Go back a step
curl -X POST "http://localhost:5000/api/ZaloDynamic/chat" \
-H "Content-Type: application/json; charset=utf-8" \
-d '{"userId":"back_test","message":"Quay lại","userPhone":"0914913696"}'
```

---

## 🔄 WEBHOOK INTEGRATION TESTS

### **1. Test Webhook Endpoint**

```bash
# Basic webhook test
curl -X POST "http://localhost:5000/api/ZaloWebhook/message" \
-H "Content-Type: application/json; charset=utf-8" \
-d '{
  "app_id": "1823865030574396868",
  "sender": {"id": "3621469840359096133"},
  "recipient": {"id": "1823865030574396868"},
  "event": "user_send_text",
  "message": {
    "text": "Đặt hàng: N-EI 15 1000x800x6 x2",
    "msg_id": "msg_123456"
  },
  "timestamp": 1640995200000
}'
```

### **2. UTF-8 Character Support**

```bash
# Vietnamese characters (FIXED!)
curl -X POST "http://localhost:5000/api/ZaloWebhook/message" \
-H "Content-Type: application/json; charset=utf-8" \
-d '{
  "sender": {"id": "3621469840359096133"},
  "message": {"text": "Đặt hàng: N-EI 15 1000x800x6 x2"}
}'
```

---

## 🧪 TESTING UTILITIES

### **1. Zalo Test Controller**

```bash
# Check integration status
curl -X GET "http://localhost:5000/api/ZaloTest/status"

# Send test message
curl -X POST "http://localhost:5000/api/ZaloTest/send-message" \
-H "Content-Type: application/json" \
-d '{"userId":"3621469840359096133","message":"Test message"}'

# Get user info
curl -X GET "http://localhost:5000/api/ZaloTest/user-info/3621469840359096133"

# Debug user info
curl -X GET "http://localhost:5000/api/ZaloTest/user-debug/3621469840359096133"
```

### **2. Order Service Tests**

```bash
# Test Zalo Order API
curl -X POST "http://localhost:5000/api/ZaloOrder/create" \
-H "Content-Type: application/json" \
-d '{
  "phoneNumber": "0914913696",
  "items": [
    {
      "productCode": "N-EI 15",
      "height": "1000",
      "width": "800", 
      "thickness": 6,
      "quantity": 2
    }
  ]
}'

# Get sample request
curl -X GET "http://localhost:5000/api/ZaloOrder/sample"
```

---

## 🎯 EXPECTED RESPONSES

### **1. Successful Order Creation**

```json
{
  "version": "chatbot",
  "content": {
    "messages": [
      {
        "type": "text",
        "text": "✅ ĐƠN HÀNG ĐÃ TẠO THÀNH CÔNG!\n\n🆔 Mã đơn hàng: ORD123456\n💰 Tổng tiền: 2,500,000 VNĐ",
        "buttons": [
          {"name": "📋 Xem chi tiết", "type": "query", "payload": "chi tiết đơn hàng ORD123456"},
          {"name": "📞 Liên hệ hỗ trợ", "type": "phone", "payload": "0123456789"},
          {"name": "🛒 Đặt hàng mới", "type": "query", "payload": "đặt hàng mới"}
        ]
      }
    ]
  }
}
```

### **2. Step-by-Step Progression**

```json
{
  "version": "chatbot", 
  "content": {
    "messages": [
      {
        "type": "text",
        "text": "✅ ĐÃ NHẬN MÃ SẢN PHẨM: N-EI 15\n\n📝 Bước 2/4: Nhập kích thước",
        "buttons": [
          {"name": "❌ Hủy", "type": "query", "payload": "hủy đặt hàng"},
          {"name": "🔙 Quay lại", "type": "query", "payload": "quay lại bước trước"}
        ]
      }
    ]
  }
}
```

---

## 📊 TEST SCENARIOS MATRIX

| Test Case | Input | Expected State | Expected Response |
|-----------|-------|----------------|------------------|
| **Session Start** | "Bắt đầu" | Idle | Welcome message |
| **Start Ordering** | "Đặt hàng" | WaitingForProductCode | Step 1/4 prompt |
| **Product Code** | "N-EI 15" | WaitingForDimensions | Step 2/4 prompt |
| **Dimensions** | "1000x800x6" | WaitingForQuantity | Step 3/4 prompt |
| **Quantity** | "2" | WaitingForConfirmation | Confirmation screen |
| **Add More** | "Thêm sản phẩm" | WaitingForProductCode | Product 2 prompt |
| **Confirm** | "Xác nhận" | Idle | Order success |
| **Cancel** | "Hủy" | Idle | Cancel message |
| **Full Order** | "Đặt hàng: N-EI 15..." | Idle | Order success |

---

## 🏆 VALIDATION CHECKLIST

### **✅ Core Features**
- [ ] Session start/end with "Bắt đầu"/"Kết thúc"
- [ ] Step-by-step ordering (4 steps)
- [ ] Multiple items support
- [ ] Product code variations (GL001, N-EI15, N-EI 15, ABC-XYZ 30)
- [ ] Dimension parsing (1000x800x6, 1000 x 800 x 6)
- [ ] Quantity parsing (2, "số lượng: 5", "3 tấm", "x4")
- [ ] Backward compatibility (full order format)

### **✅ Error Handling**
- [ ] Invalid product codes
- [ ] Invalid dimensions
- [ ] Invalid quantities
- [ ] Cancel functionality
- [ ] Back navigation
- [ ] UTF-8 character support

### **✅ Integration**
- [ ] Webhook endpoint works
- [ ] Order creation successful
- [ ] Zalo API integration
- [ ] Dynamic response format correct

### **✅ User Experience**
- [ ] Interactive buttons work
- [ ] Vietnamese text displays correctly
- [ ] Error messages are helpful
- [ ] Flow is intuitive

---

## 🐛 TROUBLESHOOTING

### **Common Issues:**

1. **Server not starting:**
   ```bash
   cd "D:\Work Space\SEP490_G92\SEP490"
   dotnet clean
   dotnet build
   dotnet run
   ```

2. **UTF-8 encoding errors:**
   - Ensure `charset=utf-8` in Content-Type header
   - Check terminal encoding settings

3. **Order creation fails:**
   - Verify database connection
   - Check customer exists with provided phone
   - Validate product code format

4. **State not persisting:**
   - Currently uses conversation history parsing
   - Ensure proper "Bắt đầu" detection

---

## 📞 SUPPORT RESOURCES

- **Documentation:** `CONVERSATION_BASED_ORDERING_GUIDE.md`
- **Test Scenarios:** `test_conversation_based_scenarios.json`
- **Postman Collection:** `Zalo_API_Tests.postman_collection.json`
- **Quick Reference:** `QUICK_TEST_V3.md`

---

## 🎉 SUCCESS CRITERIA

**System is working correctly when:**

✅ Users can start sessions with "Bắt đầu"  
✅ Step-by-step ordering works for all product codes  
✅ Multiple items can be added progressively  
✅ Full order format still works (backward compatibility)  
✅ Error handling guides users to correct input  
✅ Orders are created successfully in database  
✅ Vietnamese characters display properly  

**🚀 Ready for production with conversation-based multi-step ordering!** 