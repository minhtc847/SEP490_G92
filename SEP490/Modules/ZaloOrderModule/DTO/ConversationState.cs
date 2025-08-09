using System.Text.Json.Serialization;

namespace SEP490.Modules.ZaloOrderModule.DTO
{
    public class ConversationState
    {
        [JsonPropertyName("zaloUserId")]
        public string ZaloUserId { get; set; } = string.Empty;

        [JsonPropertyName("currentState")]
        public string CurrentState { get; set; } = UserStates.INQUIRY;

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

        [JsonPropertyName("conversationData")]
        public Dictionary<string, object> ConversationData { get; set; } = new();

        [JsonPropertyName("retryCount")]
        public int RetryCount { get; set; } = 0;

        [JsonPropertyName("lastError")]
        public string? LastError { get; set; }

        [JsonPropertyName("userName")]
        public string? UserName { get; set; }

        [JsonPropertyName("userAvatar")]
        public string? UserAvatar { get; set; }

        public void IncrementMessageCount()
        {
            MessageCount++;
        }

        public void AddConversationData(string key, object value)
        {
            ConversationData[key] = value;
        }

        public T? GetConversationData<T>(string key)
        {
            if (ConversationData.TryGetValue(key, out var value) && value is T typedValue)
            {
                return typedValue;
            }
            return default;
        }
    }

    public static class UserStates
    {
        public const string INQUIRY = "inquiry";
        public const string ORDERING = "ordering";
        public const string CONFIRMING = "confirming";
        public const string CANCELLED = "cancelled";
        public const string COMPLETED = "completed";
    }

    public static class MessageIntents
    {
        public const string PLACE_ORDER = "place_order";
        public const string CONFIRM_ORDER = "confirm_order";
        public const string CANCEL_ORDER = "cancel_order";
        public const string INQUIRE_PRODUCT = "inquire_product";
        public const string INQUIRE_PRICE = "inquire_price";
        public const string GREETING = "greeting";
        public const string GOODBYE = "goodbye";
        public const string UNKNOWN = "unknown";
    }
}

