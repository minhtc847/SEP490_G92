'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DetailDeliveryComponent from '@/components/VNG/delivery/DetailDeliveryComponent';
import { getSalesOrdersForDelivery} from '../service';

const DeliveryDetailPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="mb-6">
                    <button 
                        onClick={() => router.push('/delivery')}
                        className="btn btn-outline btn-sm mb-4"
                    >
                        ← Quay lại danh sách
                    </button>
                </div>
                
                <DetailDeliveryComponent />
            </div>
        </div>
    );
};

export default DeliveryDetailPage;
