'use client';
import ProductionPlanListManager from '@/components/VNG/manager/production-plan-list-manager';
import React from 'react';

const WorkerProductionPlansPage = () => {
    return (
        <div>
            <div className="mb-5">
                <h1 className="text-2xl font-bold">Danh sách kế hoạch sản xuất</h1>
            </div>
            <div className="panel mt-6">
                <ProductionPlanListManager />
            </div>
        </div>
    );
};

export default WorkerProductionPlansPage;
