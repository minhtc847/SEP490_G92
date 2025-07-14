'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import IconPlus from '@/components/icon/icon-plus';
import IconEdit from '@/components/icon/icon-edit';
import IconTrash from '@/components/icon/icon-trash';
import IconSave from '@/components/icon/icon-save';
import IconX from '@/components/icon/icon-x';
import { Transition, Dialog, DialogPanel, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';

interface GlassInput {
  name: string;
  length: string;
  width: string;
  thickness: string;
  quantity: string;
}

interface MaterialItem {
  id: number;
  name: string;
  length: string;
  width: string;
  thickness: string;
  quantity: string;
  products: GlassInput[];
  wastes: GlassInput[];
}

interface MaterialBlock {
  materialId: number;
  materialName: string;
  width: number;
  height: number;
  thickness: number;
  quantity: number;
  materialType: number;
  materials: MaterialItem[];
}

// Validation schema
const GlassItemSchema = Yup.object().shape({
  name: Yup.string().required('Tên kính là bắt buộc'),
  length: Yup.number().required('Chiều dài là bắt buộc').positive('Chiều dài phải > 0'),
  width: Yup.number().required('Chiều rộng là bắt buộc').positive('Chiều rộng phải > 0'),
  thickness: Yup.number().required('Độ dày là bắt buộc').positive('Độ dày phải > 0'),
  quantity: Yup.number().required('Số lượng là bắt buộc').positive('Số lượng phải > 0'),
});

const CuttingGlassPage = () => {
  const params = useParams();
  const productionOrderId = params.id as string;

  // State cho du lieu phieu cat kinh
  const [materialBlocks, setMaterialBlocks] = useState<MaterialBlock[]>([]);
  const [savedData, setSavedData] = useState<any>(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [currentModalData, setCurrentModalData] = useState<{
    materialId: number;
    materialItemId?: number;
    type: 'products' | 'wastes' | 'materials';
    index?: number;
    item?: GlassInput | MaterialItem;
  } | null>(null);
  const [duplicateData, setDuplicateData] = useState<{
    newItem: any;
    existingItem: any;
    existingIndex: number;
    type: 'products' | 'wastes' | 'materials';
  } | null>(null);

  // parse data tu api
  const parseGlassItem = (item: any) => {
    // Handle both uppercase and lowercase property names from backend
    const outputName = item.OutputName || item.outputName || '';    
    console.log('Parsing glass item:', item);
    console.log('OutputName from item:', outputName);
 
    // Skip items with empty or invalid names
    if (!outputName || outputName.trim() === '' || outputName === 'xx') {
      console.log('Skipping invalid item:', outputName);
      return null;
    }

    // Try to match format like "Kính EI90 thành phẩm 200x100x30"
    const sizeMatch = outputName.match(/(\d+)\s*[xX*]\s*(\d+)\s*[xX*]\s*(\d+)/);
    
    if (sizeMatch) {
      //co' kich thuoc trong ten
      const name = outputName.replace(/\s*\d+\s*[xX*]\s*\d+\s*[xX*]\s*\d+.*$/, '').trim(); 
      const result = {
        name: name || '',
        length: sizeMatch[1] || '',
        width: sizeMatch[2] || '',
        thickness: sizeMatch[3] || '',
        quantity: (item.Quantity || item.quantity || 0).toString()
      };
      console.log('Parsed with size in name:', result);
      return result;
    } else {
      //khong co kich thuoc trong ten - use OutputType as thickness
      const result = {
        name: outputName || '',
        length: '',
        width: '',
        thickness: (item.OutputType || item.outputType || 0).toString(),
        quantity: (item.Quantity || item.quantity || 0).toString()
      };
      console.log('Parsed without size in name:', result);
      return result;
    }
  };

  const parseMaterialName = (materialName: string) => {
    // Parse material name like "Kính EI60 phút, KT: 300*500*30 mm, VNG-MK c? kính d?ng" to extract dimensions
    const sizeMatch = materialName.match(/(.+?)\s*[Kk][Tt]:\s*(\d+)\s*[*xX]\s*(\d+)\s*[*xX]\s*(\d+)/);
    
    if (sizeMatch) {
      return {
        name: sizeMatch[1].trim(),
        length: sizeMatch[2],
        width: sizeMatch[3],
        thickness: sizeMatch[4]
      };
    }
    
    // Try alternative format like "Kính EI90 300x200x30"
    const altSizeMatch = materialName.match(/(.+?)\s+(\d+)\s*[xX]\s*(\d+)\s*[xX]\s*(\d+)/);
    
    if (altSizeMatch) {
      return {
        name: altSizeMatch[1].trim(),
        length: altSizeMatch[2],
        width: altSizeMatch[3],
        thickness: altSizeMatch[4]
      };
    }
    
    // If no dimensions found, return the original name
    return {
      name: materialName,
      length: '',
      width: '',
      thickness: ''
    };
  };

  const parseMaterialBlock = (mat: any, index: number) => {
    console.log('Parsing material block:', mat);
    
    // If backend doesn't have materials array yet, create one from existing data
    let materials = mat.materials || [];
    if (materials.length === 0 && mat.materialName) {
      // Parse material name to extract dimensions
      const materialNameParts = parseMaterialName(mat.materialName);
      
      // Create a default material item from the block data
      materials = [{
        id: 1,
        name: materialNameParts.name,
        length: materialNameParts.length || mat.height?.toString() || '',
        width: materialNameParts.width || mat.width?.toString() || '',
        thickness: materialNameParts.thickness || mat.thickness?.toString() || '',
        quantity: mat.quantity?.toString() || '',
        products: (mat.products || []).map(parseGlassItem),
        wastes: (mat.wastes || []).map(parseGlassItem)
      }];
    }

    const result = {
      materialId: mat.materialId,
      materialName: mat.materialName,
      width: mat.width || 0,
      height: mat.height || 0,
      thickness: mat.thickness || 0,
      quantity: mat.quantity || 0,
      materialType: mat.materialType || 0,
      materials: materials.map((material: any, matIndex: number) => ({
        id: material.id || matIndex + 1,
        name: material.name || '',
        length: material.length || '',
        width: material.width || '',
        thickness: material.thickness || '',
        quantity: material.quantity || '',
        products: (material.products || []).map(parseGlassItem).filter((item: any) => item !== null),
        wastes: (material.wastes || []).map(parseGlassItem).filter((item: any) => item !== null)
      }))
    };
    
    console.log('Parsed material block result:', result);
    return result;
  };

  // Test function to debug parsing
  const testParsing = () => {
    const testData = {
      "OutputName": "Kính EI90 thành phẩm 200x100x30",
      "OutputType": 30,
      "Quantity": 1
    };
    
    const testData2 = {
      "OutputName": "xx",
      "OutputType": 0,
      "Quantity": 0
    };
    
    console.log('Test parsing 1:', parseGlassItem(testData));
    console.log('Test parsing 2:', parseGlassItem(testData2));
  };

  useEffect(() => {
    testParsing(); // Run test on component mount
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading cutting glass data for production order:', productionOrderId);
        const response = await fetch(`https://localhost:7075/api/CutGlassInvoice/by-production-order/${productionOrderId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Cutting glass data received:', data);
        console.log('Raw materials data:', JSON.stringify(data.materials, null, 2));
        
        if (data.materials && Array.isArray(data.materials)) {
          const parsedBlocks = data.materials.map(parseMaterialBlock);
          console.log('Parsed material blocks:', parsedBlocks);
          setMaterialBlocks(parsedBlocks);
        } else {
          console.log('No materials found in response');
          setMaterialBlocks([]);
        }
      } catch (error) {
        console.error('Error loading cutting glass data:', error);
        setMaterialBlocks([]);
      }
    };

    if (productionOrderId) {
      loadData();
    }
  }, [productionOrderId]);

  const openAddModal = (materialId: number, type: 'products' | 'wastes' | 'materials', materialItemId?: number) => {
    setCurrentModalData({ materialId, materialItemId, type });
    setShowAddModal(true);
  };

  const openEditModal = (materialId: number, type: 'products' | 'wastes' | 'materials', materialItemId: number, index: number, item: GlassInput | MaterialItem) => {
    setCurrentModalData({ materialId, materialItemId, type, index, item });
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDuplicateModal(false);
    setCurrentModalData(null);
    setDuplicateData(null);
  };

  const deleteGlassRow = async (materialId: number, materialItemId: number, type: 'products' | 'wastes', index: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa?')) return;

    const updatedBlocks = materialBlocks.map(block => {
      if (block.materialId === materialId) {
        const updatedBlock = { ...block };
        updatedBlock.materials = block.materials.map(material => {
          if (material.id === materialItemId) {
            const updatedMaterial = { ...material };
            if (type === 'products') {
              updatedMaterial.products = material.products.filter((_, i) => i !== index);
            } else {
              updatedMaterial.wastes = material.wastes.filter((_, i) => i !== index);
            }
            return updatedMaterial;
          }
          return material;
        });
        return updatedBlock;
      }
      return block;
    });

    setMaterialBlocks(updatedBlocks);
    await saveMaterialChanges(materialId, updatedBlocks);
  };

  const deleteMaterialItem = async (materialId: number, materialItemId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa nguyên vật liệu này?')) return;

    const updatedBlocks = materialBlocks.map(block => {
      if (block.materialId === materialId) {
        return {
          ...block,
          materials: block.materials.filter(material => material.id !== materialItemId)
        };
      }
      return block;
    });

    setMaterialBlocks(updatedBlocks);
    await saveMaterialChanges(materialId, updatedBlocks);
  };

  const saveMaterialChanges = async (materialId: number, blocksToSave?: MaterialBlock[]) => {
    const blocks = blocksToSave || materialBlocks;
    const blockToSave = blocks.find(b => b.materialId === materialId);
    
    if (!blockToSave) {
      console.error('Block not found for materialId:', materialId);
      return;
    }

    console.log('Saving only the changed block:', blockToSave.materialId);

    try {
      console.log('Saving material changes for block:', blockToSave);
      
      // Convert frontend format to backend format
      const convertedBlock = {
        materialId: blockToSave.materialId,
        materialName: blockToSave.materialName,
        width: blockToSave.width,
        height: blockToSave.height,
        thickness: blockToSave.thickness,
        quantity: blockToSave.quantity,
        materials: blockToSave.materials.map(material => ({
          id: material.id,
          name: material.name,
          length: material.length,
          width: material.width,
          thickness: material.thickness,
          quantity: material.quantity,
          products: material.products.map(item => ({
            OutputName: `${item.name} ${item.length}x${item.width}x${item.thickness}`.trim(),
            OutputType: parseInt(item.thickness) || 0,
            Quantity: parseInt(item.quantity) || 0
          })),
          wastes: material.wastes.map(item => ({
            OutputName: `${item.name} ${item.length}x${item.width}x${item.thickness}`.trim(),
            OutputType: parseInt(item.thickness) || 0,
            Quantity: parseInt(item.quantity) || 0
          }))
        }))
      };

      const requestData = {
        productionOrderId: parseInt(productionOrderId),
        materials: [convertedBlock]
      };

      console.log('Request data:', JSON.stringify(requestData, null, 2));

      const response = await fetch(`https://localhost:7075/api/CutGlassInvoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('Save successful');
      
      // Reload data to ensure consistency
      const reloadResponse = await fetch(`https://localhost:7075/api/CutGlassInvoice/by-production-order/${productionOrderId}`);
      if (reloadResponse.ok) {
        const reloadData = await reloadResponse.json();
        if (reloadData.materials && Array.isArray(reloadData.materials)) {
          const parsedBlocks = reloadData.materials.map(parseMaterialBlock);
          setMaterialBlocks(parsedBlocks);
        }
      }
    } catch (error) {
      console.error('Error saving material changes:', error);
      alert('Có lỗi xảy ra khi lưu dữ liệu');
    }
  };

  // Function to check for duplicates
  const checkDuplicate = (newItem: GlassInput | MaterialItem, materialId: number, type: 'products' | 'wastes' | 'materials', materialItemId?: number) => {
    const block = materialBlocks.find(b => b.materialId === materialId);
    if (!block) return null;

    if (type === 'materials') {
      const materialItem = newItem as MaterialItem;
      // Check for duplicate materials
      const existingIndex = block.materials.findIndex(material => 
        material.name.toLowerCase() === materialItem.name.toLowerCase() &&
        material.length === materialItem.length &&
        material.width === materialItem.width &&
        material.thickness === materialItem.thickness
      );
      
      if (existingIndex !== -1) {
        return {
          newItem,
          existingItem: block.materials[existingIndex],
          existingIndex,
          type
        };
      }
    } else {
      const glassItem = newItem as GlassInput;
      // Check for duplicate products/wastes within a specific material
      const material = block.materials.find(m => m.id === materialItemId);
      if (!material) return null;

      const itemsToCheck = type === 'products' ? material.products : material.wastes;
      const existingIndex = itemsToCheck.findIndex(item => 
        item.name.toLowerCase() === glassItem.name.toLowerCase() &&
        item.length === glassItem.length &&
        item.width === glassItem.width &&
        item.thickness === glassItem.thickness
      );
      
      if (existingIndex !== -1) {
        return {
          newItem,
          existingItem: itemsToCheck[existingIndex],
          existingIndex,
          type
        };
      }
    }
    
    return null;
  };

  const handleAddItem = async (values: any, materialId: number, type: 'products' | 'wastes' | 'materials', materialItemId?: number) => {
    try {
      console.log('Adding item:', values, 'for materialId:', materialId, 'type:', type);
      
      const normalizeValue = (val: any) => String(val || '').trim();
      
      if (type === 'materials') {
        // Create new material item
        const newMaterial: MaterialItem = {
          id: Math.floor(Math.random() * 1000000), // Generate unique ID
          name: normalizeValue(values.name),
          length: normalizeValue(values.length),
          width: normalizeValue(values.width),
          thickness: normalizeValue(values.thickness),
          quantity: normalizeValue(values.quantity),
          products: [],
          wastes: []
        };
        
        // Check for duplicates
        const duplicate = checkDuplicate(newMaterial, materialId, type, materialItemId);
        
        if (duplicate) {
          // Show duplicate modal
          setDuplicateData(duplicate);
          setShowDuplicateModal(true);
          return;
        }
        
        // No duplicate found, proceed with normal addition
        await addMaterialToBlocks(newMaterial, materialId);
      } else {
        // Create new glass item
        const newGlassItem: GlassInput = {
          name: normalizeValue(values.name),
          length: normalizeValue(values.length),
          width: normalizeValue(values.width),
          thickness: normalizeValue(values.thickness),
          quantity: normalizeValue(values.quantity)
        };
        
        // Check for duplicates
        const duplicate = checkDuplicate(newGlassItem, materialId, type, materialItemId);
        
        if (duplicate) {
          // Show duplicate modal
          setDuplicateData(duplicate);
          setShowDuplicateModal(true);
          return;
        }
        
        // No duplicate found, proceed with normal addition
        await addGlassItemToBlocks(newGlassItem, materialId, type, materialItemId!);
      }
      
      closeModals();
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Có lỗi xảy ra khi thêm item');
    }
  };

  const addMaterialToBlocks = async (newMaterial: MaterialItem, materialId: number) => {
    const updatedBlocks = materialBlocks.map(block => {
      if (block.materialId === materialId) {
        return {
          ...block,
          materials: [...block.materials, newMaterial]
        };
      }
      return block;
    });

    setMaterialBlocks(updatedBlocks);
    await saveMaterialChanges(materialId, updatedBlocks);
  };

  const addGlassItemToBlocks = async (newGlassItem: GlassInput, materialId: number, type: 'products' | 'wastes', materialItemId: number) => {
    const updatedBlocks = materialBlocks.map(block => {
      if (block.materialId === materialId) {
        const updatedBlock = { ...block };
        updatedBlock.materials = block.materials.map(material => {
          if (material.id === materialItemId) {
            const updatedMaterial = { ...material };
            if (type === 'products') {
              updatedMaterial.products = [...material.products, newGlassItem];
            } else {
              updatedMaterial.wastes = [...material.wastes, newGlassItem];
            }
            return updatedMaterial;
          }
          return material;
        });
        return updatedBlock;
      }
      return block;
    });

    setMaterialBlocks(updatedBlocks);
    await saveMaterialChanges(materialId, updatedBlocks);
  };

  const handleDuplicateConfirm = async () => {
    if (!duplicateData) return;
    
    try {
      const { newItem, existingItem, existingIndex, type } = duplicateData;
      
      // Calculate new quantity
      const newQuantity = parseInt(newItem.quantity) + parseInt(existingItem.quantity);
      
      if (type === 'materials') {
        // Update material quantity
        const updatedBlocks = materialBlocks.map(block => {
          if (block.materialId === currentModalData?.materialId) {
            const updatedBlock = { ...block };
            updatedBlock.materials = [...block.materials];
            updatedBlock.materials[existingIndex] = {
              ...existingItem,
              quantity: newQuantity.toString()
            };
            return updatedBlock;
          }
          return block;
        });
        
        setMaterialBlocks(updatedBlocks);
        await saveMaterialChanges(currentModalData!.materialId, updatedBlocks);
      } else {
        // Update glass item quantity
        const updatedBlocks = materialBlocks.map(block => {
          if (block.materialId === currentModalData?.materialId) {
            const updatedBlock = { ...block };
            updatedBlock.materials = block.materials.map(material => {
              if (material.id === currentModalData?.materialItemId) {
                const updatedMaterial = { ...material };
                const itemsToUpdate = type === 'products' ? updatedMaterial.products : updatedMaterial.wastes;
                itemsToUpdate[existingIndex] = {
                  ...existingItem,
                  quantity: newQuantity.toString()
                };
                return updatedMaterial;
              }
              return material;
            });
            return updatedBlock;
          }
          return block;
        });
        
        setMaterialBlocks(updatedBlocks);
        await saveMaterialChanges(currentModalData!.materialId, updatedBlocks);
      }
      
      closeModals();
    } catch (error) {
      console.error('Error handling duplicate:', error);
      alert('Có lỗi xảy ra khi xử lý trùng lặp');
    }
  };

  const handleEditItem = async (values: any, materialId: number, type: 'products' | 'wastes' | 'materials', materialItemId: number, index: number) => {
    try {
      console.log('Editing item:', values, 'for materialId:', materialId, 'type:', type, 'index:', index);
      
      const normalizeValue = (val: any) => String(val || '').trim();
      
      if (type === 'materials') {
        // Edit material item
        const updatedBlocks = materialBlocks.map(block => {
          if (block.materialId === materialId) {
            const updatedBlock = { ...block };
            updatedBlock.materials = block.materials.map(material => {
              if (material.id === materialItemId) {
                return {
                  ...material,
                  name: normalizeValue(values.name),
                  length: normalizeValue(values.length),
                  width: normalizeValue(values.width),
                  thickness: normalizeValue(values.thickness),
                  quantity: normalizeValue(values.quantity)
                };
              }
              return material;
            });
            return updatedBlock;
          }
          return block;
        });

        console.log('Updated blocks:', updatedBlocks);
        setMaterialBlocks(updatedBlocks);
        await saveMaterialChanges(materialId, updatedBlocks);
      } else {
        // Edit products/wastes
        const updatedItem: GlassInput = {
          name: normalizeValue(values.name),
          length: normalizeValue(values.length),
          width: normalizeValue(values.width),
          thickness: normalizeValue(values.thickness),
          quantity: normalizeValue(values.quantity)
        };

        const updatedBlocks = materialBlocks.map(block => {
          if (block.materialId === materialId) {
            const updatedBlock = { ...block };
            updatedBlock.materials = block.materials.map(material => {
              if (material.id === materialItemId) {
                const updatedMaterial = { ...material };
                if (type === 'products') {
                  updatedMaterial.products = [...material.products];
                  updatedMaterial.products[index] = updatedItem;
                } else {
                  updatedMaterial.wastes = [...material.wastes];
                  updatedMaterial.wastes[index] = updatedItem;
                }
                return updatedMaterial;
              }
              return material;
            });
            return updatedBlock;
          }
          return block;
        });

        console.log('Updated blocks:', updatedBlocks);
        setMaterialBlocks(updatedBlocks);
        await saveMaterialChanges(materialId, updatedBlocks);
      }
      
      closeModals();
    } catch (error) {
      console.error('Error editing item:', error);
      alert('Có lỗi xảy ra khi sửa item');
    }
  };

  // Modal Components
  const AddEditModal = ({ isOpen, isEdit, onClose }: { isOpen: boolean; isEdit: boolean; onClose: () => void }) => {
    if (!currentModalData) return null;

    const initialValues = isEdit && currentModalData.item ? {
      name: currentModalData.item.name,
      length: currentModalData.item.length,
      width: currentModalData.item.width,
      thickness: currentModalData.item.thickness,
      quantity: currentModalData.item.quantity
    } : {
      name: '',
      length: '',
      width: '',
      thickness: '',
      quantity: ''
    };

    const handleSubmit = (values: any) => {
      if (isEdit && currentModalData.index !== undefined && currentModalData.materialItemId) {
        handleEditItem(values, currentModalData.materialId, currentModalData.type, currentModalData.materialItemId, currentModalData.index);
      } else {
        handleAddItem(values, currentModalData.materialId, currentModalData.type, currentModalData.materialItemId);
      }
    };

    const getModalTitle = () => {
      const typeText = currentModalData.type === 'products' ? 'thành phẩm' : 
                      currentModalData.type === 'wastes' ? 'kính dư' : 'nguyên vật liệu';
      return `${isEdit ? 'Sửa' : 'Thêm'} ${typeText}`;
    };

    return (
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" open={isOpen} onClose={onClose}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0" />
          </TransitionChild>
          <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
            <div className="flex min-h-screen items-start justify-center px-4">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel as="div" className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                  <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                    <div className="text-lg font-bold">{getModalTitle()}</div>
                    <button type="button" className="text-white-dark hover:text-dark" onClick={onClose}>
                      <IconX />
                    </button>
                  </div>
                  <div className="p-5">
                    <Formik
                      initialValues={initialValues}
                      validationSchema={GlassItemSchema}
                      onSubmit={handleSubmit}
                    >
                      {({ errors, touched }) => (
                        <Form>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block mb-1 font-medium">Tên kính</label>
                              <Field name="name" className="form-input" placeholder="Tên kính" />
                              {touched.name && errors.name && <div className="text-danger text-xs mt-1">{errors.name}</div>}
                            </div>
                            <div>
                              <label className="block mb-1 font-medium">Chiều dài</label>
                              <Field name="length" type="number" className="form-input" placeholder="mm" />
                              {touched.length && errors.length && <div className="text-danger text-xs mt-1">{errors.length}</div>}
                            </div>
                            <div>
                              <label className="block mb-1 font-medium">Chiều rộng</label>
                              <Field name="width" type="number" className="form-input" placeholder="mm" />
                              {touched.width && errors.width && <div className="text-danger text-xs mt-1">{errors.width}</div>}
                            </div>
                            <div>
                              <label className="block mb-1 font-medium">Độ dày</label>
                              <Field name="thickness" type="number" className="form-input" placeholder="mm" />
                              {touched.thickness && errors.thickness && <div className="text-danger text-xs mt-1">{errors.thickness}</div>}
                            </div>
                            <div>
                              <label className="block mb-1 font-medium">Số lượng</label>
                              <Field name="quantity" type="number" className="form-input" placeholder="Cái" />
                              {touched.quantity && errors.quantity && <div className="text-danger text-xs mt-1">{errors.quantity}</div>}
                            </div>
                          </div>
                          <div className="mt-8 flex items-center justify-end gap-2">
                            <button type="button" className="btn btn-outline-danger" onClick={onClose}>
                              Hủy
                            </button>
                            <button type="submit" className="btn btn-primary">
                              {isEdit ? 'Cập nhật' : 'Thêm'}
                            </button>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    );
  };

  const renderTable = (items: GlassInput[], materialId: number, materialItemId: number, type: 'products' | 'wastes') => {
    console.log('Rendering table for', type, 'items:', items);
    if (!items || items.length === 0) {
      return (
        <div className="text-gray-500 italic text-center py-8">
          Chưa có {type === 'products' ? 'thành phẩm' : 'kính dư'}
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="table table-striped w-full">
          <thead>
            <tr>
              <th className="w-2/5">Tên kính</th>
              <th className="w-2/5">Kích thước (mm)</th>
              <th className="w-1/10">Số lượng</th>
              <th className="w-1/10">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => {
              console.log('Rendering item:', item, 'at index:', index);
              const displayName = item.name || 'N/A';
              const displaySize = item.length && item.width && item.thickness 
                ? `${item.length} x ${item.width} x ${item.thickness}`
                : item.thickness 
                  ? `Độ dày: ${item.thickness}`
                  : 'N/A';
              const displayQuantity = item.quantity || '0';
              
              console.log('Display values:', { displayName, displaySize, displayQuantity });
              
              return (
                <tr key={index}>
                  <td className="font-semibold">{displayName}</td>
                  <td>{displaySize}</td>
                  <td className="text-center">{displayQuantity}</td>
                  <td>
                    <div className="flex gap-2 justify-center">
                      <button
                        type="button"
                        onClick={() => openEditModal(materialId, type, materialItemId, index, item)}
                        className="btn btn-sm btn-outline-primary"
                      >
                        <IconEdit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteGlassRow(materialId, materialItemId, type, index)}
                        className="btn btn-sm btn-outline-danger"
                      >
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  if (!materialBlocks.length) return <div>Loading...</div>;

  return (
    <div>
      {/* Danh sach phieu hien co */}
      {materialBlocks.map((block, matIdx) => (
        <div key={block.materialId} className="panel mb-6">
          <div className="flex flex-wrap justify-between gap-4 px-4">
            <div className="text-2xl font-semibold uppercase">{block.materialName}</div>
            <div className="shrink-0">
              <span className="badge badge-outline-primary">Phiếu cắt kính</span>
            </div>
          </div>

          {/* Thong tin nguyen lieu */}
          <div className="px-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-white-dark">Kích thước:</div>
                <div className="font-semibold">{block.height} x {block.width} mm</div>
              </div>
              <div>
                <div className="text-white-dark">Số lượng:</div>
                <div className="font-semibold">{block.quantity}</div>
              </div>
              <div>
                <div className="text-white-dark">Độ dày:</div>
                <div className="font-semibold">{block.thickness} mm</div>
              </div>
            </div>
          </div>

          <hr className="my-6 border-white-light dark:border-[#1b2e4b]" />

          {/* Nguyên vật liệu */}
          <div className="px-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Nguyên Vật Liệu</h4>
              <button
                type="button"
                onClick={() => openAddModal(block.materialId, 'materials')}
                className="btn btn-sm btn-primary gap-2"
              >
                <IconPlus className="w-4 h-4" />
                Thêm nguyên vật liệu
              </button>
            </div>
            
            {block.materials.length === 0 ? (
              <div className="text-gray-500 italic text-center py-8">
                Chưa có nguyên vật liệu
              </div>
            ) : (
              <div className="space-y-6">
                {block.materials.map((material, materialIndex) => (
                  <div key={material.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="text-lg font-semibold">{material.name}</h5>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(block.materialId, 'materials', material.id, materialIndex, material)}
                          className="btn btn-sm btn-outline-primary"
                        >
                          <IconEdit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteMaterialItem(block.materialId, material.id)}
                          className="btn btn-sm btn-outline-danger"
                        >
                          <IconTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-600">Kích thước:</span>
                        <div className="font-semibold">{material.length} x {material.width} x {material.thickness} mm</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Số lượng:</span>
                        <div className="font-semibold">{material.quantity}</div>
                      </div>
                    </div>

                    {/* Thành phẩm */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <h6 className="font-semibold">Thành Phẩm</h6>
                        <button
                          type="button"
                          onClick={() => openAddModal(block.materialId, 'products', material.id)}
                          className="btn btn-xs btn-primary gap-1"
                        >
                          <IconPlus className="w-3 h-3" />
                          Thêm
                        </button>
                      </div>
                      {renderTable(material.products, block.materialId, material.id, 'products')}
                    </div>

                    {/* Kính dư */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h6 className="font-semibold">Kính Dư (DC)</h6>
                        <button
                          type="button"
                          onClick={() => openAddModal(block.materialId, 'wastes', material.id)}
                          className="btn btn-xs btn-primary gap-1"
                        >
                          <IconPlus className="w-3 h-3" />
                          Thêm
                        </button>
                      </div>
                      {renderTable(material.wastes, block.materialId, material.id, 'wastes')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Modals */}
      <AddEditModal isOpen={showAddModal} isEdit={false} onClose={closeModals} />
      <AddEditModal isOpen={showEditModal} isEdit={true} onClose={closeModals} />
      
      {/* Duplicate Confirmation Modal */}
      <Transition appear show={showDuplicateModal} as={Fragment}>
        <Dialog as="div" open={showDuplicateModal} onClose={closeModals}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0" />
          </TransitionChild>
          <div className="fixed inset-0 z-[999] overflow-y-auto bg-[black]/60">
            <div className="flex min-h-screen items-start justify-center px-4">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel as="div" className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                  <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                    <div className="text-lg font-bold">Phát hiện trùng lặp</div>
                    <button type="button" className="text-white-dark hover:text-dark" onClick={closeModals}>
                      <IconX />
                    </button>
                  </div>
                  <div className="p-5">
                    {duplicateData && (
                      <div>
                        <div className="mb-4">
                          <p className="text-gray-600 mb-3">
                            Đã tìm thấy {duplicateData.type === 'products' ? 'thành phẩm' : 
                                         duplicateData.type === 'wastes' ? 'kính dư' : 'nguyên vật liệu'} tương tự:
                          </p>
                          
                          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
                            <h6 className="font-semibold mb-2">Item hiện tại:</h6>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div><span className="text-gray-600">Tên:</span> {duplicateData.existingItem.name}</div>
                              <div><span className="text-gray-600">Kích thước:</span> {duplicateData.existingItem.length} x {duplicateData.existingItem.width} x {duplicateData.existingItem.thickness}</div>
                              <div><span className="text-gray-600">Số lượng hiện tại:</span> {duplicateData.existingItem.quantity}</div>
                            </div>
                          </div>
                          
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
                            <h6 className="font-semibold mb-2">Item mới:</h6>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div><span className="text-gray-600">Tên:</span> {duplicateData.newItem.name}</div>
                              <div><span className="text-gray-600">Kích thước:</span> {duplicateData.newItem.length} x {duplicateData.newItem.width} x {duplicateData.newItem.thickness}</div>
                              <div><span className="text-gray-600">Số lượng mới:</span> {duplicateData.newItem.quantity}</div>
                            </div>
                          </div>
                          
                          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                            <h6 className="font-semibold mb-2">Sau khi cộng dồn:</h6>
                            <div className="text-sm">
                              <span className="text-gray-600">Tổng số lượng:</span> 
                              <span className="font-semibold text-green-600 ml-2">
                                {parseInt(duplicateData.existingItem.quantity) + parseInt(duplicateData.newItem.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-end gap-2">
                          <button type="button" className="btn btn-outline-danger" onClick={closeModals}>
                            Hủy
                          </button>
                          <button type="button" className="btn btn-primary" onClick={handleDuplicateConfirm}>
                            Cộng dồn
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default CuttingGlassPage; 