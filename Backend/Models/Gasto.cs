namespace Backend.Models
{
    public class Gasto
    {
        public int Id { get; set; }
        public decimal Importe { get; set; }
        public string Descripcion { get; set; } = string.Empty;
        public string? Rubro { get; set; }
        public bool EsPagoDeuda { get; set; } = false;

        public int GrupoId { get; set; }
        public Grupo? Grupo { get; set; }

        public int PagadorId { get; set; }
        public Usuario? Pagador { get; set; }
    }
}