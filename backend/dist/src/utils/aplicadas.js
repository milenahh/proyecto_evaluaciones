import pool from '../db.js';
// Marca que guarda aplicarParcial en log_incidentes para respuestas registradas por la coordinación
export const todasAplicadas = async (evaluacionId, ids) => {
    if (!Array.isArray(ids) || ids.length === 0)
        return false;
    const idsNum = ids.map((x) => parseInt(x));
    const r = await pool.query(`SELECT COUNT(*)::int AS n FROM respuestas_estudiante
     WHERE evaluacion_id = $1 AND id = ANY($2::int[])
       AND log_incidentes::text LIKE '%aplicada_por_coordinador%'`, [evaluacionId, idsNum]);
    return r.rows[0].n === idsNum.length;
};
export const detalleEsAplicado = async (evaluacionId, detalleId) => {
    const r = await pool.query(`SELECT 1 FROM respuesta_detalle rd
     JOIN respuestas_estudiante re ON re.id = rd.respuesta_estudiante_id
     WHERE rd.id = $1 AND re.evaluacion_id = $2
       AND re.log_incidentes::text LIKE '%aplicada_por_coordinador%'`, [detalleId, evaluacionId]);
    return r.rows.length > 0;
};
