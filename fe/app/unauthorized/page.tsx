import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Unauthorized',
};

const UnauthorizedPage = () => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-dark">
            <div className="text-center">
                <div className="mb-8">
                    <div className="mx-auto h-32 w-32 rounded-full bg-red-100 flex items-center justify-center">
                        <svg className="h-16 w-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                </div>
                
                <h1 className="mb-4 text-4xl font-bold text-gray-800 dark:text-white">403</h1>
                <h2 className="mb-4 text-2xl font-semibold text-gray-700 dark:text-gray-300">Không có quyền truy cập</h2>
                <p className="mb-8 text-gray-600 dark:text-gray-400">
                    Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên nếu bạn cần quyền truy cập.
                </p>
                
                <div className="space-x-4">
                    <Link 
                        href="/" 
                        className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
                    >
                        Về trang chủ
                    </Link>
                    <Link 
                        href="/auth/cover-login" 
                        className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                    >
                        Đăng nhập khác
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default UnauthorizedPage; 