import axios from "@/setup/axios";

export interface AccountDetail {
  id: number;
  username: string;
  employeeId: number;
  employeeName: string;
  employeePhone: string;
  employeeEmail: string;
  employeeAddress: string;
  roleId: number;
  roleName: string;
  isActive: boolean;
}

export interface AccountListResponse {
  accounts: AccountDetail[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateAccountRequest {
  username: string;
  password: string;
  employeeId: number;
  roleId: number;
}

export interface EmployeeWithoutAccount {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  address: string;
}

export interface Role {
  id: number;
  roleName: string;
}

export interface ServiceResult {
  success: boolean;
  message: string;
}

export const getAccountList = async (page: number = 1, pageSize: number = 10): Promise<AccountListResponse> => {
  const response = await axios.get<AccountListResponse>(`/api/AccountManagement/list`, {
    params: { page, pageSize }
  });
  return response.data;
};

export const getAccountById = async (id: number): Promise<AccountDetail> => {
  const response = await axios.get<AccountDetail>(`/api/AccountManagement/${id}`);
  return response.data;
};

export const createAccount = async (request: CreateAccountRequest): Promise<ServiceResult> => {
  const response = await axios.post<ServiceResult>(`/api/AccountManagement/create`, request);
  return response.data;
};

export const toggleAccountStatus = async (id: number): Promise<ServiceResult> => {
  const response = await axios.put<ServiceResult>(`/api/AccountManagement/${id}/toggle-status`);
  return response.data;
};

export const deleteAccount = async (id: number): Promise<ServiceResult> => {
  const response = await axios.delete<ServiceResult>(`/api/AccountManagement/${id}`);
  return response.data;
};

export const getEmployeesWithoutAccount = async (): Promise<EmployeeWithoutAccount[]> => {
  const response = await axios.get<EmployeeWithoutAccount[]>(`/api/AccountManagement/employees-without-account`);
  return response.data;
};

export const getRoles = async (): Promise<Role[]> => {
  const response = await axios.get<Role[]>(`/api/AccountManagement/roles`);
  return response.data;
};
