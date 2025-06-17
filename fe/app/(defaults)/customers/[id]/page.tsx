"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import IconArrowLeft from "@/components/icon/icon-arrow-left"
import IconEdit from "@/components/icon/icon-edit"
import IconUser from "@/components/icon/icon-user"
import IconUsers from "@/components/icon/icon-users"

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
  contactPerson?: string
  position?: string
  mailbox?: string
  contactPhone?: string
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
    <div className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1">
        <div className="panel">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-4">
              <Link href="/customers">
                <button className="btn btn-outline-primary">
                  <IconArrowLeft className="mr-2" />
                  Quay lại
                </button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">{customer.name}</h1>
                <p className="text-gray-500">Chi tiết khách hàng #{customer.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`badge ${customer.customerType === "customer" ? "bg-info" : "bg-warning"}`}>
                {customer.customerType === "customer" ? "Khách hàng" : "Nhà cung cấp"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  {customer.customerType === "customer" ? (
                    <IconUser className="w-5 h-5 text-blue-500" />
                  ) : (
                    <IconUsers className="w-5 h-5 text-orange-500" />
                  )}
                  Thông tin cơ bản
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Mã khách hàng:</span>
                    <span className="col-span-2 font-semibold text-primary">{customer.customerCode}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Tên:</span>
                    <span className="col-span-2 font-semibold">{customer.name}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Email:</span>
                    <span className="col-span-2">{customer.email}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Số điện thoại:</span>
                    <span className="col-span-2">{customer.phone}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Địa chỉ:</span>
                    <span className="col-span-2">{customer.address}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Loại:</span>
                    <span className="col-span-2">
                      <div className="flex items-center gap-2">
                        {customer.customerType === "customer" ? (
                          <>
                            <IconUser className="w-4 h-4 text-blue-500" />
                            <span className="text-blue-600 font-medium">Khách hàng</span>
                          </>
                        ) : (
                          <>
                            <IconUsers className="w-4 h-4 text-orange-500" />
                            <span className="text-orange-600 font-medium">Nhà cung cấp</span>
                          </>
                        )}
                      </div>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Contact & Additional Info */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Thông tin liên hệ</h3>

                <div className="space-y-4">
                  {customer.contactPerson && (
                    <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Người liên hệ:</span>
                      <span className="col-span-2">{customer.contactPerson}</span>
                    </div>
                  )}

                  {customer.position && (
                    <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Chức vụ:</span>
                      <span className="col-span-2">{customer.position}</span>
                    </div>
                  )}

                  {customer.mailbox && (
                    <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Hộp thư:</span>
                      <span className="col-span-2">{customer.mailbox}</span>
                    </div>
                  )}

                  {customer.contactPhone && (
                    <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">SĐT liên hệ:</span>
                      <span className="col-span-2">{customer.contactPhone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Thông tin bổ sung</h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Chiết khấu:</span>
                    <span className="col-span-2 font-semibold text-green-600">{customer.discount || 0}</span>
                  </div>

                  {customer.notes && (
                    <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Ghi chú:</span>
                      <span className="col-span-2">{customer.notes}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4 py-3">
                    <span className="text-gray-600 font-medium">Ngày tạo:</span>
                    <span className="col-span-2">{new Date(customer.createdAt).toLocaleDateString("vi-VN")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80">
        <div className="panel">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Thông tin tóm tắt</h3>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Mã khách hàng</div>
                  <div className="font-bold text-lg text-primary">{customer.customerCode}</div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Loại khách hàng</div>
                  <div className="font-medium">
                    {customer.customerType === "customer" ? "Khách hàng" : "Nhà cung cấp"}
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Chiết khấu</div>
                  <div className="font-bold text-green-600">{customer.discount || 0}</div>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Ngày tạo</div>
                  <div className="font-medium">{new Date(customer.createdAt).toLocaleDateString("vi-VN")}</div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">Thao tác</h3>
              <div className="space-y-2">
                <Link href={`/customers/${customer.id}/edit`} className="block">
                  <button className="btn btn-primary w-full">
                    <IconEdit className="mr-2" />
                    Chỉnh sửa
                  </button>
                </Link>

                <Link href="/customers" className="block">
                  <button className="btn btn-outline-secondary w-full">Quay lại danh sách</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
