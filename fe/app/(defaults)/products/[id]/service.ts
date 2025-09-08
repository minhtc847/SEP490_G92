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
    glassStructureId?: number;
    isupdatemisa?: number; // 0 = chưa cập nhật, 1 = đã cập nhật
}

export interface GlassStructureOption {
    id: number;
    productName: string;
}

export const getProductById = async (id: string): Promise<ProductDetail> => {
    const res = await axios.get(`/api/Product/${id}`);
    return res.data;
};

export const getGlassStructureById = async (id: number): Promise<GlassStructureOption> => {
    const res = await axios.get<GlassStructureOption>(`/api/GlassStructure/${id}`);
    return res.data;
};

export const getGlassStructures = async (): Promise<GlassStructureOption[]> => {
    const res = await axios.get<GlassStructureOption[]>('/api/Product/all');
    return res.data;
};

export const updateProduct = async (id: string, payload: any): Promise<any> => {
    const res = await axios.put(`/api/Product/${id}`, payload);
    return res.data;
};

// API để cập nhật MISA
export const updateMisaProduct = async (product: ProductDetail): Promise<any> => {
    // Map productType từ database sang format MISA yêu cầu
    const mapProductTypeToMisa = (productType: string | undefined): string => {
        if (!productType) return "Hàng hóa";
        
        switch (productType.toLowerCase()) {
            case 'nvl':
            case 'nguyên vật liệu':
                return "Nguyên vật liệu";
            case 'thành phẩm':
            case 'tp':
                return "Thành phẩm";
            default:
                return "Hàng hóa";
        }
    };

    const misaPayload = {
        ProductId: product.id,
        Name: product.productName || '',
        Type: mapProductTypeToMisa(product.productType),
        Unit: product.uom || 'Tấm'
    };

    const res = await axios.post('/api/Selenium/product', misaPayload);
    return res.data;
};

// API để cập nhật trạng thái isupdatemisa thành true
export const updateProductMisaStatus = async (productId: number): Promise<any> => {
    const res = await axios.put(`/api/Product/${productId}/update-misa-status`);
    return res.data;
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