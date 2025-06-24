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