'use client';

import React from 'react';
import DetailDeliveryComponent from '@/components/VNG/delivery/DetailDeliveryComponent';

const DeliveryDetailPage = () => {
    return (
        <div>
            <div className="mb-5">
                <h2 className="text-lg font-semibold">Chi tiết phiếu giao hàng</h2>
            </div>
            <DetailDeliveryComponent />
        </div>
    );
};

export default DeliveryDetailPage;
