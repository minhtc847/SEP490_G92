"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import IconArrowLeft from "@/components/icon/icon-arrow-left"
import IconSave from "@/components/icon/icon-save"
import IconTrashLines from "@/components/icon/icon-trash-lines"
import IconRefresh from "@/components/icon/icon-refresh"

interface Customer {
  id: number
  name: string
  email: string
  phone: string
  address: string
  customerType: "customer" | "supplier"
  notes?: string
  discount?: number
  createdAt: string
  customerCode: string
  contactPerson: string
  position: string
  mailbox: string
  contactPhone: string
}

export default function EditCustomerPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    customerType: "customer" as "customer" | "supplier",
    notes: "",
    discount: 0,
    customerCode: "",
    contactPerson: "",
    position: "",
    mailbox: "",
    contactPhone: "",
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

  useEffect(() => {
    const loadCustomer = () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("customers_data")
        if (stored) {
          const customers: Customer[] = JSON.parse(stored)
          const foundCustomer = customers.find((c) => c.id === Number.parseInt(params.id))
          if (foundCustomer) {
            setCustomer(foundCustomer)
            setFormData({
              name: foundCustomer.name,
              email: foundCustomer.email,
              phone: foundCustomer.phone,
              address: foundCustomer.address,
              customerType: foundCustomer.customerType,
              notes: foundCustomer.notes || "",
              discount: foundCustomer.discount || 0,
              customerCode: foundCustomer.customerCode,
              contactPerson: foundCustomer.contactPerson || "",
              position: foundCustomer.position || "",
              mailbox: foundCustomer.mailbox || "",
              contactPhone: foundCustomer.contactPhone || "",
            })
          }
        }
      }
    }
    loadCustomer()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const stored = localStorage.getItem("customers_data")
      if (stored) {
        const customers: Customer[] = JSON.parse(stored)
        const customerIndex = customers.findIndex((c) => c.id === Number.parseInt(params.id))

        if (customerIndex !== -1) {
          customers[customerIndex] = { ...customers[customerIndex], ...formData }
          localStorage.setItem("customers_data", JSON.stringify(customers))
          alert(`Cập nhật khách hàng "${formData.name}" thành công!`)
          router.push(`/customers/${params.id}`)
        } else {
          alert("Không tìm thấy khách hàng để cập nhật!")
        }
      }
    } catch (error) {
      alert("Có lỗi xảy ra khi cập nhật khách hàng!")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa khách hàng "${customer?.name}"?`)) {
      setLoading(true)

      try {
        const stored = localStorage.getItem("customers_data")
        if (stored) {
          const customers: Customer[] = JSON.parse(stored)
          const updatedCustomers = customers.filter((c) => c.id !== Number.parseInt(params.id))
          localStorage.setItem("customers_data", JSON.stringify(updatedCustomers))
          alert("Xóa khách hàng thành công!")
          router.push("/customers")
        }
      } catch (error) {
        alert("Có lỗi xảy ra khi xóa khách hàng!")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "discount" ? Number.parseFloat(value) || 0 : value,
    })
  }

  const generateCustomerCode = () => {
    const stored = localStorage.getItem("customers_data")
    const customers: Customer[] = stored ? JSON.parse(stored) : []

    const prefix = formData.customerType === "customer" ? "KH" : "NCC"
    const sameTypeCustomers = customers.filter((c) => c.customerCode.startsWith(prefix))

    const maxCode = sameTypeCustomers.reduce((max, customer) => {
      const codeNum = Number.parseInt(customer.customerCode.replace(prefix, ""))
      return Math.max(max, codeNum || 0)
    }, 0)

    const code = `${prefix}${String(maxCode + 1).padStart(3, "0")}`
    setFormData((prev) => ({
      ...prev,
      customerCode: code,
    }))
  }

  if (!customer) {
    return (
      <div className="panel">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-2">Không tìm thấy khách hàng</h2>
          <p className="text-gray-500 mb-4">Khách hàng với ID {params.id} không tồn tại.</p>
          <Link href="/customers">
            <button className="btn btn-primary">Quay lại danh sách</button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1">
        <div className="panel">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-4">
              <Link href={`/customers/${params.id}`}>
                <button type="button" className="btn btn-outline-primary">
                  <IconArrowLeft className="mr-2" />
                  Quay lại
                </button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Chỉnh sửa khách hàng</h1>
                <p className="text-gray-500">Cập nhật thông tin khách hàng #{params.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`badge ${formData.customerType === "customer" ? "bg-info" : "bg-warning"}`}>
                {formData.customerType === "customer" ? "Khách hàng" : "Nhà cung cấp"}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Basic Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Thông tin cơ bản</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mã khách hàng</label>
                      <div className="flex gap-2">
                        <input
                          name="customerCode"
                          type="text"
                          value={formData.customerCode}
                          onChange={handleChange}
                          className="form-input flex-1"
                        />
                        <button
                          type="button"
                          onClick={generateCustomerCode}
                          className="btn btn-outline-primary px-3"
                          title="Tạo mã tự động"
                        >
                          <IconRefresh className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng *</label>
                      <input
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-input"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                      <input
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="form-textarea"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Loại khách hàng</label>
                      <select
                        name="customerType"
                        value={formData.customerType}
                        onChange={handleChange}
                        className="form-select"
                      >
                        <option value="customer">Khách hàng</option>
                        <option value="supplier">Nhà cung cấp</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Contact & Additional Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Thông tin liên hệ</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Người liên hệ</label>
                      <input
                        name="contactPerson"
                        type="text"
                        value={formData.contactPerson}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Chức vụ</label>
                      <select name="position" value={formData.position} onChange={handleChange} className="form-select">
                        <option value="">Chọn chức vụ</option>
                        {positionOptions.map((pos) => (
                          <option key={pos} value={pos}>
                            {pos}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hộp thư điện tử</label>
                      <input
                        name="mailbox"
                        type="text"
                        value={formData.mailbox}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SĐT liên hệ</label>
                      <input
                        name="contactPhone"
                        type="tel"
                        value={formData.contactPhone}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Thông tin bổ sung</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Chiết khấu</label>
                      <input
                        name="discount"
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.discount}
                        onChange={handleChange}
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        className="form-textarea"
                        rows={4}
                        placeholder="Nhập ghi chú về khách hàng..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80">
        <div className="panel">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Thông tin khách hàng</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã KH:</span>
                  <span className="font-medium">{formData.customerCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày tạo:</span>
                  <span className="font-medium">{new Date(customer.createdAt).toLocaleDateString("vi-VN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Loại:</span>
                  <span className={`badge ${formData.customerType === "customer" ? "bg-info" : "bg-warning"}`}>
                    {formData.customerType === "customer" ? "Khách hàng" : "Nhà cung cấp"}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">Thao tác</h3>
              <div className="space-y-2">
                <button
                  type="submit"
                  form="edit-form"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn btn-success w-full"
                >
                  <IconSave className="mr-2" />
                  {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>

                <Link href={`/customers/${params.id}`} className="block">
                  <button type="button" className="btn btn-outline-primary w-full">
                    Xem chi tiết
                  </button>
                </Link>

                <Link href="/customers" className="block">
                  <button type="button" className="btn btn-outline-secondary w-full">
                    Quay lại danh sách
                  </button>
                </Link>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3 text-red-600">Vùng nguy hiểm</h3>
              <button type="button" onClick={handleDelete} disabled={loading} className="btn btn-outline-danger w-full">
                <IconTrashLines className="mr-2" />
                Xóa khách hàng
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Hành động này không thể hoàn tác. Khách hàng sẽ bị xóa vĩnh viễn.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
