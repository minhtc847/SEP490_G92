import axios from '@/setup/axios';

export interface ProductionOrderListItem {
  id: number;
  orderDate: string;
  type: string;
  description: string;
  productionStatus?: string;
}

export interface ProductionOrderInfo {
  id: number;
  description?: string;
  type?: string;
  status?: string;
}

export interface ProductItem {
  id?: number;
  outputId?: number;
  productName: string;
  uom: number | string;
  quantity: number;
  done?: number;
}

export interface MaterialItem {
  id?: number;
  productName: string;
  uom: number | string;
  totalQuantity: number;
  quantityPer?: number;
}

export interface ProductWithMaterialsResponse {
  product: ProductItem;
  materials: MaterialItem[];
}

export interface AddOutputPayload {
  productName: string;
  uom: number; // int
  quantity: number;
}

export interface UpdateOutputPayload {
  productName: string;
  uom: number; // int
  amount: number;
}

export interface UpdateMaterialPayload {
  productId: number;
  productName: string;
  amount: number;
}

export interface AddMaterialPayload {
  productId: number;
  productName: string;
  uom: number; // int
  totalQuantity: number;
}

/**
 * Fetch all production orders from backend
 * @returns Promise<ProductionOrderListItem[]>
 */
export async function fetchAllProductionOrders(): Promise<ProductionOrderListItem[]> {
  const response = await axios.get('/api/ProductionOrders/all');
  // Map to the expected structure if needed
  return response.data.map((item: any) => ({
    id: item.productionOrderId || item.id,
    orderDate: item.orderDate,
    type: item.type,
    description: item.description,
    productionStatus: item.productionStatus || item.status,
  }));
} 

/**
 * Get production order info (description, type, status)
 */
export async function fetchProductionOrderInfo(id: number | string): Promise<ProductionOrderInfo> {
  const response = await axios.get(`/api/ProductionAccountantControllers/production-order-info/${id}`);
  return response.data;
}

/**
 * Get products (outputs) by production order id
 */
export async function fetchProductionOrderProducts(id: number | string): Promise<ProductItem[]> {
  const response = await axios.get(`/api/ProductionAccountantControllers/production-ordersDetails/${id}`);
  return response.data;
}

/**
 * Get materials by output id
 */
export async function fetchMaterialsByOutputId(outputId: number): Promise<ProductWithMaterialsResponse> {
  const response = await axios.get(`/api/ProductionAccountantControllers/products-materials-by-output/${outputId}`);
  return response.data;
}

/**
 * Add an output to a production order
 */
export async function addOutputInfo(productionOrderId: number | string, payload: AddOutputPayload): Promise<void> {
  await axios.post(`/api/ProductionAccountantControllers/add-output-info/${productionOrderId}` , payload);
}

/**
 * Update an existing output
 */
export async function updateOutputInfo(outputId: number | string, payload: UpdateOutputPayload): Promise<void> {
  await axios.put(`/api/ProductionAccountantControllers/update-output-info/${outputId}`, payload);
}

/**
 * Update existing material
 */
export async function updateMaterialInfo(materialId: number | string, payload: UpdateMaterialPayload): Promise<void> {
  await axios.put(`/api/ProductionAccountantControllers/update-material-info/${materialId}`, payload);
}

/**
 * Add material to an output
 */
export async function addMaterialInfo(productionOrderId: number | string, outputId: number | string, payload: AddMaterialPayload): Promise<void> {
  await axios.post(`/api/ProductionAccountantControllers/add-material-info/${productionOrderId}?outputId=${outputId}`, payload);
}

/**
 * Fetch all products (catalog)
 */
export async function fetchAllProducts(): Promise<ProductItem[]> {
  const response = await axios.get('/api/Product');
  return response.data;
}