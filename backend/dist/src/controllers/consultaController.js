import pool from '../db.js';
import { calcularResultado } from '../utils/calificacion.js';
export const asignaturasConsulta = async (_req, res) => {
    try {
        const result = await pool.query(`SELECT a.id, a.nombre,
              (SELECT COUNT(*) FROM evaluaciones e WHERE e.asignatura_id = a.id)::int AS total_evaluaciones
       FROM asignaturas a ORDER BY a.nombre`);
        res.json(result.rows);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
};
export const evaluacionesConsulta = async (req, res) => {
    try {
        const result = await pool.query(`SELECT e.id, e.titulo, e.corte, e.estado, e.puntaje_total, e.fecha_inicio, e.fecha_fin,
              COALESCE(e.archivada, false) AS archivada,
              TRIM(d.nombre_completo || ' ' || COALESCE(d.apellido, '')) AS docente,
              (SELECT COUNT(*) FROM respuestas_estudiante re WHERE re.evaluacion_id = e.id)::int AS participantes,
              (SELECT COUNT(*) FROM estudiante_asignatura ea WHERE ea.asignatura_id = e.asignatura_id)::int AS matriculados
       FROM evaluaciones e
       LEFT JOIN usuarios d ON d.id = e.docente_id
       WHERE e.asignatura_id = $1
       ORDER BY e.corte NULLS LAST, e.id`, [parseInt(req.params.asignaturaId)]);
        res.json(result.rows);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
};
export const participantesConsulta = async (req, res) => {
    try {
        const evaluacionId = parseInt(req.params.evaluacionId);
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
        const info = await pool.query(`SELECT re.id, TRIM(u.apellido || ' ' || u.nombre_completo) AS nombre, re.fecha_envio, re.cambios_pestana
       FROM respuestas_estudiante re JOIN usuarios u ON u.id = re.estudiante_id
       WHERE re.id = $1 AND re.evaluacion_id = $2`, [respuestaId, evaluacionId]);
        if (info.rows.length === 0)
            return res.status(404).json({ error: 'Respuesta no encontrada' });
        const calc = await calcularResultado(evaluacionId, respuestaId);
        res.json({ estudiante: info.rows[0], resultado: calc });
    }
    catch (e) {
        console.error('Error detalleConsulta:', e.message);
        res.status(500).json({ error: e.message });
    }
};
export const notasCorteConsulta = async (req, res) => {
    try {
        const result = await pool.query(`SELECT n.corte, TRIM(u.apellido || ' ' || u.nombre_completo) AS nombre, n.componentes, n.nota_final, n.publicada
       FROM notas_corte n JOIN usuarios u ON u.id = n.estudiante_id
       WHERE n.asignatura_id = $1
       ORDER BY n.corte, u.apellido, u.nombre_completo`, [parseInt(req.params.asignaturaId)]);
        res.json(result.rows);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
};
