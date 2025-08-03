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

export const getInvoices = async (): Promise<InvoiceDto[]> => {
    const response = await axios.get<InvoiceDto[]>("/api/invoices");
    return response.data;
}; 