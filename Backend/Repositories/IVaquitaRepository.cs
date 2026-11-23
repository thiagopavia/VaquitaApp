using Backend.Models;

namespace Backend.Repositories
{
    public interface IVaquitaRepository
    {
        // Usuarios
        Task<List<Usuario>> ObtenerUsuariosAsync();
        Task<Usuario?> ObtenerUsuarioPorIdAsync(int id);
        Task<Usuario?> ObtenerUsuarioPorEmailAsync(string email);
        Task AgregarUsuarioAsync(Usuario usuario);

        // Grupos
        Task<List<Grupo>> ObtenerGruposActivosAsync();
        Task<Grupo?> ObtenerGrupoPorIdAsync(int grupoId);
        Task<Grupo?> ObtenerGrupoConIntegrantesAsync(int grupoId);
        Task<Grupo?> ObtenerGrupoConDetallesAsync(int grupoId);
        Task AgregarGrupoAsync(Grupo grupo);

        // Gastos
        Task<List<Gasto>> ObtenerGastosPorGrupoAsync(int grupoId);
        Task<Gasto?> ObtenerGastoPorIdAsync(int gastoId);
        Task AgregarGastoAsync(Gasto gasto);
        void EliminarGasto(Gasto gasto);

        Task GuardarCambiosAsync();
    }
}