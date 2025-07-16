import React, { useEffect, useState } from 'react';
import { fetchProductionOutputsByOrderId, reportBrokenOutput, ProductionOutput } from './service';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';

interface ListOutputsPOProps {
  productionOrderId: number;
}

const ListOutputsPO: React.FC<ListOutputsPOProps> = ({ productionOrderId }) => {
  const [outputs, setOutputs] = useState<ProductionOutput[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOutput, setSelectedOutput] = useState<ProductionOutput | null>(null);
  const [brokenValue, setBrokenValue] = useState(0);
  const [reasonValue, setReasonValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchProductionOutputsByOrderId(productionOrderId)
      .then(setOutputs)
      .finally(() => setLoading(false));
  }, [productionOrderId]);

  const handleOpenModal = (output: ProductionOutput) => {
    setSelectedOutput(output);
    setBrokenValue(0);
    setReasonValue(output.reasonBroken || '');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOutput(null);
    setBrokenValue(0);
    setReasonValue('');
  };

  const handleSubmitBroken = async () => {
    if (!selectedOutput || brokenValue <= 0) return;
    setSubmitting(true);
    try {
      await reportBrokenOutput(selectedOutput.id, brokenValue, reasonValue);
      // Refresh outputs after reporting
      const updated = await fetchProductionOutputsByOrderId(selectedOutput.productionOrderId);
      setOutputs(updated);
      handleCloseModal();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="panel mt-6">
      <h3 className="text-lg font-semibold mb-4">Danh sách sản phẩm đã hoàn thành</h3>
      <div className="table-responsive">
        <table className="table-striped">
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên sản phẩm</th>
              <th>Số lượng</th>
              <th>Số lượng đã hoàn thành</th>
              <th>Số lượng hỏng</th>
              <th>Lí do hỏng</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-4">Đang tải dữ liệu...</td>
              </tr>
            ) : outputs.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4">Không có sản phẩm nào</td>
              </tr>
            ) : (
              outputs.map((item, idx) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td>{item.productName}</td>
                  <td>{item.amount ?? 0}</td>
                  <td>{item.done ?? 0}</td>
                  <td>{item.broken ?? 0}</td>
                  <td>{item.reasonBroken ?? ''}</td>
                  <td>
                    <button className="btn btn-sm btn-primary" onClick={() => handleOpenModal(item)}>
                      Báo hỏng
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
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
                  <DialogPanel as="div" className="panel my-8 w-full max-w-md overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                    <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                      <div className="text-lg font-bold">Báo hỏng sản phẩm</div>
                      <button type="button" className="text-white-dark hover:text-dark" onClick={handleCloseModal}>
                        &times;
                      </button>
                    </div>
                    <div className="p-5">
                      <div className="form-group">
                        <label>Số lượng hỏng</label>
                        <input type="number" className="form-control bg-white dark:bg-[#1a233a] border border-gray-300 dark:border-gray-600" min={1} value={brokenValue} onChange={e => setBrokenValue(Number(e.target.value))} />
                      </div>
                      <div className="form-group mt-4">
                        <label>Lí do hỏng</label>
                        <input type="text" className="form-control bg-white dark:bg-[#1a233a] border border-gray-300 dark:border-gray-600" value={reasonValue} onChange={e => setReasonValue(e.target.value)} />
                      </div>
                      <div className="mt-8 flex items-center justify-end">
                        <button type="button" className="btn btn-outline-danger" onClick={handleCloseModal} disabled={submitting}>
                          Huỷ
                        </button>
                        <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={handleSubmitBroken} disabled={submitting || brokenValue <= 0}>
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
    </div>
  );
};

export default ListOutputsPO;
