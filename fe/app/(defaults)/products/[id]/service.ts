import axios from '@/setup/axios';

export interface ProductDetail {
    id: number;
    productCode?: string;
    productName?: string;
    productType?: string;
    uom?: string;
    height?: string;
    width?: string;
    thickness?: number;
    weight?: number;
    unitPrice?: number;
    glassStructureId: number;
}

export interface GlassStructureOption {
    id: number;
    productName: string;
}

export const getProductById = async (id: string): Promise<ProductDetail> => {
    const res = await axios.get<ProductDetail>(`/api/Product/${id}`);
    return res.data;
};

export const updateProduct = async (id: number, data: ProductDetail): Promise<void> => {
    await axios.put(`/api/Product/${id}`, data);
};

export const deleteProduct = async (id: string): Promise<void> => {
    await axios.delete(`/api/Product/${id}`);
};

export const getProducts = async (): Promise<ProductDetail[]> => {
    const res = await axios.get<ProductDetail[]>(`/api/Product`);
    return res.data;
};

export const getGlassStructureOptions = async (): Promise<GlassStructureOption[]> => {
    const res = await axios.get<GlassStructureOption[]>(`/api/GlassStructure`);
    return res.data;
};

export const getGlassStructureById = async (id: number): Promise<GlassStructureOption> => {
    const res = await axios.get<GlassStructureOption>(`/api/GlassStructure/${id}`);
    return res.data;
};