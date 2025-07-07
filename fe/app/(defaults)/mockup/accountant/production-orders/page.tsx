// fe/app/(defaults)/mockup/production-orders/page.tsx

'use client';
import React from 'react';
import ProductionOrdersListAccountant from '@/components/VNG/accountant/production-orders-list-accountant';

const ProductionOrdersMockupPage = () => {
    return (
        <div>
            <div className="mb-5">
                <h1 className="text-2xl font-bold">Danh sách lệnh sản xuất (Mockup - Worker View)</h1>
                <p className="text-gray-600 mt-2">Trang mockup hiển thị view cho bộ phận sản xuất</p>
            </div>
            
            <div className="panel mt-6">
                <ProductionOrdersListAccountant />
            </div>
        </div>
    );
};

export default ProductionOrdersMockupPage;