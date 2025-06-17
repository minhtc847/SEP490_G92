"use client"
import { useState, useEffect } from "react"
import IconTrashLines from "@/components/icon/icon-trash-lines"
import IconEdit from "@/components/icon/icon-edit"
import IconEye from "@/components/icon/icon-eye"
import IconPlus from "@/components/icon/icon-plus"
import IconUser from "@/components/icon/icon-user"
import IconUsers from "@/components/icon/icon-users"
import Tippy from "@tippyjs/react"
import "tippy.js/dist/tippy.css"
import Link from "next/link"

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
      customerType: "customer",
      notes: "Khách hàng VIP, ưu tiên phục vụ",
      discount: 10,
      createdAt: "2024-01-15",
      customerCode: "KH001",
    },
    {
      id: 2,
      name: "Công ty TNHH ABC",
      email: "contact@abc.com",
      phone: "0987654321",
      address: "456 Đường XYZ, Quận 3, TP.HCM",
      customerType: "supplier",
      notes: "Nhà cung cấp nguyên liệu chính",
      discount: 5,
      createdAt: "2024-02-20",
      customerCode: "NCC001",
    },
    {
      id: 3,
      name: "Lê Văn C",
      email: "levanc@email.com",
      phone: "0369852147",
      address: "789 Đường DEF, Hải Châu, Đà Nẵng",
      customerType: "customer",
      notes: "",
      discount: 0,
      createdAt: "2024-03-10",
      customerCode: "KH002",
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
          <span className="badge bg-info">
            <IconUser className="w-3 h-3 mr-1" />
            Khách hàng ({customers.filter((c) => c.customerType === "customer").length})
          </span>
          <span className="badge bg-warning">
            <IconUsers className="w-3 h-3 mr-1" />
            Nhà cung cấp ({customers.filter((c) => c.customerType === "supplier").length})
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
                <th>Mã</th>
                <th>Tên khách hàng</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Địa chỉ</th>
                <th>Loại</th>
                <th>Chiết khấu</th>
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
                    {customer.notes && <div className="text-xs text-gray-500 mt-1">{customer.notes}</div>}
                  </td>
                  <td>{customer.email}</td>
                  <td>{customer.phone}</td>
                  <td className="max-w-xs truncate">{customer.address}</td>
                  <td>
                    <div className="flex items-center gap-1">
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
                  </td>
                  <td>
                    <span className="font-semibold text-green-600">{customer.discount || 0}</span>
                  </td>
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
