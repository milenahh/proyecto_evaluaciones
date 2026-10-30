import pool from '../db.js';

export interface ItemResultado {
  numero: number;
  pregunta_id: number;
  detalle_id: number | null;
  enunciado: string;
  tipo: string;
  respuesta: string;
  correcta: boolean | null;
  puntaje: number;
  puntaje_maximo: number;
  retroalimentacion: string | null;
  respuesta_correcta: string | null;
  respuesta_esperada: string | null;
}

export interface ResultadoCalculado {
  puntaje_automatico: number;
  puntaje_manual: number;
  puntaje_final: number;
  puntaje_total: number;
  items: ItemResultado[];
}

export const calcularResultado = async (evaluacionId: number, respuestaId: number): Promise<ResultadoCalculado> => {
  const evalRes = await pool.query('SELECT puntaje_total FROM evaluaciones WHERE id = $1', [evaluacionId]);
  const puntajeTotal = parseFloat(evalRes.rows[0]?.puntaje_total) || 0;

  const pregRes = await pool.query(
    'SELECT id, tipo, enunciado, respuesta_esperada FROM preguntas WHERE evaluacion_id = $1 ORDER BY orden, id',
    [evaluacionId]
  );
  const preguntas = pregRes.rows;
  const porPregunta = preguntas.length > 0 ? puntajeTotal / preguntas.length : 0;

  const opRes = await pool.query(
    `SELECT id, pregunta_id, contenido, es_correcta FROM opciones
     WHERE pregunta_id IN (SELECT id FROM preguntas WHERE evaluacion_id = $1)`,
    [evaluacionId]
  );
  const opciones: Record<number, any> = {};
  opRes.rows.forEach((o: any) => { opciones[o.id] = o; });

  const detRes = await pool.query(
    `SELECT id, pregunta_id, respuesta_texto, puntaje_obtenido, retroalimentacion
     FROM respuesta_detalle WHERE respuesta_estudiante_id = $1`,
    [respuestaId]
  );
  const detalle: Record<number, any> = {};
  detRes.rows.forEach((d: any) => { detalle[d.pregunta_id] = d; });

  let auto = 0;
  let manual = 0;
  const items: ItemResultado[] = preguntas.map((p: any, i: number) => {
    const d = detalle[p.id];
    let respuesta = 'Sin respuesta';
    let respuestaCorrecta: string | null = null;
    let correcta: boolean | null = null;
    let puntaje = 0;

    if (d && d.respuesta_texto) {
      respuesta = String(d.respuesta_texto).trim();
    }
    if (p.tipo === 'seleccion_multiple') {
      const texto = d && d.respuesta_texto ? String(d.respuesta_texto).trim() : '';
      const op = /^\d+$/.test(texto) ? opciones[parseInt(texto)] : null;
      if (op && op.pregunta_id === p.id) respuesta = op.contenido;
      correcta = !!(op && op.pregunta_id === p.id && op.es_correcta);
      respuestaCorrecta = Object.values(opciones)
        .filter((o: any) => o.pregunta_id === p.id && o.es_correcta)
        .map((o: any) => o.contenido).join(' | ') || null;
      puntaje = correcta ? porPregunta : 0;
      auto += puntaje;
    } else if (d && d.puntaje_obtenido !== null && d.puntaje_obtenido !== undefined) {
      puntaje = parseFloat(d.puntaje_obtenido);
      manual += puntaje;
    }
    return {
      numero: i + 1,
      pregunta_id: p.id,
      detalle_id: d ? d.id : null,
      enunciado: p.enunciado,
      tipo: p.tipo,
      respuesta,
      correcta,
      puntaje: Number(puntaje.toFixed(2)),
      puntaje_maximo: Number(porPregunta.toFixed(2)),
      retroalimentacion: d ? d.retroalimentacion : null,
      respuesta_correcta: respuestaCorrecta,
      respuesta_esperada: p.tipo !== 'seleccion_multiple' ? (p.respuesta_esperada || null) : null,
    };
  });

  return {
    puntaje_automatico: Number(auto.toFixed(2)),
    puntaje_manual: Number(manual.toFixed(2)),
    puntaje_final: Number((auto + manual).toFixed(2)),
    puntaje_total: puntajeTotal,
    items,
  };
};
