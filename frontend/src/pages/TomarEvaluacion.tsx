import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import api from '../services/api';

const TomarEvaluacion: React.FC = () => {
  const { evaluacionId } = useParams();
  const navigate = useNavigate();
  const [evaluacion, setEvaluacion] = useState<any>(null);
  const [preguntas, setPreguntas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondiendo, setRespondiendo] = useState(false);
  const [respuestas, setRespuestas] = useState<any>({});
  const [contraseña, setContraseña] = useState('');
  const [validada, setValidada] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const evalRes = await api.get(`/evaluaciones/${evaluacionId}`);
        setEvaluacion(evalRes.data);
        
        if (!evalRes.data.contraseña) {
          setValidada(true);
        }
        
        const pregRes = await api.get(`/evaluaciones/${evaluacionId}/preguntas`);
        setPreguntas(pregRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [evaluacionId]);

  const handleValidarContraseña = async (e: any) => {
    e.preventDefault();
    try {
      await api.post(`/evaluaciones/${evaluacionId}/verificar-password`, { contraseña });
      setValidada(true);
    } catch (e: any) {
      alert('Contraseña incorrecta');
    }
  };

  const handleRespuesta = (preguntaId: number, valor: string) => {
    setRespuestas({...respuestas, [preguntaId]: valor});
  };

  const handleEnviar = async () => {
    try {
      const payload = {
        respuestas: Object.entries(respuestas).map(([k, v]) => ({
          pregunta_id: parseInt(k),
          respuesta_texto: v
        }))
      };
      await api.post(`/evaluaciones/${evaluacionId}/enviar`, payload);
      alert('Evaluación enviada correctamente');
      navigate('/dashboard');
    } catch (e: any) {
      alert('Error: ' + e.response?.data?.error || e.message);
    }
  };

  if (loading) return <div className="p-6">Cargando...</div>;

  if (!validada) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto p-6">
          <button onClick={() => navigate('/dashboard')} className="mb-6 px-4 py-2 bg-gray-600 text-white rounded">← Atrás</button>
          <div className="bg-white p-8 rounded shadow">
            <h1 className="text-2xl font-bold mb-4">{evaluacion?.titulo}</h1>
            <p className="text-gray-600 mb-6">{evaluacion?.descripcion}</p>
            
            {evaluacion?.contraseña ? (
              <form onSubmit={handleValidarContraseña} className="space-y-4">
                <div>
                  <label className="block font-bold mb-2">Contraseña requerida</label>
                  <input
                    type="password"
                    value={contraseña}
                    onChange={(e) => setContraseña(e.target.value)}
                    required
                    className="w-full p-3 border rounded"
                    placeholder="Ingresa la contraseña"
                  />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded font-bold">
                  Verificar Contraseña
                </button>
              </form>
            ) : (
              <button onClick={() => setValidada(true)} className="w-full bg-blue-600 text-white px-4 py-2 rounded font-bold">
                Comenzar Evaluación
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (respondiendo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto p-6">
          <button onClick={() => navigate('/dashboard')} className="mb-6 px-4 py-2 bg-gray-600 text-white rounded">← Atrás</button>
          <h1 className="text-2xl font-bold mb-8">{evaluacion?.titulo}</h1>
          <div className="space-y-6">
            {preguntas.map((p, idx) => (
              <div key={p.id} className="bg-white p-6 rounded shadow">
                <p className="font-bold mb-4">{idx + 1}. {p.enunciado}</p>
                {p.tipo === 'seleccion_multiple' ? (
                  <div className="space-y-2">
                    {p.opciones?.map((opt: any) => (
                      <label key={opt.id} className="flex items-center">
                        <input
                          type="radio"
                          name={`pregunta_${p.id}`}
                          value={opt.id}
                          onChange={(e) => handleRespuesta(p.id, e.target.value)}
                          className="mr-2"
                        />
                        {opt.contenido}
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea
                    value={respuestas[p.id] || ''}
                    onChange={(e) => handleRespuesta(p.id, e.target.value)}
                    className="w-full p-2 border rounded h-20"
                  />
                )}
              </div>
            ))}
            <button onClick={handleEnviar} className="w-full bg-green-600 text-white px-4 py-3 rounded font-bold">
              Enviar Evaluación
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto p-6">
        <button onClick={() => navigate('/dashboard')} className="mb-6 px-4 py-2 bg-gray-600 text-white rounded">← Atrás</button>
        <div className="bg-white p-8 rounded shadow text-center">
          <h1 className="text-3xl font-bold mb-4">{evaluacion?.titulo}</h1>
          <p className="text-gray-600 mb-6">{evaluacion?.descripcion}</p>
          <button onClick={() => setRespondiendo(true)} className="bg-blue-600 text-white px-6 py-3 rounded font-bold">
            Comenzar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TomarEvaluacion;
