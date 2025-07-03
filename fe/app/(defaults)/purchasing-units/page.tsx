'use client';
import { usePermissions } from '@/hooks/usePermissions';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const PurchasingUnitsPage = () => {
    const { isFactoryManager } = usePermissions();

    return (
        <ProtectedRoute requiredRole={1}>
            <div className="panel mt-6">
                <div className="mb-5">
                    <h2 className="text-lg font-bold">Quản Lý Đơn Mua</h2>
                    <p className="text-gray-600">Chức năng đang được phát triển</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold mb-4">Tạo Đơn Mua Mới</h3>
                        <p className="text-gray-600 mb-4">Tạo đơn mua hàng mới cho nhà cung cấp</p>
                        <button className="btn btn-primary">Tạo Đơn Mua</button>
                    </div>
                    
                    <div className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold mb-4">Danh Sách Đơn Mua</h3>
                        <p className="text-gray-600 mb-4">Xem và quản lý các đơn mua hàng</p>
                        <button className="btn btn-outline-primary">Xem Danh Sách</button>
                    </div>
                    
                    <div className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold mb-4">Báo Cáo Mua Hàng</h3>
                        <p className="text-gray-600 mb-4">Báo cáo thống kê mua hàng</p>
                        <button className="btn btn-outline-primary">Xem Báo Cáo</button>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
};

export default PurchasingUnitsPage; 