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