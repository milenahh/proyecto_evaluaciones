import pool from '../db.js';
// El docente habilita o deshabilita el parcial para que aparezca a los estudiantes
export const toggleHabilitada = async (req, res) => {
    try {
        const { id } = req.params;
        const habilitada = !!req.body.habilitada;
        const result = await pool.query(`UPDATE evaluaciones SET habilitada = $1
       WHERE id = $2 AND ($3 = 'admin' OR docente_id = $4)
       RETURNING id, habilitada`, [habilitada, id, req.role, req.userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Evaluación no encontrada o sin permiso' });
        }
        res.json(result.rows[0]);
    }
    catch (e) {
        console.error('Error toggleHabilitada:', e.message);
        res.status(500).json({ error: e.message });
    }
};
