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
    ProductName: string;
    Height?: string | null;
    Width?: string | null;
    Thickness?: number | null;
    UnitPrice: number;
    GlassStructureId?: number | null;
    Isupdatemisa?: boolean; // true = đã cập nhật, false = chưa cập nhật
    UOM?: string;
    ProductType?: string;
    Weight?: number | null;
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
    try {
        const res = await axios.get('/api/GlassStructure');
        return res.data;
    } catch (error: any) {
        throw new Error('Không thể lấy được danh sách cấu trúc kính từ /api/GlassStructure');
    }
};

export const createProduct = async (payload: CreateProductDto): Promise<ProductCreatedResponse> => {
    const res = await axios.post('/api/orders/product', payload);
    return res.data;
};



export const checkProductNameExists = async (name: string): Promise<boolean> => {
    const res = await axios.get('/api/orders/check-product-name', {
        params: { name },
    });
    return res.data.exists;
};