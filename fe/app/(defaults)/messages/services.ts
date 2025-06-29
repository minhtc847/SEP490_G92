import axios from "../../../setup/axios";

/**
 * Interface tương ứng với MessageResponse từ backend
 */
export interface MessageResponse {
    sender_id: string;
    sender_type: string;
    message_type: string;
    content: string;
    send_time: string;
}

/**
 * Interface cho message đã được transform để hiển thị trên UI
 */
export interface Message {
    sender: 'user' | 'business';
    content: string;
    timestamp: string;
    messageType: string;
    senderId: string;
}

/**
 * Interface cho customer tương ứng với backend model
 */
export interface Customer {
    id: number;
    customerCode: string;
    customerName: string;
    address: string;
    debt: number;
    taxCode: string;
    contactPerson: string;
    phone: string;
    discount: number;
    isSupplier: boolean;
    zaloId: string;
    zaloName: string;
    tagName: string;
}

/**
 * Interface cho customer option trong AsyncSelect
 */
export interface CustomerOption {
    label: string;
    value: number;
    customer: Customer;
}

/**
 * Lấy danh sách tin nhắn từ API theo userId
 * @param userId - ID của user để lấy tin nhắn
 * @returns Promise<Message[]> - Danh sách tin nhắn đã được transform
 */
export const getMessagesByUserId = async (userId: string): Promise<Message[]> => {
    try {
        const response = await axios.get<MessageResponse[]>(`/api/Zalo/get-message?userId=${userId}`);
        
        // Transform MessageResponse thành Message format cho UI
        const messages = response.data.map((msg: MessageResponse) => ({
            sender: (msg.sender_type === 'user' ? 'user' : 'business') as 'user' | 'business',
            content: msg.content || '',
            timestamp: msg.send_time,
            messageType: msg.message_type,
            senderId: msg.sender_id
        }));

        // Sắp xếp tin nhắn theo thời gian từ cũ nhất đến mới nhất
        return messages.sort((a, b) => {
            const timeA = new Date(a.timestamp).getTime();
            const timeB = new Date(b.timestamp).getTime();
            return timeA - timeB;
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        throw new Error('Failed to fetch messages');
    }
};

/**
 * Lấy danh sách khách hàng có Zalo ID từ API
 * @returns Promise<Customer[]> - Danh sách khách hàng
 */
export const getCustomersWithZaloId = async (): Promise<Customer[]> => {
    try {
        const response = await axios.get<Customer[]>("/api/Customers/with-zalo-id");
        return response.data;
    } catch (error) {
        console.error('Error fetching customers with Zalo ID:', error);
        throw new Error('Failed to fetch customers');
    }
};

/**
 * Load customer options cho AsyncSelect từ API
 * @param inputValue - Giá trị tìm kiếm (có thể empty để load tất cả)
 * @returns Promise với danh sách customer options
 */
export const loadCustomerOptions = async (inputValue: string = ''): Promise<CustomerOption[]> => {
    try {
        const customers = await getCustomersWithZaloId();
        
        let filteredCustomers = customers;
        
        // Nếu có inputValue thì filter, nếu không thì trả về tất cả
        if (inputValue.trim()) {
            filteredCustomers = customers.filter((c) => 
                c.customerName?.toLowerCase().includes(inputValue.toLowerCase()) || 
                c.customerCode?.toLowerCase().includes(inputValue.toLowerCase()) ||
                c.zaloName?.toLowerCase().includes(inputValue.toLowerCase())
            );
        }
        
        return filteredCustomers.map((c) => ({
            label: `${c.customerCode} - ${c.customerName}${c.zaloName ? ` (${c.zaloName})` : ''}`,
            value: c.id,
            customer: c,
        }));
    } catch (error) {
        console.error('Error loading customer options:', error);
        // Fallback to mock data if API fails
        return getMockCustomerOptions(inputValue);
    }
};

/**
 * Mock data cho customers (fallback khi API không hoạt động)
 */
const mockCustomers: Customer[] = [
    { 
        id: 1, 
        customerCode: 'KH001', 
        customerName: 'Nguyễn Văn A',
        address: '123 Lê Lợi, Q.1, TP.HCM',
        debt: 0,
        taxCode: '0123456789',
        contactPerson: 'Nguyễn Văn A',
        phone: '0901234567',
        discount: 0,
        isSupplier: false,
        zaloId: 'zalo_001',
        zaloName: 'Nguyễn Văn A',
        tagName: 'VIP'
    },
    { 
        id: 2, 
        customerCode: 'KH002', 
        customerName: 'Trần Thị B',
        address: '456 Nguyễn Huệ, Q.1, TP.HCM',
        debt: 0,
        taxCode: '0987654321',
        contactPerson: 'Trần Thị B',
        phone: '0909876543',
        discount: 5,
        isSupplier: false,
        zaloId: 'zalo_002',
        zaloName: 'Trần Thị B',
        tagName: 'Regular'
    },
    { 
        id: 3, 
        customerCode: 'KH003', 
        customerName: 'Lê Văn C',
        address: '789 Đồng Khởi, Q.1, TP.HCM',
        debt: 0,
        taxCode: '0555666777',
        contactPerson: 'Lê Văn C',
        phone: '0905556667',
        discount: 10,
        isSupplier: false,
        zaloId: 'zalo_003',
        zaloName: 'Lê Văn C',
        tagName: 'Premium'
    },
];

/**
 * Mock customer options (fallback function)
 * @param inputValue - Giá trị tìm kiếm
 * @returns Mock customer options
 */
const getMockCustomerOptions = (inputValue: string): CustomerOption[] => {
    const filtered = mockCustomers.filter((c) => 
        c.customerName?.toLowerCase().includes(inputValue.toLowerCase()) || 
        c.customerCode?.toLowerCase().includes(inputValue.toLowerCase()) ||
        c.zaloName?.toLowerCase().includes(inputValue.toLowerCase())
    );
    
    return filtered.map((c) => ({
        label: `${c.customerCode} - ${c.customerName}${c.zaloName ? ` (${c.zaloName})` : ''}`,
        value: c.id,
        customer: c,
    }));
};

/**
 * Lấy danh sách khách hàng gần đây
 * @returns Promise<Customer[]> - Danh sách khách hàng gần đây
 */
export const getRecentCustomers = async (): Promise<Customer[]> => {
    try {
        const customers = await getCustomersWithZaloId();
        // Lấy 5 khách hàng đầu tiên
        return customers.slice(0, 5);
    } catch (error) {
        console.error('Error loading recent customers:', error);
        // Fallback to mock data
        return mockCustomers.slice(0, 5);
    }
};

/**
 * Gửi danh sách messages đến API forward-message
 * @param messages - Danh sách messages kiểu MessageResponse[]
 * @returns Promise<any> - Kết quả trả về từ API
 */
export const forwardMessages = async (messages: MessageResponse[]): Promise<any> => {
    try {
        const response = await axios.post('/api/Zalo/forward-message', messages);
        return response.data;
    } catch (error) {
        console.error('Error forwarding messages:', error);
        throw new Error('Failed to forward messages');
    }
};
