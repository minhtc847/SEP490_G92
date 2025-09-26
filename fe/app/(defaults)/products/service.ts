import axios from '@/setup/axios';

export interface Product {
    id: string;
    // Support both backend `ProductCode` and frontend `productCode`
    productCode?: string;
    ProductCode?: string;
    productName: string;
    productType: string;
    uom: string;
    isupdatemisa: number; // 0 = chưa cập nhật, 1 = đã cập nhật
}

export const getProducts = async (): Promise<Product[]> => {
    try {
        const response = await axios.get<Product[]>('/api/Product');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteProduct = async (id: string): Promise<void> => {
    try {
        await axios.delete(`/api/Product/${id}`);
    } catch (error) {
        throw error;
    }
};

export const getProductsNotUpdated = async (): Promise<Product[]> => {
    try {
        const response = await axios.get<Product[]>('/api/Product');
        return response.data.filter(product => product.isupdatemisa === 0);
    } catch (error) {
        throw error;
    }
};

export const updateManyProducts = async (products: Product[]): Promise<void> => {
    try {
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
        const productsToUpdate = products.map(product => ({
            ProductId: parseInt(product.id),
            Name: product.productName,
            Type: mapProductTypeToMisa(product.productType),
            Unit: product.uom
        }));
        
        await axios.post('/api/selenium/products/add-many', productsToUpdate);
    } catch (error) {
        throw error;
    }
};