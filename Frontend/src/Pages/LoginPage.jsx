import { useState, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { VaquitaContext } from "../Context/VaquitaContext.js";

export default function LoginPage() {
  const { altaUsuario } = useContext(VaquitaContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ nombre: "", apellido: "", apodo: "", email: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await altaUsuario(form);
      toast.success("¡Bienvenido a Vaquita!");
      const destino = searchParams.get("redirect") || "/gastos";
      navigate(destino, { replace: true });
    } catch {
      toast.error("Error al registrar usuario");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "450px" }}>
      <div className="card shadow-sm p-4">
        <h3 className="text-center mb-3">🐮 Ingresar a Vaquita</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              className="form-control"
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </div>
          <div className="mb-2">
            <label className="form-label">Apellido</label>
            <input
              type="text"
              className="form-control"
              required
              value={form.apellido}
              onChange={(e) => setForm({ ...form, apellido: e.target.value })}
            />
          </div>
          <div className="mb-2">
            <label className="form-label">Apodo (Visible en el grupo)</label>
            <input
              type="text"
              className="form-control"
              required
              value={form.apodo}
              onChange={(e) => setForm({ ...form, apodo: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-success w-100">
            Continuar
          </button>
        </form>
      </div>
    </div>
  );
}