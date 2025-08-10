namespace SEP490.Modules.ZaloOrderModule.Constants
{
    public static class ZaloWebhookConstants
    {
        // Event names
        public static class Events
        {
            public const string USER_SEND_TEXT = "user_send_text";
            public const string USER_SEND_IMAGE = "user_send_image";
            public const string USER_SEND_FILE = "user_send_file";
            public const string USER_SEND_STICKER = "user_send_sticker";
            public const string USER_SEND_LOCATION = "user_send_location";
            public const string USER_SEND_CONTACT = "user_send_contact";
            public const string USER_SEND_LINK = "user_send_link";
        }

        // Attachment types
        public static class AttachmentTypes
        {
            public const string TEXT = "text";
          
        }

        // Message types
        public static class MessageTypes
        {
            public const string TEXT = "text";
            
        }

        // Sender types
        public static class SenderTypes
        {
            public const string USER = "user";
            public const string BOT = "bot";
        }

        // Response status
        public static class ResponseStatus
        {
            public const string SUCCESS = "success";
            public const string ERROR = "error";
            public const string IGNORED = "ignored";
        }

        // API endpoints
        public static class ApiEndpoints
        {
            public const string SEND_MESSAGE = "https://graph.zalo.me/v2.0/me/message";
            public const string GET_USER_INFO = "https://graph.zalo.me/v2.0/me/info";
            public const string GET_ACCESS_TOKEN = "https://oauth.zaloapp.com/v4/access_token";
        }

        // Cache keys
        public static class CacheKeys
        {
            public const string CONVERSATION_PREFIX = "zalo:conversation:";
            public const string USER_INFO_PREFIX = "zalo:user:";
            public const string ACCESS_TOKEN = "zalo:access_token";
        }

        // Timeouts
        public static class Timeouts
        {
            public const int CONVERSATION_EXPIRY_HOURS = 24;
            public const int ACCESS_TOKEN_EXPIRY_HOURS = 24;
            public const int REQUEST_TIMEOUT_SECONDS = 30;
        }

        // Error codes
        public static class ErrorCodes
        {
            public const int INVALID_TOKEN = 100;
            public const int RATE_LIMIT_EXCEEDED = 101;
            public const int INVALID_RECIPIENT = 102;
            public const int MESSAGE_TOO_LONG = 103;
            public const int INVALID_ATTACHMENT = 104;
            public const int INTERNAL_ERROR = 500;
        }

        // Default messages
        public static class DefaultMessages
        {
            public const string GREETING = "Xin chào! Chào mừng bạn đến với VNG Glass.\n\nVui lòng chọn một trong các lệnh sau:\n1. Gõ \"Đặt hàng\" để bắt đầu đặt hàng\n2. Gõ \"Đơn hàng\" để xem trạng thái đơn hàng\n3. Gõ \"Nhân viên\" để gọi nhân viên hỗ trợ\n5. Gõ \"Hủy\" để bắt đầu lại";
            public const string UNKNOWN_INTENT = "Lệnh không đúng. Vui lòng thử lại.\n\nCác lệnh có sẵn:\n1. \"Đặt hàng\" - Bắt đầu đặt hàng\n2. \"Đơn hàng\" - Xem trạng thái đơn hàng\n3. \"Nhân viên\" - Gọi nhân viên hỗ trợ\n4. \"Hủy\" - Hủy đơn hàng hiện tại";
            public const string ERROR_MESSAGE = "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.";
            public const string ORDER_START = "Bạn đã bắt đầu quá trình đặt hàng.";
            public const string ORDER_CONFIRM = "Đơn hàng của bạn đã được xác nhận!";
            public const string ORDER_CANCEL = "Đơn hàng đã được hủy.";
            public const string UNSUPPORTED_EVENT = "Xin lỗi, tôi chỉ có thể xử lý tin nhắn văn bản. Vui lòng gửi tin nhắn bằng chữ hoặc liên hệ nhân viên hỗ trợ.";
            public const string CONTACT_SUPPORT = "📞 Hotline: 1900-xxxx\n📧 Email: support@vngglass.com\n💬 Zalo: @vngglass_support";
            
            // Order placement flow messages
            public const string ORDER_START_PHONE_REQUEST = "🎉 Bạn đã bắt đầu quá trình đặt hàng!\n\n📞 Vui lòng nhập số điện thoại của bạn để chúng tôi có thể phục vụ tốt hơn:";
            public const string INVALID_PHONE_FORMAT = "❌ Số điện thoại không đúng định dạng. Vui lòng nhập lại số điện thoại hợp lệ (VD: 0123456789):";
            public const string CUSTOMER_FOUND_ORDER_START = "Xin chào {0}!\n\n🎯 Đã bắt đầu tiến hành đặt hàng. Bạn vui lòng nhập thông tin sản phẩm muốn đặt theo định dạng:\n📝 Mã sản phẩm + Loại sản phẩm + Kích thước + Số lượng\n\n💡 Ví dụ: EI90 MB 1000*2000*25mm 2\n\n💡 Bạn có thể nhập nhiều sản phẩm cùng lúc, phân cách bằng dấu phẩy (,), chấm phẩy (;) hoặc xuống hàng:\n💡 Ví dụ: EI90 MB 1000*2000*25mm 2, ABC123 XYZ 500*1000*10mm 5";
            public const string ASK_CONFIRM_ORDER = "Đã ghi nhận\n📝 Nếu cần sửa thông tin, hãy chỉnh sửa lại sản phẩm hãy tiếp tục.\n\n✅ Nhắn \"Kết thúc\" chúng tôi sẽ gửi xác nhận đơn hàng hoặc \"Hủy\" để hủy đặt hàng hàng.";
            public const string CUSTOMER_NOT_FOUND_ORDER_START = "🎯 Không tìm thấy thông tin khách hàng, xin quý khách liên hệ nhân viên để được hỗ trợ";
            public const string INVALID_PRODUCT_FORMAT = "❌ Thông tin sản phẩm không đúng định dạng. Vui lòng nhập lại theo định dạng:\n📝 Mã sản phẩm + Loại sản phẩm + Kích thước + Số lượng\n\n💡 Ví dụ: EI90 MB 1000*2000*25mm 2\n\n💡 Bạn có thể nhập nhiều sản phẩm cùng lúc, phân cách bằng dấu phẩy (,), chấm phẩy (;) hoặc xuống hàng:\n💡 Ví dụ: EI90 MB 1000*2000*25mm 2, ABC123 XYZ 500*1000*10mm 5\n\n🎯 Hoặc nhắn \"Kết thúc\" để hoàn thành đơn hàng";
            public const string PRODUCT_ADDED_SUCCESS = "✅ Đã thêm sản phẩm: {0} - {1} - {2} - SL: {3}\n\n📝 Nếu quý khách muốn sửa thông tin đơn hàng thì hãy cập nhật lại sản phẩm\n\n🎯 Nếu đã xác nhận hãy nhắn \"Kết thúc\" tôi sẽ gửi bạn bản xác nhận đơn hàng";
            public const string NO_PRODUCTS_IN_ORDER = "❌ Chưa có sản phẩm nào trong đơn hàng. Vui lòng nhập thông tin sản phẩm trước:";
            public const string ORDER_COMPLETED_SUCCESS = "✅ Đây là tóm tắt đơn hàng của bạn!\n\n{0}\n\n1. Nhắn \"Xác nhận\" để lên đơn hàng.\n2. Nhắn \"Hủy\" để hủy đơn hàng.";
            public const string ORDER_CANCELLED_AND_DELETED = "✅ Đã hủy đơn hàng. Cảm ơn bạn đã sử dụng dịch vụ!\n\n🔄 Nếu cần hỗ trợ, hãy gửi tin nhắn 'Đặt hàng' để bắt đầu lại.";
        }

    }
}


