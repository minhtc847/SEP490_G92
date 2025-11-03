# Debt Management Features Documentation

## Overview
This document describes the debt management functionality that has been implemented for tracking customer debts and receivables based on invoice payments.

## Features Implemented

### 1. Debt Management System
- **Backend Services**: `SEP490/Modules/Debts/`
  - `DebtController.cs` - HTTP endpoints for debt operations
  - `DebtService.cs` - Business logic for debt calculation
  - `IDebtService.cs` - Service interface
  - `DebtDto.cs` - Data transfer objects

### 2. Frontend Pages
- **Main Debt Page**: `fe/app/(defaults)/debts/page.tsx`
- **Customer Debt Detail**: `fe/app/(defaults)/debts/[customerId]/page.tsx`
- **Frontend Service**: `fe/app/(defaults)/debts/service.ts`

## Debt Calculation Logic

### Debt Types
- **Phải thu (Receivable)**: Hóa đơn bán hàng chưa thanh toán
- **Phải trả (Payable)**: Hóa đơn mua hàng chưa thanh toán
- **Công nợ ròng (Net Debt)**: Receivable - Payable

### Status Classification
- **Khách nợ**: Net Debt > 0 (Khách hàng nợ công ty)
- **Mình nợ**: Net Debt < 0 (Công ty nợ khách hàng)
- **Cân bằng**: Net Debt = 0 (Không có công nợ)

## API Endpoints

### Debt Endpoints
- `GET /api/debts` - Get all customer debts
- `GET /api/debts/summary` - Get debt summary statistics
- `GET /api/debts/customer/{customerId}` - Get debt for specific customer
- `GET /api/debts/filter` - Filter debts by criteria
- `POST /api/debts/update/{invoiceId}` - Update debt from invoice
- `POST /api/debts/update-all` - Update all debts

## Frontend Features

### Main Debt Page (`/debts`)
- **Summary Cards**: Total receivable, payable, net debt, customer count
- **Advanced Filtering**: By customer name, debt type, amount range
- **Debt List**: Table showing all customers with debt information
- **Real-time Updates**: Automatic refresh when payments are made

### Customer Debt Detail Page (`/debts/[customerId]`)
- **Customer Information**: Complete customer details
- **Debt Summary**: Visual representation of debt status
- **Invoice List**: All unpaid/partially paid invoices
- **Quick Actions**: Navigate to invoice details, export reports

## Automatic Debt Updates

### Payment Integration
The debt system automatically updates when:
- New payment is created
- Payment is updated
- Payment is deleted

### Update Triggers
- Invoice status changes
- Payment amounts change
- New invoices are created

## Database Integration

### Debt Calculation
Debts are calculated on-demand from:
- Invoice data (total amounts, status)
- Payment data (paid amounts)
- Customer information

### Performance Optimization
- Lazy loading of debt calculations
- Caching of frequently accessed data
- Efficient database queries with includes

## Usage Instructions

### Viewing Debt Summary
1. Navigate to `/debts`
2. View summary cards for overview
3. Use filters to find specific customers
4. Click on customer to view details

### Analyzing Customer Debt
1. Click on customer name or eye icon
2. View detailed debt breakdown
3. See all related invoices
4. Navigate to invoice details for payment management

### Filtering Debts
1. Click "Hiện bộ lọc" to show filters
2. Enter customer name to search
3. Select debt type (receivable/payable/balanced)
4. Set amount range if needed
5. Click "Lọc" to apply filters

## Technical Implementation

### Backend
- ASP.NET Core with Entity Framework
- Automatic dependency injection
- Real-time debt calculations
- Payment integration

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Responsive design
- Real-time data updates

### Key Features
- Automatic debt updates on payment changes
- Visual debt status indicators
- Comprehensive filtering system
- Detailed customer debt analysis
- Integration with invoice management

## Business Logic

### Debt Calculation Rules
1. **Receivable**: Sum of unpaid sales invoices
2. **Payable**: Sum of unpaid purchase invoices
3. **Net Debt**: Receivable - Payable
4. **Status**: Determined by net debt value

### Payment Impact
- **Payment Creation**: Reduces remaining amount, updates debt
- **Payment Update**: Recalculates debt based on new amount
- **Payment Deletion**: Restores debt to previous state

## Future Enhancements
- Debt aging analysis
- Payment reminders
- Debt forecasting
- Bulk debt operations
- Debt reporting and analytics
- Email notifications for overdue debts 