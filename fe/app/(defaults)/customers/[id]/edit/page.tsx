"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import IconSave from "@/components/icon/icon-save"
import IconArrowLeft from "@/components/icon/icon-arrow-left"
import IconTrashLines from "@/components/icon/icon-trash-lines"

interface Customer {
  id: number
  name: string
  email: string
  phone: string
  address: string
  website?: string
  industry?: string
  notes?: string
  status: "active" | "inactive"
  createdAt: string
  customerCode: string
  customerCardCode: string
}

export default function EditCustomerPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    industry: "",
    notes: "",
    status: "active" as "active" | "inactive",
    customerCode: "",
    customerCardCode: "",
  })
  const [loading, setLoading] = useState(false)

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
              website: foundCustomer.website || "",
              industry: foundCustomer.industry || "",
              notes: foundCustomer.notes || "",
              status: foundCustomer.status,
              customerCode: foundCustomer.customerCode,
              customerCardCode: foundCustomer.customerCardCode,
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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
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
    <div className="panel">
      <div className="mb-5">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href={`/customers/${params.id}`}>
              <button type="button" className="btn btn-outline-primary">
                <IconArrowLeft className="mr-2" />
                Quay lại
              </button>
            </Link>
            <h2 className="text-xl font-semibold">Chỉnh sửa khách hàng #{params.id}</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Tên khách hàng *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nhập tên khách hàng"
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Nhập email"
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Nhập số điện thoại"
                  className="form-input"
                />
              </div>

              <div>
                <label htmlFor="customerCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Mã khách hàng
                </label>
                <input
                  id="customerCode"
                  name="customerCode"
                  type="text"
                  value={formData.customerCode}
                  onChange={handleChange}
                  placeholder="Nhập mã khách hàng"
                  className="form-input"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Nhập địa chỉ"
                  className="form-textarea"
                  rows={3}
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                  Website
                </label>
                <input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="Nhập website"
                  className="form-input"
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Ghi chú
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Nhập ghi chú"
                  className="form-textarea"
                  rows={3}
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Link href={`/customers/${params.id}`}>
              <button type="button" className="btn btn-outline-secondary" disabled={loading}>
                Hủy
              </button>
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <IconSave className="mr-2" />
              {loading ? "Đang lưu..." : "Cập nhật"}
            </button>
          </div>
        </form>

        {/* Delete Section */}
        <div className="mt-8 pt-6 border-t">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-red-600">Xóa khách hàng</h3>
              <p className="text-sm text-gray-500">Hành động này không thể hoàn tác. Khách hàng sẽ bị xóa vĩnh viễn.</p>
            </div>
            <button type="button" onClick={handleDelete} className="btn btn-outline-danger" disabled={loading}>
              <IconTrashLines className="mr-2" />
              Xóa khách hàng
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
