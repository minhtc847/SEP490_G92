import axios from '@/setup/axios';

export interface ProductDetail {
    id: number;
    productName: string;
    productType: string;
    uom: string;
    height: string;
    width: string;
    thickness: number;
    weight: number;
    unitPrice: number;
    glassStructureId: number;
}

export interface GlassStructureOption {
    id: number;
    productName: string;
    unitPrice: number;
}

export async function createProduct(data: any) {
  const res = await fetch('/api/product', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Tạo sản phẩm thất bại');
  }
}

export async function searchGlassStructures(inputValue: string) {
  const res = await fetch(`/api/product/search?query=${encodeURIComponent(inputValue)}`);
  const data = await res.json();
  return data;
}

export const getProductById = async (id: string): Promise<ProductDetail> => {
    const res = await axios.get(`/api/Product/${id}`);
    return res.data;
};

export const updateProduct = async (id: number, data: ProductDetail) => {
    await axios.put(`/api/Product/${id}`, data);
};

export const deleteProduct = async (id: string) => {
    await axios.delete(`/api/Product/${id}`);
};