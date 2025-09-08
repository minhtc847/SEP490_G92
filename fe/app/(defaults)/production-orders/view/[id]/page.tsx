"use client"

import { useEffect, useState } from "react"
import type React from "react"
import { useRouter } from "next/navigation"
import ListOutputsPO from "@/components/VNG/manager/production-orders/list-outputs-of-po/list-outputs-po-components"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
// removed unused Chemical/Product types
import {
  fetchProductionOrderInfo as fetchPOInfo,
  fetchProductionOrderProducts as fetchPOProducts,
  fetchMaterialsByOutputId,
  addOutputInfo,
  updateOutputInfo,
  updateMaterialInfo,
  addMaterialInfo,
  fetchAllProducts as fetchAllCatalogProducts,
  deleteProductionOutput,
  deleteProductionMaterial,
} from "@/app/(defaults)/production-orders/service"
import type {
  ProductItem,
  MaterialItem,
  ProductWithMaterialsResponse,
} from "@/app/(defaults)/production-orders/service"

// Helper functions để convert UOM giữa int và string
const convertUOMToString = (uom: number | string): string => {
  if (typeof uom === "string") return uom

  const uomMap: { [key: number]: string } = {
    0: "Tấm",
    1: "Kg",
    2: "M",
    3: "L",
    4: "Ml",
    5: "g",
  }
  return uomMap[uom] || "N/A"
}

const convertStringToUOMInt = (uomString: string): number => {
  const stringToIntMap: { [key: string]: number } = {
    Tấm: 0,
    tấm: 0,
    Kg: 1,
    kg: 1,
    M: 2,
    m: 2,
    L: 3,
    l: 3,
    Ml: 4,
    ml: 4,
    g: 5,
    G: 5,
  }
  return stringToIntMap[uomString] || 0
}

