import { Response } from 'express';
import pool from '../db.js';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';
import { AuthRequest } from '../middleware/auth.js';

export const obtenerEvaluaciones = async (req: AuthRequest, res: Response) => {
  try {
    let query = '';
    let params: any[] = [];

    if (req.role === 'docente') {
      query = `SELECT e.* FROM evaluaciones e WHERE e.docente_id = $1 ORDER BY e.id DESC`;
      params = [req.userId];
    } else if (req.role === 'estudiante') {
      query = `SELECT DISTINCT e.* FROM evaluaciones e
               JOIN asignaturas a ON e.asignatura_id = a.id
               JOIN estudiante_asignatura ea ON a.id = ea.asignatura_id
               WHERE ea.estudiante_id = $1
               ORDER BY e.id DESC`;
      params = [req.userId];
    } else {
      query = `SELECT * FROM evaluaciones ORDER BY id DESC`;
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

export const obtenerRespuestasEstudiante = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id FROM respuestas_estudiante WHERE evaluacion_id = $1 AND estudiante_id = $2',
      [parseInt(id), req.userId]
    );
    res.json(result.rows);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const crearEvaluacion = async (req: AuthRequest, res: Response) => {
  try {
    const { titulo, descripcion, puntaje_total, tiempo_limite_minutos, asignatura_id, fecha_inicio, fecha_fin, contraseña } = req.body;
    const contraseña_hash = contraseña ? await hashPassword(contraseña) : null;
    
    const result = await pool.query(
      `INSERT INTO evaluaciones (titulo, descripcion, puntaje_total, tiempo_limite_minutos, asignatura_id, docente_id, estado, fecha_inicio, fecha_fin, contraseña)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, titulo`,
      [titulo, descripcion, puntaje_total, tiempo_limite_minutos, asignatura_id, req.userId, 'borrador', fecha_inicio, fecha_fin, contraseña_hash]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

export const obtenerAsignaturas = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT a.id, a.nombre FROM asignaturas a
       JOIN docente_asignatura da ON a.id = da.asignatura_id
       WHERE da.usuario_id = $1`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const obtenerEvaluacionPorId = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const result = await pool.query('SELECT * FROM evaluaciones WHERE id = $1', [id]);
  res.json(result.rows[0] || {});
};

export const obtenerRespuestasEvaluacion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT re.id, re.evaluacion_id, re.estudiante_id, u.nombre_completo, re.estado, re.fecha_envio,
              json_agg(json_build_object('pregunta_id', rd.pregunta_id, 'respuesta_texto', rd.respuesta_texto, 'opcion_id', rd.opcion_seleccionada_id)) as respuestas
       FROM respuestas_estudiante re
       JOIN usuarios u ON re.estudiante_id = u.id
       LEFT JOIN respuesta_detalle rd ON re.id = rd.respuesta_estudiante_id
       WHERE re.evaluacion_id = $1
       GROUP BY re.id, re.evaluacion_id, re.estudiante_id, u.nombre_completo, re.estado, re.fecha_envio`,
      [id]
    );
    res.json(result.rows);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const verificarContraseña = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { contraseña } = req.body;

    const result = await pool.query('SELECT contraseña FROM evaluaciones WHERE id = $1', [id]);
    const evaluacion = result.rows[0];

    if (!evaluacion) {
      return res.status(404).json({ error: 'Evaluación no encontrada' });
    }

    if (!evaluacion.contraseña) {
      return res.json({ success: true, message: 'Sin contraseña requerida' });
    }

    const esValida = await comparePassword(contraseña, evaluacion.contraseña);
    if (!esValida) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    res.json({ success: true, message: 'Contraseña correcta' });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const enviarRespuestas = async (req: AuthRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { respuestas } = req.body;
    
    const evalCheck = await pool.query(
      'SELECT fecha_inicio, fecha_fin FROM evaluaciones WHERE id = $1',
      [parseInt(id)]
    );

    const eval_data = evalCheck.rows[0];
    const ahora = new Date();

    if (eval_data.fecha_inicio && new Date(eval_data.fecha_inicio) > ahora) {
      return res.status(400).json({ error: 'La evaluación aún no está disponible' });
    }

    if (eval_data.fecha_fin && new Date(eval_data.fecha_fin) < ahora) {
      return res.status(400).json({ error: 'La evaluación ya ha vencido' });
    }
    
    const existe = await pool.query(
      'SELECT id FROM respuestas_estudiante WHERE evaluacion_id = $1 AND estudiante_id = $2',
      [parseInt(id), req.userId]
    );
    
    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'Ya respondiste esta evaluación' });
    }
    
    const r1 = await pool.query(
      'INSERT INTO respuestas_estudiante (evaluacion_id, estudiante_id, estado) VALUES ($1, $2, $3) RETURNING id',
      [parseInt(id), req.userId, 'enviada']
    );
    
    const respId = r1.rows[0].id;
    for (const resp of respuestas) {
      await pool.query(
        'INSERT INTO respuesta_detalle (respuesta_estudiante_id, pregunta_id, respuesta_texto) VALUES ($1, $2, $3)',
        [respId, resp.pregunta_id, resp.respuesta_texto]
      );
    }
    
    res.json({ success: true });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};

export const borrarRespuestas = async (req: AuthRequest, res: Response) => {
  try {
    const { respuestaId } = req.params;
    await pool.query('DELETE FROM respuesta_detalle WHERE respuesta_estudiante_id = $1', [respuestaId]);
    await pool.query('DELETE FROM respuestas_estudiante WHERE id = $1', [respuestaId]);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const editarEvaluacion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, puntaje_total, tiempo_limite_minutos, fecha_inicio, fecha_fin, contraseña } = req.body;

    let query = `UPDATE evaluaciones SET titulo = $1, descripcion = $2, puntaje_total = $3, tiempo_limite_minutos = $4, fecha_inicio = $5, fecha_fin = $6`;
    let params: any[] = [titulo, descripcion, puntaje_total, tiempo_limite_minutos, fecha_inicio, fecha_fin];

    if (contraseña) {
      const contraseña_hash = await hashPassword(contraseña);
      query += `, contraseña = $7 WHERE id = $8`;
      params.push(contraseña_hash);
    } else {
      query += ` WHERE id = $7`;
    }

    params.push(id);

    await pool.query(query, params);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const eliminarEvaluacion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM respuesta_detalle WHERE respuesta_estudiante_id IN (SELECT id FROM respuestas_estudiante WHERE evaluacion_id = $1)`, [id]);
    await pool.query(`DELETE FROM respuestas_estudiante WHERE evaluacion_id = $1`, [id]);
    await pool.query(`DELETE FROM opciones WHERE pregunta_id IN (SELECT id FROM preguntas WHERE evaluacion_id = $1)`, [id]);
    await pool.query(`DELETE FROM preguntas WHERE evaluacion_id = $1`, [id]);
    await pool.query(`DELETE FROM evaluaciones WHERE id = $1`, [id]);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const calcularPuntaje = async (req: AuthRequest, res: Response) => {
  try {
    const { id, respuestaEstudianteId } = req.params;
    
    const respResult = await pool.query(
      'SELECT * FROM respuestas_estudiante WHERE id = $1 AND evaluacion_id = $2',
      [respuestaEstudianteId, id]
    );
    
    const respuesta = respResult.rows[0];
    if (!respuesta) return res.status(404).json({ error: 'Respuesta no encontrada' });
    
    const evalResult = await pool.query('SELECT puntaje_total FROM evaluaciones WHERE id = $1', [id]);
    const puntaje_total = evalResult.rows[0].puntaje_total;
    
    const preguntasResult = await pool.query('SELECT COUNT(*) as total FROM preguntas WHERE evaluacion_id = $1', [id]);
    const total_preguntas = parseInt(preguntasResult.rows[0].total);
    const puntaje_por_pregunta = total_preguntas > 0 ? puntaje_total / total_preguntas : 0;
    
    const detalleResult = await pool.query(
      `SELECT rd.id, rd.pregunta_id, rd.respuesta_texto, p.tipo, o.es_correcta
       FROM respuesta_detalle rd
       JOIN preguntas p ON rd.pregunta_id = p.id
       LEFT JOIN opciones o ON CASE WHEN rd.respuesta_texto ~ '^[0-9]+$' THEN rd.respuesta_texto::integer ELSE NULL END = o.id AND p.id = o.pregunta_id
       WHERE rd.respuesta_estudiante_id = $1`,
      [respuestaEstudianteId]
    );
    
    let puntaje_automatico = 0;
    const respuestas_con_puntuacion = detalleResult.rows.map((row: any) => {
      let es_correcta = null;
      if (row.tipo === 'seleccion_multiple' && row.es_correcta) {
        es_correcta = true;
        puntaje_automatico += puntaje_por_pregunta;
      } else if (row.tipo === 'seleccion_multiple' && !row.es_correcta) {
        es_correcta = false;
      }
      return { ...row, es_correcta };
    });
    
    res.json({ puntaje_automatico, puntaje_total, respuestas_con_puntuacion });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};

export const calificarRespuestaAbierta = async (req: AuthRequest, res: Response) => {
  try {
    const { respuestaDetalleId } = req.params;
    const { puntaje } = req.body;

    await pool.query(
      'UPDATE respuesta_detalle SET puntaje_obtenido = $1, calificada_manualmente = true, fecha_calificacion = NOW() WHERE id = $2',
      [puntaje, respuestaDetalleId]
    );

    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
};
