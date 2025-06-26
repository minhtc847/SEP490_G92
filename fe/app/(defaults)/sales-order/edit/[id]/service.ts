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
    productName: string;
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


export const loadOptions = async (inputValue: string, existingProductCodes: string[]) => {
    const result = await searchProducts(inputValue);
    const filtered = result.filter(p => !existingProductCodes.includes(p.productCode));
    return filtered.map(p => ({
        label: `${p.productCode} - ${p.productName}`,
        value: p.id,
        product: p,
    }));
};




export const checkProductCodeExists = async (code: string): Promise<boolean> => {
  const res = await axios.get(`/api/orders/check-code`, { params: { code } });
  return res.data.exists;
};




export const searchProducts = async (query: string): Promise<OrderItem[]> => {
  const res = await axios.get(`/api/orders/search?query=${query}`);
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