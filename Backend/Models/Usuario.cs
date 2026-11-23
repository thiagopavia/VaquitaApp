namespace Backend.Models
{
    public class Usuario
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public string Apellido { get; set; } = string.Empty;
        public string Apodo { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        public List<Grupo> Grupos { get; set; } = new();
    }
}