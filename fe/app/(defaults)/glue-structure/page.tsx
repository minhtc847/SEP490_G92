'use client';
import { DataTable } from 'mantine-datatable';
import { useState } from 'react';

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
    weight: 25.6,
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
    weight: 37.0,
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
    weight: 32.0,
    glueType: 'Keo cứng',
  },
];

const GlueStructurePage = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[2]);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold">Cấu tạo keo cứng</h1>
      </div>
      <div className="panel mt-6">
        <div className="datatables">
          <DataTable
            highlightOnHover
            className="table-hover whitespace-nowrap"
            records={glueData}
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
              { accessor: 'weight', title: 'TỶ TRỌNG KG/m²' },
              { accessor: 'glueType', title: 'Loại keo' },
            ]}
            totalRecords={glueData.length}
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
    </div>
  );
};

export default GlueStructurePage; 