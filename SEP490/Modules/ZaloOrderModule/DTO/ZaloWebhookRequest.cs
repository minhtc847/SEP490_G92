using System.Text.Json.Serialization;

namespace SEP490.Modules.ZaloOrderModule.DTO
{
    public class ZaloWebhookRequest
    {
        [JsonPropertyName("event_name")]
        public string EventName { get; set; } = string.Empty;

        [JsonPropertyName("timestamp")]
        public long Timestamp { get; set; }

        [JsonPropertyName("sender")]
        public ZaloSender Sender { get; set; } = new();

        [JsonPropertyName("recipient")]
        public ZaloRecipient Recipient { get; set; } = new();

        [JsonPropertyName("message")]
        public ZaloMessage? Message { get; set; }

        [JsonPropertyName("source")]
        public string Source { get; set; } = string.Empty;

        [JsonPropertyName("user_id_by_app")]
        public string? UserIdByApp { get; set; }
    }

    public class ZaloSender
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("avatar")]
        public string? Avatar { get; set; }
    }

    public class ZaloRecipient
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;
    }

    public class ZaloMessage
    {
        [JsonPropertyName("msg_id")]
        public string MsgId { get; set; } = string.Empty;

        [JsonPropertyName("text")]
        public string Text { get; set; } = string.Empty;

    }

}

