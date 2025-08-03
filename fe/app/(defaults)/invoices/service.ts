import axios from "@/setup/axios";

export interface InvoiceDto {
    id: number;
    customerName: string;
    invoiceCode: string;
    invoiceDate: string;
    dueDate?: string;
    invoiceType: number; // 0: Sales, 1: Purchase
    status: number; // 0: Unpaid, 1: PartiallyPaid, 2: Paid
    subtotal: number;
    tax: number;
    totalAmount: number;
    salesOrderId?: number;
    purchaseOrderId?: number;
}

export interface InvoiceDetailDto {
    id: number;
    invoiceId: number;
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
    description?: string;
}

export interface InvoiceWithDetailsDto extends InvoiceDto {
    invoiceDetails: InvoiceDetailDto[];
    note?: string;
}

export interface CreateInvoiceDetailDto {
    productId: number;
    quantity: number;
    unitPrice: number;
    total: number;
    description?: string;
}

export interface CreateInvoiceDto {
    invoiceCode: string;
    invoiceDate: string;
    dueDate?: string;
    invoiceType: number;
    status: number;
    subtotal: number;
    tax: number;
    totalAmount: number;
    salesOrderId?: number;
    purchaseOrderId?: number;
    customerId: number;
    note?: string;
    invoiceDetails: CreateInvoiceDetailDto[];
}

// Payment related interfaces
export interface PaymentDto {
    id: number;
    customerId: number;
    invoiceId: number;
    invoiceType: number;
    paymentDate: string;
    amount: number;
    note?: string;
    createdAt: string;
    customerName?: string;
}

export interface CreatePaymentDto {
    customerId: number;
    invoiceId: number;
    invoiceType: number;
    paymentDate: string;
    amount: number;
    note?: string;
}

export interface InvoiceWithPaymentsDto extends InvoiceWithDetailsDto {
    customerId?: number;
    payments: PaymentDto[];
    totalPaidAmount: number;
    remainingAmount: number;
}

export const getInvoices = async (): Promise<InvoiceDto[]> => {
    const response = await axios.get<InvoiceDto[]>("/api/invoices");
    return response.data;
};

export const getInvoiceById = async (id: number): Promise<InvoiceWithDetailsDto> => {
    const response = await axios.get<InvoiceWithDetailsDto>(`/api/invoices/${id}`);
    return response.data;
};

export const getInvoiceWithPayments = async (id: number): Promise<InvoiceWithPaymentsDto> => {
    const response = await axios.get<InvoiceWithPaymentsDto>(`/api/invoices/${id}/payments`);
    return response.data;
};

export const createInvoice = async (invoice: CreateInvoiceDto): Promise<{ id: number; message: string }> => {
    const response = await axios.post<{ id: number; message: string }>("/api/invoices", invoice);
    return response.data;
};

export const updateInvoice = async (id: number, invoice: CreateInvoiceDto): Promise<{ message: string }> => {
    const response = await axios.put<{ message: string }>(`/api/invoices/${id}`, invoice);
    return response.data;
};

export const deleteInvoice = async (id: number): Promise<{ message: string }> => {
    const response = await axios.delete<{ message: string }>(`/api/invoices/${id}`);
    return response.data;
};

// Payment service functions
export const getPaymentsByInvoiceId = async (invoiceId: number): Promise<PaymentDto[]> => {
    const response = await axios.get<PaymentDto[]>(`/api/payments/invoice/${invoiceId}`);
    return response.data;
};

export const createPayment = async (payment: CreatePaymentDto): Promise<{ id: number; message: string }> => {
    const response = await axios.post<{ id: number; message: string }>("/api/payments", payment);
    return response.data;
};

export const deletePayment = async (id: number): Promise<{ message: string }> => {
    const response = await axios.delete<{ message: string }>(`/api/payments/${id}`);
    return response.data;
}; 