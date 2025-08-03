'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AddInvoiceComponent from '@/components/VNG/invoice/AddInvoiceComponent';

const CreateInvoicePage = () => {
    const router = useRouter();

    const handleSuccess = () => {
        router.push('/invoices');
    };

    const handleCancel = () => {
        router.push('/invoices');
    };

    return (
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
    );
};

export default CreateInvoicePage;
