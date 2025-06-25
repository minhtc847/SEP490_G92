import axios from "@/setup/axios";

export interface ProductionOutputDto {
    productId: number;
    productName: string;
    uom: string;
    amount: number;
    orderId: number;
    costObject: string;
}

export interface ProductionOrderDto {
    productionOrderCode: string;
    orderDate: string;
    description: string;
    productionStatus: string;
}

/**
 * Lấy thông tin ProductionOrder theo Id
 * @param productionOrderId - ID của production order
 * @returns Promise<ProductionOrderDto> - Thông tin production order
 */
export const getProductionOrderById = async (productionOrderId: number): Promise<ProductionOrderDto> => {
    try {
        const response = await axios.get<ProductionOrderDto>(`/api/ProductionOrders/${productionOrderId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching production order:', error);
        throw new Error('Không thể lấy thông tin production order');
    }
};

/**
 * Lấy danh sách ProductionOutput của một ProductionOrder
 * @param productionOrderId - ID của production order
 * @returns Promise<ProductionOutputDto[]> - Danh sách production outputs
 */
export const getProductionOutputs = async (productionOrderId: number): Promise<ProductionOutputDto[]> => {
    try {
        const response = await axios.get<ProductionOutputDto[]>(`/api/ProductionOrders/${productionOrderId}/production-outputs`);
        return response.data;
    } catch (error) {
        console.error('Error fetching production outputs:', error);
        throw new Error('Không thể lấy danh sách production outputs');
    }
};
