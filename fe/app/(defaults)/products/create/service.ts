import axios from '@/setup/axios';

export interface ProductCreatedResponse {
    id: number;
    productName: string;
    height: string;
    width: string;
    thickness: number;
    unitPrice: number;
    glassStructureId: number;
}

export interface CreateProductDto {
    productName: string;
    height?: string | null;
    width?: string | null;
    thickness?: number | null;
    unitPrice: number;
    glassStructureId?: number | null;
}

export interface GlassStructure {
    id: number;
    productCode: string;
    productName: string;
    edgeType?: string;
    adhesiveType?: string;
    composition?: string;
    unitPrice?: number;
}

export const getGlassStructures = async (): Promise<GlassStructure[]> => {
    const res = await axios.get('/api/orders/glass-structures');
    return res.data;
};

export const createProduct = async (payload: CreateProductDto): Promise<ProductCreatedResponse> => {
    const res = await axios.post('/api/orders/product', payload);
    return res.data;
};

export const createProductNVL = async (payload: CreateProductDto): Promise<ProductCreatedResponse> => {
    const res = await axios.post('/api/PurchaseOrder/product', payload);
    return res.data;
};

export const checkProductNameExists = async (name: string): Promise<boolean> => {
    const res = await axios.get('/api/orders/check-product-name', {
        params: { name },
    });
    return res.data.exists;
};