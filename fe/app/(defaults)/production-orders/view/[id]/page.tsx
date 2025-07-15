"use client"
import { useEffect, useState } from "react"
import type React from "react"
import { useRouter } from "next/navigation"

interface MaterialItem {
  id?: number;
  productName: string
  uom: string
  quantityPer: number
  totalQuantity: number
}

interface ProductItem {
  id?: number
  outputId?: number
  productName: string
  uom: string
  quantity: number
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

  // Product suggestions for autocomplete (for both materials and products)
  const [productSuggestions, setProductSuggestions] = useState<ProductItem[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)

  // Add separate states for product add modal autocomplete
  const [productAddSuggestions, setProductAddSuggestions] = useState<ProductItem[]>([])
  const [showProductAddSuggestions, setShowProductAddSuggestions] = useState(false)
  const [isLoadingProductAddSuggestions, setIsLoadingProductAddSuggestions] = useState(false)

  const productsWithMaterials = ["VT00372", "VT00090"]

  useEffect(() => {
    fetch(`https://localhost:7075/api/ProductionAccountantControllers/production-ordersDetails/${params.id}`)
      .then((res) => res.json())
      .then((data: ProductItem[]) => {
        console.log(" Dữ liệu thành phẩm nhận được:", data) // Debug log
        setFinishedProducts(data || [])
        if (data && data.length > 0) {
          const productWithMaterials = data.find((p) => p.productName === "VT00372") || data[0]
          // Ưu tiên outputId, nếu không có thì dùng id
          const productId = productWithMaterials.outputId || productWithMaterials.id
          if (productId) {
            setSelectedProduct(productId)
          }
        }
      })
      .catch((err) => console.error(" Lỗi khi fetch thành phẩm:", err))
  }, [params.id])

