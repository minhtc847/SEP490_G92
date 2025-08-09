using System.Text.Json.Serialization;

namespace SEP490.Modules.ZaloOrderModule.DTO
{
    public class MessageResponse
    {
        [JsonPropertyName("content")]
        public string Content { get; set; } = string.Empty;

        [JsonPropertyName("messageType")]
        public string MessageType { get; set; } = "text";

        [JsonPropertyName("attachment")]
        public ZaloSendAttachment? Attachment { get; set; }

        [JsonPropertyName("intent")]
        public string Intent { get; set; } = string.Empty;

        [JsonPropertyName("confidence")]
        public double Confidence { get; set; } = 0.0;

        [JsonPropertyName("entities")]
        public Dictionary<string, object>? Entities { get; set; }

        [JsonPropertyName("suggestions")]
        public List<string>? Suggestions { get; set; }

        [JsonPropertyName("shouldEndConversation")]
        public bool ShouldEndConversation { get; set; } = false;
    }
}
