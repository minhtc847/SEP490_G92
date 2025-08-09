using Microsoft.Extensions.Logging;
using SEP490.Modules.ZaloOrderModule.Constants;
using SEP490.Modules.ZaloOrderModule.DTO;

namespace SEP490.Modules.ZaloOrderModule.Services
{
    public class ZaloResponseService
    {
        private readonly ILogger<ZaloResponseService> _logger;

        public ZaloResponseService(ILogger<ZaloResponseService> logger)
        {
            _logger = logger;
        }

        public async Task<MessageResponse> GetDefaultResponseAsync(string currentState)
        {
            switch (currentState)
            {
                case UserStates.INQUIRY:
                    return new MessageResponse
                    {
                        Content = "Xin chào! Chào mừng bạn đến với VNG Glass. Bạn có thể gõ 'đặt hàng' để bắt đầu quá trình đặt hàng.",
                        MessageType = "text",
                        Intent = MessageIntents.GREETING,
                        Suggestions = new List<string> { "Đặt hàng", "Xem sản phẩm", "Hỏi giá" }
                    };

                case UserStates.ORDERING:
                    return new MessageResponse
                    {
                        Content = "Bạn đang trong quá trình đặt hàng. Vui lòng cung cấp thông tin sản phẩm hoặc gõ 'kết thúc' để xác nhận.",
                        MessageType = "text",
                        Intent = MessageIntents.PLACE_ORDER,
                        Suggestions = new List<string> { "Kính cường lực", "Kính an toàn", "Kính phản quang", "Kết thúc" }
                    };

                case UserStates.CONFIRMING:
                    return new MessageResponse
                    {
                        Content = "Đơn hàng của bạn đã được xác nhận! Chúng tôi sẽ liên hệ sớm nhất.",
                        MessageType = "text",
                        Intent = MessageIntents.CONFIRM_ORDER,
                        ShouldEndConversation = true
                    };

                case UserStates.CANCELLED:
                    return new MessageResponse
                    {
                        Content = "Đơn hàng đã được hủy. Cảm ơn bạn đã quan tâm!",
                        MessageType = "text",
                        Intent = MessageIntents.CANCEL_ORDER,
                        ShouldEndConversation = true
                    };

                case UserStates.COMPLETED:
                    return new MessageResponse
                    {
                        Content = "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Bạn có muốn đặt hàng thêm không?",
                        MessageType = "text",
                        Intent = MessageIntents.GREETING,
                        Suggestions = new List<string> { "Đặt hàng", "Tạm biệt" }
                    };

                default:
                    return new MessageResponse
                    {
                        Content = "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.",
                        MessageType = "text",
                        Intent = MessageIntents.UNKNOWN
                    };
            }
        }

        public async Task<MessageResponse> GetGreetingResponseAsync()
        {
            return new MessageResponse
            {
                Content = "Xin chào! Chào mừng bạn đến với VNG Glass. Chúng tôi chuyên cung cấp các loại kính chất lượng cao. Bạn có thể gõ 'đặt hàng' để bắt đầu quá trình đặt hàng.",
                MessageType = "text",
                Intent = MessageIntents.GREETING,
                Suggestions = new List<string> { "Đặt hàng", "Xem sản phẩm", "Hỏi giá", "Liên hệ" }
            };
        }

        public async Task<MessageResponse> GetProductListResponseAsync()
        {
            return new MessageResponse
            {
                Content = "Chúng tôi có các loại kính sau:\n\n" +
                         "🔹 Kính cường lực - Chống va đập, an toàn cao\n" +
                         "🔹 Kính an toàn - Chống vỡ, bảo vệ tối ưu\n" +
                         "🔹 Kính phản quang - Chống nắng, tiết kiệm năng lượng\n" +
                         "🔹 Kính cách âm - Giảm tiếng ồn hiệu quả\n\n" +
                         "Bạn quan tâm loại nào?",
                MessageType = "text",
                Intent = MessageIntents.INQUIRE_PRODUCT,
                Suggestions = new List<string> { "Kính cường lực", "Kính an toàn", "Kính phản quang", "Kính cách âm", "Đặt hàng" }
            };
        }

        public async Task<MessageResponse> GetPriceInquiryResponseAsync()
        {
            return new MessageResponse
            {
                Content = "Giá cả phụ thuộc vào:\n\n" +
                         "📏 Kích thước kính\n" +
                         "🏷️ Loại kính\n" +
                         "🎨 Màu sắc và hoa văn\n" +
                         "📍 Địa điểm lắp đặt\n\n" +
                         "Vui lòng cho biết bạn cần loại kính nào và kích thước để chúng tôi báo giá chính xác.",
                MessageType = "text",
                Intent = MessageIntents.INQUIRE_PRICE,
                Suggestions = new List<string> { "Kính cường lực", "Kính an toàn", "Kính phản quang", "Tư vấn" }
            };
        }

