namespace Backend.Models
{
    public class Grupo
    {
        public int Id { get; set; }
        public string Descripcion { get; set; } = string.Empty;
        public bool Activo { get; set; } = true;

        public List<Usuario> Integrantes { get; set; } = new();
        public List<Gasto> Gastos { get; set; } = new();
    }
}