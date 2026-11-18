import { Response } from 'express';
import pool from '../db.js';
import { AuthRequest } from '../middleware/auth.js';

// El docente habilita o deshabilita el parcial para que aparezca a los estudiantes
export const toggleHabilitada = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const habilitada = !!req.body.habilitada;
    const result = await pool.query(
      `UPDATE evaluaciones SET habilitada = $1
       WHERE id = $2 AND ($3 = 'admin' OR docente_id = $4)
       RETURNING id, habilitada`,
      [habilitada, id, req.role, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Evaluación no encontrada o sin permiso' });
    }
    res.json(result.rows[0]);
  } catch (e: any) {
    console.error('Error toggleHabilitada:', e.message);
    res.status(500).json({ error: e.message });
  }
};

// El docente decide si el parcial aparece en la consulta del coordinador
export const toggleVisibleCoordinador = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const visible = !!req.body.visible;
    const result = await pool.query(
      `UPDATE evaluaciones SET visible_coordinador = $1
       WHERE id = $2 AND ($3 = 'admin' OR docente_id = $4)
       RETURNING id, visible_coordinador`,
      [visible, id, req.role, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Evaluación no encontrada o sin permiso' });
    }
    res.json(result.rows[0]);
  } catch (e: any) {
    console.error('Error toggleVisibleCoordinador:', e.message);
    res.status(500).json({ error: e.message });
  }
};

// El docente decide qué asignaturas ve el coordinador
export const toggleAsignaturaVisibleCoordinador = async (req: AuthRequest, res: Response) => {
  try {
    const { asignaturaId } = req.params;
    const visible = !!req.body.visible;
    const result = await pool.query(
      `UPDATE asignaturas SET visible_coordinador = $1
       WHERE id = $2 AND ($3 = 'admin' OR EXISTS (
         SELECT 1 FROM docente_asignatura WHERE usuario_id = $4 AND asignatura_id = $2))
       RETURNING id, visible_coordinador`,
      [visible, asignaturaId, req.role, req.userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asignatura no encontrada o sin permiso' });
    }
    res.json(result.rows[0]);
  } catch (e: any) {
    console.error('Error toggleAsignaturaVisibleCoordinador:', e.message);
    res.status(500).json({ error: e.message });
  }
};

