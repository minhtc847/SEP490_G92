"use client"
import { useState, useEffect } from "react"
import IconTrashLines from "@/components/icon/icon-trash-lines"
import IconEdit from "@/components/icon/icon-edit"
import IconEye from "@/components/icon/icon-eye"
import IconPlus from "@/components/icon/icon-plus"
import Tippy from "@tippyjs/react"
import "tippy.js/dist/tippy.css"
import Link from "next/link"

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

const CustomersListPage = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  // Dữ liệu mẫu ban đầu
  const initialCustomers: Customer[] = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      email: "nguyenvana@email.com",
      phone: "0123456789",
      address: "123 Đường ABC, Quận 1, Hà Nội",
      website: "https://example.com",
      industry: "technology",
      notes: "Khách hàng VIP",
      status: "active",
      createdAt: "2024-01-15",
      customerCode: "KH001",
      customerCardCode: "CC001",
    },
    {
      id: 2,
      name: "Trần Thị B",
      email: "tranthib@email.com",
      phone: "0987654321",
      address: "456 Đường XYZ, Quận 3, TP.HCM",
      website: "https://tranthib.com",
      industry: "retail",
      notes: "Khách hàng thường xuyên",
      status: "active",
      createdAt: "2024-02-20",
      customerCode: "KH002",
      customerCardCode: "CC002",
    },
    {
      id: 3,
      name: "Lê Văn C",
      email: "levanc@email.com",
      phone: "0369852147",
      address: "789 Đường DEF, Hải Châu, Đà Nẵng",
      website: "",
      industry: "manufacturing",
      notes: "",
      status: "inactive",
      createdAt: "2024-03-10",
      customerCode: "KH003",
      customerCardCode: "CC003",
    },
  ]

  // Load dữ liệu khi component mount
  useEffect(() => {
    const loadCustomers = () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("customers_data")
        if (!stored) {
          localStorage.setItem("customers_data", JSON.stringify(initialCustomers))
          setCustomers(initialCustomers)
        } else {
          setCustomers(JSON.parse(stored))
        }
      }
      setLoading(false)
    }
    loadCustomers()
  }, [])

  // Xóa khách hàng
  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa khách hàng "${name}"?`)) {
      const updatedCustomers = customers.filter((customer) => customer.id !== id)
      setCustomers(updatedCustomers)
      localStorage.setItem("customers_data", JSON.stringify(updatedCustomers))
      alert("Xóa khách hàng thành công!")
    }
  }

  const filteredData = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customerCode.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return <div className="panel">Đang tải...</div>
  }

  return (
    <div className="panel">
      <div className="mb-5">
        <h2 className="text-xl font-semibold mb-4">Danh sách khách hàng</h2>

        {/* Search and Actions Bar */}
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Tìm kiếm khách hàng..."
              className="form-input w-auto"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="button" className="btn btn-primary">
              Tìm kiếm
            </button>
          </div>
          <Link href="/customers/create">
            <button type="button" className="btn btn-success">
              <IconPlus className="mr-2" />
              Thêm khách hàng
            </button>
          </Link>
        </div>

        {/* Filter Tags */}
        <div className="mb-4 flex gap-2">
          <span className="badge bg-primary">Tất cả ({customers.length})</span>
          <span className="badge bg-success">Hoạt động ({customers.filter((c) => c.status === "active").length})</span>
          <span className="badge bg-secondary">
            Không hoạt động ({customers.filter((c) => c.status === "inactive").length})
          </span>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table-hover">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" className="form-checkbox" />
                </th>
                <th>Mã KH</th>
                <th>Tên khách hàng</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Địa chỉ</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <input type="checkbox" className="form-checkbox" />
                  </td>
                  <td>
                    <div className="font-semibold text-primary">{customer.customerCode}</div>
                  </td>
                  <td>
                    <div className="whitespace-nowrap font-semibold">{customer.name}</div>
                  </td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td className="max-w-xs truncate">{customer.address}</td>
                  <td>
                    <span className={`badge ${customer.status === "active" ? "bg-success" : "bg-secondary"}`}>
                      {customer.status === "active" ? "Hoạt động" : "Không hoạt động"}
                    </span>
                  </td>
                  <td>{new Date(customer.createdAt).toLocaleDateString("vi-VN")}</td>
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Tippy content="Xem chi tiết">
                        <Link href={`/customers/${customer.id}`}>
                          <button type="button" className="btn btn-sm btn-outline-primary">
                            <IconEye />
                          </button>
                        </Link>
                      </Tippy>
                      <Tippy content="Chỉnh sửa">
                        <Link href={`/customers/${customer.id}/edit`}>
                          <button type="button" className="btn btn-sm btn-outline-warning">
                            <IconEdit />
                          </button>
                        </Link>
                      </Tippy>
                      <Tippy content="Xóa">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(customer.id, customer.name)}
                        >
                          <IconTrashLines />
                        </button>
                      </Tippy>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Không tìm thấy khách hàng nào</p>
          </div>
        )}

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Hiển thị {filteredData.length} của {customers.length} khách hàng
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn btn-sm btn-outline-primary" disabled>
              Trước
            </button>
            <button type="button" className="btn btn-sm btn-primary">
              1
            </button>
            <button type="button" className="btn btn-sm btn-outline-primary" disabled>
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomersListPage
