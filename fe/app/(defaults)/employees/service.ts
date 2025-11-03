import axios from "@/setup/axios";

export interface EmployeeListDto {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  hasAccount: boolean;
}

export interface EmployeeDto {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  hasAccount: boolean;
}

export interface UpdateEmployeeDto {
  fullName: string;
  phone: string;
  email: string;
  address: string;
}

export const getEmployeeList = async (): Promise<EmployeeListDto[]> => {
  const response = await axios.get<EmployeeListDto[]>("/api/employees");
  return response.data;
};

export const getEmployeeById = async (id: number): Promise<EmployeeDto> => {
  const response = await axios.get<EmployeeDto>(`/api/employees/${id}`);
  return response.data;
};

export const createEmployee = async (employee: UpdateEmployeeDto): Promise<EmployeeDto> => {
  const response = await axios.post<EmployeeDto>("/api/employees", employee);
  return response.data;
};

export const updateEmployee = async (id: number, employee: UpdateEmployeeDto): Promise<void> => {
  await axios.put(`/api/employees/${id}`, employee);
};

export const deleteEmployeeById = async (id: number) => {
  await axios.delete(`/api/employees/${id}`);
};
