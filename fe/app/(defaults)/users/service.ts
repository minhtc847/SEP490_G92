import axios from "../../../setup/axios";


export interface TestTable{
    id: string;
    name: string;
    created_at: string;
}

export const getTestTableArray = async (): Promise<TestTable[]> => {
    try {
        const response = await axios.get<TestTable[]>("/api/test-table", {
        })
        return response.data
    } catch (error) {
        throw error
    }
}
