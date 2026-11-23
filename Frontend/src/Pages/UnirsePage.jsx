import { useContext, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { VaquitaContext } from "../Context/VaquitaContext.js";

export default function UnirsePage() {
  const { grupoId } = useParams();
  const { usuario, unirseAGrupo } = useContext(VaquitaContext);
  const navigate = useNavigate();
  const yaEjecuto = useRef(false);

  useEffect(() => {
    if (!usuario) {
      navigate(`/login?redirect=/unirse/${grupoId}`, { replace: true });
      return;
    }

    if (yaEjecuto.current) return;
    yaEjecuto.current = true;

    const procesarUnion = async () => {
      const ok = await unirseAGrupo(grupoId);
      if (ok) {
        toast.success("Te uniste al grupo");
      } else {
        toast.error("No se pudo unir al grupo (puede que esté cerrado o no exista)");
      }
      navigate("/gastos", { replace: true });
    };

    procesarUnion();
  }, [usuario, grupoId, unirseAGrupo, navigate]);

  return (
    <div className="container text-center mt-5">
      <h5>Uniéndote al grupo...</h5>
    </div>
  );
}