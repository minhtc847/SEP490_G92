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

export const deletePurchaseOrder = async (id: number): Promise<void> => {
    try {
        await axios.delete(`/api/PurchaseOrder/${id}`);
    } catch (error) {
        console.error("Lỗi khi xoá đơn hàng mua:", error);
        throw error;
    }
};

export const updatePurchaseOrderStatus = async (orderId: number, status: number): Promise<void> => {
    try {
        await axios.put(`/api/PurchaseOrder/${orderId}/status`, { status });
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái đơn hàng mua:", error);
        throw error;
    }
};

