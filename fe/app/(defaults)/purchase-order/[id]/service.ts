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
    purchaseOrderDetails: PurchaseOrderDetailDto[];
}

export const getPurchaseOrderById = async (id: number): Promise<PurchaseOrderWithDetailsDto> => {
    const res = await axios.get(`/api/PurchaseOrder/${id}`);
    return res.data;
};
