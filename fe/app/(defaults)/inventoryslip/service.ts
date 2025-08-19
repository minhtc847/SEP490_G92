import axios from "@/setup/axios";

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
    productId?: number; 
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
    productionOutputTargets?: ProductionOutputTargetDto[];
}

export interface ProductionOutputTargetDto {
    productionOutputId: number;
    targetQuantity: number;
}

export interface CreateInventorySlipDetailDto {
    productId?: number; 
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

export interface ProductClassification {
    index: number;
    productId: number;
    productType: 'NVL' | 'Bán thành phẩm' | 'Kính dư';
    productionOutputId?: number;
}

export interface ProductionOrderInfo {
    id: number;
    productionOrderCode: string;
    type: string;
    description?: string;
    productionOutputs: ProductionOutput[];
    availableProducts: ProductInfo[];    
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
    productType?: string;
    searchTerm?: string;
    pageNumber: number;
    pageSize: number;
    sortBy?: string; 
    sortDescending: boolean;
}

export const fetchAllInventorySlips = async (): Promise<InventorySlipListItem[]> => {
    try {
        const response = await axios.get<InventorySlipListItem[]>("/api/InventorySlip/all");
        return response.data;
    } catch (error) {
        console.error('Error fetching inventory slips:', error);
        return [];
    }
};

export const fetchInventorySlipById = async (id: number): Promise<InventorySlip | null> => {
    try {
        const response = await axios.get<InventorySlip>(`/api/InventorySlip/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching inventory slip:', error);
        return null;
    }
};

export const fetchInventorySlipsByProductionOrder = async (productionOrderId: number): Promise<InventorySlip[]> => {
    try {
        const response = await axios.get<InventorySlip[]>(`/api/InventorySlip/production-order/${productionOrderId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching inventory slips by production order:', error);
        return [];
    }
};

export const createInventorySlip = async (dto: CreateInventorySlipDto): Promise<InventorySlip | null> => {
    try {
        const response = await axios.post<InventorySlip>("/api/InventorySlip/create", dto);
        return response.data;
    } catch (error) {
        console.error('Error creating inventory slip:', error);
        return null;
    }
};

export const createMaterialExportSlip = async (dto: CreateInventorySlipDto): Promise<InventorySlip | null> => {
    try {
        const response = await axios.post<InventorySlip>("/api/InventorySlip/create", dto);
        return response.data;
    } catch (error) {
        console.error('Error creating material export slip:', error);
        return null;
    }
};

export const createCutGlassSlip = async (dto: CreateInventorySlipDto, mappingInfo?: any): Promise<InventorySlip | null> => {
    try {
        // Prepare request body - flatten the structure so productionOrderId is at root level
        const requestBody = mappingInfo ? { 
            ...dto,  // This spreads all dto properties to root level
            ...mappingInfo  // This spreads all mappingInfo properties to root level
        } : dto;     
        const response = await axios.post<any>("/api/InventorySlip/cut-glass", requestBody);
        const result = response.data;
        
        const slipData = result?.data ?? result;
        
        if (slipData && mappingInfo?.productClassifications) {
            try {
                await processCutGlassSlipCompletion(
                    dto.productionOrderId,
                    mappingInfo.productClassifications,
                    dto.details
                );
            } catch (updateError) {
                console.error('Error updating production outputs or checking completion:', updateError);
            }
        }
        
        return slipData;
    } catch (error) {
        console.error('Error creating cut glass slip:', error);
        return null;
    }
};

export const addMappings = async (slipId: number, mappings: CreateMaterialOutputMappingDto[]): Promise<boolean> => {
    try {
        const response = await axios.post(`/api/InventorySlip/${slipId}/mappings`, mappings);
        return response.status === 200;
    } catch (error) {
        console.error('Error adding mappings:', error);
        return false;
    }
};

export const updateProductionOutputFinished = async (productionOutputId: number, finishedQuantity: number): Promise<boolean> => {
    try {
        // Endpoint này không tồn tại, có thể cần tạo hoặc sử dụng endpoint khác
        // Tạm thời return true để không block quá trình
        console.warn(`updateProductionOutputFinished: Endpoint /api/InventorySlip/production-output/${productionOutputId}/finished không tồn tại`);
        return true;
    } catch (error) {
        console.error('Error updating production output finished:', error);
        return false;
    }
};

// Kiểm tra và cập nhật trạng thái lệnh sản xuất
export const checkAndUpdateProductionOrderStatus = async (productionOrderId: number): Promise<boolean> => {
    try {
        const response = await axios.put(`/api/ProductionOrder/${productionOrderId}/check-completion`);
        return response.status === 200;
    } catch (error) {
        console.error('Error checking and updating production order status:', error);
        return false;
    }
};

// Helper function để cập nhật ProductionOutput và kiểm tra hoàn thành
export const processCutGlassSlipCompletion = async (
    productionOrderId: number, 
    productClassifications: ProductClassification[], 
    details: CreateInventorySlipDetailDto[]
): Promise<void> => {
    try {
        // Backend đã tự động cập nhật ProductionOutput.finished khi tạo phiếu cắt kính
        // Chỉ cần kiểm tra và cập nhật trạng thái lệnh sản xuất
        await checkAndUpdateProductionOrderStatus(productionOrderId);
        

    } catch (error) {
        console.error('Error processing cut glass slip completion:', error);
        throw error;
    }
};

export const deleteInventorySlip = async (id: number): Promise<boolean> => {
    try {
        console.log(`deleteInventorySlip: Attempting to delete slip with ID ${id}`);
        console.log(`deleteInventorySlip: API endpoint: /api/InventorySlip/${id}`);
        
        const response = await axios.delete(`/api/InventorySlip/${id}`);
        
        console.log(`deleteInventorySlip: Response status: ${response.status}`);
        console.log(`deleteInventorySlip: Response ok: ${response.status === 200}`);
        
        return response.status === 200;
    } catch (error) {
        console.error('Error deleting inventory slip:', error);
        return false;
    }
};

export const fetchProductionOrderInfo = async (productionOrderId: number): Promise<ProductionOrderInfo | null> => {
    try {
        const response = await axios.get<ProductionOrderInfo>(`/api/InventorySlip/production-order/${productionOrderId}/info`);
        return response.data;
    } catch (error) {
        console.error('Error fetching production order info:', error);
        return null;
    }
};

// Lấy thông tin ProductionOutput để kiểm tra tiến độ
export const fetchProductionOutputs = async (productionOrderId: number): Promise<ProductionOutput[]> => {
    try {
        const response = await axios.get<ProductionOutput[]>(`/api/InventorySlip/production-order/${productionOrderId}/outputs`);
        return response.data;
    } catch (error) {
        console.error('Error fetching production outputs:', error);
        return [];
    }
};

export const fetchOutputsFromInputMaterial = async (inputDetailId: number): Promise<InventorySlipDetail[]> => {
    try {
        const response = await axios.get<InventorySlipDetail[]>(`/api/InventorySlip/input-material/${inputDetailId}/outputs`);
        return response.data;
    } catch (error) {
        console.error('Error fetching outputs from input material:', error);
        return [];
    }
};

export const fetchInputMaterialsForOutput = async (outputDetailId: number): Promise<InventorySlipDetail[]> => {
    try {
        const response = await axios.get<InventorySlipDetail[]>(`/api/InventorySlip/output-product/${outputDetailId}/inputs`);
        return response.data;
    } catch (error) {
        console.error('Error fetching input materials for output:', error);
        return [];
    }
};

export const createInventoryProduct = async (dto: CreateInventoryProductDto): Promise<ProductInfo | null> => {
    try {
        const response = await axios.post<ProductInfo>("/api/InventorySlip/create-product", dto);
        return response.data;
    } catch (error) {
        console.error('Error creating inventory product:', error);
        return null;
    }
};

export const updateInventorySlip = async (id: number, dto: CreateInventorySlipDto): Promise<InventorySlip | null> => {
    try {
        const response = await axios.put<InventorySlip>(`/api/InventorySlip/${id}`, dto);
        return response.data;
    } catch (error) {
        console.error('Error updating inventory slip:', error);
        return null;
    }
};

export const searchProducts = async (request: ProductSearchRequestDto): Promise<PaginatedProductsDto | null> => {
    try {
        const response = await axios.post<PaginatedProductsDto>("/api/InventorySlip/products/search", request);
        return response.data;
    } catch (error) {
        console.error('Error searching products:', error);
        return null;
    }
};

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
        const response = await axios.get<ProductionMaterial[]>(`/api/InventorySlip/materials/production-output/${productionOutputId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching materials by production output:', error);
        return [];
    }
};
