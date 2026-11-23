using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Backend.DTOs;
using Backend.Services;

namespace Backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class GastosController : ControllerBase
    {
        private readonly IVaquitaService _service;

        public GastosController(IVaquitaService service)
        {
            _service = service;
        }

        [HttpGet("grupo/{grupoId:int}")]
        public async Task<ActionResult> GetGastosPorGrupo(int grupoId)
        {
            var gastos = await _service.ObtenerGastosPorGrupoAsync(grupoId);
            return Ok(gastos);
        }

        [HttpPost]
        public async Task<ActionResult> AltaGasto(CrearGastoDto dto)
        {
            var resultado = await _service.AltaGastoAsync(dto);
            if (!resultado.Exito) return BadRequest(resultado.Mensaje);

            return Ok(resultado.Data);
        }

        [HttpPost("saldar")]
        public async Task<ActionResult> SaldarDeuda(SaldarDeudaDto dto)
        {
            var resultado = await _service.SaldarDeudaAsync(dto);
            if (!resultado.Exito) return BadRequest(resultado.Mensaje);

            return Ok(new { mensaje = resultado.Mensaje });
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult> EliminarGasto(int id)
        {
            var resultado = await _service.EliminarGastoAsync(id);
            if (!resultado.Exito) return BadRequest(resultado.Mensaje);

            return Ok(new { mensaje = resultado.Mensaje });
        }

        [HttpGet("resumen/{grupoId:int}")]
        public async Task<ActionResult<ResumenGrupoDto>> GetResumen(int grupoId)
        {
            try
            {
                var resumen = await _service.ObtenerResumenAsync(grupoId);
                return Ok(resumen);
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}