import axios from '@/setup/axios';

export interface ChemicalExportProduct {
  productId: number;
  productName: string;
  quantity: number;
  uom: string;
  materials: ChemicalExportMaterial[];
}

export interface ChemicalExportMaterial {
  productId: number;
  productName: string;
  quantity: number;
  uom: string;
}

export interface CreateChemicalExportRequest {
  productionOrderId: number;
  products: ChemicalExportProduct[];
  note?: string;
}

export interface ChemicalExportDto {
  id: number;
  productId?: number;
  productName?: string;
  quantity: number;
  uom?: string;
  note?: string;
  productionOrderId?: number;
  createdAt: string;
  details: ChemicalExportDetailDto[];
}

export interface ChemicalExportDetailDto {
  id: number;
  productId?: number;
  productName?: string;
  quantity: number;
  uom?: string;
  note?: string;
  chemicalExportId?: number;
}

export interface ProductionOrderProductsDto {
  productionOrderId: number;
  outputs: ProductionOutputDto[];
  materials: ProductionMaterialDto[];
}

export interface ProductionOutputDto {
  id: number;
  productId: number;
  productName?: string;
  uom?: string;
  amount?: number;
  finished?: number;
  defected?: number;
}

export interface ProductionMaterialDto {
  id: number;
  productId: number;
  productName?: string;
  uom?: string;
  amount?: number;
  productionOutputId: number;
}

export const chemicalExportService = {
  async createChemicalExport(data: CreateChemicalExportRequest): Promise<ChemicalExportDto> {
    const response = await axios.post('/api/ChemicalExport/create', data);
    return response.data.data;
  },

  async getChemicalExportById(id: number): Promise<ChemicalExportDto> {
    const response = await axios.get(`/api/ChemicalExport/${id}`);
    return response.data;
  },

  async getChemicalExportsByProductionOrder(productionOrderId: number): Promise<ChemicalExportDto[]> {
    const response = await axios.get(`/api/ChemicalExport/production-order/${productionOrderId}`);
    return response.data;
  },

  async getAllChemicalExports(): Promise<ChemicalExportDto[]> {
    const response = await axios.get('/api/ChemicalExport/all');
    return response.data;
  },

  async getProductionOrderProducts(productionOrderId: number): Promise<ProductionOrderProductsDto> {
    const response = await axios.get(`/api/ChemicalExport/production-order/${productionOrderId}/products`);
    return response.data;
  },

  async deleteChemicalExport(id: number): Promise<void> {
    await axios.delete(`/api/ChemicalExport/${id}`);
  }
}; 