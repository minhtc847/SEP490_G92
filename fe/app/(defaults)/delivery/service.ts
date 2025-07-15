import axios from "@/setup/axios";

export interface DeliveryProduct {
  id: number;
  productName: string;
  quantity: number;
  done: number; // số lượng đã xong
  totalAmount: number;
  delivered: number;
  lastDeliveryDate: string;
  note?: string;
}

export interface DeliveryOrder {
  id: number;
  orderDate: string;
  customerName: string;
  note?: string;
  products: DeliveryProduct[];
}

export interface DeliveryHistoryItem {
  id: number;
  deliveryDate: string;
  quantity: number;
  note?: string;
}

// Lấy danh sách đơn hàng và sản phẩm cần giao theo production plan id
export async function fetchDeliveryOrdersByProductionPlanId(productionPlanId: number): Promise<DeliveryOrder[]> {
  // TODO: Đổi endpoint cho đúng backend
  const res = await axios.get(`/api/DeliveryHistory/by-production-plan/${productionPlanId}`);
  return res.data;
}

// Lấy lịch sử giao hàng của 1 sản phẩm (theo productionPlanDetailId)
export async function fetchDeliveryHistoryByProduct(productionPlanDetailId: number): Promise<DeliveryHistoryItem[]> {
  // TODO: Đổi endpoint cho đúng backend
  const res = await axios.get(`/api/DeliveryHistory/history/${productionPlanDetailId}`);
  return res.data;
}

// Tạo mới lịch sử giao hàng cho 1 sản phẩm
export async function createDeliveryHistory(
  productionPlanDetailId: number,
  data: { deliveryDate: string; quantity: number; note?: string }
): Promise<DeliveryHistoryItem> {
  // TODO: Đổi endpoint cho đúng backend
    const res = await axios.post(`/api/DeliveryHistory/history/${productionPlanDetailId}`, data);
  return res.data;
} 