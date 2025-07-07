import axios from "@/setup/axios"

export interface CreateCustomerDto {
  customerCode: string
  phone: string
  customerName: string
  customerType: "customer" | "supplier"
  address: string
  contactPerson: string
  contactPhone: string
  notes: string
  discount: number
}

export const createCustomer = async (data: CreateCustomerDto) => {
  try {
    const response = await axios.post("/api/customers", data)
    return response.data
  } catch (error) {
    throw error
  }
}
