// /app/(defaults)/purchase-order/service.ts
// -------------------------------------------------------------
// Centralised service layer cho cả trang Create & Edit PO
// -------------------------------------------------------------

import axios from '@/setup/axios';

// ─────────────────────────────────────────── Kiểu chung
export interface PurchaseOrderProductDto {
  productName: string;
  width?: number | null;
  height?: number | null;
  thickness?: number | null;
  quantity: number;
}

export interface CreatePurchaseOrderDto {
  customerName: string;
  code?: string;
  description?: string;
  date: string; // ISO yyyy-MM-dd
  status: string;
  products: PurchaseOrderProductDto[];
}

export interface UpdatePurchaseOrderDetailDto {
  productId?: number;
  productName: string;
  width?: number | null;
  height?: number | null;
  thickness?: number | null;
  quantity: number;
}

export interface UpdatePurchaseOrderDto {
  customerName: string;
  description?: string;
  status?: string;
  products: UpdatePurchaseOrderDetailDto[];
}

export interface PurchaseOrderDetailDto {
  productId?: number;
  productCode?: string;
  productName?: string;
  width?: string;
  height?: string;
  thickness?: number;
  quantity?: number;
}

export interface PurchaseOrderWithDetailsDto {
  id: number;
  code?: string;
  date?: string;
  description?: string;
  status?: string;
  customerName?: string;
  supplierName?: string;
  employeeName?: string;
  totalValue?: number;
  purchaseOrderDetails: PurchaseOrderDetailDto[];
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
  width: string | null;
  height: string | null;
  thickness: number | null;
  unitPrice: number;
}

export type ProductOption = {
  label: string;
  value: number;
  product: {
    id: number;
    productCode: string;
    productName: string;
    width: string | null;
    height: string | null;
    thickness: number | null;
    unitPrice: number;
  };
};

export interface CreateProductDto {
  productName: string;
  width?: string | null;
  height?: string | null;
  thickness?: number | null;
  unitPrice: number;
  glassStructureId?: number | null;
}

export interface ProductCreatedResponse {
  id: number;
  productName: string;
  width?: string | null;
  height?: string | null;
  thickness?: number | null;
  unitPrice: number;
  glassStructureId?: number | null;
}

export const getPurchaseOrderById = async (id: number): Promise<PurchaseOrderWithDetailsDto> => {
    const res = await axios.get(`/api/PurchaseOrder/${id}`);
    return res.data;
};

export const updatePurchaseOrder = async (id: number, dto: UpdatePurchaseOrderDto): Promise<void> => {
  await axios.put(`/api/purchaseorder/${id}`, dto);
};

export const createPurchaseOrder = async (dto: CreatePurchaseOrderDto) => {
  const res = await axios.post('/api/purchaseorder', dto);
  return res.data;
};

export const deletePurchaseOrder = async (id: number) => axios.delete(`/api/purchaseorder/${id}`);

// ---------------- Product helpers ----------------
export const searchProducts = async (query: string): Promise<ProductSearchResult[]> => {
  const res = await axios.get(`/api/orders/search-nvl`, { params: { query } });
  return res.data;
};

export const loadOptions = async (inputValue: string, disabledIds: (number | string)[] = []): Promise<ProductOption[]> => {
  const result = await searchProducts(inputValue);
  return result.map((p) => ({
    label: `${p.productName}`,
    value: p.id,
    isDisabled: disabledIds.includes(p.id),
    product: {
      id: p.id,
      productCode: p.productCode,
      productName: p.productName,
      width: p.width,
      height: p.height,
      thickness: p.thickness,
      unitPrice: p.unitPrice,
    },
  }));
};

export const checkProductNameExists = async (name: string): Promise<boolean> => {
  const res = await axios.get('/api/orders/check-product-name', { params: { name } });
  return res.data.exists;
};

export const createProduct = async (payload: CreateProductDto): Promise<ProductCreatedResponse> => {
  const res = await axios.post('/api/purchaseorder/product', payload);
  return res.data;
};

export const getAllProductNames = async (): Promise<string[]> => {
  const res = await axios.get('/api/orders/all-product-names');
  return res.data;
};

export const searchCustomers = async (query: string): Promise<CustomerOption[]> => {
  const res = await axios.get('/api/orders/search-customer', { params: { query } });
  return res.data.map((c: any) => ({
    label: `${c.customerCode} - ${c.customerName}`,
    value: c.id,
    customer: c,
  }));
};

export const loadCustomerOptions = async (inputValue: string): Promise<CustomerOption[]> => {
  const result = await searchCustomers(inputValue);
  return result.map((c) => ({
    label: `${c.customer.customerName}`,
    value: c.customer.id,
    customer: c.customer,
  }));
};

export const getAllCustomerNames = async (): Promise<string[]> => {
  const res = await axios.get('/api/orders/all-customer-names');
  return res.data;
};

export const getNextPurchaseOrderCode = async (): Promise<string> => {
  const res = await axios.get('/api/purchaseorder/next-code');
  return res.data;
};
