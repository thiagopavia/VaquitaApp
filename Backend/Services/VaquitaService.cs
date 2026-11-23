using Backend.DTOs;
using Backend.Models;
using Backend.Repositories;

namespace Backend.Services
{
    public class VaquitaService : IVaquitaService
    {
        private readonly IVaquitaRepository _repository;

        public VaquitaService(IVaquitaRepository repository)
        {
            _repository = repository;
        }

        // ================= USUARIOS =================
        public async Task<List<Usuario>> ObtenerUsuariosAsync() =>
            await _repository.ObtenerUsuariosAsync();

        public async Task<Usuario> AltaUsuarioAsync(RegistroUsuarioDto dto)
        {
            var usuario = await _repository.ObtenerUsuarioPorEmailAsync(dto.Email);

            if (usuario == null)
            {
                usuario = new Usuario
                {
                    Nombre = dto.Nombre,
                    Apellido = dto.Apellido,
                    Apodo = dto.Apodo,
                    Email = dto.Email
                };
                await _repository.AgregarUsuarioAsync(usuario);
                await _repository.GuardarCambiosAsync();
            }

            return usuario;
        }

        // ================= GRUPOS =================
        public async Task<IEnumerable<object>> ObtenerGruposActivosAsync()
        {
            var grupos = await _repository.ObtenerGruposActivosAsync();

            return grupos.Select(g => new
            {
                g.Id,
                g.Descripcion,
                g.Activo,
                Integrantes = g.Integrantes.Select(i => new { i.Id, i.Nombre, i.Apodo, i.Email })
            });
        }

        public async Task<(bool Exito, string Mensaje, object? Data)> CrearGrupoAsync(CrearGrupoDto dto)
        {
            var creador = await _repository.ObtenerUsuarioPorIdAsync(dto.CreadorId);
            if (creador == null)
                return (false, "El usuario creador no existe.", null);

            var grupo = new Grupo
            {
                Descripcion = dto.Descripcion,
                Activo = true,
                Integrantes = new List<Usuario> { creador }
            };

            await _repository.AgregarGrupoAsync(grupo);
            await _repository.GuardarCambiosAsync();

            return (true, "Grupo creado.", new { grupo.Id, grupo.Descripcion, grupo.Activo });
        }

        public async Task<(bool Exito, string Mensaje)> UnirseAGrupoAsync(int grupoId, int usuarioId)
        {
            var grupo = await _repository.ObtenerGrupoConIntegrantesAsync(grupoId);
            var usuario = await _repository.ObtenerUsuarioPorIdAsync(usuarioId);

            if (grupo == null || usuario == null)
                return (false, "Grupo inactivo/inexistente o usuario no registrado.");

            if (!grupo.Integrantes.Any(i => i.Id == usuarioId))
            {
                grupo.Integrantes.Add(usuario);
                await _repository.GuardarCambiosAsync();
            }

            return (true, $"{usuario.Apodo} se unió a {grupo.Descripcion}");
        }

        public async Task<(bool Exito, string Mensaje)> CerrarGrupoAsync(int grupoId)
        {
            var resumen = await ObtenerResumenAsync(grupoId);

            if (resumen.Cuadro2.Any())
                return (false, "No se puede cerrar el grupo: aún existen saldos pendientes.");

            var grupo = await _repository.ObtenerGrupoPorIdAsync(grupoId);
            if (grupo == null) return (false, "Grupo no encontrado.");

            grupo.Activo = false;
            await _repository.GuardarCambiosAsync();
            return (true, "Grupo cerrado correctamente.");
        }

        // ================= GASTOS =================
        public async Task<IEnumerable<object>> ObtenerGastosPorGrupoAsync(int grupoId)
        {
            var gastos = await _repository.ObtenerGastosPorGrupoAsync(grupoId);

            return gastos.Select(g => new
            {
                g.Id,
                g.Importe,
                g.Descripcion,
                g.Rubro,
                g.EsPagoDeuda,
                Pagador = g.Pagador != null
                    ? (string.IsNullOrEmpty(g.Pagador.Apodo) ? g.Pagador.Nombre : g.Pagador.Apodo)
                    : ""
            });
        }

        public async Task<(bool Exito, string Mensaje, Gasto? Data)> AltaGastoAsync(CrearGastoDto dto)
        {
            if (dto.Importe <= 0)
                return (false, "El importe debe ser positivo.", null);

            var gasto = new Gasto
            {
                Importe = dto.Importe,
                Descripcion = dto.Descripcion,
                Rubro = string.IsNullOrWhiteSpace(dto.Rubro) ? null : dto.Rubro,
                GrupoId = dto.GrupoId,
                PagadorId = dto.PagadorId,
                EsPagoDeuda = false
            };

            await _repository.AgregarGastoAsync(gasto);
            await _repository.GuardarCambiosAsync();

            return (true, "Gasto registrado.", gasto);
        }

