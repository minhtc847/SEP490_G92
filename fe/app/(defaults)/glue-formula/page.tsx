"use client";
import { useState } from "react";
import Swal from 'sweetalert2';

const hardGlueData: { name: string; ratio: number; desc: string; mass: number }[] = [
  { name: "A", ratio: 74.9, desc: "Chất abcxyz", mass: 0 },
  { name: "KOH", ratio: 11.3, desc: "Chất abcxyz", mass: 0 },
  { name: "H2O", ratio: 13.8, desc: "Nước", mass: 0 },
];

const softGlueData: { name: string; ratio: number; desc: string; mass: number }[] = [
  { name: "B", ratio: 65.0, desc: "Chất defuvw", mass: 0 },
  { name: "NaOH", ratio: 20.0, desc: "Chất kiềm", mass: 0 },
  { name: "H2O", ratio: 15.0, desc: "Nước", mass: 0 },
];

function GlueTable({ title, data, inputValue, onInputChange, onCalc, onExport }: any) {
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
          {data.map((row: any, idx: number) => (
            <tr key={idx} style={{ borderBottom: "1px solid #f5f5f5" }}>
              <td style={{ padding: 8 }}>{row.name}</td>
              <td style={{ padding: 8 }}>{row.ratio}</td>
              <td style={{ padding: 8 }}>{row.desc}</td>
              <td style={{ padding: 8, fontWeight: 600 }}>{row.mass}</td>
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
        <button onClick={onExport} style={{ padding: "8px 16px", border: "none", background: "#f1f3f5", borderRadius: 4, fontWeight: 500 }}>
          Xuất file
        </button>
      </div>
    </div>
  );
}

export default function GlueFormulaPage() {
  const [hardInput, setHardInput] = useState("");
  const [hardData, setHardData] = useState<typeof hardGlueData>(hardGlueData);
  const [softInput, setSoftInput] = useState("");
  const [softData, setSoftData] = useState<typeof softGlueData>(softGlueData);

  const handleCalcHard = () => {
    const total = parseFloat(hardInput);
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
    setHardData(
      hardGlueData.map((row) => ({
        ...row,
        mass: Number(((row.ratio / 100) * total).toFixed(2)),
      }))
    );
    Swal.fire({
      icon: 'success',
      title: 'Thành công!',
      text: 'Đã tính toán công thức keo cứng',
      padding: '2em',
      customClass: { popup: 'sweet-alerts' },
    });
  };

  const handleCalcSoft = () => {
    const total = parseFloat(softInput);
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
    setSoftData(
      softGlueData.map((row) => ({
        ...row,
        mass: Number(((row.ratio / 100) * total).toFixed(2)),
      }))
    );
    Swal.fire({
      icon: 'success',
      title: 'Thành công!',
      text: 'Đã tính toán công thức keo mềm',
      padding: '2em',
      customClass: { popup: 'sweet-alerts' },
    });
  };

  const handleExportHard = () => {
    Swal.fire({
      icon: 'success',
      title: 'Thành công!',
      text: 'Đã xuất file công thức keo cứng',
      padding: '2em',
      customClass: { popup: 'sweet-alerts' },
    });
  };

  const handleExportSoft = () => {
    Swal.fire({
      icon: 'success',
      title: 'Thành công!',
      text: 'Đã xuất file công thức keo mềm',
      padding: '2em',
      customClass: { popup: 'sweet-alerts' },
    });
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 32, backgroundColor: "#f9fafb" }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Công thức keo</h1>
      </div>
      <GlueTable
        title="Keo cứng"
        data={hardData}
        inputValue={hardInput}
        onInputChange={(e: any) => setHardInput(e.target.value)}
        onCalc={handleCalcHard}
        onExport={handleExportHard}
      />
      <GlueTable
        title="Keo mềm"
        data={softData}
        inputValue={softInput}
        onInputChange={(e: any) => setSoftInput(e.target.value)}
        onCalc={handleCalcSoft}
        onExport={handleExportSoft}
      />
    </div>
  );
} 