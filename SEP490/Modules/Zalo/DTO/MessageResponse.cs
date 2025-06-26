using System.Text.Json.Serialization;

namespace SEP490.Modules.Zalo.DTO
{
    public class MessageResponse
    {
        [JsonPropertyName("sender_id")]
        public string? SenderId { get; set; }
        [JsonPropertyName("sender_type")]
        public string? UserType { get; set; }
        [JsonPropertyName("message_type")]
        public string? MessageType { get; set; }
        [JsonPropertyName("content")]
        public string? MessageContent { get; set; }
        [JsonPropertyName("send_time")]
        public DateTime SendTime { get; set; }
    }
}
