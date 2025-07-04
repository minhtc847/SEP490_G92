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

export const createPriceQuote = async (data: PriceQuoteDetail) => {
    const response = await axios.post('/api/GlassStructure', data);
    return response.data;
};

export const checkProductCodeExists = async (code: string): Promise<boolean> => {
    const response = await axios.get(`/api/GlassStructure/check-code?code=${encodeURIComponent(code)}`);
    return response.data.exists;
};

export const checkProductNameExists = async (name: string): Promise<boolean> => {
    const response = await axios.get(`/api/GlassStructure/check-name?name=${encodeURIComponent(name)}`);
    return response.data.exists;
};

export const getAllCategories = async (): Promise<string[]> => {
    const response = await axios.get('/api/GlassStructure/categories');
    return response.data;
};

