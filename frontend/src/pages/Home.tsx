import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  useEffect(() => {
    console.log('Home - Usuario:', usuario);
    console.log('Home - Rol:', usuario?.rol);
    
    if (!usuario) {
      navigate('/login');
    } else if (usuario.rol === 'docente' || usuario.rol === 'admin') {
      console.log('Yendo a docente/dashboard');
      navigate('/docente/dashboard');
    } else {
      console.log('Yendo a dashboard estudiante');
      navigate('/dashboard');
    }
  }, [usuario, navigate]);

  return <div>Cargando...</div>;
};

export default Home;
