import axios from "@/setup/axios"

export interface CreateCustomerDto {
  customerCode: string
  phone: string
  customerName: string
  customerType: "customer" | "supplier"
  address: string
  contactPerson: string
  notes: string
}

export const createCustomer = async (data: CreateCustomerDto) => {
  try {
    const payload = {
      customerCode: data.customerCode,
      customerName: data.customerName,
      address: data.address,
      contactPerson: data.contactPerson,
      phone: data.phone,
      isSupplier: data.customerType === "supplier",
    }
    const response = await axios.post("/api/customers", payload)
    return response.data
  } catch (error) {
    throw error
  }
}
