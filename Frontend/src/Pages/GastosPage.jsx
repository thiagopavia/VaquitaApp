import { useContext, useState } from "react";
import { toast } from "react-toastify";
import emailjs from "@emailjs/browser";
import { VaquitaContext } from "../Context/VaquitaContext.js";

// Reemplazá estos 3 valores con los de tu cuenta de EmailJS
const SERVICE_ID = "service_beq9904";
const TEMPLATE_ID = "template_qgytdm8";
const PUBLIC_KEY = "7HzpzuOl3CUjrvwup";

export default function GastosPage() {
  const { usuario, grupoActivo, gastos, agregarGasto } = useContext(VaquitaContext);
  const [descripcion, setDescripcion] = useState("");
  const [importe, setImporte] = useState("");
  const [rubro, setRubro] = useState("");
  const [pagadorId, setPagadorId] = useState("");

  const [emailInvitado, setEmailInvitado] = useState("");
  const [enviandoMail, setEnviandoMail] = useState(false);
  const [mostrarQR, setMostrarQR] = useState(false);

  if (!grupoActivo) {
    return (
      <div className="container text-center mt-5">
        <h4>No tenés ningún grupo activo seleccionado</h4>
        <p className="text-muted">Creá uno nuevo desde el botón "+ Grupo" en la barra superior.</p>
      </div>
    );
  }

  const linkInvitacion = `${window.location.origin}/unirse/${grupoActivo.id}`;

  const copiarLink = () => {
    navigator.clipboard.writeText(linkInvitacion);
    toast.info("Link de invitación copiado al portapapeles");
  };

  const handleInvitarMail = async (e) => {
    e.preventDefault();
    if (!emailInvitado.trim()) return;

    setEnviandoMail(true);
    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          to_email: emailInvitado.trim(),
          grupo_nombre: grupoActivo.descripcion,
          link_invitacion: linkInvitacion,
        },
        PUBLIC_KEY
      );
      toast.success(`Invitación enviada a ${emailInvitado}`);
      setEmailInvitado("");
    } catch (error) {
      console.error("Error al enviar email:", error);
      toast.error("No se pudo enviar el correo. Revisá tus claves de EmailJS.");
    } finally {
      setEnviandoMail(false);
    }
  };

  const formatearDescripcion = (desc) => {
    if (!desc) return "";
    const match = desc.match(/AcreedorId:(\d+)/);
    if (!match) return desc;

    const idAcreedor = Number(match[1]);
    const acreedor = grupoActivo.integrantes?.find((i) => i.id === idAcreedor);
    const nombre = acreedor ? (acreedor.apodo || acreedor.nombre) : `Usuario ${idAcreedor}`;

    return desc.replace(/AcreedorId:\d+/, nombre);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const idPagador = pagadorId ? Number(pagadorId) : usuario.id;
    const ok = await agregarGasto({
      descripcion,
      importe: parseFloat(importe),
      rubro,
      pagadorId: idPagador,
    });

    if (ok) {
      toast.success("Gasto registrado");
      setDescripcion("");
      setImporte("");
      setRubro("");
    } else {
      toast.error("No se pudo registrar el gasto");
    }
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h3 className="mb-0">{grupoActivo.descripcion}</h3>
          <small className="text-muted">
            Integrantes:{" "}
            {grupoActivo.integrantes?.map((i) => i.apodo || i.nombre).join(", ")}
          </small>
        </div>

        <div className="d-flex gap-2 flex-wrap align-items-center">
          <form onSubmit={handleInvitarMail} className="d-flex gap-1">
            <input
              type="email"
              className="form-control form-control-sm"
              placeholder="Email del invitado..."
              value={emailInvitado}
              onChange={(e) => setEmailInvitado(e.target.value)}
              required
            />
            <button
              type="submit"
              className="btn btn-sm btn-outline-danger"
              disabled={enviandoMail}
            >
              {enviandoMail ? "Enviando..." : "Invitar"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setMostrarQR(!mostrarQR)}
            className="btn btn-sm btn-outline-dark"
          >
            {mostrarQR ? "Ocultar QR" : "QR"}
          </button>

          <button onClick={copiarLink} className="btn btn-sm btn-outline-primary">
            Copiar link
          </button>
        </div>
      </div>

      {mostrarQR && (
        <div className="card mb-4 text-center p-3 shadow-sm">
          <h6 className="fw-bold mb-2">
            Escaneá para unirte a "{grupoActivo.descripcion}"
          </h6>
          <div>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(linkInvitacion)}`}
              alt="Código QR de invitación"
              className="img-thumbnail"
            />
          </div>
          <small className="text-muted mt-2">{linkInvitacion}</small>
        </div>
      )}

      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5 className="card-title">Cargar nuevo gasto</h5>
          <form onSubmit={handleSubmit} className="row g-2">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Descripción (ej: Asado)"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                required
              />
            </div>
            <div className="col-md-2">
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-control"
                placeholder="Importe ($)"
                value={importe}
                onChange={(e) => setImporte(e.target.value)}
                required
              />
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Rubro (opcional)"
                value={rubro}
                onChange={(e) => setRubro(e.target.value)}
              />
            </div>
            <div className="col-md-3 d-flex gap-2">
              <select
                className="form-select"
                value={pagadorId || usuario.id}
                onChange={(e) => setPagadorId(e.target.value)}
              >
                {grupoActivo.integrantes?.map((i) => (
                  <option key={i.id} value={i.id}>
                    Pagó: {i.apodo || i.nombre}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn btn-success">
                Agregar
              </button>
            </div>
          </form>
        </div>
      </div>

      <h5>Historial de movimientos</h5>
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>Descripción</th>
            <th>Rubro</th>
            <th>Pagó</th>
            <th className="text-end">Importe</th>
          </tr>
        </thead>
        <tbody>
          {gastos.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center text-muted">
                Todavía no hay gastos cargados en este grupo.
              </td>
            </tr>
          ) : (
            gastos.map((g) => (
              <tr key={g.id} className={g.esPagoDeuda ? "table-info" : ""}>
                <td>{formatearDescripcion(g.descripcion)}</td>
                <td>{g.rubro || "-"}</td>
                <td>{g.pagador}</td>
                <td className="text-end fw-bold">${g.importe.toFixed(2)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}