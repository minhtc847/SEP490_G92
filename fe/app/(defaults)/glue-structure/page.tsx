'use client';
import { DataTable } from 'mantine-datatable';
import { useState } from 'react';
import Swal from 'sweetalert2';

const PAGE_SIZES = [5, 10, 20, 50];

const glueData = [
  {
    id: 1,
    code: 'VT00115',
    type: 'Kính E30 phủ kín, KT: 300*300*14 mm, VNG-N (Hàng Mẫu QCC)',
    thickness: 14,
    width: 300,
    height: 300,
    glassLayers: 2,
    glueLayers: 1,
    glueLayerThickness: 4,
    structure: '5+4+5',
    glueType: 'Keo mềm',
  },
  {
    id: 2,
    code: 'VT00119',
    type: 'Kính E90 phủ kín, KT: 300*300*18mm, VNG-N (Hàng Mẫu QCC)',
    thickness: 18,
    width: 300,
    height: 300,
    glassLayers: 3,
    glueLayers: 2,
    glueLayerThickness: 7,
    structure: '5+7+4+7+5',
    glueType: 'Keo cứng',
  },
  {
    id: 3,
    code: 'VT00132',
    type: 'Kính EI60 phủ, KT: 628*873*28mm, VNG-N',
    thickness: 28,
    width: 628,
    height: 873,
    glassLayers: 2,
    glueLayers: 1,
    glueLayerThickness: 8,
    structure: '5+8+5',
    glueType: 'Keo cứng',
  },
];

