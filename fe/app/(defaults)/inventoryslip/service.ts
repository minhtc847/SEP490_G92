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
    productType?: string; // "NVL", "Bán thành phẩm", "Kính dư"
    searchTerm?: string;
    pageNumber: number;
    pageSize: number;
    sortBy?: string; 
    sortDescending: boolean;
}

const API_ROOT = (process.env.NEXT_PUBLIC_API_BASE || 'https://localhost:7075/api').replace(/\/$/, '');
const API_BASE = `${API_ROOT}/InventorySlip`;

const authHeaders = () => {
    if (typeof window === 'undefined') return {} as Record<string, string>;
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchAllInventorySlips = async (): Promise<InventorySlipListItem[]> => {
    try {
        const response = await fetch(`${API_BASE}/all`, { headers: { ...authHeaders() } });
        if (!response.ok) {
            throw new Error('Failed to fetch inventory slips');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching inventory slips:', error);
        return [];
    }
};

export const fetchInventorySlipById = async (id: number): Promise<InventorySlip | null> => {
    try {
        const response = await fetch(`${API_BASE}/${id}`, { headers: { ...authHeaders() } });
        if (!response.ok) {
            throw new Error('Failed to fetch inventory slip');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching inventory slip:', error);
        return null;
    }
};

export const fetchInventorySlipsByProductionOrder = async (productionOrderId: number): Promise<InventorySlip[]> => {
    try {
        const response = await fetch(`${API_BASE}/production-order/${productionOrderId}`, { headers: { ...authHeaders() } });
        if (!response.ok) {
            throw new Error('Failed to fetch inventory slips by production order');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching inventory slips by production order:', error);
        return [];
    }
};

export const createInventorySlip = async (dto: CreateInventorySlipDto): Promise<InventorySlip | null> => {
    try {
        const response = await fetch(`${API_BASE}/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...authHeaders(),
            },
            body: JSON.stringify(dto),
        });
        if (!response.ok) {
            throw new Error('Failed to create inventory slip');
        }
        const json = await response.json();
        return json?.data ?? json;
    } catch (error) {
        console.error('Error creating inventory slip:', error);
        return null;
    }
};

export const createMaterialExportSlip = async (dto: CreateInventorySlipDto): Promise<InventorySlip | null> => {
    try {
        const response = await fetch(`${API_BASE}/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...authHeaders(),
            },
            body: JSON.stringify(dto),
        });
        if (!response.ok) {
            throw new Error('Failed to create material export slip');
        }
        const json = await response.json();
        return json?.data ?? json;
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
        
        console.log('createCutGlassSlip request body:', requestBody);
        console.log('createCutGlassSlip JSON stringified:', JSON.stringify(requestBody));
        
        const response = await fetch(`${API_BASE}/cut-glass`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...authHeaders(),
            },
            body: JSON.stringify(requestBody),
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('createCutGlassSlip error response:', errorText);
            throw new Error('Failed to create cut glass slip');
        }
        const json = await response.json();
        console.log('createCutGlassSlip response:', json);
        console.log('createCutGlassSlip response.data:', json?.data);
        
        const result = json?.data ?? json;
        
        // Sau khi tạo phiếu thành công, cập nhật ProductionOutput và kiểm tra hoàn thành
        if (result && mappingInfo?.productClassifications) {
            try {
                await processCutGlassSlipCompletion(
                    dto.productionOrderId,
                    mappingInfo.productClassifications,
                    dto.details
                );
            } catch (updateError) {
                console.error('Error updating production outputs or checking completion:', updateError);
                // Không throw error vì phiếu đã được tạo thành công
            }
        }
        
        return result;
    } catch (error) {
        console.error('Error creating cut glass slip:', error);
        return null;
    }
};

export const addMappings = async (slipId: number, mappings: CreateMaterialOutputMappingDto[]): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE}/${slipId}/mappings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...authHeaders(),
            },
            body: JSON.stringify(mappings),
        });
        return response.ok;
    } catch (error) {
        console.error('Error adding mappings:', error);
        return false;
    }
};

