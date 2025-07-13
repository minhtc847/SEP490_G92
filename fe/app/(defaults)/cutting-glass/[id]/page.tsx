"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import IconPlus from '@/components/icon/icon-plus';
import IconEdit from '@/components/icon/icon-edit';
import IconTrash from '@/components/icon/icon-trash';

interface GlassInput {
  name: string;
  length: string;
  width: string;
  thickness: string;
  quantity: string;
}

interface MaterialBlock {
  materialId: number;
  materialName: string;
  width: number;
  height: number;
  thickness: number;
  quantity: number;
  materialType: number;
  products: GlassInput[];
  wastes: GlassInput[];
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
  const [editingItem, setEditingItem] = useState<{
    materialId: number;
    type: 'products' | 'wastes';
    index: number;
  } | null>(null);
  const [addingItem, setAddingItem] = useState<{
    materialId: number;
    type: 'products' | 'wastes';
  } | null>(null);

  // parse data tu api
  const parseGlassItem = (item: any) => {
    const outputName = item.outputName || '';    
 
    const sizeMatch = outputName.match(/(\d+)\s*[xX]\s*(\d+)\s*[xX]\s*(\d+)/);
    
    if (sizeMatch) {
      //co' kich thuoc trong ten
      const name = outputName.replace(/\s*\d+\s*[xX]\s*\d+\s*[xX]\s*\d+/, '').trim(); 
      return {
        name: name || '',
        length: sizeMatch[1] || '',
        width: sizeMatch[2] || '',
        thickness: sizeMatch[3] || '',
        quantity: item.quantity?.toString() || ''
      };
    } else {
      //khong co kich thuoc trong ten
      return {
        name: outputName || '',
        length: '',
        width: '',
        thickness: item.outputType?.toString() || '',
        quantity: item.quantity?.toString() || ''
      };
    }
  };


  const parseMaterialBlock = (mat: any, index: number) => ({
    materialId: mat.materialId || mat.id || index + 1,
    materialName: mat.materialName,
    width: mat.width || 0,
    height: mat.height || 0,
    thickness: mat.thickness || 0,
    quantity: mat.quantity || 0,
    materialType: mat.materialType || 0,
    products: mat.products && mat.products.length > 0 
      ? mat.products.map(parseGlassItem)
      : [],
    wastes: mat.wastes && mat.wastes.length > 0
      ? mat.wastes.map(parseGlassItem)
      : []
  });

