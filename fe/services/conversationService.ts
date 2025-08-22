import axios from '../setup/axios';

export interface ConversationListItem {
  id: number;
  zaloUserId: string;
  userName?: string;
  customerPhone?: string;
  currentState: string;
  lastActivity: string;
  createdAt: string;
  isActive: boolean;
  messageCount: number;
  lastUserMessage?: string;
  lastBotResponse?: string;
  retryCount: number;
  lastError?: string;
  customerId?: number;
  customerName?: string;
  orderItemsCount: number;
}

export interface ConversationListResponse {
  conversations: ConversationListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ConversationState {
  id: number;
  zaloUserId: string;
  currentState: string;
  currentOrderId?: string;
  lastActivity: string;
  createdAt: string;
  isActive: boolean;
  messageCount: number;
  lastUserMessage?: string;
  lastBotResponse?: string;
  retryCount: number;
  lastError?: string;
  userName?: string;
  userAvatar?: string;
  customerPhone?: string;
  customerId?: number;
  customerName?: string;
  orderItems: OrderItem[];
  messageHistory: ConversationMessage[];
  lastLLMResponse?: any;
  zaloOaId?: string;
}

export interface ConversationMessage {
  content: string;
  senderType: string;
  messageType: string;
  timestamp: string;
}

export interface OrderItem {
  productCode: string;
  productType: string;
  height: number;
  width: number;
  thickness: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ConversationStatistics {
  totalConversations: number;
  activeConversations: number;
  todayConversations: number;
  stateStatistics: StateStatistic[];
}

export interface StateStatistic {
  state: string;
  count: number;
}

export interface ConversationFilters {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  state?: string;
  isActive?: boolean;
  fromDate?: string;
  toDate?: string;
}

class ConversationService {
  private baseUrl = '/api/ZaloConversation';

  async getConversations(filters: ConversationFilters = {}): Promise<ConversationListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await axios.get(`${this.baseUrl}?${params.toString()}`);
    return response.data;
  }

  async getConversationDetail(id: number): Promise<ConversationState> {
    const response = await axios.get(`${this.baseUrl}/detail/${id}`);
    return response.data;
  }

  async getConversationStatistics(): Promise<ConversationStatistics> {
    const response = await axios.get(`${this.baseUrl}/statistics`);
    return response.data;
  }

  async deleteConversation(id: number): Promise<void> {
    await axios.delete(`${this.baseUrl}/${id}`);
  }

  // Helper method to format state for display
  formatState(state: string): string {
    const stateMap: Record<string, string> = {
      'new': 'Mới',
      'ordering': 'Đang đặt hàng',
      'waiting_for_phone': 'Chờ số điện thoại',
      'waiting_for_product_info': 'Chờ thông tin sản phẩm',
      'confirming': 'Xác nhận',
      'completed': 'Hoàn thành',
      'cancelled': 'Đã hủy',
      'contacting_staff': 'Liên hệ nhân viên'
    };
    
    return stateMap[state] || state;
  }

  // Helper method to get state color
  getStateColor(state: string): string {
    const colorMap: Record<string, string> = {
      'new': 'bg-blue-100 text-blue-800',
      'ordering': 'bg-yellow-100 text-yellow-800',
      'waiting_for_phone': 'bg-orange-100 text-orange-800',
      'waiting_for_product_info': 'bg-purple-100 text-purple-800',
      'confirming': 'bg-indigo-100 text-indigo-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'contacting_staff': 'bg-pink-100 text-pink-800'
    };
    
    return colorMap[state] || 'bg-gray-100 text-gray-800';
  }

  // Helper method to format date
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Helper method to format relative time
  formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    
    return this.formatDate(dateString);
  }

  // Helper method to generate Zalo chat link
  generateZaloChatLink(zaloUserId: string, zaloOaId?: string): string {
    const oaId = zaloOaId || '4582552177953221290'; // Default OA ID
    return `https://oa.zalo.me/chat?uid=${zaloUserId}&oaid=${oaId}`;
  }
}

export default new ConversationService();
