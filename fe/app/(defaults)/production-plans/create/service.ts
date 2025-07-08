import axios from '@/setup/axios';

export interface ProductionPlanProductInput {
  productId: number;
  productName: string;
  quantity: number;
  thickness: number;
  glueLayers: number;
  glassLayers: number;
  glass4mm: number;
  glass5mm: number;
  butylType: number;
  isCuongLuc: boolean;
  width: number;
  height: number;
  adhesiveType?: string;
}

export interface CreateProductionPlanFromSaleOrderDTO {
  saleOrderId: number;
  products: ProductionPlanProductInput[];
}

export const createProductionPlanFromSaleOrder = async (data: CreateProductionPlanFromSaleOrderDTO) => {
  const response = await axios.post('/api/ProductionPlan/create-from-sale-order', data);
  return response.data;
};

export const getGlassStructureByProductId = async (productId: number) => {
  const response = await axios.get(`/api/GlassStructure/by-product/${productId}`);
  return response.data;
}; 