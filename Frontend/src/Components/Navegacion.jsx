import { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { VaquitaContext } from "../Context/VaquitaContext.js";

export default function Navegacion() {
  const { usuario, cerrarSesion, grupos, grupoActivo, setUltimoGrupoId, crearGrupo } =
    useContext(VaquitaContext);
  const [nuevoGrupo, setNuevoGrupo] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const location = useLocation();

  if (!usuario) return null;

  const handleCrear = async (e) => {
    e.preventDefault();
    if (!nuevoGrupo.trim()) return;
    await crearGrupo(nuevoGrupo.trim());
    setNuevoGrupo("");
    setMostrarForm(false);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4 px-3">
      <Link className="navbar-brand fw-bold" to="/gastos">
         Vaquita
      </Link>

      <div className="d-flex align-items-center gap-2 me-auto">
        <select
          className="form-select form-select-sm"
          style={{ minWidth: "180px" }}
          value={grupoActivo?.id || ""}
          onChange={(e) => setUltimoGrupoId(Number(e.target.value))}
        >
          <option value="" disabled>
            Seleccionar grupo...
          </option>
          {grupos.map((g) => (
            <option key={g.id} value={g.id}>
              {g.descripcion}
            </option>
          ))}
        </select>

        <button
          className="btn btn-sm btn-outline-success"
          onClick={() => setMostrarForm(!mostrarForm)}
          title="Nuevo grupo"
        >
          + Grupo
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={handleCrear} className="d-flex gap-1 me-3">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Nombre del grupo..."
            value={nuevoGrupo}
            onChange={(e) => setNuevoGrupo(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-sm btn-success">
            Crear
          </button>
        </form>
      )}

      <div className="navbar-nav flex-row gap-3 align-items-center">
        <Link
          className={`nav-link ${location.pathname === "/gastos" ? "active fw-bold" : ""}`}
          to="/gastos"
        >
          Gastos
        </Link>
        <Link
          className={`nav-link ${location.pathname === "/resumen" ? "active fw-bold" : ""}`}
          to="/resumen"
        >
          Resumen
        </Link>
        <span className="text-light small ms-2">
          Hola, <strong>{usuario.apodo || usuario.nombre}</strong>
        </span>
        <button onClick={cerrarSesion} className="btn btn-sm btn-outline-danger ms-2">
          Salir
        </button>
      </div>
    </nav>
  );
}