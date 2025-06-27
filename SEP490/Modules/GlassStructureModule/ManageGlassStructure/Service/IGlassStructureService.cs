using SEP490.Modules.GlassStructureModule.ManageGlassStructure.DTO;

namespace SEP490.Modules.GlassStructureModule.ManageGlassStructure.Service
{
    public interface IGlassStructureService
    {
        List<GlassStructureDto> GetAllGlassStructures();
        GlassStructureDto? GetGlassStructureById(int id);
        bool UpdateGlassStructureById(int id, UpdateGlassStructureDto dto);
        bool DeleteGlassStructureById(int id);
        GlassStructureDto AddGlassStructure(UpdateGlassStructureDto dto);

    }
}
