import axios from "@/setup/axios";

export interface ProductInOrderDto {
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
  status: string;
}

export const getOrderDetailById = async (id: number): Promise<OrderDetailDto> => {
  const response = await axios.get(`/api/orders/${id}`);
  return response.data;
};
