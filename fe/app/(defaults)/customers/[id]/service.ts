import axios from "@/setup/axios"

export interface CustomerDetail {
  id: number
  customerCode: string | null
  customerName: string
  phone: string
  address: string
  customerType: "customer" | "supplier"
  contactPerson?: string
  contactPhone?: string
  notes?: string
  discount?: number
  createdAt: string
}

export const getCustomerById = async (id: number): Promise<CustomerDetail> => {
  const response = await axios.get<CustomerDetail>(`/api/customers/${id}`)
  return response.data
}