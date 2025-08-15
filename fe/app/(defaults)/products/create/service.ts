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
    isupdatemisa?: number; // 0 = chưa cập nhật, 1 = đã cập nhật
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
        // Thử endpoint chính trước
        const res = await axios.get('/api/orders/glass-structures');
        return res.data;
    } catch (error) {
        console.error('Error with /api/orders/glass-structures:', error);
        try {
            // Thử endpoint thay thế
            const res2 = await axios.get('/api/GlassStructure');
            return res2.data;
        } catch (error2) {
            console.error('Error with /api/GlassStructure:', error2);
            try {
                // Thử endpoint cuối cùng
                const res3 = await axios.get('/api/Product/all');
                return res3.data;
            } catch (error3) {
                console.error('Error with /api/Product/all:', error3);
                throw new Error('Không thể lấy được danh sách cấu trúc kính');
            }
        }
    }
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