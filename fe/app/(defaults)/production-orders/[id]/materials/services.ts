import axios from "@/setup/axios";

export interface ProductionOutputDto {
    productionOutputId: number;
    productId: number;
    productName: string;
    productCode: string;
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

export interface MaterialDto {
    id: number;
    productionId: number;
    productionName: string;
    productionOutputId: number;
    uom: string;
    amount: number;
    costObject?: string;
    costItem?: string;
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

/**
 * Lấy danh sách Materials theo ProductId và ProductOutputId
 * @param productId - ID của product
 * @param productOutputId - ID của product output
 * @returns Promise<MaterialDto[]> - Danh sách materials
 */
export const getMaterialsByProductId = async (productId: number, productOutputId: number): Promise<MaterialDto[]> => {
    try {
        const response = await axios.get<MaterialDto[]>(`/api/Materials/by-product/${productId}?productOutputId=${productOutputId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching materials by product:', error);
        throw new Error('Không thể lấy danh sách materials');
    }
};

/**
 * Thêm materials cho một sản phẩm
 * @param glassProductId - ID của glass product
 * @param productionOutputId - ID của production output
 * @returns Promise<any> - Kết quả thêm materials
 */
export const addMaterialsForProduct = async (glassProductId: number, productionOutputId: number): Promise<any> => {
    try {
        const response = await axios.post(`/api/Materials/add-materials?glassProductId=${glassProductId}&productionOutputId=${productionOutputId}`);
        return response.data;
    } catch (error) {
        console.error('Error adding materials for product:', error);
        throw new Error('Không thể thêm materials cho sản phẩm');
    }
};
