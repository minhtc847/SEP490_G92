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

export const createDelivery = async (delivery: Omit<DeliveryDto, 'id' | 'createdAt'>): Promise<DeliveryDto> => {
    const response = await axios.post<DeliveryDto>("/api/delivery", delivery);
    return response.data;
};

export const updateDelivery = async (id: number, delivery: Partial<DeliveryDto>): Promise<DeliveryDto> => {
    const response = await axios.put<DeliveryDto>(`/api/delivery/${id}`, delivery);
    return response.data;
};

export const deleteDelivery = async (id: number): Promise<void> => {
    await axios.delete(`/api/delivery/${id}`);
};
