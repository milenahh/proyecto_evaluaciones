import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardEstudiante from './pages/DashboardEstudiante';
import DashboardDocente from './pages/DashboardDocente';
import TomarEvaluacion from './pages/TomarEvaluacion';
import CrearParcial from './pages/CrearParcial';
import AgregarPreguntas from './pages/AgregarPreguntas';
import AdminPanel from './pages/AdminPanel';
import ProtectedRouteWrapper from './components/ProtectedRouteWrapper';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRouteWrapper />} />
          <Route path="/dashboard" element={<ProtectedRouteWrapper><DashboardEstudiante /></ProtectedRouteWrapper>} />
          <Route path="/docente/dashboard" element={<ProtectedRouteWrapper><DashboardDocente /></ProtectedRouteWrapper>} />
          <Route path="/evaluacion/:evaluacionId" element={<ProtectedRouteWrapper><TomarEvaluacion /></ProtectedRouteWrapper>} />
          <Route path="/docente/crear-parcial" element={<ProtectedRouteWrapper><CrearParcial /></ProtectedRouteWrapper>} />
          <Route path="/docente/parcial/:parcialId/preguntas" element={<ProtectedRouteWrapper><AgregarPreguntas /></ProtectedRouteWrapper>} />
          <Route path="/admin" element={<ProtectedRouteWrapper><AdminPanel /></ProtectedRouteWrapper>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
