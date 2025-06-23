'use client';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import sortBy from 'lodash/sortBy';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { getProductionPlansArray, ProductionPlan } from './service';

const PAGE_SIZES = [5, 10, 20, 50];

// const productionOrders = [
//   {
//     id: 'LSX0001',
//     date: '09/06/2025',
//     orderCode: 'DH00001',
//     customer: 'Hoàng',
//     totalQuantity: 20,
//     status: 'Chờ phê duyệt',
//     note: '',
//   },
//   {
//     id: 'LSX0002',
//     date: '09/06/2025',
//     orderCode: 'DH00002',
//     customer: 'Minh',
//     totalQuantity: 10,
//     status: 'Đang sản xuất',
//     note: '',
//   },
//   {
//     id: 'LSX0003',
//     date: '09/06/2025',
//     orderCode: 'DH00003',
//     customer: 'Hiếu',
//     totalQuantity: 11,
//     status: 'Đang sản xuất',
//     note: '',
//   },
//   {
//     id: 'LSX0004',
//     date: '09/06/2025',
//     orderCode: 'DH00004',
//     customer: 'Kiên',
//     totalQuantity: 2,
//     status: 'Đã hoàn tất',
//     note: '',
//   },
//   {
//     id: 'LSX0005',
//     date: '09/06/2025',
//     orderCode: 'DH00005',
//     customer: 'Tuấn',
//     totalQuantity: 5,
//     status: 'Đã hoàn tất',
//     note: '',
//   },
//   {
//     id: 'LSX0006',
//     date: '09/06/2025',
//     orderCode: 'DH00006',
//     customer: 'Tú',
//     totalQuantity: 30,
//     status: 'Đã hoàn tất',
//     note: '',
//   },
//   {
//     id: 'LSX0007',
//     date: '09/06/2025',
//     orderCode: 'DH00007',
//     customer: 'Nhật',
//     totalQuantity: 15,
//     status: 'Đã hoàn tất',
//     note: '',
//   },
// ];




const statusColor = (status: string) => {
  switch (status) {
    case 'Chờ phê duyệt':
      return 'bg-gray-200 text-gray-800';
    case 'Đang sản xuất':
      return 'bg-blue-100 text-blue-800';
    case 'Đã hoàn tất':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const ListProductionOrders = () => {
  const [productionOrders,setproductionOrders] = useState<ProductionPlan[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getProductionPlansArray();
                setproductionOrders(result);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: 'id',
    direction: 'asc',
  });
  const [initialRecords, setInitialRecords] = useState(sortBy(productionOrders, 'id'));
  const [recordsData, setRecordsData] = useState(initialRecords);
  const [popup, setPopup] = useState<{ open: boolean; action: string; record: any | null }>({ open: false, action: '', record: null });

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  

  useEffect(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    setRecordsData([...initialRecords.slice(from, to)]);
  }, [page, pageSize, initialRecords]);

  useEffect(() => {
    const data = sortBy(initialRecords, sortStatus.columnAccessor);
    setInitialRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
    setPage(1);
  }, [sortStatus]);

  useEffect(() => {
  const sorted = sortBy(productionOrders, sortStatus.columnAccessor);
  setInitialRecords(sortStatus.direction === 'desc' ? sorted.reverse() : sorted);
}, [productionOrders]);

  const handleView = (record: any) => {
    router.push(`/production-orders/${record.id}`);
  };
  const handleApprove = (record: any) => {
    setPopup({ open: true, action: 'approve', record });
  };
  const handleComplete = (record: any) => {
    setPopup({ open: true, action: 'complete', record });
  };
  const handleReject = (record: any) => {
    alert('Reject: ' + record.id);
  };
  const handleDelete = (record: any) => {
    Swal.fire({
      icon: 'warning',
      title: 'Bạn có chắc chắn?',
      text: "Bạn sẽ không thể hoàn tác hành động này!",
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      padding: '2em',
      customClass: { popup: 'sweet-alerts' },
    }).then((result) => {
      if (result.value) {
        // Xử lý xóa ở đây
        Swal.fire({ 
          title: 'Đã xóa!', 
          text: `Lệnh sản xuất ${record.id} đã được xóa.`, 
          icon: 'success', 
          customClass: { popup: 'sweet-alerts' } 
        });
      }
    });
  };
  const handlePopupYes = () => {
    // Chỉ minh họa, chưa gọi API
    setPopup({ open: false, action: '', record: null });
    alert(
      popup.action === 'approve'
        ? `Đã phê duyệt LSX: ${popup.record.id}`
        : `Đã hoàn tất LSX: ${popup.record.id}`
    );
  };
  const handlePopupNo = () => {
    setPopup({ open: false, action: '', record: null });
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold">Danh sách lệnh sản xuất</h1>
      </div>
      <div className="panel mt-6">
        <div className="datatables">
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
                render: (record: any) => (
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColor(record.status)}`}>
                    {record.status}
                  </span>
                ),
                sortable: true,
              },
              { accessor: 'note', title: 'Ghi chú' },
              {
                accessor: 'actions',
                title: 'ACTION',
                render: (record: any) => (
                  <div className="flex gap-2">
                    <button className="btn btn-outline-primary btn-xs" onClick={() => handleView(record)}>
                      View
                    </button>
                    {record.status === 'Chờ phê duyệt' && (
                      <button className="btn btn-success btn-xs" onClick={() => handleApprove(record)}>
                        Phê duyệt
                      </button>
                    )}
                    {record.status === 'Đang sản xuất' && (
                      <button className="btn btn-primary btn-xs" onClick={() => handleComplete(record)}>
                        Hoàn tất
                      </button>
                    )}
                    <button className="btn btn-danger btn-xs" onClick={() => handleDelete(record)}>
                      Delete
                    </button>
                  </div>
                ),
              },
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
            paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
          />
        </div>

        {popup.open && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <div className="bg-white rounded shadow-lg p-6 min-w-[300px]">
              <div className="mb-4 text-base font-semibold">
                {popup.action === 'approve' ? 'Bạn có chắc muốn phê duyệt lệnh sản xuất này?' : 'Bạn có chắc muốn hoàn tất lệnh sản xuất này?'}
              </div>
              <div className="flex justify-end gap-2">
                <button className="btn btn-primary btn-sm" onClick={handlePopupYes}>Yes</button>
                <button className="btn btn-outline btn-sm" onClick={handlePopupNo}>No</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Page = () => {
  return <ListProductionOrders />;
};

export default Page;