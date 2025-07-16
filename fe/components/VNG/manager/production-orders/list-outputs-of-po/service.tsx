import axios from '@/setup/axios';

export interface ProductionOutput {
  id: number;
  productId: number;
  productName: string;
  amount: number;
  done: number;
  broken?: number;
  reasonBroken?: string;
  productionOrderId: number;
}

export async function fetchProductionOutputsByOrderId(productionOrderId: number): Promise<ProductionOutput[]> {
  const response = await axios.get(`/api/ProductionOrders/${productionOrderId}/outputs`);
  return response.data.map((item: any) => ({
    ...item,
    amount: Number(item.amount) || 0,
    done: Number(item.done) || 0,
    broken: Number(item.broken) || 0,
    reasonBroken: item.reasonBroken || '',
  }));
}

export async function reportBrokenOutput(outputId: number, broken: number, reasonBroken: string): Promise<void> {
  await axios.put(`/api/ProductionOrders/outputs/${outputId}/report-broken`, {
    broken,
    reasonBroken,
  });
}
