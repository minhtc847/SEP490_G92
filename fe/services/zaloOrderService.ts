import axios from '@/setup/axios';

export interface ZaloOrderDetail {
    id: number;
    zaloOrderId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    createdAt: string;
}

export interface ZaloOrder {
    id: number;
    orderCode: string;
    zaloUserId: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    orderDate: string;
    totalAmount: number;
    status: string;
    note: string;
    createdAt: string;
    updatedAt: string;
    zaloOrderDetails: ZaloOrderDetail[];
}

export interface CreateZaloOrderDetail {
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface CreateZaloOrder {
    orderCode?: string;
    zaloUserId?: string;
    customerName?: string;
    customerPhone?: string;
    customerAddress?: string;
    orderDate: string;
    totalAmount: number;
    status: string;
    note?: string;
    zaloOrderDetails: CreateZaloOrderDetail[];
}

export interface UpdateZaloOrderDetail {
    id: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface UpdateZaloOrder {
    orderCode?: string;
    customerName?: string;
    customerPhone?: string;
    customerAddress?: string;
    orderDate: string;
    totalAmount: number;
    status: string;
    note?: string;
    zaloOrderDetails: UpdateZaloOrderDetail[];
}

class ZaloOrderService {
    private baseUrl = '/api/zaloorder';

    async getAllZaloOrders(): Promise<ZaloOrder[]> {
        try {
            const response = await axios.get<ZaloOrder[]>(this.baseUrl);
            return response.data;
        } catch (error) {
            console.error('Error fetching Zalo orders:', error);
            throw error;
        }
    }

    async getZaloOrderById(id: number): Promise<ZaloOrder> {
        try {
            const response = await axios.get<ZaloOrder>(`${this.baseUrl}/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching Zalo order:', error);
            throw error;
        }
    }

    async createZaloOrder(zaloOrder: CreateZaloOrder): Promise<ZaloOrder> {
        try {
            const response = await axios.post<ZaloOrder>(this.baseUrl, zaloOrder);
            return response.data;
        } catch (error) {
            console.error('Error creating Zalo order:', error);
            throw error;
        }
    }

    async updateZaloOrder(id: number, zaloOrder: UpdateZaloOrder): Promise<ZaloOrder> {
        try {
            const response = await axios.put<ZaloOrder>(`${this.baseUrl}/${id}`, zaloOrder);
            return response.data;
        } catch (error) {
            console.error('Error updating Zalo order:', error);
            throw error;
        }
    }

    async deleteZaloOrder(id: number): Promise<void> {
        try {
            await axios.delete(`${this.baseUrl}/${id}`);
        } catch (error) {
            console.error('Error deleting Zalo order:', error);
            throw error;
        }
    }
}

export default new ZaloOrderService();
