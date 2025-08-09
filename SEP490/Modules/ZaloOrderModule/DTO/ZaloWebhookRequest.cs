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

        [JsonPropertyName("attachments")]
        public List<ZaloAttachment>? Attachments { get; set; }

        [JsonPropertyName("reply_to")]
        public ZaloReplyTo? ReplyTo { get; set; }
    }

    public class ZaloAttachment
    {
        [JsonPropertyName("type")]
        public string Type { get; set; } = string.Empty;

        [JsonPropertyName("payload")]
        public ZaloAttachmentPayload Payload { get; set; } = new();
    }

    public class ZaloAttachmentPayload
    {
        [JsonPropertyName("url")]
        public string? Url { get; set; }

        [JsonPropertyName("thumbnail")]
        public string? Thumbnail { get; set; }

        [JsonPropertyName("size")]
        public long? Size { get; set; }

        [JsonPropertyName("name")]
        public string? Name { get; set; }

        [JsonPropertyName("coordinates")]
        public ZaloCoordinates? Coordinates { get; set; }

        [JsonPropertyName("address")]
        public string? Address { get; set; }

        [JsonPropertyName("title")]
        public string? Title { get; set; }

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("image")]
        public ZaloImage? Image { get; set; }
    }

    public class ZaloCoordinates
    {
        [JsonPropertyName("latitude")]
        public double Latitude { get; set; }

        [JsonPropertyName("longitude")]
        public double Longitude { get; set; }
    }

    public class ZaloImage
    {
        [JsonPropertyName("url")]
        public string? Url { get; set; }

        [JsonPropertyName("width")]
        public int? Width { get; set; }

        [JsonPropertyName("height")]
        public int? Height { get; set; }
    }

    public class ZaloReplyTo
    {
        [JsonPropertyName("msg_id")]
        public string MsgId { get; set; } = string.Empty;
    }
}