export default function ProductionOrderView({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [finishedProducts, setFinishedProducts] = useState<ProductItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null)
  const [currentMaterials, setCurrentMaterials] = useState<MaterialItem[]>([])
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [orderDescription, setOrderDescription] = useState<string>("")
  const [orderType, setOrderType] = useState<string>("")
  const [orderStatus, setOrderStatus] = useState<string>("")

  // Modal states
  const [showProductModal, setShowProductModal] = useState(false)
  const [showMaterialModal, setShowMaterialModal] = useState(false)
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false)
  // removed unused glue/chemical modals
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null)
  const [editingMaterial, setEditingMaterial] = useState<MaterialItem | null>(null)

  // Form states
  const [productForm, setProductForm] = useState<ProductItem>({
    productName: "",
    uom: "",
    quantity: 0,
  })

  const [materialForm, setMaterialForm] = useState<MaterialItem>({
    productName: "",
    uom: "",
    // quantityPer is derived
    totalQuantity: 0,
    quantityPer: 0,
  })

  // Add form states
  const [addProductForm, setAddProductForm] = useState<ProductItem>({
    productName: "",
    uom: "",
    quantity: 0,
  })

  const [addMaterialForm, setAddMaterialForm] = useState<MaterialItem>({
    productName: "",
    uom: "",
    totalQuantity: 0,
    quantityPer: 0,
  })

  // Danh sách tất cả products
  const [allProducts, setAllProducts] = useState<ProductItem[]>([])
  const [isLoadingAllProducts, setIsLoadingAllProducts] = useState(false)

  // removed unused glue-butyl export temp data and employees

  // Modal xem chi tiết
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailContent, setDetailContent] = useState({ title: "", content: "" })

  const closeAddProductModal = () => setShowAddProductModal(false)
  const closeAddMaterialModal = () => setShowAddMaterialModal(false)
  const closeProductModal = () => setShowProductModal(false)
  const closeMaterialModal = () => setShowMaterialModal(false)

  const showDetailInfo = (title: string, content: string) => {
    setDetailContent({ title, content })
    setShowDetailModal(true)
  }

  const closeDetailModal = () => {
    setShowDetailModal(false)
    setDetailContent({ title: "", content: "" })
  }

  const refreshProducts = async () => {
    try {
      const data = await fetchPOProducts(params.id)
      const processedData = (data || []).map((item) => ({
        ...item,
        uom: convertUOMToString(item.uom),
      }))
      setFinishedProducts(processedData)

      // Reset selection if current selected product no longer exists
      if (selectedProduct && !processedData.find((p) => (p.outputId || p.id) === selectedProduct)) {
        setSelectedProduct(null)
        setCurrentMaterials([])
      }
    } catch (error) {
      console.error("Error refreshing products:", error)
    }
  }

  const handleDeleteOutput = async (outputId: number) => {
    console.log("[v0] Delete output called with ID:", outputId)

    if (confirm("Bạn có chắc chắn muốn xóa không?")) {
      try {
        const result = await deleteProductionOutput(outputId)
        if (result.success) {
          alert("Xóa thành phẩm thành công!")
          await refreshProducts()
          setSelectedProduct(null)
        } else {
          alert(result.message)
        }
      } catch (error) {
        console.error("[v0] Delete error:", error)
        alert("Có lỗi xảy ra khi xóa thành phẩm")
      }
    }
  }

  const handleDeleteMaterial = async (materialId: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa không?")) {
      try {
        const result = await deleteProductionMaterial(materialId)
        if (result.success) {
          alert("Xóa nguyên vật liệu thành công!")
          await refreshMaterials()
          setSelectedMaterial(null)
        } else {
          alert(result.message)
        }
      } catch (error) {
        console.error("[v0] Delete material error:", error)
        alert("Có lỗi xảy ra khi xóa nguyên vật liệu")
      }
    }
  }

  // Load outputs (thành phẩm)
  useEffect(() => {
    fetchPOProducts(params.id)
      .then((data: ProductItem[]) => {
        const processedData = (data || []).map((item) => ({
          ...item,
          uom: convertUOMToString(item.uom),
        }))

        setFinishedProducts(processedData)

        if (processedData && processedData.length > 0) {
          const productWithMaterials = processedData[0]
          const productId = productWithMaterials.outputId || productWithMaterials.id
          if (productId) setSelectedProduct(productId)
        }
      })
      .catch(() => {})
  }, [params.id])

  // Load materials theo output
  useEffect(() => {
    if (!selectedProduct) return
    setLoading(true)
    setCurrentMaterials([])
    setSelectedMaterial(null)

    const selectedProductData = finishedProducts.find((p) => (p.outputId || p.id) === selectedProduct)
    if (!selectedProductData || !selectedProductData.outputId) {
      setLoading(false)
      return
    }

    const outputId = selectedProductData.outputId

    fetchMaterialsByOutputId(outputId)
      .then((data: ProductWithMaterialsResponse) => {
        if (data && data.materials && Array.isArray(data.materials)) {
          const selectedProductQuantity = getSelectedProductQuantity()
          const materialsWithCalculatedQuantityPer = data.materials.map((material) => ({
            ...material,
            uom: convertUOMToString(material.uom),
            quantityPer: calculateQuantityPer(material.totalQuantity, selectedProductQuantity),
          })) as MaterialItem[]
          setCurrentMaterials(materialsWithCalculatedQuantityPer)
        } else {
          setCurrentMaterials([])
        }
      })
      .catch(() => setCurrentMaterials([]))
      .finally(() => setLoading(false))
  }, [params.id, selectedProduct, finishedProducts])

  // Load info PO (mô tả, loại, trạng thái)
  useEffect(() => {
    fetchPOInfo(params.id).then((data) => {
      if (data?.description) setOrderDescription(data.description)
      setOrderType(data?.type || "")
      setOrderStatus(data?.status || "")
    })
  }, [params.id])

  const handleProductSelect = (id: number | undefined) => {
    if (id && id !== selectedProduct) {
      setSelectedProduct(id)
      setCurrentMaterials([])
      setSelectedMaterial(null)
    }
  }

  const handleMaterialSelect = (material: MaterialItem) => setSelectedMaterial(material)

  const handleGoBack = () => router.push("/production-orders/")

  // removed unused handleOperationChange

  // Fetch tất cả products khi mở modal
  const fetchAllProducts = async () => {
    setIsLoadingAllProducts(true)
    try {
      const products = await fetchAllCatalogProducts()
      const processedProducts = products.map((product: ProductItem) => ({
        ...product,
        uom: convertUOMToString(product.uom),
      }))
      setAllProducts(processedProducts)
    } catch {
      setAllProducts([])
    } finally {
      setIsLoadingAllProducts(false)
    }
  }

  const handleAddProduct = () => {
    setAddProductForm({ productName: "", uom: "", quantity: 0 })
    fetchAllProducts()
    setShowAddProductModal(true)
  }

  const handleUpdateProduct = () => {
    if (finishedProducts.length === 0) {
      alert("Không có thành phẩm nào để cập nhật")
      return
    }
    const productToEdit = finishedProducts.find((p) => (p.outputId || p.id) === selectedProduct) || finishedProducts[0]
    if (!productToEdit) {
      alert("Không tìm thấy dữ liệu thành phẩm để cập nhật")
      return
    }
    setEditingProduct(productToEdit)
    setProductForm({ ...productToEdit })
    // Open modal first, then refresh all products in background
    setShowProductModal(true)
    fetchAllProducts()
  }

  const handleAddMaterial = () => {
    if (!selectedProduct) {
      alert("Vui lòng chọn sản phẩm trước khi thêm nguyên vật liệu!")
      return
    }
    setAddMaterialForm({ productName: "", uom: "", totalQuantity: 0, quantityPer: 0 })
    // Open modal first, then load products
    setShowAddMaterialModal(true)
    fetchAllProducts()
  }

  const handleUpdateMaterial = () => {
    if (!selectedMaterial) {
      alert("Vui lòng chọn một nguyên vật liệu để cập nhật!")
      return
    }
    setEditingMaterial(selectedMaterial)
    setMaterialForm({ ...selectedMaterial })
    // Open modal first, then load products
    setShowMaterialModal(true)
    fetchAllProducts()
  }

  const handleAddProductFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!addProductForm.productName.trim()) {
      alert("Vui lòng chọn tên thành phẩm!")
      return
    }
    if (addProductForm.quantity <= 0) {
      alert("Số lượng phải lớn hơn 0!")
      return
    }

    const productData = {
      productName: addProductForm.productName.trim(),
      uom: convertStringToUOMInt(addProductForm.uom.toString()),
      quantity: Number(addProductForm.quantity),
    }

    addOutputInfo(params.id, productData)
      .then(() => fetchPOProducts(params.id))
      .then((data: ProductItem[]) => {
        const processedData = (data || []).map((item) => ({
          ...item,
          uom: convertUOMToString(item.uom),
        }))
        setFinishedProducts(processedData)
        alert("Thêm thành phẩm thành công!")
        setShowAddProductModal(false)
        setAddProductForm({ productName: "", uom: "", quantity: 0 })
      })
      .catch((err: any) => {
        alert(`Thêm thành phẩm thất bại: ${err?.message || "Lỗi"}`)
      })
  }

  const handleProductFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!productForm.productName.trim()) {
      alert("Vui lòng chọn tên thành phẩm!")
      return
    }
    if (productForm.quantity <= 0) {
      alert("Số lượng phải lớn hơn 0!")
      return
    }

    const updateData = {
      productName: productForm.productName.trim(),
      uom: convertStringToUOMInt(productForm.uom.toString()),
      amount: Number(productForm.quantity),
    }

    const productIdToUpdate = editingProduct?.outputId || editingProduct?.id
    if (!productIdToUpdate) {
      alert("Không tìm thấy thành phẩm để cập nhật")
      return
    }

    updateOutputInfo(productIdToUpdate, updateData)
      .then(() => fetchPOProducts(params.id))
      .then((data: ProductItem[]) => {
        const processedData = (data || []).map((item) => ({
          ...item,
          uom: convertUOMToString(item.uom),
        }))
        setFinishedProducts(processedData)
        alert("Cập nhật thành phẩm thành công!")
        setShowProductModal(false)
        setEditingProduct(null)
      })
      .catch((err: any) => {
        alert(`Cập nhật thành phẩm thất bại: ${err?.message || "Lỗi"}`)
      })
  }

  const handleMaterialFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const selectedProductData = finishedProducts.find((p) => (p.outputId || p.id) === selectedProduct)
    if (!selectedProductData?.outputId) {
      alert("Không tìm thấy thông tin sản phẩm!")
      return
    }

    if (editingMaterial?.id === undefined || editingMaterial?.id === null) {
      alert("Không có ID nguyên vật liệu để cập nhật!")
      return
    }

    if (!materialForm.productName.trim()) {
      alert("Vui lòng nhập tên nguyên vật liệu!")
      return
    }
    if (materialForm.totalQuantity <= 0) {
      alert("Tổng số lượng phải lớn hơn 0!")
      return
    }

    const selectedMaterialProduct = allProducts.find((p) => p.productName === materialForm.productName.trim())
    if (!selectedMaterialProduct?.id) {
      alert("Không tìm thấy ID sản phẩm cho nguyên vật liệu đã chọn. Vui lòng chọn lại!")
      return
    }

    const updatedMaterialForm = {
      productId: selectedMaterialProduct.id,
      productName: materialForm.productName.trim(),
      amount: materialForm.totalQuantity,
    }

    updateMaterialInfo(editingMaterial.id!, updatedMaterialForm)
      .then(() => fetchMaterialsByOutputId(selectedProductData.outputId!))
      .then((data: ProductWithMaterialsResponse) => {
        if (data && data.materials && Array.isArray(data.materials)) {
          const selectedProductQuantity = getSelectedProductQuantity()
          const materialsWithCalculatedQuantityPer = data.materials.map((material) => ({
            id: material.id,
            productName: material.productName,
            uom: convertUOMToString(material.uom),
            totalQuantity: material.totalQuantity,
            quantityPer: calculateQuantityPer(material.totalQuantity, selectedProductQuantity),
          })) as MaterialItem[]
          setCurrentMaterials(materialsWithCalculatedQuantityPer)
        } else {
          setCurrentMaterials([])
        }
        alert("Cập nhật nguyên vật liệu thành công!")
        setShowMaterialModal(false)
        setEditingMaterial(null)
        setSelectedMaterial(null)
      })
      .catch((err: any) => {
        alert(`Cập nhật nguyên vật liệu thất bại: ${err?.message || "Lỗi"}`)
      })
  }

  const handleAddMaterialFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const selectedProductData = finishedProducts.find((p) => (p.outputId || p.id) === selectedProduct)
    if (!selectedProductData) {
      alert("Không tìm thấy sản phẩm được chọn!")
      return
    }

    if (!addMaterialForm.productName.trim()) {
      alert("Vui lòng chọn tên nguyên vật liệu!")
      return
    }
    if (addMaterialForm.totalQuantity <= 0) {
      alert("Tổng số lượng phải lớn hơn 0!")
      return
    }

    const selectedAddMaterialProduct = allProducts.find((p) => p.productName === addMaterialForm.productName.trim())
    if (!selectedAddMaterialProduct?.id) {
      alert("Không tìm thấy ID sản phẩm cho nguyên vật liệu đã chọn. Vui lòng chọn lại!")
      return
    }

    const materialData = {
      productId: selectedAddMaterialProduct.id,
      productName: addMaterialForm.productName.trim(),
      uom: convertStringToUOMInt(addMaterialForm.uom.toString()),
      totalQuantity: addMaterialForm.totalQuantity,
    }

    addMaterialInfo(params.id, selectedProductData.outputId!, materialData)
      .then(() => fetchMaterialsByOutputId(selectedProductData.outputId!))
      .then((data: ProductWithMaterialsResponse) => {
        if (data && data.materials && Array.isArray(data.materials)) {
          const processedMaterials = data.materials.map((material) => ({
            ...material,
            uom: convertUOMToString(material.uom),
          })) as MaterialItem[]
          setCurrentMaterials(processedMaterials)
        } else {
          setCurrentMaterials([])
        }
        alert("Thêm nguyên vật liệu thành công!")
        setShowAddMaterialModal(false)
        setAddMaterialForm({ productName: "", uom: "", totalQuantity: 0, quantityPer: 0 })
      })
      .catch((err: any) => {
        alert(`Thêm nguyên vật liệu thất bại: ${err?.message || "Lỗi"}`)
      })
  }

  const refreshMaterials = async () => {
    if (!selectedProduct) return
    setLoading(true)
    const selectedProductData = finishedProducts.find((p) => (p.outputId || p.id) === selectedProduct)
    if (!selectedProductData || !selectedProductData.outputId) {
      setLoading(false)
      return
    }

    const outputId = selectedProductData.outputId
    try {
      const data = await fetchMaterialsByOutputId(outputId)
      if (data && data.materials && Array.isArray(data.materials)) {
        const processedMaterials = data.materials.map((material) => ({
          ...material,
          uom: convertUOMToString(material.uom),
        })) as MaterialItem[]
        setCurrentMaterials(processedMaterials)
      } else {
        setCurrentMaterials([])
      }
    } catch {
      setCurrentMaterials([])
    } finally {
      setLoading(false)
    }
  }

  const calculateQuantityPer = (totalQuantity: number, productQuantity: number): number => {
    if (productQuantity === 0) return 0
    return Number((totalQuantity / productQuantity).toFixed(4))
  }

  const getSelectedProductQuantity = (): number => {
    const selectedProductData = finishedProducts.find((p) => (p.outputId || p.id) === selectedProduct)
    return selectedProductData?.quantity || 1
  }

  useEffect(() => {
    if (currentMaterials.length > 0 && selectedProduct) {
      const selectedProductQuantity = getSelectedProductQuantity()
      const updatedMaterials = currentMaterials.map((material) => ({
        ...material,
        quantityPer: calculateQuantityPer(material.totalQuantity, selectedProductQuantity),
      })) as MaterialItem[]
      setCurrentMaterials(updatedMaterials)
    }
  }, [finishedProducts, selectedProduct])

  const selectedProductData = finishedProducts.find((p) => (p.outputId || p.id) === selectedProduct)
  const [tabs, setTabs] = useState<string>("po")
  const toggleTabs = (tab: string) => setTabs(tab)

  return (
    <ProtectedRoute>
      <div className="panel">
        <div className="mb-5">
          <ul className="flex flex-wrap -mb-px border-b border-[#e0e6ed] dark:border-[#191e3a]">
            <li className="mr-2">
              <button
                type="button"
                className={`inline-block p-4 text-sm font-medium rounded-t-lg border-b-2 ${tabs === "po" ? "text-primary border-primary" : "text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"}`}
                onClick={() => toggleTabs("po")}
              >
                Lệnh sản xuất
              </button>
            </li>
            <li className="mr-2">
              <button
                type="button"
                className={`inline-block p-4 text-sm font-medium rounded-t-lg border-b-2 ${tabs === "outputs" ? "text-primary border-primary" : "text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"}`}
                onClick={() => toggleTabs("outputs")}
              >
                Tình trạng sản xuất
              </button>
            </li>
          </ul>
        </div>

        {tabs === "po" && (
          <div>
            <div className="mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h1 className="text-xl font-bold text-[#4361ee] break-words">{orderDescription}</h1>
                <div className="flex items-center gap-2">
                  {orderType && (
                    <span className="px-2 py-1 text-xs rounded bg-[#edf0ff] text-[#4361ee] border">
                      Loại: {orderType}
                    </span>
                  )}
                  {orderStatus && (
                    <span className="px-2 py-1 text-xs rounded bg-green-50 text-green-700 border">
                      Trạng thái: {orderStatus}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/inventoryslip/${params.id}`)}
                    className="px-4 py-2 bg-purple-600 text-white rounded shadow-sm hover:bg-purple-700 transition-colors text-sm"
                  >
                    Xem Phiếu Kho
                  </button>
                </div>
                <button
                  onClick={handleGoBack}
                  className="px-4 py-2 bg-[#4361ee] hover:bg-[#364fc7] text-white text-sm rounded shadow transition-colors"
                >
                  Quay lại
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Thành phẩm */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-semibold text-[#4361ee]">Thành phẩm</h2>
                  <button
                    onClick={refreshProducts}
                    className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded shadow transition-colors"
                    title="Refresh danh sách thành phẩm"
                  >
                    Refresh
                  </button>
                </div>
                <div className="border rounded shadow overflow-x-auto">
                  <table className="w-full text-sm" style={{ minWidth: "600px" }}>
                    <thead className="bg-[#edf0ff]">
                      <tr>
                        <th className="border p-2 w-12">STT</th>
                        <th className="border p-2 min-w-[200px]">Tên TP</th>
                        <th className="border p-2 w-16">ĐVT</th>
                        <th className="border p-2 w-24">Số lượng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {finishedProducts.map((item, index) => (
                        <tr
                          key={`${item.productName}-${index}`}
                          onClick={() => {
                            const productId = item.outputId || item.id
                            if (productId) handleProductSelect(productId)
                          }}
                          className={`hover:bg-blue-50 transition-colors ${
                            selectedProduct === (item.outputId || item.id)
                              ? "bg-[#edf0ff] border-l-4 border-[#4361ee] font-bold"
                              : ""
                          }`}
                        >
                          <td className="border p-2 text-center">{index + 1}</td>
                          <td className="border p-2 break-words max-w-0" title={item.productName}>
                            <div className="truncate">{item.productName}</div>
                          </td>
                          <td className="border p-2 text-center">{item.uom}</td>
                          <td className="border p-2 text-right">{Number(item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Products table section */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleAddProduct}
                    className="px-4 py-2 bg-[#4361ee] hover:bg-[#3651d4] text-white text-sm rounded shadow transition-colors"
                  >
                    Thêm
                  </button>
                  <button
                    onClick={handleUpdateProduct}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded shadow transition-colors"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => {
                      console.log("[v0] Delete button clicked, selectedProduct:", selectedProduct)
                      const selectedItem = finishedProducts.find(
                        (item) => (item.outputId || item.id) === selectedProduct,
                      )
                      console.log("[v0] Found selected item:", selectedItem)
                      const idToDelete = selectedItem?.outputId ?? selectedItem?.id
                      if (typeof idToDelete === 'number') {
                        handleDeleteOutput(idToDelete)
                      }
                    }}
                    disabled={!selectedProduct}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm rounded shadow transition-colors"
                  >
                    Xóa
                  </button>
                </div>
              </div>

              {/* Nguyên vật liệu */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-semibold text-[#4361ee]">
                    Định mức NVL cho:{" "}
                    <span className="bg-[#edf0ff] text-[#4361ee] px-2 py-1 rounded font-mono text-xs">
                      {selectedProductData?.productName || ""}
                    </span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={refreshMaterials}
                      className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded shadow transition-colors"
                      title="Refresh danh sách nguyên vật liệu"
                    >
                      Refresh
                    </button>
                    {loading && (
                      <div className="text-sm text-[#4361ee] flex items-center">
                        <div className="animate-spin h-4 w-4 border-b-2 border-[#4361ee] rounded-full mr-2" />
                        Đang tải...
                      </div>
                    )}
                  </div>
                </div>
                <div className="border rounded shadow">
                  <div className="overflow-x-auto">
                    <table
                      className="w-full text-sm"
                      style={{ minWidth: "700px" }}
                      key={`materials-${selectedProduct}`}
                    >
                      <thead className="bg-[#edf0ff]">
                        <tr>
                          <th className="border p-2 w-12">STT</th>
                          <th className="border p-2 min-w-[250px]">Tên NVL</th>
                          <th className="border p-2 w-16">ĐVT</th>
                          <th className="border p-2 w-24">Tổng SL</th>
                          <th className="border p-2 w-24">SL / 1 SP</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan={5} className="p-4 text-center text-gray-500 italic">
                              Đang tải dữ liệu...
                            </td>
                          </tr>
                        ) : currentMaterials.length > 0 ? (
                          currentMaterials.map((material, index) => (
                            <tr
                              key={`${selectedProduct}-${material.id}-${index}`}
                              className={`cursor-pointer transition-colors ${
                                selectedMaterial?.productName === material.productName
                                  ? "bg-[#e8f5e8] border-l-4 border-[#28a745] font-bold"
                                  : "hover:bg-blue-50"
                              }`}
                              onClick={() => handleMaterialSelect(material)}
                              title="Click để chọn nguyên vật liệu này"
                            >
                              <td className="border p-2 text-center">{index + 1}</td>
                              <td className="border p-2 break-words max-w-0">
                                <div
                                  className="truncate cursor-pointer hover:text-blue-600 hover:underline"
                                  title="Click để xem đầy đủ tên nguyên vật liệu"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    showDetailInfo("Tên nguyên vật liệu", material.productName)
                                  }}
                                >
                                  {material.productName}
                                </div>
                              </td>
                              <td className="border p-2 text-center">{material.uom}</td>
                              <td className="border p-2 text-right">{material.totalQuantity}</td>
                              <td className="border p-2 text-right">{material.quantityPer}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="border p-4 text-center text-gray-500 italic">
                              {selectedProduct
                                ? `Không có nguyên vật liệu cho sản phẩm ${selectedProduct}`
                                : "Chọn sản phẩm để xem nguyên vật liệu"}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleAddMaterial}
                    className="px-4 py-2 bg-[#4361ee] hover:bg-[#364fc7] text-white text-sm rounded shadow transition-colors"
                  >
                    Thêm
                  </button>
                  <button
                    onClick={handleUpdateMaterial}
                    className={`px-4 py-2 text-white text-sm rounded shadow transition-colors ${selectedMaterial ? "bg-[#28a745] hover:bg-[#218838]" : "bg-gray-400 cursor-not-allowed"}`}
                    disabled={!selectedMaterial}
                    title={
                      selectedMaterial ? `Cập nhật ${selectedMaterial.productName}` : "Chọn nguyên vật liệu để cập nhật"
                    }
                  >
                    Sửa{" "}
                    {selectedMaterial
                      ? `(${selectedMaterial.productName.length > 20 ? selectedMaterial.productName.substring(0, 20) + "..." : selectedMaterial.productName})`
                      : ""}
                  </button>
                  <button
                    onClick={() => {
                      if (selectedMaterial?.id) handleDeleteMaterial(selectedMaterial.id)
                    }}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded shadow transition-colors"
                    disabled={!selectedMaterial}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {tabs === "outputs" && (
          <div>
            <div>
              <ListOutputsPO productionOrderId={Number(params.id)} />
            </div>
          </div>
        )}

        {/* POPUP THÊM THÀNH PHẨM */}
        {showAddProductModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeAddProductModal()
            }}
          >
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 animate-in fade-in duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#4361ee]">Thêm thành phẩm mới</h3>
                <button
                  onClick={closeAddProductModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleAddProductFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên thành phẩm</label>
                  {isLoadingAllProducts ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center justify-center">
                      <div className="animate-spin h-4 w-4 border-b-2 border-[#4361ee] rounded-full mr-2" />
                      <span className="text-gray-500">Đang tải danh sách sản phẩm...</span>
                    </div>
                  ) : (
                    <select
                      value={addProductForm.productName}
                      onChange={(e) => {
                        const selectedProduct = allProducts.find((p) => p.productName === e.target.value)
                        setAddProductForm({
                          ...addProductForm,
                          productName: e.target.value,
                          uom: selectedProduct ? selectedProduct.uom : "",
                        })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4361ee] focus:border-transparent"
                      required
                    >
                      <option value="">-- Chọn thành phẩm --</option>
                      {allProducts.map((product, index) => (
                        <option key={`${product.productName}-${index}`} value={product.productName}>
                          {product.productName} ({product.uom})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị tính</label>
                  <input
                    type="text"
                    value={addProductForm.uom}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                    readOnly
                    placeholder="Đơn vị tính sẽ được lấy từ sản phẩm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
                  <input
                    type="number"
                    value={addProductForm.quantity}
                    onChange={(e) => setAddProductForm({ ...addProductForm, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4361ee] focus:border-transparent"
                    required
                    min="0"
                    step="0.01"
                    placeholder="Nhập số lượng"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[#4361ee] hover:bg-[#364fc7] text-white rounded-md transition-colors font-medium"
                  >
                    Thêm mới
                  </button>
                  <button
                    type="button"
                    onClick={closeAddProductModal}
                    className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors font-medium"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* POPUP CẬP NHẬT THÀNH PHẨM */}
        {showProductModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeProductModal()
            }}
          >
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 animate-in fade-in duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#4361ee]">Cập nhật thành phẩm</h3>
                <button
                  onClick={closeProductModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleProductFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên thành phẩm</label>
                  {isLoadingAllProducts ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center justify-center">
                      <div className="animate-spin h-4 w-4 border-b-2 border-[#4361ee] rounded-full mr-2" />
                      <span className="text-gray-500">Đang tải danh sách sản phẩm...</span>
                    </div>
                  ) : (
                    <select
                      value={productForm.productName}
                      onChange={(e) => {
                        const selectedProduct = allProducts.find((p) => p.productName === e.target.value)
                        setProductForm({
                          ...productForm,
                          productName: e.target.value,
                          uom: selectedProduct ? selectedProduct.uom : "",
                        })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4361ee] focus:border-transparent"
                      required
                    >
                      <option value="">-- Chọn thành phẩm --</option>
                      {allProducts.map((product, index) => (
                        <option key={`${product.productName}-${index}`} value={product.productName}>
                          {product.productName} ({product.uom})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị tính</label>
                  <input
                    type="text"
                    value={productForm.uom as string}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                    readOnly
                    placeholder="Đơn vị tính sẽ được lấy từ sản phẩm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
                  <input
                    type="number"
                    value={productForm.quantity as number}
                    onChange={(e) => setProductForm({ ...productForm, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4361ee] focus:border-transparent"
                    required
                    min="0"
                    step="0.01"
                    placeholder="Nhập số lượng"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[#4361ee] hover:bg-[#364fc7] text-white rounded-md transition-colors font-medium"
                  >
                    Cập nhật
                  </button>
                  <button
                    type="button"
                    onClick={closeProductModal}
                    className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors font-medium"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* POPUP THÊM NGUYÊN VẬT LIỆU */}
        {showAddMaterialModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeAddMaterialModal()
            }}
          >
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 animate-in fade-in duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#4361ee]">
                  Thêm nguyên vật liệu mới
                  <div className="text-sm font-normal text-gray-600 mt-1">
                    Cho sản phẩm: <span className="font-mono text-[#4361ee]">{selectedProductData?.productName}</span>
                  </div>
                </h3>
                <button
                  onClick={closeAddMaterialModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleAddMaterialFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên nguyên vật liệu</label>
                  {isLoadingAllProducts ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center justify-center">
                      <div className="animate-spin h-4 w-4 border-b-2 border-[#4361ee] rounded-full mr-2" />
                      <span className="text-gray-500">Đang tải danh sách sản phẩm...</span>
                    </div>
                  ) : (
                    <select
                      value={addMaterialForm.productName}
                      onChange={(e) => {
                        const selectedProduct = allProducts.find((p) => p.productName === e.target.value)
                        setAddMaterialForm({
                          ...addMaterialForm,
                          productName: e.target.value,
                          uom: selectedProduct ? selectedProduct.uom : "",
                        })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4361ee] focus:border-transparent"
                      required
                    >
                      <option value="">-- Chọn nguyên vật liệu --</option>
                      {allProducts.map((product, index) => (
                        <option key={`${product.productName}-${index}`} value={product.productName}>
                          {product.productName} ({product.uom})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị tính</label>
                  <input
                    type="text"
                    value={addMaterialForm.uom as string}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                    readOnly
                    placeholder="Đơn vị tính sẽ được lấy từ sản phẩm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tổng số lượng</label>
                  <input
                    type="number"
                    value={addMaterialForm.totalQuantity as number}
                    onChange={(e) => {
                      const newTotalQuantity = Number(e.target.value)
                      const selectedProductQuantity = getSelectedProductQuantity()
                      const newQuantityPer = calculateQuantityPer(newTotalQuantity, selectedProductQuantity)
                      setAddMaterialForm({
                        ...addMaterialForm,
                        totalQuantity: newTotalQuantity,
                        quantityPer: newQuantityPer,
                      })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4361ee] focus:border-transparent"
                    required
                    min="0"
                    step="0.01"
                    placeholder="Tổng số lượng cần thiết"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    SL/1SP: {addMaterialForm.quantityPer?.toFixed(4)} (tự động tính)
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[#4361ee] hover:bg-[#364fc7] text-white rounded-md transition-colors font-medium"
                  >
                    Thêm mới
                  </button>
                  <button
                    type="button"
                    onClick={closeAddMaterialModal}
                    className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors font-medium"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* POPUP CẬP NHẬT NGUYÊN VẬT LIỆU */}
        {showMaterialModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeMaterialModal()
            }}
          >
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 animate-in fade-in duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#4361ee]">Cập nhật nguyên vật liệu</h3>
                <button
                  onClick={closeMaterialModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleMaterialFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên nguyên vật liệu</label>
                  {isLoadingAllProducts ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center justify-center">
                      <div className="animate-spin h-4 w-4 border-b-2 border-[#4361ee] rounded-full mr-2" />
                      <span className="text-gray-500">Đang tải danh sách sản phẩm...</span>
                    </div>
                  ) : (
                    <select
                      value={materialForm.productName}
                      onChange={(e) => {
                        const selectedProduct = allProducts.find((p) => p.productName === e.target.value)
                        setMaterialForm({
                          ...materialForm,
                          productName: e.target.value,
                          uom: selectedProduct ? selectedProduct.uom : materialForm.uom,
                        })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4361ee] focus:border-transparent"
                      required
                    >
                      <option value="">-- Chọn nguyên vật liệu --</option>
                      {allProducts.map((product, index) => (
                        <option key={`${product.productName}-${index}`} value={product.productName}>
                          {product.productName} ({product.uom})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị tính</label>
                  <input
                    type="text"
                    value={materialForm.uom as string}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                    readOnly
                    placeholder="Đơn vị tính sẽ được lấy từ sản phẩm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng / 1 SP</label>
                  <input
                    type="number"
                    value={Number(materialForm.quantityPer).toFixed(4)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50 text-blue-800 cursor-not-allowed"
                    readOnly
                    placeholder="Tự động tính toán"
                  />
                  <div className="text-xs text-blue-600 mt-1">
                    Công thức: {materialForm.totalQuantity} ÷ {getSelectedProductQuantity()} ={" "}
                    {Number(materialForm.quantityPer).toFixed(4)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tổng số lượng</label>
                  <input
                    type="number"
                    value={materialForm.totalQuantity as number}
                    onChange={(e) => {
                      const newTotalQuantity = Number(e.target.value)
                      const selectedProductQuantity = getSelectedProductQuantity()
                      const newQuantityPer = calculateQuantityPer(newTotalQuantity, selectedProductQuantity)
                      setMaterialForm({
                        ...materialForm,
                        totalQuantity: newTotalQuantity,
                        quantityPer: newQuantityPer,
                      })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4361ee] focus:border-transparent"
                    required
                    min="0"
                    step="0.01"
                    placeholder="Tổng số lượng cần thiết"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    SL/1SP sẽ được tính tự động: {Number(materialForm.quantityPer).toFixed(4)}
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-[#4361ee] hover:bg-[#364fc7] text-white rounded-md transition-colors font-medium"
                  >
                    Cập nhật
                  </button>
                  <button
                    type="button"
                    onClick={closeMaterialModal}
                    className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors font-medium"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDetailModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeDetailModal()
            }}
          >
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4 animate-in fade-in duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#4361ee]">{detailContent.title}</h3>
                <button
                  onClick={closeDetailModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
              <div className="bg-gray-50 p-4 rounded-md border">
                <p className="text-gray-800 break-words leading-relaxed">{detailContent.content}</p>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={closeDetailModal}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors font-medium"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