        public async Task<MessageResponse> GetOrderConfirmationResponseAsync()
        {
            return new MessageResponse
            {
                Content = "🎉 Đơn hàng của bạn đã được xác nhận thành công!\n\n" +
                         "📞 Chúng tôi sẽ liên hệ với bạn trong vòng 24 giờ để xác nhận chi tiết.\n" +
                         "📋 Đơn hàng sẽ được xử lý trong 3-5 ngày làm việc.\n" +
                         "🚚 Giao hàng miễn phí trong phạm vi 50km.\n\n" +
                         "Cảm ơn bạn đã tin tưởng VNG Glass!",
                MessageType = "text",
                Intent = MessageIntents.CONFIRM_ORDER,
                ShouldEndConversation = true
            };
        }

        public async Task<MessageResponse> GetOrderCancellationResponseAsync()
        {
            return new MessageResponse
            {
                Content = "Đơn hàng đã được hủy thành công.\n\n" +
                         "Nếu bạn cần hỗ trợ hoặc có thắc mắc, vui lòng liên hệ:\n" +
                         "📞 Hotline: 1900-xxxx\n" +
                         "📧 Email: support@vngglass.com\n\n" +
                         "Cảm ơn bạn đã quan tâm đến sản phẩm của chúng tôi!",
                MessageType = "text",
                Intent = MessageIntents.CANCEL_ORDER,
                ShouldEndConversation = true
            };
        }

        public async Task<MessageResponse> GetContactInfoResponseAsync()
        {
            return new MessageResponse
            {
                Content = "📞 Liên hệ với chúng tôi:\n\n" +
                         "🏢 VNG Glass Company\n" +
                         "📍 Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM\n" +
                         "📞 Hotline: 1900-xxxx\n" +
                         "📧 Email: info@vngglass.com\n" +
                         "🌐 Website: www.vngglass.com\n" +
                         "⏰ Giờ làm việc: 8:00 - 18:00 (Thứ 2 - Thứ 7)\n\n" +
                         "Chúng tôi luôn sẵn sàng phục vụ bạn!",
                MessageType = "text",
                Intent = MessageIntents.INQUIRE_PRODUCT,
                Suggestions = new List<string> { "Đặt hàng", "Xem sản phẩm", "Hỏi giá" }
            };
        }

        public async Task<MessageResponse> GetErrorResponseAsync(string errorMessage = null)
        {
            return new MessageResponse
            {
                Content = errorMessage ?? "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.",
                MessageType = "text",
                Intent = MessageIntents.UNKNOWN,
                Suggestions = new List<string> { "Thử lại", "Liên hệ hỗ trợ", "Tạm biệt" }
            };
        }

        public async Task<MessageResponse> GetHelpResponseAsync()
        {
            return new MessageResponse
            {
                Content = "🔧 Hướng dẫn sử dụng:\n\n" +
                         "📝 Để đặt hàng: Gõ 'đặt hàng'\n" +
                         "📋 Xem sản phẩm: Gõ 'sản phẩm'\n" +
                         "💰 Hỏi giá: Gõ 'giá' hoặc 'bao nhiêu'\n" +
                         "📞 Liên hệ: Gõ 'liên hệ'\n" +
                         "❌ Hủy đơn hàng: Gõ 'hủy'\n" +
                         "✅ Xác nhận đơn hàng: Gõ 'kết thúc'\n" +
                         "👋 Tạm biệt: Gõ 'tạm biệt'\n\n" +
                         "Bạn cần hỗ trợ gì thêm không?",
                MessageType = "text",
                Intent = MessageIntents.GREETING,
                Suggestions = new List<string> { "Đặt hàng", "Xem sản phẩm", "Hỏi giá", "Liên hệ" }
            };
        }

        public async Task<MessageResponse> GetUnsupportedEventResponseAsync()
        {
            return new MessageResponse
            {
                Content = $"{ZaloWebhookConstants.DefaultMessages.UNSUPPORTED_EVENT}\n\n{ZaloWebhookConstants.DefaultMessages.CONTACT_SUPPORT}",
                MessageType = "text",
                Intent = MessageIntents.UNKNOWN,
                Suggestions = new List<string> { "Liên hệ hỗ trợ", "Tạm biệt" }
            };
        }
    }
}


