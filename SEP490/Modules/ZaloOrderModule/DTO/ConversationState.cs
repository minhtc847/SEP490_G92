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
        public const string CHECK_ORDER = "check_order";
        public const string PRODUCT_INFO = "product_info";
        public const string CONTACT_STAFF = "contact_staff";
        public const string UNKNOWN = "unknown";
    }
}

