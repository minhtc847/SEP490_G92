'use client';

import React, { useState } from 'react';
import AsyncSelect from 'react-select/async';
import { useRouter } from 'next/navigation';

interface Customer {
    id: number;
    customerCode: string;
    customerName: string;
}

interface Message {
    sender: 'user' | 'customer';
    content: string;
    timestamp: string;
}

const mockCustomers: Customer[] = [
    { id: 1, customerCode: 'KH001', customerName: 'Nguyễn Văn A' },
    { id: 2, customerCode: 'KH002', customerName: 'Trần Thị B' },
    { id: 3, customerCode: 'KH003', customerName: 'Lê Văn C' },
];

const mockMessages: Record<number, Message[]> = {
    1: [
        { sender: 'customer', content: 'Chào bạn!', timestamp: '2024-06-01T09:00:00' },
        { sender: 'user', content: 'Chào anh A, tôi có thể giúp gì ạ?', timestamp: '2024-06-01T09:01:00' },
        { sender: 'customer', content: 'Tôi cần báo giá kính cường lực 10mm.', timestamp: '2024-06-01T09:03:00' },
        { sender: 'user', content: 'Dạ, em sẽ gửi bảng báo giá chi tiết ngay sau đây.', timestamp: '2024-06-01T09:04:00' },
        { sender: 'user', content: 'Giá kính cường lực 10mm là 600.000đ/m2, chưa bao gồm thi công.', timestamp: '2024-06-01T09:05:00' },
        { sender: 'customer', content: 'Có ưu đãi gì không nếu tôi lấy 50m2?', timestamp: '2024-06-01T09:06:30' },
        { sender: 'user', content: 'Nếu lấy số lượng lớn, bên em có thể giảm còn 550.000đ/m2.', timestamp: '2024-06-01T09:08:00' },
        { sender: 'customer', content: 'Ok, vậy đặt giúp tôi 50m2 nhé.', timestamp: '2024-06-01T09:10:00' },
        { sender: 'user', content: 'Dạ vâng, anh cho em xin địa chỉ giao hàng ạ.', timestamp: '2024-06-01T09:11:30' },
        { sender: 'customer', content: '123 Lê Lợi, Q.1, TP.HCM', timestamp: '2024-06-01T09:12:00' },
    ],
    2: [
        { sender: 'customer', content: 'Chào shop, tôi muốn hỏi đơn hàng hôm trước.', timestamp: '2024-06-02T10:00:00' },
        { sender: 'user', content: 'Dạ chào chị B, chị đang hỏi đơn hàng mã số nào ạ?', timestamp: '2024-06-02T10:01:30' },
        { sender: 'customer', content: 'Mã đơn là SO-2345.', timestamp: '2024-06-02T10:02:00' },
        { sender: 'user', content: 'Dạ đơn hàng đó đang trong quá trình đóng gói, dự kiến giao trong hôm nay ạ.', timestamp: '2024-06-02T10:03:00' },
        { sender: 'customer', content: 'Tốt quá. Kính đó là loại gì nhỉ?', timestamp: '2024-06-02T10:04:00' },
        { sender: 'user', content: 'Kính cường lực 8mm, trong suốt, đã cắt theo kích thước yêu cầu.', timestamp: '2024-06-02T10:05:00' },
        { sender: 'customer', content: 'Cảm ơn em. Khi nào nhận được sẽ kiểm tra và phản hồi.', timestamp: '2024-06-02T10:06:00' },
        { sender: 'user', content: 'Dạ chị nhận hàng nếu có vấn đề gì cứ nhắn em nhé.', timestamp: '2024-06-02T10:07:00' },
        { sender: 'customer', content: 'Ok em.', timestamp: '2024-06-02T10:08:00' },
        { sender: 'user', content: 'Chúc chị một ngày tốt lành ạ.', timestamp: '2024-06-02T10:09:00' },
    ],
    3: [
        { sender: 'customer', content: 'Bên bạn có làm kính màu không?', timestamp: '2024-06-03T11:00:00' },
        { sender: 'user', content: 'Dạ có anh C, bên em có kính màu trà, xanh lá, xanh biển và đen.', timestamp: '2024-06-03T11:01:00' },
        { sender: 'customer', content: 'Tôi cần loại kính màu đen, dày 5mm.', timestamp: '2024-06-03T11:02:30' },
        { sender: 'user', content: 'Loại đó giá 650.000đ/m2 anh nhé.', timestamp: '2024-06-03T11:03:00' },
        { sender: 'customer', content: 'Cho tôi ước tính tổng chi phí nếu dùng 30m2.', timestamp: '2024-06-03T11:04:00' },
        { sender: 'user', content: 'Tổng chi phí là khoảng 19.500.000đ, chưa tính vận chuyển.', timestamp: '2024-06-03T11:05:00' },
        { sender: 'customer', content: 'Chi phí vận chuyển là bao nhiêu?', timestamp: '2024-06-03T11:06:00' },
        { sender: 'user', content: 'Nội thành HCM thì bên em hỗ trợ miễn phí vận chuyển.', timestamp: '2024-06-03T11:07:00' },
        { sender: 'customer', content: 'Tốt quá, vậy đặt hàng giúp tôi nhé.', timestamp: '2024-06-03T11:08:00' },
        { sender: 'user', content: 'Dạ vâng, em sẽ gửi xác nhận đơn hàng ngay sau đây.', timestamp: '2024-06-03T11:09:00' },
    ],
};

