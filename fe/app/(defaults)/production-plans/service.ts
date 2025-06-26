import axios from "../../../setup/axios";


export interface ProductionPlan{
    id: string,
    planDate: string,
    orderCode: string,
    customerName: string,
    quantity: string,
    status: string
}

export const getProductionPlansArray = async (): Promise<ProductionPlan[]> => {
    try {
        const response = await axios.get<ProductionPlan[]>("/api/ProductionPlan", {
        })
        return response.data
    } catch (error) {
        throw error
    }
}

export interface UpdateStatusRequest {
    status: string;
}

export const updateProductionPlanStatus = async (id: string, status: string): Promise<void> => {
    try {
      await axios.put(`/api/ProductionPlan/${id}/ChangeStatus`, {
        status: status
      } as UpdateStatusRequest);
    } catch (error) {
      throw error;
    }
};