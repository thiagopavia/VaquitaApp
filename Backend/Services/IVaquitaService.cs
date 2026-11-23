using Backend.DTOs;
using Backend.Models;

namespace Backend.Services
{
    public interface IVaquitaService
    {
        // Usuarios
        Task<List<Usuario>> ObtenerUsuariosAsync();
        Task<Usuario> AltaUsuarioAsync(RegistroUsuarioDto dto);

        // Grupos
        Task<IEnumerable<object>> ObtenerGruposActivosAsync();
        Task<(bool Exito, string Mensaje, object? Data)> CrearGrupoAsync(CrearGrupoDto dto);
        Task<(bool Exito, string Mensaje)> UnirseAGrupoAsync(int grupoId, int usuarioId);
        Task<(bool Exito, string Mensaje)> CerrarGrupoAsync(int grupoId);

        // Gastos y Resumen
        Task<IEnumerable<object>> ObtenerGastosPorGrupoAsync(int grupoId);
        Task<(bool Exito, string Mensaje, Gasto? Data)> AltaGastoAsync(CrearGastoDto dto);
        Task<(bool Exito, string Mensaje)> SaldarDeudaAsync(SaldarDeudaDto dto);
        Task<(bool Exito, string Mensaje)> EliminarGastoAsync(int gastoId);
        Task<ResumenGrupoDto> ObtenerResumenAsync(int grupoId);
    }
}