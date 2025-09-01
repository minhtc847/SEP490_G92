# Quản lý cuộc hội thoại Zalo

## Tổng quan

Hệ thống quản lý cuộc hội thoại Zalo cho phép theo dõi và quản lý các cuộc hội thoại với khách hàng qua Zalo. Tính năng này cung cấp giao diện để xem danh sách cuộc hội thoại, chi tiết từng cuộc hội thoại, và thống kê tổng quan.

## Tính năng chính

### 1. Danh sách cuộc hội thoại (`/conversations`)
- Hiển thị danh sách tất cả cuộc hội thoại với phân trang
- Bộ lọc theo:
  - Từ khóa tìm kiếm (ID, tên, số điện thoại, nội dung tin nhắn)
  - Trạng thái cuộc hội thoại
  - Trạng thái hoạt động
  - Số lượng hiển thị
- Thống kê tổng quan:
  - Tổng số cuộc hội thoại
  - Số cuộc hội thoại đang hoạt động
  - Số cuộc hội thoại hôm nay
  - Số trạng thái khác nhau
- Thao tác:
  - Xem chi tiết cuộc hội thoại
  - Xóa cuộc hội thoại

### 2. Chi tiết cuộc hội thoại (`/conversations/[id]`)
- Thông tin cuộc hội thoại:
  - Tên người dùng, số điện thoại
  - Trạng thái cuộc hội thoại
  - Thời gian tạo và hoạt động cuối
  - Số tin nhắn và lần thử lại
- Lịch sử tin nhắn:
  - Hiển thị tất cả tin nhắn theo thời gian
  - Phân biệt tin nhắn từ khách hàng và bot
- Sản phẩm đặt hàng:
  - Danh sách sản phẩm với thông tin chi tiết
  - Tính toán tổng giá trị đơn hàng
- Thống kê nhanh:
  - Số sản phẩm
  - Tổng giá trị
  - Thời gian hoạt động

## Cấu trúc Backend

### API Endpoints

#### 1. GET `/api/ZaloConversation`
Lấy danh sách cuộc hội thoại với phân trang và bộ lọc

**Query Parameters:**
- `page`: Số trang (mặc định: 1)
- `pageSize`: Số lượng mỗi trang (mặc định: 20)
- `searchTerm`: Từ khóa tìm kiếm
- `state`: Trạng thái cuộc hội thoại
- `isActive`: Trạng thái hoạt động
- `fromDate`: Ngày bắt đầu
- `toDate`: Ngày kết thúc

**Response:**
```json
{
  "conversations": [
    {
      "zaloUserId": "string",
      "userName": "string",
      "customerPhone": "string",
      "currentState": "string",
      "lastActivity": "string",
      "createdAt": "string",
      "isActive": boolean,
      "messageCount": number,
      "lastUserMessage": "string",
      "lastBotResponse": "string",
      "retryCount": number,
      "lastError": "string",
      "customerId": number,
      "customerName": "string",
      "orderItemsCount": number
    }
  ],
  "totalCount": number,
  "page": number,
  "pageSize": number,
  "totalPages": number
}
```

#### 2. GET `/api/ZaloConversation/{zaloUserId}`
Lấy chi tiết cuộc hội thoại theo ID

**Response:**
```json
{
  "zaloUserId": "string",
  "currentState": "string",
  "currentOrderId": "string",
  "lastActivity": "string",
  "createdAt": "string",
  "isActive": boolean,
  "messageCount": number,
  "lastUserMessage": "string",
  "lastBotResponse": "string",
  "retryCount": number,
  "lastError": "string",
  "userName": "string",
  "userAvatar": "string",
  "customerPhone": "string",
  "customerId": number,
  "orderItems": [
    {
      "productCode": "string",
      "productType": "string",
      "height": number,
      "width": number,
      "thickness": number,
      "quantity": number,
      "unitPrice": number,
      "totalPrice": number
    }
  ],
  "messageHistory": [
    {
      "content": "string",
      "senderType": "string",
      "messageType": "string",
      "timestamp": "string"
    }
  ],
  "lastLLMResponse": object
}
```

#### 3. GET `/api/ZaloConversation/statistics`
Lấy thống kê tổng quan