const loadCustomerOptions = async (inputValue: string) => {
    return mockCustomers
        .filter((c) =>
            c.customerName.toLowerCase().includes(inputValue.toLowerCase()) ||
            c.customerCode.toLowerCase().includes(inputValue.toLowerCase())
        )
        .map((c) => ({
            label: `${c.customerCode} - ${c.customerName}`,
            value: c.id,
            customer: c,
        }));
};

const MessagePage = () => {
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const router = useRouter();

    const handleSelectCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setMessages(mockMessages[customer.id] || []);
    };

    const handleViewOrderDetails = () => {
        if (!selectedCustomer) return;
        router.push(`/message/order-details/${selectedCustomer.id}`);
    };

    return (
        <div className="flex h-screen p-5 gap-5">
            {/* Sidebar */}
            <div className="w-1/3 space-y-6">
                <h2 className="text-lg font-bold">Khách hàng</h2>

                <AsyncSelect
                    cacheOptions
                    defaultOptions
                    loadOptions={loadCustomerOptions}
                    placeholder="Tìm kiếm khách hàng..."
                    onChange={(option: any) => handleSelectCustomer(option.customer)}
                />

                <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">Khách hàng gần đây</p>
                    {mockCustomers.map((c) => (
                        <div
                            key={c.id}
                            onClick={() => handleSelectCustomer(c)}
                            className={`cursor-pointer p-3 rounded-lg border text-sm transition hover:shadow-sm ${
                                selectedCustomer?.id === c.id ? 'bg-primary text-white' : 'bg-white text-gray-800'
                            }`}
                        >
                            {c.customerCode} - {c.customerName}
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Box */}
            <div className="w-2/3">
                {selectedCustomer ? (
                    <div className="h-full flex flex-col border rounded-lg shadow bg-white p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-primary">
                                Tin nhắn với {selectedCustomer.customerName}
                            </h2>
                            <button
                                onClick={handleViewOrderDetails}
                                className="btn btn-sm btn-outline-primary"
                            >
                                Chi tiết đơn hàng
                            </button>
                        </div>

                        <div className="flex-1 space-y-3 overflow-y-auto pr-2">
                            {messages.length === 0 ? (
                                <p className="text-gray-500 italic">Chưa có tin nhắn nào...</p>
                            ) : (
                                messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${
                                            msg.sender === 'user' ? 'justify-end' : 'justify-start'
                                        }`}
                                    >
                                        <div
                                            className={`max-w-[70%] p-3 rounded-xl font-medium text-sm shadow-[0_0_4px_2px_rgb(31_45_61_/_10%)] transition-all duration-300
                                                ${
                                                    msg.sender === 'user'
                                                        ? 'bg-primary text-white rounded-tr-none'
                                                        : 'bg-gray-100 text-gray-700 dark:bg-[#1b2e4b] dark:text-white rounded-tl-none'
                                                }`}
                                        >
                                            <div>{msg.content}</div>
                                            <div className="text-[10px] mt-1 text-right opacity-60">
                                                {new Date(msg.timestamp).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full border rounded-lg bg-white shadow">
                        <p className="text-gray-500 text-sm">Vui lòng chọn khách hàng để tiếp tục.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagePage;
