'use client'

import { useState, useEffect } from "react"
import { chemicalExportService, ChemicalExportDto } from "@/services/chemicalExportService"
import IconEye from "@/components/icon/icon-eye"
import IconTrash from "@/components/icon/icon-trash"
import { Fragment } from "react"
import { Transition, Dialog, DialogPanel, TransitionChild } from '@headlessui/react'
import IconX from "@/components/icon/icon-x"

interface ListChemicalExportProps {
  productionOrderId: number
}

interface ChemicalExportDetailModalProps {
  chemicalExport: ChemicalExportDto | null
  isOpen: boolean
  onClose: () => void
}

const ChemicalExportDetailModal: React.FC<ChemicalExportDetailModalProps> = ({ 
  chemicalExport, 
  isOpen, 
  onClose 
}) => {
  if (!chemicalExport) return null

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" open={isOpen} onClose={onClose} className="relative z-50">
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[black]/60" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center px-4 py-8">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="panel w-full max-w-4xl rounded-lg p-5 text-black dark:text-white-dark bg-white dark:bg-[#121c2c]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Chi tiết phiếu xuất hóa chất</h3>
                  <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                    <IconX />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Thông tin chính */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Sản phẩm:</label>
                      <span className="text-sm">{chemicalExport.productName || 'N/A'}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Số lượng:</label>
                      <span className="text-sm">{chemicalExport.quantity} {chemicalExport.uom}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Ngày tạo:</label>
                      <span className="text-sm">{new Date(chemicalExport.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Ghi chú:</label>
                      <span className="text-sm">{chemicalExport.note || 'Không có'}</span>
                    </div>
                  </div>

                  {/* Danh sách nguyên vật liệu */}
                  <div>
                    <h4 className="font-medium mb-2">Danh sách nguyên vật liệu</h4>
                    {chemicalExport.details && chemicalExport.details.length > 0 ? (
                      <table className="w-full border rounded shadow text-sm">
                        <thead className="bg-[#edf0ff]">
                          <tr>
                            <th className="border p-2 text-left">STT</th>
                            <th className="border p-2 text-left">Tên nguyên vật liệu</th>
                            <th className="border p-2 text-left">Số lượng</th>
                            <th className="border p-2 text-left">Đơn vị</th>
                            <th className="border p-2 text-left">Ghi chú</th>
                          </tr>
                        </thead>
                        <tbody>
                          {chemicalExport.details.map((detail, index) => (
                            <tr key={detail.id} className="hover:bg-gray-50">
                              <td className="border p-2">{index + 1}</td>
                              <td className="border p-2">{detail.productName || 'N/A'}</td>
                              <td className="border p-2">{detail.quantity}</td>
                              <td className="border p-2">{detail.uom || 'N/A'}</td>
                              <td className="border p-2">{detail.note || 'Không có'}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-[#f4f7ff]">
                            <td colSpan={2} className="border p-2 text-right font-semibold">
                              Tổng:
                            </td>
                            <td className="border p-2 font-semibold">
                              {chemicalExport.details.reduce((sum, detail) => sum + detail.quantity, 0)}
                            </td>
                            <td colSpan={2} className="border p-2"></td>
                          </tr>
                        </tfoot>
                      </table>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        Không có nguyên vật liệu nào
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button 
                    className="btn btn-outline-primary" 
                    onClick={onClose}
                  >
                    Đóng
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

const ListChemicalExport: React.FC<ListChemicalExportProps> = ({ productionOrderId }) => {
  const [chemicalExports, setChemicalExports] = useState<ChemicalExportDto[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedExport, setSelectedExport] = useState<ChemicalExportDto | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isGluePouringOrder, setIsGluePouringOrder] = useState(false)

  useEffect(() => {
    loadChemicalExports()
    checkProductionOrderType()
  }, [productionOrderId])

  const checkProductionOrderType = async () => {
    try {
      // This would need a separate API endpoint to get production order details
      // For now, we'll check based on the chemical exports data
      // In a real implementation, you'd want to fetch the production order type
      const data = await chemicalExportService.getChemicalExportsByProductionOrder(productionOrderId)
      // This is a simplified check - in reality you'd want to get the production order type from the backend
      setIsGluePouringOrder(false) // This would be set based on actual production order type
    } catch (error) {
      console.error('Error checking production order type:', error)
    }
  }

  const loadChemicalExports = async () => {
    try {
      setLoading(true)
      const data = await chemicalExportService.getChemicalExportsByProductionOrder(productionOrderId)
      setChemicalExports(data)
    } catch (error) {
      console.error('Error loading chemical exports:', error)
      alert('Lỗi khi tải danh sách phiếu xuất hóa chất!')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckCompletion = async () => {
    try {
      const result = await chemicalExportService.checkAndUpdateProductionOrderStatus(productionOrderId)
      if (result.completed) {
        alert('Lệnh sản xuất đã được chuyển sang trạng thái hoàn thành!')
      } else {
        alert('Lệnh sản xuất chưa đủ điều kiện để hoàn thành.')
      }
    } catch (error) {
      console.error('Error checking completion status:', error)
      alert('Lỗi khi kiểm tra trạng thái hoàn thành!')
    }
  }

  const handleViewDetail = (chemicalExport: ChemicalExportDto) => {
    setSelectedExport(chemicalExport)
    setShowDetailModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phiếu xuất hóa chất này?')) {
      return
    }

    try {
      await chemicalExportService.deleteChemicalExport(id)
      alert('Xóa phiếu xuất hóa chất thành công!')
      loadChemicalExports() // Reload the list
    } catch (error) {
      console.error('Error deleting chemical export:', error)
      alert('Lỗi khi xóa phiếu xuất hóa chất!')
    }
  }

  const closeDetailModal = () => {
    setShowDetailModal(false)
    setSelectedExport(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Đang tải...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-[#4361ee]">Danh sách phiếu xuất hóa chất</h2>
          {isGluePouringOrder && (
            <div className="mt-1 text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded">
              ⚠️ Lệnh đổ keo - Số lượng sẽ được cập nhật vào tiến độ kế hoạch sản xuất
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCheckCompletion}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded shadow transition-colors"
            title="Kiểm tra và cập nhật trạng thái hoàn thành"
          >
            Kiểm tra hoàn thành
          </button>
          {/* <button
            onClick={loadChemicalExports}
            className="px-4 py-2 bg-[#4361ee] hover:bg-[#364fc7] text-white text-sm rounded shadow transition-colors"
          >
            Làm mới
          </button> */}
        </div>
      </div>

      {chemicalExports.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Chưa có phiếu xuất hóa chất nào cho lệnh sản xuất này</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border rounded shadow text-sm">
            <thead className="bg-[#edf0ff]">
              <tr>
                <th className="border p-2 text-left">STT</th>
                <th className="border p-2 text-left">Sản phẩm</th>
                <th className="border p-2 text-left">Số lượng</th>
                <th className="border p-2 text-left">Đơn vị</th>
                <th className="border p-2 text-left">Ngày tạo</th>
                <th className="border p-2 text-left">Ghi chú</th>
                <th className="border p-2 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {chemicalExports.map((exportItem, index) => (
                <tr key={exportItem.id} className="hover:bg-gray-50">
                  <td className="border p-2">{index + 1}</td>
                  <td className="border p-2">{exportItem.productName || 'N/A'}</td>
                  <td className="border p-2">{exportItem.quantity}</td>
                  <td className="border p-2">{exportItem.uom || 'N/A'}</td>
                  <td className="border p-2">
                    {new Date(exportItem.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="border p-2">
                    <span className="truncate max-w-xs block" title={exportItem.note || ''}>
                      {exportItem.note || 'Không có'}
                    </span>
                  </td>
                  <td className="border p-2">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleViewDetail(exportItem)}
                        className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                        title="Xem chi tiết"
                      >
                        <IconEye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(exportItem.id)}
                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
                        title="Xóa"
                      >
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      <ChemicalExportDetailModal
        chemicalExport={selectedExport}
        isOpen={showDetailModal}
        onClose={closeDetailModal}
      />
    </div>
  )
}

export default ListChemicalExport 