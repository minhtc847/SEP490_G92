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
                        Content = ZaloWebhookConstants.DefaultMessages.GREETING,
                        MessageType = "text",
                        Intent = MessageIntents.UNKNOWN
                    };

                case UserStates.ORDERING:
                    return new MessageResponse
                    {
                        Content = "Bạn đang trong quá trình đặt hàng. Vui lòng cung cấp thông tin sản phẩm hoặc gõ \"Nhân viên\" để được hỗ trợ.",
                        MessageType = "text",
                        Intent = MessageIntents.PLACE_ORDER
                    };

                case UserStates.CONFIRMING:
                    return new MessageResponse
                    {
                        Content = "Đơn hàng của bạn đã được xác nhận! Chúng tôi sẽ liên hệ sớm nhất.",
                        MessageType = "text",
                        Intent = MessageIntents.CHECK_ORDER,
                        ShouldEndConversation = true
                    };

                case UserStates.CANCELLED:
                    return new MessageResponse
                    {
                        Content = "Đơn hàng đã được hủy. Cảm ơn bạn đã quan tâm!",
                        MessageType = "text",
                        Intent = MessageIntents.UNKNOWN,
                        ShouldEndConversation = true
                    };

                case UserStates.COMPLETED:
                    return new MessageResponse
                    {
                        Content = "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Bạn có muốn đặt hàng thêm không?",
                        MessageType = "text",
                        Intent = MessageIntents.UNKNOWN
                    };

                default:
                    return new MessageResponse
                    {
                        Content = ZaloWebhookConstants.DefaultMessages.ERROR_MESSAGE,
                        MessageType = "text",
                        Intent = MessageIntents.UNKNOWN
                    };
            }
        }

        public async Task<MessageResponse> GetGreetingResponseAsync()
        {
            return new MessageResponse
            {
                Content = ZaloWebhookConstants.DefaultMessages.GREETING,
                MessageType = "text",
                Intent = MessageIntents.UNKNOWN
            };
        }

        public async Task<MessageResponse> GetProductListResponseAsync()
        {
            return new MessageResponse
            {
                Content = "🏢 VNG Glass - Chuyên cung cấp các loại kính chất lượng cao:\n\n" +
                         "🔹 KÍNH CƯỜNG LỰC\n" +
                         "• Chống va đập, an toàn cao\n" +
                         "• Phù hợp: Cửa, vách ngăn, lan can\n" +
                         "• Độ dày: 8mm, 10mm, 12mm\n\n" +
                         "🔹 KÍNH AN TOÀN\n" +
                         "• Chống vỡ, bảo vệ tối ưu\n" +
                         "• Phù hợp: Mái che, cửa sổ cao\n" +
                         "• Độ dày: 6mm, 8mm, 10mm\n\n" +
                         "🔹 KÍNH PHẢN QUANG\n" +
                         "• Chống nắng, tiết kiệm năng lượng\n" +
                         "• Phù hợp: Văn phòng, nhà ở\n" +
                         "• Màu sắc: Xanh, xám, đồng\n\n" +
                         "🔹 KÍNH CÁCH ÂM\n" +
                         "• Giảm tiếng ồn hiệu quả\n" +
                         "• Phù hợp: Phòng họp, studio\n" +
                         "• Độ dày: 10mm, 12mm, 15mm\n\n" +
                         "💡 Gõ \"Đặt hàng\" để bắt đầu đặt hàng ngay!",
                MessageType = "text",
                Intent = MessageIntents.PRODUCT_INFO
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
                Intent = MessageIntents.PRODUCT_INFO,
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
                Intent = MessageIntents.CHECK_ORDER,
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
                Intent = MessageIntents.UNKNOWN,
                ShouldEndConversation = true
            };
        }

        public async Task<MessageResponse> GetContactInfoResponseAsync()
        {
            return new MessageResponse
            {
                Content = "👨‍💼 Liên hệ với chúng tôi:\n\n" +
                         "🏢 VNG Glass Company\n" +
                         "📍 Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM\n" +
                         "📞 Hotline: 1900-xxxx\n" +
                         "📧 Email: info@vngglass.com\n" +
                         "🌐 Website: www.vngglass.com\n" +
                         "⏰ Giờ làm việc: 8:00 - 18:00 (Thứ 2 - Thứ 7)\n\n" +
                         "Chúng tôi luôn sẵn sàng phục vụ bạn!",
                MessageType = "text",
                Intent = MessageIntents.CONTACT_STAFF
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
                         "📝 Để đặt hàng: Gõ \"Đặt hàng\"\n" +
                         "📋 Xem trạng thái đơn hàng: Gõ \"Đơn hàng\"\n" +
                         "🏢 Thông tin sản phẩm: Gõ \"Sản phẩm\"\n" +
                         "👨‍💼 Liên hệ nhân viên: Gõ \"Nhân viên\"\n\n" +
                         "⚠️ Lưu ý: Vui lòng gõ chính xác các lệnh trên để được hỗ trợ tốt nhất!",
                MessageType = "text",
                Intent = MessageIntents.UNKNOWN
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


