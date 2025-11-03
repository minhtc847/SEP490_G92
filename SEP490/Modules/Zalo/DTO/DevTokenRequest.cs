using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace SEP490.Modules.Zalo.DTO
{
    public class DevTokenRequest
    {
        [JsonPropertyName("access_token"),Required]
        public string AccessToken { get; set; }
        [JsonPropertyName("refresh_token"), Required]
        public string RefreshToken { get; set; }
    }
}
