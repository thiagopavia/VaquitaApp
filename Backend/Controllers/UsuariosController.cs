using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Backend.DTOs;
using Backend.Models;
using Backend.Services;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        private readonly IVaquitaService _service;
        private readonly IConfiguration _config;

        public UsuariosController(IVaquitaService service, IConfiguration config)
        {
            _service = service;
            _config = config;
        }

        [HttpGet]
        public async Task<ActionResult<List<Usuario>>> GetUsuarios()
        {
            var usuarios = await _service.ObtenerUsuariosAsync();
            return Ok(usuarios);
        }

        [HttpPost("alta")]
        public async Task<ActionResult> AltaUsuario(RegistroUsuarioDto dto)
        {
            var usuario = await _service.AltaUsuarioAsync(dto);
            var token = GenerarToken(usuario);
            return Ok(new { usuario, token });
        }

        private string GenerarToken(Usuario u)
        {
            var claims = new[]
            {
                new Claim("id", u.Id.ToString()),
                new Claim("email", u.Email)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JwtKey"] ?? "ClaveSecretaSuperSeguraDeAlMenos32Caracteres2026!"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddDays(30),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}