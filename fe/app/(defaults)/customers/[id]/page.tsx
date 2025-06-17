"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import IconArrowLeft from "@/components/icon/icon-arrow-left"
import IconEdit from "@/components/icon/icon-edit"

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

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCustomer = () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("customers_data")
        if (stored) {
          const customers: Customer[] = JSON.parse(stored)
          const foundCustomer = customers.find((c) => c.id === Number.parseInt(params.id))
          setCustomer(foundCustomer || null)
        }
      }
      setLoading(false)
    }
    loadCustomer()
  }, [params.id])

  if (loading) {
    return <div className="panel">Đang tải...</div>
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
          <div className="flex items-center gap-4">
            <Link href="/customers">
              <button className="btn btn-outline-primary">
                <IconArrowLeft className="mr-2" />
                Quay lại
              </button>
            </Link>
            <div>
              <h2 className="text-2xl font-bold">Chi tiết khách hàng</h2>
              <p className="text-gray-500">Thông tin chi tiết của khách hàng #{customer.id}</p>
            </div>
          </div>
          <Link href={`/customers/${customer.id}/edit`}>
            <button className="btn btn-primary">
              <IconEdit className="mr-2" />
              Chỉnh sửa
            </button>
          </Link>
        </div>

        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{customer.name}</h3>
            <div className="flex gap-2">
              <span className="badge bg-primary">{customer.customerCode}</span>
              <span className={`badge ${customer.status === "active" ? "bg-success" : "bg-secondary"}`}>
                {customer.status === "active" ? "Hoạt động" : "Không hoạt động"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="font-medium text-gray-700">Email</p>
                <p className="text-gray-900">{customer.email}</p>
              </div>

              <div>
                <p className="font-medium text-gray-700">Số điện thoại</p>
                <p className="text-gray-900">{customer.phone}</p>
              </div>

              <div>
                <p className="font-medium text-gray-700">Mã thẻ khách hàng</p>
                <p className="text-gray-900">{customer.customerCardCode}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="font-medium text-gray-700">Địa chỉ</p>
                <p className="text-gray-900">{customer.address}</p>
              </div>

              {customer.website && (
                <div>
                  <p className="font-medium text-gray-700">Website</p>
                  <p className="text-gray-900">{customer.website}</p>
                </div>
              )}

              {customer.notes && (
                <div>
                  <p className="font-medium text-gray-700">Ghi chú</p>
                  <p className="text-gray-900">{customer.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-gray-500">
              Ngày tạo: {new Date(customer.createdAt).toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
