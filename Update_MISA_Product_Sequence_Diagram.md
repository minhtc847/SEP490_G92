# Sequence Diagram - Update MISA Product

## Mô tả
Sequence diagram này mô tả luồng hoạt động của chức năng cập nhật sản phẩm lên hệ thống MISA.

## Sequence Diagram

```mermaid
sequenceDiagram
    participant User as User
    participant Frontend as Frontend (React)
    participant ProductService as Product Service
    participant SeleniumController as Selenium Controller
    participant MisaProductService as MISA Product Service
    participant MisaWebApp as MISA Web Application
    participant ProductController as Product Controller
    participant Database as Database

    User->>Frontend: Click "Cập nhật MISA" button
    Frontend->>Frontend: setIsUpdatingMisa(true)
    Frontend->>Frontend: Clear previous messages
    
    Note over Frontend: Prepare MISA payload
    Frontend->>Frontend: Map productType to MISA format
    Frontend->>Frontend: Create misaPayload with:<br/>- ProductId<br/>- Name<br/>- Type (mapped)<br/>- Unit
    
    Frontend->>SeleniumController: POST /api/Selenium/product<br/>(misaPayload)
    SeleniumController->>MisaProductService: AddProduct(input)
    
    Note over MisaProductService: Initialize Selenium WebDriver
    MisaProductService->>MisaWebApp: Navigate to MISA product page
    MisaWebApp-->>MisaProductService: Page loaded
    
    Note over MisaProductService: Login to MISA
    MisaProductService->>MisaWebApp: Click "Đã hiểu" button
    MisaWebApp-->>MisaProductService: Login successful
    
    Note over MisaProductService: Add product to MISA
    MisaProductService->>MisaWebApp: Click "Thêm" button
    MisaWebApp-->>MisaProductService: Add form opened
    
    MisaProductService->>MisaWebApp: Select product type
    MisaWebApp-->>MisaProductService: Type selected
    
    MisaProductService->>MisaWebApp: Get auto-generated product code
    MisaWebApp-->>MisaProductService: Product code returned
    
    MisaProductService->>MisaWebApp: Fill product name
    MisaWebApp-->>MisaProductService: Name filled
    
    MisaProductService->>MisaWebApp: Fill unit of measure
    MisaWebApp-->>MisaProductService: Unit filled
    
    MisaProductService->>MisaWebApp: Click "Cất và Thêm" button
    MisaWebApp-->>MisaProductService: Product saved
    
    MisaProductService-->>SeleniumController: Return product code
    SeleniumController->>Database: Update product with MISA code
    Database-->>SeleniumController: Update successful
    SeleniumController-->>Frontend: Success response with product code
    
    Note over Frontend: Update MISA status in database
    Frontend->>ProductController: PUT /api/Product/{id}/update-misa-status
    ProductController->>Database: Update isupdatemisa = true
    Database-->>ProductController: Update successful
    ProductController-->>Frontend: Success response
    
    Note over Frontend: Update UI state
    Frontend->>Frontend: Update product state (isupdatemisa = 1)
    Frontend->>ProductService: getProductById(id)
    ProductService->>Database: Query product details
    Database-->>ProductService: Product data
    ProductService-->>Frontend: Updated product data
    Frontend->>Frontend: setProduct(updatedProduct)
    
    Frontend->>Frontend: setShowSuccessMessage(true)
    Frontend->>User: Display success message
    
    Note over Frontend: Auto-hide success message after 3 seconds
    Frontend->>Frontend: setTimeout(() => setShowSuccessMessage(false), 3000)
    
    Frontend->>Frontend: setIsUpdatingMisa(false)
    
    alt Error Handling
        Note over MisaProductService, MisaWebApp: If MISA operation fails
        MisaProductService-->>SeleniumController: Throw exception
        SeleniumController-->>Frontend: Error response
        Frontend->>Frontend: setErrorMessage(error.message)
        Frontend->>Frontend: setShowErrorMessage(true)
        Frontend->>User: Display error message
        Frontend->>Frontend: setTimeout(() => setShowErrorMessage(false), 5000)
        Frontend->>Frontend: setIsUpdatingMisa(false)
    end
```

## Các thành phần chính

### 1. Frontend (React)
- **File**: `fe/app/(defaults)/products/[id]/page.tsx`
- **Function**: `handleUpdateMisa()`
- **Service**: `fe/app/(defaults)/products/[id]/service.ts`

### 2. Backend Controllers
- **SeleniumController**: `/api/Selenium/product` (POST)
- **ProductController**: `/api/Product/{id}/update-misa-status` (PUT)

### 3. Services
- **MisaProductService**: Xử lý automation với MISA web app
- **ProductService**: Quản lý dữ liệu sản phẩm

### 4. External System
- **MISA Web Application**: Hệ thống kế toán MISA

## Luồng xử lý chính

1. **User Action**: User click button "Cập nhật MISA"
2. **UI Preparation**: Frontend chuẩn bị payload và set loading state
3. **MISA Integration**: Gọi Selenium service để automation với MISA
4. **Database Update**: Cập nhật trạng thái `isupdatemisa` trong database
5. **UI Refresh**: Cập nhật UI với dữ liệu mới và hiển thị thông báo
6. **Error Handling**: Xử lý lỗi nếu có sự cố xảy ra

## Mapping Product Type

```typescript
const mapProductTypeToMisa = (productType: string): string => {
    switch (productType.toLowerCase()) {
        case 'nvl':
        case 'nguyên vật liệu':
            return "Nguyên vật liệu";
        case 'thành phẩm':
        case 'tp':
            return "Thành phẩm";
        default:
            return "Hàng hóa";
    }
};
```

## Error Handling

- **MISA Operation Failure**: Hiển thị error message trong 5 giây
- **Database Update Failure**: Hiển thị error message
- **Network Issues**: Timeout và retry logic
- **Validation Errors**: Kiểm tra dữ liệu trước khi gửi

