"use client"

import { useEffect, useState } from "react"
import type React from "react"
import { useRouter } from "next/navigation"
import ListOutputsPO from "@/components/VNG/manager/production-orders/list-outputs-of-po/list-outputs-po-components"
import CuttingGlassPage from "@/app/(defaults)/cutting-glass/CuttingGlassPage"
import GlueButylExportModalComponent from "@/components/VNG/manager/glue-butyl-export-modal-component"
import ChemicalExportModalComponent from "@/components/VNG/manager/chemical-export-modal-component"
import ListChemicalExport from "@/components/VNG/manager/chemical-export/list-chemical-export"
import type { Chemical, Product } from "@/app/(defaults)/production-plans/service"
import ListExportsPO from "@/components/VNG/manager/production-plans/list-export-glue-components"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import externalAxios from "@/setup/axios"

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

interface MaterialItem {
  id?: number
  productName: string
  uom: string | number // Support both string and int
  quantityPer: number
  totalQuantity: number
}

interface ProductItem {
  id?: number
  outputId?: number
  productName: string
  uom: string | number // Support both string and int
  quantity: number
  done?: number
}

interface ApiResponse {
  product: ProductItem
  materials: MaterialItem[]
}

export default function ProductionOrderView({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [finishedProducts, setFinishedProducts] = useState<ProductItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null)
  const [currentMaterials, setCurrentMaterials] = useState<MaterialItem[]>([])
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [orderDescription, setOrderDescription] = useState<string>("")

  // Modal states
  const [showProductModal, setShowProductModal] = useState(false)
  const [showMaterialModal, setShowMaterialModal] = useState(false)
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false)
  const [showGlueButylModal, setShowGlueButylModal] = useState(false)
  const [showChemicalExportModal, setShowChemicalExportModal] = useState(false)
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
    quantityPer: 0,
    totalQuantity: 0,
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
    quantityPer: 0,
    totalQuantity: 0,
  })

  // Thêm state mới cho danh sách tất cả products
  const [allProducts, setAllProducts] = useState<ProductItem[]>([])
  const [isLoadingAllProducts, setIsLoadingAllProducts] = useState(false)

  // Add separate states for product add modal autocomplete
  const [productAddSuggestions, setProductAddSuggestions] = useState<ProductItem[]>([])
  const [showProductAddSuggestions, setShowProductAddSuggestions] = useState(false)
  const [isLoadingProductAddSuggestions, setIsLoadingProductAddSuggestions] = useState(false)

  const productsWithMaterials = ["VT00372", "VT00090"]
  const [exportGlueButylProducts, setExportGlueButylProducts] = useState<Product[]>([])

  const defaultChemicals: Chemical[] = [
    { type: "Keo silicone", uom: "kg", quantity: 0 },
    { type: "Butyl sealant", uom: "kg", quantity: 0 },
    { type: "Chất xúc tác", uom: "kg", quantity: 0 },
  ]

  const [refreshFlag, setRefreshFlag] = useState(0)
  const [selectedOperation, setSelectedOperation] = useState<string>("")

  const employees = [
    {
      id: 1,
      name: "Tran Cao Minh",
    },
    {
      id: 2,
      name: "Nguyen Tuan Kiet",
    },
  ]

  // Thêm state mới cho modal xem chi tiết
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailContent, setDetailContent] = useState({ title: '', content: '' })

  const closeAddProductModal = () => {
    setShowAddProductModal(false)
  }

  const closeAddMaterialModal = () => {
    setShowAddMaterialModal(false)
  }

  const closeProductModal = () => {
    setShowProductModal(false)
  }

  const closeMaterialModal = () => {
    setShowMaterialModal(false)
  }

  const showDetailInfo = (title: string, content: string) => {
    setDetailContent({ title, content })
    setShowDetailModal(true)
  }

  const closeDetailModal = () => {
    setShowDetailModal(false)
    setDetailContent({ title: '', content: '' })
  }

  useEffect(() => {
    externalAxios.get(`/api/ProductionAccountantControllers/production-ordersDetails/${params.id}`)
      .then((response) => {
        const data: ProductItem[] = response.data
        console.log("Dữ liệu thành phẩm nhận được:", data)

        // Convert UOM từ int sang string cho hiển thị
        const processedData = (data || []).map((item) => ({
          ...item,
          uom: convertUOMToString(item.uom),
        }))

        setFinishedProducts(processedData)
        setExportGlueButylProducts(
          processedData.map((item) => ({
            name: item.productName,
            quantity: item.quantity - (item.done ?? 0),
            glueButyls: defaultChemicals.map((c) => ({ ...c })),
          })),
        )

        if (processedData && processedData.length > 0) {
          const productWithMaterials = processedData.find((p) => p.productName === "VT00372") || processedData[0]
          const productId = productWithMaterials.outputId || productWithMaterials.id
          if (productId) {
            setSelectedProduct(productId)
          }
        }
      })
      .catch((err) => console.error("Lỗi khi fetch thành phẩm:", err))
  }, [params.id, refreshFlag])

  const handleExportSuccess = () => {
    setRefreshFlag((prev) => prev + 1)
  }

  useEffect(() => {
    if (!selectedProduct) return
    setLoading(true)
    setCurrentMaterials([])
    setSelectedMaterial(null)

    const selectedProductData = finishedProducts.find((p) => (p.outputId || p.id) === selectedProduct)
    if (!selectedProductData || !selectedProductData.outputId) {
      console.warn("Không tìm thấy outputId cho sản phẩm:", selectedProduct)
      setLoading(false)
      return
    }

    const outputId = selectedProductData.outputId
    console.log("Fetching materials with outputId:", outputId, "for product:", selectedProduct)

    externalAxios.get(`/api/ProductionAccountantControllers/products-materials-by-output/${outputId}`)
      .then((response) => {
        const data: ApiResponse = response.data
        console.log("Materials data received:", data)
        
        if (data && data.materials && Array.isArray(data.materials)) {
          const selectedProductQuantity = getSelectedProductQuantity()

          // Convert UOM từ int sang string cho materials
          const materialsWithCalculatedQuantityPer = data.materials.map((material: MaterialItem) => ({
            ...material,
            uom: convertUOMToString(material.uom),
            quantityPer: calculateQuantityPer(material.totalQuantity, selectedProductQuantity),
          }))

          console.log("Materials with calculated quantityPer:", materialsWithCalculatedQuantityPer)
          setCurrentMaterials(materialsWithCalculatedQuantityPer)
        } else {
          setCurrentMaterials([])
        }
      })
      .catch((err) => {
        console.error("API Error:", err)
        setCurrentMaterials([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [params.id, selectedProduct, finishedProducts])

  useEffect(() => {
    externalAxios.get(`/api/ProductionAccountantControllers/production-order-info/${params.id}`)
      .then((response) => {
        const data = response.data
        if (data?.description) setOrderDescription(data.description)
      })
  }, [params.id])

  const handleProductSelect = (id: number | undefined) => {
    if (id && id !== selectedProduct) {
      setSelectedProduct(id)
      setCurrentMaterials([])
      setSelectedMaterial(null)
    }
  }

  const handleMaterialSelect = (material: MaterialItem) => {
    setSelectedMaterial(material)
  }

  const handleGoBack = () => {
    router.push("/production-orders/")
  }

  const handleOperationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setSelectedOperation(value)

    if (value === "xuat-hoa-chat") {
      setShowChemicalExportModal(true)
    } else if (value === "xuat-keo-bytul") {
      setShowGlueButylModal(true)
    } else if (value === "cat-kinh") {
      router.push(`/cutting-glass/${params.id}`)
    } else {
      setShowGlueButylModal(false)
      setShowChemicalExportModal(false)
    }
  }

  // Fetch tất cả products khi mở modal
  const fetchAllProducts = async () => {
    setIsLoadingAllProducts(true)
    try {
      const response = await externalAxios.get(`/api/Product`)
      const allProducts = response.data
      console.log("📦 Raw products from API:", allProducts) // Log raw data

      const processedProducts = allProducts.map((product: ProductItem) => {
        return {
          ...product,
          uom: convertUOMToString(product.uom),
        }
      })
      console.log("📦 All products (no type filter):", processedProducts)
      setAllProducts(processedProducts)
    } catch (error) {
      console.error("Lỗi khi gọi API:", error)
      setAllProducts([])
    } finally {
      setIsLoadingAllProducts(false)
    }
  }

  const handleAddProduct = () => {
    setAddProductForm({
      productName: "",
      uom: "",
      quantity: 0,
    })
    fetchAllProducts() // Load tất cả products khi mở modal
    setShowAddProductModal(true)
  }

  const handleUpdateProduct = () => {
    if (finishedProducts.length === 0) {
      alert("Không có thành phẩm nào để cập nhật")
      return
    }
    const productToEdit = finishedProducts.find((p) => (p.outputId || p.id) === selectedProduct) || finishedProducts[0]
    setEditingProduct(productToEdit)
    setProductForm({ ...productToEdit })
    fetchAllProducts() // Load tất cả products khi mở modal
    setShowProductModal(true)
  }

  const handleAddMaterial = () => {
    if (!selectedProduct) {
      alert("Vui lòng chọn sản phẩm trước khi thêm nguyên vật liệu!")
      return
    }
    setAddMaterialForm({
      productName: "",
      uom: "",
      quantityPer: 0,
      totalQuantity: 0,
    })
    fetchAllProducts() // Load tất cả products khi mở modal
    setShowAddMaterialModal(true)
  }

  const handleUpdateMaterial = () => {
    if (!selectedMaterial) {
      alert("Vui lòng chọn một nguyên vật liệu để cập nhật!")
      return
    }
    setEditingMaterial(selectedMaterial)
    setMaterialForm({ ...selectedMaterial })
    fetchAllProducts() // Load tất cả products khi mở modal
    setShowMaterialModal(true)
  }

  const handleAddProductFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!addProductForm.productName.trim()) {
      alert("Vui lòng chọn tên thành phẩm!")
      return
    }
    // UOM sẽ được lấy từ sản phẩm được chọn, không cần validate riêng
    if (addProductForm.quantity <= 0) {
      alert("Số lượng phải lớn hơn 0!")
      return
    }

    // Convert UOM từ string sang int trước khi gửi lên server
    const productData = {
      productName: addProductForm.productName.trim(),
      uom: convertStringToUOMInt(addProductForm.uom.toString()),
      quantity: Number(addProductForm.quantity),
    }

    console.log("Đang gửi dữ liệu thành phẩm:", productData)

    fetch(`https://localhost:7075/api/ProductionAccountantControllers/add-output-info/${params.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(productData),
    })
      .then(async (res) => {
        console.log("Response status:", res.status)
        const responseText = await res.text()
        console.log("Response body:", responseText)
        if (!res.ok) {
          try {
            const errorData = JSON.parse(responseText)
            throw new Error(`HTTP ${res.status}: ${errorData.message || errorData.title || responseText}`)
          } catch (parseError) {
            throw new Error(`HTTP ${res.status}: ${responseText || res.statusText}`)
          }
        }
        return responseText
      })
      .then((responseText) => {
        console.log("Response từ server:", responseText)
        return fetch(`https://localhost:7075/api/ProductionAccountantControllers/production-ordersDetails/${params.id}`)
      })
      .then((res) => res.json())
      .then((data: ProductItem[]) => {
        console.log("Dữ liệu thành phẩm sau khi refresh:", data)

        // Convert UOM từ int sang string
        const processedData = (data || []).map((item) => ({
          ...item,
          uom: convertUOMToString(item.uom),
        }))

        setFinishedProducts(processedData)
        alert("Thêm thành phẩm thành công!")
        setShowAddProductModal(false)
        setAddProductForm({ productName: "", uom: "", quantity: 0 })
        setShowProductAddSuggestions(false)
        setProductAddSuggestions([])
      })
      .catch((err) => {
        console.error("Lỗi chi tiết:", err)
        alert(`Thêm thành phẩm thất bại: ${err.message}`)
      })
  }

  const handleProductFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!productForm.productName.trim()) {
      alert("Vui lòng chọn tên thành phẩm!")
      return
    }
    // UOM sẽ được lấy từ sản phẩm được chọn, không cần validate riêng
    if (productForm.quantity <= 0) {
      alert("Số lượng phải lớn hơn 0!")
      return
    }

    // Convert UOM từ string sang int trước khi gửi lên server
    const updateData = {
      productName: productForm.productName.trim(),
      uom: convertStringToUOMInt(productForm.uom.toString()),
      amount: Number(productForm.quantity),
    }

    const productIdToUpdate = editingProduct?.outputId || editingProduct?.id
    fetch(`https://localhost:7075/api/ProductionAccountantControllers/update-output-info/${productIdToUpdate}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(updateData),
    })
      .then(async (res) => {
        if (!res.ok) {
          const responseText = await res.text()
          console.error("Update error response:", responseText)
          try {
            const errorData = JSON.parse(responseText)
            throw new Error(`HTTP ${res.status}: ${errorData.message || errorData.title || responseText}`)
          } catch (parseError) {
            throw new Error(`HTTP ${res.status}: ${responseText || res.statusText}`)
          }
        }
        return res.json()
      })
      .then(() => {
        return fetch(`https://localhost:7075/api/ProductionAccountantControllers/production-ordersDetails/${params.id}`)
      })
      .then((res) => res.json())
      .then((data: ProductItem[]) => {
        // Convert UOM từ int sang string
        const processedData = (data || []).map((item) => ({
          ...item,
          uom: convertUOMToString(item.uom),
        }))

        setFinishedProducts(processedData)
        alert("Cập nhật thành phẩm thành công!")
        setShowProductModal(false)
        setEditingProduct(null)
      })
      .catch((err) => {
        console.error("Cập nhật thành phẩm lỗi:", err)
        alert(`Cập nhật thành phẩm thất bại: ${err.message}`)
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

    // Tìm productId dựa trên productName
    const selectedMaterialProduct = allProducts.find((p) => p.productName === materialForm.productName.trim())

    if (!selectedMaterialProduct?.id) {
      alert("Không tìm thấy ID sản phẩm cho nguyên vật liệu đã chọn. Vui lòng chọn lại!")
      console.error("Không tìm thấy ID sản phẩm cho nguyên vật liệu:", materialForm.productName)
      return
    }

    const updatedMaterialForm = {
      productId: selectedMaterialProduct.id, 
      productName: materialForm.productName.trim(), 
      amount: materialForm.totalQuantity,
    }

    console.log("--- Bắt đầu cập nhật nguyên vật liệu ---")
    console.log("Payload gửi đi:", updatedMaterialForm)
    console.log("ID nguyên vật liệu cần cập nhật (editingMaterial.id):", editingMaterial.id)
    console.log("ID sản phẩm được chọn (selectedMaterialProduct.id):", selectedMaterialProduct.id)
    console.log("Tên sản phẩm được chọn (materialForm.productName):", materialForm.productName)
    console.log("Tổng số lượng (materialForm.totalQuantity):", materialForm.totalQuantity)

    const updateUrl = `https://localhost:7075/api/ProductionAccountantControllers/update-material-info/${editingMaterial.id}`

    fetch(updateUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(updatedMaterialForm),
    })
      .then(async (res) => {
        console.log("Update response status:", res.status)
        if (!res.ok) {
          const responseText = await res.text()
          console.error("Update error response:", responseText)
          try {
            const errorData = JSON.parse(responseText)
            throw new Error(`HTTP ${res.status}: ${errorData.message || errorData.title || responseText}`)
          } catch (parseError) {
            throw new Error(`HTTP ${res.status}: ${responseText || res.statusText}`)
          }
        }
        const responseText = await res.text()
        console.log("Update success response (raw text):", responseText)
        return responseText
      })
      .then(() => {
        const refreshUrl = `https://localhost:7075/api/ProductionAccountantControllers/products-materials-by-output/${selectedProductData.outputId}`
        console.log("Refreshing materials from:", refreshUrl)
        return fetch(refreshUrl)
      })
      .then((res) => {
        console.log("Refresh response status:", res.status)
        if (res.status === 404) return { notFound: true }
        if (!res.ok) throw new Error(`Refresh failed: HTTP ${res.status}`)
        return res.json()
      })
      .then((data: ApiResponse | { notFound: boolean }) => {
        console.log("Refreshed materials data:", data)
        if ("notFound" in data) {
          setCurrentMaterials([])
        } else if (data && data.materials && Array.isArray(data.materials)) {
          const selectedProductQuantity = getSelectedProductQuantity()
          const materialsWithCalculatedQuantityPer = data.materials.map((material: MaterialItem) => ({
            id: material.id,
            productName: material.productName,
            uom: convertUOMToString(material.uom), // Convert UOM từ int sang string
            totalQuantity: material.totalQuantity,
            quantityPer: calculateQuantityPer(material.totalQuantity, selectedProductQuantity),
          }))
          setCurrentMaterials(materialsWithCalculatedQuantityPer)
        } else {
          setCurrentMaterials([])
        }
        alert("Cập nhật nguyên vật liệu thành công!")
        setShowMaterialModal(false)
        setEditingMaterial(null)
        setSelectedMaterial(null)
        console.log("--- Kết thúc cập nhật nguyên vật liệu ---")
      })
      .catch((err) => {
        console.error("Cập nhật nguyên vật liệu lỗi:", err)
        alert(`Cập nhật nguyên vật liệu thất bại: ${err.message}`)
        console.log("--- Cập nhật nguyên vật liệu thất bại ---")
      })
  }

  const handleAddMaterialFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const selectedProductData = finishedProducts.find((p) => (p.outputId || p.id) === selectedProduct)
    if (!selectedProductData) {
      alert("Không tìm thấy sản phẩm được chọn!")
      return
    }

    // Validate dữ liệu trước khi gửi
    if (!addMaterialForm.productName.trim()) {
      alert("Vui lòng chọn tên nguyên vật liệu!")
      return
    }
    // UOM sẽ được lấy từ sản phẩm được chọn, không cần validate riêng
    if (addMaterialForm.totalQuantity <= 0) {
      alert("Tổng số lượng phải lớn hơn 0!")
      return
    }

    const selectedAddMaterialProduct = allProducts.find((p) => p.productName === addMaterialForm.productName.trim())

    if (!selectedAddMaterialProduct?.id) {
      alert("Không tìm thấy ID sản phẩm cho nguyên vật liệu đã chọn. Vui lòng chọn lại!")
      console.error("Không tìm thấy ID sản phẩm cho nguyên vật liệu:", addMaterialForm.productName)
      return
    }

    const materialData = {
      productId: selectedAddMaterialProduct.id, 
      productName: addMaterialForm.productName.trim(), 
      uom: convertStringToUOMInt(addMaterialForm.uom.toString()), 
      totalQuantity: addMaterialForm.totalQuantity,
    }

    console.log("--- Bắt đầu thêm nguyên vật liệu ---")
    console.log("Đang gửi dữ liệu NVL payload:", materialData)
    console.log("Selected product outputId:", selectedProductData.outputId)
    console.log("🔧 productId được gửi:", selectedAddMaterialProduct.id)

    const url = `https://localhost:7075/api/ProductionAccountantControllers/add-material-info/${params.id}?outputId=${selectedProductData.outputId}`

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(materialData),
    })
      .then(async (res) => {
        console.log("Response status:", res.status)
        console.log("Request URL:", url)
        console.log("Request body:", JSON.stringify(materialData))

        if (!res.ok) {
          const responseText = await res.text()
          console.error("Error response:", responseText)
          throw new Error(`HTTP ${res.status}: ${responseText || res.statusText}`)
        }
        return res.text()
      })
      .then((responseText) => {
        console.log("Response từ server:", responseText)
        const outputId = selectedProductData.outputId
        const refreshUrl = `https://localhost:7075/api/ProductionAccountantControllers/products-materials-by-output/${outputId}`
        console.log("Refreshing materials with outputId:", outputId)
        return fetch(refreshUrl)
      })
      .then((res) => {
        console.log("Refresh response status:", res.status)
        if (res.status === 404) return { notFound: true }
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        return res.json()
      })
      .then((data: ApiResponse | { notFound: boolean }) => {
        console.log("Dữ liệu NVL sau khi refresh:", data)
        if ("notFound" in data) {
          console.log("No materials found after refresh")
          setCurrentMaterials([])
        } else if (data && data.materials && Array.isArray(data.materials)) {
          console.log("Setting materials:", data.materials)

          // Convert UOM từ int sang string cho materials
          const processedMaterials = data.materials.map((material: MaterialItem) => ({
            ...material,
            uom: convertUOMToString(material.uom),
          }))

          setCurrentMaterials(processedMaterials)
        } else {
          console.log("Invalid data structure:", data)
          setCurrentMaterials([])
        }
        alert("Thêm nguyên vật liệu thành công!")
        setShowAddMaterialModal(false)
        setAddMaterialForm({ productName: "", uom: "", quantityPer: 0, totalQuantity: 0 })
        console.log("--- Kết thúc thêm nguyên vật liệu ---")
      })
      .catch((err) => {
        console.error("Lỗi chi tiết:", err)
        alert(`Thêm nguyên vật liệu thất bại: ${err.message}`)
        console.log("--- Thêm nguyên vật liệu thất bại ---")
      })
  }

  const handleAddProductCodeChange = async (value: string) => {
    // This function is no longer needed for the select dropdown,
    // but keeping it for now if there's any other usage.
    // For the select, we just set the value directly.
    setAddProductForm({ ...addProductForm, productName: value })
    // The autocomplete logic below is now redundant for the select dropdown
    // but might be useful if you revert to autocomplete or have other inputs.
    console.log("Đang tìm kiếm sản phẩm:", value)
    if (value.length < 2) {
      setProductAddSuggestions([])
      setShowProductAddSuggestions(false)
      return
    }

    setIsLoadingProductAddSuggestions(true)
    try {
      const response = await fetch(`https://localhost:7075/api/Product`)
      if (response.ok) {
        const allProducts = await response.json()
        console.log("Dữ liệu sản phẩm cho Add Product:", allProducts)

        // Convert UOM từ int sang string cho suggestions
        const processedProducts = allProducts.map((product: ProductItem) => ({
          ...product,
          uom: convertUOMToString(product.uom),
        }))

        const filteredProducts = processedProducts.filter((product: ProductItem) =>
          product.productName.toLowerCase().includes(value.toLowerCase()),
        )
        console.log("Kết quả lọc cho Add Product:", filteredProducts)
        setProductAddSuggestions(filteredProducts.slice(0, 10))
        setShowProductAddSuggestions(true)
      } else {
        console.error("API trả về lỗi:", response.status, response.statusText)
        setProductAddSuggestions([])
        setShowProductAddSuggestions(false)
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error)
      setProductAddSuggestions([])
      setShowProductAddSuggestions(false)
    } finally {
      setIsLoadingProductAddSuggestions(false)
    }
  }

  const handleProductAddSuggestionSelect = (suggestion: ProductItem) => {
    // This function is no longer needed for the select dropdown
    setAddProductForm({
      ...addProductForm,
      productName: suggestion.productName,
      uom: suggestion.uom,
    })
    setShowProductAddSuggestions(false)
    setProductAddSuggestions([])
  }

  const refreshMaterials = async () => {
    if (!selectedProduct) return
    setLoading(true)
    const selectedProductData = finishedProducts.find((p) => (p.outputId || p.id) === selectedProduct)
    if (!selectedProductData || !selectedProductData.outputId) {
      console.warn("Không tìm thấy outputId cho sản phẩm:", selectedProduct)
      setLoading(false)
      return
    }

    const outputId = selectedProductData.outputId
    const url = `https://localhost:7075/api/ProductionAccountantControllers/products-materials-by-output/${outputId}`
    console.log("Manual refresh with outputId:", outputId, "URL:", url)

    try {
      const res = await fetch(url)
      console.log("📡 Manual refresh response status:", res.status)
      if (res.status === 404) {
        setCurrentMaterials([])
        return
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      const data = await res.json()
      console.log("Manual refresh data:", data)
      if (data && data.materials && Array.isArray(data.materials)) {
        // Convert UOM từ int sang string cho materials
        const processedMaterials = data.materials.map((material: MaterialItem) => ({
          ...material,
          uom: convertUOMToString(material.uom),
        }))
        setCurrentMaterials(processedMaterials)
      } else {
        setCurrentMaterials([])
      }
    } catch (err) {
      console.error("Manual refresh error:", err)
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
      }))
      console.log("Recalculating quantityPer for materials due to product quantity change")
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
            {/* <li className="mr-2">
              <button
                type="button"
                className={`inline-block p-4 text-sm font-medium rounded-t-lg border-b-2 ${tabs === "cut-glass" ? "text-primary border-primary" : "text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"}`}
                onClick={() => toggleTabs("cut-glass")}
              >
                Cắt kính
              </button>
            </li>
            <li className="mr-2">
              <button
                type="button"
                className={`inline-block p-4 text-sm font-medium rounded-t-lg border-b-2 ${tabs === "chemical" ? "text-primary border-primary" : "text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"}`}
                onClick={() => toggleTabs("chemical")}
              >
                Xuất hoá chất
              </button>
            </li>
            <li className="mr-2">
              <button
                type="button"
                className={`inline-block p-4 text-sm font-medium rounded-t-lg border-b-2 ${tabs === "glue-butyl" ? "text-primary border-primary" : "text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"}`}
                onClick={() => toggleTabs("glue-butyl")}
              >
                Xuất keo butyl
              </button>
            </li> */}
        </ul>
      </div>

      {tabs === "po" && (
        <div>
          {/* Order Description - Full width */}
          <div className="mb-4">
            <h1 className="text-xl font-bold text-[#4361ee] break-words">{orderDescription}</h1>
          </div>
          
          {/* Action Buttons - Full width, right-aligned */}
          <div className="flex justify-end items-center mb-4">
            <div className="flex items-center gap-4">
              {selectedOperation === "xuat-hoa-chat" && (
                <ChemicalExportModalComponent
                  productionOrderId={Number(params.id)}
                  onSuccess={handleExportSuccess}
                  isOpen={showChemicalExportModal}
                  onClose={() => {
                    setShowChemicalExportModal(false)
                    setSelectedOperation("")
                  }}
                />
              )}
              {selectedOperation === "xuat-keo-bytul" &&
                (exportGlueButylProducts.length > 0 ? (
                  <GlueButylExportModalComponent
                    products={exportGlueButylProducts}
                    type={"Ghép Kính"}
                    productionOrderId={Number(params.id)}
                    employees={employees}
                    onSuccess={handleExportSuccess}
                    isOpen={showGlueButylModal}
                    onClose={() => {
                      setShowGlueButylModal(false)
                      setSelectedOperation("")
                    }}
                  />
                ) : (
                  <div className="text-sm text-gray-500">
                    Không có sản phẩm nào để xuất keo butyl
                  </div>
                )
              )}
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
              <h2 className="font-semibold text-[#4361ee] mb-2">Thành phẩm</h2>
              <div className="border rounded shadow overflow-x-auto">
                <table className="w-full text-sm" style={{ minWidth: '600px' }}>
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
                          if (productId) {
                            handleProductSelect(productId)
                          }
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
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleAddProduct}
                  className="px-4 py-2 bg-[#4361ee] hover:bg-[#364fc7] text-white text-sm rounded shadow transition-colors"
                >
                  Thêm
                </button>
                <button
                  onClick={handleUpdateProduct}
                  className="px-4 py-2 bg-[#28a745] hover:bg-[#218838] text-white text-sm rounded shadow transition-colors"
                >
                  Sửa
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
                  <table className="w-full text-sm" style={{ minWidth: '700px' }} key={`materials-${selectedProduct}`}>
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
                                  e.stopPropagation() // Ngăn không cho trigger row selection
                                  showDetailInfo('Tên nguyên vật liệu', material.productName)
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
                  className={`px-4 py-2 text-white text-sm rounded shadow transition-colors ${
                    selectedMaterial ? "bg-[#28a745] hover:bg-[#218838]" : "bg-gray-400 cursor-not-allowed"
                  }`}
                  disabled={!selectedMaterial}
                  title={
                    selectedMaterial ? `Cập nhật ${selectedMaterial.productName}` : "Chọn nguyên vật liệu để cập nhật"
                  }
                >
                  Sửa {selectedMaterial ? `(${selectedMaterial.productName.length > 20 ? selectedMaterial.productName.substring(0, 20) + '...' : selectedMaterial.productName})` : ""}
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

      {tabs === "cut-glass" && (
        <div>
          <div>
            <CuttingGlassPage productionOrderId={Number(params.id)} />
          </div>
        </div>
      )}

      {tabs === "chemical" && (
        <div>
          <div>
            <ListChemicalExport productionOrderId={Number(params.id)} />
          </div>
        </div>
      )}

      {tabs === "glue-butyl" && (
        <div>
          <div>
            <ListExportsPO productionOrderId={Number(params.id)} />
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
                        uom: selectedProduct ? selectedProduct.uom : "", // Tự động điền UOM
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đơn vị tính
                  <span className="text-xs text-blue-600 ml-2"></span>
                </label>
                <input
                  type="text"
                  value={addProductForm.uom}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                  readOnly
                  placeholder="Đơn vị tính sẽ được lấy từ sản phẩm"
                  title="Đơn vị tính không thể chỉnh sửa, sẽ được lấy từ sản phẩm được chọn"
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
                  placeholder="Nhập số lượng (VD: 1.5, 2.25)"
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
                        uom: selectedProduct ? selectedProduct.uom : "", // Tự động điền UOM
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đơn vị tính
                  <span className="text-xs text-blue-600 ml-2"></span>
                </label>
                <input
                  type="text"
                  value={addMaterialForm.uom}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                  readOnly
                  placeholder="Đơn vị tính sẽ được lấy từ sản phẩm"
                  title="Đơn vị tính không thể chỉnh sửa, sẽ được lấy từ sản phẩm được chọn"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tổng số lượng</label>
                <input
                  type="number"
                  value={addMaterialForm.totalQuantity}
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
                  SL/1SP: {addMaterialForm.quantityPer.toFixed(4)} (tự động tính)
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

      {/* 🔥 POPUP CẬP NHẬT THÀNH PHẨM */}
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
                        uom: selectedProduct ? selectedProduct.uom : "", // Tự động điền UOM
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đơn vị tính
                  <span className="text-xs text-blue-600 ml-2"></span>
                </label>
                <input
                  type="text"
                  value={productForm.uom}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                  readOnly
                  placeholder="Đơn vị tính sẽ được lấy từ sản phẩm"
                  title="Đơn vị tính không thể chỉnh sửa, sẽ được lấy từ sản phẩm được chọn"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
                <input
                  type="number"
                  value={productForm.quantity}
                  onChange={(e) => setProductForm({ ...productForm, quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4361ee] focus:border-transparent"
                  required
                  min="0"
                  step="0.01"
                  placeholder="Nhập số lượng (VD: 1.5, 2.25)"
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

      {/* 🔥 POPUP CẬP NHẬT NGUYÊN VẬT LIỆU - ĐÃ SỬA ĐỔI */}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Đơn vị tính
                  <span className="text-xs text-blue-600 ml-2"></span>
                </label>
                <input
                  type="text"
                  value={materialForm.uom}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                  readOnly
                  placeholder="Đơn vị tính sẽ được lấy từ sản phẩm"
                  title="Đơn vị tính không thể chỉnh sửa, sẽ được lấy từ sản phẩm được chọn"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng / 1 SP</label>
                <input
                  type="number"
                  value={materialForm.quantityPer.toFixed(4)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-blue-50 text-blue-800 cursor-not-allowed"
                  readOnly
                  placeholder="Tự động tính toán"
                  title="Được tính tự động: Tổng SL / SL thành phẩm"
                />
                <div className="text-xs text-blue-600 mt-1">
                  Công thức: {materialForm.totalQuantity} ÷ {getSelectedProductQuantity()} ={" "}
                  {materialForm.quantityPer.toFixed(4)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tổng số lượng</label>
                <input
                  type="number"
                  value={materialForm.totalQuantity}
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
                  SL/1SP sẽ được tính tự động: {materialForm.quantityPer.toFixed(4)}
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

      {/* MODAL XEM CHI TIẾT */}
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
