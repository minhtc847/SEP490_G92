# Purchase Order Creation - Sequence Diagram

## Tổng quan về Purchase Order Module

Purchase Order Module là một module quản lý đơn hàng mua hàng trong hệ thống VNG Glass, cho phép tạo, quản lý và theo dõi các đơn hàng mua nguyên vật liệu từ nhà cung cấp.

### Cấu trúc Module:
- **Controller**: `PurchaseOrderController.cs` - Xử lý các HTTP requests
- **Service**: `PurchaseService.cs` - Logic nghiệp vụ
- **DTOs**: Các Data Transfer Objects để truyền dữ liệu
- **Models**: `PurchaseOrder.cs`, `PurchaseOrderDetail.cs` - Entity models

## Sequence Diagram - Tạo Đơn Mua Hàng

```plantuml
@startuml PurchaseOrderCreation
!theme plain
skinparam backgroundColor #FFFFFF
skinparam sequenceArrowThickness 2
skinparam roundcorner 20
skinparam maxmessagesize 60

title **Purchase Order Creation Flow - VNG Glass System**

actor "User" as U
participant "Frontend\n(React/Next.js)" as FE
participant "PurchaseOrderController" as PC
participant "PurchaseService" as PS
participant "SEP490DbContext" as DB
participant "Customer Table" as CT
participant "PurchaseOrder Table" as POT
participant "PurchaseOrderDetail Table" as PODT
participant "Product Table" as PT

== **1. Khởi tạo Form Tạo Đơn Hàng** ==

U -> FE: Truy cập trang tạo đơn mua hàng
FE -> PC: GET /api/PurchaseOrder/next-code
PC -> PS: GetNextPurchaseOrderCode()
PS -> DB: Query PurchaseOrders WHERE Code LIKE 'MH%'
DB -> PS: Return existing codes
PS -> PS: Generate next code (MH00001, MH00002, ...)
PS -> PC: Return next code
PC -> FE: Return next purchase order code
FE -> U: Hiển thị form với mã đơn hàng tự động

== **2. Tìm Kiếm Nhà Cung Cấp** ==

U -> FE: Nhập tên nhà cung cấp
FE -> PC: GET /api/orders/search-supplier?query={supplierName}
PC -> PS: SearchCustomers(query)
PS -> DB: Query Customers WHERE IsSupplier=true AND CustomerName LIKE query
DB -> PS: Return matching suppliers
PS -> PC: Return supplier options
PC -> FE: Return supplier list
FE -> U: Hiển thị danh sách nhà cung cấp

== **3. Tìm Kiếm Sản Phẩm** ==

U -> FE: Nhập tên sản phẩm
FE -> PC: GET /api/orders/search-nvl?query={productName}
PC -> PS: SearchProducts(query)
PS -> DB: Query Products WHERE ProductType='NVL' AND ProductName LIKE query
DB -> PS: Return matching products
PS -> PC: Return product options
PC -> FE: Return product list
FE -> U: Hiển thị danh sách sản phẩm

== **4. Tạo Sản Phẩm Mới (Nếu cần)** ==

alt Sản phẩm chưa tồn tại
    U -> FE: Chọn "Tạo sản phẩm mới"
    FE -> PC: POST /api/PurchaseOrder/product
    PC -> PS: CreateProductAsync(CreateProductV3Dto)
    PS -> PS: Validate product data
    PS -> DB: Check if ProductName exists
    DB -> PS: Return existence status
    alt Product name không tồn tại
        PS -> PT: Insert new Product
        PT -> PS: Return new Product ID
        PS -> PC: Return created Product
        PC -> FE: Return product info
        FE -> U: Hiển thị thông báo tạo thành công
    else Product name đã tồn tại
        PS -> PC: Throw exception
        PC -> FE: Return error message
        FE -> U: Hiển thị lỗi
    end
end

== **5. Thêm Sản Phẩm vào Đơn Hàng** ==

U -> FE: Thêm sản phẩm vào danh sách
FE -> FE: Validate product data (width, height, thickness, quantity)
FE -> U: Hiển thị sản phẩm trong danh sách

== **6. Tạo Đơn Mua Hàng** ==

U -> FE: Nhấn "Tạo đơn hàng"
FE -> FE: Validate form data
FE -> PC: POST /api/PurchaseOrder
note right: CreatePurchaseOrderDto\n{\n  customerName: string,\n  description?: string,\n  code?: string,\n  date: DateTime,\n  status: string,\n  products: CreatePurchaseOrderDetailDto[]\n}

PC -> PS: CreatePurchaseOrderAsync(dto)

== **7. Xử Lý Tạo Đơn Hàng** ==

PS -> CT: Query Customer WHERE CustomerName=dto.CustomerName AND IsSupplier=true
CT -> PS: Return existing customer or null

alt Customer không tồn tại
    PS -> CT: Insert new Customer (IsSupplier=true)
    CT -> PS: Return new Customer ID
end

PS -> POT: Insert new PurchaseOrder
note right: PurchaseOrder\n{\n  CustomerId: customer.Id,\n  Code: dto.Code || GetNextCode(),\n  Date: dto.Date,\n  Description: dto.Description,\n  Status: PurchaseStatus.Pending\n}
POT -> PS: Return PurchaseOrder ID

== **8. Tạo Chi Tiết Đơn Hàng** ==

loop For each product in dto.Products
    PS -> PODT: Insert PurchaseOrderDetail
    note right: PurchaseOrderDetail\n{\n  PurchaseOrderId: order.Id,\n  ProductName: p.ProductName,\n  Unit: "Tấm",\n  Quantity: p.Quantity\n}
    PODT -> PS: Return Detail ID
end

PS -> DB: SaveChanges()
DB -> PS: Confirm transaction
PS -> PC: Return PurchaseOrder ID
PC -> FE: Return { id: orderId }
FE -> U: Hiển thị thông báo tạo thành công

== **9. Chuyển Hướng** ==

FE -> FE: Redirect to purchase order list
FE -> U: Hiển thị danh sách đơn hàng mua

@enduml
```

