import axios from '@/setup/axios';

export interface UpdateCustomerDto {
    customerName: string;
    phone: string;
    address: string;
    customerType: 'customer' | 'supplier';
    notes?: string;
    discount?: number;
    customerCode: string;
    contactPerson?: string;
}

export const deleteCustomer = async (id: number) => {
  const response = await axios.delete(`/api/customers/${id}`);
  return response.data;
};

export const updateCustomer = async (id: number, dto: UpdateCustomerDto): Promise<void> => {
    const res = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
    });
    if (!res.ok) throw new Error('Cập nhật thất bại');
};

export const getCustomerById = async (id: number) => {
    const response = await axios.get(`/api/customers/${id}`);
    return response.data;
};

export const updateCustomerById = async (id: number, data: any) => {
    const response = await axios.put(`/api/customers/${id}`, data);
    return response.data;
};

export const deleteCustomerById = async (id: number) => {
    const response = await axios.delete(`/api/customers/${id}`);
    return response.data;
};

export const checkCustomerHasOrders = async (id: number): Promise<boolean> => {
    const res = await fetch(`/api/customers/${id}/has-orders`);
    if (!res.ok) throw new Error("Không thể kiểm tra đơn hàng của khách hàng");
    return res.json();
};