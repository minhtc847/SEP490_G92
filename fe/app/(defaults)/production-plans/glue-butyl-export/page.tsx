'use client';

import React from 'react';

const GlueButylExportPage: React.FC = () => {
    return (
        <div>
            <div className="mb-5">
                <h1 className="text-2xl font-bold">Quản lý xuất keo butyl</h1>
                <p className="text-gray-600 mt-2">Quản lý và theo dõi việc xuất keo butyl cho sản xuất</p>
            </div>
            
            <div className="panel mt-6">
                <div className="text-center py-8">
                    <p className="text-gray-500">Chọn một phiếu xuất keo butyl để xem chi tiết</p>
                </div>
            </div>
        </div>
    );
};

export default GlueButylExportPage;
