import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import api from '../services/api';

type Vista = 'asignaturas' | 'evaluaciones' | 'participantes' | 'detalle';

const fmt = (n: any) => (n === null || n === undefined ? '-' : Number(n).toFixed(2).replace('.', ','));

const Consulta: React.FC = () => {
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
      setVista('detalle');
    });

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

  const cortesConNotas = Array.from(new Set(notasCorte.map((n) => n.corte))).sort();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        {cargando && <div className="text-gray-500 mb-4">Cargando...</div>}

        {vista === 'asignaturas' && (
          <>
            <h1 className="text-3xl font-bold mb-6">Consulta de resultados</h1>
            <p className="text-gray-600 mb-4">Selecciona una asignatura.</p>
            <div className="grid gap-4 md:grid-cols-2">
              {asignaturas.map((a) => (
                <button key={a.id} onClick={() => abrirAsignatura(a)} className="bg-white rounded-lg shadow hover:shadow-lg p-5 text-left">
                  <div className="text-lg font-semibold">{a.nombre}</div>
                  <div className="text-sm text-gray-500">{a.total_evaluaciones} evaluaciones</div>
                </button>
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
                        <td className="p-3">
                          <button onClick={() => abrirEvaluacion(e)} className="text-blue-600 underline">
                            Ver participantes
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
