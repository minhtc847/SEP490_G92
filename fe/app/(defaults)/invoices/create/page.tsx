'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AddInvoiceComponent from '@/components/VNG/invoice/AddInvoiceComponent';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const CreateInvoicePage = () => {
    const router = useRouter();

    const handleSuccess = () => {
        router.push('/invoices');
    };

    const handleCancel = () => {
        router.push('/invoices');
    };

    return (
        <ProtectedRoute requiredRole={[1, 2]}>

        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Tạo hóa đơn mới</h1>
                <p className="text-gray-600">Điền thông tin để tạo hóa đơn mới</p>
            </div>
            
            <AddInvoiceComponent 
                onSuccess={handleSuccess}
                onCancel={handleCancel}
            />
        </div>
        </ProtectedRoute>

    );
};

export default CreateInvoicePage;
