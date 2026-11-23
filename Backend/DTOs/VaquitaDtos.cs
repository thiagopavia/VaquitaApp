namespace Backend.DTOs
{
    public record RegistroUsuarioDto(string Nombre, string Apellido, string Apodo, string Email);
    public record CrearGrupoDto(string Descripcion, int CreadorId);
    public record CrearGastoDto(decimal Importe, string Descripcion, string? Rubro, int GrupoId, int PagadorId);
    public record SaldarDeudaDto(int GrupoId, int DeudorId, int AcreedorId, decimal Monto);

    
    public class SaldoPersonaDto
    {
        public int UsuarioId { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public decimal TotalGastos { get; set; }
        public decimal Saldo { get; set; }
    }

    public class DeudaEntrePersonasDto
    {
        public int DeudorId { get; set; }
        public string DeudorNombre { get; set; } = string.Empty;
        public int AcreedorId { get; set; }
        public string AcreedorNombre { get; set; } = string.Empty;
        public decimal Monto { get; set; }
    }

    public class ResumenGrupoDto
    {
        public decimal TotalGeneral { get; set; }
        public decimal PromedioPorPersona { get; set; }
        public List<SaldoPersonaDto> Cuadro1 { get; set; } = new();
        public List<DeudaEntrePersonasDto> Cuadro2 { get; set; } = new();
    }
}