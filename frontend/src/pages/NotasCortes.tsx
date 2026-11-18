import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ActividadEdit {
  nombre: string;
  porcentaje: string;
}

const normalizarTexto = (s: string) =>
  (s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

const aNumero = (v: string): number | null => {
  const t = (v || '').trim().replace(',', '.');
  if (t === '' || isNaN(Number(t))) return null;
  return Number(t);
};

const pctNumero = (v: string) => {
  const n = Number(String(v || '').replace(',', '.'));
  return isNaN(n) ? 0 : n;
};

// Divide un texto TSV respetando celdas entre comillas con saltos de línea
const parseTSV = (texto: string): string[][] => {
  const filas: string[][] = [];
  let fila: string[] = [];
  let celda = '';
  let enComillas = false;
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i];
    if (enComillas) {
      if (c === '"') {
        if (texto[i + 1] === '"') {
          celda += '"';
          i++;
        } else enComillas = false;
      } else celda += c;
    } else if (c === '"') enComillas = true;
    else if (c === '\t') {
      fila.push(celda);
      celda = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++;
      fila.push(celda);
      celda = '';
      if (fila.some((x) => x.trim() !== '')) filas.push(fila);
      fila = [];
    } else celda += c;
  }
  fila.push(celda);
  if (fila.some((x) => x.trim() !== '')) filas.push(fila);
  return filas;
};

const NOMBRE_COLUMNA_1 = 'Apellidos Nombres';

