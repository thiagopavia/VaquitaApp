using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.DTOs;
using Backend.Services;

namespace Backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class GruposController : ControllerBase
    {
        private readonly IVaquitaService _service;

        public GruposController(IVaquitaService service)
        {
            _service = service;
        }

        [HttpGet("activos")]
        public async Task<ActionResult> GetGruposActivos()
        {
            var grupos = await _service.ObtenerGruposActivosAsync();
            return Ok(grupos);
        }

        [HttpPost]
        public async Task<ActionResult> CrearGrupo(CrearGrupoDto dto)
        {
            var resultado = await _service.CrearGrupoAsync(dto);
            if (!resultado.Exito) return BadRequest(resultado.Mensaje);

            return Ok(resultado.Data);
        }

        [HttpPost("{grupoId:int}/unirse/{usuarioId:int}")]
        public async Task<ActionResult> UnirseAGrupo(int grupoId, int usuarioId)
        {
            var resultado = await _service.UnirseAGrupoAsync(grupoId, usuarioId);
            if (!resultado.Exito) return NotFound(resultado.Mensaje);

            return Ok(new { mensaje = resultado.Mensaje });
        }

        [HttpPost("{grupoId:int}/cerrar")]
        public async Task<ActionResult> CerrarGrupo(int grupoId)
        {
            var resultado = await _service.CerrarGrupoAsync(grupoId);
            if (!resultado.Exito) return BadRequest(resultado.Mensaje);

            return Ok(new { mensaje = resultado.Mensaje });
        }
    }
}