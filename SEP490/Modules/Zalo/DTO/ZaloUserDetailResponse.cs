using System.Text.Json.Serialization;

namespace SEP490.Modules.Zalo.DTO
{
    public class ZaloUserDetailResponse
    {
        [JsonPropertyName("user_id")]
        public string UserId { get; set; }

        [JsonPropertyName("user_id_by_app")]
        public string UserIdByApp { get; set; }

        [JsonPropertyName("user_external_id")]
        public string UserExternalId { get; set; }

        [JsonPropertyName("display_name")]
        public string DisplayName { get; set; }

        [JsonPropertyName("user_alias")]
        public string UserAlias { get; set; }

        [JsonPropertyName("is_sensitive")]
        public bool IsSensitive { get; set; }

        [JsonPropertyName("user_last_interaction_date")]
        public string UserLastInteractionDate { get; set; }

        [JsonPropertyName("user_is_follower")]
        public bool UserIsFollower { get; set; }
    }
}
