'use client';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import sortBy from 'lodash/sortBy';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { getProductionPlansArray, ProductionPlan, updateProductionPlanStatus } from './service';

const PAGE_SIZES = [5, 10, 20, 50];

const statusColor = (status: string) => {
  switch (status) {
    case 'Chờ phê duyệt':
      return 'bg-gray-200 text-gray-800';
    case 'Đang sản xuất':
      return 'bg-blue-100 text-blue-800';
    case 'Đã hoàn tất':
      return 'bg-green-100 text-green-800';
    case 'Đã hủy':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const ListProductionOrders = () => {
  const [productionDetails, setproductionDetails] = useState<ProductionPlan[]>([]);
  const [popup, setPopup] = useState<{ open: boolean; action: string; record: any | null }>({
    open: false,
    action: '',
    record: null,
  });

  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: 'id',
    direction: 'asc',
  });
  const [initialRecords, setInitialRecords] = useState<ProductionPlan[]>([]);
  const [recordsData, setRecordsData] = useState<ProductionPlan[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getProductionPlansArray();
        setproductionDetails(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const sorted = sortBy(productionDetails, sortStatus.columnAccessor);
    setInitialRecords(sortStatus.direction === 'desc' ? sorted.reverse() : sorted);
  }, [productionDetails, sortStatus]);

  useEffect(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    setRecordsData([...initialRecords.slice(from, to)]);
  }, [page, pageSize, initialRecords]);

  const handleView = (record: any) => {
    router.push(`/production-plans/${record.id}`);
  };

  const handleApprove = (record: any) => {
    setPopup({ open: true, action: 'approve', record });
  };

  const handleComplete = (record: any) => {
    setPopup({ open: true, action: 'complete', record });
  };

  const handleCancel = async (record: any) => {
    const confirmed = await Swal.fire({
      icon: 'warning',
      title: 'Bạn có chắc muốn hủy lệnh này?',
      showCancelButton: true,
      confirmButtonText: 'Hủy lệnh',
      cancelButtonText: 'Không',
    });

    if (confirmed.isConfirmed) {
      try {
        await updateProductionPlanStatus(record.id, 'Đã hủy');
        const updated = await getProductionPlansArray();
        setproductionDetails(updated);

        Swal.fire('Đã hủy!', `Lệnh sản xuất ${record.id} đã chuyển sang trạng thái "Đã hủy".`, 'success');
      } catch (err) {
        Swal.fire('Lỗi', 'Không thể hủy lệnh. Vui lòng thử lại.', 'error');
      }
    }
  };

  const handlePopupYes = async () => {
    if (!popup.record) return;

    const newStatus =
      popup.action === 'approve'
        ? 'Đang sản xuất'
        : popup.action === 'complete'
        ? 'Đã hoàn tất'
        : popup.record.status;

    try {
      await updateProductionPlanStatus(popup.record.id, newStatus);
      const updated = await getProductionPlansArray();
      setproductionDetails(updated);

      Swal.fire({
        title: 'Thành công!',
        text:
          popup.action === 'approve'
            ? `Lệnh sản xuất ${popup.record.id} đã được phê duyệt!`
            : `Lệnh sản xuất ${popup.record.id} đã hoàn tất!`,
        icon: 'success',
      });
    } catch (error) {
      Swal.fire('Lỗi', 'Không thể cập nhật trạng thái. Vui lòng thử lại.', 'error');
    }

    setPopup({ open: false, action: '', record: null });
  };

  const handlePopupNo = () => {
    setPopup({ open: false, action: '', record: null });
  };
  const normalizeStatus = (status: string): string => {
    return status
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold">Danh sách lệnh sản xuất</h1>
      </div>
      <div className="panel mt-6">
        <DataTable
          highlightOnHover
          className="table-hover whitespace-nowrap"
          records={recordsData}
          columns={[
            { accessor: 'id', title: 'Mã LXS', sortable: true },
            { accessor: 'planDate', title: 'Thời gian', sortable: true },
            { accessor: 'orderCode', title: 'Mã ĐH', sortable: true },
            { accessor: 'customerName', title: 'KHÁCH HÀNG', sortable: true },
            { accessor: 'quantity', title: 'Tổng Số lượng', sortable: true },
            {
              accessor: 'status',
              title: 'Trạng thái',
              render: (record) => (
                <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColor(record.status)}`}>
                  {record.status}
                </span>
              ),
              sortable: true,
            },
            {
              accessor: 'actions',
              title: 'ACTION',
              render: (record: any) => {
                const normalizedStatus = normalizeStatus(record.status); // CHUẨN HÓA TẠI ĐÂY
            
                return (
                  <div className="flex gap-2">
                    <button className="btn btn-outline-primary btn-xs" onClick={() => handleView(record)}>
                      View
                    </button>
                    {normalizedStatus === 'Chờ Phê Duyệt' && (
                      <button className="btn btn-success btn-xs" onClick={() => handleApprove(record)}>
                        Phê duyệt
                      </button>
                    )}
                    {normalizedStatus === 'Đang Sản Xuất' && (
                      <button className="btn btn-primary btn-xs" onClick={() => handleComplete(record)}>
                        Hoàn tất
                      </button>
                    )}
                    {normalizedStatus !== 'Đã Hủy' && (
                      <button className="btn btn-danger btn-xs" onClick={() => handleCancel(record)}>
                        Hủy
                      </button>
                    )}
                  </div>
                );
              },
            }
            
          ]}
          totalRecords={initialRecords.length}
          recordsPerPage={pageSize}
          page={page}
          onPageChange={setPage}
          recordsPerPageOptions={PAGE_SIZES}
          onRecordsPerPageChange={setPageSize}
          sortStatus={sortStatus}
          onSortStatusChange={setSortStatus}
          minHeight={200}
          paginationText={({ from, to, totalRecords }) => `Hiển thị từ ${from} đến ${to} / ${totalRecords} dòng`}
        />
      </div>

      {popup.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded shadow-lg p-6 min-w-[300px]">
            <div className="mb-4 text-base font-semibold">
              {popup.action === 'approve'
                ? 'Bạn có chắc muốn phê duyệt lệnh sản xuất này?'
                : 'Bạn có chắc muốn hoàn tất lệnh sản xuất này?'}
            </div>
            <div className="flex justify-end gap-2">
              <button className="btn btn-primary btn-sm" onClick={handlePopupYes}>
                Yes
              </button>
              <button className="btn btn-outline btn-sm" onClick={handlePopupNo}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListProductionOrders;
