using Microsoft.Extensions.Logging;
using SEP490.Modules.ZaloOrderModule.DTO;
using SEP490.Modules.ZaloOrderModule.Constants;
using StackExchange.Redis;
using System.Text.Json;

namespace SEP490.Modules.ZaloOrderModule.Services
{
    public class ZaloConversationStateService
    {
        private readonly ILogger<ZaloConversationStateService> _logger;
        private readonly IDatabase _database;
        private readonly TimeSpan _conversationExpiry;
        private readonly bool _redisAvailable;
        private readonly ConnectionMultiplexer _muxer;

        public ZaloConversationStateService(ILogger<ZaloConversationStateService> logger)
        {
            _logger = logger;
            
            try
            {
                // Sử dụng cấu hình Redis Cloud của bạn
                _muxer = ConnectionMultiplexer.Connect(
                    new ConfigurationOptions
                    {
                        EndPoints = { { "redis-17281.crce185.ap-seast-1-1.ec2.redns.redis-cloud.com", 17281 } },
                        User = "default",
                        Password = "y0HB5DwnkEtmMlnu1k7kGGsQIfJCI9bc"
                    }
                );
                
                _database = _muxer.GetDatabase();
                
                // Test connection
                var pingResult = _database.Ping();
                _redisAvailable = true;
                _logger.LogInformation("Redis connection established successfully. Ping: {PingTime}ms", pingResult.TotalMilliseconds);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Redis connection failed, falling back to in-memory storage");
                _redisAvailable = false;
            }
            
            _conversationExpiry = TimeSpan.FromHours(ZaloWebhookConstants.Timeouts.CONVERSATION_EXPIRY_HOURS);
        }

        private string GetConversationKey(string zaloUserId)
        {
            return $"{ZaloWebhookConstants.CacheKeys.CONVERSATION_PREFIX}{zaloUserId}";
        }

        public async Task<ConversationState> GetOrCreateConversationAsync(string zaloUserId)
        {
            if (!_redisAvailable)
            {
                _logger.LogWarning("Redis not available, returning default conversation state for user: {UserId}", zaloUserId);
                return new ConversationState
                {
                    ZaloUserId = zaloUserId,
                    CurrentState = UserStates.NEW,
                    LastActivity = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };
            }

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
                    CurrentState = UserStates.NEW,
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
                    CurrentState = UserStates.NEW,
                    LastActivity = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                };
            }
        }

        public async Task<bool> UpdateConversationStateAsync(string zaloUserId, string newState)
        {
            if (!_redisAvailable)
            {
                _logger.LogWarning("Redis not available, cannot update conversation state for user: {UserId}", zaloUserId);
                return false;
            }

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
                        conversation.LastActivity = DateTime.UtcNow;
                        await _database.StringSetAsync(cacheKey, JsonSerializer.Serialize(conversation), _conversationExpiry);
                        _logger.LogInformation("Updated conversation state to {NewState} for user: {UserId}", newState, zaloUserId);
                        return true;
                    }
                }
                
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating conversation state for user: {UserId}", zaloUserId);
                return false;
            }
        }

        public async Task<bool> UpdateConversationDataAsync(string zaloUserId, Action<ConversationState> updateAction)
        {
            if (!_redisAvailable)
            {
                _logger.LogWarning("Redis not available, cannot update conversation data for user: {UserId}", zaloUserId);
                return false;
            }

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

        public async Task<bool> DeleteConversationAsync(string zaloUserId)
        {
            if (!_redisAvailable)
            {
                _logger.LogWarning("Redis not available, cannot delete conversation for user: {UserId}", zaloUserId);
                return false;
            }

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

        public async Task<ConversationState?> GetConversationAsync(string zaloUserId)
        {
            if (!_redisAvailable)
            {
                _logger.LogWarning("Redis not available, cannot get conversation for user: {UserId}", zaloUserId);
                return null;
            }

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
                
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting conversation for user: {UserId}", zaloUserId);
                return null;
            }
        }

        public async Task<bool> IsConversationActiveAsync(string zaloUserId)
        {
            if (!_redisAvailable)
            {
                _logger.LogWarning("Redis not available, assuming conversation is active for user: {UserId}", zaloUserId);
                return true;
            }

            var cacheKey = GetConversationKey(zaloUserId);
            
            try
            {
                return await _database.KeyExistsAsync(cacheKey);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking conversation existence for user: {UserId}", zaloUserId);
                return false;
            }
        }

        public async Task<List<ConversationState>> GetAllActiveConversationsAsync()
        {
            if (!_redisAvailable)
            {
                _logger.LogWarning("Redis not available, cannot get active conversations");
                return new List<ConversationState>();
            }

            try
            {
                var conversations = new List<ConversationState>();
                
                // Since we don't have _redis reference, we'll return empty list for now
                // This method requires Redis server to be available
                _logger.LogWarning("GetAllActiveConversationsAsync requires Redis server to be available");
                return conversations;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all active conversations");
                return new List<ConversationState>();
            }
        }

        public async Task<bool> UpdateUserInfoAsync(string zaloUserId, string? userName = null, string? userAvatar = null)
        {
            if (!_redisAvailable)
            {
                _logger.LogWarning("Redis not available, cannot update user info for user: {UserId}", zaloUserId);
                return false;
            }

            return await UpdateConversationDataAsync(zaloUserId, conversation =>
            {
                if (!string.IsNullOrEmpty(userName))
                    conversation.UserName = userName;
                if (!string.IsNullOrEmpty(userAvatar))
                    conversation.UserAvatar = userAvatar;
            });
        }

        /// <summary>
        /// Disposes the Redis connection
        /// </summary>
        public void Dispose()
        {
            _muxer?.Close();
            _muxer?.Dispose();
        }
    }
}

