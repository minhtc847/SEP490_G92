
import axios from "@/setup/axios";
// Types for Inventory Slip
export interface InventorySlipListItem {
    id: number;
    slipCode: string;
    description?: string;
    productionOrderId: number;
    productionOrderCode?: string;
    productionOrderType?: string;
    createdBy: number;
    createdByEmployeeName?: string;
    createdAt: string;
    updatedAt: string;
}

export interface InventorySlipDetail {
    id: number;
    productId: number;
    productCode?: string;
    productName?: string;
    productType?: string;
    uom?: string;
    quantity: number;
    note?: string;
    sortOrder: number;
    productionOutputId?: number;
    targetProductName?: string;
    targetProductCode?: string;
    outputMappings?: MaterialOutputMappingDto[];
}

export interface MaterialOutputMappingDto {
    id: number;
    outputDetailId: number;
    outputProductName?: string;
    outputProductCode?: string;
    note?: string;
}

export interface InventorySlip {
    id: number;
    slipCode: string;
    description?: string;
    productionOrderId: number;
    productionOrderCode?: string;
    productionOrderType?: string;
    createdBy: number;
    createdByEmployeeName?: string;
    createdAt: string;
    updatedAt: string;
    details: InventorySlipDetail[];
}

export interface CreateInventorySlipDto {
    productionOrderId: number;
    description?: string;
    details: CreateInventorySlipDetailDto[];
    mappings: CreateMaterialOutputMappingDto[];
    
    // Thêm trường để lưu số lượng sản phẩm mục tiêu cho phiếu xuất vật liệu
    productionOutputTargets?: ProductionOutputTargetDto[];
}

export interface ProductionOutputTargetDto {
    productionOutputId: number;
    targetQuantity: number;
}

export interface CreateInventorySlipDetailDto {
    productId: number;
    quantity: number;
    note?: string;
    sortOrder: number;
    productionOutputId?: number;
}

export interface CreateMaterialOutputMappingDto {
    inputDetailId: number;
    outputDetailId: number;
    note?: string;
}

export interface ProductionOrderInfo {
    id: number;
    productionOrderCode: string;
    type: string;
    description?: string;
    productionOutputs: ProductionOutput[];
    availableProducts: ProductInfo[];
    
    // Separate lists for cut glass slips
    rawMaterials: ProductInfo[];
    semiFinishedProducts: ProductInfo[];
    glassProducts: ProductInfo[];
}

export interface ProductionOutput {
    id: number;
    productId: number;
    productName: string;
    uom?: string;
    amount: number;
    finished: number;
    defected: number;
}

export interface ProductInfo {
    id: number;
    productCode: string;
    productName: string;
    productType: string;
    uom?: string;
    height?: string;
    width?: string;
    thickness?: number;
    weight?: number;
    quantity?: number;
    unitPrice?: number;
}

export interface CreateInventoryProductDto {
    productCode: string;
    productName: string;
    productType: string;
    uom?: string;
    height?: string;
    width?: string;
    thickness?: number;
    weight?: number;
    unitPrice?: number;
}

