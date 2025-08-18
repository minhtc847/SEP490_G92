import axios from '@/setup/axios';

export interface FormularData {
  id: number;
  type: string;
  chemicalName: string;
  ratio: number;
  description?: string;
  productId?: number;
}

export interface FormularGroup {
  type: string;
  formulars: FormularData[];
}

class FormularService {
  async getAllFormulars(): Promise<FormularGroup[]> {
    try {
      const response = await axios.get('/api/formular');
      return response.data;
    } catch (error) {
      console.error('Error fetching formulars:', error);
      throw error;
    }
  }

  async getFormularsByType(type: string): Promise<FormularData[]> {
    try {
      const response = await axios.get(`/api/formular/type/${type}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching formulars for type ${type}:`, error);
      throw error;
    }
  }

  async createFormular(payload: { type: string; productId: number; ratio: number; description?: string }): Promise<FormularData> {
    try {
      const response = await axios.post('/api/formular', payload);
      return response.data;
    } catch (error) {
      console.error('Error creating formular:', error);
      throw error;
    }
  }

  async updateFormular(id: number, payload: { productId: number; ratio: number; description?: string }): Promise<FormularData> {
    try {
      const response = await axios.put(`/api/formular/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error('Error updating formular:', error);
      throw error;
    }
  }

  async deleteFormular(id: number): Promise<void> {
    try {
      await axios.delete(`/api/formular/${id}`);
    } catch (error) {
      console.error('Error deleting formular:', error);
      throw error;
    }
  }
}

export default new FormularService(); 