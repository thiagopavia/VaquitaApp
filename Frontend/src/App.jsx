import { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { VaquitaContext } from "./Context/VaquitaContext.js";
import { VaquitaProvider } from "./Context/VaquitaProvider.jsx";
import Navegacion from "./Components/Navegacion.jsx";
import LoginPage from "./Pages/LoginPage.jsx";
import GastosPage from "./Pages/GastosPage.jsx";
import ResumenPage from "./Pages/ResumenPage.jsx";
import UnirsePage from "./Pages/UnirsePage.jsx";

function RutasApp() {
  const { usuario } = useContext(VaquitaContext);

  return (
    <BrowserRouter>
      <Navegacion />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/gastos" element={usuario ? <GastosPage /> : <Navigate to="/login" />} />
        <Route path="/resumen" element={usuario ? <ResumenPage /> : <Navigate to="/login" />} />
        <Route path="/unirse/:grupoId" element={<UnirsePage />} />
        <Route path="*" element={<Navigate to={usuario ? "/gastos" : "/login"} />} />
      </Routes>
      <ToastContainer position="bottom-right" autoClose={2500} limit={1} />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <VaquitaProvider>
      <RutasApp />
    </VaquitaProvider>
  );
}