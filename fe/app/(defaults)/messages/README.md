# Message System Implementation

## Tổng quan

Hệ thống tin nhắn đã được implement để tích hợp với API backend và hiển thị tin nhắn từ Zalo theo format MessageResponse. Hệ thống bao gồm quản lý khách hàng với Zalo ID và hiển thị tin nhắn real-time.

## Cấu trúc Files

### 1. `services.ts`
- **MessageResponse**: Interface tương ứng với response từ backend API
- **Message**: Interface đã được transform cho UI
- **Customer**: Interface đầy đủ tương ứng với backend model (bao gồm ZaloId, ZaloName, TagName)
- **CustomerOption**: Interface cho AsyncSelect options
- **getMessagesByUserId()**: Function gọi API để lấy tin nhắn
- **getCustomersWithZaloId()**: Function lấy danh sách khách hàng có Zalo ID
- **loadCustomerOptions()**: Function load danh sách customers cho AsyncSelect
- **getRecentCustomers()**: Function lấy khách hàng gần đây

### 2. `page.tsx`
- Component chính hiển thị giao diện tin nhắn
- Xử lý loading states, error handling cho cả messages và customers
- Render messages theo message type (text, image, file)
- Hiển thị customer tags và Zalo information

## API Integration

### 1. Messages API
```
GET /api/get-message?userId={userId}
```

### 2. Customers API
```
GET /api/with-zalo-id
```

### Response Format

#### MessageResponse
```json
{
    "sender_id": "string",
    "sender_type": "string", // "user" hoặc "customer"
    "message_type": "string", // "text", "image", "file"
    "content": "string",
    "send_time": "string" // ISO datetime string
}
```

#### Customer
```json
{
    "id": 1,
    "customerCode": "KH001",
    "customerName": "Nguyễn Văn A",
    "address": "123 Lê Lợi, Q.1, TP.HCM",
    "debt": 0,
    "taxCode": "0123456789",
    "contactPerson": "Nguyễn Văn A",
    "phone": "0901234567",
    "discount": 0,
    "isSupplier": false,
    "zaloId": "zalo_001",
    "zaloName": "Nguyễn Văn A",
    "tagName": "VIP"
}
```

### Transform Logic
```typescript
// Transform từ MessageResponse sang Message cho UI
{
    sender: msg.sender_type === 'user' ? 'user' : 'customer',
    content: msg.content || '',
    timestamp: msg.send_time,
    messageType: msg.message_type,
    senderId: msg.sender_id
}

// Sử dụng zaloId để gọi API messages
const userId = customer.zaloId || customer.id.toString();
```

## Features

### 1. Customer Management
- **Real-time Customer Loading**: Load customers từ API với Zalo ID
- **Search Functionality**: Tìm kiếm theo customerCode, customerName, zaloName
- **Customer Tags**: Hiển thị tags (VIP, Premium, Regular) với màu sắc khác nhau
- **Zalo Integration**: Hiển thị Zalo name và sử dụng Zalo ID để load messages
- **Recent Customers**: Danh sách khách hàng gần đây với loading states

### 2. Message System
- **Loading States**: Hiển thị spinner khi đang tải tin nhắn
- **Error Handling**: Hiển thị error message và retry button
- **Message Types**: Support text, image, file messages
- **Timestamp Formatting**: Format theo locale Việt Nam

### 3. UI/UX Improvements
- **Responsive Design**: Layout responsive cho mobile và desktop
- **Smooth Transitions**: Hover effects và animations
- **Dark Mode Support**: Tương thích với dark mode
- **Loading Indicators**: Spinner cho tất cả async operations
- **Error Recovery**: Retry mechanisms cho failed API calls

### 4. Customer Display Features
- **Tag System**: 
  - VIP: Yellow badge
  - Premium: Purple badge  
  - Regular: Gray badge
- **Zalo Information**: Hiển thị Zalo name trong customer list và chat header
- **Search Enhancement**: Tìm kiếm theo nhiều criteria

## Usage

### 1. Customer Selection
- **AsyncSelect**: Tìm kiếm customer theo code, name, hoặc Zalo name
- **Recent Customers**: Click vào customer trong danh sách gần đây
- **Loading States**: Hiển thị loading khi đang fetch customers

### 2. Message Viewing
- **Auto-load**: Messages tự động load khi chọn customer
- **Zalo ID Integration**: Sử dụng Zalo ID để fetch messages
- **Message Types**: Support text, image, file với proper rendering
- **Error Recovery**: Click "Thử lại" nếu load messages thất bại

### 3. Customer Information
- **Tag Display**: Hiển thị customer tags với màu sắc
- **Zalo Details**: Hiển thị Zalo name trong customer list và chat
- **Contact Info**: Access to customer contact information

## Configuration

### Environment Variables
```env
NEXT_PUBLIC_BASE_URL=http://localhost:5250
```

### API Endpoints
```typescript
// Messages
GET /api/get-message?userId={zaloId}

// Customers
GET /api/with-zalo-id
```

## Error Handling

### 1. API Failures
- **Customer API**: Fallback to mock data nếu API không hoạt động
- **Message API**: Error message với retry button
- **Network Issues**: Console logging cho debugging

### 2. Data Validation
- **Null Safety**: Handle null/undefined values trong customer data
- **Type Safety**: TypeScript interfaces cho type checking
- **Fallback Values**: Default values cho missing data

## Future Enhancements

### 1. Real-time Features
- **WebSocket Integration**: Real-time message updates
- **Auto-refresh**: Periodic message refresh
- **Online Status**: Customer online/offline indicators

### 2. Advanced Customer Management
- **Customer History**: Chat history và interaction logs
- **Customer Analytics**: Message frequency, response time
- **Customer Segmentation**: Advanced filtering và grouping

### 3. Message Features
- **Message Actions**: Reply, forward, delete
- **File Upload**: Support file attachments
- **Message Search**: Search within conversations
- **Message Export**: Export chat history

### 4. Performance Optimizations
- **Caching**: Cache customer data và recent messages
- **Pagination**: Load messages in chunks
- **Lazy Loading**: Load customer data on demand

## Troubleshooting

### Common Issues

1. **Customer API Connection Error**
   - Check `/api/with-zalo-id` endpoint
   - Verify backend server is running
   - Check CORS configuration

2. **Message API Issues**
   - Verify Zalo ID format
   - Check `/api/get-message` endpoint
   - Validate userId parameter

3. **UI Rendering Issues**
   - Check customer data format
   - Verify tag names match expected values
   - Check CSS classes và Tailwind configuration

### Debug Steps
1. Open browser developer tools
2. Check Network tab for API calls
3. Check Console tab for errors
4. Verify API response format matches interfaces
5. Test with mock data if API is unavailable

### API Response Validation
```typescript
// Expected Customer format
{
    id: number,
    customerCode: string,
    customerName: string,
    zaloId: string,
    zaloName: string,
    tagName: string,
    // ... other fields
}

// Expected MessageResponse format
{
    sender_id: string,
    sender_type: string,
    message_type: string,
    content: string,
    send_time: string
}
``` 