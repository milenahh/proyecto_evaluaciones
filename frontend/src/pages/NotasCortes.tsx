import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import api from '../services/api';

interface Columna {
  nombre: string;
  peso: number | null;
}
interface FilaImport {
  nombre: string;
  notas: (number | null)[];
  nota_final: number | null;
}

const aNumero = (v: string): number | null => {
  const t = (v || '').trim().replace(',', '.');
  if (t === '' || isNaN(Number(t))) return null;
  return Number(t);
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

const interpretar = (texto: string): { columnas: Columna[]; filas: FilaImport[]; error?: string } => {
  const matriz = parseTSV(texto);
  if (matriz.length < 2) return { columnas: [], filas: [], error: 'Pega la tabla completa, incluida la fila de encabezados.' };
  const enc = matriz[0].map((h) => h.replace(/\s+/g, ' ').trim());
  const idxFinal = enc.findIndex((h) => /nota\s*final/i.test(h));
  if (idxFinal < 0) return { columnas: [], filas: [], error: 'No encontré la columna "Nota final" en los encabezados.' };

  const idxs: number[] = [];
  const columnas: Columna[] = [];
  for (let i = 1; i < enc.length; i++) {
    if (i === idxFinal || enc[i] === '') continue;
    const m = enc[i].match(/(\d+(?:[.,]\d+)?)\s*%/);
    const nombre = enc[i].replace(/\(?\s*\d+(?:[.,]\d+)?\s*%\s*\)?/g, '').trim() || enc[i];
    idxs.push(i);
    columnas.push({ nombre, peso: m ? Number(m[1].replace(',', '.')) : null });
  }

  const filas: FilaImport[] = [];
  for (let r = 1; r < matriz.length; r++) {
    const f = matriz[r];
    const nombre = (f[0] || '').trim();
    if (!nombre) continue;
    filas.push({
      nombre,
      notas: idxs.map((i) => aNumero(f[i] || '')),
      nota_final: aNumero(f[idxFinal] || ''),
    });
  }
  return { columnas, filas };
};

const NotasCortes: React.FC = () => {
  const navigate = useNavigate();
  const [asignaturas, setAsignaturas] = useState<any[]>([]);
  const [asignaturaId, setAsignaturaId] = useState('');
  const [corte, setCorte] = useState('2');
  const [texto, setTexto] = useState('');
  const [preview, setPreview] = useState<{ columnas: Columna[]; filas: FilaImport[] } | null>(null);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [sinCoincidencia, setSinCoincidencia] = useState<string[]>([]);
  const [guardadas, setGuardadas] = useState<any[]>([]);
  const [trabajando, setTrabajando] = useState(false);

  useEffect(() => {
    api
      .get('/evaluaciones/asignaturas')
      .then((r) => {
        setAsignaturas(r.data);
        if (r.data.length === 1) setAsignaturaId(String(r.data[0].id));
      })
      .catch(() => setError('No se pudieron cargar las asignaturas'));
  }, []);

  const cargarGuardadas = async () => {
    if (!asignaturaId) {
      setGuardadas([]);
      return;
    }
    try {
      const r = await api.get(`/notas/asignatura/${asignaturaId}/corte/${corte}`);
      setGuardadas(r.data);
    } catch {
      setGuardadas([]);
    }
  };

  useEffect(() => {
    cargarGuardadas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asignaturaId, corte]);

  const handleVistaPrevia = () => {
    setError('');
    setMensaje('');
    setSinCoincidencia([]);
    const r = interpretar(texto);
    if (r.error) {
      setError(r.error);
      setPreview(null);
      return;
    }
    setPreview({ columnas: r.columnas, filas: r.filas });
  };

  const handleGuardar = async () => {
    if (!preview || !asignaturaId) {
      setError('Selecciona la asignatura y genera la vista previa.');
      return;
    }
    setTrabajando(true);
    setError('');
    try {
      const r = await api.post('/notas/importar', {
        asignatura_id: asignaturaId,
        corte,
        columnas: preview.columnas,
        filas: preview.filas,
      });
      setMensaje(`Notas guardadas: ${r.data.importadas}. Aún NO están publicadas.`);
      setSinCoincidencia(r.data.sin_coincidencia || []);
      setPreview(null);
      setTexto('');
      await cargarGuardadas();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Error al guardar las notas');
    } finally {
      setTrabajando(false);
    }
  };

  const publicar = async (publicar: boolean, estudianteId?: number) => {
    setTrabajando(true);
    setError('');
    try {
      await api.post('/notas/publicar', {
        asignatura_id: asignaturaId,
        corte,
        publicar,
        estudiante_id: estudianteId,
      });
      setMensaje(publicar ? 'Notas publicadas.' : 'Notas ocultadas.');
      await cargarGuardadas();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Error al publicar');
    } finally {
      setTrabajando(false);
    }
  };

  const columnasGuardadas: Columna[] = guardadas.length > 0 ? guardadas[0].componentes.map((c: any) => ({ nombre: c.nombre, peso: c.peso })) : [];
  const publicadas = guardadas.filter((g) => g.publicada).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Notas por corte</h1>
          <button onClick={() => navigate('/docente/dashboard')} className="bg-gray-600 text-white px-4 py-2 rounded font-bold">
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
            <div className="text-sm mt-1">Revisa que el nombre coincida con el registrado en la plataforma y que esté matriculado en la asignatura. Puedes volver a pegar solo esas filas.</div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4 mb-4">
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

          <label className="block text-sm font-bold mb-1">Pega aquí la tabla copiada de tu hoja de cálculo (con encabezados)</label>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={8}
            className="w-full border rounded p-2 font-mono text-sm"
            placeholder="Apellidos Nombres [TAB] Participación 7% [TAB] Taller 14% ... [TAB] Nota final"
          />
          <button onClick={handleVistaPrevia} disabled={!texto.trim()} className="mt-3 bg-blue-600 text-white px-4 py-2 rounded font-bold disabled:bg-gray-300">
            Vista previa
          </button>
        </div>

        {preview && (
          <div className="bg-white rounded-lg shadow p-6 mb-6 overflow-x-auto">
            <h2 className="text-xl font-bold mb-3">Vista previa ({preview.filas.length} estudiantes)</h2>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2">Estudiante</th>
                  {preview.columnas.map((c) => (
                    <th key={c.nombre} className="p-2">
                      {c.nombre}
                      {c.peso !== null ? ` (${c.peso}%)` : ''}
                    </th>
                  ))}
                  <th className="p-2">Nota final</th>
                </tr>
              </thead>
              <tbody>
                {preview.filas.map((f) => (
                  <tr key={f.nombre} className="border-b">
                    <td className="p-2">{f.nombre}</td>
                    {f.notas.map((n, i) => (
                      <td key={i} className="p-2">
                        {n ?? '-'}
                      </td>
                    ))}
                    <td className="p-2 font-bold">{f.nota_final ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={handleGuardar} disabled={trabajando || !asignaturaId} className="mt-4 bg-green-600 text-white px-4 py-2 rounded font-bold disabled:bg-gray-300">
              Guardar notas del corte {corte}
            </button>
          </div>
        )}

        {guardadas.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
            <div className="flex flex-wrap justify-between items-center mb-3 gap-2">
              <h2 className="text-xl font-bold">
                Corte {corte} guardado — {publicadas}/{guardadas.length} publicadas
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
                  {columnasGuardadas.map((c) => (
                    <th key={c.nombre} className="p-2">
                      {c.nombre}
                      {c.peso !== null ? ` (${c.peso}%)` : ''}
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
