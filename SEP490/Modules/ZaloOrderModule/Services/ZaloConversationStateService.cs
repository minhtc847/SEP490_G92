using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SEP490.Modules.ZaloOrderModule.DTO;
using StackExchange.Redis;
using System.Text.Json;

namespace SEP490.Modules.ZaloOrderModule.Services
{
    public class ZaloConversationStateService
    {
        private readonly ILogger<ZaloConversationStateService> _logger;
        private readonly IConnectionMultiplexer _redis;
        private readonly IDatabase _database;
        private readonly TimeSpan _conversationExpiry = TimeSpan.FromHours(24);

        public ZaloConversationStateService(
            ILogger<ZaloConversationStateService> logger,
            IConnectionMultiplexer redis)
        {
            _logger = logger;
            _redis = redis;
            _database = redis.GetDatabase();
        }

        public async Task<ConversationState> GetOrCreateConversationAsync(string zaloUserId)
        {
            var cacheKey = GetConversationKey(zaloUserId);
            
            try
            {
                var existingState = await _database.StringGetAsync(cacheKey);
                
                if (existingState.HasValue)
                {
                    var conversation = JsonSerializer.Deserialize<ConversationState>(existingState!);
                    if (conversation != null)
                    {
                        conversation.LastActivity = DateTime.UtcNow;
                        await _database.StringSetAsync(cacheKey, JsonSerializer.Serialize(conversation), _conversationExpiry);
                        return conversation;
                    }
                }

                // Create new conversation
                var newConversation = new ConversationState
                {
                    ZaloUserId = zaloUserId,
                    CurrentState = UserStates.INQUIRY,
                    LastActivity = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };

                await _database.StringSetAsync(cacheKey, JsonSerializer.Serialize(newConversation), _conversationExpiry);
                _logger.LogInformation("Created new conversation for user: {UserId}", zaloUserId);
                
                return newConversation;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting or creating conversation for user: {UserId}", zaloUserId);
                
                // Return default conversation if Redis fails
                return new ConversationState
                {
                    ZaloUserId = zaloUserId,
                    CurrentState = UserStates.INQUIRY,
                    LastActivity = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };
            }
        }

        public async Task<bool> UpdateStateAsync(string zaloUserId, string newState, string? orderId = null)
        {
            var cacheKey = GetConversationKey(zaloUserId);
            
            try
            {
                var existingState = await _database.StringGetAsync(cacheKey);
                
                if (existingState.HasValue)
                {
                    var conversation = JsonSerializer.Deserialize<ConversationState>(existingState!);
                    if (conversation != null)
                    {
                        conversation.CurrentState = newState;
                        conversation.CurrentOrderId = orderId;
                        conversation.LastActivity = DateTime.UtcNow;

                        await _database.StringSetAsync(cacheKey, JsonSerializer.Serialize(conversation), _conversationExpiry);
                        
                        _logger.LogInformation("Updated state for user {UserId}: {OldState} -> {NewState}", 
                            zaloUserId, conversation.CurrentState, newState);
                        
                        return true;
                    }
                }

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating state for user: {UserId}", zaloUserId);
                return false;
            }
        }

        public async Task<bool> UpdateConversationDataAsync(string zaloUserId, Action<ConversationState> updateAction)
        {
            var cacheKey = GetConversationKey(zaloUserId);
            
            try
            {
                var existingState = await _database.StringGetAsync(cacheKey);
                
                if (existingState.HasValue)
                {
                    var conversation = JsonSerializer.Deserialize<ConversationState>(existingState!);
                    if (conversation != null)
                    {
                        updateAction(conversation);
                        conversation.LastActivity = DateTime.UtcNow;

                        await _database.StringSetAsync(cacheKey, JsonSerializer.Serialize(conversation), _conversationExpiry);
                        return true;
                    }
                }

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating conversation data for user: {UserId}", zaloUserId);
                return false;
            }
        }

        public async Task<bool> UpdateUserInfoAsync(string zaloUserId, string userName, string? userAvatar)
        {
            var cacheKey = GetConversationKey(zaloUserId);
            
            try
            {
                var existingState = await _database.StringGetAsync(cacheKey);
                
                if (existingState.HasValue)
                {
                    var conversation = JsonSerializer.Deserialize<ConversationState>(existingState!);
                    if (conversation != null)
                    {
                        conversation.UserName = userName;
                        conversation.UserAvatar = userAvatar;
                        conversation.LastActivity = DateTime.UtcNow;

                        await _database.StringSetAsync(cacheKey, JsonSerializer.Serialize(conversation), _conversationExpiry);
                        return true;
                    }
                }

                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user info for user: {UserId}", zaloUserId);
                return false;
            }
        }

        public async Task<ConversationState?> GetConversationAsync(string zaloUserId)
        {
            var cacheKey = GetConversationKey(zaloUserId);
            
            try
            {
                var existingState = await _database.StringGetAsync(cacheKey);
                
                if (existingState.HasValue)
                {
                    return JsonSerializer.Deserialize<ConversationState>(existingState!);
                }

                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting conversation for user: {UserId}", zaloUserId);
                return null;
            }
        }

        public async Task<bool> DeleteConversationAsync(string zaloUserId)
        {
            var cacheKey = GetConversationKey(zaloUserId);
            
            try
            {
                return await _database.KeyDeleteAsync(cacheKey);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting conversation for user: {UserId}", zaloUserId);
                return false;
            }
        }

        public async Task<bool> IsConversationActiveAsync(string zaloUserId)
        {
            var conversation = await GetConversationAsync(zaloUserId);
            return conversation?.IsActive == true;
        }

        // public async Task<List<ConversationState>> GetActiveConversationsAsync()
        // {
        //     try
        //     {
        //         var conversations = new List<ConversationState>();
        //         var server = _redis.GetServer(_redis.GetEndPoints().First());
                
        //         await foreach (var key in server.ScanAsync(pattern: "zalo:conversation:*"))
        //         {
        //             var conversationData = await _database.StringGetAsync(key);
        //             if (conversationData.HasValue)
        //             {
        //                 var conversation = JsonSerializer.Deserialize<ConversationState>(conversationData!);
        //                 if (conversation?.IsActive == true)
        //                 {
        //                     conversations.Add(conversation);
        //                 }
        //             }
        //         }

        //         return conversations;
        //     }
        //     catch (Exception ex)
        //     {
        //         _logger.LogError(ex, "Error getting active conversations");
        //         return new List<ConversationState>();
        //     }
        // }

        public async Task<TimeSpan?> GetConversationTimeToLiveAsync(string zaloUserId)
        {
            var cacheKey = GetConversationKey(zaloUserId);
            
            try
            {
                return await _database.KeyTimeToLiveAsync(cacheKey);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting TTL for conversation of user: {UserId}", zaloUserId);
                return null;
            }
        }

        private string GetConversationKey(string zaloUserId)
        {
            return $"zalo:conversation:{zaloUserId}";
        }
    }
}

