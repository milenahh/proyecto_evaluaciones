import { Response } from 'express';
import pool from '../db.js';
import { AuthRequest } from '../middleware/auth.js';

export const crearPregunta = async (req: AuthRequest, res: Response) => {
  try {
    const { evaluacionId } = req.params;
    const { tipo, enunciado, opciones } = req.body;

    const orden = await pool.query(
      'SELECT COALESCE(MAX(orden), 0) + 1 as siguiente FROM preguntas WHERE evaluacion_id = $1',
      [evaluacionId]
    );

    const pregRes = await pool.query(
      `INSERT INTO preguntas (evaluacion_id, enunciado, tipo, orden)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [evaluacionId, enunciado, tipo, orden.rows[0].siguiente]
    );

    const pregId = pregRes.rows[0].id;

    if (tipo === 'seleccion_multiple' && opciones?.length > 0) {
      for (const op of opciones) {
        await pool.query(
          `INSERT INTO opciones (pregunta_id, contenido, es_correcta)
           VALUES ($1, $2, $3)`,
          [pregId, op.contenido, op.es_correcta]
        );
      }
    }

    res.status(201).json({ id: pregId });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

export const obtenerPreguntasPorEvaluacion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT p.id, p.evaluacion_id, p.enunciado, p.tipo, p.orden,
              json_agg(json_build_object('id', o.id, 'contenido', o.contenido, 'es_correcta', o.es_correcta)) as opciones
       FROM preguntas p
       LEFT JOIN opciones o ON p.id = o.pregunta_id
       WHERE p.evaluacion_id = $1
       GROUP BY p.id, p.evaluacion_id, p.enunciado, p.tipo, p.orden
       ORDER BY p.orden`,
      [id]
    );
    res.json(result.rows);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const editarPregunta = async (req: AuthRequest, res: Response) => {
  try {
    const { preguntaId } = req.params;
    const { enunciado, opciones } = req.body;

    await pool.query(
      `UPDATE preguntas SET enunciado = $1 WHERE id = $2`,
      [enunciado, preguntaId]
    );

    if (opciones && opciones.length > 0) {
      await pool.query(`DELETE FROM opciones WHERE pregunta_id = $1`, [preguntaId]);
      for (const op of opciones) {
        await pool.query(
          `INSERT INTO opciones (pregunta_id, contenido, es_correcta) VALUES ($1, $2, $3)`,
          [preguntaId, op.contenido, op.es_correcta]
        );
      }
    }

    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const eliminarPregunta = async (req: AuthRequest, res: Response) => {
  try {
    const { preguntaId } = req.params;
    await pool.query(`DELETE FROM opciones WHERE pregunta_id = $1`, [preguntaId]);
    await pool.query(`DELETE FROM preguntas WHERE id = $1`, [preguntaId]);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};
