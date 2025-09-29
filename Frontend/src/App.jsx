import { BrowserRouter as Router, Routes, Route /*, Navigate*/ } from "react-router-dom";
import SeccionesPage from "./paginas/SeccionesPage";
import AsignacionGruposPage from "./paginas/AsignacionGruposPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Opción 1 (implementada): mostrar directamente AsignacionGruposPage en la raíz */}
        <Route path="/" element={<AsignacionGruposPage />} />

        {/* Ruta adicional para acceder a Secciones */}
        <Route path="/secciones" element={<SeccionesPage />} />

        {/* Opción 2 (alternativa): si prefieres que la URL sea /asignacion al iniciar,
            descomenta la línea siguiente y cambia la ruta raíz anterior por la redirección.
            <Route path="/" element={<Navigate to="/asignacion" replace />} />
        */}
        <Route path="/asignacion" element={<AsignacionGruposPage />} />
      </Routes>
    </Router>
  );
}

export default App;
