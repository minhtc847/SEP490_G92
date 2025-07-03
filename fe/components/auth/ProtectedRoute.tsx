'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { usePermissions } from '@/hooks/usePermissions';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredPermission?: string;
    requiredRole?: number;
    fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredPermission,
    requiredRole,
    fallbackPath = '/auth/cover-login'
}) => {
    const router = useRouter();
    const isAuthenticated = useSelector((state: IRootState) => state.auth.isAuthenticated);
    const token = useSelector((state: IRootState) => state.auth.token);
    const { hasPermission, roleId, isAuthenticated: authFromHook } = usePermissions();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if we have a token but user data is not loaded yet
        if (token && !isAuthenticated) {
            // Wait a bit for the auth restoration to complete
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 100);
            return () => clearTimeout(timer);
        }
        
        setIsLoading(false);
    }, [token, isAuthenticated]);

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated && !token) {
            router.push(fallbackPath);
            return;
        }

        // Check role requirement
        if (requiredRole && roleId !== requiredRole) {
            router.push('/unauthorized');
            return;
        }

        // Check permission requirement
        if (requiredPermission && !hasPermission(requiredPermission)) {
            router.push('/unauthorized');
            return;
        }
    }, [isAuthenticated, requiredPermission, requiredRole, roleId, router, fallbackPath, hasPermission, token, isLoading]);

    // Show loading while checking authentication
    if (isLoading || (token && !isAuthenticated)) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Show loading or redirect if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Check role requirement
    if (requiredRole && roleId !== requiredRole) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Không có quyền truy cập</h1>
                    <p className="text-gray-600">Bạn không có quyền truy cập trang này.</p>
                </div>
            </div>
        );
    }

    // Check permission requirement
    if (requiredPermission && !hasPermission(requiredPermission)) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Không có quyền truy cập</h1>
                    <p className="text-gray-600">Bạn không có quyền truy cập trang này.</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute; 