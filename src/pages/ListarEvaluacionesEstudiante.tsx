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
  estado: 'disponible' | 'en_proceso' | 'finalizada';
  duracion: number;
}

const ListarEvaluacionesEstudiante: React.FC = () => {
  const navigate = useNavigate();
  const [evaluaciones] = useState<Evaluacion[]>([]);

  const handleIniciarEvaluacion = (evaluacionId: string) => {
    navigate(`/evaluacion/${evaluacionId}`);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'disponible':
        return 'bg-green-100 text-green-800';
      case 'en_proceso':
        return 'bg-blue-100 text-blue-800';
      case 'finalizada':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header title="Mis Evaluaciones" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Evaluaciones Disponibles</h2>
          <p className="text-gray-600 mt-2">Consulta y completa tus evaluaciones</p>
        </div>

        {evaluaciones.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No tienes evaluaciones disponibles en este momento</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {evaluaciones.map((evaluacion) => (
              <Card key={evaluacion.id}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{evaluacion.titulo}</h3>
                    <p className="text-sm text-gray-600 mt-1">{evaluacion.asignatura}</p>
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600">
                      <span>Inicio: {new Date(evaluacion.fecha_inicio).toLocaleDateString()}</span>
                      <span>Duracion: {evaluacion.duracion} minutos</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoColor(evaluacion.estado)}`}>
                        {evaluacion.estado}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-4">
                    <Button
                      label="Iniciar Evaluacion"
                      onClick={() => handleIniciarEvaluacion(evaluacion.id)}
                      disabled={evaluacion.estado !== 'disponible'}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ListarEvaluacionesEstudiante;
