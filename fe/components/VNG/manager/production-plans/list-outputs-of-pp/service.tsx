import axios from '@/setup/axios';

export interface ProductionPlanOutput {
  outputId: number;
  productId: number;
  productName: string;
  totalAmount: number;
  done: number;
  broken: number;
  brokenDescription?: string;
}

export async function fetchProductionPlanOutputs(productionPlanId: number): Promise<ProductionPlanOutput[]> {
  const response = await axios.get(`/api/ProductionPlan/detail/${productionPlanId}/outputs`);
  // Ensure all numeric fields are numbers (in case backend returns null)
  return response.data.map((item: any) => ({
    ...item,
    totalAmount: Number(item.totalAmount) || 0,
    done: Number(item.done) || 0,
    broken: Number(item.broken) || 0,
  }));
}
