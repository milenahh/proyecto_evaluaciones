import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

type Vista = 'asignaturas' | 'evaluaciones' | 'estudiantes' | 'vistaEstudiante' | 'participantes' | 'detalle' | 'aplicar';

const fmt = (n: any) => (n === null || n === undefined ? '-' : Number(n).toFixed(2).replace('.', ','));

const Consulta: React.FC = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [vista, setVista] = useState<Vista>('asignaturas');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const [asignaturas, setAsignaturas] = useState<any[]>([]);
  const [asignatura, setAsignatura] = useState<any>(null);
  const [evaluaciones, setEvaluaciones] = useState<any[]>([]);
  const [filtroCorte, setFiltroCorte] = useState('todos');
  const [notasCorte, setNotasCorte] = useState<any[]>([]);
  const [verNotas, setVerNotas] = useState(false);
  const [evaluacion, setEvaluacion] = useState<any>(null);
  const [participantes, setParticipantes] = useState<any[]>([]);
  const [detalle, setDetalle] = useState<any>(null);
  const [aplicarDatos, setAplicarDatos] = useState<any>(null);
  const [aplicarMensaje, setAplicarMensaje] = useState('');
  const [notasDetalle, setNotasDetalle] = useState<Record<number, { puntaje: string; retro: string }>>({});
  const [mensajeDetalle, setMensajeDetalle] = useState('');
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [estudianteVista, setEstudianteVista] = useState<any>(null);

  const manejar = async (fn: () => Promise<void>) => {
    setError('');
    setCargando(true);
    try {
      await fn();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Error al cargar la información');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    manejar(async () => {
      const r = await api.get('/consulta/asignaturas');
      setAsignaturas(r.data);
    });
  }, []);

  const toggleVisibleCoordinadorAsignatura = (a: any) =>
    manejar(async () => {
      await api.put(`/consulta/asignaturas/${a.id}/visible-coordinador`, { visible: a.visible_coordinador === false });
      const r = await api.get('/consulta/asignaturas');
      setAsignaturas(r.data);
    });

  const abrirAsignatura = (a: any) =>
    manejar(async () => {
      const [ev, nc] = await Promise.all([
        api.get(`/consulta/asignaturas/${a.id}/evaluaciones`),
        api.get(`/consulta/asignaturas/${a.id}/notas-corte`),
      ]);
      setAsignatura(a);
      setEvaluaciones(ev.data);
      setNotasCorte(nc.data);
      setFiltroCorte('todos');
      setVerNotas(false);
      setVista('evaluaciones');
    });

  const abrirEvaluacion = (e: any) =>
    manejar(async () => {
      const r = await api.get(`/consulta/evaluaciones/${e.id}/participantes`);
      setEvaluacion(r.data.evaluacion);
      setParticipantes(r.data.participantes);
      setVista('participantes');
    });

  const abrirDetalle = (p: any) =>
    manejar(async () => {
      const r = await api.get(`/consulta/evaluaciones/${evaluacion.id}/respuestas/${p.id}`);
      setDetalle(r.data);
      setNotasDetalle({});
      setMensajeDetalle('');
      setVista('detalle');
    });

  const abrirEstudiantes = () =>
    manejar(async () => {
      const r = await api.get(`/consulta/asignaturas/${asignatura.id}/estudiantes`);
      setEstudiantes(r.data);
      setVista('estudiantes');
    });

  const abrirVistaEstudiante = (est: any) =>
    manejar(async () => {
      const r = await api.get(`/consulta/asignaturas/${asignatura.id}/estudiantes/${est.id}/vista`);
      setEstudianteVista({ nombre: est.nombre, ...r.data });
      setVista('vistaEstudiante');
    });

  const cargarAplicar = (evaluacionIdNum: number) =>
    manejar(async () => {
      const r = await api.get(`/consulta/evaluaciones/${evaluacionIdNum}/aplicar`);
      setAplicarDatos(r.data);
    });

  const abrirAplicar = (e: any) => {
    setAplicarMensaje('');
    setEvaluacion(e);
    setVista('aplicar');
    cargarAplicar(e.id);
  };

  const habilitar = (est: any) =>
    manejar(async () => {
      await api.post(`/consulta/evaluaciones/${evaluacion.id}/habilitar`, { estudiante_id: est.id });
      setAplicarMensaje(`${est.nombre} ya puede presentar el parcial desde su cuenta.`);
      await cargarAplicar(evaluacion.id);
    });

  const quitar = (est: any) => {
    if (!window.confirm(`¿Quitar la habilitación a ${est.nombre}?`)) return;
    manejar(async () => {
      await api.delete(`/consulta/evaluaciones/${evaluacion.id}/habilitar/${est.id}`);
      setAplicarMensaje(`Habilitación quitada a ${est.nombre}.`);
      await cargarAplicar(evaluacion.id);
    });
  };

  const recargarDetalle = async () => {
    const r = await api.get(`/consulta/evaluaciones/${evaluacion.id}/respuestas/${detalle.respuesta_id}`);
    setDetalle(r.data);
    setNotasDetalle({});
  };

  const guardarItem = (it: any) =>
    manejar(async () => {
      const edit = notasDetalle[it.detalle_id] || { puntaje: '', retro: it.retroalimentacion || '' };
      await api.post(`/evaluaciones/${evaluacion.id}/respuesta-detalle/${it.detalle_id}/calificar`, {
        puntaje: edit.puntaje === '' ? undefined : parseFloat(edit.puntaje.replace(',', '.')),
        retroalimentacion: edit.retro,
      });
      setMensajeDetalle('Calificación de la pregunta guardada.');
      await recargarDetalle();
    });

  const publicarDetalle = (publicar: boolean) => {
    if (publicar && !window.confirm('Se publicará la calificación del parcial para este estudiante. ¿Continuar?')) return;
    manejar(async () => {
      await api.post(`/evaluaciones/${evaluacion.id}/publicar-calificaciones`, {
        publicar,
        respuesta_ids: [detalle.respuesta_id],
      });
      setMensajeDetalle(publicar ? 'Calificación publicada. El estudiante ya la puede ver.' : 'Calificación ocultada.');
      await recargarDetalle();
    });
  };

  const evaluacionesFiltradas = evaluaciones.filter((e) => {
    if (filtroCorte === 'todos') return true;
    if (filtroCorte === 'sin') return !e.corte;
    return String(e.corte) === filtroCorte;
  });

  const btnAtras = (texto: string, destino: Vista) => (
    <button onClick={() => setVista(destino)} className="mb-4 px-4 py-2 bg-gray-600 text-white rounded font-bold">
      ← {texto}
    </button>
  );

  const btnAtras2 = (texto: string, fn: () => void) => (
    <button onClick={fn} className="mb-4 px-4 py-2 bg-gray-600 text-white rounded font-bold">
      ← {texto}
    </button>
  );

  const cortesConNotas = Array.from(new Set(notasCorte.map((n) => n.corte))).sort();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        {cargando && <div className="text-gray-500 mb-4">Cargando...</div>}

        {vista === 'asignaturas' && (
          <>
            {usuario?.rol === 'docente' && btnAtras2('Dashboard', () => navigate('/docente/dashboard'))}
            <h1 className="text-3xl font-bold mb-6">{usuario?.rol === 'docente' ? 'Mis asignaturas' : 'Consulta de resultados'}</h1>
            <p className="text-gray-600 mb-4">Selecciona una asignatura.</p>
            <div className="grid gap-4 md:grid-cols-2">
              {asignaturas.map((a) => (
                <div key={a.id} className="bg-white rounded-lg shadow p-5">
                  <button onClick={() => abrirAsignatura(a)} className="text-left w-full hover:opacity-80">
                    <div className="text-lg font-semibold">{a.nombre}</div>
                    <div className="text-sm text-gray-500">{a.total_evaluaciones} evaluaciones</div>
                  </button>
                  {usuario?.rol === 'docente' && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className={`text-xs ${a.visible_coordinador === false ? 'text-gray-500' : 'text-blue-700'}`}>
                        {a.visible_coordinador === false ? '(oculta para coordinador)' : '(visible para coordinador)'}
                      </span>
                      <button onClick={() => toggleVisibleCoordinadorAsignatura(a)} className={`${a.visible_coordinador === false ? 'bg-blue-700' : 'bg-gray-500'} text-white px-3 py-1 rounded text-sm`}>
                        {a.visible_coordinador === false ? 'Mostrar a coordinador' : 'Ocultar a coordinador'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {vista === 'evaluaciones' && asignatura && (
          <>
            {btnAtras('Asignaturas', 'asignaturas')}
            <h1 className="text-3xl font-bold mb-4">{asignatura.nombre}</h1>

            <div className="flex flex-wrap gap-2 mb-4">
              {[
                ['todos', 'Todos'],
                ['1', 'Corte 1'],
                ['2', 'Corte 2'],
                ['3', 'Corte 3'],
                ['sin', 'Sin corte'],
              ].map(([v, t]) => (
                <button
                  key={v}
                  onClick={() => {
                    setFiltroCorte(v);
                    setVerNotas(false);
                  }}
                  className={`px-4 py-2 rounded font-bold ${!verNotas && filtroCorte === v ? 'bg-blue-600 text-white' : 'bg-white border'}`}
                >
                  {t}
                </button>
              ))}
              <button onClick={() => setVerNotas(true)} className={`px-4 py-2 rounded font-bold ${verNotas ? 'bg-purple-600 text-white' : 'bg-white border'}`}>
                Notas por corte
              </button>
              <button onClick={abrirEstudiantes} className="px-4 py-2 rounded font-bold bg-indigo-600 text-white">
                Estudiantes
              </button>
              <button onClick={() => navigate('/docente/notas')} className="px-4 py-2 rounded font-bold bg-green-600 text-white">
                Registrar notas por corte
              </button>
            </div>

            {!verNotas && (
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3">Evaluación</th>
                      <th className="p-3">Corte</th>
                      <th className="p-3">Docente</th>
                      <th className="p-3">Fecha</th>
                      <th className="p-3">Participantes</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluacionesFiltradas.map((e) => (
                      <tr key={e.id} className="border-b">
                        <td className="p-3">
                          {e.titulo}
                          {e.archivada && <span className="ml-2 text-xs text-gray-500">(archivada)</span>}
                        </td>
                        <td className="p-3">{e.corte ? `Corte ${e.corte}` : '-'}</td>
                        <td className="p-3">{e.docente}</td>
                        <td className="p-3">{e.fecha_inicio ? new Date(e.fecha_inicio).toLocaleDateString('es-CO') : '-'}</td>
                        <td className="p-3">
                          {e.participantes}/{e.matriculados}
                        </td>
                        <td className="p-3 space-x-3 whitespace-nowrap">
                          <button onClick={() => abrirEvaluacion(e)} className="text-blue-600 underline">
                            Ver participantes
                          </button>
                          <button onClick={() => abrirAplicar(e)} className="text-green-700 underline">
                            Habilitar estudiante
                          </button>
                        </td>
                      </tr>
                    ))}
                    {evaluacionesFiltradas.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-gray-500">
                          No hay evaluaciones en esta vista.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {verNotas && (
              <div className="space-y-6">
                {cortesConNotas.length === 0 && <div className="bg-white rounded-lg shadow p-4 text-gray-500">Aún no hay notas por corte cargadas para esta asignatura.</div>}
                {cortesConNotas.map((c) => {
                  const filas = notasCorte.filter((n) => n.corte === c);
                  const cols = filas[0]?.componentes || [];
                  return (
                    <div key={c} className="bg-white rounded-lg shadow p-4 overflow-x-auto">
                      <h2 className="text-xl font-bold mb-2">Corte {c}</h2>
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b text-left">
                            <th className="p-2">Estudiante</th>
                            {cols.map((k: any) => (
                              <th key={k.nombre} className="p-2">
                                {k.nombre}
                                {k.peso !== null ? ` (${k.peso}%)` : ''}
                              </th>
                            ))}
                            <th className="p-2">Nota final</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filas.map((f, i) => (
                            <tr key={i} className="border-b">
                              <td className="p-2">{f.nombre}</td>
                              {f.componentes.map((k: any, j: number) => (
                                <td key={j} className="p-2">
                                  {k.nota ?? '-'}
                                </td>
                              ))}
                              <td className="p-2 font-bold">{f.nota_final ?? '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {vista === 'participantes' && evaluacion && (
          <>
            {btnAtras('Evaluaciones', 'evaluaciones')}
            <h1 className="text-3xl font-bold mb-1">{evaluacion.titulo}</h1>
            <p className="text-gray-600 mb-4">
              {evaluacion.corte ? `Corte ${evaluacion.corte} · ` : ''}Puntaje total: {fmt(evaluacion.puntaje_total)}
            </p>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-3">Estudiante</th>
                    <th className="p-3">Envío</th>
                    <th className="p-3">Salidas de pestaña</th>
                    <th className="p-3">Calificación</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {participantes.map((p) => (
                    <tr key={p.id} className="border-b">
                      <td className="p-3">{p.nombre}</td>
                      <td className="p-3">{p.fecha_envio ? new Date(p.fecha_envio).toLocaleString('es-CO') : '-'}</td>
                      <td className="p-3">{p.cambios_pestana ?? 0}</td>
                      <td className="p-3 font-bold">
                        {fmt(p.puntaje_final)} / {fmt(evaluacion.puntaje_total)}
                      </td>
                      <td className="p-3">
                        <button onClick={() => abrirDetalle(p)} className="text-blue-600 underline">
                          Ver respuestas
                        </button>
                      </td>
                    </tr>
                  ))}
                  {participantes.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-500">
                        Nadie ha presentado esta evaluación.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {vista === 'estudiantes' && asignatura && (
          <>
            {btnAtras('Evaluaciones', 'evaluaciones')}
            <h1 className="text-3xl font-bold mb-4">{asignatura.nombre}: estudiantes</h1>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-3">Estudiante</th>
                    <th className="p-3">Parciales presentados</th>
                    <th className="p-3">Parciales publicados</th>
                    <th className="p-3">Cortes publicados</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {estudiantes.map((est) => (
                    <tr key={est.id} className="border-b">
                      <td className="p-3">{est.nombre}</td>
                      <td className="p-3">{est.parciales_presentados}</td>
                      <td className="p-3">{est.parciales_publicados}</td>
                      <td className="p-3">{est.cortes_publicados}</td>
                      <td className="p-3">
                        <button onClick={() => abrirVistaEstudiante(est)} className="text-blue-600 underline">
                          Ver como estudiante
                        </button>
                      </td>
                    </tr>
                  ))}
                  {estudiantes.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-gray-500">
                        No hay estudiantes matriculados en esta asignatura.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {vista === 'vistaEstudiante' && estudianteVista && (
          <>
            {btnAtras('Estudiantes', 'estudiantes')}
            <h1 className="text-3xl font-bold mb-1">{estudianteVista.nombre}</h1>
            <p className="text-gray-600 mb-6">Esto es lo que el estudiante ve publicado en su dashboard.</p>

            <h2 className="text-xl font-bold mb-3">Notas por corte</h2>
            {estudianteVista.notas.length === 0 && <div className="bg-white rounded-lg shadow p-4 text-gray-500 mb-6">No hay notas por corte publicadas.</div>}
            <div className="grid gap-4 md:grid-cols-2 mb-8">
              {estudianteVista.notas.map((n: any) => (
                <div key={n.corte} className="bg-white rounded-lg shadow p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-sm text-gray-500">Corte {n.corte}</div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Nota final</div>
                      <div className="text-3xl font-bold text-green-600">{fmt(n.nota_final)}</div>
                    </div>
                  </div>
                  <table className="w-full text-sm">
                    <tbody>
                      {n.componentes.map((c: any, i: number) => (
                        <tr key={i} className="border-t">
                          <td className="py-1">
                            {c.nombre}
                            {c.peso !== null ? <span className="text-gray-400"> ({c.peso}%)</span> : null}
                          </td>
                          <td className="py-1 text-right font-semibold">{c.nota ?? '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            <h2 className="text-xl font-bold mb-3">Parciales publicados</h2>
            {estudianteVista.parciales.length === 0 && <div className="bg-white rounded-lg shadow p-4 text-gray-500">No hay parciales publicados.</div>}
            <div className="space-y-4">
              {estudianteVista.parciales.map((p: any, idx: number) => (
                <div key={idx} className="bg-white rounded-lg shadow p-5">
                  <div className="flex justify-between mb-3">
                    <div className="font-semibold">{p.titulo}</div>
                    <div className="font-bold">
                      {fmt(p.puntaje_final)} / {fmt(p.puntaje_total)}
                    </div>
                  </div>
                  {p.items.map((it: any) => (
                    <div key={it.pregunta_id} className="border-t py-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <span>
                          {it.numero}. {it.enunciado}
                        </span>
                        <span className="font-semibold whitespace-nowrap">
                          {fmt(it.puntaje)} / {fmt(it.puntaje_maximo)}
                        </span>
                      </div>
                      <div className="text-gray-700">Respuesta: {it.respuesta || <em className="text-gray-400">Sin respuesta</em>}</div>
                      {it.respuesta_correcta && <div className="text-green-700">Correcta: {it.respuesta_correcta}</div>}
                      {it.respuesta_esperada && <div className="text-gray-700">Esperada: {it.respuesta_esperada}</div>}
                      {it.retroalimentacion && <div className="text-blue-800">Comentario: {it.retroalimentacion}</div>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}

        {vista === 'aplicar' && evaluacion && (
          <>
            {btnAtras('Evaluaciones', 'evaluaciones')}
            <h1 className="text-3xl font-bold mb-1">Habilitar: {evaluacion.titulo}</h1>
            <p className="text-gray-600 mb-4">Habilita el parcial a un estudiante para que lo presente desde su cuenta. Puedes quitar la habilitación mientras no haya presentado.</p>

            {aplicarMensaje && <div className="bg-green-100 text-green-800 p-3 rounded mb-4">{aplicarMensaje}</div>}

            {aplicarDatos && (
              <div className="bg-white rounded-lg shadow overflow-x-auto mb-8">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="p-3">Estudiante</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {aplicarDatos.pendientes.map((p: any) => (
                      <tr key={p.id} className="border-b">
                        <td className="p-3">{p.nombre}</td>
                        <td className="p-3">
                          {p.ya_respondio ? (
                            <span className="text-green-700 font-bold">Ya presentó</span>
                          ) : p.habilitado ? (
                            <span className="text-blue-700 font-bold">Habilitado, esperando que presente</span>
                          ) : (
                            <span className="text-gray-500">No habilitado</span>
                          )}
                        </td>
                        <td className="p-3">
                          {p.ya_respondio ? null : p.habilitado ? (
                            <button onClick={() => quitar(p)} disabled={cargando} className="text-red-600 underline">
                              Quitar habilitación
                            </button>
                          ) : (
                            <button onClick={() => habilitar(p)} disabled={cargando} className="text-green-700 underline">
                              Habilitar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {aplicarDatos.pendientes.length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-4 text-center text-gray-500">No hay estudiantes matriculados en esta asignatura.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {aplicarDatos && (
              <>
                <h2 className="text-xl font-bold mb-3">Parcial configurado (referencia)</h2>
                <div className="bg-white rounded-lg shadow p-6 space-y-4">
                  {aplicarDatos.preguntas.map((p: any, idx: number) => (
                    <div key={p.id} className="border-t pt-3 first:border-t-0 first:pt-0">
                      <div className="font-semibold">
                        {idx + 1}. {p.enunciado}
                      </div>
                      {p.tipo === 'seleccion_multiple' ? (
                        <ul className="mt-1 ml-4 list-disc text-sm">
                          {p.opciones.map((o: any) => (
                            <li key={o.id} className={o.es_correcta ? 'font-bold text-green-700' : ''}>
                              {o.contenido}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        p.respuesta_esperada && (
                          <div className="mt-1 text-sm text-gray-700">
                            <span className="text-xs text-gray-500">Respuesta esperada: </span>
                            {p.respuesta_esperada}
                          </div>
                        )
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {vista === 'detalle' && detalle && evaluacion && (
          <>
            {btnAtras('Participantes', 'participantes')}
            <h1 className="text-3xl font-bold mb-1">{detalle.estudiante.nombre}</h1>
            <p className="text-gray-600 mb-4">
              {evaluacion.titulo} · Calificación:{' '}
              <span className="font-bold">
                {fmt(detalle.resultado.puntaje_final)} / {fmt(detalle.resultado.puntaje_total)}
              </span>
            </p>
            {mensajeDetalle && <div className="bg-green-100 text-green-800 p-3 rounded mb-4">{mensajeDetalle}</div>}
            <div className="flex gap-2 mb-4">
              <button onClick={() => publicarDetalle(true)} disabled={cargando} className="bg-green-600 text-white px-4 py-2 rounded font-bold disabled:bg-gray-300">
                Publicar calificación
              </button>
              <button onClick={() => publicarDetalle(false)} disabled={cargando} className="bg-gray-600 text-white px-4 py-2 rounded font-bold disabled:bg-gray-300">
                Ocultar calificación
              </button>
            </div>
            <div className="space-y-4">
              {detalle.resultado.items.map((it: any) => (
                <div key={it.pregunta_id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between gap-4">
                    <div className="font-semibold">
                      {it.numero}. {it.enunciado}
                    </div>
                    <div className="font-bold whitespace-nowrap">
                      {fmt(it.puntaje)} / {fmt(it.puntaje_maximo)}
                    </div>
                  </div>
                  <div className={`mt-2 p-2 rounded ${it.correcta === true ? 'bg-green-50' : it.correcta === false ? 'bg-red-50' : 'bg-gray-50'}`}>
                    <span className="text-xs text-gray-500">Respuesta del estudiante</span>
                    <div>{it.respuesta || <em className="text-gray-400">Sin respuesta</em>}</div>
                  </div>
                  {it.respuesta_correcta && (
                    <div className="mt-2 text-sm text-gray-700">
                      <span className="text-xs text-gray-500">Respuesta correcta: </span>
                      {it.respuesta_correcta}
                    </div>
                  )}
                  {it.respuesta_esperada && (
                    <div className="mt-2 text-sm text-gray-700">
                      <span className="text-xs text-gray-500">Respuesta esperada: </span>
                      {it.respuesta_esperada}
                    </div>
                  )}
                  {it.retroalimentacion && (
                    <div className="mt-2 text-sm text-blue-800">
                      <span className="text-xs text-gray-500">Comentario del docente: </span>
                      {it.retroalimentacion}
                    </div>
                  )}
                  {it.tipo !== 'seleccion_multiple' && it.detalle_id && (
                    <div className="mt-3 border-t pt-3 flex flex-wrap items-end gap-2">
                      <div>
                        <label className="block text-xs text-gray-500">Puntaje (máx. {fmt(it.puntaje_maximo)})</label>
                        <input
                          type="text"
                          value={notasDetalle[it.detalle_id]?.puntaje ?? ''}
                          placeholder={String(it.puntaje ?? '')}
                          onChange={(e) =>
                            setNotasDetalle({ ...notasDetalle, [it.detalle_id]: { puntaje: e.target.value, retro: notasDetalle[it.detalle_id]?.retro ?? it.retroalimentacion ?? '' } })
                          }
                          className="p-2 border rounded w-28"
                        />
                      </div>
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs text-gray-500">Comentario</label>
                        <input
                          type="text"
                          value={notasDetalle[it.detalle_id]?.retro ?? it.retroalimentacion ?? ''}
                          onChange={(e) =>
                            setNotasDetalle({ ...notasDetalle, [it.detalle_id]: { puntaje: notasDetalle[it.detalle_id]?.puntaje ?? '', retro: e.target.value } })
                          }
                          className="p-2 border rounded w-full"
                        />
                      </div>
                      <button onClick={() => guardarItem(it)} disabled={cargando} className="bg-blue-600 text-white px-4 py-2 rounded font-bold disabled:bg-gray-300">
                        Guardar
                      </button>
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

export default Consulta;
