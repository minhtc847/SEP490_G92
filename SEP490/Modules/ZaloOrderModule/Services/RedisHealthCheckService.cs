using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace SEP490.Modules.ZaloOrderModule.Services
{
    /// <summary>
    /// Service for checking Redis connection health
    /// </summary>
    public interface IRedisHealthCheckService
    {
        Task<bool> IsRedisAvailableAsync();
        Task<TimeSpan?> GetRedisPingAsync();
        Task<string> GetRedisStatusAsync();
    }

    public class RedisHealthCheckService : IRedisHealthCheckService
    {
        private readonly ConnectionMultiplexer _muxer;
        private readonly ILogger<RedisHealthCheckService> _logger;

        public RedisHealthCheckService(ILogger<RedisHealthCheckService> logger)
        {
            _logger = logger;
            
            try
            {
                _muxer = ConnectionMultiplexer.Connect(
                    new ConfigurationOptions
                    {
                        EndPoints = { { "redis-17281.crce185.ap-seast-1-1.ec2.redns.redis-cloud.com", 17281 } },
                        User = "default",
                        Password = "y0HB5DwnkEtmMlnu1k7kGGsQIfJCI9bc",
                        ConnectTimeout = 5000,         // 5 seconds for health check
                        SyncTimeout = 5000,            // 5 seconds for health check
                        ConnectRetry = 1,              // 1 retry for health check
                        KeepAlive = 180                // 3 minutes
                    }
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create Redis connection for health check");
                _muxer = null;
            }
        }

        public async Task<bool> IsRedisAvailableAsync()
        {
            try
            {
                if (_muxer == null) return false;
                
                var db = _muxer.GetDatabase();
                var pingResult = await db.PingAsync();
                return pingResult.TotalMilliseconds > 0;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Redis health check failed");
                return false;
            }
        }

        public async Task<TimeSpan?> GetRedisPingAsync()
        {
            try
            {
                if (_muxer == null) return null;
                
                var db = _muxer.GetDatabase();
                var pingResult = await db.PingAsync();
                return pingResult;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Redis ping failed");
                return null;
            }
        }

        public async Task<string> GetRedisStatusAsync()
        {
            try
            {
                if (_muxer == null) return "Disconnected";
                
                var isAvailable = await IsRedisAvailableAsync();
                if (!isAvailable) return "Unavailable";
                
                var ping = await GetRedisPingAsync();
                if (ping.HasValue)
                {
                    return $"Connected (Ping: {ping.Value.TotalMilliseconds:F2}ms)";
                }
                
                return "Connected";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting Redis status");
                return "Error";
            }
        }

        public void Dispose()
        {
            _muxer?.Close();
            _muxer?.Dispose();
        }
    }
}
