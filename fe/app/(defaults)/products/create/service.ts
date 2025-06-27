import axios from '@/setup/axios';

export interface ProductDetail {
    id: number;
    productName: string;
    productType: string;
    uom: string;
    height: string;
    width: string;
    thickness: number;
    weight: number;
    unitPrice: number;
    glassStructureId: number;
}

export interface GlassStructureOption {
    id: number;
    productName: string;
}

export const getProductById = async (id: string): Promise<ProductDetail> => {
    const res = await axios.get(`/api/Product/${id}`);
    return res.data;
};

export const updateProduct = async (id: number, data: ProductDetail) => {
    await axios.put(`/api/Product/${id}`, data);
};

export const deleteProduct = async (id: string) => {
    await axios.delete(`/api/Product/${id}`);
};

export const createProduct = async (data: ProductDetail) => {
    await axios.post(`/api/Product`, data);
};

export const searchGlassStructures = async (inputValue: string): Promise<GlassStructureOption[]> => {
    const res = await axios.get(`/api/glass-structures/search?query=${inputValue}`);
    return res.data;
};
