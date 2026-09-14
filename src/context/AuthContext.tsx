import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: 'admin' | 'docente' | 'estudiante';
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  loading: boolean;
  login: (email: string, contraseña: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUsuario = localStorage.getItem('usuario');
    
    if (storedToken && storedUsuario) {
      setToken(storedToken);
      setUsuario(JSON.parse(storedUsuario));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, contraseña: string) => {
    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        email,
        contraseña,
      });

      const { token: newToken, usuario: newUsuario } = response.data;
      
      setToken(newToken);
      setUsuario(newUsuario);
      
      localStorage.setItem('token', newToken);
      localStorage.setItem('usuario', JSON.stringify(newUsuario));
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  };

  const value: AuthContextType = {
    usuario,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token && !!usuario,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
