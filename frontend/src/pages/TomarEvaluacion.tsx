import React, { useState, useEffect, useRef } from 'react';
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
  const incidentesRef = useRef<{ tipo: string; hora: string }[]>([]);
  const ultimoRef = useRef(0);
  const [numIncidentes, setNumIncidentes] = useState(0);

  const registrarIncidente = (tipo: string) => {
    const ahora = Date.now();
    if (ahora - ultimoRef.current < 1000) return;
    ultimoRef.current = ahora;
    incidentesRef.current.push({ tipo, hora: new Date().toISOString() });
    setNumIncidentes(incidentesRef.current.length);
  };

  useEffect(() => {
    if (!respondiendo) return;
    const onVisibility = () => { if (document.hidden) registrarIncidente('Cambió de pestaña o minimizó'); };
    const onBlur = () => registrarIncidente('Salió de la ventana');
    const onFullscreen = () => { if (!document.fullscreenElement) registrarIncidente('Salió de pantalla completa'); };
    const bloquear = (e: Event) => e.preventDefault();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    document.addEventListener('fullscreenchange', onFullscreen);
    document.addEventListener('copy', bloquear);
    document.addEventListener('cut', bloquear);
    document.addEventListener('paste', bloquear);
    document.addEventListener('contextmenu', bloquear);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('fullscreenchange', onFullscreen);
      document.removeEventListener('copy', bloquear);
      document.removeEventListener('cut', bloquear);
      document.removeEventListener('paste', bloquear);
      document.removeEventListener('contextmenu', bloquear);
    };
  }, [respondiendo]);

  const comenzar = () => {
    setRespondiendo(true);
    document.documentElement.requestFullscreen?.().catch(() => {});
  };

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
        })),
        incidentes: incidentesRef.current
      };
      await api.post(`/evaluaciones/${evaluacionId}/enviar`, payload);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
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
          <h1 className="text-2xl font-bold mb-4">{evaluacion?.titulo}</h1>
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-900 p-3 rounded mb-6 text-sm">
            Esta evaluación está monitoreada: salir de la ventana o de pantalla completa queda registrado y lo verá el docente.
            {numIncidentes > 0 && <strong> Salidas registradas: {numIncidentes}</strong>}
          </div>
          <div className="space-y-6 select-none">
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
                    className="w-full p-2 border rounded h-20 select-text"
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
          <button onClick={comenzar} className="bg-blue-600 text-white px-6 py-3 rounded font-bold">
            Comenzar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TomarEvaluacion;
