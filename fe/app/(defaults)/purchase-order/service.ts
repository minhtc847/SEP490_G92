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
    isUpdateMisa: boolean | null;
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

export const getPurchaseOrdersNotUpdated = async (): Promise<PurchaseOrderDto[]> => {
    try {
        const response = await axios.get<PurchaseOrderDto[]>("/api/PurchaseOrder");
        return response.data.filter(order => !order.isUpdateMisa);
    } catch (error) {
        throw error;
    }
};

export const updateManyPurchaseOrders = async (orders: PurchaseOrderDto[]): Promise<void> => {
    try {
        // Lấy dữ liệu chi tiết cho từng đơn hàng
        const ordersWithDetails = await Promise.all(
            orders.map(async (order) => {
                const orderDetail = await axios.get(`/api/PurchaseOrder/${order.id}`);
                return orderDetail.data;
            })
        );
        
        // Chuyển đổi dữ liệu thành format InputPO
        const inputPOs = ordersWithDetails.map(order => ({
            supplierName: order.customerName || order.supplierName || "",
            date: order.date ? new Date(order.date).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
            ProductsInput: order.purchaseOrderDetails?.map((detail: any) => ({
                ProductCode: detail.productName || "",
                ProductQuantity: (detail.quantity || 0).toString(),
                Price: (detail.unitPrice || 0).toString()
            })) || []
        }));
        
        await axios.post('/api/selenium/purchasing-order/add-many', inputPOs);
    } catch (error) {
        throw error;
    }
};