import axios from '@/setup/axios';

export interface ProductionOrderListItem {
  id: number;
  orderDate: string;
  type: string;
  description: string;
  productionStatus?: string;
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