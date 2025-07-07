'use client';
import ProductionPlanDetailManager from '@/components/VNG/manager/production-plan-detail-manager';
import React from 'react';

interface ProductionPlanDetailPageProps {
    params: {
        id: string;
    };
}

const ProductionPlanDetailPage: React.FC<ProductionPlanDetailPageProps> = ({ params }) => {


    const handleOrderCreated = () => {
        console.log('Production order created for plan:', params.id);
    };

    return (
        <div>
            <div className="mb-5">
                <h1 className="text-2xl font-bold">Chi tiết kế hoạch sản xuất</h1>
            </div>

            <ProductionPlanDetailManager
                onOrderCreated={handleOrderCreated}
            />

        </div>
    );
};

export default ProductionPlanDetailPage;
