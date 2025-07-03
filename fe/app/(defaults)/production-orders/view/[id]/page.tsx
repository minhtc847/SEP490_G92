"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface ProductItem {
  id: string
  code: string
  name: string
  unit: string
  quantity: number
}

interface MaterialItem {
  id: string
  code: string
  name: string
  unit: string
  quantityPer: number
  totalQuantity: number
}

// Mock data cho nguyên vật liệu của từng sản phẩm
const materialsByProduct: Record<string, MaterialItem[]> = {
  VT00576: [
    {
      id: "1",
      code: "VT00531",
      name: "Kính cường lực tôi trắng 5ly, KT: 640*770*5 mm",
      unit: "Tấm",
      quantityPer: 1.0,
      totalQuantity: 1.0,
    },
    {
      id: "2",
      code: "VT00539",
      name: "Kính cường lực tôi trắng 5ly, KT: 640*770*5 mm",
      unit: "Tấm",
      quantityPer: 1.0,
      totalQuantity: 1.0,
    },
    {
      id: "3",
      code: "VT00562",
      name: "Kính cường lực tôi trắng 5ly, KT: 640*770*5 mm",
      unit: "Tấm",
      quantityPer: 1.0,
      totalQuantity: 1.0,
    },
  ],
  VT00580: [
    {
      id: "4",
      code: "VT00019",
      name: "Thung>54mm>18 cuộn, Keo Trung tính màu đen",
      unit: "m",
      quantityPer: 5.64,
      totalQuantity: 5.64,
    },
    {
      id: "5",
      code: "VT00183",
      name: "Keo Nano (Silicone Sealant)",
      unit: "Lít",
      quantityPer: 0.323,
      totalQuantity: 0.323,
    },
  ],
  VT00577: [
    {
      id: "6",
      code: "VT00232",
      name: "Keo Nano",
      unit: "kg",
      quantityPer: 9.961,
      totalQuantity: 9.961,
    },
    {
      id: "7",
      code: "VT00245",
      name: "Silicone trong suốt",
      unit: "Lít",
      quantityPer: 2.5,
      totalQuantity: 2.5,
    },
  ],
  VT00579: [
    {
      id: "8",
      code: "VT00301",
      name: "Kính cường lực 6mm",
      unit: "Tấm",
      quantityPer: 2.0,
      totalQuantity: 2.0,
    },
  ],
  VT00581: [
    {
      id: "9",
      code: "VT00402",
      name: "Khung nhôm định hình",
      unit: "m",
      quantityPer: 3.2,
      totalQuantity: 3.2,
    },
  ],
  VT00496: [
    {
      id: "10",
      code: "VT00503",
      name: "Gioăng cao su",
      unit: "m",
      quantityPer: 4.8,
      totalQuantity: 4.8,
    },
  ],
  VT00582: [
    {
      id: "11",
      code: "VT00604",
      name: "Vít inox 4x20",
      unit: "cái",
      quantityPer: 12.0,
      totalQuantity: 12.0,
    },
  ],
  VT00529: [
    {
      id: "12",
      code: "VT00705",
      name: "Keo dán kính chuyên dụng",
      unit: "kg",
      quantityPer: 1.5,
      totalQuantity: 1.5,
    },
  ],
}

