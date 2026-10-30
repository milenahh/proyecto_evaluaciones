import pool from '../db.js';
export const calcularResultado = async (evaluacionId, respuestaId) => {
    const evalRes = await pool.query('SELECT puntaje_total FROM evaluaciones WHERE id = $1', [evaluacionId]);
    const puntajeTotal = parseFloat(evalRes.rows[0]?.puntaje_total) || 0;
    const pregRes = await pool.query('SELECT id, tipo, enunciado, respuesta_esperada FROM preguntas WHERE evaluacion_id = $1 ORDER BY orden, id', [evaluacionId]);
    const preguntas = pregRes.rows;
    const porPregunta = preguntas.length > 0 ? puntajeTotal / preguntas.length : 0;
    const opRes = await pool.query(`SELECT id, pregunta_id, contenido, es_correcta FROM opciones
     WHERE pregunta_id IN (SELECT id FROM preguntas WHERE evaluacion_id = $1)`, [evaluacionId]);
    const opciones = {};
    opRes.rows.forEach((o) => { opciones[o.id] = o; });
    const detRes = await pool.query(`SELECT id, pregunta_id, respuesta_texto, puntaje_obtenido, retroalimentacion
     FROM respuesta_detalle WHERE respuesta_estudiante_id = $1`, [respuestaId]);
    const detalle = {};
    detRes.rows.forEach((d) => { detalle[d.pregunta_id] = d; });
    let auto = 0;
    let manual = 0;
    const items = preguntas.map((p, i) => {
        const d = detalle[p.id];
        let respuesta = 'Sin respuesta';
        let respuestaCorrecta = null;
        let correcta = null;
        let puntaje = 0;
        if (d && d.respuesta_texto) {
            respuesta = String(d.respuesta_texto).trim();
        }
        if (p.tipo === 'seleccion_multiple') {
            const texto = d && d.respuesta_texto ? String(d.respuesta_texto).trim() : '';
            const op = /^\d+$/.test(texto) ? opciones[parseInt(texto)] : null;
            if (op && op.pregunta_id === p.id)
                respuesta = op.contenido;
            correcta = !!(op && op.pregunta_id === p.id && op.es_correcta);
            respuestaCorrecta = Object.values(opciones)
                .filter((o) => o.pregunta_id === p.id && o.es_correcta)
                .map((o) => o.contenido).join(' | ') || null;
            puntaje = correcta ? porPregunta : 0;
            auto += puntaje;
        }
        else if (d && d.puntaje_obtenido !== null && d.puntaje_obtenido !== undefined) {
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
