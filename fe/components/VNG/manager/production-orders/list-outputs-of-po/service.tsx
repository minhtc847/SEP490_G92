import axios from '@/setup/axios';

export interface ProductionOutput {
  id: number;
  productId: number;
  productName: string;
  amount: number;
  done: number;
  note?: string;
  productionOrderId: number;
}

export async function fetchProductionOutputsByOrderId(productionOrderId: number): Promise<ProductionOutput[]> {
  const response = await axios.get(`/api/ProductionOrders/${productionOrderId}/outputs`);
  return response.data;
}
