import axios from "@/setup/axios";

export interface OrderDto {
    id: number;
    customerName: string;
    orderCode: string;
    orderDate: string;
    status: string;
    totalAmount: number;
}

export const getOrders = async (): Promise<OrderDto[]> => {
    const response = await axios.get<OrderDto[]>("/api/orders");
    return response.data;
};
