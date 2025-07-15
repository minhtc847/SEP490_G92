import axios from "@/setup/axios";

export interface PurchaseOrderProductDto {
  productName: string;
  width: number;
  height: number;
  thickness: number;
  quantity: number;
}

export interface CreatePurchaseOrderDto {
  customerName: string;
  code?: string;
  description?: string;
  date: string; 
  status: string;
  products: PurchaseOrderProductDto[];
}

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

export interface CreateProductDto {
    productName: string;
    height: string;
    width: string;
    thickness: number;
    unitPrice: number;
    glassStructureId?: number | null;
}

export type OrderItem = {
    id: number;
    productId?: number;
    productName: string;
    width: number;
    height: number;
    thickness: number;
    quantity: number;
    unitPrice: number;
    uom?: string;
    glassStructureId?: number;
    isFromDatabase?: boolean;
};

export interface ProductCreatedResponse {
    id: number;
    productName: string;
    height: string;
    width: string;
    thickness: number;
    unitPrice: number;
    glassStructureId: number;
}

export const createProduct = async (payload: CreateProductDto): Promise<ProductCreatedResponse> => {
    const res = await axios.post('/api/purchaseorder/product', payload);
    return res.data;
};

export const checkProductNameExists = async (name: string): Promise<boolean> => {
    const res = await axios.get('/api/orders/check-product-name', {
        params: { name },
    });
    return res.data.exists;
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
    const res = await axios.get(`/api/orders/search-nvl?query=${query}`);
    return res.data;
};

export const createPurchaseOrder = async (dto: CreatePurchaseOrderDto) => {
  const response = await axios.post("/api/purchaseorder", dto);
  return response.data;
};

export const getAllCustomerNames = async (): Promise<string[]> => {
    const res = await axios.get('/api/orders/all-customer-names');
    return res.data;
};

export const getAllProductNames = async (): Promise<string[]> => {
    const res = await axios.get('/api/orders/all-product-names');
    return res.data;
};

export const loadCustomerOptions = async (inputValue: string): Promise<CustomerOption[]> => {
    const result = await searchCustomers(inputValue);
    return result.map((c) => ({
        label: `${c.customer.customerName}`,
        value: c.customer.id,
        customer: c.customer,
    }));
};

export const getNextPurchaseOrderCode = async (): Promise<string> => {
  const res = await axios.get('/api/purchaseorder/next-code');
  return res.data;
};

export const searchCustomers = async (query: string): Promise<CustomerOption[]> => {
    const res = await axios.get(`/api/orders/search-supplier?query=${query}`);
    return res.data.map((c: any) => ({
        label: `${c.customerCode} - ${c.customerName}`,
        value: c.id,
        customer: c,
    }));
};