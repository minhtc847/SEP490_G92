import React, { useEffect, useState } from 'react';
import { fetchProductionOutputsByOrderId, fetchProductionDefectsByOrderId, createDefectReport, updateDefectReport, ProductionOutput, ProductionDefect, UpdateDefectReport } from './service';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';

interface ListOutputsPOProps {
  productionOrderId: number;
}

const ListOutputsPO: React.FC<ListOutputsPOProps> = ({ productionOrderId }) => {
  const [outputs, setOutputs] = useState<ProductionOutput[]>([]);
  const [defects, setDefects] = useState<ProductionDefect[]>([]);
  const [loading, setLoading] = useState(true);
  const [defectsLoading, setDefectsLoading] = useState(true);
  
  // Create defect modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [defectQuantity, setDefectQuantity] = useState(0);
  const [defectType, setDefectType] = useState('');
  const [defectStage, setDefectStage] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit defect modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDefect, setEditingDefect] = useState<ProductionDefect | null>(null);
  const [editDefectQuantity, setEditDefectQuantity] = useState(0);
  const [editDefectType, setEditDefectType] = useState('');
  const [editDefectStage, setEditDefectStage] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Predefined options for dropdowns
  const defectTypes = [
    'Lỗi nguyên vật liệu',
    'Lỗi quy trình sản xuất', 
    'Lỗi thiết bị',
    'Lỗi con người',
    'Lỗi khác'
  ];

  const defectStages = [
    'Chuẩn bị nguyên vật liệu',
    'Gia công', 
    'Lắp ráp',
    'Kiểm tra chất lượng',
    'Đóng gói',
    'Khác'
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setDefectsLoading(true);
      
      try {
        // Fetch outputs first (priority)
        const outputsData = await fetchProductionOutputsByOrderId(productionOrderId);
        setOutputs(outputsData);
        setLoading(false);
        
        // Then fetch defects separately
        try {
          const defectsData = await fetchProductionDefectsByOrderId(productionOrderId);
          setDefects(defectsData);
        } catch (defectsError) {
          console.warn('Failed to fetch defects:', defectsError);
          setDefects([]); // Set empty array if defects API fails
        }
        setDefectsLoading(false);
        
      } catch (error) {
        console.error('Error fetching outputs:', error);
        setOutputs([]);
        setLoading(false);
        setDefectsLoading(false);
      }
    };

    fetchData();
  }, [productionOrderId]);

  const handleOpenModal = () => {
    setSelectedProductId(null);
    setDefectQuantity(0);
    setDefectType('');
    setDefectStage('');
    setNote('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProductId(null);
    setDefectQuantity(0);
    setDefectType('');
    setDefectStage('');
    setNote('');
  };

  const handleSubmitDefect = async () => {
    if (!selectedProductId || defectQuantity <= 0 || !defectType || !defectStage) return;
    
    setSubmitting(true);
    try {
      await createDefectReport({
        productionOrderId,
        productId: selectedProductId,
        quantity: defectQuantity,
        defectType,
        defectStage,
        note
      });
      
      // Refresh data after reporting
      const [updatedOutputs, updatedDefects] = await Promise.all([
        fetchProductionOutputsByOrderId(productionOrderId),
        fetchProductionDefectsByOrderId(productionOrderId)
      ]);
      
      setOutputs(updatedOutputs);
      setDefects(updatedDefects);
      handleCloseModal();
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditModal = (defect: ProductionDefect) => {
    setEditingDefect(defect);
    setEditDefectQuantity(defect.quantity ?? 0);
    setEditDefectType(defect.defectType ?? '');
    setEditDefectStage(defect.defectStage ?? '');
    setEditNote(defect.note ?? '');
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingDefect(null);
    setEditDefectQuantity(0);
    setEditDefectType('');
    setEditDefectStage('');
    setEditNote('');
  };

  const handleSubmitEditDefect = async () => {
    if (!editingDefect || editDefectQuantity <= 0 || !editDefectType || !editDefectStage) return;
    
    setEditSubmitting(true);
    try {
      await updateDefectReport(editingDefect.id, {
        quantity: editDefectQuantity,
        defectType: editDefectType,
        defectStage: editDefectStage,
        note: editNote
      });
      
      // Refresh data after updating
      const [updatedOutputs, updatedDefects] = await Promise.all([
        fetchProductionOutputsByOrderId(productionOrderId),
        fetchProductionDefectsByOrderId(productionOrderId)
      ]);
      
      setOutputs(updatedOutputs);
      setDefects(updatedDefects);
      handleCloseEditModal();
    } finally {
      setEditSubmitting(false);
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  return (
    <div className="panel mt-6">
      {/* Bảng sản phẩm đã hoàn thành */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Danh sách sản phẩm đã hoàn thành</h3>
        <button 
          className="btn btn-primary" 
          onClick={handleOpenModal}
          disabled={outputs.length === 0}
        >
          Báo hỏng
        </button>
      </div>
      <div className="table-responsive mb-8">
        <table className="table-striped">
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên sản phẩm</th>
              <th>Số lượng</th>
              <th>Số lượng đã hoàn thành</th>
              <th>Số lượng hỏng</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-4">Đang tải dữ liệu...</td>
              </tr>
            ) : outputs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4">Không có sản phẩm nào</td>
              </tr>
            ) : (
              outputs.map((item, idx) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td>{item.productName}</td>
                  <td>{item.amount ?? 0}</td>
                  <td>{item.done ?? 0}</td>
                  <td>{item.broken ?? 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bảng báo cáo lỗi */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-4">Danh sách báo cáo lỗi</h3>
      </div>
      <div className="table-responsive">
        <table className="table-striped">
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên sản phẩm</th>
              <th>Số lượng lỗi</th>
              <th>Loại lỗi</th>
              <th>Giai đoạn lỗi</th>
              <th>Ghi chú</th>
              <th>Thời gian báo cáo</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {defectsLoading ? (
              <tr>
                <td colSpan={8} className="text-center py-4">Đang tải dữ liệu...</td>
              </tr>
            ) : defects.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-4">Chưa có báo cáo lỗi nào</td>
              </tr>
            ) : (
              defects.map((defect, idx) => (
                <tr key={defect.id}>
                  <td>{idx + 1}</td>
                  <td>{defect.productName}</td>
                  <td>{defect.quantity ?? 0}</td>
                  <td>{defect.defectType}</td>
                  <td>{defect.defectStage}</td>
                  <td>{defect.note || '-'}</td>
                  <td>{formatDateTime(defect.reportedAt)}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleOpenEditModal(defect)}
                      title="Chỉnh sửa báo cáo lỗi"
                    >
                      Sửa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal báo hỏng */}
      {showModal && (
        <Transition appear show={showModal} as={Fragment}>
          <Dialog as="div" open={showModal} onClose={handleCloseModal}>
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
                      <div className="text-lg font-bold">Báo cáo lỗi sản phẩm</div>
                      <button type="button" className="text-white-dark hover:text-dark" onClick={handleCloseModal}>
                        &times;
                      </button>
                    </div>
                    <div className="p-5">
                      <div className="form-group">
                        <label className="block text-sm font-medium mb-2">Chọn sản phẩm *</label>
                        <select 
                          className="form-control bg-white dark:bg-[#1a233a] border border-gray-300 dark:border-gray-600"
                          value={selectedProductId || ''}
                          onChange={e => setSelectedProductId(Number(e.target.value) || null)}
                        >
                          <option value="">-- Chọn sản phẩm --</option>
                          {outputs.map(output => (
                            <option key={output.id} value={output.productId}>
                              {output.productName} (Hoàn thành: {output.done ?? 0})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group mt-4">
                        <label className="block text-sm font-medium mb-2">Số lượng lỗi *</label>
                        <input 
                          type="number" 
                          className="form-control bg-white dark:bg-[#1a233a] border border-gray-300 dark:border-gray-600" 
                          min={1} 
                          value={defectQuantity} 
                          onChange={e => setDefectQuantity(Number(e.target.value))} 
                          placeholder="Nhập số lượng sản phẩm lỗi"
                        />
                      </div>

                      <div className="form-group mt-4">
                        <label className="block text-sm font-medium mb-2">Loại lỗi *</label>
                        <select 
                          className="form-control bg-white dark:bg-[#1a233a] border border-gray-300 dark:border-gray-600"
                          value={defectType}
                          onChange={e => setDefectType(e.target.value)}
                        >
                          <option value="">-- Chọn loại lỗi --</option>
                          {defectTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group mt-4">
                        <label className="block text-sm font-medium mb-2">Giai đoạn lỗi *</label>
                        <select 
                          className="form-control bg-white dark:bg-[#1a233a] border border-gray-300 dark:border-gray-600"
                          value={defectStage}
                          onChange={e => setDefectStage(e.target.value)}
                        >
                          <option value="">-- Chọn giai đoạn --</option>
                          {defectStages.map(stage => (
                            <option key={stage} value={stage}>{stage}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group mt-4">
                        <label className="block text-sm font-medium mb-2">Ghi chú</label>
                        <textarea 
                          className="form-control bg-white dark:bg-[#1a233a] border border-gray-300 dark:border-gray-600" 
                          rows={3}
                          value={note} 
                          onChange={e => setNote(e.target.value)} 
                          placeholder="Mô tả chi tiết về lỗi..."
                        />
                      </div>

                      <div className="mt-8 flex items-center justify-end">
                        <button type="button" className="btn btn-outline-danger" onClick={handleCloseModal} disabled={submitting}>
                          Hủy
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-primary ltr:ml-4 rtl:mr-4" 
                          onClick={handleSubmitDefect} 
                          disabled={submitting || defectQuantity <= 0 || !selectedProductId || !defectType || !defectStage}
                        >
                          {submitting ? 'Đang gửi...' : 'Xác nhận'}
                        </button>
                      </div>
                    </div>
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </Dialog>
        </Transition>
      )}

      {/* Modal sửa báo cáo lỗi */}
      {showEditModal && (
        <Transition appear show={showEditModal} as={Fragment}>
          <Dialog as="div" open={showEditModal} onClose={handleCloseEditModal}>
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
                      <div className="text-lg font-bold">Chỉnh sửa báo cáo lỗi</div>
                      <button type="button" className="text-white-dark hover:text-dark" onClick={handleCloseEditModal}>
                        &times;
                      </button>
                    </div>
                    <div className="p-5">
                      <div className="form-group">
                        <label className="block text-sm font-medium mb-2">Sản phẩm</label>
                        <input 
                          type="text" 
                          className="form-control bg-gray-100 dark:bg-[#1a233a] border border-gray-300 dark:border-gray-600 cursor-not-allowed" 
                          value={editingDefect?.productName || ''}
                          readOnly
                        />
                        <div className="text-xs text-gray-500 mt-1">Không thể thay đổi sản phẩm</div>
                      </div>

                      <div className="form-group mt-4">
                        <label className="block text-sm font-medium mb-2">Số lượng lỗi *</label>
                        <input 
                          type="number" 
                          className="form-control bg-white dark:bg-[#1a233a] border border-gray-300 dark:border-gray-600" 
                          min={1} 
                          value={editDefectQuantity} 
                          onChange={e => setEditDefectQuantity(Number(e.target.value))} 
                          placeholder="Nhập số lượng sản phẩm lỗi"
                        />
                      </div>

                      <div className="form-group mt-4">
                        <label className="block text-sm font-medium mb-2">Loại lỗi *</label>
                        <select 
                          className="form-control bg-white dark:bg-[#1a233a] border border-gray-300 dark:border-gray-600"
                          value={editDefectType}
                          onChange={e => setEditDefectType(e.target.value)}
                        >
                          <option value="">-- Chọn loại lỗi --</option>
                          {defectTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group mt-4">
                        <label className="block text-sm font-medium mb-2">Giai đoạn lỗi *</label>
                        <select 
                          className="form-control bg-white dark:bg-[#1a233a] border border-gray-300 dark:border-gray-600"
                          value={editDefectStage}
                          onChange={e => setEditDefectStage(e.target.value)}
                        >
                          <option value="">-- Chọn giai đoạn --</option>
                          {defectStages.map(stage => (
                            <option key={stage} value={stage}>{stage}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group mt-4">
                        <label className="block text-sm font-medium mb-2">Ghi chú</label>
                        <textarea 
                          className="form-control bg-white dark:bg-[#1a233a] border border-gray-300 dark:border-gray-600" 
                          rows={3}
                          value={editNote} 
                          onChange={e => setEditNote(e.target.value)} 
                          placeholder="Mô tả chi tiết về lỗi..."
                        />
                      </div>

                      <div className="form-group mt-4">
                        <div className="text-xs text-blue-600">
                          <strong>Lưu ý:</strong> Thời gian báo cáo sẽ được cập nhật thành thời điểm hiện tại khi lưu thay đổi.
                        </div>
                      </div>

                      <div className="mt-8 flex items-center justify-end">
                        <button type="button" className="btn btn-outline-danger" onClick={handleCloseEditModal} disabled={editSubmitting}>
                          Hủy
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-primary ltr:ml-4 rtl:mr-4" 
                          onClick={handleSubmitEditDefect} 
                          disabled={editSubmitting || editDefectQuantity <= 0 || !editDefectType || !editDefectStage}
                        >
                          {editSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
                        </button>
                      </div>
                    </div>
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </Dialog>
        </Transition>
      )}
    </div>
  );
};

export default ListOutputsPO;
