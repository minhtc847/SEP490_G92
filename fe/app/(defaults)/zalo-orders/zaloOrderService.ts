import axios from '@/setup/axios';

export interface ZaloOrderDetail {
    id: number;
    zaloOrderId: number;
    productName: string;
    productCode: string;
    height?: string;
    width?: string;
    thickness?: string;
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



export interface UpdateZaloOrderDetail {
    id: number;
    productName: string;
    productCode: string;
    height?: string;
    width?: string;
    thickness?: string;
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

    async getProductCodes(): Promise<string[]> {
        try {
            const response = await axios.get<string[]>('/api/GlassStructure/product-codes');
            return response.data;
        } catch (error) {
            console.error('Error fetching product codes:', error);
            throw error;
        }
    }

    async convertToOrder(id: number): Promise<{ message: string; orderCode: string }> {
        try {
            const response = await axios.post<{ message: string; orderCode: string }>(`${this.baseUrl}/${id}/convert-to-order`);
            return response.data;
        } catch (error) {
            console.error('Error converting Zalo order to sale order:', error);
            throw error;
        }
    }
}

export default new ZaloOrderService();
