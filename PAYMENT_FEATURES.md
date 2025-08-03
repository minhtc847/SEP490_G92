# Payment Features Documentation

## Overview
This document describes the payment functionality that has been implemented for the invoice management system.

## Features Implemented

### 1. Invoice Detail Page (`/invoices/[id]`)
- **Location**: `fe/app/(defaults)/invoices/[id]/page.tsx`
- **Features**:
  - Complete invoice information display
  - Product details table
  - Payment history table
  - Payment summary sidebar
  - Payment creation modal
  - Payment deletion functionality

### 2. Payment Management
- **Backend Services**: `SEP490/Modules/Payments/`
  - `PaymentController.cs` - HTTP endpoints for payment operations
  - `PaymentService.cs` - Business logic for payment management
  - `IPaymentService.cs` - Service interface
  - `PaymentDto.cs` - Data transfer objects

### 3. Enhanced Invoice Service
- **Location**: `SEP490/Modules/InvoiceModule/`
- **New Features**:
  - `GetInvoiceWithPayments()` method
  - Automatic invoice status updates based on payments
  - Payment integration with existing invoice functionality

## API Endpoints

### Payment Endpoints
- `GET /api/payments/invoice/{invoiceId}` - Get payments for an invoice
- `GET /api/payments/{id}` - Get specific payment
- `POST /api/payments` - Create new payment
- `PUT /api/payments/{id}` - Update payment
- `DELETE /api/payments/{id}` - Delete payment

### Enhanced Invoice Endpoints
- `GET /api/invoices/{id}/payments` - Get invoice with payment information

## Payment Status Logic

The system automatically updates invoice status based on payment amounts:

- **Unpaid (0)**: No payments made
- **PartiallyPaid (1)**: Some payments made but total not reached
- **Paid (2)**: Total payments equal or exceed invoice amount

## Frontend Features

### Payment Creation
- Modal form for creating new payments
- Validation for payment amounts
- Automatic status updates
- Real-time remaining amount calculation

### Payment History
- Table displaying all payments for an invoice
- Payment date, amount, and notes
- Delete functionality for payments
- Responsive design

### Payment Summary
- Total invoice amount
- Total paid amount
- Remaining amount
- Current payment status

## Database Schema

### Payments Table
```sql
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    invoice_id INT NOT NULL,
    invoice_type INT NOT NULL,
    payment_date DATETIME NOT NULL,
    amount DECIMAL(65,30) NOT NULL,
    note TEXT,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (invoice_id) REFERENCES invoices(id)
);
```

## Usage Instructions

### Creating a Payment
1. Navigate to invoice detail page
2. Click "Tạo thanh toán" button
3. Fill in payment details:
   - Payment date
   - Amount (cannot exceed remaining amount)
   - Optional notes
4. Click "Tạo thanh toán"

### Deleting a Payment
1. In payment history table, click the trash icon
2. Confirm deletion
3. Payment will be removed and invoice status updated

### Viewing Payment History
- Payment history is automatically displayed on invoice detail page
- Shows all payments in chronological order
- Displays payment amounts, dates, and notes

## Technical Implementation

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Responsive design
- Form validation
- Error handling

### Backend
- ASP.NET Core with C#
- Entity Framework Core
- Automatic dependency injection
- Transaction management
- Data validation

### Key Features
- Automatic invoice status updates
- Payment amount validation
- Error handling and user feedback
- Responsive UI design
- Real-time data updates

## Future Enhancements
- Payment method tracking
- Payment receipt generation
- Payment reminders
- Bulk payment operations
- Payment analytics and reporting 