  useEffect(() => {
    if (!productionOrderId) return;
    
    const loadData = async () => {
      try {
        const response = await fetch(`https://localhost:7075/api/CutGlassInvoice/by-production-order/${productionOrderId}`);
        if (!response.ok) {
          console.error('Failed to load data:', response.status);
          return;
        }
        
        const data = await response.json();
        console.log('Loaded data:', data);
        
        setMaterialBlocks(
          (data.materials || []).map((mat: any, index: number) => parseMaterialBlock(mat, index))
        );
        setSavedData(data);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, [productionOrderId]);
  
  const addGlassRow = (materialId: number, type: 'products' | 'wastes') => {
    setAddingItem({ materialId, type });
  };

  const handleGlassChange = (matIdx: number, type: 'products' | 'wastes', idx: number, field: keyof GlassInput, value: string) => {
    setMaterialBlocks(blocks => {
      const newBlocks = [...blocks];
      newBlocks[matIdx][type][idx][field] = value;
      return newBlocks;
    });
  };

  const deleteGlassRow = async (materialId: number, type: 'products' | 'wastes', index: number) => {
    const block = materialBlocks.find(b => b.materialId === materialId);
    if (!block) return;

    const itemName = block[type][index]?.name || `${type === 'products' ? 'Thành phẩm' : 'Kính dư'} ${index + 1}`;
    
    console.log('Deleting item:', { materialId, type, index, itemName, item: block[type][index] });
    
    const result = await Swal.fire({
      title: 'Xác nhận xóa?',
      text: `Bạn có chắc chắn muốn xóa "${itemName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Có, xóa!',
      cancelButtonText: 'Hủy',
      reverseButtons: true,
      customClass: {
        popup: 'sweet-alerts',
        confirmButton: 'btn btn-danger',
        cancelButton: 'btn btn-outline-secondary',
      },
      buttonsStyling: false,
    });

    if (!result.isConfirmed) return;

    console.log('User confirmed deletion, proceeding...');

    // Tao ban copy cua state hien tai va xoa item
    const updatedBlocks = [...materialBlocks];
    const blockIndex = updatedBlocks.findIndex(b => b.materialId === materialId);
    if (blockIndex !== -1) {
      console.log('Removing item from state:', { blockIndex, type, index });
      console.log('Before removal:', updatedBlocks[blockIndex][type].length, 'items');
      updatedBlocks[blockIndex][type].splice(index, 1);
      console.log('After removal:', updatedBlocks[blockIndex][type].length, 'items');
      console.log('Updated state:', updatedBlocks[blockIndex][type]);
    }

    // Cap nhat state local
    setMaterialBlocks(updatedBlocks);

    // Luu thay doi va reload data tu server
    try {
      console.log('Saving changes to server...');
      await saveMaterialChanges(materialId, updatedBlocks);
      
      console.log('Reloading data from server...');
      //Reload data tu server de dam bao dong bo
      const reloadResponse = await fetch(`https://localhost:7075/api/CutGlassInvoice/by-production-order/${productionOrderId}`);
      if (reloadResponse.ok) {
        const data = await reloadResponse.json();
        console.log('Reloaded data:', data);
        setSavedData(data);
        setMaterialBlocks(
          (data.materials || []).map((mat: any, index: number) => parseMaterialBlock(mat, index))
        );
      } else {
        console.error('Failed to reload data:', reloadResponse.status);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      // Neu luu that bai, reload lai data de tranh mat data
      const reloadResponse = await fetch(`https://localhost:7075/api/CutGlassInvoice/by-production-order/${productionOrderId}`);
      if (reloadResponse.ok) {
        const data = await reloadResponse.json();
        setSavedData(data);
        setMaterialBlocks(
          (data.materials || []).map((mat: any, index: number) => parseMaterialBlock(mat, index))
        );
      }
    }
  };

  const startEditItem = (materialId: number, type: 'products' | 'wastes', index: number) => {
    setEditingItem({ materialId, type, index });
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setAddingItem(null);
  };

  const saveMaterialChanges = async (materialId: number, blocksToSave?: MaterialBlock[]) => {
    const blocks = blocksToSave || materialBlocks;
    const block = blocks.find(b => b.materialId === materialId);
    if (!block) return;

    console.log('Saving material changes:', { materialId, block });

    try {
      // Tao payload cho TAT CA material blocks, khong chi block hien tai
      const allMaterials = blocks.map(block => ({
        materialId: block.materialId,
        products: block.products.filter(g => g.name && g.length && g.width && g.thickness && g.quantity).map(g => ({
          OutputName: `${g.name} ${g.length}x${g.width}x${g.thickness}`.trim(),
          OutputType: Number(g.thickness) || 0,
          Quantity: Number(g.quantity),
          IsWaste: false
        })),
        wastes: block.wastes.filter(g => g.name && g.length && g.width && g.thickness && g.quantity).map(g => ({
          OutputName: `${g.name} ${g.length}x${g.width}x${g.thickness}`.trim(),
          OutputType: Number(g.thickness) || 0,
          Quantity: Number(g.quantity),
          IsWaste: true
        }))
      }));
      
      const payload = {
        productionOrderId: Number(productionOrderId),
        materials: allMaterials
      };
      
      console.log('Sending payload to server:', payload);
      console.log('Payload details:');
      payload.materials.forEach((mat, idx) => {
        console.log(`Material ${idx}:`, {
          materialId: mat.materialId,
          productsCount: mat.products.length,
          wastesCount: mat.wastes.length,
          products: mat.products,
          wastes: mat.wastes
        });
      });
      
      const response = await fetch('https://localhost:7075/api/CutGlassInvoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      console.log('Server response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: `Lỗi khi lưu thay đổi: ${response.status} - ${errorText}`,
          customClass: { popup: 'sweet-alerts' },
        });
        return;
      }
      
      const result = await response.json();
      console.log('Server response:', result);
      
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: `Lưu tất cả thay đổi thành công!`,
          customClass: { popup: 'sweet-alerts' },
        });
        
        //Reload data tu server de dam bao dong bo
        const reloadResponse = await fetch(`https://localhost:7075/api/CutGlassInvoice/by-production-order/${productionOrderId}`);
        if (reloadResponse.ok) {
          const data = await reloadResponse.json();
          console.log('Reloaded data after save:', data);
          setSavedData(data);
          setMaterialBlocks(
            (data.materials || []).map((mat: any, index: number) => parseMaterialBlock(mat, index))
          );
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: result.message || 'Có lỗi xảy ra khi lưu',
          customClass: { popup: 'sweet-alerts' },
        });
      }
    } catch (error) {
      console.error('Error saving:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: `Lỗi: ${error instanceof Error ? error.message : 'Unknown error'}`,
        customClass: { popup: 'sweet-alerts' },
      });
    }
  };
  
  const handleAddItem = async (values: any, materialId: number, type: 'products' | 'wastes') => {
    const block = materialBlocks.find(b => b.materialId === materialId);
    if (!block) return;
    
    const nameSizeMatch = values.name.match(/(\d+)\s*[xX]\s*(\d+)\s*[xX]\s*(\d+)/);
    
    let finalName = values.name;
    let finalLength = values.length;
    let finalWidth = values.width;
    let finalThickness = values.thickness;
    let hasConflict = false;
    
    if (nameSizeMatch && (values.length || values.width || values.thickness)) {
      hasConflict = true;      
      finalName = values.name.replace(/\s*\d+\s*[xX]\s*\d+\s*[xX]\s*\d+/, '').trim();      
      
      if (!finalLength) finalLength = nameSizeMatch[1];
      if (!finalWidth) finalWidth = nameSizeMatch[2];
      if (!finalThickness) finalThickness = nameSizeMatch[3];
    } else if (nameSizeMatch && !values.length && !values.width && !values.thickness) {      
      finalName = values.name.replace(/\s*\d+\s*[xX]\s*\d+\s*[xX]\s*\d+/, '').trim();
      finalLength = nameSizeMatch[1];
      finalWidth = nameSizeMatch[2];
      finalThickness = nameSizeMatch[3];
    }
    
    if (hasConflict) {
      await Swal.fire({
        icon: 'info',
        title: 'Thông báo',
        text: 'Phát hiện kích thước trong tên và các trường riêng biệt. Hệ thống sẽ ưu tiên các trường riêng biệt.',
        customClass: { popup: 'sweet-alerts' },
      });
    }
    
    const existingItemIndex = block[type].findIndex(item => {      
      const normalizeValue = (val: any) => String(val || '').trim();
      
      const itemNameMatch = normalizeValue(item.name) === normalizeValue(finalName);
      const itemLengthMatch = normalizeValue(item.length) === normalizeValue(finalLength);
      const itemWidthMatch = normalizeValue(item.width) === normalizeValue(finalWidth);
      const itemThicknessMatch = normalizeValue(item.thickness) === normalizeValue(finalThickness);
      
      console.log('Checking duplicate:', {
        item: { 
          name: item.name, 
          length: item.length, 
          width: item.width, 
          thickness: item.thickness 
        },
        newItem: { 
          name: finalName, 
          length: finalLength, 
          width: finalWidth, 
          thickness: finalThickness 
        },
        normalized: {
          item: {
            name: normalizeValue(item.name),
            length: normalizeValue(item.length),
            width: normalizeValue(item.width),
            thickness: normalizeValue(item.thickness)
          },
          newItem: {
            name: normalizeValue(finalName),
            length: normalizeValue(finalLength),
            width: normalizeValue(finalWidth),
            thickness: normalizeValue(finalThickness)
          }
        },
        matches: { 
          name: itemNameMatch, 
          length: itemLengthMatch, 
          width: itemWidthMatch, 
          thickness: itemThicknessMatch 
        }
      });
      
      return itemNameMatch && itemLengthMatch && itemWidthMatch && itemThicknessMatch;
    });

    console.log('Existing item index:', existingItemIndex);

    if (existingItemIndex !== -1) {      
      const existingItem = block[type][existingItemIndex];
      const newQuantity = Number(existingItem.quantity) + Number(values.quantity);      
      
      const result = await Swal.fire({
        icon: 'question',
        title: 'Kính đã tồn tại',
        text: `Kính "${finalName}" với kích thước ${finalLength}x${finalWidth}x${finalThickness} đã tồn tại với số lượng ${existingItem.quantity}. Bạn có muốn cộng thêm ${values.quantity} vào không?`,
        showCancelButton: true,
        confirmButtonText: 'Có, cộng dồn',
        cancelButtonText: 'Hủy',
        customClass: { popup: 'sweet-alerts' },
      });

      if (!result.isConfirmed) {
        return; 
      }
     
      //Cap nhat so luong trong state
      setMaterialBlocks(blocks => {
        const newBlocks = [...blocks];
        const blockIndex = newBlocks.findIndex(b => b.materialId === materialId);
        if (blockIndex !== -1) {
          newBlocks[blockIndex][type][existingItemIndex].quantity = newQuantity.toString();
        }
        return newBlocks;
      });

      setAddingItem(null);

      
      try {
        await saveMaterialChanges(materialId);      
        const reloadResponse = await fetch(`https://localhost:7075/api/CutGlassInvoice/by-production-order/${productionOrderId}`);
        if (reloadResponse.ok) {
          const data = await reloadResponse.json();
          setSavedData(data);
          setMaterialBlocks(
            (data.materials || []).map((mat: any, index: number) => parseMaterialBlock(mat, index))
          );
        }
      } catch (error) {
        console.error('Error saving updated quantity:', error);        
        const reloadResponse = await fetch(`https://localhost:7075/api/CutGlassInvoice/by-production-order/${productionOrderId}`);
        if (reloadResponse.ok) {
          const data = await reloadResponse.json();
          setSavedData(data);
          setMaterialBlocks(
            (data.materials || []).map((mat: any, index: number) => parseMaterialBlock(mat, index))
          );
        }
      }
    } else {
      // Kinh chua ton tai, them moi
        const newItem = {
        name: finalName,
        length: finalLength,
        width: finalWidth,
        thickness: finalThickness,
        quantity: values.quantity
      };

      // Them item moi vao state tam thoi de hien thi ngay lap tuc
      setMaterialBlocks(blocks => {
        const newBlocks = [...blocks];
        const blockIndex = newBlocks.findIndex(b => b.materialId === materialId);
        if (blockIndex !== -1) {
          newBlocks[blockIndex][type].push(newItem);
        }
        return newBlocks;
      });

      setAddingItem(null);

      // Luu va reload data tu server de dam bao dong bo
      try {
        await saveMaterialChanges(materialId);
        
        // Reload data tu server de dam bao khong co duplicate
        const reloadResponse = await fetch(`https://localhost:7075/api/CutGlassInvoice/by-production-order/${productionOrderId}`);
        if (reloadResponse.ok) {
          const data = await reloadResponse.json();
          setSavedData(data);
          setMaterialBlocks(
            (data.materials || []).map((mat: any, index: number) => parseMaterialBlock(mat, index))
          );
        }
      } catch (error) {
        console.error('Error saving new item:', error);
        // Neu luu that bai, reload lai data de tranh duplicate
        const reloadResponse = await fetch(`https://localhost:7075/api/CutGlassInvoice/by-production-order/${productionOrderId}`);
        if (reloadResponse.ok) {
          const data = await reloadResponse.json();
          setSavedData(data);
          setMaterialBlocks(
            (data.materials || []).map((mat: any, index: number) => parseMaterialBlock(mat, index))
          );
        }
      }
    }
  };

  const handleEditItem = async (values: any, materialId: number, type: 'products' | 'wastes', index: number) => {
    const block = materialBlocks.find(b => b.materialId === materialId);
    if (!block) return;

    const nameSizeMatch = values.name.match(/(\d+)\s*[xX]\s*(\d+)\s*[xX]\s*(\d+)/);
    
    let finalName = values.name;
    let finalLength = values.length;
    let finalWidth = values.width;
    let finalThickness = values.thickness;
    let hasConflict = false;
    
    if (nameSizeMatch && (values.length || values.width || values.thickness)) {
      hasConflict = true;     
      finalName = values.name.replace(/\s*\d+\s*[xX]\s*\d+\s*[xX]\s*\d+/, '').trim();
      
      if (!finalLength) finalLength = nameSizeMatch[1];
      if (!finalWidth) finalWidth = nameSizeMatch[2];
      if (!finalThickness) finalThickness = nameSizeMatch[3];
    } else if (nameSizeMatch && !values.length && !values.width && !values.thickness) {
      finalName = values.name.replace(/\s*\d+\s*[xX]\s*\d+\s*[xX]\s*\d+/, '').trim();
      finalLength = nameSizeMatch[1];
      finalWidth = nameSizeMatch[2];
      finalThickness = nameSizeMatch[3];
    }

    if (hasConflict) {
      await Swal.fire({
        icon: 'info',
        title: 'Thông báo',
        text: 'Phát hiện kích thước trong tên và các trường riêng biệt. Hệ thống sẽ ưu tiên các trường riêng biệt.',
        customClass: { popup: 'sweet-alerts' },
      });
    }
    
    setMaterialBlocks(blocks => {
      const newBlocks = [...blocks];
      const blockIndex = newBlocks.findIndex(b => b.materialId === materialId);
      if (blockIndex !== -1) {
        newBlocks[blockIndex][type][index] = {
          name: finalName,
          length: finalLength,
          width: finalWidth,
          thickness: finalThickness,
          quantity: values.quantity
        };
      }
      return newBlocks;
    });

    setEditingItem(null);
    
    try {
      await saveMaterialChanges(materialId);      
      
      const reloadResponse = await fetch(`https://localhost:7075/api/CutGlassInvoice/by-production-order/${productionOrderId}`);
      if (reloadResponse.ok) {
        const data = await reloadResponse.json();
        setSavedData(data);
        setMaterialBlocks(
          (data.materials || []).map((mat: any, index: number) => parseMaterialBlock(mat, index))
        );
      }
    } catch (error) {
      console.error('Error saving edited item:', error);     
      const reloadResponse = await fetch(`https://localhost:7075/api/CutGlassInvoice/by-production-order/${productionOrderId}`);
      if (reloadResponse.ok) {
        const data = await reloadResponse.json();
        setSavedData(data);
        setMaterialBlocks(
          (data.materials || []).map((mat: any, index: number) => parseMaterialBlock(mat, index))
        );
      }
    }
  };

  const renderAddItemForm = (materialId: number, type: 'products' | 'wastes') => {
    if (!addingItem || addingItem.materialId !== materialId || addingItem.type !== type) return null;

    return (
      <Formik
        initialValues={{
          name: '',
          length: '',
          width: '',
          thickness: '',
          quantity: ''
        }}
        validationSchema={GlassItemSchema}
        onSubmit={(values) => handleAddItem(values, materialId, type)}
      >
        {({ errors, touched }) => (
          <Form className="border border-primary p-4 rounded-lg mb-4">
            <h5 className="text-primary mb-3">
              Thêm {type === 'products' ? 'thành phẩm' : 'kính dư'} mới
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label>Tên kính</label>
                <Field name="name" className="form-input" placeholder="Tên kính" />
                {touched.name && errors.name && <div className="text-danger text-xs">{errors.name}</div>}
              </div>
              <div>
                <label>Chiều dài</label>
                <Field name="length" type="number" className="form-input" placeholder="mm" />
                {touched.length && errors.length && <div className="text-danger text-xs">{errors.length}</div>}
              </div>
              <div>
                <label>Chiều rộng</label>
                <Field name="width" type="number" className="form-input" placeholder="mm" />
                {touched.width && errors.width && <div className="text-danger text-xs">{errors.width}</div>}
              </div>
              <div>
                <label>Độ dày</label>
                <Field name="thickness" type="number" className="form-input" placeholder="mm" />
                {touched.thickness && errors.thickness && <div className="text-danger text-xs">{errors.thickness}</div>}
              </div>
              <div>
                <label>Số lượng</label>
                <Field name="quantity" type="number" className="form-input" placeholder="Cái" />
                {touched.quantity && errors.quantity && <div className="text-danger text-xs">{errors.quantity}</div>}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="btn btn-primary btn-sm">
                Thêm
              </button>
              <button type="button" onClick={cancelEdit} className="btn btn-outline-secondary btn-sm">
                Hủy
              </button>
            </div>
          </Form>
        )}
      </Formik>
    );
  };

  const renderEditItemForm = (materialId: number, type: 'products' | 'wastes', index: number) => {
    if (!editingItem || editingItem.materialId !== materialId || editingItem.type !== type || editingItem.index !== index) return null;

    const block = materialBlocks.find(b => b.materialId === materialId);
    if (!block) return null;

    const item = block[type][index];
    if (!item) return null;

    return (
      <Formik
        initialValues={{
          name: item.name,
          length: item.length,
          width: item.width,
          thickness: item.thickness,
          quantity: item.quantity
        }}
        validationSchema={GlassItemSchema}
        onSubmit={(values) => handleEditItem(values, materialId, type, index)}
      >
        {({ errors, touched }) => (
          <Form className="border border-warning p-4 rounded-lg mb-4">
            <h5 className="text-warning mb-3">
              Sửa {type === 'products' ? 'thành phẩm' : 'kính dư'}
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label>Tên kính</label>
                <Field name="name" className="form-input" placeholder="Tên kính" />
                {touched.name && errors.name && <div className="text-danger text-xs">{errors.name}</div>}
              </div>
              <div>
                <label>Chiều dài</label>
                <Field name="length" type="number" className="form-input" placeholder="mm" />
                {touched.length && errors.length && <div className="text-danger text-xs">{errors.length}</div>}
              </div>
              <div>
                <label>Chiều rộng</label>
                <Field name="width" type="number" className="form-input" placeholder="mm" />
                {touched.width && errors.width && <div className="text-danger text-xs">{errors.width}</div>}
              </div>
              <div>
                <label>Độ dày</label>
                <Field name="thickness" type="number" className="form-input" placeholder="mm" />
                {touched.thickness && errors.thickness && <div className="text-danger text-xs">{errors.thickness}</div>}
              </div>
              <div>
                <label>Số lượng</label>
                <Field name="quantity" type="number" className="form-input" placeholder="Cái" />
                {touched.quantity && errors.quantity && <div className="text-danger text-xs">{errors.quantity}</div>}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="btn btn-warning btn-sm">
                Lưu
              </button>
              <button type="button" onClick={cancelEdit} className="btn btn-outline-secondary btn-sm">
                Hủy
              </button>
            </div>
          </Form>
        )}
      </Formik>
    );
  };

  const renderItemList = (items: GlassInput[], materialId: number, type: 'products' | 'wastes') => {
    if (!items || items.length === 0) {
      return (
        <div className="text-gray-500 italic text-center py-4">
          Chưa có {type === 'products' ? 'thành phẩm' : 'kính dư'}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <div className="font-semibold">{item.name}</div>
              <div className="text-sm text-gray-600">
                {item.length} x {item.width} x {item.thickness} mm - Số lượng: {item.quantity}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => startEditItem(materialId, type, index)}
                className="btn btn-sm btn-outline-primary"
                disabled={!!editingItem || !!addingItem}
              >
                <IconEdit className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => deleteGlassRow(materialId, type, index)}
                className="btn btn-sm btn-outline-danger"
                disabled={!!editingItem || !!addingItem}
              >
                <IconTrash className="w-4 h-4" />
              </button>
            </div>
            {renderEditItemForm(materialId, type, index)}
          </div>
        ))}
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

          {/* Thanh pham va kinh du */}
          <div className="px-4">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold">Thành Phẩm</h4>
                <button
                  type="button"
                  onClick={() => addGlassRow(block.materialId, 'products')}
                  className="btn btn-sm btn-primary gap-2"
                  disabled={!!editingItem || !!addingItem}
                >
                  <IconPlus className="w-4 h-4" />
                  Thêm thành phẩm
                </button>
              </div>
              {renderAddItemForm(block.materialId, 'products')}
              {renderItemList(block.products, block.materialId, 'products')}
            </div>

            {/* Kính Dư (DC) */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold">Kính Dư (DC)</h4>
                <button
                  type="button"
                  onClick={() => addGlassRow(block.materialId, 'wastes')}
                  className="btn btn-sm btn-primary gap-2"
                  disabled={!!editingItem || !!addingItem}
                >
                  <IconPlus className="w-4 h-4" />
                  Thêm kính dư
                </button>
              </div>
              {renderAddItemForm(block.materialId, 'wastes')}
              {renderItemList(block.wastes, block.materialId, 'wastes')}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CuttingGlassPage; 