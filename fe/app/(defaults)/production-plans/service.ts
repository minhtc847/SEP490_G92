import axios from "@/setup/axios";

/**
 * Fetch danh sách production plan từ backend
 * @returns Promise<ProductionPlan[]>
 */
export async function fetchProductionPlanList() {
  const response = await axios.get("/api/ProductionPlan/list");
  return response.data;
}

/**
 * Fetch chi tiết production plan từ backend
 * @param id id của production plan
 * @returns Promise<ProductionPlanDetail>
 */
export async function fetchProductionPlanDetail(id: number | string) {
  const response = await axios.get(`/api/ProductionPlan/detail/${id}`);
  return response.data;
}

/**
 * Fetch danh sách sản phẩm trong production plan từ backend
 * @param id id của production plan
 * @returns Promise<ProductionPlanProductDetail[]>
 */
export async function fetchProductionPlanProductDetails(id: number | string) {
  const response = await axios.get(`/api/ProductionPlan/detail/${id}/products`);
  return response.data;
}

/**
 * Kiểu dữ liệu cho production plan
 */
export interface ProductionPlan {
  id: number;
  planDate: string;
  orderCode: string;
  customerName: string;
  quantity: number;
  status: string;
}

export interface ProductionPlanDetail {
  customerName: string;
  address?: string;
  phone?: string;
  orderCode: string;
  orderDate: string;
  deliveryStatus?: string;
  planDate: string;
  status?: string;
  quantity?: number;
  done: number;
}

export interface ProductionPlanProductDetail {
  id: number;
  productName: string;
  totalQuantity: number;
  inProduction: number;
  completed: number;
  daCatKinh: number;
  daTronKeo: number;
  daGiao: number;
}

export interface ProductionOrderListItem {
  id: number;
  orderDate: string;
  type: string;
  description: string;
  isMaterialExported: boolean;
  isProductImported: boolean;
  
}

export async function fetchProductionOrdersByPlanId(id: number | string): Promise<ProductionOrderListItem[]> {
  const response = await axios.get(`/api/ProductionPlan/detail/${id}/production-orders`);
  return response.data.map((item: any) => ({
    id: item.productionOrderId,
    orderDate: item.orderDate,
    type: item.type,
    description: item.description,
    isMaterialExported: item.statusDaXuatKhoNVL,
    isProductImported: item.statusDaNhapKhoTP,
    
  }));
}