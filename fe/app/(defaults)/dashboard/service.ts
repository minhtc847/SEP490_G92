import axios from '@/setup/axios';

// DTOs
export interface ProductionDashboardOverviewDTO {
    productionPlans: ProductionPlanOverviewDTO;
    productionOrders: ProductionOrderOverviewDTO;
    inventorySlips: InventorySlipOverviewDTO;
    materials: MaterialStatusDTO;
    alerts: ProductionAlertDTO[];
}

export interface ProductionPlanOverviewDTO {
    totalPlans: number;
    activePlans: number;
    completedPlans: number;
    pendingPlans: number;
    plansByStatus: PlanStatusSummaryDTO[];
    recentPlans: any[];
}

export interface ProductionOrderOverviewDTO {
    totalOrders: number;
    activeOrders: number;
    completedOrders: number;
    pausedOrders: number;
    ordersByStatus: OrderStatusSummaryDTO[];
    ordersByType: OrderTypeSummaryDTO[];
    efficiency: ProductionEfficiencyDTO;
}

export interface InventorySlipOverviewDTO {
    totalSlips: number;
    finalizedSlips: number;
    pendingSlips: number;
    misaUpdatedSlips: number;
    slipsByType: SlipTypeSummaryDTO[];
    recentSlips: any[];
}

export interface MaterialStatusDTO {
    totalMaterials: number;
    availableMaterials: number;
    lowStockMaterials: number;
    outOfStockMaterials: number;
    materialsByStatus: MaterialStatusSummaryDTO[];
}

export interface PlanStatusSummaryDTO {
    status: string;
    count: number;
    percentage: number;
    color: string;
}

export interface OrderStatusSummaryDTO {
    status: string;
    count: number;
    percentage: number;
    color: string;
}

export interface OrderTypeSummaryDTO {
    type: string;
    count: number;
    percentage: number;
}

export interface SlipTypeSummaryDTO {
    type: string;
    count: number;
    percentage: number;
    color: string;
}

export interface MaterialStatusSummaryDTO {
    status: string;
    count: number;
    percentage: number;
    color: string;
}

export interface ProductionEfficiencyDTO {
    averageCompletionTime: number;
    onTimeDeliveryRate: number;
    resourceUtilization: number;
}

export interface ProductionAlertDTO {
    id: number;
    type: 'warning' | 'error' | 'info';
    message: string;
    createdAt: string;
    isRead: boolean;
}

// Order Details DTOs
export interface OrderDetailDTO {
    id: number;
    orderCode: string;
    customerName: string;
    orderDate: string;
    totalValue: number;
    status: string;
    products: OrderProductDTO[];
}

export interface OrderProductDTO {
    id: number;
    productName: string;
    productCode: string;
    quantity: number;
    deliveredQuantity: number;
    remainingQuantity: number;
    unitPrice: number;
    totalPrice: number;
    deliveryStatus: string;
}


// Service functions
export const productionDashboardService = {
    // Tổng quan
        getProductionOverview: async (fromDate?: string, toDate?: string): Promise<ProductionDashboardOverviewDTO> => {
        const params = new URLSearchParams();
        if (fromDate) params.append('fromDate', fromDate);
        if (toDate) params.append('toDate', toDate);
        
        const response = await axios.get(`/api/ProductionDashboard/production/overview?${params.toString()}`);
        return response.data;
    },





    // Order Details
    getOrderDetails: async (orderId: number): Promise<OrderDetailDTO> => {
        const response = await axios.get(`/api/ProductionDashboard/orders/${orderId}/details`);
        return response.data;
    },

    getOrdersList: async (): Promise<OrderDetailDTO[]> => {
        const response = await axios.get('/api/ProductionDashboard/orders');
        return response.data;
    }
};