const GlueStructurePage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[2]);
  const [records, setRecords] = useState(glueData);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [formData, setFormData] = useState({
    code: '',
    type: '',
    thickness: '',
    width: '',
    height: '',
    glassLayers: '',
    glueLayers: '',
    glueLayerThickness: '',
    structure: '',
    glueType: 'Keo cứng',
  });

  const handleAdd = () => {
    setSelectedRecord(null);
    setFormData({
      code: '',
      type: '',
      thickness: '',
      width: '',
      height: '',
      glassLayers: '',
      glueLayers: '',
      glueLayerThickness: '',
      structure: '',
      glueType: 'Keo cứng',
    });
    setModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setSelectedRecord(record);
    setFormData({
      code: record.code,
      type: record.type,
      thickness: record.thickness.toString(),
      width: record.width.toString(),
      height: record.height.toString(),
      glassLayers: record.glassLayers.toString(),
      glueLayers: record.glueLayers.toString(),
      glueLayerThickness: record.glueLayerThickness.toString(),
      structure: record.structure,
      glueType: record.glueType,
    });
    setModalOpen(true);
  };

  const handleDelete = (record: any) => {
    Swal.fire({
      title: 'Bạn có chắc chắn?',
      text: "Bạn sẽ không thể hoàn tác hành động này!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      padding: '2em',
      customClass: { popup: 'sweet-alerts' },
    }).then((result) => {
      if (result.value) {
        const newRecords = records.filter((item) => item.id !== record.id);
        setRecords(newRecords);
        Swal.fire({
          title: 'Đã xóa!',
          text: 'Bản ghi đã được xóa thành công.',
          icon: 'success',
          customClass: { popup: 'sweet-alerts' },
        });
      }
    });
  };

  const handleSubmit = () => {
    if (selectedRecord) {
      // Edit existing record
      const updatedRecords = records.map((record) =>
        record.id === selectedRecord.id
          ? {
              ...record,
              ...formData,
              thickness: Number(formData.thickness),
              width: Number(formData.width),
              height: Number(formData.height),
              glassLayers: Number(formData.glassLayers),
              glueLayers: Number(formData.glueLayers),
              glueLayerThickness: Number(formData.glueLayerThickness),
            }
          : record
      );
      setRecords(updatedRecords);
      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Đã cập nhật cấu tạo keo thành công',
        padding: '2em',
        customClass: { popup: 'sweet-alerts' },
      });
    } else {
      // Add new record
      const newRecord = {
        id: records.length + 1,
        ...formData,
        thickness: Number(formData.thickness),
        width: Number(formData.width),
        height: Number(formData.height),
        glassLayers: Number(formData.glassLayers),
        glueLayers: Number(formData.glueLayers),
        glueLayerThickness: Number(formData.glueLayerThickness),
      };
      setRecords([...records, newRecord]);
      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Đã thêm mới cấu tạo keo thành công',
        padding: '2em',
        customClass: { popup: 'sweet-alerts' },
      });
    }
    setModalOpen(false);
  };

  return (
    <div>
      <div className="mb-5 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Cấu tạo keo</h1>
        <button
          onClick={handleAdd}
          className="btn btn-primary"
        >
          Thêm mới
        </button>
      </div>
      <div className="panel mt-6">
        <div className="datatables">
          <DataTable
            highlightOnHover
            className="table-hover whitespace-nowrap"
            records={records}
            columns={[
              { accessor: 'id', title: 'STT', render: (_: any, idx: number) => idx + 1 },
              { accessor: 'code', title: 'Mã hàng' },
              { accessor: 'type', title: 'Chủng loại' },
              { accessor: 'thickness', title: 'Độ dày' },
              { accessor: 'width', title: 'Độ rộng' },
              { accessor: 'height', title: 'Độ cao' },
              { accessor: 'glassLayers', title: 'Số lớp kính' },
              { accessor: 'glueLayers', title: 'Số lớp keo' },
              { accessor: 'glueLayerThickness', title: 'Độ dày lớp keo' },
              { accessor: 'structure', title: 'Cấu tạo' },
              { accessor: 'glueType', title: 'Loại keo' },
              {
                accessor: 'actions',
                title: 'Thao tác',
                render: (record: any) => (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(record)}
                      className="btn btn-outline-primary btn-sm"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(record)}
                      className="btn btn-outline-danger btn-sm"
                    >
                      Xóa
                    </button>
                  </div>
                ),
              },
            ]}
            totalRecords={records.length}
            recordsPerPage={pageSize}
            page={page}
            onPageChange={setPage}
            recordsPerPageOptions={PAGE_SIZES}
            onRecordsPerPageChange={setPageSize}
            minHeight={200}
            paginationText={({ from, to, totalRecords }) => `Tổng số ${totalRecords} bản ghi`}
          />
        </div>
      </div>

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[600px]">
            <h2 className="text-xl font-bold mb-4">
              {selectedRecord ? 'Chỉnh sửa cấu tạo keo' : 'Thêm mới cấu tạo keo'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Mã hàng</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="form-input w-full"
                />
              </div>
              <div>
                <label className="block mb-1">Chủng loại</label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="form-input w-full"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1">Độ dày</label>
                  <input
                    type="number"
                    value={formData.thickness}
                    onChange={(e) => setFormData({ ...formData, thickness: e.target.value })}
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="block mb-1">Độ rộng</label>
                  <input
                    type="number"
                    value={formData.width}
                    onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="block mb-1">Độ cao</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="form-input w-full"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1">Số lớp kính</label>
                  <input
                    type="number"
                    value={formData.glassLayers}
                    onChange={(e) => setFormData({ ...formData, glassLayers: e.target.value })}
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="block mb-1">Số lớp keo</label>
                  <input
                    type="number"
                    value={formData.glueLayers}
                    onChange={(e) => setFormData({ ...formData, glueLayers: e.target.value })}
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="block mb-1">Độ dày lớp keo</label>
                  <input
                    type="number"
                    value={formData.glueLayerThickness}
                    onChange={(e) => setFormData({ ...formData, glueLayerThickness: e.target.value })}
                    className="form-input w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block mb-1">Cấu tạo</label>
                <input
                  type="text"
                  value={formData.structure}
                  onChange={(e) => setFormData({ ...formData, structure: e.target.value })}
                  className="form-input w-full"
                />
              </div>
              <div>
                <label className="block mb-1">Loại keo</label>
                <select
                  value={formData.glueType}
                  onChange={(e) => setFormData({ ...formData, glueType: e.target.value })}
                  className="form-select w-full"
                >
                  <option value="Keo cứng">Keo cứng</option>
                  <option value="Keo mềm">Keo mềm</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="btn btn-outline-danger"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                className="btn btn-primary"
              >
                {selectedRecord ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlueStructurePage; 