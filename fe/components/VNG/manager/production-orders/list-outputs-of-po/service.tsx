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

export interface ProductionDefect {
  id: number;
  productionOrderId?: number;
  productId?: number;
  productName?: string;
  quantity?: number;
  defectType?: string;
  defectStage?: string;
  note?: string;
  reportedAt?: string;
}

export interface CreateDefectReport {
  productionOrderId: number;
  productId: number;
  quantity: number;
  defectType: string;
  defectStage?: string;
  note?: string;
}

export interface UpdateDefectReport {
  quantity: number;
  defectType: string;
  defectStage?: string;
  note?: string;
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

export async function fetchProductionDefectsByOrderId(productionOrderId: number): Promise<ProductionDefect[]> {
  const response = await axios.get(`/api/ProductionOrders/${productionOrderId}/defects`);
  return response.data;
}

export async function createDefectReport(defectData: CreateDefectReport): Promise<void> {
  await axios.post(`/api/ProductionOrders/defects`, defectData);
}

export async function updateDefectReport(defectId: number, defectData: UpdateDefectReport): Promise<void> {
  await axios.put(`/api/ProductionOrders/defects/${defectId}`, defectData);
}

export async function reportBrokenOutput(outputId: number, broken: number, reasonBroken: string): Promise<void> {
  await axios.put(`/api/ProductionOrders/outputs/${outputId}/report-broken`, {
    broken,
    reasonBroken,
  });
}
