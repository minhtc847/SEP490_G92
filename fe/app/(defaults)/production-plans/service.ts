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