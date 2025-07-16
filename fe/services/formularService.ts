import axios from '../setup/axios';

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
}

export default new FormularService(); 