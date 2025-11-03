'use client';

import React from 'react';
import DetailDeliveryComponent from '@/components/VNG/delivery/DetailDeliveryComponent';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const DeliveryDetailPage = () => {
    return (
        <ProtectedRoute requiredRole={[1, 2]}>

        <div>
            <div className="mb-5">
                <h2 className="text-lg font-semibold">Chi tiết phiếu giao hàng</h2>
            </div>
            <DetailDeliveryComponent />
        </div>
        </ProtectedRoute>
    );
};

export default DeliveryDetailPage;