// New interfaces for pagination
export interface PaginatedProductsDto {
    products: ProductInfo[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export interface ProductSearchRequestDto {
    productionOrderId: number;
    productType?: string; // "NVL", "Bán thành phẩm", "Kính dư"
    searchTerm?: string;
    pageNumber: number;
    pageSize: number;
    sortBy?: string; // "ProductName", "ProductCode", "Id"
    sortDescending: boolean;
}

// API calls using axios
export const fetchAllInventorySlips = async (): Promise<InventorySlipListItem[]> => {
    try {
        const response = await axios.get('/api/InventorySlip/all');
        return response.data;
    } catch (error) {
        console.error('Error fetching inventory slips:', error);
        return [];
    }
};

export const fetchInventorySlipById = async (id: number): Promise<InventorySlip | null> => {
    try {
        const response = await axios.get(`/api/InventorySlip/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching inventory slip:', error);
        return null;
    }
};

export const fetchInventorySlipsByProductionOrder = async (productionOrderId: number): Promise<InventorySlip[]> => {
    try {
        const response = await axios.get(`/api/InventorySlip/production-order/${productionOrderId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching inventory slips by production order:', error);
        return [];
    }
};

export const createInventorySlip = async (dto: CreateInventorySlipDto): Promise<InventorySlip | null> => {
    try {
        const response = await axios.post('/api/InventorySlip/create', dto);
        return response.data?.data ?? response.data;
    } catch (error) {
        console.error('Error creating inventory slip:', error);
        return null;
    }
};

export const createMaterialExportSlip = async (dto: CreateInventorySlipDto): Promise<InventorySlip | null> => {
    try {
        // Determine which endpoint to use based on production order type
        // This will be handled by the backend based on the production order type
        const response = await axios.post('/api/InventorySlip/create', dto);
        return response.data?.data ?? response.data;
    } catch (error) {
        console.error('Error creating material export slip:', error);
        return null;
    }
};

export const createCutGlassSlip = async (dto: CreateInventorySlipDto, mappingInfo?: any): Promise<InventorySlip | null> => {
    try {
        // Prepare request body with both dto and mappingInfo
        const requestBody = mappingInfo ? { formData: dto, mappingInfo } : dto;
        
        const response = await axios.post('/api/InventorySlip/cut-glass', requestBody);
        console.log('createCutGlassSlip response:', response.data);
        console.log('createCutGlassSlip response.data:', response.data?.data);
        return response.data?.data ?? response.data;
    } catch (error) {
        console.error('Error creating cut glass slip:', error);
        return null;
    }
};

export const addMappings = async (slipId: number, mappings: CreateMaterialOutputMappingDto[]): Promise<boolean> => {
    try {
        await axios.post(`/api/InventorySlip/${slipId}/mappings`, mappings);
        return true;
    } catch (error) {
        console.error('Error adding mappings:', error);
        return false;
    }
};

export const deleteInventorySlip = async (id: number): Promise<boolean> => {
    try {
        console.log(`deleteInventorySlip: Attempting to delete slip with ID ${id}`);
        console.log(`deleteInventorySlip: API endpoint: /api/InventorySlip/${id}`);
        
        const response = await axios.delete(`/api/InventorySlip/${id}`);
        
        console.log(`deleteInventorySlip: Response status: ${response.status}`);
        console.log(`deleteInventorySlip: Response ok: ${response.status >= 200 && response.status < 300}`);
        
        return response.status >= 200 && response.status < 300;
    } catch (error) {
        console.error('Error deleting inventory slip:', error);
        return false;
    }
};

export const fetchProductionOrderInfo = async (productionOrderId: number): Promise<ProductionOrderInfo | null> => {
    try {
        const response = await axios.get(`/api/InventorySlip/production-order/${productionOrderId}/info`);
        return response.data;
    } catch (error) {
        console.error('Error fetching production order info:', error);
        return null;
    }
};

export const fetchOutputsFromInputMaterial = async (inputDetailId: number): Promise<InventorySlipDetail[]> => {
    try {
        const response = await axios.get(`/api/InventorySlip/input-material/${inputDetailId}/outputs`);
        return response.data;
    } catch (error) {
        console.error('Error fetching outputs from input material:', error);
        return [];
    }
};

export const fetchInputMaterialsForOutput = async (outputDetailId: number): Promise<InventorySlipDetail[]> => {
    try {
        const response = await axios.get(`/api/InventorySlip/output-product/${outputDetailId}/inputs`);
        return response.data;
    } catch (error) {
        console.error('Error fetching input materials for output:', error);
        return [];
    }
};

export const createInventoryProduct = async (dto: CreateInventoryProductDto): Promise<ProductInfo | null> => {
    try {
        const response = await axios.post('/api/InventorySlip/create-product', dto);
        return response.data?.data ?? response.data;
    } catch (error) {
        console.error('Error creating inventory product:', error);
        return null;
    }
};

export const updateInventorySlip = async (id: number, dto: CreateInventorySlipDto): Promise<InventorySlip | null> => {
    try {
        const response = await axios.put(`/api/InventorySlip/${id}`, dto);
        return response.data?.data ?? response.data;
    } catch (error) {
        console.error('Error updating inventory slip:', error);
        return null;
    }
};

// Paginated product search for cut glass slips
export const searchProducts = async (request: ProductSearchRequestDto): Promise<PaginatedProductsDto | null> => {
    try {
        const response = await axios.post('/api/InventorySlip/products/search', request);
        return response.data;
    } catch (error) {
        console.error('Error searching products:', error);
        return null;
    }
};

// Production Material interface and functions
export interface ProductionMaterial {
    id: number;
    productId: number;
    productName: string;
    productCode: string;
    uom: string;
    amount: number;
    productionOutputId: number;
}

export const fetchMaterialsByProductionOutput = async (productionOutputId: number): Promise<ProductionMaterial[]> => {
    try {
        const response = await axios.get(`/api/InventorySlip/materials/production-output/${productionOutputId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching materials by production output:', error);
        return [];
    }
};
