// Types for Inventory Slip
export interface InventorySlipListItem {
    id: number;
    slipCode: string;
    slipDate: string;
    transactionType: string;
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
    slipDate: string;
    transactionType: string;
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
    transactionType: string;
    description?: string;
    details: CreateInventorySlipDetailDto[];
    mappings?: CreateMaterialOutputMappingDto[];
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

// API calls
// Prefer absolute backend base to avoid Next.js API route conflicts
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

export const createCutGlassSlip = async (dto: CreateInventorySlipDto): Promise<InventorySlip | null> => {
    try {
        const response = await fetch(`${API_BASE}/cut-glass`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...authHeaders(),
            },
            body: JSON.stringify(dto),
        });
        if (!response.ok) {
            throw new Error('Failed to create cut glass slip');
        }
        const json = await response.json();
        return json?.data ?? json;
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
