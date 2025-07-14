using SEP490.Modules.GlueButylExport.DTO;

namespace SEP490.Modules.GlueButylExport.Services
{
    public interface IGlueButylExportService
    {
        public Task AddGlueButylExport(CreateNewDTO createNewDTO);
        public Task<List<GlueButylExportResponseDTO>> getAllExportByProductionPlanId(int productionPlanId);
        public Task<GlueButylExportResponseDTO> GetExportById(int id);
    }
}
