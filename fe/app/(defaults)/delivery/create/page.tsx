'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AddDeliveryComponent from '@/components/VNG/delivery/AddDeliveryComponent';
import { getSalesOrdersForDelivery, SalesOrderOption } from '../service';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const DeliveryCreatePage = () => {
    const router = useRouter();
    const [salesOrders, setSalesOrders] = useState<SalesOrderOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSalesOrders = async () => {
            try {
                setLoading(true);
                const data = await getSalesOrdersForDelivery();
                setSalesOrders(data);
            } catch (err: any) {
                console.error('Lỗi khi tải danh sách đơn hàng:', err);
                setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };

        fetchSalesOrders();
    }, []);

    const handleSuccess = () => {
        router.push('/delivery');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg"></div>
                    <p className="mt-4 text-gray-600">Đang tải danh sách đơn hàng...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-4">⚠️</div>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="btn btn-primary"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    if (salesOrders.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-gray-500 text-xl mb-4">📦</div>
                    <p className="text-gray-600 mb-4">Không có đơn hàng nào để tạo phiếu giao hàng.</p>
                    <button 
                        onClick={() => router.push('/sales-order')} 
                        className="btn btn-primary"
                    >
                        Tạo đơn hàng mới
                    </button>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute requiredRole={[1, 2]}>

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
                
                <AddDeliveryComponent />
            </div>
        </div>
        </ProtectedRoute>
    );
};

export default DeliveryCreatePage;
