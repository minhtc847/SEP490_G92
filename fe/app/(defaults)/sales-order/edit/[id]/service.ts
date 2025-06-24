import axios from '@/setup/axios';

export interface UpdateProductDto {
  productId: number;
  productCode: string;
  productName: string;
  height: number;
  width: number;
  thickness: number;
  unitPrice: number;
  quantity: number;
}

export interface UpdateOrderPayload {
  customerName: string;
  address: string;
  phone: string;
  discount: number;
  status: string;
  products: UpdateProductDto[];
}

export interface OrderItem {
  id: number;        
  productId: number;  
  productCode: string;
  productName: string;
  height: number;
  width: number;
  thickness: number;
  quantity: number;
  unitPrice: number;
}
export interface OrderDetailDto {
  id: number;
  orderCode: string;
  orderDate: string;
  status: string;
  customerName: string;
  address: string;
  phone: string;
  discount: number;
  products: OrderItem[];
}

export const getOrderDetailById = async (id: number): Promise<OrderDetailDto> => {
  const response = await axios.get(`/api/orders/${id}`);
  return response.data;
};

export const updateOrderDetailById = async (id: number, payload: UpdateOrderPayload) => {
  await axios.put(`/api/orders/${id}`, payload);
};
