import axios from "../../../../setup/axios";


export interface ProductonPlan{
    id: string,
    planDate: string,
    ordercode: string,
    customername: string,
    status: string,
    quantity: string,  
    inProgressQuantity: string,
    completed: string
}

export const createProductonPlan = async (id:string,): Promise<ProductonPlan[]> => {
    try {
        const response = await axios.post<ProductonPlan[]>("/api/ProductionPlan/CreatePlans/${id}", {
        })
        return response.data
    } catch (error) {
        throw error
    }
}




  