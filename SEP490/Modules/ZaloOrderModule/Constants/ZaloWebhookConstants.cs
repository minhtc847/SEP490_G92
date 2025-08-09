namespace SEP490.Modules.ZaloOrderModule.Constants
{
    public static class ZaloWebhookConstants
    {
        // Event names
        public static class Events
        {
            public const string USER_SEND_TEXT = "user_send_text";
            
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
            public const string GREETING = "Xin chào! Chào mừng bạn đến với VNG Glass.";
            public const string UNKNOWN_INTENT = "Xin lỗi, tôi không hiểu ý bạn.";
            public const string ERROR_MESSAGE = "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.";
            public const string ORDER_START = "Bạn đã bắt đầu quá trình đặt hàng.";
            public const string ORDER_CONFIRM = "Đơn hàng của bạn đã được xác nhận!";
            public const string ORDER_CANCEL = "Đơn hàng đã được hủy.";
        }

        // Product types
        public static class ProductTypes
        {
            public const string TEMPERED_GLASS = "Kính cường lực";
            public const string SAFETY_GLASS = "Kính an toàn";
            public const string REFLECTIVE_GLASS = "Kính phản quang";
            public const string SOUNDPROOF_GLASS = "Kính cách âm";
        }

        // Order states
        public static class OrderStates
        {
            public const string PENDING = "Chờ xử lý";
            public const string PROCESSING = "Đang xử lý";
            public const string CONFIRMED = "Đã xác nhận";
            public const string SHIPPED = "Đã giao hàng";
            public const string DELIVERED = "Đã nhận hàng";
            public const string CANCELLED = "Đã hủy";
        }
    }
}


