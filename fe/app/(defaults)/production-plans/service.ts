import axios from "@/setup/axios";

/**
 * Fetch danh sách production plan từ backend
 * @returns Promise<ProductionPlan[]>
 */
export async function fetchProductionPlanList() {
  const response = await axios.get("/api/ProductionPlan/list");
  return response.data;
}

/**
 * Fetch chi tiết production plan từ backend
 * @param id id của production plan
 * @returns Promise<ProductionPlanDetail>
 */
export async function fetchProductionPlanDetail(id: number | string) {
  const response = await axios.get(`/api/ProductionPlan/detail/${id}`);
  return response.data;
}

/**
 * Fetch danh sách sản phẩm trong production plan từ backend
 * @param id id của production plan
 * @returns Promise<ProductionPlanProductDetail[]>
 */
export async function fetchProductionPlanProductDetails(id: number | string) {
  const response = await axios.get(`/api/ProductionPlan/detail/${id}/products`);
  return response.data;
}

/**
 * Tạo lệnh sản xuất cắt kính
 * @param data dữ liệu lệnh cắt kính
 * @returns Promise<boolean>
 */
export async function createCutGlassOrder(data: CutGlassOrderData) {
  const response = await axios.post("/api/CutGlassOrder/create", data);
  return response.data;
}

/**
 * Tạo lệnh sản xuất ghép kính
 * @param data dữ liệu lệnh ghép kính
 * @returns Promise<boolean>
 */
export async function createGlueGlassOrder(data: GlueGlassOrderData) {
  const response = await axios.post("/api/GlueGlassOrder/create", data);
  return response.data;
}

/**
 * Tạo lệnh sản xuất đổ keo
 * @param data dữ liệu lệnh đổ keo
 * @returns Promise<boolean>
 */
export async function createPourGlueOrder(data: PourGlueOrderData) {
  const response = await axios.post("/api/PourGlueOrder/create", data);
  return response.data;
}

/**
 * Kiểu dữ liệu cho production plan
 */
export interface ProductionPlan {
  id: number;
  planDate: string;
  orderCode: string;
  customerName: string;
  quantity: number;
  status: string;
}

export interface ProductionPlanDetail {
  customerName: string;
  address?: string;
  phone?: string;
  orderCode: string;
  orderDate: string;
  deliveryStatus?: string;
  planDate: string;
  status?: string;
  quantity?: number;
  done: number;
}

export interface ProductionPlanProductDetail {
  id: number;
  productId: number; // Thêm productId để lưu ID thực của sản phẩm
  productName: string;
  totalQuantity: number;
  inProduction: number;
  completed: number;
  daCatKinh: number;
  daTronKeo: number;
  daGiao: number;
  daGhepKinh: number;
  daDoKeo: number;
}

export interface ProductionOrderListItem {
  id: number;
  orderDate: string;
  type: string;
  description: string;
  productionStatus?: string;
}



export interface CutGlassOrderData {
  productionPlanId: number;
  productQuantities: { [productionPlanDetailId: number]: number }; // Sử dụng ID của ProductionPlanDetail
  finishedProducts: FinishedProduct[];
}

export interface GlueGlassOrderData {
  productionPlanId: number;
  productQuantities: { [productionPlanDetailId: number]: number }; // Sử dụng ID của ProductionPlanDetail
  finishedProducts: FinishedProduct[];
}

export interface PourGlueOrderData {
  productionPlanId: number;
  productQuantities: { [productionPlanDetailId: number]: number }; // Sử dụng ID của ProductionPlanDetail
  finishedProducts: FinishedProduct[];
}

export interface FinishedProduct {
  productName: string;
  quantity: number;
}

export async function fetchProductionOrdersByPlanId(id: number | string): Promise<ProductionOrderListItem[]> {
  const response = await axios.get(`/api/ProductionPlan/detail/${id}/production-orders`);
  return response.data.map((item: any) => ({
    id: item.productionOrderId,
    orderDate: item.orderDate,
    type: item.type,
    description: item.description,
    productionStatus: item.productionStatus,
  }));
}

export interface Product {
    name: string;
    quantity: number;
    glueButyls: Chemical[];
}

export interface Chemical {
    type: string;
    uom: string;
    quantity: number;
}

export interface PhieuXuatKeoButylData {
    id: number;
    employeeName: string;
    productionOrderId: number;
    createdAt: string;
    products: Product[];
}

export async function fetchPhieuXuatKeoButylData(id: number | string): Promise<PhieuXuatKeoButylData> {
  const response = await axios.get(`/api/GlueButylExport/get-by-id/${id}`);
  return response.data;
}

export async function fetchAllPhieuXuatKeoButylData(id: number | string): Promise<PhieuXuatKeoButylData[]> {
  const response = await axios.get(`/api/GlueButylExport/get-all/${id}`);
  return response.data;
}
export async function createPhieuXuatKeoButylData(data: any) {
  const response = await axios.post('/api/GlueButylExport/add', data);
  return response.data;
}
export interface ProductionPlanMaterialProduct {
  id: number;
  productName: string;
  productCode: string;
  width: string;
  height: string;
  quantity: number;
  thickness: number;
  glueLayers: number;
  glassLayers: number;
  glass4mm: number;
  glass5mm: number;
  butylType: number;
  totalGlue: number;
  butylLength: number;
  isCuongLuc: boolean;
  adhesiveType: string;
}

export interface ProductionPlanMaterialDetail {
  totalKeoNano: number;
  chatA: number;
  koh: number;
  h2o: number;
  totalKeoMem: number;
  nuocLieu: number;
  a: number;
  b: number;
  products: ProductionPlanMaterialProduct[];
}

export async function fetchProductionPlanMaterialDetail(id: number | string): Promise<ProductionPlanMaterialDetail> {
  const response = await axios.get(`/api/ProductionPlan/detail/${id}/materials`);
  return response.data;
}

