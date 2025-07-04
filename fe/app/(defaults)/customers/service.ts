import axios from "@/setup/axios";

export interface CustomerListDto {
  id: number;
  customerCode: string;
  customerName: string;
  phone: string;
  address: string;
  isSupplier: boolean;
  discount: number;
}

export const getCustomerList = async (): Promise<CustomerListDto[]> => {
  const response = await axios.get<CustomerListDto[]>("/api/customers");
  return response.data;
};

export const deleteCustomerById = async (id: number) => {
  await axios.delete(`/api/customers/${id}`);
};
