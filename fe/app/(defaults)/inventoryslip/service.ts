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
    isFinalized?: boolean;
    isUpdateMisa?: boolean;
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
    isFinalized?: boolean;
    isUpdateMisa?: boolean;
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
    status?: number; // 0: Pending, 1: InProgress, 2: Completed, 3: Cancelled
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

// removed unused: createInventorySlip

export const createMaterialExportSlip = async (dto: CreateInventorySlipDto): Promise<InventorySlip | null> => {
    try {
        let endpoint = "/api/InventorySlip/create";
        
        if (dto.productionOutputTargets && dto.productionOutputTargets.length > 0) {
            endpoint = "/api/InventorySlip/chemical-export";
        }       
       
        const response = await axios.post<any>(endpoint, dto);

        
        let slipData: any = null;
        
        if (response.data && response.data.data) {
            slipData = response.data.data;
        } else if (response.data) {
            slipData = response.data;
        }
        
        if (slipData) {
            // Ensure the slip data has required fields
            const transformedSlip: InventorySlip = {
                id: slipData.id || 0,
                slipCode: slipData.slipCode || `SLIP-${Date.now()}`,
                description: slipData.description || '',
                productionOrderId: slipData.productionOrderId || dto.productionOrderId,
                productionOrderCode: slipData.productionOrderCode || '',
                productionOrderType: slipData.productionOrderType || '',
                createdBy: slipData.createdBy || 0,
                createdByEmployeeName: slipData.createdByEmployeeName || '',
                createdAt: slipData.createdAt || new Date().toISOString(),
                updatedAt: slipData.updatedAt || new Date().toISOString(),
                details: slipData.details || dto.details.map((detail, index) => ({
                    id: index,
                    productId: detail.productId,
                    productCode: '',
                    productName: '',
                    productType: '',
                    uom: '',
                    quantity: detail.quantity,
                    note: detail.note,
                    sortOrder: detail.sortOrder,
                    productionOutputId: detail.productionOutputId
                }))
            };
            
            return transformedSlip;
        }
        
        console.log('No valid data found, returning null');
        return null;
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

export const finalizeInventorySlip = async (slipId: number): Promise<boolean> => {
    try {
        const response = await axios.put(`/api/InventorySlip/${slipId}/finalize`);
        return response.status === 200;
    } catch (error) {
        console.error('Error finalizing inventory slip:', error);
        throw error;
    }
};

// removed unused: updateProductionOutputFinished

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

export const createInventoryProduct = async (dto: CreateInventoryProductDto): Promise<ProductInfo | null> => {
    try {
        const response = await axios.post<ProductInfo>("/api/InventorySlip/create-product", dto);
        return response.data;
    } catch (error) {
        console.error('Error creating inventory product:', error);
        return null;
    }
};

export const updateInventorySlip = async (id: number, dto: CreateInventorySlipDto, mappingInfo?: any): Promise<InventorySlip | null> => {
    try {
        const requestBody = mappingInfo ? { ...dto, ...mappingInfo } : dto;
        const response = await axios.put<any>(`/api/InventorySlip/${id}`, requestBody);
        return (response.data && response.data.data) ? response.data.data : response.data;
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

export const callImportExportInvoice = async (slipId: number): Promise<boolean> => {
    try {
        const response = await axios.post(`/api/Selenium/import-export-invoice`, slipId);
        return response.status === 200;
    } catch (error) {
        console.error('Error calling import-export-invoice API:', error);
        return false;
    }
};

export const checkSlipProductsMisaStatus = async (slipId: number): Promise<any> => {
    try {
        const response = await axios.get(`/api/InventorySlip/${slipId}/check-products-misa`);
        return response.data;
    } catch (error) {
        console.error('Error checking slip products MISA status:', error);
        return { success: false, message: 'Không thể kiểm tra trạng thái MISA của sản phẩm' };
    }
};

export const updateMisaStatus = async (slipId: number): Promise<boolean> => {
    try {
        const response = await axios.put(`/api/InventorySlip/${slipId}/update-misa-status`);
        return response.status === 200;
    } catch (error) {
        console.error('Error updating Misa status:', error);
        return false;
    }
};