## Chi Tiết Các Bước Trong Quy Trình

### 1. **Khởi tạo Form**
- Hệ thống tự động tạo mã đơn hàng theo format `MH00001`, `MH00002`, ...
- Form được khởi tạo với các trường bắt buộc

### 2. **Tìm kiếm Nhà cung cấp**
- Hỗ trợ tìm kiếm theo tên nhà cung cấp
- Chỉ hiển thị các customer có `IsSupplier = true`
- Tự động tạo nhà cung cấp mới nếu chưa tồn tại

### 3. **Quản lý Sản phẩm**
- Tìm kiếm sản phẩm có sẵn trong hệ thống
- Tạo sản phẩm mới nếu cần thiết
- Validate thông tin sản phẩm (kích thước, số lượng)

### 4. **Tạo Đơn hàng**
- Validate toàn bộ dữ liệu đầu vào
- Tạo PurchaseOrder với status mặc định là "Pending"
- Tạo các PurchaseOrderDetail cho từng sản phẩm

### 5. **Lưu trữ Dữ liệu**
- Sử dụng Entity Framework Core
- Transaction để đảm bảo tính toàn vẹn dữ liệu
- Rollback nếu có lỗi xảy ra

## Các Trạng Thái Đơn Hàng

```csharp
public enum PurchaseStatus
{
    Pending,    // Chờ xử lý
    Ordered,    // Đã đặt hàng
    Imported,   // Đã nhập kho
    Cancelled   // Đã hủy
}
```

## Cấu Trúc Dữ Liệu

### PurchaseOrder
```csharp
public class PurchaseOrder
{
    public int Id { get; set; }
    public DateTime? Date { get; set; }
    public string? Code { get; set; }
    public int? SupplierId { get; set; }
    public string? Description { get; set; }
    public decimal? TotalValue { get; set; }
    public PurchaseStatus? Status { get; set; }
    public int? EmployeeId { get; set; }
    public int? CustomerId { get; set; }
    public ICollection<PurchaseOrderDetail>? PurchaseOrderDetails { get; set; }
}
```

### PurchaseOrderDetail
```csharp
public class PurchaseOrderDetail
{
    public int Id { get; set; }
    public int PurchaseOrderId { get; set; }
    public string? ProductName { get; set; }
    public string? Unit { get; set; }
    public int? Quantity { get; set; }
    public decimal? UnitPrice { get; set; }
    public decimal? TotalPrice { get; set; }
    public int? ProductId { get; set; }
}
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/PurchaseOrder/next-code` | Lấy mã đơn hàng tiếp theo |
| GET | `/api/orders/search-supplier` | Tìm kiếm nhà cung cấp |
| GET | `/api/orders/search-nvl` | Tìm kiếm sản phẩm NVL |
| POST | `/api/PurchaseOrder/product` | Tạo sản phẩm mới |
| POST | `/api/PurchaseOrder` | Tạo đơn mua hàng |
| PUT | `/api/PurchaseOrder/{id}/status` | Cập nhật trạng thái |
| POST | `/api/PurchaseOrder/{id}/import` | Nhập hàng |

## Xử Lý Lỗi

- **Validation**: Kiểm tra dữ liệu đầu vào
- **Transaction**: Đảm bảo tính toàn vẹn dữ liệu
- **Exception Handling**: Xử lý lỗi và rollback
- **Logging**: Ghi log các hoạt động quan trọng

## Bảo Mật

- **Authentication**: Yêu cầu đăng nhập
- **Authorization**: Kiểm tra quyền truy cập
- **Input Validation**: Validate dữ liệu đầu vào
- **SQL Injection Protection**: Sử dụng Entity Framework
