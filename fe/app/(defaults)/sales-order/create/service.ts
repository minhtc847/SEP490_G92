import axios from '@/setup/axios';

export interface CreateOrderItem {
    productId: number;
    productCode: string;
    productName: string;
    height: string;
    width: string;
    thickness: number;
    quantity: number;
    unitPrice: number;
}

export interface CreateOrderDto {
    customerName: string;
    address: string;
    phone: string;
    orderCode: string;
    orderDate: string;
    discount: number;
    status: string;
    products: CreateOrderItem[];
}

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
    width: number;
    height: number;
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
    unitPrice: number;
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
    product: {
        id: number;
        productCode: string;
        productName: string;
        width: number;
        height: number;
        thickness: number;
        unitPrice: number;
        glassStructureId?: number;
    };
};

export interface CustomerOption {
    label: string;
    value: number;
    customer: {
        id: number;
        customerCode: string;
        customerName: string;
        address: string;
        phone: string;
        discount: number;
    };
}

export interface ProductSearchResult {
    id: number;
    productCode: string;
    productName: string;
    width: number;
    height: number;
    thickness: number;
    unitPrice: number;
    glassStructureId?: number;
}

export interface CreateProductDto {
    productName: string;
    height: string;
    width: string;
    thickness: number;
    unitPrice: number;
    glassStructureId: number;
}

export interface ProductCreatedResponse {
    id: number;
    productName: string;
    height: string;
    width: string;
    thickness: number;
    unitPrice: number;
    glassStructureId: number;
}

export const checkProductNameExists = async (name: string): Promise<boolean> => {
    const res = await axios.get('/api/orders/check-product-name', {
        params: { name },
    });
    return res.data.exists;
};

export const getGlassStructures = async (): Promise<GlassStructure[]> => {
    const res = await axios.get('/api/orders/glass-structures');
    return res.data;
};

export const getAllCustomerNames = async (): Promise<string[]> => {
    const res = await axios.get('/api/orders/all-customer-names');
    return res.data;
};

export const getAllProductNames = async (): Promise<string[]> => {
    const res = await axios.get('/api/orders/all-product-names');
    return res.data;
};

export const createProduct = async (payload: CreateProductDto): Promise<ProductCreatedResponse> => {
    const res = await axios.post('/api/orders/product', payload);
    return res.data;
};

export const searchCustomers = async (query: string): Promise<CustomerOption[]> => {
    const res = await axios.get(`/api/orders/search-customer?query=${query}`);
    return res.data.map((c: any) => ({
        label: `${c.customerCode} - ${c.customerName}`,
        value: c.id,
        customer: c,
    }));
};

export const getNextOrderCode = async (): Promise<string> => {
    const res = await axios.get('/api/orders/next-order-code');
    return res.data.nextOrderCode;
};

export const loadCustomerOptions = async (inputValue: string): Promise<CustomerOption[]> => {
    const result = await searchCustomers(inputValue);
    return result.map((c) => ({
        label: `${c.customer.customerName}`,
        value: c.customer.id,
        customer: c.customer,
    }));
};

export const loadOptions = async (inputValue: string, selectedProductIds: number[] = []): Promise<ProductOption[]> => {
    const result = await searchProducts(inputValue);

    return result.map((p) => ({
        label: `${p.productName}`,
        value: p.id,
        isDisabled: selectedProductIds.includes(p.id),
        product: {
            id: p.id,
            productCode: p.productCode,
            productName: p.productName,
            height: p.height,
            width: p.width,
            thickness: p.thickness,
            unitPrice: p.unitPrice,
            glassStructureId: p.glassStructureId,
        },
    }));
};

export const searchProducts = async (query: string): Promise<ProductSearchResult[]> => {
    const res = await axios.get(`/api/orders/search?query=${query}`);
    return res.data;
};

export const getOrderDetailById = async (id: number): Promise<OrderDetailDto> => {
    const res = await axios.get(`/api/orders/${id}`);
    return res.data;
};

export const updateOrderDetailById = async (id: number, payload: UpdateOrderPayload): Promise<void> => {
    await axios.put(`/api/orders/${id}`, payload);
};

export const checkProductCodeExists = async (code: string): Promise<boolean> => {
    const res = await axios.get(`/api/orders/check-code`, { params: { code } });
    return res.data.exists;
};

export const createOrderDetail = async (payload: CreateOrderDto) => {
    const res = await axios.post('/api/orders', payload);
    return res.data;
};
