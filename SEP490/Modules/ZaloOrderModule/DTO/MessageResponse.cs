using System.Text.Json.Serialization;

namespace SEP490.Modules.ZaloOrderModule.DTO
{
    public class MessageResponse
    {
        [JsonPropertyName("content")]
        public string Content { get; set; } = string.Empty;

        [JsonPropertyName("messageType")]
        public string MessageType { get; set; } = "text";

        [JsonPropertyName("intent")]
        public string Intent { get; set; } = string.Empty;

    }
}
