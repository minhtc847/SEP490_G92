'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import { usePermissions } from '@/hooks/usePermissions';

interface AuthWrapperProps {
    children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();
    const isAuthenticated = useSelector((state: IRootState) => state.auth.isAuthenticated);
    const token = useSelector((state: IRootState) => state.auth.token);
    const { hasPermission, roleId, isAuthenticated: authFromHook } = usePermissions();
    const [isLoading, setIsLoading] = useState(true);
    const [isRedirecting, setIsRedirecting] = useState(false);

    // Danh sách các trang không cần authentication
    const publicPaths = [
        '/auth/cover-login',
        '/auth/boxed-signin',
        '/auth/boxed-signup',
        '/auth/cover-register',
        '/auth/boxed-reset-password',
        '/auth/cover-reset-password',
        '/unauthorized'
    ];

    // Kiểm tra xem path hiện tại có phải là public path không
    const isPublicPath = publicPaths.some(path => pathname?.startsWith(path));

    useEffect(() => {
        // Nếu đang ở public path, không cần kiểm tra auth
        if (isPublicPath) {
            setIsLoading(false);
            return;
        }

        // Check if we have a token but user data is not loaded yet
        if (token && !isAuthenticated) {
            // Wait a bit for the auth restoration to complete
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 100);
            return () => clearTimeout(timer);
        }
        
        setIsLoading(false);
    }, [token, isAuthenticated, isPublicPath]);

    useEffect(() => {
        if (isLoading || isPublicPath) return;

        // Nếu chưa đăng nhập và không phải public path, redirect đến login
        if (!isAuthenticated && !token) {
            if (!isRedirecting) {
                setIsRedirecting(true);
                router.push('/auth/cover-login');
            }
            return;
        }

        // Nếu đã đăng nhập và đang ở trang login, redirect về dashboard
        if (isAuthenticated && pathname?.startsWith('/auth/')) {
            if (!isRedirecting) {
                setIsRedirecting(true);
                // Redirect based on role
                if (roleId === 1) {
                    router.push('/'); // Factory Manager - Dashboard
                } else if (roleId === 2) {
                    router.push('/'); // Accountant - Price Quotes
                } else if (roleId === 3) {
                    router.push('/production-orders'); // Production Staff - Production Orders
                } else {
                    router.push('/');
                }
            }
            return;
        }
    }, [isAuthenticated, token, pathname, router, isLoading, isPublicPath, isRedirecting, roleId]);

    // Show loading while checking authentication
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Nếu đang redirect, hiển thị loading
    if (isRedirecting) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Nếu chưa đăng nhập và không phải public path, hiển thị loading (sẽ redirect)
    if (!isAuthenticated && !token && !isPublicPath) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

    return <>{children}</>;
};

export default AuthWrapper;