const NotasCortes: React.FC = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const esCoordinador = usuario?.rol === 'coordinador';

  const [asignaturas, setAsignaturas] = useState<any[]>([]);
  const [asignaturaId, setAsignaturaId] = useState('');
  const [corte, setCorte] = useState('1');

  const [actividades, setActividades] = useState<ActividadEdit[]>([]);
  const [actividadesGuardadas, setActividadesGuardadas] = useState<{ nombre: string; porcentaje: number }[]>([]);

  const [texto, setTexto] = useState('');
  const [preview, setPreview] = useState<{ nombre: string; notas: (number | null)[]; final: number; avisos: string[] }[] | null>(null);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [sinCoincidencia, setSinCoincidencia] = useState<string[]>([]);
  const [erroresFilas, setErroresFilas] = useState<string[]>([]);
  const [guardadas, setGuardadas] = useState<any[]>([]);
  const [trabajando, setTrabajando] = useState(false);

  const total = actividades.reduce((acc, a) => acc + pctNumero(a.porcentaje), 0);
  const encabezados = [NOMBRE_COLUMNA_1, ...actividadesGuardadas.map((a) => a.nombre)];

  useEffect(() => {
    api
      .get(esCoordinador ? '/consulta/asignaturas' : '/evaluaciones/asignaturas')
      .then((r) => {
        setAsignaturas(r.data);
        if (r.data.length === 1) setAsignaturaId(String(r.data[0].id));
      })
      .catch(() => setError('No se pudieron cargar las asignaturas'));
  }, []);

  const cargarTodo = async () => {
    setPreview(null);
    setTexto('');
    setSinCoincidencia([]);
    setErroresFilas([]);
    if (!asignaturaId) {
      setActividades([]);
      setActividadesGuardadas([]);
      setGuardadas([]);
      return;
    }
    try {
      const [act, notas] = await Promise.all([
        api.get('/notas/actividades', { params: { asignatura_id: asignaturaId, corte } }),
        api.get(`/notas/asignatura/${asignaturaId}/corte/${corte}`),
      ]);
      setActividadesGuardadas(act.data);
      setActividades(act.data.map((a: any) => ({ nombre: a.nombre, porcentaje: String(a.porcentaje).replace('.', ',') })));
      setGuardadas(notas.data);
    } catch {
      setActividades([]);
      setActividadesGuardadas([]);
      setGuardadas([]);
    }
  };

  useEffect(() => {
    cargarTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asignaturaId, corte]);

  const cambiarActividad = (i: number, campo: keyof ActividadEdit, valor: string) => {
    setActividades(actividades.map((a, idx) => (idx === i ? { ...a, [campo]: valor } : a)));
  };

  const guardarActividades = async () => {
    setError('');
    setMensaje('');
    if (!asignaturaId) return setError('Selecciona la asignatura');
    setTrabajando(true);
    try {
      const r = await api.put('/notas/actividades', {
        asignatura_id: asignaturaId,
        corte,
        actividades: actividades.filter((a) => a.nombre.trim() !== ''),
      });
      setMensaje(`Actividades del corte ${corte} guardadas (suman ${r.data.total}%).`);
      await cargarTodo();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Error al guardar las actividades');
    } finally {
      setTrabajando(false);
    }
  };

  const copiarEncabezados = async () => {
    try {
      await navigator.clipboard.writeText(encabezados.join('\t'));
      setMensaje('Encabezados copiados. Pégalos como primera fila de tu Excel.');
    } catch {
      setError('No se pudo copiar. Selecciona los encabezados de la tabla de formato y cópialos.');
    }
  };

  const handleVistaPrevia = () => {
    setError('');
    setMensaje('');
    setSinCoincidencia([]);
    setErroresFilas([]);
    if (actividadesGuardadas.length === 0) {
      setError('Primero define y guarda las actividades de este corte.');
      setPreview(null);
      return;
    }
    const matriz = parseTSV(texto);
    if (matriz.length < 2) {
      setError('Pega la tabla completa, incluida la fila de encabezados.');
      setPreview(null);
      return;
    }
    const enc = matriz[0].map((h) => normalizarTexto(h));
    const esperados = actividadesGuardadas.map((a) => normalizarTexto(a.nombre));
    const faltantes: string[] = [];
    esperados.forEach((nombre, i) => {
      if (enc[i + 1] !== nombre) faltantes.push(`Columna ${i + 2} debe decir "${actividadesGuardadas[i].nombre}"`);
    });
    if (faltantes.length > 0) {
      setError(`Los encabezados no coinciden con las actividades del corte. ${faltantes.join('. ')}.`);
      setPreview(null);
      return;
    }

    const filas = [];
    for (let r = 1; r < matriz.length; r++) {
      const f = matriz[r];
      const nombre = (f[0] || '').trim();
      if (!nombre) continue;
      const notas = actividadesGuardadas.map((_, i) => aNumero(f[i + 1] || ''));
      const avisos: string[] = [];
      notas.forEach((n, i) => {
        if (n !== null && (n < 0 || n > 5)) avisos.push(`${actividadesGuardadas[i].nombre}: ${n} fuera de 0 a 5`);
      });
      let suma = 0;
      notas.forEach((n, i) => {
        suma += (n ?? 0) * actividadesGuardadas[i].porcentaje;
      });
      const final = Number((suma / 100).toFixed(2));
      filas.push({ nombre, notas, final, avisos });
    }
    setPreview(filas);
  };

  const handleGuardar = async () => {
    if (!preview || !asignaturaId) return;
    if (preview.some((f) => f.avisos.length > 0)) {
      setError('Corrige las notas fuera de 0 a 5 antes de guardar.');
      return;
    }
    setTrabajando(true);
    setError('');
    try {
      const r = await api.post('/notas/importar', {
        asignatura_id: asignaturaId,
        corte,
        filas: preview.map((f) => ({ nombre: f.nombre, notas: f.notas })),
      });
      setMensaje(`Notas guardadas: ${r.data.importadas}. Aún NO están publicadas.`);
      setSinCoincidencia(r.data.sin_coincidencia || []);
      setErroresFilas(r.data.errores || []);
      setPreview(null);
      setTexto('');
      const notas = await api.get(`/notas/asignatura/${asignaturaId}/corte/${corte}`);
      setGuardadas(notas.data);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Error al guardar las notas');
    } finally {
      setTrabajando(false);
    }
  };

  const publicar = async (publicarNota: boolean, estudianteId?: number) => {
    setTrabajando(true);
    setError('');
    try {
      await api.post('/notas/publicar', {
        asignatura_id: asignaturaId,
        corte,
        publicar: publicarNota,
        estudiante_id: estudianteId,
      });
      setMensaje(publicarNota ? 'Notas publicadas.' : 'Notas ocultadas.');
      const notas = await api.get(`/notas/asignatura/${asignaturaId}/corte/${corte}`);
      setGuardadas(notas.data);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Error al publicar');
    } finally {
      setTrabajando(false);
    }
  };

  const publicadas = guardadas.filter((g) => g.publicada).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Notas por corte</h1>
          <button onClick={() => navigate(esCoordinador ? '/consulta' : '/docente/dashboard')} className="bg-gray-600 text-white px-4 py-2 rounded font-bold">
            ← Volver
          </button>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        {mensaje && <div className="bg-green-100 text-green-800 p-3 rounded mb-4">{mensaje}</div>}
        {sinCoincidencia.length > 0 && (
          <div className="bg-yellow-100 text-yellow-900 p-3 rounded mb-4">
            <div className="font-bold mb-1">No se pudo asociar a un estudiante de la asignatura ({sinCoincidencia.length}):</div>
            <ul className="list-disc ml-6">
              {sinCoincidencia.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        )}
        {erroresFilas.length > 0 && (
          <div className="bg-yellow-100 text-yellow-900 p-3 rounded mb-4">
            {erroresFilas.map((e) => (
              <div key={e}>{e}</div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Asignatura</label>
              <select value={asignaturaId} onChange={(e) => setAsignaturaId(e.target.value)} className="w-full border rounded p-2">
                <option value="">Selecciona...</option>
                {asignaturas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Corte</label>
              <select value={corte} onChange={(e) => setCorte(e.target.value)} className="w-full border rounded p-2">
                <option value="1">Corte 1</option>
                <option value="2">Corte 2</option>
                <option value="3">Corte 3</option>
              </select>
            </div>
          </div>
        </div>

        {asignaturaId && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-1">1. Actividades del corte {corte}</h2>
            <p className="text-gray-600 text-sm mb-4">Escribe cada actividad y su porcentaje. Entre todas no pueden pasar de 100%. Las notas se califican de 0 a 5.</p>

            <div className="space-y-2">
              {actividades.map((a, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="w-6 text-gray-500">{i + 1}.</span>
                  <input
                    type="text"
                    value={a.nombre}
                    onChange={(e) => cambiarActividad(i, 'nombre', e.target.value)}
                    placeholder="Nombre de la actividad"
                    className="flex-1 border rounded p-2"
                  />
                  <input
                    type="text"
                    value={a.porcentaje}
                    onChange={(e) => cambiarActividad(i, 'porcentaje', e.target.value)}
                    placeholder="%"
                    className="w-24 border rounded p-2"
                  />
                  <span className="text-gray-500">%</span>
                  <button onClick={() => setActividades(actividades.filter((_, idx) => idx !== i))} className="text-red-600 underline text-sm">
                    Quitar
                  </button>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-4">
              <button onClick={() => setActividades([...actividades, { nombre: '', porcentaje: '' }])} className="bg-gray-600 text-white px-4 py-2 rounded font-bold">
                + Agregar actividad
              </button>
              <span className={`font-bold ${total > 100 ? 'text-red-600' : total === 100 ? 'text-green-700' : 'text-yellow-700'}`}>
                Total: {total.toFixed(2).replace('.', ',')}% {total > 100 ? '(pasa de 100%)' : total < 100 ? '(faltan ' + (100 - total).toFixed(2).replace('.', ',') + '%)' : '(completo)'}
              </span>
              <button onClick={guardarActividades} disabled={trabajando || total > 100} className="bg-blue-600 text-white px-4 py-2 rounded font-bold disabled:bg-gray-300">
                Guardar actividades
              </button>
            </div>
          </div>
        )}

        {actividadesGuardadas.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6 overflow-x-auto">
            <h2 className="text-xl font-bold mb-1">2. Formato de tu Excel para el corte {corte}</h2>
            <p className="text-gray-600 text-sm mb-4">
              Tu hoja debe tener <b>{encabezados.length} columnas</b>, en este orden, con estos encabezados exactos en la primera fila. No pongas columna de nota final ni porcentajes: la plataforma los calcula.
            </p>
            <table className="min-w-full text-sm mb-4">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2">Columna</th>
                  <th className="p-2">Encabezado exacto</th>
                  <th className="p-2">Qué va en cada celda</th>
                </tr>
              </thead>
              <tbody>
                {encabezados.map((h, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">{i + 1}</td>
                    <td className="p-2 font-mono">{h}</td>
                    <td className="p-2">
                      {i === 0 ? 'Apellidos y nombres del estudiante' : `Nota de 0 a 5 (coma decimal). Vale ${actividadesGuardadas[i - 1].porcentaje}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={copiarEncabezados} className="bg-gray-600 text-white px-4 py-2 rounded font-bold">
              Copiar encabezados
            </button>
          </div>
        )}

        {actividadesGuardadas.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-3">3. Pega aquí tu tabla de notas</h2>
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={8}
              className="w-full border rounded p-2 font-mono text-sm"
              placeholder="Copia en Excel o Sheets desde la fila de encabezados hasta el último estudiante, y pega aquí"
            />
            <button onClick={handleVistaPrevia} disabled={!texto.trim()} className="mt-3 bg-blue-600 text-white px-4 py-2 rounded font-bold disabled:bg-gray-300">
              Vista previa
            </button>
          </div>
        )}

        {preview && (
          <div className="bg-white rounded-lg shadow p-6 mb-6 overflow-x-auto">
            <h2 className="text-xl font-bold mb-3">Vista previa ({preview.length} estudiantes)</h2>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2">Estudiante</th>
                  {actividadesGuardadas.map((a) => (
                    <th key={a.nombre} className="p-2">
                      {a.nombre} ({a.porcentaje}%)
                    </th>
                  ))}
                  <th className="p-2">Nota final</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((f, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="p-2">{f.nombre}</td>
                    {f.notas.map((n, i) => (
                      <td key={i} className={`p-2 ${n !== null && (n < 0 || n > 5) ? 'text-red-600 font-bold' : ''}`}>
                        {n ?? 0}
                      </td>
                    ))}
                    <td className="p-2 font-bold">{f.final.toFixed(2).replace('.', ',')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.some((f) => f.avisos.length > 0) && (
              <div className="text-red-600 text-sm mt-3">Hay notas fuera de 0 a 5. Corrígelas en tu hoja y vuelve a pegar.</div>
            )}
            <button onClick={handleGuardar} disabled={trabajando || !asignaturaId} className="mt-4 bg-green-600 text-white px-4 py-2 rounded font-bold disabled:bg-gray-300">
              Guardar notas del corte {corte}
            </button>
          </div>
        )}

        {guardadas.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
            <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
              <h2 className="text-xl font-bold">
                Corte {corte} guardado: {publicadas}/{guardadas.length} publicadas
              </h2>
              <div className="flex gap-2">
                <button onClick={() => publicar(true)} disabled={trabajando} className="bg-green-600 text-white px-4 py-2 rounded font-bold disabled:bg-gray-300">
                  Publicar todas
                </button>
                <button onClick={() => publicar(false)} disabled={trabajando} className="bg-gray-600 text-white px-4 py-2 rounded font-bold disabled:bg-gray-300">
                  Ocultar todas
                </button>
              </div>
            </div>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2">Estudiante</th>
                  {(guardadas[0].componentes || []).map((c: any) => (
                    <th key={c.nombre} className="p-2">
                      {c.nombre} ({c.peso}%)
                    </th>
                  ))}
                  <th className="p-2">Nota final</th>
                  <th className="p-2">Estado</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {guardadas.map((g) => (
                  <tr key={g.id} className="border-b">
                    <td className="p-2">{g.nombre}</td>
                    {g.componentes.map((c: any, i: number) => (
                      <td key={i} className="p-2">
                        {c.nota ?? '-'}
                      </td>
                    ))}
                    <td className="p-2 font-bold">{g.nota_final ?? '-'}</td>
                    <td className="p-2">{g.publicada ? <span className="text-green-700 font-bold">Publicada</span> : <span className="text-gray-500">Oculta</span>}</td>
                    <td className="p-2">
                      <button onClick={() => publicar(!g.publicada, g.estudiante_id)} disabled={trabajando} className="text-blue-600 underline">
                        {g.publicada ? 'Ocultar' : 'Publicar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotasCortes;
