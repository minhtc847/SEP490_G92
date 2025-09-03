import axios from "@/setup/axios";

export interface ProductInOrderDto {
  productId: number;
  productCode: string;
  productName: string;
  height: number;
  width: number;
  thickness: number;
  areaM2: number;
  unitPrice: number;
  quantity: number;
  totalAmount: number;
  glassProductName?: string;
  isUpdateMisa: boolean;
}

export interface OrderDetailDto {
  orderCode: string;
  orderDate: string;
  customerName: string;
  address: string;
  phone: string;
  discount: number;
  products: ProductInOrderDto[];
  totalQuantity: number;
  totalAmount: number;
  status: number;
  deliveryStatus: number;
  isUpdateMisa: boolean;
}

export const getOrderDetailById = async (id: number): Promise<OrderDetailDto> => {
  const response = await axios.get(`/api/orders/${id}`);
  console.log('API Response:', response.data);
  console.log('isUpdateMisa value:', response.data.isUpdateMisa);
  return response.data;
};

export const updateMisaOrder = async (orderId: number): Promise<any> => {
  // Lấy dữ liệu đơn hàng cho MISA
  const orderData = await axios.get(`/api/orders/${orderId}/misa-data`);
  
  // Gọi API Selenium để cập nhật MISA
  const res = await axios.post('/api/Selenium/sale-order', orderData.data);
  return res.data;
};

export const checkOrderProductsMisaStatus = async (orderId: number): Promise<any> => {
  const response = await axios.get(`/api/orders/${orderId}/check-products-misa`);
  return response.data;
};

export const updateOrderMisaStatus = async (orderId: number): Promise<any> => {
  const res = await axios.put(`/api/orders/${orderId}/update-misa-status`);
  return res.data;
};

export const checkHasProductionPlan = async (orderId: number): Promise<boolean> => {
  const response = await axios.get(`/api/ProductionPlan/has-production-plan/${orderId}`);
  return response.data.hasProductionPlan;
};
