import axios from '@/setup/axios';

export interface PriceQuote {
    id: string;
    productName: string;
    category: string;
    productCode: string;
    unitPrice: number;
}

export interface PriceQuoteDetail {
    id: number;
    productCode: string;
    productName: string;
    category: string;
    edgeType: string;
    adhesiveType: string;
    glassLayers: number;
    adhesiveLayers: number;
    adhesiveThickness: number;
    unitPrice: number;
    composition: string;
}

export const getPriceQuotes = async (): Promise<PriceQuote[]> => {
    try {
        const response = await axios.get<PriceQuote[]>('/api/GlassStructure');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deletePriceQuote = async (id: number | string) => {
    try {
        await axios.delete(`/api/GlassStructure/${id}`);
    } catch (error) {
        throw error;
    }
};