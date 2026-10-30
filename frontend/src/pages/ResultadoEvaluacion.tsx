import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import api from '../services/api';

const ResultadoEvaluacion: React.FC = () => {
  const { evaluacionId } = useParams();
  const navigate = useNavigate();
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/evaluaciones/${evaluacionId}/mi-resultado`);
        setResultado(res.data);
      } catch (e: any) {
        setError(e.response?.data?.error || 'No se pudo cargar el resultado');
      } finally {
        setLoading(false);
      }
    })();
  }, [evaluacionId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto p-6">
        <button onClick={() => navigate('/dashboard')} className="mb-6 px-4 py-2 bg-gray-600 text-white rounded">← Atrás</button>

        {loading && <p>Cargando...</p>}
        {!loading && error && <p className="text-red-600">{error}</p>}

        {!loading && resultado && !resultado.publicada && (
          <div className="bg-yellow-50 border border-yellow-300 p-6 rounded">
            <h1 className="text-xl font-bold mb-2">{resultado.titulo}</h1>
            <p>El docente aún no ha publicado tu calificación. Vuelve a revisar más tarde.</p>
          </div>
        )}

        {!loading && resultado && resultado.publicada && (
          <>
            <h1 className="text-2xl font-bold mb-4">{resultado.titulo}</h1>
            <div className="bg-green-50 border border-green-300 p-6 rounded mb-6 text-center">
              <p className="text-sm text-gray-600">Calificación final</p>
              <p className="text-4xl font-bold text-green-700">{resultado.puntaje_final} / {resultado.puntaje_total}</p>
              {resultado.fecha_publicacion && (
                <p className="text-xs text-gray-500 mt-2">
                  Publicada el {new Date(resultado.fecha_publicacion).toLocaleDateString('es-CO')}
                </p>
              )}
            </div>

            <div className="space-y-4">
              {resultado.items.map((it: any) => (
                <div
                  key={it.pregunta_id}
                  className="bg-white p-4 rounded shadow border-l-4"
                  style={{ borderColor: it.correcta === true ? '#22c55e' : it.correcta === false ? '#ef4444' : '#d1d5db' }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold flex-1">{it.numero}. {it.enunciado}</p>
                    <span className="ml-4 text-sm font-bold whitespace-nowrap">{it.puntaje} / {it.puntaje_maximo}</span>
                  </div>
                  <p className="text-sm">Tu respuesta: <strong>{it.respuesta}</strong></p>
                  {it.correcta !== null && (
                    <p className={`text-sm font-bold mt-1 ${it.correcta ? 'text-green-600' : 'text-red-600'}`}>
                      {it.correcta ? '✓ Correcta' : '✗ Incorrecta'}
                    </p>
                  )}
                  {it.respuesta_correcta && (
                    <div className="mt-3 p-3 bg-green-50 rounded text-sm">
                      <p className="font-bold mb-1">Respuesta correcta</p>
                      <p>{it.respuesta_correcta}</p>
                    </div>
                  )}
                  {it.respuesta_esperada && (
                    <div className="mt-3 p-3 bg-green-50 rounded text-sm">
                      <p className="font-bold mb-1">Respuesta esperada</p>
                      <p className="whitespace-pre-wrap">{it.respuesta_esperada}</p>
                    </div>
                  )}
                  {it.retroalimentacion && (
                    <div className="mt-3 p-3 bg-blue-50 rounded text-sm">
                      <p className="font-bold mb-1">Comentario del docente</p>
                      <p className="whitespace-pre-wrap">{it.retroalimentacion}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ResultadoEvaluacion;
