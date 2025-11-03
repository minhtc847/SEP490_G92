'use client';
import { Metadata } from 'next';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';

export default function HomePage() {
    const router = useRouter();
    const roleId = useSelector((state: IRootState) => state.auth.user?.roleId);
    const isAuthenticated = useSelector((state: IRootState) => state.auth.isAuthenticated);
    const token = useSelector((state: IRootState) => state.auth.token);
    const [isHydrated, setIsHydrated] = useState(false);
    
    // Wait for client-side hydration to complete
    useEffect(() => {
        setIsHydrated(true);
    }, []);
    
    useEffect(() => {
        // Only proceed after hydration and when we have auth data
        if (!isHydrated) return;
        
        // Check if we have a token in localStorage (for cases where Redux hasn't loaded yet)
        const hasLocalToken = typeof window !== 'undefined' && localStorage.getItem('token');
        
        if (isAuthenticated && roleId) {
            // We have full auth data, proceed with redirect
            let redirectPath = '/sales-order'; // Default
            
            switch (roleId) {
                case 1: // Chủ xưởng
                    redirectPath = '/sales-order';
                    break;
                case 2: // Kế toán
                    redirectPath = '/sales-order';
                    break;
                case 3: // Bộ phận sản xuất
                    redirectPath = '/production-orders';
                    break;
                default:
                    redirectPath = '/sales-order';
                    break;
            }
            
            router.replace(redirectPath);
        } else if (hasLocalToken && !isAuthenticated) {
            // We have a token in localStorage but Redux hasn't loaded yet
            // Wait a bit more for Redux to restore auth state
            const timer = setTimeout(() => {
                if (!isAuthenticated) {
                    // If still not authenticated after timeout, redirect to login
                    router.replace('/auth/cover-login');
                }
            }, 1000);
            
            return () => clearTimeout(timer);
        } else if (!isAuthenticated && !hasLocalToken) {
            // No authentication at all, redirect to login
            router.replace('/auth/cover-login');
        }
    }, [isHydrated, roleId, isAuthenticated, token, router]);
    
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">
                    {!isHydrated ? 'Đang khởi tạo...' : 'Đang chuyển hướng...'}
                </p>
            </div>
        </div>
    );
}
