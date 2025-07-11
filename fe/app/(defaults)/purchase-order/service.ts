import axios from "@/setup/axios";

export interface PurchaseOrderDto {
    id: number;
    code: string;
    date: string | null;
    description: string | null;
    totalValue: number | null;
    status: string | null;
    supplierName: string | null;
    customerName: string | null;
    employeeName: string | null;
}

export const getPurchaseOrders = async (): Promise<PurchaseOrderDto[]> => {
    try {
        const response = await axios.get<PurchaseOrderDto[]>("/api/PurchaseOrder");
        return response.data;
    } catch (error) {
        console.error("Lỗi khi tải danh sách PurchaseOrder:", error);
        throw error;
    }
};
