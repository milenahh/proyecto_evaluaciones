import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

interface Props {
  children?: React.ReactNode;
}

const ProtectedRouteWrapper: React.FC<Props> = ({ children }) => {
  const { usuario, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;

  if (!usuario) return <Navigate to="/login" />;

  if (!children) {
    if (usuario.rol === 'admin') {
      return <Navigate to="/admin" />;
    }
    if (usuario.rol === 'docente') {
      return <Navigate to="/docente/dashboard" />;
    }
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

export default ProtectedRouteWrapper;
