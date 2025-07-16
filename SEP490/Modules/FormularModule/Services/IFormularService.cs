using SEP490.Modules.FormularModule.DTO;

namespace SEP490.Modules.FormularModule.Services
{
    public interface IFormularService
    {
        List<FormularGroupDto> GetAllFormularsGroupedByType();
        List<FormularDto> GetFormularsByType(string type);
    }
} 