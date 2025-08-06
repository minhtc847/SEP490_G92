namespace SEP490.Modules.Zalo.DTO
{
    /// <summary>
    /// Request model for Zalo Dynamic API
    /// </summary>
    public class ZaloDynamicChatRequest
    {
        public string UserId { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? UserPhone { get; set; }
        public string? UserName { get; set; }
    }
} 