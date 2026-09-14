import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

interface Evaluacion {
  id: string;
  titulo: string;
  asignatura: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'borrador' | 'publicada' | 'finalizada';
  totalPreguntas: number;
  totalEstudiantes: number;
}

const GestionarEvaluaciones: React.FC = () => {
  const navigate = useNavigate();
  const [evaluaciones] = useState<Evaluacion[]>([]);
  const [filterEstado, setFilterEstado] = useState<string>('todos');

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'borrador':
        return 'bg-yellow-100 text-yellow-800';
      case 'publicada':
        return 'bg-green-100 text-green-800';
      case 'finalizada':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filtradas = filterEstado === 'todos' ? evaluaciones : evaluaciones.filter((e) => e.estado === filterEstado);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="Gestionar Evaluaciones" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Mis Evaluaciones</h2>
            <p className="text-gray-600 mt-2">Crea, edita y publica tus evaluaciones</p>
          </div>
          <Button label="Crear Nueva Evaluacion" onClick={() => navigate('/crear-evaluacion')} />
        </div>

        <Card>
          <div className="mb-4 flex space-x-3">
            <button
              onClick={() => setFilterEstado('todos')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                filterEstado === 'todos' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterEstado('borrador')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                filterEstado === 'borrador' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'
              }`}
            >
              Borrador
            </button>
            <button
              onClick={() => setFilterEstado('publicada')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                filterEstado === 'publicada' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'
              }`}
            >
              Publicada
            </button>
            <button
              onClick={() => setFilterEstado('finalizada')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                filterEstado === 'finalizada' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'
              }`}
            >
              Finalizada
            </button>
          </div>

          {filtradas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No hay evaluaciones en este estado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Titulo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Asignatura</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Preguntas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Estudiantes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtradas.map((evaluacion) => (
                    <tr key={evaluacion.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{evaluacion.titulo}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{evaluacion.asignatura}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{evaluacion.totalPreguntas}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{evaluacion.totalEstudiantes}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(evaluacion.estado)}`}>
                          {evaluacion.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2 flex">
                        <button className="text-blue-600 hover:text-blue-900 font-semibold">Editar</button>
                        <button className="text-red-600 hover:text-red-900 font-semibold">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default GestionarEvaluaciones;
