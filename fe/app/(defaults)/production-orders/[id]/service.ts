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

export const getProductionPlanDetailsArray = async (): Promise<ProductionPlanDetail[]> => {
    try {
        const response = await axios.get<ProductionPlanDetailsArray[]>("/api/ProductionPlan/Details", {
        })
        return response.data
    } catch (error) {
        throw error
    }
}