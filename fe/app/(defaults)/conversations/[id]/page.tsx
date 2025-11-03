'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import conversationService, { ConversationState } from '../../../../services/conversationService';

export default function ConversationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const conversationId = parseInt(params.id as string);

    const [conversation, setConversation] = useState<ConversationState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (conversationId && !isNaN(conversationId)) {
            loadConversationDetail();
        }
    }, [conversationId]);

         const loadConversationDetail = async () => {
         try {
             setLoading(true);
             setError(null);
             const data = await conversationService.getConversationDetail(conversationId);
             setConversation(data);
         } catch (err) {
             console.error('Error loading conversation detail:', err);
             setError('Không thể tải thông tin cuộc hội thoại');
         } finally {
             setLoading(false);
         }
     };

         const formatCurrency = (amount: number | null | undefined) => {
         if (amount === null || amount === undefined || isNaN(amount)) {
             return '0 ₫';
         }
         return new Intl.NumberFormat('vi-VN', {
             style: 'currency',
             currency: 'VND'
         }).format(amount);
     };

         const formatDimensions = (height: number, width: number, thickness: number) => {
         return `${height} x ${width} x ${thickness} mm`;
     };

     const calculateTotalPrice = (orderItems: any[]) => {
         return orderItems.reduce((sum, item) => {
             const price = item.total_price;
             if (price === null || price === undefined || isNaN(price)) {
                 return sum;
             }
             return sum + Number(price);
         }, 0);
     };

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Đang tải thông tin cuộc hội thoại...</p>
                </div>
            </div>
        );
    }

    if (error || !conversation) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Lỗi</h3>
                    <p className="mt-1 text-sm text-gray-500">{error || 'Không tìm thấy cuộc hội thoại'}</p>
                    <div className="mt-6">
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                            Quay lại
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-900 mb-2"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Quay lại danh sách
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">Chi tiết cuộc hội thoại</h1>
                        <p className="text-gray-600">ID: {conversation.zaloUserId}</p>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={loadConversationDetail}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Làm mới
                        </button>
                        <a
                            href={conversationService.generateZaloChatLink(conversation.zaloUserId, conversation.zaloOaId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center"
                        >
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                            Mở Zalo Chat
                        </a>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Conversation Info */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Thông tin cuộc hội thoại</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tên người dùng</label>
                                    <p className="mt-1 text-sm text-gray-900">{conversation.userName || 'Không có tên'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                                    <p className="mt-1 text-sm text-gray-900">{conversation.customerPhone || 'Chưa cung cấp'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
                                    <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${conversationService.getStateColor(conversation.currentState)}`}>
                                        {conversationService.formatState(conversation.currentState)}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Trạng thái hoạt động</label>
                                    <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${conversation.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {conversation.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Số tin nhắn</label>
                                    <p className="mt-1 text-sm text-gray-900">{conversation.messageCount}</p>
                                </div>
                                {/* <div>
                                    <label className="block text-sm font-medium text-gray-700">Số lần thử lại</label>
                                    <p className="mt-1 text-sm text-gray-900">{conversation.retryCount}</p>
                                </div> */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Ngày tạo</label>
                                    <p className="mt-1 text-sm text-gray-900">{conversationService.formatDate(conversation.createdAt)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Hoạt động cuối</label>
                                    <p className="mt-1 text-sm text-gray-900">{conversationService.formatDate(conversation.lastActivity)}</p>
                                </div>
                            </div>

                            {conversation.lastError && (
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700">Lỗi cuối cùng</label>
                                    <p className="mt-1 text-sm text-red-600 bg-red-50 p-2 rounded">{conversation.lastError}</p>
                                </div>
                            )}

                            {/* Zalo Chat Section */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Liên hệ trực tiếp</h4>
                                        <p className="text-sm text-gray-500">Mở cuộc hội thoại Zalo với khách hàng này</p>
                                    </div>
                                    <a
                                        href={conversationService.generateZaloChatLink(conversation.zaloUserId, conversation.zaloOaId)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                        </svg>
                                        Mở Zalo Chat
                                    </a>
                                </div>
                                <div className="mt-2 text-xs text-gray-500">
                                    Link: {conversationService.generateZaloChatLink(conversation.zaloUserId, conversation.zaloOaId)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Message History */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Lịch sử tin nhắn</h3>
                        </div>
                        <div className="p-6">
                            {conversation.messageHistory.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">Chưa có tin nhắn nào</p>
                            ) : (
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {conversation.messageHistory.map((message, index) => (
                                        <div
                                            key={`message-${index}-${message.timestamp}`}
                                            className={`flex ${message.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.senderType === 'user'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-200 text-gray-900'
                                                    }`}
                                            >
                                                <div className="text-sm">{message.content}</div>
                                                <div className={`text-xs mt-1 ${message.senderType === 'user' ? 'text-blue-100' : 'text-gray-500'
                                                    }`}>
                                                    {conversationService.formatDate(message.timestamp)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    

                     {/* Order Items */}
                     {conversation.orderItems.length > 0 && (
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Sản phẩm đặt hàng</h3>
                            </div>
                            <div className="p-6">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Mã sản phẩm
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Loại
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Kích thước
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Số lượng
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Đơn giá
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Thành tiền
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                                                                         {conversation.orderItems.map((item, index) => (
                                                 <tr key={`order-item-${index}-${item.item_code}`}>
                                                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                         {item.item_code}
                                                     </td>
                                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                         {item.item_type}
                                                     </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDimensions(item.width, item.height, item.thickness)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {item.quantity}
                                                    </td>
                                                                                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                         {formatCurrency(item.unit_price)}
                                                     </td>
                                                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                         {formatCurrency(item.total_price)}
                                                     </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                                                 <div className="mt-4 text-right">
                                     <div className="text-lg font-semibold text-gray-900">
                                         Tổng cộng: {formatCurrency(calculateTotalPrice(conversation.orderItems))}
                                     </div>
                                 </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Stats */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Thống kê nhanh</h3>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Số loại sản phẩm</p>
                                    <p className="text-2xl font-semibold text-gray-900">{conversation.orderItems.length}</p>
                                </div>
                                                                 <div>
                                   <p className="text-sm font-medium text-gray-600">Tổng giá trị</p>
                                   <p className="text-2xl font-semibold text-gray-900">
                                     {formatCurrency(calculateTotalPrice(conversation.orderItems))}
                                   </p>
                                 </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Thời gian hoạt động</p>
                                    <p className="text-sm text-gray-900">
                                        {Math.floor((new Date(conversation.lastActivity).getTime() - new Date(conversation.createdAt).getTime()) / (1000 * 60 * 60 * 24))} ngày
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Last Messages */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Tin nhắn gần đây</h3>
                        </div>
                        <div className="p-6">
                            {conversation.lastUserMessage && (
                                <div className="mb-4">
                                    <p className="text-sm font-medium text-gray-700 mb-1">Khách hàng:</p>
                                    <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{conversation.lastUserMessage}</p>
                                </div>
                            )}
                            {conversation.lastBotResponse && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-1">Bot:</p>
                                    <p className="text-sm text-gray-900 bg-blue-50 p-2 rounded">{conversation.lastBotResponse}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Customer Info */}
                    {conversation.customerId && (
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Thông tin khách hàng</h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">ID khách hàng</p>
                                        <p className="text-sm text-gray-900">{conversation.customerId}</p>
                                    </div>
                                    {conversation.customerPhone && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Số điện thoại</p>
                                            <p className="text-sm text-gray-900">{conversation.customerPhone}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