export default function ProductionOrderView({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [orderNumber, setOrderNumber] = useState("LSX00130")
  const [status, setStatus] = useState("Đang thực hiện")
  const [selectedProduct, setSelectedProduct] = useState<string>("VT00576")

  // Mock data for finished products
  const finishedProducts: ProductItem[] = [
    { id: "1", code: "VT00576", name: "Kính E190 phút KT: 640*770*30 mm ...", unit: "Tấm", quantity: 2.0 },
    { id: "2", code: "VT00580", name: "Kính E190 phút KT: 588*588*28 mm ...", unit: "Tấm", quantity: 2.0 },
    { id: "3", code: "VT00577", name: "Kính E190 phút KT: 2050*770*28 mm ...", unit: "Tấm", quantity: 1.0 },
    { id: "4", code: "VT00579", name: "Kính E190 phút KT: 588*318*28 mm ...", unit: "Tấm", quantity: 2.0 },
    { id: "5", code: "VT00581", name: "Kính E190 phút KT: 171*958*28 mm ...", unit: "Tấm", quantity: 1.0 },
    { id: "6", code: "VT00496", name: "Kính E190 phút KT: 770*770*28 mm ...", unit: "Tấm", quantity: 1.0 },
    { id: "7", code: "VT00582", name: "Kính E190 phút KT: 588*318*28 mm ...", unit: "Tấm", quantity: 1.0 },
    { id: "8", code: "VT00529", name: "Kính E190, KT: 200*700*30 mm ...", unit: "Tấm", quantity: 2.0 },
  ]

  const currentMaterials = materialsByProduct[selectedProduct] || []
  const totalQuantity = finishedProducts.reduce((sum, item) => sum + item.quantity, 0)
  const totalMaterialQuantity = currentMaterials.reduce((sum, item) => sum + item.totalQuantity, 0)

  const handleProductSelect = (productCode: string) => {
    setSelectedProduct(productCode)
  }

  const handleGoBack = () => {
    router.push("/production-orders/view")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <button
              onClick={handleGoBack}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Quay lại
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Lệnh sản xuất hàng</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Sub Header with Action Buttons */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Lệnh sản xuất</span>
              <input
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-32 h-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">Ngày</span>
              <input
                type="date"
                defaultValue="2025-06-11"
                className="border border-gray-300 rounded-lg px-3 py-2 w-36 h-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Số lệnh</span>
              <input
                value={orderNumber}
                className="border border-gray-300 rounded-lg px-3 py-2 w-28 h-9 text-sm bg-gray-50"
                readOnly
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Tình trạng</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 w-40 h-9 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Đang thực hiện">Đang thực hiện</option>
                <option value="Hoàn thành">Hoàn thành</option>
                <option value="Tạm dừng">Tạm dừng</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons - VRISTO Style */}
        <div className="flex gap-3">
          <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Gửi lệnh
          </button>

          <button className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            In
          </button>

          <button className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Tải xuống
          </button>

          <button className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Tạo mới
          </button>

          <button className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Chỉnh sửa
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Finished Products Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Thành phẩm</h3>
            </div>
            <div className="overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      Mã thành phẩm
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      Tên thành phẩm
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      ĐVT
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số lượng
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {finishedProducts.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`cursor-pointer transition-colors ${
                        selectedProduct === item.code ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleProductSelect(item.code)}
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">{index + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-blue-600 border-r border-gray-200">
                        {item.code}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                        <div className="max-w-xs truncate" title={item.name}>
                          {item.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">{item.unit}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div className="flex items-center justify-between">
                          <span>{item.quantity.toFixed(2)}</span>
                          <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                            <svg
                              className="w-4 h-4 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                      Tổng:
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{totalQuantity.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Thêm dòng
              </button>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Xóa hết dòng
              </button>
            </div>
          </div>

          {/* Materials Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Định mức xuất NVL cho: {selectedProduct}</h3>
            </div>
            <div className="overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      Mã nguyên vật liệu
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      Tên nguyên vật liệu
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                      ĐVT
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số lượng NVL/1 đơn vị SP
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentMaterials.length > 0 ? (
                    currentMaterials.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">{index + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium text-blue-600 border-r border-gray-200">
                          {item.code}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                          <div className="max-w-xs truncate" title={item.name}>
                            {item.name}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">{item.unit}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div className="flex items-center justify-between">
                            <span>{item.quantityPer.toFixed(3)}</span>
                            <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                              <svg
                                className="w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        Không có nguyên vật liệu cho sản phẩm này
                      </td>
                    </tr>
                  )}
                </tbody>
                {currentMaterials.length > 0 && (
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                        Tổng:
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {totalMaterialQuantity.toFixed(3)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Thêm dòng
              </button>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Xóa hết dòng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
