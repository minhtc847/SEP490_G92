'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import CreateProductionPlanManager from '@/components/VNG/manager/production-plans/create';

export default function ProductionPlanCreatePage() {
    return (
        <ProtectedRoute requiredRole={[1]}>

        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Tạo kế hoạch sản xuất</h1>
            <CreateProductionPlanManager />
        </div>
        </ProtectedRoute>

    );
}
