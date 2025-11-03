import axios from "@/setup/axios";

export interface OrderDto {
    id: number;
    customerName: string;
    orderCode: string;
    orderDate: string;
    status: number;
    deliveryStatus: number;
    totalAmount: number;
    isUpdateMisa: boolean;
}

export const getOrders = async (): Promise<OrderDto[]> => {
    const response = await axios.get<OrderDto[]>("/api/orders");
    return response.data;
};

export const getOrdersNotUpdated = async (): Promise<OrderDto[]> => {
    try {
        const response = await axios.get<OrderDto[]>("/api/orders");
        return response.data.filter(order => !order.isUpdateMisa);
    } catch (error) {
        throw error;
    }
};

export const updateManySaleOrders = async (orders: OrderDto[]): Promise<void> => {
    try {
        // Lấy dữ liệu chi tiết cho từng đơn hàng
        const ordersWithDetails = await Promise.all(
            orders.map(async (order) => {
                const orderDetail = await axios.get(`/api/orders/${order.id}/misa-data`);
                return orderDetail.data;
            })
        );
        
        await axios.post('/api/selenium/sale-order/add-many', ordersWithDetails);
    } catch (error) {
        throw error;
    }
};