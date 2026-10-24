import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import api from '../services/api';

interface Evaluacion {
  id: number;
  titulo: string;
  descripcion: string;
  puntaje_total: number;
  tiempo_limite_minutos: number;
}

interface RespuestaEstudiante {
  id: number;
  evaluacion_id: number;
}

interface Calificacion {
  puntaje_final: number;
  puntaje_obtenido: number;
  puntaje_manual_total: number;
  fecha_calificacion_completa: string;
}

export default function DashboardEstudiante() {
  const navigate = useNavigate();
  const [evals, setEvals] = useState<Evaluacion[]>([]);
  const [respondidas, setRespondidas] = useState<Map<number, RespuestaEstudiante>>(new Map());
  const [calificaciones, setCalificaciones] = useState<Map<number, Calificacion>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvaluaciones = async () => {
      try {
        const response = await api.get('/evaluaciones');
        const data = response.data;
        setEvals(data);

        const respondidas_map = new Map<number, RespuestaEstudiante>();
        const calificaciones_map = new Map<number, Calificacion>();

        for (const evaluacion of data) {
          try {
            const respResponse = await api.get(`/evaluaciones/${evaluacion.id}/mis-respuestas`);
            const respData = respResponse.data;

            if (respData.length > 0) {
              const respuesta = respData[0];
              respondidas_map.set(evaluacion.id, respuesta);

              try {
                const calResponse = await api.get(`/evaluaciones/${evaluacion.id}/respuesta/${respuesta.id}/calificacion`);
                calificaciones_map.set(evaluacion.id, calResponse.data);
              } catch (error) {
                console.log(`No hay calificación aún para evaluación ${evaluacion.id}`);
              }
            }
          } catch (error) {
            console.error(`Error obteniendo respuestas para evaluación ${evaluacion.id}:`, error);
          }
        }

        setRespondidas(respondidas_map);
        setCalificaciones(calificaciones_map);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching evaluaciones:', error);
        setLoading(false);
      }
    };

    fetchEvaluaciones();
  }, []);

  const handleTomarEvaluacion = (evalId: number) => {
    navigate(`/evaluacion/${evalId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">Cargando evaluaciones...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Mis Evaluaciones</h1>
        
        {evals.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
            No hay evaluaciones disponibles
          </div>
        ) : (
          <div className="grid gap-6">
            {evals.map((evaluacion) => {
              const respondida = respondidas.has(evaluacion.id);
              const calificacion = calificaciones.get(evaluacion.id);

              return (
                <div key={evaluacion.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900">{evaluacion.titulo}</h2>
                      <p className="text-gray-600 mt-1">{evaluacion.descripcion}</p>
                      <div className="flex gap-4 mt-3 text-sm text-gray-500">
                        <span>⏱ {evaluacion.tiempo_limite_minutos} minutos</span>
                        <span>📊 Puntaje total: {evaluacion.puntaje_total}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      {respondida && calificacion ? (
                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="text-sm text-gray-600 mb-1">Calificación</div>
                          <div className="text-3xl font-bold text-green-600">
                            {calificacion.puntaje_final}/{evaluacion.puntaje_total}
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            {new Date(calificacion.fecha_calificacion_completa).toLocaleDateString('es-CO')}
                          </div>
                        </div>
                      ) : respondida ? (
                        <div className="bg-yellow-50 rounded-lg p-4">
                          <div className="text-sm text-yellow-700 font-semibold">Pendiente calificación</div>
                          <div className="text-xs text-yellow-600 mt-2">El docente aún no termina de calificar</div>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {!respondida && (
                      <button
                        onClick={() => handleTomarEvaluacion(evaluacion.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        Tomar Evaluación
                      </button>
                    )}
                    {respondida && !calificacion && (
                      <button
                        disabled
                        className="px-4 py-2 bg-gray-300 text-gray-600 rounded cursor-not-allowed"
                      >
                        Ya respondida
                      </button>
                    )}
                    {calificacion && (
                      <button
                        onClick={() => navigate(`/evaluacion/${evaluacion.id}/resultado`)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                      >
                        Ver Detalles
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
