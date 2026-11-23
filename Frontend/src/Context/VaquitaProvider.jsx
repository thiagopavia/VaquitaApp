import { useState, useEffect, useCallback } from "react";
import useLocalStorage from "../Hooks/useLocalStorage.js";
import { VaquitaContext } from "./VaquitaContext.js";

const API_URL = "https://vaquitaapp.onrender.com/api";

export function VaquitaProvider({ children }) {
  const [usuario, setUsuario] = useLocalStorage("vaquita_user", null);
  const [token, setToken] = useLocalStorage("vaquita_token", null);
  const [ultimoGrupoId, setUltimoGrupoId] = useLocalStorage("vaquita_ultimo_grupo", null);

  const [grupos, setGrupos] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [resumen, setResumen] = useState({ totalGeneral: 0, promedioPorPersona: 0, cuadro1: [], cuadro2: [] });

  // Helper para enviar siempre el JWT y Content-Type en cada request protegida
  const authHeaders = useCallback(
    (conJson = false) => ({
      ...(conJson ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  const cargarGrupos = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/Grupos/activos`, {
        headers: authHeaders(),
      });
      if (!res.ok) return;
      const data = await res.json();
      setGrupos(data);

      if (data.length === 0) {
        setUltimoGrupoId(null);
        setGastos([]);
        setResumen({ totalGeneral: 0, promedioPorPersona: 0, cuadro1: [], cuadro2: [] });
      } else if (!ultimoGrupoId || !data.some((g) => g.id === Number(ultimoGrupoId))) {
        setUltimoGrupoId(data[0].id);
      }
    } catch (err) {
      console.error("Error cargando grupos", err);
    }
  }, [authHeaders, ultimoGrupoId, setUltimoGrupoId]);

  const cargarDatosGrupo = useCallback(
    async (grupoId) => {
      if (!grupoId) return;
      try {
        const [resGastos, resResumen] = await Promise.all([
          fetch(`${API_URL}/Gastos/grupo/${grupoId}`, { headers: authHeaders() }),
          fetch(`${API_URL}/Gastos/resumen/${grupoId}`, { headers: authHeaders() }),
        ]);
        if (resGastos.ok) setGastos(await resGastos.json());
        if (resResumen.ok) setResumen(await resResumen.json());
      } catch (err) {
        console.error("Error cargando datos del grupo", err);
      }
    },
    [authHeaders]
  );

  useEffect(() => {
    if (!usuario || !token) return;
    const inicializarGrupos = async () => {
      await cargarGrupos();
    };
    inicializarGrupos();
  }, [usuario, token, cargarGrupos]);

  useEffect(() => {
    if (!ultimoGrupoId || !token) return;
    if (!grupos.some((g) => g.id === Number(ultimoGrupoId))) return;

    const inicializarDatos = async () => {
      await cargarDatosGrupo(ultimoGrupoId);
    };
    inicializarDatos();
  }, [ultimoGrupoId, token, grupos, cargarDatosGrupo]);

  const grupoActivo = grupos.find((g) => g.id === Number(ultimoGrupoId)) || null;

  const altaUsuario = async (datos) => {
    const res = await fetch(`${API_URL}/Usuarios/alta`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    if (!res.ok) throw new Error("Error en el alta de usuario");
    const data = await res.json();
    setUsuario(data.usuario);
    setToken(data.token);
  };

  const crearGrupo = async (descripcion) => {
    const res = await fetch(`${API_URL}/Grupos`, {
      method: "POST",
      headers: authHeaders(true),
      body: JSON.stringify({ descripcion, creadorId: usuario.id }),
    });
    if (res.ok) {
      const nuevo = await res.json();
      await cargarGrupos();
      setUltimoGrupoId(nuevo.id);
    }
  };

  const unirseAGrupo = async (grupoId) => {
    if (!usuario) return false;
    const res = await fetch(`${API_URL}/Grupos/${grupoId}/unirse/${usuario.id}`, {
      method: "POST",
      headers: authHeaders(),
    });
    if (res.ok) {
      await cargarGrupos();
      setUltimoGrupoId(Number(grupoId));
      return true;
    }
    return false;
  };

  const agregarGasto = async (gasto) => {
    const res = await fetch(`${API_URL}/Gastos`, {
      method: "POST",
      headers: authHeaders(true),
      body: JSON.stringify({ ...gasto, grupoId: grupoActivo.id }),
    });
    if (res.ok) await cargarDatosGrupo(grupoActivo.id);
    return res.ok;
  };

  const eliminarGasto = async (gastoId) => {
    const res = await fetch(`${API_URL}/Gastos/${gastoId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (res.ok) await cargarDatosGrupo(grupoActivo.id);
    return res.ok;
  };

  const saldarDeuda = async (deudorId, acreedorId, monto) => {
    const res = await fetch(`${API_URL}/Gastos/saldar`, {
      method: "POST",
      headers: authHeaders(true),
      body: JSON.stringify({ grupoId: grupoActivo.id, deudorId, acreedorId, monto }),
    });
    if (res.ok) await cargarDatosGrupo(grupoActivo.id);
    return res.ok;
  };

  const cerrarGrupo = async () => {
    const res = await fetch(`${API_URL}/Grupos/${grupoActivo.id}/cerrar`, {
      method: "POST",
      headers: authHeaders(),
    });
    const data = await res.json();
    if (res.ok) {
      setUltimoGrupoId(null);
      await cargarGrupos();
    }
    return { ok: res.ok, mensaje: data.mensaje || data };
  };

  const cerrarSesion = () => {
    setUsuario(null);
    setToken(null);
    setUltimoGrupoId(null);
    setGrupos([]);
    setGastos([]);
    setResumen({ totalGeneral: 0, promedioPorPersona: 0, cuadro1: [], cuadro2: [] });
  };

  return (
    <VaquitaContext.Provider
      value={{
        usuario,
        token,
        altaUsuario,
        cerrarSesion,
        grupos,
        grupoActivo,
        setUltimoGrupoId,
        crearGrupo,
        unirseAGrupo,
        gastos,
        resumen,
        agregarGasto,
        eliminarGasto,
        saldarDeuda,
        cerrarGrupo,
      }}
    >
      {children}
    </VaquitaContext.Provider>
  );
}