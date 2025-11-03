using System.Threading.Tasks;
using SEP490.Modules.Zalo.DTO;

namespace SEP490.Modules.Zalo.Services
{
    public interface IGlassProductLookupService
    {
        Task<string?> FindProductNameAsync(string itemCode, string itemType, double height, double width, double thickness);
    }
}