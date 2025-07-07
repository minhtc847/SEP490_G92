// fe/app/(defaults)/mockup/production-orders/page.tsx

'use client';
import React from 'react';
import ProductionOrdersListWorker from '@/components/VNG/worker/production-orders-list-worker';

const ProductionOrdersMockupPage = () => {
    return (
        <div>
            <div className="mb-5">
                <h1 className="text-2xl font-bold">Danh sách lệnh sản xuất (Mockup - Worker View)</h1>
                <p className="text-gray-600 mt-2">Trang mockup hiển thị view cho bộ phận sản xuất</p>
            </div>
            
            <div className="panel mt-6">
                <ProductionOrdersListWorker />
            </div>
        </div>
    );
};

export default ProductionOrdersMockupPage;