import pool from '../db.js';
export const archivarEvaluacion = async (req, res) => {
    try {
        const { id } = req.params;
        const { archivada } = req.body;
        const result = await pool.query(`UPDATE evaluaciones SET archivada = $1
       WHERE id = $2 AND ($3 = 'admin' OR docente_id = $4)
       RETURNING id, archivada`, [!!archivada, id, req.role, req.userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Evaluación no encontrada o sin permiso' });
        }
        res.json(result.rows[0]);
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
};
