"use client";
import { useState, useEffect } from "react";
import Swal from 'sweetalert2';
import formularService, { FormularData, FormularGroup } from './formularService';
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { getProducts, Product } from '@/app/(defaults)/products/service';
import { usePermissions } from '@/hooks/usePermissions';

function GlueTable({ title, data, inputValue, onInputChange, onCalc, onEdit, canEdit }: any) {
  return (
    <div style={{ marginBottom: 48, border: "1px solid #e5e7eb", borderRadius: 8, padding: 24, backgroundColor: "white" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontWeight: 700, fontSize: 28 }}>{title}</h2>
        {canEdit && (
          <button onClick={onEdit} style={{ padding: '8px 12px', border: '1px solid #e5e7eb', background: '#fff', borderRadius: 6, cursor: 'pointer' }}>Chỉnh sửa công thức</button>
        )}
      </div>
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
  const [editingType, setEditingType] = useState<string | null>(null);
  const [editRows, setEditRows] = useState<Array<{ id?: number; productId?: number; ratio: number; description?: string }>>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);

  // Permissions
  const { isFactoryManager } = usePermissions();

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
      data.forEach((group: FormularGroup) => {
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

  const openEditModal = async (type: string) => {
    try {
      setEditingType(type);
      const group = formularGroups.find(g => g.type === type);
      setEditRows(
        (group?.formulars || []).map(f => ({ id: f.id, productId: f.productId, ratio: f.ratio, description: f.description }))
      );
      const prods = await getProducts();
      // sort by name for easier selection (null-safe)
      setProducts([
        ...prods
      ].sort((a, b) => (a.productName || '').localeCompare(b.productName || '')));
    } catch (error) {
      console.error('Error initializing edit modal:', error);
      Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không thể tải danh sách sản phẩm', padding: '2em', customClass: { popup: 'sweet-alerts' } });
      setEditingType(null);
    }
  };

  const closeEditModal = () => {
    setEditingType(null);
    setEditRows([]);
  };

  const addEditRow = () => {
    setEditRows(prev => [...prev, { ratio: 0 }]);
  };

  const updateEditRow = (index: number, updates: Partial<{ productId?: number; ratio: number; description?: string }>) => {
    setEditRows(prev => prev.map((row, i) => (i === index ? { ...row, ...updates } : row)));
  };

  const saveEdits = async () => {
    if (!editingType) return;
    try {
      setSaving(true);

      // Calculate total ratio
      const totalRatio = editRows.reduce((sum, r) => sum + (Number.isFinite(r.ratio as number) ? Number(r.ratio) : 0), 0);
      
      // Check if total ratio equals 100%
      if (Math.abs(totalRatio - 100) > 0.01) { // Allow small floating point differences
        await Swal.fire({
          icon: 'warning',
          title: 'Tỉ lệ không hợp lệ!',
          text: `Tổng tỉ lệ hiện tại là ${totalRatio.toFixed(2)}%. Tổng tỉ lệ phải bằng 100% để có thể lưu công thức.`,
          padding: '2em',
          customClass: { popup: 'sweet-alerts' }
        });
        return;
      }

      // Basic validation
      for (let idx = 0; idx < editRows.length; idx++) {
        const row = editRows[idx];
        if (!row.productId || row.ratio === undefined || row.ratio === null) {
          throw new Error(`Dòng #${idx + 1}: thiếu sản phẩm hoặc tỉ lệ`);
        }
        if (row.ratio < 0) {
          throw new Error(`Dòng #${idx + 1}: tỉ lệ phải >= 0`);
        }
      }

      const createPayloads = editRows.filter(r => !r.id).map(r => ({ type: editingType, productId: r.productId as number, ratio: r.ratio, description: r.description }));
      const updatePayloads = editRows.filter(r => r.id).map(r => ({ id: r.id as number, productId: r.productId as number, ratio: r.ratio, description: r.description }));

      await Promise.all([
        ...createPayloads.map(p => formularService.createFormular(p)),
        ...updatePayloads.map(p => formularService.updateFormular(p.id, { productId: p.productId, ratio: p.ratio, description: p.description }))
      ]);

      await loadFormulars();
      closeEditModal();
      Swal.fire({ icon: 'success', title: 'Thành công', text: 'Đã lưu công thức', timer: 1200, showConfirmButton: false });
    } catch (error: any) {
      console.error('Error saving formulars:', error);
      Swal.fire({ icon: 'error', title: 'Lỗi', text: error?.message || 'Không thể lưu công thức', padding: '2em', customClass: { popup: 'sweet-alerts' } });
    } finally {
      setSaving(false);
    }
  };

  const deleteEditRow = async (index: number) => {
    const row = editRows[index];
    if (!row) return;
    try {
      if (row.id) {
        const confirmed = await Swal.fire({ icon: 'warning', title: 'Xoá hàng?', text: 'Bạn có chắc muốn xoá công thức này?', showCancelButton: true, confirmButtonText: 'Xoá', cancelButtonText: 'Huỷ', customClass: { popup: 'sweet-alerts' } });
        if (!confirmed.isConfirmed) return;
        await formularService.deleteFormular(row.id);
        await loadFormulars();
      }
      setEditRows(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error deleting formular:', error);
      Swal.fire({ icon: 'error', title: 'Lỗi', text: 'Không thể xoá công thức', padding: '2em', customClass: { popup: 'sweet-alerts' } });
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
          onEdit={() => openEditModal(group.type)}
          canEdit={isFactoryManager()}
        />
      ))}
      {editingType && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ width: 'min(900px, 96vw)', maxHeight: '90vh', overflowY: 'auto', background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700 }}>Chỉnh sửa công thức: {editingType}</h3>
              <button onClick={closeEditModal} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff' }}>Đóng</button>
            </div>
            {(() => {
              const totalRatio = editRows.reduce((sum, r) => sum + (Number.isFinite(r.ratio as number) ? Number(r.ratio) : 0), 0);
              const hasValidationError = editRows.some(r => !r.productId || r.ratio === undefined || r.ratio === null || r.ratio < 0);
              const isRatioValid = Math.abs(totalRatio - 100) <= 0.01; // Allow small floating point differences
              return (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>Hãy thêm các hàng hoá chất kèm tỉ lệ phần trăm.</div>
                    <div style={{ fontWeight: 700, color: isRatioValid ? '#10b981' : '#f59e0b' }}>Tổng tỉ lệ: {Number(totalRatio.toFixed(2))}%</div>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600, color: '#374151', width: '60px' }}>STT</th>
                        <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600, color: '#374151' }}>Sản phẩm</th>
                        <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600, color: '#374151', width: '120px' }}>Tỉ lệ (%)</th>
                        <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600, color: '#374151' }}>Mô tả</th>
                        <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600, color: '#374151', width: '100px' }}>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editRows.map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #f8fafc' }}>
                          <td style={{ padding: '8px', color: '#6b7280' }}>{idx + 1}</td>
                          <td style={{ padding: '8px' }}>
                            <select
                              aria-label={`Sản phẩm hàng ${idx + 1}`}
                              value={row.productId ?? ''}
                              onChange={(e) => updateEditRow(idx, { productId: e.target.value ? parseInt(e.target.value) : undefined })}
                              style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', boxSizing: 'border-box', width: '100%' }}
                            >
                              <option value="">-- Chọn sản phẩm --</option>
                              {products.map((p) => (
                                <option key={p.id} value={parseInt(p.id)}>{p.productName}</option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: '8px' }}>
                            <input
                              aria-label={`Tỉ lệ hàng ${idx + 1}`}
                              type="number"
                              min={0}
                              step={0.1}
                              value={row.ratio}
                              onChange={(e) => updateEditRow(idx, { ratio: Number(e.target.value) })}
                              style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', boxSizing: 'border-box', width: '100%' }}
                            />
                          </td>
                          <td style={{ padding: '8px' }}>
                            <input
                              aria-label={`Mô tả hàng ${idx + 1}`}
                              type="text"
                              value={row.description ?? ''}
                              onChange={(e) => updateEditRow(idx, { description: e.target.value })}
                              style={{ padding: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', boxSizing: 'border-box', width: '100%' }}
                              placeholder="Mô tả..."
                            />
                          </td>
                          <td style={{ padding: '8px' }}>
                            <button onClick={() => deleteEditRow(idx)} style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid #ef4444', color: '#ef4444', background: '#fff', boxSizing: 'border-box' }}>Xoá</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                    <button onClick={addEditRow} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff' }}>+ Thêm hàng</button>
                    <button disabled={saving || hasValidationError || !isRatioValid} onClick={saveEdits} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: (saving || hasValidationError || !isRatioValid) ? '#86efac' : '#10b981', color: '#fff', fontWeight: 600, opacity: (saving || !isRatioValid) ? 0.7 : 1 }}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  );
} 