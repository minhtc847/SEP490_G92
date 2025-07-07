'use client';
import ProductionPlanListAccountant from '@/components/VNG/accountant/production-plan-list-accountant';
import React from 'react';

const WorkerProductionPlansPage = () => {
    return (
        <div>
            <div className="mb-5">
                <h1 className="text-2xl font-bold">Danh sách kế hoạch sản xuất</h1>
            </div>
            <div className="panel mt-6">
                <ProductionPlanListAccountant />
            </div>
        </div>
    );
};

export default WorkerProductionPlansPage;
