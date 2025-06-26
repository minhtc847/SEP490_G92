"use client";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useEffect, useState } from "react";
import sortBy from "lodash/sortBy";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const PAGE_SIZES = [5, 10, 20, 50];

const statusColor = (status: string) => {
  switch (status) {
    case "Chờ phê duyệt":
      return "bg-gray-200 text-gray-800";
    case "Đang sản xuất":
      return "bg-blue-100 text-blue-800";
    case "Đã hoàn tất":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const ListProductionOrders = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "productionOrderCode",
    direction: "asc",
  });
  const [initialRecords, setInitialRecords] = useState<any[]>([]);
  const [recordsData, setRecordsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState<{ open: boolean; action: string; record: any | null }>({ open: false, action: "", record: null });

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
    setInitialRecords(sortStatus.direction === "desc" ? data.reverse() : data);
    setPage(1);
  }, [sortStatus]);

  useEffect(() => {
    setLoading(true);
    fetch("https://localhost:7075/api/ProductionOrders")
      .then((res) => res.json())
      .then((data) => {
        setInitialRecords(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleView = (record: any) => {
    router.push(`/production-orders/${record.productionOrderId}`);
  };
  const handleApprove = (record: any) => {
    setPopup({ open: true, action: "approve", record });
  };
  const handleComplete = (record: any) => {
    setPopup({ open: true, action: "complete", record });
  };
  const handleDelete = (record: any) => {
    Swal.fire({
      icon: "warning",
      title: "Bạn có chắc chắn?",
      text: "Bạn sẽ không thể hoàn tác hành động này!",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      padding: "2em",
      customClass: { popup: "sweet-alerts" },
    }).then((result) => {
      if (result.value) {
        // Xử lý xóa ở đây
        Swal.fire({
          title: "Đã xóa!",
          text: `Lệnh sản xuất ${record.productionOrderCode} đã được xóa.`,
          icon: "success",
          customClass: { popup: "sweet-alerts" },
        });
      }
    });
  };
  const handlePopupYes = () => {
    setPopup({ open: false, action: "", record: null });
    alert(
      popup.action === "approve"
        ? `Đã phê duyệt LSX: ${popup.record.productionOrderCode}`
        : `Đã hoàn tất LSX: ${popup.record.productionOrderCode}`
    );
  };
  const handlePopupNo = () => {
    setPopup({ open: false, action: "", record: null });
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
              { accessor: "productionOrderCode", title: "Mã LXS", sortable: true },
              { accessor: "orderCode", title: "Mã ĐH", sortable: true },
              { accessor: "customerName", title: "KHÁCH HÀNG", sortable: true },
              { accessor: "totalAmount", title: "Tổng Số lượng", sortable: true },
              {
                accessor: "actions",
                title: "ACTION",
                render: (record: any) => (
                  <div className="flex gap-2">
                    <button className="btn btn-outline-primary btn-xs" onClick={() => handleView(record)}>
                      View
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
            fetching={loading}
            paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
          />
        </div>

        {popup.open && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <div className="bg-white rounded shadow-lg p-6 min-w-[300px]">
              <div className="mb-4 text-base font-semibold">
                {popup.action === "approve"
                  ? "Bạn có chắc muốn phê duyệt lệnh sản xuất này?"
                  : "Bạn có chắc muốn hoàn tất lệnh sản xuất này?"}
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
    </div>
  );
};

const Page = () => {
  return <ListProductionOrders />;
};

export default Page;