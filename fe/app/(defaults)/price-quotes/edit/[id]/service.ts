import axios from '@/setup/axios';

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

export const getPriceQuoteById = async (id: string): Promise<PriceQuoteDetail> => {
    const response = await axios.get<PriceQuoteDetail>(`/api/GlassStructure/${id}`);
    return response.data;
};

export const updatePriceQuote = async (id: number, data: Partial<PriceQuoteDetail>) => {
    const response = await axios.put(`/api/GlassStructure/${id}`, data);
    return response.data;
};

export const deletePriceQuote = async (id: number | string) => {
    try {
        await axios.delete(`/api/GlassStructure/${id}`);
    } catch (error) {
        throw error;
    }
};