  useEffect(() => {
    if (!selectedProduct) return
    setLoading(true)
    setCurrentMaterials([])
    setSelectedMaterial(null)

    // Find the selected product to get its outputId
    const selectedProductData = finishedProducts.find((p) => (p.outputId || p.id) === selectedProduct)
    if (!selectedProductData || !selectedProductData.outputId) {
      console.warn(" Không tìm thấy outputId cho sản phẩm:", selectedProduct)
      setLoading(false)
      return
    }

    // Use the actual outputId from the selected product
    const outputId = selectedProductData.outputId
    const url = `https://localhost:7075/api/ProductionAccountantControllers/products-materials-by-output/${outputId}`

    console.log(" Fetching materials with outputId:", outputId, "for product:", selectedProduct)

    fetch(url)
      .then((res) => {
        if (res.status === 404) return { notFound: true }
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        return res.json()
      })
      .then((data: ApiResponse | { notFound: boolean }) => {
        console.log(" Materials data received:", data)

        if ("notFound" in data) {
          setCurrentMaterials([])
          return
        }

        if (data && data.materials && Array.isArray(data.materials)) {
          // Calculate quantityPer for each material
          const selectedProductQuantity = getSelectedProductQuantity()
          const materialsWithCalculatedQuantityPer = data.materials.map((material) => ({
            ...material,
            quantityPer: calculateQuantityPer(material.totalQuantity, selectedProductQuantity),
          }))

          console.log(" Materials with calculated quantityPer:", materialsWithCalculatedQuantityPer)
          setCurrentMaterials(materialsWithCalculatedQuantityPer)
        } else {
          setCurrentMaterials([])
        }
      })
      .catch((err) => {
        console.error(" API Error:", err)
        setCurrentMaterials([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [params.id, selectedProduct, finishedProducts])

  useEffect(() => {
    fetch(`https://localhost:7075/api/ProductionAccountantControllers/production-order-info/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
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
    router.push("/production-orders/view")
  }

  const handleAddProduct = () => {
    setAddProductForm({
      productName: "",
      uom: "",
      quantity: 0,
    })
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
    setShowProductModal(true)
  }

  const handleAddMaterial = () => {
    if (!selectedProduct) {
      alert(" Vui lòng chọn sản phẩm trước khi thêm nguyên vật liệu!")
      return
    }
    setAddMaterialForm({
      productName: "",
      uom: "",
      quantityPer: 0,
      totalQuantity: 0,
    })
    setShowAddMaterialModal(true)
  }

  const handleUpdateMaterial = () => {
    if (!selectedMaterial) {
      alert(" Vui lòng chọn một nguyên vật liệu để cập nhật!")
      return
    }

    setEditingMaterial(selectedMaterial)
    setMaterialForm({ ...selectedMaterial })
    setShowMaterialModal(true)
  }

  const handleAddProductFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate dữ liệu trước khi gửi
    if (!addProductForm.productName.trim()) {
      alert(" Vui lòng nhập tên thành phẩm!")
      return
    }
    if (!addProductForm.productName.trim()) {
      alert(" Vui lòng nhập tên thành phẩm!")
      return
    }
    if (!addProductForm.uom.trim()) {
      alert(" Vui lòng nhập đơn vị tính!")
      return
    }
    if (addProductForm.quantity <= 0) {
      alert(" Số lượng phải lớn hơn 0!")
      return
    }

    // Chuẩn bị dữ liệu gửi lên server
    const productData = {
      productName: addProductForm.productName.trim(),
      uom: addProductForm.uom.trim(),
      quantity: Number(addProductForm.quantity),
    }

    console.log(" Đang gửi dữ liệu thành phẩm:", productData)
    console.log(" URL:", `https://localhost:7075/api/ProductionAccountantControllers/add-output-info/${params.id}`)

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
        console.log("Response headers:", res.headers)

        const responseText = await res.text()
        console.log("Response body:", responseText)

        if (!res.ok) {
          // Thử parse JSON để lấy thông tin lỗi chi tiết
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

        // Refresh lại danh sách thành phẩm từ server
        return fetch(`https://localhost:7075/api/ProductionAccountantControllers/production-ordersDetails/${params.id}`)
      })
      .then((res) => res.json())
      .then((data: ProductItem[]) => {
        console.log("Dữ liệu thành phẩm sau khi refresh:", data)
        setFinishedProducts(data || [])
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

    // Validate dữ liệu
    if (!productForm.productName.trim()) {
      alert("Vui lòng nhập tên thành phẩm!")
      return
    }
    if (!productForm.productName.trim()) {
      alert("Vui lòng nhập tên thành phẩm!")
      return
    }
    if (!productForm.uom.trim()) {
      alert("Vui lòng nhập đơn vị tính!")
      return
    }
    if (productForm.quantity <= 0) {
      alert("Số lượng phải lớn hơn 0!")
      return
    }

    const updateData = {
      productName: productForm.productName.trim(),
      uom: productForm.uom.trim(),
      amount: Number(productForm.quantity),
    }

    const productIdToUpdate = editingProduct?.outputId || editingProduct?.id;

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
        // Refresh lại data từ server thay vì chỉ update local state
        return fetch(`https://localhost:7075/api/ProductionAccountantControllers/production-ordersDetails/${params.id}`)
      })
      .then((res) => res.json())
      .then((data: ProductItem[]) => {
        setFinishedProducts(data || [])
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
    

    // Validate dữ liệu
    if (!materialForm.productName.trim()) {
      alert("Vui lòng nhập tên nguyên vật liệu!")
      return
    }
    if (!materialForm.uom.trim()) {
      alert("Vui lòng nhập đơn vị tính!")
      return
    }
    if (materialForm.totalQuantity <= 0) {
      alert("Tổng số lượng phải lớn hơn 0!")
      return
    }

    

    const updatedMaterialForm = {
      productName: materialForm.productName.trim(),
      uom: materialForm.uom.trim(),
      amount: materialForm.totalQuantity,
    }

    console.log("Updating material:", updatedMaterialForm)
    console.log("Selected product outputId:", selectedProductData.outputId)

    const updateUrl = `https://localhost:7075/api/ProductionAccountantControllers/update-material-info/${editingMaterial.id}`
    console.log("🔧 ID của nguyên vật liệu cần cập nhật:", editingMaterial?.id)

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

        // Thử parse response
        const responseText = await res.text()
        console.log("Update success response:", responseText)
        return responseText
      })
      .then(() => {
        // Refresh materials từ server
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
          const materialsWithCalculatedQuantityPer = data.materials.map((material) => ({
            id: material.id,
            productName: material.productName,
            uom: material.uom,
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
      })
      .catch((err) => {
        console.error("Cập nhật nguyên vật liệu lỗi:", err)
        alert(`Cập nhật nguyên vật liệu thất bại: ${err.message}`)
      })
  }

  const fetchProductSuggestions = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setProductSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsLoadingSuggestions(true)
    try {
      const response = await fetch(`https://localhost:7075/api/Product`)

      if (response.ok) {
        const allProducts = await response.json()
        console.log("📦 Dữ liệu sản phẩm:", allProducts)

        const filteredProducts = allProducts.filter((product: ProductItem) =>
          product.productName.toLowerCase().includes(searchTerm.toLowerCase()),
        )

        console.log("Kết quả lọc:", filteredProducts)
        setProductSuggestions(filteredProducts.slice(0, 10))
        setShowSuggestions(true)
      } else {
        console.error("API trả về lỗi:", response.status, response.statusText)
        setProductSuggestions([])
        setShowSuggestions(false)
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error)
      setProductSuggestions([])
      setShowSuggestions(false)
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  const handleProductCodeChange = (value: string) => {
    setAddMaterialForm({ ...addMaterialForm, productName: value })
    console.log("Đang tìm kiếm:", value) // Debug log
    fetchProductSuggestions(value)
  }

  const handleSuggestionSelect = (suggestion: ProductItem) => {
    setAddMaterialForm({
      ...addMaterialForm,
      productName: suggestion.productName,
      uom: suggestion.uom,
    })
    setShowSuggestions(false)
    setProductSuggestions([])
  }

  const closeProductModal = () => {
    setShowProductModal(false)
    setEditingProduct(null)
  }

  const closeMaterialModal = () => {
    setShowMaterialModal(false)
    setEditingMaterial(null)
  }

  const closeAddProductModal = () => {
    setShowAddProductModal(false)
    setAddProductForm({ productName: "", uom: "", quantity: 0 })
    setShowProductAddSuggestions(false)
    setProductAddSuggestions([])
  }

  const closeAddMaterialModal = () => {
    setShowAddMaterialModal(false)
    setAddMaterialForm({ productName: "", uom: "", quantityPer: 0, totalQuantity: 0 })
    setShowSuggestions(false)
    setProductSuggestions([])
  }

  const totalQuantity = finishedProducts.reduce((sum, item) => sum + item.quantity, 0)
  const totalMaterialQuantity = currentMaterials.reduce((sum, item) => sum + item.totalQuantity, 0)

  const handleAddMaterialFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const selectedProductData = finishedProducts.find((p) => (p.outputId || p.id) === selectedProduct)
    if (!selectedProductData) {
      alert("Không tìm thấy sản phẩm được chọn!")
      return
    }

    // Only send the fields that the API expects
    const materialData = {
      productName: addMaterialForm.productName.trim(),
      uom: addMaterialForm.uom.trim(),
      totalQuantity: addMaterialForm.totalQuantity,
    }

    console.log("Đang gửi dữ liệu NVL:", materialData)

    // Sử dụng productCode thay vì outputId
    // URL này đã đúng, sử dụng outputId
    const url = `https://localhost:7075/api/ProductionAccountantControllers/add-material-info/${params.id}?outputId=${selectedProductData.outputId}`

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(materialData),
    })
      .then((res) => {
        console.log("Response status:", res.status)
        console.log("Request URL:", url)
        console.log("Request body:", JSON.stringify(materialData))
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }
        return res.text()
      })
      .then((responseText) => {
        console.log("Response từ server:", responseText)

        // Use the correct outputId for refreshing materials
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
          setCurrentMaterials(data.materials)
        } else {
          console.log("Invalid data structure:", data)
          setCurrentMaterials([])
        }

        alert("Thêm nguyên vật liệu thành công!")
        setShowAddMaterialModal(false)
        setAddMaterialForm({ productName: "", uom: "", quantityPer: 0, totalQuantity: 0 })
        setShowSuggestions(false)
        setProductSuggestions([])
      })
      .catch((err) => {
        console.error("Lỗi chi tiết:", err)
        alert(`Thêm nguyên vật liệu thất bại: ${err.message}`)
      })
  }

  const handleAddProductCodeChange = async (value: string) => {
    setAddProductForm({ ...addProductForm, productName: value })
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

        const filteredProducts = allProducts.filter((product: ProductItem) =>
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
        setCurrentMaterials(data.materials)
      } else {
        setCurrentMaterials([])
      }
    } catch (err) {
      console.error("Manual refresh error:", err)
    } finally {
      setLoading(false)
    }
  }

  // Add this function after the existing functions, before the return statement
  const calculateQuantityPer = (totalQuantity: number, productQuantity: number): number => {
    if (productQuantity === 0) return 0
    return Number((totalQuantity / productQuantity).toFixed(4))
  }

  // Add function to get selected product quantity
  const getSelectedProductQuantity = (): number => {
    const selectedProductData = finishedProducts.find((p) => (p.outputId || p.id) === selectedProduct)
    return selectedProductData?.quantity || 1
  }

  // Add this useEffect after the existing useEffects
  useEffect(() => {
    // Recalculate quantityPer for all materials when selected product quantity changes
    if (currentMaterials.length > 0 && selectedProduct) {
      const selectedProductQuantity = getSelectedProductQuantity()
      const updatedMaterials = currentMaterials.map((material) => ({
        ...material,
        quantityPer: calculateQuantityPer(material.totalQuantity, selectedProductQuantity),
      }))

      console.log("Recalculating quantityPer for materials due to product quantity change")
      setCurrentMaterials(updatedMaterials)
    }
  }, [finishedProducts, selectedProduct]) // Depend on finishedProducts to catch quantity changes

  const selectedProductData = finishedProducts.find((p) => (p.outputId || p.id) === selectedProduct)

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-[#4361ee]">Lệnh sản xuất cho: {orderDescription}</h1>

        <div className="flex items-center gap-4">
          <select className="px-4 py-2 border border-[#4361ee] text-[#4361ee] rounded shadow-sm focus:ring-2 focus:ring-[#4361ee] focus:outline-none text-sm">
            <option value="">Chọn thao tác</option>
            <option value="xuat-hoa-chat">Xuất hóa chất</option>
            <option value="xuat-keo-bytul">Xuất keo bytul</option>
            <option value="cat-kinh">Cắt kính</option>
          </select>
          <button
            onClick={handleGoBack}
            className="px-4 py-2 bg-[#4361ee] hover:bg-[#364fc7] text-white text-sm rounded shadow transition-colors"
          >
            ← Quay lại
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Thành phẩm */}
        <div>
          <h2 className="font-semibold text-[#4361ee] mb-2">Thành phẩm</h2>
          <table className="w-full border rounded shadow text-sm">
            <thead className="bg-[#edf0ff]">
              <tr>
                <th className="border p-2">#</th>
                <th className="border p-2">Tên TP</th>
                <th className="border p-2">ĐVT</th>
                <th className="border p-2">Số lượng</th>
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
                  className={`cursor-pointer hover:bg-blue-50 transition-colors ${
                    selectedProduct === (item.outputId || item.id)
                      ? "bg-[#edf0ff] border-l-4 border-[#4361ee] font-bold"
                      : ""
                  }`}
                >
                  <td className="border p-2">{index + 1}</td>
                  <td className="border p-2">{item.productName}</td>
                  <td className="border p-2">{item.uom}</td>
                  <td className="border p-2 text-right">{Number(item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#f4f7ff]">
                <td colSpan={3} className="border p-2 text-right font-semibold">
                  Tổng:
                </td>
                <td className="border p-2 text-right font-semibold">{totalQuantity.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleAddProduct}
              className="px-4 py-2 bg-[#4361ee] hover:bg-[#364fc7] text-white text-sm rounded shadow transition-colors"
            >
              + Thêm
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
              <span className="bg-[#edf0ff] text-[#4361ee] px-2 py-1 rounded font-mono">
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

          <table className="w-full border rounded shadow text-sm" key={`materials-${selectedProduct}`}>
            <thead className="bg-[#edf0ff]">
              <tr>
                <th className="border p-2">#</th>
                <th className="border p-2">Tên NVL</th>
                <th className="border p-2">ĐVT</th>
                <th className="border p-2">Tổng SL</th>
                <th className="border p-2">SL / 1 SP</th>
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
                    <td className="border p-2">{index + 1}</td>
                    <td className="border p-2 truncate" title={material.productName}>
                      {material.productName}
                    </td>
                    <td className="border p-2">{material.uom}</td>
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
            {currentMaterials.length > 0 && (
              <tfoot>
                <tr className="bg-[#f4f7ff]">
                  <td colSpan={3} className="border p-2 text-right font-semibold">
                    Tổng:
                  </td>
                  <td className="border p-2 text-right font-semibold">{totalMaterialQuantity}</td>
                  <td className="border p-2" />
                </tr>
              </tfoot>
            )}
          </table>

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleAddMaterial}
              className="px-4 py-2 bg-[#4361ee] hover:bg-[#364fc7] text-white text-sm rounded shadow transition-colors"
            >
              + Thêm
            </button>
            <button
              onClick={handleUpdateMaterial}
              className={`px-4 py-2 text-white text-sm rounded shadow transition-colors ${
                selectedMaterial ? "bg-[#28a745] hover:bg-[#218838]" : "bg-gray-400 cursor-not-allowed"
              }`}
              disabled={!selectedMaterial}
              title={
                selectedMaterial ? `Cập nhật ${selectedMaterial.productName})` : "Chọn nguyên vật liệu để cập nhật"
              }
            >
              Sửa {selectedMaterial ? `(${selectedMaterial.productName})` : ""}
            </button>
          </div>
        </div>
      </div>

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
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên thành phẩm</label>
                <input
                  type="text"
                  value={addProductForm.productName}
                  onChange={(e) => handleAddProductCodeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4361ee] focus:border-transparent"
                  required
                  placeholder="Nhập tên thành phẩm (tối thiểu 2 ký tự)"
                  autoComplete="off"
                />

                {/* Suggestions Dropdown for Add Product */}
                {showProductAddSuggestions && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {isLoadingProductAddSuggestions ? (
                      <div className="p-3 text-center text-gray-500">
                        <div className="animate-spin h-4 w-4 border-b-2 border-[#4361ee] rounded-full mx-auto mb-2" />
                        Đang tìm kiếm...
                      </div>
                    ) : productAddSuggestions.length > 0 ? (
                      productAddSuggestions.map((suggestion, index) => (
                        <div
                          key={`add-product-${suggestion.productName}-${index}`}
                          className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => handleProductAddSuggestionSelect(suggestion)}
                        >
                          <div className="text-gray-700 text-sm font-semibold">{suggestion.productName}</div>
                          <div className="text-gray-500 text-xs">ĐVT: {suggestion.uom}</div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-gray-500 text-sm">
                        Không tìm thấy sản phẩm nào
                        <div className="text-xs mt-1">Bạn có thể nhập thông tin mới</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị tính</label>
                <input
                  type="text"
                  value={addProductForm.uom}
                  onChange={(e) => setAddProductForm({ ...addProductForm, uom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4361ee] focus:border-transparent"
                  required
                  placeholder="VD: Cái, Kg, Lít..."
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
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên nguyên vật liệu</label>
                <input
                  type="text"
                  value={addMaterialForm.productName}
                  onChange={(e) => handleProductCodeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4361ee] focus:border-transparent"
                  required
                  placeholder="Nhập tên nguyên vật liệu (tối thiểu 2 ký tự)"
                  autoComplete="off"
                />

                {/* Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {isLoadingSuggestions ? (
                      <div className="p-3 text-center text-gray-500">
                        <div className="animate-spin h-4 w-4 border-b-2 border-[#4361ee] rounded-full mx-auto mb-2" />
                        Đang tìm kiếm...
                      </div>
                    ) : productSuggestions.length > 0 ? (
                      productSuggestions.map((suggestion, index) => (
                        <div
                          key={`${suggestion.productName}-${index}`}
                          className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => handleSuggestionSelect(suggestion)}
                        >
                          <div className="text-gray-700 text-sm font-semibold">{suggestion.productName}</div>
                          <div className="text-gray-500 text-xs">
                            Tên: {suggestion.productName} | ĐVT: {suggestion.uom}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-gray-500 text-sm">
                        Không tìm thấy sản phẩm nào
                        <div className="text-xs mt-1">Bạn có thể nhập thông tin mới</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã nguyên vật liệu</label>
                <input
                  type="text"
                  value={addMaterialForm.productCode}
                  onChange={(e) => setAddMaterialForm({ ...addMaterialForm, productCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4361ee] focus:border-transparent"
                  required
                  placeholder="Mã sẽ tự động điền hoặc nhập thủ công"
                />
              </div> */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị tính</label>
                <input
                  type="text"
                  value={addMaterialForm.uom}
                  onChange={(e) => setAddMaterialForm({ ...addMaterialForm, uom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4361ee] focus:border-transparent"
                  required
                  placeholder="VD: Kg, Lít, Mét..."
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
                <input
                  type="text"
                  value={productForm.productName}
                  onChange={(e) => setProductForm({ ...productForm, productName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4361ee] focus:border-transparent"
                  required
                  placeholder="Nhập tên thành phẩm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị tính</label>
                <input
                  type="text"
                  value={productForm.uom}
                  onChange={(e) => setProductForm({ ...productForm, uom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4361ee] focus:border-transparent"
                  required
                  placeholder="VD: Cái, Kg, Lít..."
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

      {/* 🔥 POPUP CẬP NHẬT NGUYÊN VẬT LIỆU */}
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
                <input
                  type="text"
                  value={materialForm.productName}
                  onChange={(e) => setMaterialForm({ ...materialForm, productName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4361ee] focus:border-transparent"
                  required
                  placeholder="Nhập tên nguyên vật liệu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị tính</label>
                <input
                  type="text"
                  value={materialForm.uom}
                  onChange={(e) => setMaterialForm({ ...materialForm, uom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4361ee] focus:border-transparent"
                  required
                  placeholder="VD: Kg, Lít, Mét..."
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
    </div>
  )
}
