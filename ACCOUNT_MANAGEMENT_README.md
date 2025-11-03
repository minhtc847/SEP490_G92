# Account Management Module

## Tổng quan
Module Quản lý Tài khoản cho phép chủ xưởng (Factory Manager) quản lý tài khoản của nhân viên trong hệ thống.

## Tính năng chính

### 1. Danh sách tài khoản
- Hiển thị danh sách tất cả tài khoản với phân trang
- Tìm kiếm theo tên đăng nhập, tên nhân viên, vai trò
- Lọc theo trạng thái (đang hoạt động/đã khóa)
- Thống kê số lượng tài khoản

### 2. Tạo tài khoản mới
- Tạo tài khoản cho nhân viên chưa có tài khoản
- Chọn nhân viên từ danh sách nhân viên chưa có tài khoản
- Chọn vai trò cho tài khoản
- Đặt tên đăng nhập và mật khẩu
- Validation đầy đủ:
  - Tên đăng nhập phải có ít nhất 3 ký tự
  - Mật khẩu phải có ít nhất 6 ký tự
  - Tên đăng nhập không được trùng
  - Một nhân viên chỉ có thể có 1 tài khoản

### 3. Khóa/Mở khóa tài khoản
- Chuyển đổi trạng thái tài khoản (active/inactive)
- Xác nhận trước khi thực hiện
- Hiển thị trạng thái rõ ràng

### 4. Xóa tài khoản
- Xóa tài khoản vĩnh viễn
- Xác nhận trước khi xóa
- Xử lý lỗi an toàn

### 5. Chi tiết tài khoản
- Hiển thị đầy đủ thông tin tài khoản
- Thông tin nhân viên liên quan
- Thống kê hoạt động (có thể mở rộng)
- Các thao tác nhanh (khóa/mở khóa, xóa)

## Cấu trúc Backend

### Controllers
- `AccountManagementController`: Xử lý các API endpoints

### Services
- `AccountManagementService`: Logic nghiệp vụ chính

### DTOs
- `CreateAccountRequest`: Dữ liệu tạo tài khoản
- `AccountDetailResponse`: Thông tin chi tiết tài khoản
- `AccountListResponse`: Danh sách tài khoản với phân trang
- `EmployeeWithoutAccountResponse`: Nhân viên chưa có tài khoản
- `RoleResponse`: Thông tin vai trò
- `ServiceResult`: Kết quả thao tác

### Models
- `Account`: Model tài khoản (đã có sẵn, thêm trường CreatedAt)

## Cấu trúc Frontend

### Pages
- `/account-management`: Danh sách tài khoản
- `/account-management/create`: Tạo tài khoản mới
- `/account-management/[id]`: Chi tiết tài khoản

### Services
- `service.ts`: API calls và interfaces

### Components
- Sử dụng các components có sẵn của hệ thống
- Layout tương tự các module khác (customers, invoices, etc.)

## API Endpoints

### GET /api/AccountManagement/list
- Lấy danh sách tài khoản với phân trang
- Query params: `page`, `pageSize`

### GET /api/AccountManagement/{id}
- Lấy chi tiết tài khoản theo ID

### POST /api/AccountManagement/create
- Tạo tài khoản mới
- Body: `CreateAccountRequest`

### PUT /api/AccountManagement/{id}/toggle-status
- Chuyển đổi trạng thái tài khoản

### DELETE /api/AccountManagement/{id}
- Xóa tài khoản

### GET /api/AccountManagement/employees-without-account
- Lấy danh sách nhân viên chưa có tài khoản

### GET /api/AccountManagement/roles
- Lấy danh sách vai trò

## Quyền truy cập
- Chỉ Factory Manager (Role ID = 1) có thể truy cập module này
- Được bảo vệ bởi `ProtectedRoute` component

## Cài đặt và chạy

### Backend
1. Thêm service vào `Program.cs`:
```csharp
builder.Services.AddScoped<IAccountManagementService, AccountManagementService>();
```

2. Chạy migration để thêm trường CreatedAt:
```bash
dotnet ef migrations add AddCreatedAtToAccount
dotnet ef database update
```

### Frontend
1. Module đã được tích hợp vào navigation sidebar
2. Chỉ hiển thị cho Factory Manager
3. Sử dụng các components và styles có sẵn

## Tính năng bảo mật
- Mật khẩu được hash bằng SHA256
- Validation đầy đủ ở cả frontend và backend
- Kiểm tra quyền truy cập
- Xác nhận trước khi thực hiện các thao tác quan trọng

## Mở rộng trong tương lai
- Thống kê hoạt động chi tiết
- Lịch sử đăng nhập
- Reset mật khẩu
- Phân quyền chi tiết hơn
- Audit log cho các thao tác
