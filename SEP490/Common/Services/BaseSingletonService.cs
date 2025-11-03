namespace SEP490.Common.Services
{
    /// <summary>
    /// Base class for services with Singleton lifetime.
    /// Singleton services are created once for the entire application lifetime.
    /// Use this for services that need to maintain state across requests and are thread-safe.
    /// </summary>
    public abstract class BaseSingletonService
    {
        /// <summary>
        /// Gets the service type for dependency injection registration.
        /// </summary>
        public static Type ServiceType => typeof(BaseSingletonService);
    }
}
