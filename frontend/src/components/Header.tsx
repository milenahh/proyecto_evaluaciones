import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-blue-600">TEINCO</h1>
          <span className="ml-4 text-gray-600">Dashboard {usuario?.rol}</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-900">{usuario?.nombre_completo}</span>
          <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
