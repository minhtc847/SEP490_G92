"use client"
import { useState } from "react"
import type React from "react"
import { useRouter } from "next/navigation"
import IconArrowLeft from "@/components/icon/icon-arrow-left"
import IconRefresh from "@/components/icon/icon-refresh"
import Link from "next/link"

interface Customer {
  id: number
  taxCode: string
  businessRegCode: string
  customerCode: string
  phone: string
  website: string
  name: string
  isSupplier: boolean
  address: string
  contactPerson: string
  position: string
  mailbox: string
  email: string
  contactPhone: string
  status: "active" | "inactive"
  createdAt: string
}

const CustomerCreatePage = () => {
  const router = useRouter()
  const [formData, setFormData] = useState({
    taxCode: "",
    businessRegCode: "",
    customerCode: "",
    phone: "",
    website: "",
    name: "",
    isSupplier: false,
    address: "",
    contactPerson: "",
    position: "",
    mailbox: "",
    email: "",
    contactPhone: "",
    status: "active" as "active" | "inactive",
  })
  const [loading, setLoading] = useState(false)

  const positionOptions = [
    "Giám đốc",
    "Phó giám đốc",
    "Trưởng phòng",
    "Phó phòng",
    "Nhân viên",
    "Kế toán",
    "Thư ký",
    "Khác",
  ]

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Lấy dữ liệu hiện tại từ localStorage
      const stored = localStorage.getItem("customers_data")
      const customers: Customer[] = stored ? JSON.parse(stored) : []

      // Tạo ID mới
      const newId = Math.max(...customers.map((c) => c.id), 0) + 1

      // Tạo khách hàng mới
      const newCustomer: Customer = {
        ...formData,
        id: newId,
        createdAt: new Date().toISOString().split("T")[0],
      }

      // Thêm vào danh sách và lưu
      customers.push(newCustomer)
      localStorage.setItem("customers_data", JSON.stringify(customers))

      alert(`Thêm khách hàng "${newCustomer.name}" thành công!`)
      router.push("/customers")
    } catch (error) {
      alert("Có lỗi xảy ra khi thêm khách hàng!")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const generateCustomerCode = () => {
    // Lấy dữ liệu hiện tại để tạo mã mới
    const stored = localStorage.getItem("customers_data")
    const customers: Customer[] = stored ? JSON.parse(stored) : []

    const maxCode = customers.reduce((max, customer) => {
      const codeNum = Number.parseInt(customer.customerCode.replace("KH", ""))
      return Math.max(max, codeNum || 0)
    }, 0)

    const code = `KH${String(maxCode + 1).padStart(3, "0")}`
    setFormData((prev) => ({
      ...prev,
      customerCode: code,
    }))
  }

  return (
    <div className="panel">
      <div className="mb-5">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/customers">
              <button type="button" className="btn btn-outline-primary">
                <IconArrowLeft className="mr-2" />
                Quay lại
              </button>
            </Link>
            <h2 className="text-xl font-semibold">Thông tin khách hàng</h2>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
            <div>
              <label htmlFor="taxCode" className="block text-sm font-medium text-gray-700 mb-1">
                Mã số thuế
              </label>
              <input
                id="taxCode"
                type="text"
                placeholder=""
                className="form-input"
                value={formData.taxCode}
                onChange={(e) => handleInputChange("taxCode", e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="businessRegCode" className="block text-sm font-medium text-gray-700 mb-1">
                Mã số ĐKKD/ĐT
              </label>
              <input
                id="businessRegCode"
                type="text"
                placeholder=""
                className="form-input"
                value={formData.businessRegCode}
                onChange={(e) => handleInputChange("businessRegCode", e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="customerCode" className="block text-sm font-medium text-gray-700 mb-1">
                Mã khách hàng
              </label>
              <div className="flex gap-1">
                <input
                  id="customerCode"
                  type="text"
                  placeholder=""
                  className="form-input flex-1"
                  value={formData.customerCode}
                  onChange={(e) => handleInputChange("customerCode", e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-outline-primary px-2"
                  onClick={generateCustomerCode}
                  title="Tạo mã tự động"
                >
                  <IconRefresh className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Điện thoại
              </label>
              <input
                id="phone"
                type="tel"
                placeholder=""
                className="form-input"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                id="website"
                type="url"
                placeholder=""
                className="form-input"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Tên khách hàng
              </label>
              <input
                id="name"
                type="text"
                placeholder=""
                className="form-input"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox mr-2"
                  checked={formData.isSupplier}
                  onChange={(e) => handleInputChange("isSupplier", e.target.checked)}
                />
                <span className="text-sm font-medium text-gray-700">Nhà cung cấp</span>
              </label>
            </div>
          </div>

          {/* Row 3 */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Địa chỉ
            </label>
            <input
              id="address"
              type="text"
              placeholder=""
              className="form-input"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
            />
          </div>

          {/* Contact Information Section */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-1">
                  Người liên hệ
                </label>
                <input
                  id="contactPerson"
                  type="text"
                  placeholder=""
                  className="form-input"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                  Chức vụ
                </label>
                <select
                  id="position"
                  className="form-select"
                  value={formData.position}
                  onChange={(e) => handleInputChange("position", e.target.value)}
                >
                  <option value="">Chọn chức vụ</option>
                  {positionOptions.map((pos) => (
                    <option key={pos} value={pos}>
                      {pos}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mt-4">
              <div>
                <label htmlFor="mailbox" className="block text-sm font-medium text-gray-700 mb-1">
                  Hộp thư điện tử
                </label>
                <input
                  id="mailbox"
                  type="text"
                  placeholder=""
                  className="form-input"
                  value={formData.mailbox}
                  onChange={(e) => handleInputChange("mailbox", e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder=""
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  id="contactPhone"
                  type="tel"
                  placeholder=""
                  className="form-input"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Link href="/customers">
              <button type="button" className="btn btn-outline-secondary" disabled={loading}>
                Hủy
              </button>
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Đang lưu..." : "OK"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CustomerCreatePage
