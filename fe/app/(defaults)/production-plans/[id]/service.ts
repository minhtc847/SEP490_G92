import axios from "../../../../setup/axios";


export interface ProductionPlanDetail{
    id: string,
    productCode: string,
    thickness: string,
    height: string,
    width: string,
    quantity: string,
    inProgressQuantity: string,
    completed: string
}

export interface ProductionOrdersByPlanDto {
    productionOrderCode: string;
    orderDate: string;
    description: string;
    productionStatus: string;
    totalAmount: number;
    productCodes: string[];
}

export interface ProductionOrderProductDto {
    productId: number;
    quantity: number;
}

export interface ProductionOrderCreateRequest {
    productionPlanId: number;
    description?: string;
    products: ProductionOrderProductDto[];
}

export interface ProductionOrder {
    id: number;
    productionOrderCode: string;
    orderDate: string;
    description?: string;
    productionStatus: string;
    productionPlanId: number;
}

export const getProductionPlanDetailsArray = async (id:string): Promise<ProductionPlanDetail[]> => {
    try {
        const response = await axios.get<ProductionPlanDetail[]>("/api/ProductionPlan/Details/" + id, {
        })
        return response.data
    } catch (error) {
        throw error
    }
}

export const getProductionOrdersByPlanId = async (productionPlanId: number): Promise<ProductionOrdersByPlanDto[]> => {
    try {
        const response = await axios.get<ProductionOrdersByPlanDto[]>(`/api/ProductionOrders/by-plan/${productionPlanId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const createProductionOrder = async (request: ProductionOrderCreateRequest): Promise<ProductionOrder> => {
    try {
        const response = await axios.post<ProductionOrder>("/api/ProductionOrders", request);
        return response.data;
    } catch (error) {
        throw error;
    }
}