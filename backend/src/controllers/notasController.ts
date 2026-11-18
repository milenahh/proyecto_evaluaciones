import { Response } from 'express';
import pool from '../db.js';
import { AuthRequest } from '../middleware/auth.js';

const normalizar = (s: string): string[] =>
  String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .sort();

const mismosTokens = (a: string[], b: string[]) => a.length === b.length && a.every((t, i) => t === b[i]);
const contiene = (grande: string[], chico: string[]) => chico.length > 0 && chico.every((t) => grande.includes(t));

const puedeGestionar = async (req: AuthRequest, asignaturaId: number): Promise<boolean> => {
  if (req.role === 'admin') return true;
  if (req.role === 'coordinador') {
    const v = await pool.query('SELECT visible_coordinador FROM asignaturas WHERE id = $1', [asignaturaId]);
    return v.rows[0]?.visible_coordinador === true;
  }
  const r = await pool.query(
    'SELECT 1 FROM docente_asignatura WHERE usuario_id = $1 AND asignatura_id = $2 LIMIT 1',
    [req.userId, asignaturaId]
  );
  return r.rows.length > 0;
};

const cargarActividades = async (asignaturaId: number, corte: number) => {
  const r = await pool.query(
    `SELECT nombre, porcentaje::float AS porcentaje FROM actividades_corte
     WHERE asignatura_id = $1 AND corte = $2 ORDER BY orden`,
    [asignaturaId, corte]
  );
  return r.rows as { nombre: string; porcentaje: number }[];
};