**Response:**
```json
{
  "totalConversations": number,
  "activeConversations": number,
  "todayConversations": number,
  "stateStatistics": [
    {
      "state": "string",
      "count": number
    }
  ]
}
```

#### 4. DELETE `/api/ZaloConversation/{zaloUserId}`
Xóa cuộc hội thoại

### Database Models

#### ZaloConversationState
```csharp
public class ZaloConversationState
{
    public int Id { get; set; }
    public string ZaloUserId { get; set; }
    public string CurrentState { get; set; }
    public string? CurrentOrderId { get; set; }
    public DateTime LastActivity { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; }
    public int MessageCount { get; set; }
    public string? LastUserMessage { get; set; }
    public string? LastBotResponse { get; set; }
    public int RetryCount { get; set; }
    public string? LastError { get; set; }
    public string? UserName { get; set; }
    public string? CustomerPhone { get; set; }
    public int? CustomerId { get; set; }
    public string? LastLLMResponseJson { get; set; }
    
    // Navigation properties
    public ICollection<ZaloConversationMessage> MessageHistory { get; set; }
    public ICollection<ZaloConversationOrderItem> OrderItems { get; set; }
    public Customer? Customer { get; set; }
}
```

#### ZaloConversationMessage
```csharp
public class ZaloConversationMessage
{
    public int Id { get; set; }
    public int ZaloConversationStateId { get; set; }
    public string Content { get; set; }
    public string SenderType { get; set; } // "user" or "business"
    public string MessageType { get; set; }
    public DateTime Timestamp { get; set; }
    
    public ZaloConversationState ZaloConversationState { get; set; }
}
```

#### ZaloConversationOrderItem
```csharp
public class ZaloConversationOrderItem
{
    public int Id { get; set; }
    public int ZaloConversationStateId { get; set; }
    public string ProductCode { get; set; }
    public string ProductType { get; set; }
    public float Height { get; set; }
    public float Width { get; set; }
    public float Thickness { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public DateTime CreatedAt { get; set; }
    
    public ZaloConversationState ZaloConversationState { get; set; }
}
```

## Cấu trúc Frontend

### Components

#### 1. ConversationsPage (`/conversations/page.tsx`)
- Hiển thị danh sách cuộc hội thoại
- Bộ lọc và tìm kiếm
- Phân trang
- Thống kê tổng quan

#### 2. ConversationDetailPage (`/conversations/[id]/page.tsx`)
- Hiển thị chi tiết cuộc hội thoại
- Lịch sử tin nhắn
- Danh sách sản phẩm đặt hàng
- Thống kê nhanh

### Services

#### ConversationService (`/services/conversationService.ts`)
- API calls đến backend
- Helper methods cho formatting
- TypeScript interfaces

### Navigation

Menu item "Cuộc Hội Thoại Zalo" đã được thêm vào sidebar với icon chat.

## Trạng thái cuộc hội thoại

- `new`: Mới
- `ordering`: Đang đặt hàng
- `waiting_for_phone`: Chờ số điện thoại
- `waiting_for_product_info`: Chờ thông tin sản phẩm
- `confirming`: Xác nhận
- `completed`: Hoàn thành
- `cancelled`: Đã hủy
- `contacting_staff`: Liên hệ nhân viên

## Cách sử dụng

1. **Xem danh sách cuộc hội thoại:**
   - Truy cập `/conversations`
   - Sử dụng bộ lọc để tìm kiếm
   - Xem thống kê tổng quan

2. **Xem chi tiết cuộc hội thoại:**
   - Click "Chi tiết" trong danh sách
   - Xem lịch sử tin nhắn
   - Xem sản phẩm đặt hàng

3. **Xóa cuộc hội thoại:**
   - Click "Xóa" trong danh sách
   - Xác nhận hành động

## Bảo mật

- Tất cả API endpoints yêu cầu authentication
- Chỉ Factory Manager và Accountant có thể truy cập
- Validation dữ liệu đầu vào
- Error handling đầy đủ

## Tương lai

- Export dữ liệu cuộc hội thoại
- Real-time updates với SignalR
- Advanced analytics và reporting
- Integration với CRM system
- Automated response suggestions
