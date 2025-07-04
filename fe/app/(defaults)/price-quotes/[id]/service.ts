import axios from '@/setup/axios';

export interface PriceQuoteDetail {
    id: string;
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
