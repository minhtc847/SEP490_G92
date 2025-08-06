
# VNG GLASS - CONVERSATION-BASED ORDERING SYSTEM

🚀 **SEP490 Project** - Advanced glass manufacturing management with **Zalo Chatbot integration**

## 🎯 CORE FEATURES

- **💬 Conversation-Based Ordering** - Multi-step ordering via Zalo chat
- **🛒 Multiple Item Support** - Add products progressively or in bulk
- **📱 Session Management** - "Bắt đầu"/"Kết thúc" session control
- **🔄 Backward Compatibility** - Full order format still supported
- **🌐 UTF-8 Support** - Vietnamese characters fully supported

## 🚀 GETTING STARTED

### **Database Setup:**
```bash
dotnet ef database update
```

### **Start Server:**
```bash
cd "D:\Work Space\SEP490_G92\SEP490"
dotnet run
```

### **Key Endpoints:**
- **Conversation API:** `http://localhost:5000/api/ZaloDynamic/chat`
- **Webhook API:** `http://localhost:5000/api/ZaloWebhook/message`
- **Test Utilities:** `http://localhost:5000/api/ZaloTest/*`

## 📚 DOCUMENTATION

- **📖 Main Guide:** `CONVERSATION_BASED_ORDERING_GUIDE.md`
- **🧪 Testing:** `COMPREHENSIVE_TEST_GUIDE.md`
- **🎯 Test Scenarios:** `test_conversation_based_scenarios.json`

## 🔧 ARCHITECTURE

**Conversation-Based Session Management:**
```
User Message → Get Conversation History → Parse Session → Determine State → Route Message → Response
```

**Supported Flows:**
1. **Session Control** - "Bắt đầu" → interactions → "Kết thúc"
2. **Step-by-Step Ordering** - Product code → Dimensions → Quantity → Confirm
3. **Multiple Items** - Add products progressively
4. **Full Order** - Traditional format: "Đặt hàng: N-EI 15 1000x800x6 x2"

## 🛠️ DEVELOPMENT

### **Database Migrations:**
```bash
# Create migration
./Scripts/migrate.bat AddTestTable

# Rollback migration  
./Scripts/rollback.bat AddTestTable
```

**Ready for production! 🎉**
