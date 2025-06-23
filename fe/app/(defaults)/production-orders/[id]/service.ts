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

export const getProductionPlanDetailsArray = async (id:string): Promise<ProductionPlanDetail[]> => {
    try {
        const response = await axios.get<ProductionPlanDetail[]>("/api/ProductionPlan/Details/" + id, {
        })
        return response.data
    } catch (error) {
        throw error
    }
}