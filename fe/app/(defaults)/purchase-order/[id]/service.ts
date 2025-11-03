import axios from '@/setup/axios';

export interface PurchaseOrderDetailDto {
    productId?: number;
    productCode?: string;
    productName?: string;
    productType?: string;
    uom?: string;
    height?: string;
    width?: string;
    thickness?: number;
    weight?: number;

    glassStructureId?: number;
    glassStructureName?: string;

    quantity?: number;
    unitPrice?: number;
    totalPrice?: number;
}

export interface PurchaseOrderWithDetailsDto {
    id: number;
    code?: string;
    date?: string;
    description?: string;
    totalValue?: number;
    status?: string;
    supplierName?: string;
    customerName?: string;
    employeeName?: string;
    isUpdateMisa?: boolean;
    purchaseOrderDetails: PurchaseOrderDetailDto[];
}

export const getPurchaseOrderById = async (id: number): Promise<PurchaseOrderWithDetailsDto> => {
    const res = await axios.get(`/api/PurchaseOrder/${id}`);
    return res.data;
};

export const updatePurchaseOrderStatus = async (id: number, status: number): Promise<void> => {
    await axios.put(`/api/PurchaseOrder/${id}/status`, { status });
};

export const importPurchaseOrder = async (orderId: number): Promise<void> => {
    try {
        await axios.post(`/api/PurchaseOrder/${orderId}/import`);
    } catch (error) {
        console.error("Lỗi khi nhập hàng:", error);
        throw error;
    }
};

export const updateMisaPurchaseOrder = async (orderId: number): Promise<void> => {
    try {
        await axios.put(`/api/PurchaseOrder/${orderId}/update-misa`);
    } catch (error) {
        console.error("Lỗi khi cập nhật MISA:", error);
        throw error;
    }
};

export const checkPurchaseOrderProductsMisaStatus = async (orderId: number): Promise<any> => {
    const res = await axios.get(`/api/PurchaseOrder/${orderId}/check-products-misa`);
    return res.data;
};