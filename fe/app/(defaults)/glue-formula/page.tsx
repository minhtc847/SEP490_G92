"use client";
import { useState, useEffect } from "react";
import Swal from 'sweetalert2';
import formularService, { FormularData, FormularGroup } from '../../../services/formularService';
import ProtectedRoute from "@/components/auth/ProtectedRoute";

function GlueTable({ title, data, inputValue, onInputChange, onCalc }: any) {
  return (
    <div style={{ marginBottom: 48, border: "1px solid #e5e7eb", borderRadius: 8, padding: 24, backgroundColor: "white" }}>
      <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24 }}>{title}</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #eee" }}>
            <th style={{ textAlign: "left", padding: 8 }}>Hóa chất</th>
            <th style={{ textAlign: "left", padding: 8 }}>Tỉ lệ (%)</th>
            <th style={{ textAlign: "left", padding: 8 }}>Mô tả</th>
            <th style={{ textAlign: "left", padding: 8 }}>Khối lượng (g)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row: FormularData, idx: number) => (
            <tr key={idx} style={{ borderBottom: "1px solid #f5f5f5" }}>
              <td style={{ padding: 8 }}>{row.chemicalName}</td>
              <td style={{ padding: 8 }}>{row.ratio}</td>
              <td style={{ padding: 8 }}>{row.description || '-'}</td>
              <td style={{ padding: 8, fontWeight: 600 }}></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          type="number"
          placeholder="Nhập khối lượng keo muốn trộn"
          value={inputValue}
          onChange={onInputChange}
          style={{ flex: 1, padding: 8, border: "1px solid #eee", borderRadius: 4 }}
        />
        <button onClick={onCalc} style={{ padding: "8px 16px", border: "none", background: "#f1f3f5", borderRadius: 4, fontWeight: 500 }}>
          Tính
        </button>
      </div>
    </div>
  );
}

export default function GlueFormulaPage() {
  const [formularGroups, setFormularGroups] = useState<FormularGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputs, setInputs] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadFormulars();
  }, []);

  const loadFormulars = async () => {
    try {
      setLoading(true);
      const data = await formularService.getAllFormulars();
      setFormularGroups(data);
      
      // Initialize inputs for each type
      const initialInputs: { [key: string]: string } = {};
      data.forEach(group => {
        initialInputs[group.type] = '';
      });
      setInputs(initialInputs);
    } catch (error) {
      console.error('Error loading formulars:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Không thể tải dữ liệu công thức keo',
        padding: '2em',
        customClass: { popup: 'sweet-alerts' },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (type: string, value: string) => {
    setInputs(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleCalc = async (type: string) => {
    const total = parseFloat(inputs[type]);
    if (!total || total <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Vui lòng nhập khối lượng hợp lệ',
        padding: '2em',
        customClass: { popup: 'sweet-alerts' },
      });
      return;
    }


  };

  if (loading) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 32, backgroundColor: "#f9fafb" }}>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Công thức keo</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '2em' }}>
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>

    <div style={{ maxWidth: 900, margin: "0 auto", padding: 32, backgroundColor: "#f9fafb" }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Công thức keo</h1>
      </div>
      {formularGroups.map((group) => (
        <GlueTable
          key={group.type}
          title={group.type}
          data={group.formulars}
          inputValue={inputs[group.type] || ''}
          onInputChange={(e: any) => handleInputChange(group.type, e.target.value)}
          onCalc={() => handleCalc(group.type)}
        />
      ))}
    </div>
    </ProtectedRoute>
  );
} 