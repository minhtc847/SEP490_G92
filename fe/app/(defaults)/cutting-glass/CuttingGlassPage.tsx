import { useEffect, useState, useRef } from "react";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import Swal from "sweetalert2";
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { Fragment } from "react";
import sortBy from "lodash/sortBy";

// API endpoints
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://localhost:7075/api/CuttingGlassManagement";

// DTO types
interface ProductDto {
  id: number;
  productName: string;
  uom?: string;
}
interface ProductionOutputDto {
  id: number;
  productId: number;
  productName?: string;
  uom?: string;
  amount?: number;
}
interface MaterialDto {
  id: number;
  productId: number;
  productName?: string;
  quantity: number;
}
interface GlassOutputDto {
  id: number;
  productionOutputId: number;
  productName?: string;
  quantity: number;
  isDC: boolean;
  note?: string;
}

interface CuttingGlassPageProps {
  productionOrderId: string | number;
}

const CuttingGlassPage: React.FC<CuttingGlassPageProps> = ({ productionOrderId }) => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>({ outputs: [], materials: [], glassOutputs: [] });
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    isGlassOutput: false,
    productName: '',
    quantity: '',
    isDC: false,
    note: '',
    selectedMaterialId: '',
    itemType: 'material',
  });
  const [thanhPhamProducts, setThanhPhamProducts] = useState<ProductDto[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);

  // Sort states
  const [outputsSortStatus, setOutputsSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: 'id',
    direction: 'asc',
  });
  const [materialsSortStatus, setMaterialsSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: 'id',
    direction: 'asc',
  });
  const [glassOutputsSortStatus, setGlassOutputsSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: 'id',
    direction: 'asc',
  });

  // Sorted data states
  const [sortedOutputs, setSortedOutputs] = useState<any[]>([]);
  const [sortedMaterials, setSortedMaterials] = useState<any[]>([]);
  const [sortedGlassOutputs, setSortedGlassOutputs] = useState<any[]>([]);

  // Fetch danh sách thành phẩm cho autocomplete
  useEffect(() => {
    fetch(`${API_BASE}/products/thanhpham`)
      .then((res) => res.json())
      .then((data) => setThanhPhamProducts(data));
  }, []);

  // Fetch tổng hợp
  useEffect(() => {
    if (!productionOrderId) return;
    setLoading(true);
    fetch(`${API_BASE}/summary/${productionOrderId}`)
      .then((res) => res.json())
      .then((data) => {
        setSummary(data);
      })
      .finally(() => setLoading(false));
  }, [productionOrderId]);

  // Sort effects
  useEffect(() => {
    const data = sortBy(summary.outputs, outputsSortStatus.columnAccessor);
    setSortedOutputs(outputsSortStatus.direction === 'desc' ? data.reverse() : data);
  }, [summary.outputs, summary.glassOutputs, outputsSortStatus]);

  useEffect(() => {
    const data = sortBy(summary.materials, materialsSortStatus.columnAccessor);
    setSortedMaterials(materialsSortStatus.direction === 'desc' ? data.reverse() : data);
  }, [summary.materials, materialsSortStatus]);

  useEffect(() => {
    const data = sortBy(summary.glassOutputs, glassOutputsSortStatus.columnAccessor);
    setSortedGlassOutputs(glassOutputsSortStatus.direction === 'desc' ? data.reverse() : data);
  }, [summary.glassOutputs, glassOutputsSortStatus]);

  // Thêm kính dư tự do hoặc nguyên vật liệu/thành phẩm
  const handleAdd = async () => {
    if (!selectedProduct && !form.productName) {
      Swal.fire({ title: 'Vui lòng chọn hoặc nhập tên sản phẩm', icon: 'warning' });
      return;
    }
    // Validation cho bán thành phẩm - phải chọn từ thành phẩm mục tiêu
    if (form.itemType === 'banThanhPham' && !selectedProduct) {
      Swal.fire({ title: 'Vui lòng chọn thành phẩm mục tiêu từ danh sách', icon: 'warning' });
      return;
    }
    if (!form.quantity) {
      Swal.fire({ title: 'Vui lòng nhập số lượng', icon: 'warning' });
      return;
    }
    try {
      let product = selectedProduct;
      // Nếu sản phẩm chưa tồn tại, tạo mới
      if (!product) {
        const productRes = await fetch(`${API_BASE}/create-product`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productCode: form.productName,
            productName: form.productName,
            productType: "Thành phẩm",
            uom: "m2"
          }),
        });
        product = await productRes.json();
      }
      if (!product) return;
      // --- CHECK DUPLICATE LOGIC ---
      if (form.itemType === 'kinhDu') {
        // Bắt buộc phải chọn nguyên vật liệu
        if (!form.selectedMaterialId || isNaN(Number(form.selectedMaterialId))) {
          Swal.fire({ title: 'Vui lòng chọn nguyên vật liệu!', icon: 'warning' });
          return;
        }
        // Kiểm tra duplicate trong glassOutputs (theo productId và cutGlassInvoiceMaterialId)
        let duplicate = summary.glassOutputs.find((g: any) => 
          (g.productId === product.id || g.productName === product.productName) && 
          (g.cutGlassInvoiceMaterialId === Number(form.selectedMaterialId) || g.materialId === Number(form.selectedMaterialId)) &&
          g.isDC === true // Chỉ check duplicate cho kính dư (isDC = true)
        );
        if (!duplicate) {
          duplicate = summary.glassOutputs.find((g: any) => g.productName === product.productName && g.isDC === true);
        }
        if (duplicate) {
          const result = await Swal.fire({
            title: 'Đã tồn tại kính dư này. Bạn có muốn cộng dồn số lượng vào sản phẩm cũ không?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Cộng dồn',
            cancelButtonText: 'Không',
          });
          if (result.isConfirmed) {
            await fetch(`${API_BASE}/update-cut-glass-output/${duplicate.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                quantity: Number(duplicate.quantity) + Number(form.quantity),
                note: form.note,
              }),
            });
            Swal.fire({ title: 'Cộng dồn thành công!', icon: 'success' });
            setShowModal(false);
            setForm({ isGlassOutput: false, productName: '', quantity: '', isDC: false, note: '', selectedMaterialId: '', itemType: 'material' });
            setSelectedProduct(null);
            setProductSearch("");
            fetch(`${API_BASE}/summary/${productionOrderId}`)
              .then((res) => res.json())
              .then((data) => setSummary(data));
            return;
          } else {
            return;
          }
        }
        // Tạo kính dư
        let productionOutputId = null;
        if (product && product.id && thanhPhamProducts.some(p => p.id === product!.id)) {
          const foundOutput = summary.outputs.find((o: any) => o.productId === product!.id);
          if (foundOutput) {
            productionOutputId = foundOutput.id;
          }
        }
        if (!productionOutputId) {
          const outputRes = await fetch(`${API_BASE}/create-production-output`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: product!.id,
              amount: form.quantity,
              productionOrderId: null, // revert lại null
            }),
          });
          const output = await outputRes.json();
          productionOutputId = output.id;
        }
        await fetch(`${API_BASE}/create-cut-glass-output`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cutGlassInvoiceMaterialId: Number(form.selectedMaterialId),
            productionOutputId: productionOutputId,
            quantity: form.quantity,
            isDC: true,
            note: form.note,
          }),
        });
      } else if (form.itemType === 'banThanhPham') {
        // Bắt buộc phải chọn nguyên vật liệu
        if (!form.selectedMaterialId || isNaN(Number(form.selectedMaterialId))) {
          Swal.fire({ title: 'Vui lòng chọn nguyên vật liệu!', icon: 'warning' });
          return;
        }
        // Check duplicate cho bán thành phẩm
        const duplicateBanThanhPham = summary.glassOutputs.find((g: any) => 
          (g.productId === product.id || g.productName === product.productName) && 
          g.isDC === false // Chỉ check duplicate cho bán thành phẩm (isDC = false)
        );
        if (duplicateBanThanhPham) {
          const result = await Swal.fire({
            title: 'Đã tồn tại bán thành phẩm này. Bạn có muốn cộng dồn số lượng vào sản phẩm cũ không?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Cộng dồn',
            cancelButtonText: 'Không',
          });
          if (result.isConfirmed) {
            await fetch(`${API_BASE}/update-cut-glass-output/${duplicateBanThanhPham.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                quantity: Number(duplicateBanThanhPham.quantity) + Number(form.quantity),
                note: form.note,
              }),
            });
            Swal.fire({ title: 'Cộng dồn thành công!', icon: 'success' });
            setShowModal(false);
            setForm({ isGlassOutput: false, productName: '', quantity: '', isDC: false, note: '', selectedMaterialId: '', itemType: 'material' });
            setSelectedProduct(null);
            setProductSearch("");
            fetch(`${API_BASE}/summary/${productionOrderId}`)
              .then((res) => res.json())
              .then((data) => setSummary(data));
            return;
          } else {
            return;
          }
        }
        // Tạo bán thành phẩm
        let productionOutputId = null;
        // Nếu chọn sản phẩm đã có, tìm ProductionOutput tương ứng
        if (product && product.id && summary.outputs.some((o: any) => o.productId === product!.id)) {
          // Tìm output trong summary.outputs
          const foundOutput = summary.outputs.find((o: any) => o.productId === product!.id);
          if (foundOutput) {
            productionOutputId = foundOutput.id;
          }
        }
        // Nếu không tìm thấy ProductionOutput, tạo mới với ProductionOrderId=null
        if (!productionOutputId) {
          const outputRes = await fetch(`${API_BASE}/create-production-output`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: product!.id,
              amount: form.quantity,
              productionOrderId: null,
            }),
          });
          const output = await outputRes.json();
          productionOutputId = output.id;
        }
        // Tạo CutGlassInvoiceOutput cho bán thành phẩm (có liên kết với material)
        await fetch(`${API_BASE}/create-cut-glass-output`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cutGlassInvoiceMaterialId: Number(form.selectedMaterialId),
            productionOutputId: productionOutputId,
            quantity: form.quantity,
            isDC: false,
            note: form.note,
          }),
        });
      } else {
        const duplicate = summary.materials.find((m: any) => m.productId === product.id);
        if (duplicate) {
          const result = await Swal.fire({
            title: 'Nguyên vật liệu này đã tồn tại. Bạn có muốn cộng dồn số lượng vào vật tư cũ không?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Cộng dồn',
            cancelButtonText: 'Không',
          });
          if (result.isConfirmed) {
            await fetch(`${API_BASE}/update-material/${duplicate.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                quantity: Number(duplicate.quantity) + Number(form.quantity),
                note: form.note,
              }),
            });
            Swal.fire({ title: 'Cộng dồn thành công!', icon: 'success' });
            setShowModal(false);
            setForm({ isGlassOutput: false, productName: '', quantity: '', isDC: false, note: '', selectedMaterialId: '', itemType: 'material' });
            setSelectedProduct(null);
            setProductSearch("");
            fetch(`${API_BASE}/summary/${productionOrderId}`)
              .then((res) => res.json())
              .then((data) => setSummary(data));
            return;
          } else {
            return;
          }
        }
        const materialRes = await fetch(`${API_BASE}/create-material`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productionOrderId: Number(productionOrderId),
            productId: product!.id,
            quantity: Number(form.quantity),
            note: form.note || ''
          }),
        });
        await materialRes.json();
      }
      Swal.fire({ title: 'Thêm thành công!', icon: 'success' });
      setShowModal(false);
      setForm({ isGlassOutput: false, productName: '', quantity: '', isDC: false, note: '', selectedMaterialId: '', itemType: 'material' });
      setSelectedProduct(null);
      setProductSearch("");
      fetch(`${API_BASE}/summary/${productionOrderId}`)
        .then((res) => res.json())
        .then((data) => setSummary(data));
    } catch (e) {
      Swal.fire({ title: 'Lỗi server!', icon: 'error' });
    }
  };

  // Edit item
  const handleEdit = (item: any, type: 'material' | 'glassOutput') => {
    setEditingItem(item);
    setIsEditing(true);
    setForm({
      isGlassOutput: type === 'glassOutput',
      productName: item.productName || '',
      quantity: item.quantity?.toString() || '',
      isDC: type === 'glassOutput' ? item.isDC : false,
      note: item.note || '',
      selectedMaterialId: '',
      itemType: type === 'glassOutput' ? 'kinhDu' : 'material',
    });
    setShowModal(true);
  };

  // Update item
  const handleUpdate = async () => {
    if (!editingItem) return;
    try {
      if (editingItem.hasOwnProperty('isDC')) {
        await fetch(`${API_BASE}/update-cut-glass-output/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quantity: Number(form.quantity),
            note: form.note,
          }),
        });
      } else {
        await fetch(`${API_BASE}/update-material/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quantity: Number(form.quantity),
            note: form.note,
          }),
        });
      }
      Swal.fire({ title: 'Cập nhật thành công!', icon: 'success' });
      setShowModal(false);
      setEditingItem(null);
      setIsEditing(false);
      setForm({ isGlassOutput: false, productName: '', quantity: '', isDC: false, note: '', selectedMaterialId: '', itemType: 'material' });
      setSelectedProduct(null);
      setProductSearch("");
      fetch(`${API_BASE}/summary/${productionOrderId}`)
        .then((res) => res.json())
        .then((data) => {
          setSummary(data);
        });
    } catch (e) {
      Swal.fire({ title: 'Lỗi server!', icon: 'error' });
    }
  };

  // Delete item
  const handleDelete = async (item: any, type: 'material' | 'glassOutput') => {
    const result = await Swal.fire({
      title: 'Bạn có chắc chắn muốn xóa?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });
    if (result.isConfirmed) {
      try {
        if (type === 'glassOutput') {
          await fetch(`${API_BASE}/delete-cut-glass-output/${item.id}`, {
            method: 'DELETE',
          });
        } else {
          await fetch(`${API_BASE}/delete-material/${item.id}`, {
            method: 'DELETE',
          });
        }
        Swal.fire({ title: 'Xóa thành công!', icon: 'success' });
        fetch(`${API_BASE}/summary/${productionOrderId}`)
          .then((res) => res.json())
          .then((data) => setSummary(data));
      } catch (e) {
        Swal.fire({ title: 'Lỗi server!', icon: 'error' });
      }
    }
  };

  // Sửa sortedGlassOutputs để lọc theo selectedMaterialId (hiện cả kính dư và bán thành phẩm)
  const filteredGlassOutputs = selectedMaterialId
    ? sortedGlassOutputs.filter((g: any) => (g.cutGlassInvoiceMaterialId ?? g.materialId) === selectedMaterialId)
    : sortedGlassOutputs;

  return (
    <div>
      <h5 className="mb-5 text-lg font-semibold dark:text-white-light">Phiếu cắt kính - Lệnh sản xuất #{productionOrderId}</h5>
      <div className="mb-4 flex justify-end">
        <button className="btn btn-primary" onClick={() => {
          setShowModal(true);
          setIsEditing(false);
          setEditingItem(null);
          setForm({ isGlassOutput: false, productName: '', quantity: '', isDC: false, note: '', selectedMaterialId: '', itemType: 'material' });
          setSelectedProduct(null);
          setProductSearch("");
        }}>
          Thêm thành phẩm / kính dư / nguyên vật liệu
        </button>
      </div>
      <div className="datatables">
        {/* <h6 className="font-bold mb-2">Thành phẩm mục tiêu</h6>
        <DataTable
          noRecordsText={loading ? 'Đang tải...' : 'Không có thành phẩm mục tiêu nào'}
          highlightOnHover
          className="table-hover whitespace-nowrap"
          records={sortedOutputs}
          columns={[
            { accessor: 'id', title: 'ID', sortable: true },
            { accessor: 'productName', title: 'Tên thành phẩm mục tiêu', sortable: true },
            { accessor: 'uom', title: 'Đơn vị', sortable: true },
            { accessor: 'amount', title: 'Số lượng', sortable: true },
          ]}
          sortStatus={outputsSortStatus}
          onSortStatusChange={setOutputsSortStatus}
        /> */}
        <h6 className="font-bold mt-6 mb-2">Nguyên vật liệu</h6>
        <DataTable
          noRecordsText={loading ? 'Đang tải...' : 'Không có nguyên vật liệu nào'}
          highlightOnHover
          className="table-hover whitespace-nowrap"
          records={sortedMaterials}
          columns={[
            { accessor: 'id', title: 'ID', sortable: true },
            { accessor: 'productName', title: 'Tên nguyên vật liệu', sortable: true },
            { accessor: 'quantity', title: 'Số lượng', sortable: true },
            { accessor: 'note', title: 'Ghi chú', sortable: true },
            { accessor: 'createdAt', title: 'Ngày tạo', render: (item: any) => item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : '' },
            { accessor: 'updatedAt', title: 'Ngày cập nhật', render: (item: any) => item.updatedAt ? new Date(item.updatedAt).toLocaleString('vi-VN') : '' },
            {
              accessor: 'actions',
              title: 'Thao tác',
              render: (item: any) => (
                <div className="flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleEdit(item, 'material')}
                  >
                    Sửa
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(item, 'material')}
                  >
                    Xóa
                  </button>
                </div>
              ),
            },
          ]}
          sortStatus={materialsSortStatus}
          onSortStatusChange={setMaterialsSortStatus}
          rowClassName={(row: any) => row.id === selectedMaterialId ? 'bg-blue-100 dark:bg-blue-900' : ''}
          onRowClick={(row: any) => setSelectedMaterialId(row.id)}
        />
        <h6 className="font-bold mt-6 mb-2">Bán thành phẩm/ Kính dư</h6>
        <DataTable
          noRecordsText={loading ? 'Đang tải...' : 'Không có bán thành phẩm/ kính dư nào'}
          highlightOnHover
          className="table-hover whitespace-nowrap"
          records={filteredGlassOutputs}
          columns={[
            { accessor: 'id', title: 'ID', sortable: true },
            { accessor: 'productName', title: 'Tên bán thành phẩm/ kính dư', sortable: true },
            { 
              accessor: 'isDC', 
              title: 'Loại', 
              sortable: true,
              render: (item: any) => (
                <span className={`badge ${item.isDC ? 'badge-outline-warning' : 'badge-outline-success'}`}>
                  {item.isDC ? 'Kính dư' : 'Bán thành phẩm'}
                </span>
              ),
            },
            { accessor: 'quantity', title: 'Số lượng', sortable: true },
            { accessor: 'note', title: 'Ghi chú', sortable: true },
            { accessor: 'createdAt', title: 'Ngày tạo', render: (item: any) => item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : '' },
            { accessor: 'updatedAt', title: 'Ngày cập nhật', render: (item: any) => item.updatedAt ? new Date(item.updatedAt).toLocaleString('vi-VN') : '' },
            {
              accessor: 'actions',
              title: 'Thao tác',
              render: (item: any) => (
                <div className="flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleEdit(item, 'glassOutput')}
                  >
                    Sửa
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(item, 'glassOutput')}
                  >
                    Xóa
                  </button>
                </div>
              ),
            },
          ]}
          sortStatus={glassOutputsSortStatus}
          onSortStatusChange={setGlassOutputsSortStatus}
        />
      </div>
      {/* Modal thêm mới */}
      <Transition appear show={showModal} as={Fragment}>
        <Dialog as="div" open={showModal} onClose={() => setShowModal(false)}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0" />
          </TransitionChild>
          <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
            <div className="flex min-h-screen items-start justify-center px-4">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel as="div" className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                  <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                    <div className="text-lg font-bold">{isEditing ? 'Sửa' : 'Thêm mới'}</div>
                    <button type="button" className="text-white-dark hover:text-dark" onClick={() => setShowModal(false)}>
                      Đóng
                    </button>
                  </div>
                  <div className="p-5">
                    {/* 1. Loại */}
                    {!isEditing && (
                      <div className="mb-4">
                        <label className="block mb-1">Loại</label>
                        <div className="flex gap-2">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="itemType"
                              value="material"
                              checked={form.itemType === 'material'}
                              onChange={() => setForm(f => ({ ...f, itemType: 'material' }))}
                              className="form-radio"
                            />
                            Nguyên vật liệu
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="itemType"
                              value="banThanhPham"
                              checked={form.itemType === 'banThanhPham'}
                              onChange={() => setForm(f => ({ ...f, itemType: 'banThanhPham' }))}
                              className="form-radio"
                            />
                            Bán thành phẩm
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="itemType"
                              value="kinhDu"
                              checked={form.itemType === 'kinhDu'}
                              onChange={() => setForm(f => ({ ...f, itemType: 'kinhDu' }))}
                              className="form-radio"
                            />
                            Kính dư
                          </label>
                        </div>
                      </div>
                    )}
                    {/* 2. Chọn nguyên vật liệu */}
                    {!isEditing && (form.itemType === 'kinhDu' || form.itemType === 'banThanhPham') && (
                      <div className="mb-4">
                        <label className="block mb-1">Chọn nguyên vật liệu</label>
                        <select
                          className="form-input"
                          value={form.selectedMaterialId}
                          onChange={(e) => setForm((f) => ({ ...f, selectedMaterialId: e.target.value }))}
                        >
                          <option value="">-- Chọn nguyên vật liệu --</option>
                          {summary.materials.map((m: any) => (
                            <option key={m.id} value={m.id}>{m.ProductName || m.productName}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    {/* 3. Tên sản phẩm / kính dư / nguyên vật liệu hoặc Chọn thành phẩm mục tiêu */}
                    {!isEditing && (
                      <div className="mb-4">
                        <label className="block mb-1">
                          {form.itemType === 'banThanhPham' ? 'Chọn thành phẩm mục tiêu' : 'Tên sản phẩm / kính dư / nguyên vật liệu'}
                        </label>
                        {form.itemType === 'banThanhPham' ? (
                          <select
                            className="form-input"
                            value={productSearch}
                            onChange={(e) => {
                              setProductSearch(e.target.value);
                              setForm(f => ({ ...f, productName: e.target.value }));
                              const found = summary.outputs.find((o: any) => o.productName === e.target.value);
                              setSelectedProduct(found ? { id: found.productId, productName: found.productName, uom: found.uom } : null);
                            }}
                          >
                            <option value="">-- Chọn thành phẩm mục tiêu --</option>
                            {summary.outputs.map((output: any) => (
                              <option key={output.id} value={output.productName}>
                                {output.productName} ({output.uom})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            ref={searchInputRef}
                            type="text"
                            className="form-input"
                            value={productSearch}
                            onChange={e => {
                              setProductSearch(e.target.value);
                              setForm(f => ({ ...f, productName: e.target.value }));
                              const found = thanhPhamProducts.find(p => p.productName?.toLowerCase() === e.target.value.toLowerCase());
                              setSelectedProduct(found || null);
                            }}
                            list="product-list"
                            placeholder="Nhập hoặc chọn tên thành phẩm"
                          />
                        )}
                        <datalist id="product-list">
                          {thanhPhamProducts.filter(p =>
                            !productSearch || p.productName?.toLowerCase().includes(productSearch.toLowerCase())
                          ).map(p => (
                            <option key={p.id} value={p.productName} />
                          ))}
                        </datalist>
                      </div>
                    )}
                    {/* Các trường còn lại giữ nguyên */}
                    <div className="mb-4">
                      <label className="block mb-1">Số lượng</label>
                      <input
                        type="number"
                        className="form-input"
                        value={form.quantity}
                        onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block mb-1">Ghi chú</label>
                      <input
                        type="text"
                        className="form-input"
                        value={form.note}
                        onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                      />
                    </div>
                    <div className="flex justify-end">
                      <button className="btn btn-primary" onClick={isEditing ? handleUpdate : handleAdd}>
                        {isEditing ? 'Cập nhật' : 'Thêm'}
                      </button>
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default CuttingGlassPage; 