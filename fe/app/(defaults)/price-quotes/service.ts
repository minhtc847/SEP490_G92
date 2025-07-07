import axios from '@/setup/axios';

export interface PriceQuote {
    id: string;
    productName: string;
    category: string;
    productCode: string;
    unitPrice: number;
}

export const getPriceQuotes = async (): Promise<PriceQuote[]> => {
    try {
        const response = await axios.get<PriceQuote[]>('/api/GlassStructure');
        return response.data;
    } catch (error) {
        throw error;
    }
};
