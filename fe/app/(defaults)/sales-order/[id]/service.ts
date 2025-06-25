import axios from "../../../../setup/axios";


export interface createProductonPlan{
    id: string,
    productCode: string,
    thickness: string,
    height: string,
    width: string,
    quantity: string,
    inProgressQuantity: string,
    completed: string
}

export const createProductonPlan = async (id:string): Promise<createProductonPlan[]> => {
    try {
        const response = await axios.get<createProductonPlan[]>("/api/ProductionPlan/Details/" + id, {
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
      await axios.put(`/api/ProductionPlan/${id}/status`, {
        status: status
      } as UpdateStatusRequest);
    } catch (error) {
      throw error;
    }
};
  