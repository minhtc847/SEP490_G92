using System.Text.Json.Serialization;

namespace SEP490.Modules.ZaloOrderModule.DTO
{
    public class ZaloWebhookResponse
    {
        [JsonPropertyName("status")]
        public string Status { get; set; } = "success";

        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;

        [JsonPropertyName("data")]
        public object? Data { get; set; }
    }

    public class ZaloSendMessageRequest
    {
        [JsonPropertyName("recipient")]
        public ZaloRecipient Recipient { get; set; } = new();

        [JsonPropertyName("message")]
        public ZaloSendMessage Message { get; set; } = new();
    }

    public class ZaloSendMessage
    {
        [JsonPropertyName("text")]
        public string Text { get; set; } = string.Empty;

    }


    public class ZaloSendMessageResponse
    {
        [JsonPropertyName("message_id")]
        public string MessageId { get; set; } = string.Empty;

        [JsonPropertyName("user_id")]
        public string UserId { get; set; } = string.Empty;
    }

    public class ZaloErrorResponse
    {
        [JsonPropertyName("error")]
        public int Error { get; set; }

        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;
    }
}

