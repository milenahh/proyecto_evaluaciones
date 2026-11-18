import pool from '../db.js';
// Una respuesta cuenta como "de la coordinación" si el estudiante fue habilitado para ese parcial
// o si fue registrada antes por aplicarParcial (marca en log_incidentes).
export const todasAplicadas = async (evaluacionId, ids) => {
    if (!Array.isArray(ids) || ids.length === 0)
        return false;
    const idsNum = ids.map((x) => parseInt(x));
    const r = await pool.query(`SELECT COUNT(*)::int AS n FROM respuestas_estudiante re
     WHERE re.evaluacion_id = $1 AND re.id = ANY($2::int[])
       AND (
         re.log_incidentes::text LIKE '%aplicada_por_coordinador%'
         OR EXISTS (SELECT 1 FROM habilitaciones_parcial h
                    WHERE h.evaluacion_id = re.evaluacion_id AND h.estudiante_id = re.estudiante_id)
       )`, [evaluacionId, idsNum]);
    return r.rows[0].n === idsNum.length;
};
export const detalleEsAplicado = async (evaluacionId, detalleId) => {
    const r = await pool.query(`SELECT 1 FROM respuesta_detalle rd
     JOIN respuestas_estudiante re ON re.id = rd.respuesta_estudiante_id
     WHERE rd.id = $1 AND re.evaluacion_id = $2
       AND (
         re.log_incidentes::text LIKE '%aplicada_por_coordinador%'
         OR EXISTS (SELECT 1 FROM habilitaciones_parcial h
                    WHERE h.evaluacion_id = re.evaluacion_id AND h.estudiante_id = re.estudiante_id)
       )`, [detalleId, evaluacionId]);
    return r.rows.length > 0;
};
