import { useContext, useState } from "react";
import { toast } from "react-toastify";
import { VaquitaContext } from "../Context/VaquitaContext.js";

export default function ResumenPage() {
  const { grupoActivo, resumen, saldarDeuda, cerrarGrupo } = useContext(VaquitaContext);

  // Estados para los modales de Bootstrap
  const [deudaSeleccionada, setDeudaSeleccionada] = useState(null);
  const [montoPago, setMontoPago] = useState("");
  const [mostrarModalCerrar, setMostrarModalCerrar] = useState(false);

  if (!grupoActivo) {
    return (
      <div className="container text-center mt-5">
        <h4>Seleccioná un grupo activo para ver su resumen</h4>
      </div>
    );
  }

  const totalGeneral = Number(resumen?.totalGeneral ?? 0);
  const promedioPorPersona = Number(resumen?.promedioPorPersona ?? 0);
  const cuadro1 = resumen?.cuadro1 ?? [];
  const cuadro2 = resumen?.cuadro2 ?? [];

  const abrirModalSaldar = (deuda) => {
    const deudaMaxima = Math.round(Number(deuda.monto ?? 0) * 100) / 100;
    setDeudaSeleccionada({ ...deuda, montoMaximo: deudaMaxima });
    setMontoPago(deudaMaxima.toFixed(2));
  };

  const confirmarPago = async (e) => {
    e.preventDefault();
    if (!deudaSeleccionada) return;

    const monto = Math.round(parseFloat(montoPago) * 100) / 100;
    if (isNaN(monto) || monto <= 0 || monto > deudaSeleccionada.montoMaximo) {
      toast.warning("Ingresá un monto válido menor o igual a la deuda.");
      return;
    }

    const ok = await saldarDeuda(deudaSeleccionada.deudorId, deudaSeleccionada.acreedorId, monto);
    if (ok) {
      toast.success("Pago registrado");
      setDeudaSeleccionada(null);
    } else {
      toast.error("No se pudo registrar el pago");
    }
  };

  const confirmarCerrarGrupo = async () => {
    const res = await cerrarGrupo();
    setMostrarModalCerrar(false);
    if (res.ok) {
      toast.success(res.mensaje);
    } else {
      toast.error(res.mensaje);
    }
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Resumen: {grupoActivo.descripcion}</h3>
        <button onClick={() => setMostrarModalCerrar(true)} className="btn btn-danger">
          Cerrar Grupo
        </button>
      </div>

      <div className="alert alert-secondary d-flex justify-content-around">
        <div>
          <strong>Total Gastado:</strong> ${totalGeneral.toFixed(2)}
        </div>
        <div>
          <strong>Promedio por persona:</strong> ${promedioPorPersona.toFixed(2)}
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-6 mb-4">
          <h5>Cuadro 1: Balance por integrante</h5>
          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th>Integrante</th>
                <th className="text-end">Pagó</th>
                <th className="text-end">Saldo Neto</th>
              </tr>
            </thead>
            <tbody>
              {cuadro1.map((item) => {
                const pagado = Number(item.totalGastos ?? 0);
                const saldo = Number(item.saldo ?? 0);
                return (
                  <tr key={item.usuarioId}>
                    <td>{item.nombre}</td>
                    <td className="text-end">${pagado.toFixed(2)}</td>
                    <td
                      className={`text-end fw-bold ${
                        saldo > 0
                          ? "text-success"
                          : saldo < 0
                          ? "text-danger"
                          : "text-muted"
                      }`}
                    >
                      {saldo > 0 ? `+ $${saldo.toFixed(2)}` : `$${saldo.toFixed(2)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="col-md-6 mb-4">
          <h5>Cuadro 2: Quién le debe a quién</h5>
          {cuadro2.length === 0 ? (
            <div className="alert alert-success">
              ¡Todas las cuentas están saldadas! Ya podés cerrar el grupo.
            </div>
          ) : (
            <table className="table table-bordered align-middle">
              <thead className="table-light">
                <tr>
                  <th>Deudor</th>
                  <th>Acreedor</th>
                  <th className="text-end">Monto</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cuadro2.map((d, idx) => (
                  <tr key={idx}>
                    <td>{d.deudorNombre}</td>
                    <td>{d.acreedorNombre}</td>
                    <td className="text-end fw-bold">${Number(d.monto ?? 0).toFixed(2)}</td>
                    <td className="text-center">
                      <button
                        onClick={() => abrirModalSaldar(d)}
                        className="btn btn-sm btn-outline-success"
                      >
                        Saldar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Bootstrap: Registrar transferencia / saldar deuda */}
      {deudaSeleccionada && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow">
              <div className="modal-header">
                <h5 className="modal-title">Registrar transferencia</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDeudaSeleccionada(null)}
                ></button>
              </div>
              <form onSubmit={confirmarPago}>
                <div className="modal-body">
                  <p className="mb-2">
                    <strong>{deudaSeleccionada.deudorNombre}</strong> le transfiere a{" "}
                    <strong>{deudaSeleccionada.acreedorNombre}</strong>
                  </p>
                  <label className="form-label small text-muted">
                    Monto a transferir (máximo ${deudaSeleccionada.montoMaximo.toFixed(2)}):
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={deudaSeleccionada.montoMaximo}
                      className="form-control"
                      value={montoPago}
                      onChange={(e) => setMontoPago(e.target.value)}
                      autoFocus
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setDeudaSeleccionada(null)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-success">
                    Confirmar pago
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Bootstrap: Confirmar cierre de grupo */}
      {mostrarModalCerrar && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow">
              <div className="modal-header">
                <h5 className="modal-title">Cerrar grupo</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setMostrarModalCerrar(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p className="mb-0">
                  ¿Seguro que querés cerrar <strong>{grupoActivo.descripcion}</strong> definitivamente?
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setMostrarModalCerrar(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={confirmarCerrarGrupo}
                >
                  Sí, cerrar grupo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}