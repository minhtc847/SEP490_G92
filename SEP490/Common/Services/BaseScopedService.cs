namespace SEP490.Common.Services
{
    /// <summary>
    /// Base class for services with Scoped lifetime.
    /// Scoped services are created once per request within the same scope.
    /// Use this for services that need to maintain state during a request but not across requests.
    /// </summary>
    public abstract class BaseScopedService
    {
        /// <summary>
        /// Gets the service type for dependency injection registration.
        /// </summary>
        public static Type ServiceType => typeof(BaseScopedService);
    }
}
