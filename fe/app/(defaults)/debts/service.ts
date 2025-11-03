import axios from "@/setup/axios";

export interface DebtDto {
    id: number;
    customerId: number;
    customerName: string;
    customerCode: string;
    customerPhone: string;
    customerEmail: string;
    totalReceivable: number; // Tổng phải thu (hóa đơn bán chưa thanh toán)
    totalPayable: number; // Tổng phải trả (hóa đơn mua chưa thanh toán)
    netDebt: number; // Công nợ ròng (Receivable - Payable)
    lastUpdated: string;
    invoices: DebtInvoiceDto[];
}

export interface DebtInvoiceDto {
    invoiceId: number;
    invoiceCode: string;
    invoiceDate: string;
    dueDate?: string;
    invoiceType: number; // 0: Sales, 1: Purchase
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    status: number; // 0: Unpaid, 1: PartiallyPaid, 2: Paid
    statusText: string;
    typeText: string;
}

export interface DebtSummaryDto {
    totalCustomers: number;
    totalReceivable: number;
    totalPayable: number;
    netDebt: number;
    customersWithDebt: number;
    customersWithReceivable: number;
}

export const getAllDebts = async (): Promise<DebtDto[]> => {
    const response = await axios.get<DebtDto[]>("/api/debts");
    return response.data;
};

export const getDebtSummary = async (): Promise<DebtSummaryDto> => {
    const response = await axios.get<DebtSummaryDto>("/api/debts/summary");
    return response.data;
};

export const getDebtByCustomerId = async (customerId: number): Promise<DebtDto> => {
    const response = await axios.get<DebtDto>(`/api/debts/customer/${customerId}`);
    return response.data;
};

export const getDebtsByFilter = async (
    customerName?: string,
    debtType?: number,
    minAmount?: number,
    maxAmount?: number
): Promise<DebtDto[]> => {
    const params = new URLSearchParams();
    if (customerName) params.append('customerName', customerName);
    if (debtType !== undefined) params.append('debtType', debtType.toString());
    if (minAmount !== undefined) params.append('minAmount', minAmount.toString());
    if (maxAmount !== undefined) params.append('maxAmount', maxAmount.toString());

    const response = await axios.get<DebtDto[]>(`/api/debts/filter?${params.toString()}`);
    return response.data;
};

export const updateDebtFromInvoice = async (invoiceId: number): Promise<{ message: string }> => {
    const response = await axios.post<{ message: string }>(`/api/debts/update/${invoiceId}`);
    return response.data;
};

export const updateAllDebts = async (): Promise<{ message: string }> => {
    const response = await axios.post<{ message: string }>("/api/debts/update-all");
    return response.data;
}; 