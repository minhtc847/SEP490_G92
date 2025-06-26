'use client';

import React, { useState, useEffect } from 'react';
import AsyncSelect from 'react-select/async';
import { 
    getMessagesByUserId, 
    loadCustomerOptions, 
    getCustomersWithZaloId,
    forwardMessages,
    type Customer, 
    type Message, 
    type MessageResponse
} from './services';

const MessagePage = () => {
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [recentCustomers, setRecentCustomers] = useState<Customer[]>([]);
    const [loadingCustomers, setLoadingCustomers] = useState<boolean>(true);
    const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
    const [isForwarding, setIsForwarding] = useState(false);

    /**
     * Load tất cả customers khi component mount
     */
    useEffect(() => {
        const loadAllCustomers = async () => {
            try {
                setLoadingCustomers(true);
                setError(null);
                
                const customers = await getCustomersWithZaloId();
                setAllCustomers(customers);
                
                // Cũng set recent customers (5 đầu tiên)
                const recent = customers.slice(0, 5);
                setRecentCustomers(recent);
            } catch (err) {
                console.error('Error loading customers:', err);
                setError('Không thể tải danh sách khách hàng');
            } finally {
                setLoadingCustomers(false);
            }
        };

        loadAllCustomers();
    }, []);

    /**
     * Load messages khi customer được chọn
     */
    const handleSelectCustomer = async (customer: Customer) => {
        setSelectedCustomer(customer);
        setLoading(true);
        setError(null);
        
        try {
            // Sử dụng zaloId thay vì id để gọi API messages
            const userId = customer.zaloId || customer.id.toString();
            const fetchedMessages = await getMessagesByUserId(userId);
            setMessages(fetchedMessages);
        } catch (err) {
            console.error('Error loading messages:', err);
            setError('Không thể tải tin nhắn. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Format timestamp thành readable format
     */
    const formatTimestamp = (timestamp: string): string => {
        try {
            const date = new Date(timestamp);
            return date.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return 'Invalid time';
        }
    };

    /**
     * Render message content dựa vào message type
     */
    const renderMessageContent = (message: Message) => {
        switch (message.messageType) {
            case 'text':
                return <div>{message.content}</div>;
            case 'image':
                return (
                    <div>
                        <img 
                            src={message.content} 
                            alt="Message image" 
                            className="max-w-full rounded-lg"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </div>
                );
            case 'file':
                return (
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                        <span>File đính kèm</span>
                    </div>
                );
            default:
                return <div>{message.content}</div>;
        }
    };

    /**
     * Render customer info với tag
     */
    const renderCustomerInfo = (customer: Customer) => {
        return (
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <span className="font-medium">{customer.customerCode} - {customer.customerName}</span>
                    {customer.tagName && (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                            customer.tagName === 'VIP' ? 'bg-yellow-100 text-yellow-800' :
                            customer.tagName === 'Premium' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                            {customer.tagName}
                        </span>
                    )}
                </div>
                {customer.zaloName && (
                    <span className="text-xs text-gray-500">Zalo: {customer.zaloName}</span>
                )}
            </div>
        );
    };

    /**
     * Chuyển đổi Message -> MessageResponse
     */
    const convertToMessageResponse = (msg: Message): MessageResponse => ({
        sender_id: msg.senderId,
        sender_type: msg.sender,
        message_type: msg.messageType,
        content: msg.content,
        send_time: msg.timestamp,
    });

    /**
     * Gửi toàn bộ messages hiện tại lên API
     */
    const handleForwardMessages = async () => {
        if (!messages.length || isForwarding) return;
        setIsForwarding(true);
        try {
            const messagesToSend: MessageResponse[] = messages.map(convertToMessageResponse);
            await forwardMessages(messagesToSend);
            alert('Forward messages thành công!');
        } catch (err) {
            alert('Forward messages thất bại!');
        } finally {
            setIsForwarding(false);
        }
    };

    return (
        <div className="flex h-screen p-5 gap-5">
            {/* Sidebar - Customer List */}
            <div className="w-1/3 space-y-6">
                <h2 className="text-lg font-bold">Khách hàng</h2>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-700">Chọn khách hàng</h3>
                        <span className="text-xs text-gray-500">({allCustomers.length} khách hàng)</span>
                    </div>
                    
                    <AsyncSelect 
                        cacheOptions 
                        defaultOptions 
                        loadOptions={loadCustomerOptions} 
                        placeholder="Chọn hoặc tìm kiếm khách hàng..." 
                        onChange={(option: any) => handleSelectCustomer(option.customer)} 
                        noOptionsMessage={() => "Không tìm thấy khách hàng"}
                        loadingMessage={() => "Đang tải danh sách khách hàng..."}
                        isClearable={true}
                        isSearchable={true}
                        className="text-sm"
                        classNamePrefix="select"
                        menuPlacement="auto"
                        maxMenuHeight={300}
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-700">Khách hàng gần đây</p>
                        <span className="text-xs text-gray-500">({recentCustomers.length} khách hàng)</span>
                    </div>
                    
                    {loadingCustomers ? (
                        <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            <span className="ml-2 text-sm text-gray-600">Đang tải...</span>
                        </div>
                    ) : recentCustomers.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-sm text-gray-500">Chưa có khách hàng nào</p>
                        </div>
                    ) : (
                        recentCustomers.map((c) => (
                            <div
                                key={c.id}
                                onClick={() => handleSelectCustomer(c)}
                                className={`cursor-pointer p-3 rounded-lg border text-sm transition hover:shadow-sm ${
                                    selectedCustomer?.id === c.id 
                                        ? 'bg-primary text-white' 
                                        : 'bg-white text-gray-800'
                                }`}
                            >
                                {renderCustomerInfo(c)}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Content - Messages */}
            <div className="w-2/3">
                {selectedCustomer ? (
                    <div className="h-full flex flex-col border rounded-lg shadow bg-white p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-primary">
                                Tin nhắn với {selectedCustomer.customerName}
                            </h2>
                            <div className="text-sm text-gray-500">
                                {selectedCustomer.zaloName && `Zalo: ${selectedCustomer.zaloName}`}
                            </div>
                        </div>

                        <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                            <button
                                onClick={handleForwardMessages}
                                className={`mb-4 px-4 py-2 rounded transition text-white ${isForwarding ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
                                disabled={messages.length === 0 || isForwarding}
                            >
                                {isForwarding ? 'Đang gửi...' : 'Forward Messages'}
                            </button>
                            {loading ? (
                                <div className="flex items-center justify-center h-32">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    <span className="ml-2 text-gray-600">Đang tải tin nhắn...</span>
                                </div>
                            ) : error ? (
                                <div className="flex items-center justify-center h-32">
                                    <div className="text-center">
                                        <p className="text-red-500 mb-2">{error}</p>
                                        <button 
                                            onClick={() => selectedCustomer && handleSelectCustomer(selectedCustomer)}
                                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
                                        >
                                            Thử lại
                                        </button>
                                    </div>
                                </div>
                            ) : messages.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">
                                    Chưa có tin nhắn nào với khách hàng này.
                                </p>
                            ) : (
                                messages.map((msg, index) => (
                                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
                                        <div
                                            className={`max-w-[70%] p-3 rounded-xl font-medium text-sm shadow-[0_0_4px_2px_rgb(31_45_61_/_10%)] transition-all duration-300
                                                ${msg.sender === 'user' 
                                                    ? 'bg-gray-100 text-gray-700 dark:bg-[#1b2e4b] dark:text-white rounded-tl-none' 
                                                    : 'bg-primary text-white rounded-tr-none'
                                                }`}
                                        >
                                            {renderMessageContent(msg)}
                                            <div className="text-[10px] mt-1 text-right opacity-60">
                                                {formatTimestamp(msg.timestamp)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full border rounded-lg bg-white shadow">
                        <p className="text-gray-500 text-sm">
                            Vui lòng chọn khách hàng để bắt đầu trò chuyện.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagePage;