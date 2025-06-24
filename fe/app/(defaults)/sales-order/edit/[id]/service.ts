import AsyncSelect from 'react-select/async';
import axios from '@/setup/axios';

export interface UpdateProductDto {
    productId: number;
    productCode?: string;
    productName?: string;
    height?: string;
    width?: string;
    thickness?: number;
    unitPrice?: number;
    quantity: number;
    glassStructureId?: number;
}

export interface UpdateOrderPayload {
    customerName: string;
    address: string;
    phone: string;
    discount: number;
    status: string;
    products: UpdateProductDto[];
}

export interface OrderItem {
    id: number;
    productId: number;
    productCode: string;
    productName: string;
    height: number;
    width: number;
    thickness: number;
    quantity: number;
    unitPrice: number;
    glassStructureId?: number;
}
export interface OrderDetailDto {
    id: number;
    orderCode: string;
    orderDate: string;
    status: string;
    customerName: string;
    address: string;
    phone: string;
    discount: number;
    products: OrderItem[];
}

export interface GlassStructure {
    id: number;
    productCode: string;
    category: string;
    edgeType?: string;
    adhesiveType?: string;
    composition?: string;
}

export interface ProductSuggestion {
    id: number;
    productCode: string;
    productName: string;
    width: number;
    height: number;
    thickness: number;
    unitPrice: number;
}

export type ProductOption = {
    label: string;
    value: number;
    data: OrderItem;
};

export const loadProductOptions = (inputValue: string, callback: (options: ProductOption[]) => void) => {
    axios
        .get(`/api/search?query=${inputValue}`)
        .then((res) => {
            const options = res.data.map((p: any) => ({
                label: `${p.productName} (${p.productCode})`,
                value: p.id,
                data: {
                    id: p.id,
                    productId: p.id,
                    productCode: p.productCode,
                    productName: p.productName,
                    width: p.width,
                    height: p.height,
                    thickness: p.thickness,
                    quantity: 1,
                    unitPrice: p.unitPrice,
                    glassStructureId: undefined,
                } as OrderItem,
            }));
            callback(options);
            console.log('Tìm kiếm:', inputValue);
            console.log('Kết quả API:', res.data);
        })
        .catch((err) => {
            console.error('Lỗi load options:', err);
            callback([]);
        });
};

export const searchProducts = async (query: string): Promise<ProductSuggestion[]> => {
    const res = await axios.get(`/api/search`, {
        params: { query },
    });
    return res.data;
};

export const getGlassStructures = async (): Promise<GlassStructure[]> => {
    const res = await axios.get('/api/glass-structures');
    return res.data;
};

export const getOrderDetailById = async (id: number): Promise<OrderDetailDto> => {
    const res = await axios.get(`/api/orders/${id}`);
    return res.data;
};

export const updateOrderDetailById = async (id: number, payload: UpdateOrderPayload): Promise<void> => {
    await axios.put(`/api/orders/${id}`, payload);
};