export const updateProductionOutputFinished = async (productionOutputId: number, finishedQuantity: number): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE}/production-output/${productionOutputId}/finished`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...authHeaders(),
            },
            body: JSON.stringify({ finishedQuantity }),
        });
        return response.ok;
    } catch (error) {
        console.error('Error updating production output finished:', error);
        return false;
    }
};

// Kiểm tra và cập nhật trạng thái lệnh sản xuất
export const checkAndUpdateProductionOrderStatus = async (productionOrderId: number): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE}/production-order/${productionOrderId}/check-completion`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...authHeaders(),
            },
        });
        return response.ok;
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
        // Cập nhật số lượng hoàn thành cho từng bán thành phẩm
        const updatePromises = productClassifications
            .filter(classification => 
                classification.productType === 'Bán thành phẩm'
            )
            .map(async (classification) => {
                if (typeof classification.productionOutputId !== 'number') {
                    return false;
                }
                const detail = details.find(d => d.productId === classification.productId);
                if (detail) {
                    return updateProductionOutputFinished(classification.productionOutputId, detail.quantity);
                }
                return false;
            });

        // Chờ tất cả cập nhật hoàn thành
        await Promise.all(updatePromises);
        
        // Kiểm tra và cập nhật trạng thái lệnh sản xuất
        await checkAndUpdateProductionOrderStatus(productionOrderId);
        
        console.log('Successfully processed cut glass slip completion');
    } catch (error) {
        console.error('Error processing cut glass slip completion:', error);
        throw error;
    }
};

export const deleteInventorySlip = async (id: number): Promise<boolean> => {
    try {
        console.log(`deleteInventorySlip: Attempting to delete slip with ID ${id}`);
        console.log(`deleteInventorySlip: API endpoint: ${API_BASE}/${id}`);
        
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE',
            headers: { ...authHeaders() },
        });
        
        console.log(`deleteInventorySlip: Response status: ${response.status}`);
        console.log(`deleteInventorySlip: Response ok: ${response.ok}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log(`deleteInventorySlip: Error response: ${errorText}`);
        }
        
        return response.ok;
    } catch (error) {
        console.error('Error deleting inventory slip:', error);
        return false;
    }
};

export const fetchProductionOrderInfo = async (productionOrderId: number): Promise<ProductionOrderInfo | null> => {
    try {
        const response = await fetch(`${API_BASE}/production-order/${productionOrderId}/info`, { headers: { ...authHeaders() } });
        if (!response.ok) {
            throw new Error('Failed to fetch production order info');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching production order info:', error);
        return null;
    }
};

// Lấy thông tin ProductionOutput để kiểm tra tiến độ
export const fetchProductionOutputs = async (productionOrderId: number): Promise<ProductionOutput[]> => {
    try {
        const response = await fetch(`${API_BASE}/production-order/${productionOrderId}/outputs`, { headers: { ...authHeaders() } });
        if (!response.ok) {
            throw new Error('Failed to fetch production outputs');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching production outputs:', error);
        return [];
    }
};

export const fetchOutputsFromInputMaterial = async (inputDetailId: number): Promise<InventorySlipDetail[]> => {
    try {
        const response = await fetch(`${API_BASE}/input-material/${inputDetailId}/outputs`, { headers: { ...authHeaders() } });
        if (!response.ok) {
            throw new Error('Failed to fetch outputs from input material');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching outputs from input material:', error);
        return [];
    }
};

export const fetchInputMaterialsForOutput = async (outputDetailId: number): Promise<InventorySlipDetail[]> => {
    try {
        const response = await fetch(`${API_BASE}/output-product/${outputDetailId}/inputs`, { headers: { ...authHeaders() } });
        if (!response.ok) {
            throw new Error('Failed to fetch input materials for output');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching input materials for output:', error);
        return [];
    }
};

export const createInventoryProduct = async (dto: CreateInventoryProductDto): Promise<ProductInfo | null> => {
    try {
        const response = await fetch(`${API_BASE}/create-product`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...authHeaders(),
            },
            body: JSON.stringify(dto),
        });
        if (!response.ok) {
            throw new Error('Failed to create inventory product');
        }
        const json = await response.json();
        return json?.data ?? json;
    } catch (error) {
        console.error('Error creating inventory product:', error);
        return null;
    }
};

export const updateInventorySlip = async (id: number, dto: CreateInventorySlipDto): Promise<InventorySlip | null> => {
    try {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...authHeaders(),
            },
            body: JSON.stringify(dto),
        });
        if (!response.ok) {
            throw new Error('Failed to update inventory slip');
        }
        const json = await response.json();
        return json?.data ?? json;
    } catch (error) {
        console.error('Error updating inventory slip:', error);
        return null;
    }
};

export const searchProducts = async (request: ProductSearchRequestDto): Promise<PaginatedProductsDto | null> => {
    try {
        const response = await fetch(`${API_BASE}/products/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...authHeaders(),
            },
            body: JSON.stringify(request),
        });
        if (!response.ok) {
            throw new Error('Failed to search products');
        }
        return await response.json();
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
        const response = await fetch(`${API_BASE}/materials/production-output/${productionOutputId}`, { 
            headers: { ...authHeaders() } 
        });
        if (!response.ok) {
            throw new Error('Failed to fetch materials by production output');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching materials by production output:', error);
        return [];
    }
};
