import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardEstudiante from './pages/DashboardEstudiante';
import DashboardDocente from './pages/DashboardDocente';
import DashboardAdmin from './pages/DashboardAdmin';
import ListarEvaluacionesEstudiante from './pages/ListarEvaluacionesEstudiante';
import TomarEvaluacion from './pages/TomarEvaluacion';
import GestionarEvaluaciones from './pages/GestionarEvaluaciones';
import './styles/index.css';

function AppRoutes() {
  const { usuario } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {usuario?.rol === 'estudiante' ? (
              <DashboardEstudiante />
            ) : usuario?.rol === 'docente' ? (
              <DashboardDocente />
            ) : usuario?.rol === 'admin' ? (
              <DashboardAdmin />
            ) : (
              <div>Dashboard desconocido</div>
            )}
          </ProtectedRoute>
        }
      />
      <Route path="/mis-evaluaciones" element={<ProtectedRoute><ListarEvaluacionesEstudiante /></ProtectedRoute>} />
      <Route path="/evaluacion/:evaluacionId" element={<ProtectedRoute><TomarEvaluacion /></ProtectedRoute>} />
      <Route path="/gestionar-evaluaciones" element={<ProtectedRoute><GestionarEvaluaciones /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
