import { Response } from 'express';
import pool from '../db.js';
import { AuthRequest } from '../middleware/auth.js';
import { calcularResultado } from '../utils/calificacion.js';

export const publicarCalificaciones = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { publicar, respuesta_ids } = req.body;

    const evalRes = await pool.query('SELECT docente_id FROM evaluaciones WHERE id = $1', [id]);
    const evaluacion = evalRes.rows[0];
    if (!evaluacion) return res.status(404).json({ error: 'Evaluación no encontrada' });
    if (req.role !== 'admin' && evaluacion.docente_id !== req.userId) {
      return res.status(403).json({ error: 'No tienes permiso sobre esta evaluación' });
    }

    let query = 'SELECT id FROM respuestas_estudiante WHERE evaluacion_id = $1';
    const params: any[] = [id];
    if (Array.isArray(respuesta_ids) && respuesta_ids.length > 0) {
      query += ' AND id = ANY($2::int[])';
      params.push(respuesta_ids.map((x: any) => parseInt(x)));
    }
    const respuestas = await pool.query(query, params);

    for (const r of respuestas.rows) {
      if (publicar) {
        const calc = await calcularResultado(parseInt(id), r.id);
        await pool.query(
          `UPDATE respuestas_estudiante
           SET calificacion_publicada = true, fecha_publicacion = NOW(),
               puntaje_obtenido = $1, puntaje_manual_total = $2, puntaje_final = $3,
               fecha_calificacion_completa = NOW()
           WHERE id = $4`,
          [calc.puntaje_automatico, calc.puntaje_manual, calc.puntaje_final, r.id]
        );
      } else {
        await pool.query(
          'UPDATE respuestas_estudiante SET calificacion_publicada = false, fecha_publicacion = NULL WHERE id = $1',
          [r.id]
        );
      }
    }

    res.json({ success: true, cantidad: respuestas.rows.length });
  } catch (e: any) {
    console.error('Error publicarCalificaciones:', e.message);
    res.status(500).json({ error: e.message });
  }
};

export const obtenerMiResultado = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const respRes = await pool.query(
      `SELECT re.id, re.calificacion_publicada, re.fecha_publicacion, e.titulo
       FROM respuestas_estudiante re
       JOIN evaluaciones e ON e.id = re.evaluacion_id
       WHERE re.evaluacion_id = $1 AND re.estudiante_id = $2`,
      [id, req.userId]
    );
    const respuesta = respRes.rows[0];
    if (!respuesta) return res.status(404).json({ error: 'No has presentado esta evaluación' });
    if (!respuesta.calificacion_publicada) {
      return res.json({ publicada: false, titulo: respuesta.titulo });
    }
    const calc = await calcularResultado(parseInt(id), respuesta.id);
    res.json({
      publicada: true,
      titulo: respuesta.titulo,
      fecha_publicacion: respuesta.fecha_publicacion,
      ...calc,
    });
  } catch (e: any) {
    console.error('Error obtenerMiResultado:', e.message);
    res.status(500).json({ error: e.message });
  }
};