export const listarActividades = async (req: AuthRequest, res: Response) => {
  try {
    const asignaturaId = parseInt(String(req.query.asignatura_id));
    const corte = parseInt(String(req.query.corte));
    if (!asignaturaId || ![1, 2, 3].includes(corte)) return res.status(400).json({ error: 'Datos incompletos' });
    if (!(await puedeGestionar(req, asignaturaId))) return res.status(403).json({ error: 'No tienes permiso sobre esta asignatura' });
    res.json(await cargarActividades(asignaturaId, corte));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const guardarActividades = async (req: AuthRequest, res: Response) => {
  const client = await pool.connect();
  let enTransaccion = false;
  try {
    const asignaturaId = parseInt(req.body.asignatura_id);
    const corte = parseInt(req.body.corte);
    const actividades = req.body.actividades;
    if (!asignaturaId || ![1, 2, 3].includes(corte) || !Array.isArray(actividades)) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }
    if (!(await puedeGestionar(req, asignaturaId))) return res.status(403).json({ error: 'No tienes permiso sobre esta asignatura' });

    const limpias: { nombre: string; porcentaje: number }[] = [];
    for (const a of actividades) {
      const nombre = String(a.nombre || '').trim();
      const porcentaje = Number(String(a.porcentaje).replace(',', '.'));
      if (!nombre) return res.status(400).json({ error: 'Cada actividad necesita un nombre' });
      if (!(porcentaje > 0 && porcentaje <= 100)) return res.status(400).json({ error: `El porcentaje de "${nombre}" debe estar entre 0 y 100` });
      limpias.push({ nombre, porcentaje });
    }
    const total = limpias.reduce((acc, a) => acc + a.porcentaje, 0);
    if (total > 100) return res.status(400).json({ error: `Las actividades suman ${total}%. No pueden pasar de 100%` });

    await client.query('BEGIN');
    enTransaccion = true;
    await client.query('DELETE FROM actividades_corte WHERE asignatura_id = $1 AND corte = $2', [asignaturaId, corte]);
    for (let i = 0; i < limpias.length; i++) {
      await client.query(
        'INSERT INTO actividades_corte (asignatura_id, corte, orden, nombre, porcentaje) VALUES ($1, $2, $3, $4, $5)',
        [asignaturaId, corte, i + 1, limpias[i].nombre, limpias[i].porcentaje]
      );
    }
    await client.query('COMMIT');
    enTransaccion = false;
    res.json({ success: true, total });
  } catch (e: any) {
    if (enTransaccion) await client.query('ROLLBACK').catch(() => {});
    console.error('Error guardarActividades:', e.message);
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
};

// filas: [{ nombre, notas: [n1, n2, ...] }] en el mismo orden de las actividades (escala 0 a 5)
export const importarNotas = async (req: AuthRequest, res: Response) => {
  try {
    const asignaturaId = parseInt(req.body.asignatura_id);
    const corte = parseInt(req.body.corte);
    const filas = req.body.filas;
    if (!asignaturaId || ![1, 2, 3].includes(corte) || !Array.isArray(filas)) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }
    if (!(await puedeGestionar(req, asignaturaId))) return res.status(403).json({ error: 'No tienes permiso sobre esta asignatura' });

    const actividades = await cargarActividades(asignaturaId, corte);
    if (actividades.length === 0) {
      return res.status(400).json({ error: 'Primero define las actividades del corte' });
    }

    const estRes = await pool.query(
      `SELECT u.id, u.nombre_completo, u.apellido FROM usuarios u
       JOIN estudiante_asignatura ea ON ea.estudiante_id = u.id
       WHERE ea.asignatura_id = $1 AND u.rol = 'estudiante'`,
      [asignaturaId]
    );
    const estudiantes = estRes.rows.map((e: any) => ({
      id: e.id,
      tokens: normalizar(`${e.nombre_completo} ${e.apellido || ''}`),
    }));

    let importadas = 0;
    const sinCoincidencia: string[] = [];
    const errores: string[] = [];
    const usados = new Set<number>();

    for (const fila of filas) {
      const tokens = normalizar(fila.nombre);
      if (tokens.length === 0) continue;

      let candidatos = estudiantes.filter((e) => mismosTokens(e.tokens, tokens));
      if (candidatos.length !== 1) {
        candidatos = estudiantes.filter((e) => contiene(e.tokens, tokens) || contiene(tokens, e.tokens));
      }
      if (candidatos.length !== 1 || usados.has(candidatos[0].id)) {
        sinCoincidencia.push(fila.nombre);
        continue;
      }
      const estudiante = candidatos[0];
      usados.add(estudiante.id);

      const notas: number[] = [];
      let valida = true;
      for (let i = 0; i < actividades.length; i++) {
        const v = fila.notas?.[i];
        const n = v === null || v === undefined || v === '' ? 0 : Number(v);
        if (!(n >= 0 && n <= 5)) {
          valida = false;
          errores.push(`${fila.nombre}: nota inválida en "${actividades[i].nombre}"`);
          break;
        }
        notas.push(n);
      }
      if (!valida) continue;

      const componentes = actividades.map((a, i) => ({ nombre: a.nombre, peso: a.porcentaje, nota: notas[i] }));
      const nota_final = Number((notas.reduce((acc, n, i) => acc + n * actividades[i].porcentaje, 0) / 100).toFixed(2));

      await pool.query(
        `INSERT INTO notas_corte (asignatura_id, estudiante_id, corte, componentes, nota_final, docente_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (asignatura_id, estudiante_id, corte)
         DO UPDATE SET componentes = EXCLUDED.componentes, nota_final = EXCLUDED.nota_final,
                       docente_id = EXCLUDED.docente_id, fecha_actualizacion = NOW()`,
        [asignaturaId, estudiante.id, corte, JSON.stringify(componentes), nota_final, req.userId]
      );
      importadas++;
    }

    res.json({ importadas, sin_coincidencia: sinCoincidencia, errores });
  } catch (e: any) {
    console.error('Error importarNotas:', e.message);
    res.status(500).json({ error: e.message });
  }
};

export const listarNotasCorte = async (req: AuthRequest, res: Response) => {
  try {
    const asignaturaId = parseInt(req.params.asignaturaId);
    const corte = parseInt(req.params.corte);
    if (!(await puedeGestionar(req, asignaturaId))) {
      return res.status(403).json({ error: 'No tienes permiso sobre esta asignatura' });
    }
    const result = await pool.query(
      `SELECT n.id, n.estudiante_id, TRIM(u.apellido || ' ' || u.nombre_completo) AS nombre,
              n.componentes, n.nota_final, n.publicada, n.fecha_publicacion
       FROM notas_corte n JOIN usuarios u ON u.id = n.estudiante_id
       WHERE n.asignatura_id = $1 AND n.corte = $2
       ORDER BY u.apellido, u.nombre_completo`,
      [asignaturaId, corte]
    );
    res.json(result.rows);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const publicarNotasCorte = async (req: AuthRequest, res: Response) => {
  try {
    const { asignatura_id, corte, publicar, estudiante_id } = req.body;
    const asignaturaId = parseInt(asignatura_id);
    if (!(await puedeGestionar(req, asignaturaId))) {
      return res.status(403).json({ error: 'No tienes permiso sobre esta asignatura' });
    }
    const params: any[] = [!!publicar, asignaturaId, parseInt(corte)];
    let filtro = '';
    if (estudiante_id) {
      filtro = ' AND estudiante_id = $4';
      params.push(parseInt(estudiante_id));
    }
    const result = await pool.query(
      `UPDATE notas_corte
       SET publicada = $1, fecha_publicacion = CASE WHEN $1 THEN NOW() ELSE NULL END
       WHERE asignatura_id = $2 AND corte = $3${filtro}`,
      params
    );
    res.json({ success: true, cantidad: result.rowCount });
  } catch (e: any) {
    console.error('Error publicarNotasCorte:', e.message);
    res.status(500).json({ error: e.message });
  }
};

export const misNotas = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT n.asignatura_id, a.nombre AS asignatura, n.corte, n.componentes, n.nota_final, n.fecha_publicacion
       FROM notas_corte n JOIN asignaturas a ON a.id = n.asignatura_id
       WHERE n.estudiante_id = $1 AND n.publicada = true
       ORDER BY a.nombre, n.corte`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};
