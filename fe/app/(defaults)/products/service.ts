import axios from '@/setup/axios';

export interface Product {
    id: string;
    productName: string;
    productType: string;
    uom: string;
}

export const getProducts = async (): Promise<Product[]> => {
    try {
        const response = await axios.get<Product[]>('/api/Product');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteProduct = async (id: string): Promise<void> => {
    try {
        await axios.delete(`/api/Product/${id}`);
    } catch (error) {
        throw error;
    }
};