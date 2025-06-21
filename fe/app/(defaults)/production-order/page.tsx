"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ProductionPage() {
  const [filters, setFilters] = useState({
    sanXuatMoi: false,
    taoMoi: false,
    online: false,
    sanXuatLai: false,
    duyetLai: false,
  })

  const router = useRouter()

  const handleFilterChange = (filterName: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: !prev[filterName as keyof typeof prev],
    }))
  }

  // Sửa handleEdit để chuyển đến trang chi tiết với ID cụ thể
  const handleEdit = (productId = "001") => {
  router.push(`/production-order/001`)
}

  // Thêm handleBack để quay về trang chính
  const handleBack = () => {
    router.push("/") // hoặc trang chính của bạn
  }

  // Thêm function để xem chi tiết sản phẩm
  const handleViewDetail = (productId: string) => {
    router.push(`/product/production-order/${productId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        {/* Page Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📋 Sản xuất tổng quan</h1>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Trang chủ
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Search and Filter */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Tìm hàng</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Nhập từ khóa tìm kiếm..."
              />
            </div>
            <div className="sm:w-48">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Lọc theo</label>
              <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option>Tất cả</option>
                <option>Đang sản xuất</option>
                <option>Hoàn thành</option>
                <option>Chờ duyệt</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    STT
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Mã SP
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Tên sản phẩm
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Số lượng
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Ngày sản xuất
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Trạng thái
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Kho
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800">
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                    1
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    SP-001
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                    Sản phẩm X
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                    50
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                    15/06/2024
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                      Đang sản xuất
                    </span>
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                    Kho A
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm">
                    <button
                      onClick={() => handleViewDetail("001")}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs"
                    >
                      👁️ Xem chi tiết
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                    2
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    SP-002
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                    Sản phẩm Y
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                    80
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                    14/06/2024
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                      Hoàn thành
                    </span>
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                    Kho B
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm">
                    <button
                      onClick={() => handleViewDetail("002")}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs"
                    >
                      👁️ Xem chi tiết
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                    3
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    SP-003
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                    Sản phẩm Z
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                    120
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                    13/06/2024
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      Chờ duyệt
                    </span>
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-gray-300">
                    Kho C
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm">
                    <button
                      onClick={() => handleViewDetail("003")}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs"
                    >
                      👁️ Xem chi tiết
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary Statistics */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Thống kê sản xuất</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Diện tích bản vẽ (m²)</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">6.32</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Chiều cao (m)</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">5.75</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Lượng đầu vào (kg)</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">13,228</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Lượng đầu ra (kg)</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">10.6</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Chi phí nhân công (VNĐ)</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">84.79M</div>
              </div>
            </div>
          </div>

          {/* Filter Checkboxes */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">Bộ lọc nâng cao</h3>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.sanXuatMoi}
                  onChange={() => handleFilterChange("sanXuatMoi")}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Sản xuất mới</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.taoMoi}
                  onChange={() => handleFilterChange("taoMoi")}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Tạo mới</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.online}
                  onChange={() => handleFilterChange("online")}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Online</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.sanXuatLai}
                  onChange={() => handleFilterChange("sanXuatLai")}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Sản xuất lại</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.duyetLai}
                  onChange={() => handleFilterChange("duyetLai")}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:bg-gray-700"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Duyệt lại</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleEdit("001")}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              ✏️ Sửa SP-001
            </button>
            <button className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
              📊 Export File
            </button>
            <button className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors">
              🔄 Update Mới
            </button>
            <button className="px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors">
              🏠 Trang chủ quản lý
            </button>
            <button className="px-4 py-2 bg-orange-600 dark:bg-orange-700 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors">
              📋 Xem lịch sử xuất nhập
            </button>
            <button className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors">
              📄 Xuất file
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
