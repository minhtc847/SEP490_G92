using System.Text.Json.Serialization;

namespace SEP490.Modules.ZaloOrderModule.DTO
{
    public class ZaloWebhookRequest
    {
        [JsonPropertyName("app_id")]
        public string AppId { get; set; } = string.Empty;

        [JsonPropertyName("sender")]
        public ZaloSender Sender { get; set; } = new();

        [JsonPropertyName("user_id_by_app")]
        public string? UserIdByApp { get; set; }

        [JsonPropertyName("recipient")]
        public ZaloRecipient Recipient { get; set; } = new();

        [JsonPropertyName("event_name")]
        public string EventName { get; set; } = string.Empty;

        [JsonPropertyName("message")]
        public ZaloMessage? Message { get; set; }

        [JsonPropertyName("timestamp")]
        public string Timestamp { get; set; } = string.Empty;
    }

    public class ZaloSender
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;


    }

    public class ZaloRecipient
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;
    }

    public class ZaloRecipientSend
    {
        [JsonPropertyName("user_id")]
        public string Id { get; set; } = string.Empty;
    }

    public class ZaloMessage
    {
        [JsonPropertyName("text")]
        public string Text { get; set; } = string.Empty;

        [JsonPropertyName("msg_id")]
        public string MsgId { get; set; } = string.Empty;
    }
}

