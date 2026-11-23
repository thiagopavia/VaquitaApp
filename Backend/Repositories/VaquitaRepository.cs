using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Repositories
{
    public class VaquitaRepository : IVaquitaRepository
    {
        private readonly AppDbContext _context;

        public VaquitaRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<Usuario>> ObtenerUsuariosAsync() =>
            await _context.Usuarios.ToListAsync();

        public async Task<Usuario?> ObtenerUsuarioPorIdAsync(int id) =>
            await _context.Usuarios.FindAsync(id);

        public async Task<Usuario?> ObtenerUsuarioPorEmailAsync(string email) =>
            await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == email);

        public async Task AgregarUsuarioAsync(Usuario usuario) =>
            await _context.Usuarios.AddAsync(usuario);

        public async Task<List<Grupo>> ObtenerGruposActivosAsync() =>
            await _context.Grupos
                .Where(g => g.Activo)
                .Include(g => g.Integrantes)
                .ToListAsync();

        public async Task<Grupo?> ObtenerGrupoPorIdAsync(int grupoId) =>
            await _context.Grupos.FindAsync(grupoId);

        public async Task<Grupo?> ObtenerGrupoConIntegrantesAsync(int grupoId) =>
            await _context.Grupos
                .Include(g => g.Integrantes)
                .FirstOrDefaultAsync(g => g.Id == grupoId && g.Activo);

        public async Task<Grupo?> ObtenerGrupoConDetallesAsync(int grupoId) =>
            await _context.Grupos
                .Include(g => g.Integrantes)
                .Include(g => g.Gastos)
                .FirstOrDefaultAsync(g => g.Id == grupoId);

        public async Task AgregarGrupoAsync(Grupo grupo) =>
            await _context.Grupos.AddAsync(grupo);

        public async Task<List<Gasto>> ObtenerGastosPorGrupoAsync(int grupoId) =>
            await _context.Gastos
                .Where(g => g.GrupoId == grupoId)
                .Include(g => g.Pagador)
                .ToListAsync();

        public async Task<Gasto?> ObtenerGastoPorIdAsync(int gastoId) =>
            await _context.Gastos
                .Include(g => g.Grupo)
                .FirstOrDefaultAsync(g => g.Id == gastoId);

        public async Task AgregarGastoAsync(Gasto gasto) =>
            await _context.Gastos.AddAsync(gasto);

        public void EliminarGasto(Gasto gasto) =>
            _context.Gastos.Remove(gasto);

        public async Task GuardarCambiosAsync() =>
            await _context.SaveChangesAsync();
    }
}