'use client';
import ProductionPlanList from '@/components/VNG/worker/production-plan-list';
import React from 'react';

const WorkerProductionPlansPage = () => {
    return (
        <div>
            <div className="mb-5">
                <h1 className="text-2xl font-bold">Danh sách kế hoạch sản xuất</h1>
            </div>
            <div className="panel mt-6">
                <ProductionPlanList />
            </div>
        </div>
    );
};

export default WorkerProductionPlansPage;
