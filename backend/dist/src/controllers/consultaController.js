import pool from '../db.js';
import { calcularResultado } from '../utils/calificacion.js';
import { detalleEsAplicado } from '../utils/aplicadas.js';
// Admin y coordinador ven todo. El docente solo ve sus asignaturas asignadas.
const accesoAsignatura = async (req, asignaturaId) => {
    if (req.role === 'admin' || req.role === 'coordinador')
        return true;
    if (req.role !== 'docente')
        return false;
    const r = await pool.query('SELECT 1 FROM docente_asignatura WHERE usuario_id = $1 AND asignatura_id = $2 LIMIT 1', [req.userId, asignaturaId]);
    return r.rows.length > 0;
};
const asignaturaDeEvaluacion = async (evaluacionId) => {
    const r = await pool.query('SELECT asignatura_id FROM evaluaciones WHERE id = $1', [evaluacionId]);
    return r.rows[0]?.asignatura_id ?? null;
};
const accesoEvaluacion = async (req, evaluacionId) => {
    const asig = await asignaturaDeEvaluacion(evaluacionId);
    return asig !== null && (await accesoAsignatura(req, asig));
};
export const asignaturasConsulta = async (req, res) => {
    try {
        const params = [];
        let filtro = '';
        if (req.role === 'docente') {
            filtro = 'JOIN docente_asignatura da ON da.asignatura_id = a.id AND da.usuario_id = $1';
            params.push(req.userId);
        }
        const result = await pool.query(`SELECT a.id, a.nombre,
              (SELECT COUNT(*) FROM evaluaciones e WHERE e.asignatura_id = a.id)::int AS total_evaluaciones
       FROM asignaturas a ${filtro} ORDER BY a.nombre`, params);
        res.json(result.rows);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
};
export const evaluacionesConsulta = async (req, res) => {
    try {
        const asignaturaId = parseInt(req.params.asignaturaId);
        if (!(await accesoAsignatura(req, asignaturaId)))
            return res.status(403).json({ error: 'Sin acceso a esta asignatura' });
        const result = await pool.query(`SELECT e.id, e.titulo, e.corte, e.estado, e.puntaje_total, e.fecha_inicio, e.fecha_fin,
              COALESCE(e.archivada, false) AS archivada,
              TRIM(d.nombre_completo || ' ' || COALESCE(d.apellido, '')) AS docente,
              (SELECT COUNT(*) FROM respuestas_estudiante re WHERE re.evaluacion_id = e.id)::int AS participantes,
              (SELECT COUNT(*) FROM estudiante_asignatura ea WHERE ea.asignatura_id = e.asignatura_id)::int AS matriculados
       FROM evaluaciones e
       LEFT JOIN usuarios d ON d.id = e.docente_id
       WHERE e.asignatura_id = $1
       ORDER BY e.corte NULLS LAST, e.id`, [asignaturaId]);
        res.json(result.rows);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
};
export const estudiantesConsulta = async (req, res) => {
    try {
        const asignaturaId = parseInt(req.params.asignaturaId);
        if (!(await accesoAsignatura(req, asignaturaId)))
            return res.status(403).json({ error: 'Sin acceso a esta asignatura' });
        const result = await pool.query(`SELECT u.id, TRIM(u.apellido || ' ' || u.nombre_completo) AS nombre,
              (SELECT COUNT(*) FROM respuestas_estudiante re JOIN evaluaciones e ON e.id = re.evaluacion_id
                 WHERE e.asignatura_id = $1 AND re.estudiante_id = u.id)::int AS parciales_presentados,
              (SELECT COUNT(*) FROM respuestas_estudiante re JOIN evaluaciones e ON e.id = re.evaluacion_id
                 WHERE e.asignatura_id = $1 AND re.estudiante_id = u.id AND re.calificacion_publicada)::int AS parciales_publicados,
              (SELECT COUNT(*) FROM notas_corte n WHERE n.asignatura_id = $1 AND n.estudiante_id = u.id AND n.publicada)::int AS cortes_publicados
       FROM estudiante_asignatura ea
       JOIN usuarios u ON u.id = ea.estudiante_id
       WHERE ea.asignatura_id = $1 AND u.rol = 'estudiante'
       ORDER BY u.apellido, u.nombre_completo`, [asignaturaId]);
        res.json(result.rows);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
};
// Lo mismo que ve el estudiante en su dashboard: notas por corte publicadas y parciales publicados
export const vistaEstudianteConsulta = async (req, res) => {
    try {
        const asignaturaId = parseInt(req.params.asignaturaId);
        const estudianteId = parseInt(req.params.estudianteId);
        if (!(await accesoAsignatura(req, asignaturaId)))
            return res.status(403).json({ error: 'Sin acceso a esta asignatura' });
        const mat = await pool.query('SELECT 1 FROM estudiante_asignatura WHERE estudiante_id = $1 AND asignatura_id = $2', [estudianteId, asignaturaId]);
        if (mat.rows.length === 0)
            return res.status(404).json({ error: 'El estudiante no está matriculado en esta asignatura' });
        const notas = await pool.query(`SELECT corte, componentes, nota_final FROM notas_corte
       WHERE asignatura_id = $1 AND estudiante_id = $2 AND publicada = true
       ORDER BY corte`, [asignaturaId, estudianteId]);
        const resp = await pool.query(`SELECT re.id, re.evaluacion_id, e.titulo, e.corte
       FROM respuestas_estudiante re JOIN evaluaciones e ON e.id = re.evaluacion_id
       WHERE e.asignatura_id = $1 AND re.estudiante_id = $2 AND re.calificacion_publicada = true
       ORDER BY e.id`, [asignaturaId, estudianteId]);
        const parciales = [];
        for (const r of resp.rows) {
            const calc = await calcularResultado(r.evaluacion_id, r.id);
            parciales.push({ titulo: r.titulo, corte: r.corte, puntaje_total: calc.puntaje_total, puntaje_final: calc.puntaje_final, items: calc.items });
        }
        res.json({ notas: notas.rows, parciales });
    }
    catch (e) {
        console.error('Error vistaEstudianteConsulta:', e.message);
        res.status(500).json({ error: e.message });
    }
};
export const participantesConsulta = async (req, res) => {
    try {
        const evaluacionId = parseInt(req.params.evaluacionId);
        if (!(await accesoEvaluacion(req, evaluacionId)))
            return res.status(403).json({ error: 'Sin acceso a esta evaluación' });
        const evalRes = await pool.query('SELECT id, titulo, corte, puntaje_total FROM evaluaciones WHERE id = $1', [evaluacionId]);
        if (evalRes.rows.length === 0)
            return res.status(404).json({ error: 'Evaluación no encontrada' });
        const resp = await pool.query(`SELECT re.id, re.estudiante_id, TRIM(u.apellido || ' ' || u.nombre_completo) AS nombre,
              re.estado, re.fecha_envio, re.cambios_pestana
       FROM respuestas_estudiante re JOIN usuarios u ON u.id = re.estudiante_id
       WHERE re.evaluacion_id = $1 ORDER BY u.apellido, u.nombre_completo`, [evaluacionId]);
        const participantes = [];
        for (const r of resp.rows) {
            const calc = await calcularResultado(evaluacionId, r.id);
            participantes.push({ ...r, puntaje_final: calc.puntaje_final });
        }
        res.json({ evaluacion: evalRes.rows[0], participantes });
    }
    catch (e) {
        console.error('Error participantesConsulta:', e.message);
        res.status(500).json({ error: e.message });
    }
};
export const detalleConsulta = async (req, res) => {
    try {
        const evaluacionId = parseInt(req.params.evaluacionId);
        const respuestaId = parseInt(req.params.respuestaId);
        if (!(await accesoEvaluacion(req, evaluacionId)))
            return res.status(403).json({ error: 'Sin acceso a esta evaluación' });
        const info = await pool.query(`SELECT re.id, TRIM(u.apellido || ' ' || u.nombre_completo) AS nombre, re.fecha_envio, re.cambios_pestana
       FROM respuestas_estudiante re JOIN usuarios u ON u.id = re.estudiante_id
       WHERE re.id = $1 AND re.evaluacion_id = $2`, [respuestaId, evaluacionId]);
        if (info.rows.length === 0)
            return res.status(404).json({ error: 'Respuesta no encontrada' });
        const calc = await calcularResultado(evaluacionId, respuestaId);
        res.json({ respuesta_id: respuestaId, estudiante: info.rows[0], resultado: calc });
    }
    catch (e) {
        console.error('Error detalleConsulta:', e.message);
        res.status(500).json({ error: e.message });
    }
};
export const notasCorteConsulta = async (req, res) => {
    try {
        const asignaturaId = parseInt(req.params.asignaturaId);
        if (!(await accesoAsignatura(req, asignaturaId)))
            return res.status(403).json({ error: 'Sin acceso a esta asignatura' });
        const result = await pool.query(`SELECT n.corte, TRIM(u.apellido || ' ' || u.nombre_completo) AS nombre, n.componentes, n.nota_final, n.publicada
       FROM notas_corte n JOIN usuarios u ON u.id = n.estudiante_id
       WHERE n.asignatura_id = $1
       ORDER BY n.corte, u.apellido, u.nombre_completo`, [asignaturaId]);
        res.json(result.rows);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
};
export const datosAplicar = async (req, res) => {
    try {
        const evaluacionId = parseInt(req.params.evaluacionId);
        if (!(await accesoEvaluacion(req, evaluacionId)))
            return res.status(403).json({ error: 'Sin acceso a esta evaluación' });
        const ev = await pool.query('SELECT id, titulo, puntaje_total, asignatura_id FROM evaluaciones WHERE id = $1', [evaluacionId]);
        if (ev.rows.length === 0)
            return res.status(404).json({ error: 'Evaluación no encontrada' });
        const preguntas = await pool.query(`SELECT p.id, p.enunciado, p.tipo, p.orden, p.respuesta_esperada,
              COALESCE(json_agg(json_build_object('id', o.id, 'contenido', o.contenido, 'es_correcta', o.es_correcta)) FILTER (WHERE o.id IS NOT NULL), '[]'::json) AS opciones
       FROM preguntas p
       LEFT JOIN opciones o ON o.pregunta_id = p.id
       WHERE p.evaluacion_id = $1
       GROUP BY p.id, p.enunciado, p.tipo, p.orden, p.respuesta_esperada
       ORDER BY p.orden, p.id`, [evaluacionId]);
        const pendientes = await pool.query(`SELECT u.id, TRIM(u.apellido || ' ' || u.nombre_completo) AS nombre,
              EXISTS (SELECT 1 FROM respuestas_estudiante re WHERE re.evaluacion_id = $2 AND re.estudiante_id = u.id) AS ya_respondio
       FROM estudiante_asignatura ea
       JOIN usuarios u ON u.id = ea.estudiante_id
       WHERE ea.asignatura_id = $1 AND u.rol = 'estudiante'
       ORDER BY u.apellido, u.nombre_completo`, [ev.rows[0].asignatura_id, evaluacionId]);
        res.json({ evaluacion: ev.rows[0], preguntas: preguntas.rows, pendientes: pendientes.rows });
    }
    catch (e) {
        console.error('Error datosAplicar:', e.message);
        res.status(500).json({ error: e.message });
    }
};
export const aplicarParcial = async (req, res) => {
    const client = await pool.connect();
    let enTransaccion = false;
    try {
        const evaluacionId = parseInt(req.params.evaluacionId);
        if (!(await accesoEvaluacion(req, evaluacionId)))
            return res.status(403).json({ error: 'Sin acceso a esta evaluación' });
        const estudianteId = parseInt(req.body.estudiante_id);
        const respuestas = req.body.respuestas;
        if (!estudianteId || !Array.isArray(respuestas)) {
            return res.status(400).json({ error: 'Datos incompletos' });
        }
        const ev = await client.query('SELECT asignatura_id FROM evaluaciones WHERE id = $1', [evaluacionId]);
        if (ev.rows.length === 0)
            return res.status(404).json({ error: 'Evaluación no encontrada' });
        const matriculado = await client.query('SELECT 1 FROM estudiante_asignatura WHERE estudiante_id = $1 AND asignatura_id = $2', [estudianteId, ev.rows[0].asignatura_id]);
        if (matriculado.rows.length === 0) {
            return res.status(400).json({ error: 'El estudiante no está matriculado en esta asignatura' });
        }
        await client.query('BEGIN');
        enTransaccion = true;
        const ya = await client.query('SELECT 1 FROM respuestas_estudiante WHERE evaluacion_id = $1 AND estudiante_id = $2 FOR UPDATE', [evaluacionId, estudianteId]);
        if (ya.rows.length > 0) {
            await client.query('ROLLBACK');
            enTransaccion = false;
            return res.status(400).json({ error: 'Este estudiante ya tiene respuestas registradas para este parcial' });
        }
        const log = [{ tipo: 'aplicada_por_coordinador', hora: new Date().toISOString(), usuario_id: req.userId }];
        const r = await client.query(`INSERT INTO respuestas_estudiante (evaluacion_id, estudiante_id, estado, cambios_pestana, log_incidentes)
       VALUES ($1, $2, 'enviada', 0, $3) RETURNING id`, [evaluacionId, estudianteId, JSON.stringify(log)]);
        for (const resp of respuestas) {
            await client.query('INSERT INTO respuesta_detalle (respuesta_estudiante_id, pregunta_id, respuesta_texto) VALUES ($1, $2, $3)', [r.rows[0].id, parseInt(resp.pregunta_id), resp.respuesta_texto ?? null]);
        }
        await client.query('COMMIT');
        enTransaccion = false;
        res.status(201).json({ success: true, respuesta_id: r.rows[0].id });
    }
    catch (e) {
        if (enTransaccion)
            await client.query('ROLLBACK').catch(() => { });
        console.error('Error aplicarParcial:', e.message);
        res.status(500).json({ error: e.message });
    }
    finally {
        client.release();
    }
};
export const puedeCalificarDetalle = async (req, res, next) => {
    if (req.role === 'docente' || req.role === 'admin')
        return next();
    if (req.role !== 'coordinador')
        return res.status(403).json({ error: 'Sin permiso' });
    const ok = await detalleEsAplicado(parseInt(req.params.evaluacionId), parseInt(req.params.respuestaDetalleId));
    if (!ok)
        return res.status(403).json({ error: 'Solo puedes calificar parciales que tú aplicaste' });
    next();
};
