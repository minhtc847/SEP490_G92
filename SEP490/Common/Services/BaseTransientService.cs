namespace SEP490.Common.Services
{
    /// <summary>
    /// Base class for services with Transient lifetime.
    /// Transient services are created each time they are requested.
    /// Use this for lightweight, stateless services that don't need to maintain state.
    /// </summary>
    public abstract class BaseTransientService
    {
        /// <summary>
        /// Gets the service type for dependency injection registration.
        /// </summary>
        public static Type ServiceType => typeof(BaseTransientService);
    }
}
