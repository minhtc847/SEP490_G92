using System.Text.Json.Serialization;
using ZaloLLMResponse = SEP490.Modules.Zalo.DTO.LLMResponse;

namespace SEP490.Modules.ZaloOrderModule.DTO
{
    public class ConversationState
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("zaloUserId")]
        public string ZaloUserId { get; set; } = string.Empty;

        [JsonPropertyName("currentState")]
        public string CurrentState { get; set; } = UserStates.NEW;



        [JsonPropertyName("currentOrderId")]
        public string? CurrentOrderId { get; set; }

        [JsonPropertyName("lastActivity")]
        public DateTime LastActivity { get; set; }

        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("isActive")]
        public bool IsActive { get; set; } = true;

        [JsonPropertyName("messageCount")]
        public int MessageCount { get; set; } = 0;

        [JsonPropertyName("lastUserMessage")]
        public string? LastUserMessage { get; set; }

        [JsonPropertyName("lastBotResponse")]
        public string? LastBotResponse { get; set; }

        [JsonPropertyName("retryCount")]
        public int RetryCount { get; set; } = 0;

        [JsonPropertyName("lastError")]
        public string? LastError { get; set; }

        [JsonPropertyName("userName")]
        public string? UserName { get; set; }

        [JsonPropertyName("userAvatar")]
        public string? UserAvatar { get; set; }

        // New fields for order placement flow
        [JsonPropertyName("customerPhone")]
        public string? CustomerPhone { get; set; }

        [JsonPropertyName("customerId")]
        public int? CustomerId { get; set; }

        [JsonPropertyName("customerName")]
        public string? CustomerName { get; set; }

        [JsonPropertyName("orderItems")]
        public List<OrderItem> OrderItems { get; set; } = new();

        // New field for message history
        [JsonPropertyName("messageHistory")]
        public List<ConversationMessage> MessageHistory { get; set; } = new();

        // New field for storing LLM response
        [JsonPropertyName("lastLLMResponse")]
        public ZaloLLMResponse? LastLLMResponse { get; set; }

        public void IncrementMessageCount()
        {
            MessageCount++;
        }

        public void AddMessageToHistory(string content, string senderType, string messageType = "text")
        {
            MessageHistory.Add(new ConversationMessage
            {
                Content = content,
                SenderType = senderType,
                MessageType = messageType,
                Timestamp = DateTime.UtcNow
            });
        }
    }

    public class ConversationMessage
    {
        [JsonPropertyName("content")]
        public string Content { get; set; } = string.Empty;

        [JsonPropertyName("senderType")]
        public string SenderType { get; set; } = string.Empty; // "user" or "business"

        [JsonPropertyName("messageType")]
        public string MessageType { get; set; } = "text";

        [JsonPropertyName("timestamp")]
        public DateTime Timestamp { get; set; }
    }

    public class OrderItem
    {
        [JsonPropertyName("item_code")]
        public string ProductCode { get; set; } = string.Empty;

        [JsonPropertyName("item_type")]
        public string ProductType { get; set; } = string.Empty;

        //[JsonPropertyName("size")]
        //public string Size { get; set; } = string.Empty;

        [JsonPropertyName("height")]
        public float Height { get; set; } = 0;

        [JsonPropertyName("width")]
        public float Width { get; set; } = 0;

        [JsonPropertyName("thickness")]
        public float Thickness { get; set; } = 0;

        [JsonPropertyName("quantity")]
        public int Quantity { get; set; } = 0;

        [JsonPropertyName("unit_price")]
        public decimal UnitPrice { get; set; } = 0;

        [JsonPropertyName("total_price")]
        public decimal TotalPrice { get; set; } = 0;
    }

    public static class UserStates
    {
        public const string NEW = "new";
        public const string ORDERING = "ordering";
        public const string WAITING_FOR_PHONE = "waiting_for_phone";
        public const string WAITING_FOR_PRODUCT_INFO = "waiting_for_product_info";
        public const string CONFIRMING = "confirming";
        public const string COMPLETED = "completed";
        public const string CANCELLED = "cancelled";
        public const string CONTACTING_STAFF = "contacting_staff";
    }

    public static class MessageIntents
    {
        public const string PLACE_ORDER = "place_order";
        public const string CONTACT_STAFF = "contact_staff";
        public const string END_STAFF_CONTACT = "end_staff_contact";
        public const string UNKNOWN = "unknown";
        public const string ADD_ORDER_DETAIL = "add_order_detail";
        public const string PHONE_NUMBER = "phone_number";
        public const string FINISH_ORDER = "finish_order";
        public const string CONFIRM_ORDER = "confirm_order";
        public const string CANCEL = "cancel_order";
    }
}

