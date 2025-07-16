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
  return response.data;
}
