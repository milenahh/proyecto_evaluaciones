import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import api from '../services/api';

type ViewLevel = 'evaluaciones' | 'estudiantes' | 'respuestas';

const DashboardDocente: React.FC = () => {
  const navigate = useNavigate();
  const [viewLevel, setViewLevel] = useState<ViewLevel>('evaluaciones');
  const [evaluaciones, setEvaluaciones] = useState<any[]>([]);
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [respuestasDetalle, setRespuestasDetalle] = useState<any>(null);
  const [preguntas, setPreguntas] = useState<any[]>([]);
  const [selectedEval, setSelectedEval] = useState<any>(null);
  const [puntajeAuto, setPuntajeAuto] = useState<any>(null);
  const [calificaciones, setCalificaciones] = useState<any>({});
  const [verArchivadas, setVerArchivadas] = useState(false);

  const cargarEvaluaciones = async () => {
    try {
      const res = await api.get('/evaluaciones');
      setEvaluaciones(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    cargarEvaluaciones();
  }, []);

  const handleSelectEval = async (evalId: number) => {
    const eval_data = evaluaciones.find(e => e.id === evalId);
    setSelectedEval(eval_data);
    const resp_data = await api.get(`/evaluaciones/${evalId}/respuestas`);
    setEstudiantes(resp_data.data);
    const preg_data = await api.get(`/evaluaciones/${evalId}/preguntas`);
    setPreguntas(preg_data.data);
    setViewLevel('estudiantes');
  };

  const handleSelectEstudiante = async (est: any) => {
    setRespuestasDetalle(est);
    
    try {
      const puntRes = await api.get(`/evaluaciones/${selectedEval.id}/respuesta/${est.id}/puntaje`);
      setPuntajeAuto(puntRes.data);
      setCalificaciones({});
    } catch (e) {
      console.error(e);
    }
    
    setViewLevel('respuestas');
  };

  const getOpcion = (pregId: number, opcionId: any) => {
    const preg = preguntas.find(p => p.id === pregId);
    const numId = parseInt(opcionId);
    if (!isNaN(numId) && preg?.opciones) return preg.opciones.find((o: any) => o.id === numId);
    return null;
  };

  const getRespuestaTexto = (r: any) => {
    if (!r.respuesta_texto) return 'Sin respuesta';
    const texto = r.respuesta_texto.trim();
    const numId = parseInt(texto);
    if (!isNaN(numId)) {
      const opcion = getOpcion(r.pregunta_id, numId);
      if (opcion) return opcion.contenido;
    }
    return texto;
  };

  const esCorrecta = (r: any) => {
    const preg = preguntas.find(p => p.id === r.pregunta_id);
    if (preg?.tipo !== 'seleccion_multiple') return null;
    const opcion = getOpcion(r.pregunta_id, r.respuesta_texto);
    return opcion?.es_correcta || false;
  };

  const handleCalificar = async (detalleId: number) => {
    try {
      const puntaje = calificaciones[detalleId];
      if (puntaje === undefined || puntaje === '') {
        alert('Ingresa un puntaje');
        return;
      }
      await api.post(`/evaluaciones/${selectedEval.id}/respuesta-detalle/${detalleId}/calificar`, { puntaje: parseFloat(puntaje) });
      alert('Calificación guardada');
      const puntRes = await api.get(`/evaluaciones/${selectedEval.id}/respuesta/${respuestasDetalle.id}/puntaje`);
      setPuntajeAuto(puntRes.data);
    } catch (e) {
      alert('Error');
    }
  };

  const handleBorrar = async () => {
    if (window.confirm('¿BORRAR esta respuesta?')) {
      try {
        await api.delete(`/evaluaciones/${selectedEval.id}/respuesta/${respuestasDetalle.id}`);
        const resp_data = await api.get(`/evaluaciones/${selectedEval.id}/respuestas`);
        setEstudiantes(resp_data.data);
        setViewLevel('estudiantes');
      } catch (e) {
        alert('Error');
      }
    }
  };

  const handleArchivar = async (evalId: number, archivada: boolean) => {
    try {
      await api.put(`/evaluaciones/${evalId}/archivar`, { archivada });
      await cargarEvaluaciones();
    } catch (e) {
      alert('Error al archivar');
    }
  };

  const handleDescargarExcel = async (evalId: number, titulo: string) => {
    try {
      const res = await api.get(`/evaluaciones/${evalId}/exportar`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(titulo || 'evaluacion').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '_')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert('Error al descargar el Excel');
    }
  };

  const handleEliminarParcial = async (evalId: number) => {
    if (window.confirm('¿ELIMINAR este parcial? Se borrarán todas las respuestas.')) {
      try {
        await api.delete(`/evaluaciones/${evalId}`);
        await cargarEvaluaciones();
      } catch (e) {
        alert('Error');
      }
    }
  };

  if (viewLevel === 'evaluaciones') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Evaluaciones</h1>
            <div className="flex gap-2">
              <button onClick={cargarEvaluaciones} className="bg-gray-600 text-white px-4 py-2 rounded font-bold">↻ Refrescar</button>
              <button onClick={() => navigate('/docente/crear-parcial')} className="bg-green-600 text-white px-4 py-2 rounded font-bold">+ Crear Parcial</button>
            </div>
          </div>
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setVerArchivadas(false)}
              className={`px-4 py-2 rounded font-bold ${!verArchivadas ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Activas ({evaluaciones.filter(e => !e.archivada).length})
            </button>
            <button
              onClick={() => setVerArchivadas(true)}
              className={`px-4 py-2 rounded font-bold ${verArchivadas ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              Archivadas ({evaluaciones.filter(e => e.archivada).length})
            </button>
          </div>
          {evaluaciones.filter(e => !!e.archivada === verArchivadas).length === 0 ? (
            <p className="text-gray-500">{verArchivadas ? 'Sin actividades archivadas' : 'Sin parciales activos'}</p>
          ) : (
            evaluaciones.filter(e => !!e.archivada === verArchivadas).map(e => (
              <div key={e.id} className="bg-white p-4 mb-3 rounded">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold cursor-pointer flex-1" onClick={() => handleSelectEval(e.id)}>{e.titulo}</h3>
                  <button onClick={() => handleDescargarExcel(e.id, e.titulo)} className="bg-emerald-600 text-white px-3 py-1 rounded text-sm mr-2">Excel</button>
                  <button onClick={() => handleArchivar(e.id, !verArchivadas)} className="bg-yellow-600 text-white px-3 py-1 rounded text-sm mr-2">
                    {verArchivadas ? 'Desarchivar' : 'Archivar'}
                  </button>
                  <button onClick={() => navigate(`/docente/parcial/${e.id}/preguntas`)} className="bg-blue-500 text-white px-3 py-1 rounded text-sm mr-2">Editar</button>
                  <button onClick={() => handleEliminarParcial(e.id)} className="bg-red-600 text-white px-3 py-1 rounded text-sm">Eliminar</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  if (viewLevel === 'estudiantes') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto p-6">
          <button onClick={() => setViewLevel('evaluaciones')} className="mb-6 px-4 py-2 bg-gray-600 text-white rounded">← Atrás</button>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">{selectedEval?.titulo}</h1>
            <button onClick={() => handleDescargarExcel(selectedEval.id, selectedEval.titulo)} className="bg-emerald-600 text-white px-4 py-2 rounded font-bold">Descargar Excel</button>
          </div>
          {estudiantes.length === 0 ? (
            <p className="text-gray-500">Sin respuestas</p>
          ) : (
            estudiantes.map(e => (
              <div key={e.id} className="bg-white p-4 mb-3 rounded cursor-pointer" onClick={() => handleSelectEstudiante(e)}>
                <div className="flex justify-between items-center">
                  <h3 className="font-bold">{e.nombre_completo}</h3>
                  {e.cambios_pestana > 0 ? (
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">⚠ {e.cambios_pestana} salida(s)</span>
                  ) : (
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">Sin salidas</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  if (viewLevel === 'respuestas' && respuestasDetalle?.respuestas?.length > 0) {
    const totalPuntaje = (puntajeAuto?.puntaje_automatico || 0) + Object.values(calificaciones).reduce((a: number, b: any) => a + (parseFloat(b) || 0), 0);

    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto p-6">
          <button onClick={() => setViewLevel('estudiantes')} className="mb-4 px-4 py-2 bg-gray-600 text-white rounded">← Atrás</button>
          <h1 className="text-xl font-bold mb-2">{respuestasDetalle?.nombre_completo}</h1>
          {puntajeAuto && (
            <div className="bg-blue-100 p-4 rounded mb-6">
              <p className="font-bold">Puntaje Total: {totalPuntaje.toFixed(2)} / {puntajeAuto.puntaje_total}</p>
              <p className="text-sm text-gray-600">Automático: {puntajeAuto.puntaje_automatico.toFixed(2)} + Manual: {(totalPuntaje - puntajeAuto.puntaje_automatico).toFixed(2)}</p>
            </div>
          )}

          <div className={`p-4 rounded mb-6 ${respuestasDetalle?.cambios_pestana > 0 ? 'bg-red-50 border border-red-300' : 'bg-green-50 border border-green-300'}`}>
            <p className="font-bold mb-1">Reporte de monitoreo</p>
            {respuestasDetalle?.cambios_pestana > 0 ? (
              <>
                <p className="text-sm mb-2">Salidas registradas: <strong>{respuestasDetalle.cambios_pestana}</strong></p>
                <ul className="text-sm list-disc list-inside">
                  {(respuestasDetalle.log_incidentes || []).map((x: any, i: number) => (
                    <li key={i}>{new Date(x.hora).toLocaleTimeString('es-CO', { timeZone: 'America/Bogota' })} — {x.tipo}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-sm">No se registraron salidas de la evaluación.</p>
            )}
          </div>

          <h2 className="text-lg font-bold mb-4">Todas las Respuestas</h2>
          {puntajeAuto?.respuestas_con_puntuacion?.map((r: any, i: number) => {
            const preg = preguntas.find(p => p.id === r.pregunta_id);
            const correcto = esCorrecta(r);
            return (
              <div key={i} className="bg-white p-4 mb-4 rounded border-l-4" style={{ borderColor: correcto === true ? '#22c55e' : correcto === false ? '#ef4444' : '#d1d5db' }}>
                <div className="flex justify-between items-start mb-2">
                  <p className="font-bold flex-1">{i+1}. {preg?.enunciado}</p>
                  {correcto !== null && (
                    <span className={`ml-4 px-3 py-1 rounded text-white text-sm font-bold ${correcto ? 'bg-green-500' : 'bg-red-500'}`}>
                      {correcto ? '✓ Correcto' : '✗ Incorrecto'}
                    </span>
                  )}
                </div>
                <p>Respondió: <strong>{getRespuestaTexto(r)}</strong></p>

                {r.tipo === 'ensayo' && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded">
                    <label className="block font-bold mb-2">Calificar respuesta abierta:</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max={5 / (puntajeAuto.respuestas_con_puntuacion?.length || 1)}
                        value={calificaciones[r.id] || ''}
                        onChange={(e) => setCalificaciones({...calificaciones, [r.id]: e.target.value})}
                        placeholder="Puntaje"
                        className="flex-1 p-2 border rounded"
                      />
                      <button onClick={() => handleCalificar(r.id)} className="bg-green-600 text-white px-4 py-2 rounded font-bold">Guardar</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <button onClick={handleBorrar} className="bg-red-600 text-white px-6 py-3 rounded mt-8">BORRAR RESPUESTA</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto p-6">
        <p>Sin respuestas</p>
      </div>
    </div>
  );
};

export default DashboardDocente;
