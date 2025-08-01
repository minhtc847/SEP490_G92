import axios from "@/setup/axios";

export interface DeliveryDto {
    id: number;
    salesOrderId: number;
    orderCode: string;
    customerName: string;
    deliveryDate: string;
    status: number;
    note?: string;
    createdAt: string;
    exportDate: string;
    totalAmount: number;
}

export const getDeliveries = async (): Promise<DeliveryDto[]> => {
    const response = await axios.get<DeliveryDto[]>("/api/delivery");
    return response.data;
};

export const getDeliveryById = async (id: number): Promise<DeliveryDto> => {
    const response = await axios.get<DeliveryDto>(`/api/delivery/${id}`);
    return response.data;
};

export interface CreateDeliveryDetailDto {
    productId: number;
    quantity: number;
    note?: string;
}

export interface CreateDeliveryDto {
    salesOrderId: number;
    deliveryDate?: string;
    exportDate?: string;
    status: number;
    note?: string;
    deliveryDetails: CreateDeliveryDetailDto[];
}

export interface DeliveryValidationItem {
    productId: number;
    productName: string;
    requestedQuantity: number;
    availableQuantity: number;
    isValid: boolean;
}

export interface DeliveryValidationResult {
    isValid: boolean;
    errors: string[];
    validationItems: DeliveryValidationItem[];
}

export const getProductionPlanValidation = async (salesOrderId: number): Promise<DeliveryValidationItem[]> => {
    const response = await axios.get<DeliveryValidationItem[]>(`/api/delivery/validation/${salesOrderId}`);
    return response.data;
};

export const createDelivery = async (delivery: CreateDeliveryDto): Promise<DeliveryDto> => {
    const response = await axios.post<DeliveryDto>("/api/delivery", delivery);
    return response.data;
};

export const updateDeliveryPartial = async (id: number, delivery: Partial<DeliveryDto>): Promise<DeliveryDto> => {
    const response = await axios.put<DeliveryDto>(`/api/delivery/${id}`, delivery);
    return response.data;
};

export const deleteDelivery = async (id: number): Promise<void> => {
    await axios.delete(`/api/delivery/${id}`);
};

export const updateDeliveryStatus = async (id: number, status: number): Promise<void> => {
    await axios.put(`/api/delivery/${id}/status`, { status });
};

export interface DeliveryDetailDto {
    id: number;
    salesOrderId: number;
    orderCode: string;
    customerName: string;
    customerAddress: string;
    customerPhone: string;
    deliveryDate: string | null;
    exportDate: string | null;
    status: number;
    note?: string;
    createdAt: string;
    totalAmount: number;
    deliveryDetails: DeliveryDetailItemDto[];
}

export interface DeliveryDetailItemDto {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    note?: string;
}

export interface UpdateDeliveryDto {
    deliveryDate?: string;
    exportDate?: string;
    status: number;
    note?: string;
    deliveryDetails: UpdateDeliveryDetailDto[];
}

export interface UpdateDeliveryDetailDto {
    id: number;
    productId: number;
    quantity: number;
    note?: string;
}

export const getDeliveryDetail = async (id: number): Promise<DeliveryDetailDto> => {
    const response = await axios.get<DeliveryDetailDto>(`/api/delivery/${id}`);
    return response.data;
};

export const updateDelivery = async (id: number, delivery: UpdateDeliveryDto): Promise<void> => {
    await axios.put(`/api/delivery/${id}`, delivery);
};

export interface SalesOrderOption {
    id: number;
    orderCode: string;
    customerName: string;
    totalAmount: number;
}

export interface SalesOrderDetail {
    id: number;
    orderCode: string;
    orderDate: string;
    customer: {
        id: number;
        customerName: string;
        address: string;
        phone: string;
    };
    products: Array<{
        id: number;
        productName: string;
        width: number;
        height: number;
        thickness: number;
        quantity: number;
        unitPrice: number;
    }>;
    totalAmount: number;
}

export const getSalesOrdersForDelivery = async (): Promise<SalesOrderOption[]> => {
    const response = await axios.get<SalesOrderOption[]>("/api/orders");
    return response.data;
};

export const getSalesOrderDetail = async (orderId: number): Promise<SalesOrderDetail> => {
    const response = await axios.get<SalesOrderDetail>(`/api/orders/${orderId}/detail`);
    return response.data;
};