        public async Task<(bool Exito, string Mensaje)> SaldarDeudaAsync(SaldarDeudaDto dto)
        {
            if (dto.Monto <= 0)
                return (false, "El monto del pago debe ser mayor a cero.");

            var pago = new Gasto
            {
                Importe = dto.Monto,
                Descripcion = $"Transferencia a AcreedorId:{dto.AcreedorId}",
                GrupoId = dto.GrupoId,
                PagadorId = dto.DeudorId,
                EsPagoDeuda = true
            };

            await _repository.AgregarGastoAsync(pago);
            await _repository.GuardarCambiosAsync();

            return (true, "Pago registrado correctamente.");
        }

        public async Task<(bool Exito, string Mensaje)> EliminarGastoAsync(int gastoId)
        {
            var gasto = await _repository.ObtenerGastoPorIdAsync(gastoId);
            if (gasto == null)
                return (false, "Movimiento no encontrado.");

            if (gasto.Grupo != null && !gasto.Grupo.Activo)
                return (false, "No se pueden eliminar movimientos de un grupo cerrado.");

            _repository.EliminarGasto(gasto);
            await _repository.GuardarCambiosAsync();

            return (true, "Movimiento eliminado correctamente.");
        }

        // ================= RESUMEN =================
        public async Task<ResumenGrupoDto> ObtenerResumenAsync(int grupoId)
        {
            var grupo = await _repository.ObtenerGrupoConDetallesAsync(grupoId)
                ?? throw new Exception("Grupo no encontrado");

            var resumen = new ResumenGrupoDto();
            if (grupo.Integrantes.Count == 0) return resumen;

            var gastosComunes = grupo.Gastos.Where(g => !g.EsPagoDeuda).ToList();
            resumen.TotalGeneral = gastosComunes.Sum(g => g.Importe);
            resumen.PromedioPorPersona = Math.Round(resumen.TotalGeneral / grupo.Integrantes.Count, 2);

            foreach (var persona in grupo.Integrantes)
            {
                decimal pagadoComun = gastosComunes
                    .Where(g => g.PagadorId == persona.Id)
                    .Sum(g => g.Importe);

                decimal pagosEnviados = grupo.Gastos
                    .Where(g => g.EsPagoDeuda && g.PagadorId == persona.Id)
                    .Sum(g => g.Importe);

                decimal pagosRecibidos = grupo.Gastos
                    .Where(g => g.EsPagoDeuda && g.Descripcion.Contains($"AcreedorId:{persona.Id}"))
                    .Sum(g => g.Importe);

                decimal saldo = Math.Round((pagadoComun + pagosEnviados) - (resumen.PromedioPorPersona + pagosRecibidos), 2);

                // Limpiar centavo residual (-0.01 o +0.01) producto de divisiones periódicas (ej. entre 3)
                if (Math.Abs(saldo) <= 0.01m)
                {
                    saldo = 0m;
                }

                resumen.Cuadro1.Add(new SaldoPersonaDto
                {
                    UsuarioId = persona.Id,
                    Nombre = string.IsNullOrEmpty(persona.Apodo) ? persona.Nombre : persona.Apodo,
                    TotalGastos = pagadoComun,
                    Saldo = saldo
                });
            }

            var deudores = resumen.Cuadro1
                .Where(c => c.Saldo < -0.01m)
                .Select(c => new { c.UsuarioId, c.Nombre, Monto = Math.Abs(c.Saldo) })
                .ToList();

            var acreedores = resumen.Cuadro1
                .Where(c => c.Saldo > 0.01m)
                .Select(c => new { c.UsuarioId, c.Nombre, Monto = c.Saldo })
                .ToList();

            var saldosDeudores = deudores.Select(d => d.Monto).ToArray();
            var saldosAcreedores = acreedores.Select(a => a.Monto).ToArray();

            int i = 0, j = 0;
            while (i < deudores.Count && j < acreedores.Count)
            {
                decimal montoTransferencia = Math.Min(saldosDeudores[i], saldosAcreedores[j]);

                if (montoTransferencia > 0.01m)
                {
                    resumen.Cuadro2.Add(new DeudaEntrePersonasDto
                    {
                        DeudorId = deudores[i].UsuarioId,
                        DeudorNombre = deudores[i].Nombre,
                        AcreedorId = acreedores[j].UsuarioId,
                        AcreedorNombre = acreedores[j].Nombre,
                        Monto = Math.Round(montoTransferencia, 2)
                    });
                }

                saldosDeudores[i] -= montoTransferencia;
                saldosAcreedores[j] -= montoTransferencia;

                if (saldosDeudores[i] <= 0.01m) i++;
                if (saldosAcreedores[j] <= 0.01m) j++;
            }

            return resumen;
        }
    }
}