import ExcelJS from 'exceljs';
import pool from '../db.js';
export const exportarRespuestasExcel = async (req, res) => {
    try {
        const { id } = req.params;
        const evalRes = await pool.query(`SELECT e.id, e.titulo, e.puntaje_total, e.docente_id, a.nombre AS asignatura
       FROM evaluaciones e
       LEFT JOIN asignaturas a ON a.id = e.asignatura_id
       WHERE e.id = $1`, [id]);
        const evaluacion = evalRes.rows[0];
        if (!evaluacion)
            return res.status(404).json({ error: 'Evaluación no encontrada' });
        if (req.role !== 'admin' && evaluacion.docente_id !== req.userId) {
            return res.status(403).json({ error: 'No tienes permiso sobre esta evaluación' });
        }
        const pregRes = await pool.query(`SELECT id, tipo, enunciado FROM preguntas WHERE evaluacion_id = $1 ORDER BY orden, id`, [id]);
        const preguntas = pregRes.rows;
        const opRes = await pool.query(`SELECT id, pregunta_id, contenido, es_correcta FROM opciones
       WHERE pregunta_id IN (SELECT id FROM preguntas WHERE evaluacion_id = $1)`, [id]);
        const opciones = {};
        opRes.rows.forEach((o) => { opciones[o.id] = o; });
        const respRes = await pool.query(`SELECT re.id, u.nombre_completo, u.apellido, u.email, re.fecha_envio, re.cambios_pestana, re.log_incidentes
       FROM respuestas_estudiante re
       JOIN usuarios u ON u.id = re.estudiante_id
       WHERE re.evaluacion_id = $1
       ORDER BY u.apellido, u.nombre_completo`, [id]);
        const detRes = await pool.query(`SELECT rd.respuesta_estudiante_id, rd.pregunta_id, rd.respuesta_texto, rd.puntaje_obtenido
       FROM respuesta_detalle rd
       JOIN respuestas_estudiante re ON re.id = rd.respuesta_estudiante_id
       WHERE re.evaluacion_id = $1`, [id]);
        const detalle = {};
        detRes.rows.forEach((d) => { detalle[`${d.respuesta_estudiante_id}_${d.pregunta_id}`] = d; });
        const puntajeTotal = parseFloat(evaluacion.puntaje_total) || 0;
        const porPregunta = preguntas.length > 0 ? puntajeTotal / preguntas.length : 0;
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet('Respuestas');
        const columnas = [
            { header: 'Estudiante', key: 'nombre', width: 32 },
            { header: 'Correo', key: 'email', width: 30 },
            { header: 'Fecha de envío', key: 'fecha', width: 20 },
        ];
        preguntas.forEach((_p, i) => {
            columnas.push({ header: `P${i + 1} Respuesta`, key: `r${i}`, width: 36 });
            columnas.push({ header: `P${i + 1} Resultado`, key: `c${i}`, width: 14 });
            columnas.push({ header: `P${i + 1} Puntaje`, key: `p${i}`, width: 11 });
        });
        columnas.push({ header: 'Puntaje final', key: 'total', width: 14 });
        columnas.push({ header: `Sobre`, key: 'sobre', width: 10 });
        columnas.push({ header: 'Salidas de la evaluación', key: 'salidas', width: 16 });
        columnas.push({ header: 'Detalle de salidas', key: 'detalle_salidas', width: 50 });
        ws.columns = columnas;
        for (const r of respRes.rows) {
            const fila = {
                nombre: `${r.nombre_completo || ''} ${r.apellido || ''}`.trim(),
                email: r.email,
                fecha: r.fecha_envio ? new Date(r.fecha_envio).toLocaleString('es-CO', { timeZone: 'America/Bogota' }) : '',
                sobre: puntajeTotal,
                salidas: r.cambios_pestana || 0,
                detalle_salidas: Array.isArray(r.log_incidentes)
                    ? r.log_incidentes.map((x) => `${new Date(x.hora).toLocaleTimeString('es-CO', { timeZone: 'America/Bogota' })} ${x.tipo}`).join(' | ')
                    : '',
            };
            let total = 0;
            preguntas.forEach((p, i) => {
                const d = detalle[`${r.id}_${p.id}`];
                let textoResp = 'Sin respuesta';
                let resultado = '';
                let puntaje = 0;
                if (d && d.respuesta_texto) {
                    textoResp = String(d.respuesta_texto).trim();
                    if (p.tipo === 'seleccion_multiple') {
                        const op = /^\d+$/.test(textoResp) ? opciones[parseInt(textoResp)] : null;
                        if (op && op.pregunta_id === p.id)
                            textoResp = op.contenido;
                    }
                }
                if (p.tipo === 'seleccion_multiple') {
                    const op = d && d.respuesta_texto && /^\d+$/.test(String(d.respuesta_texto).trim())
                        ? opciones[parseInt(String(d.respuesta_texto).trim())] : null;
                    const ok = !!(op && op.pregunta_id === p.id && op.es_correcta);
                    resultado = ok ? 'Correcta' : 'Incorrecta';
                    puntaje = ok ? porPregunta : 0;
                }
                else if (d && d.puntaje_obtenido !== null && d.puntaje_obtenido !== undefined) {
                    puntaje = parseFloat(d.puntaje_obtenido);
                    resultado = 'Calificada';
                }
                else {
                    resultado = 'Pendiente';
                    puntaje = 0;
                }
                total += Number(puntaje);
                fila[`r${i}`] = textoResp;
                fila[`c${i}`] = resultado;
                fila[`p${i}`] = Number(Number(puntaje).toFixed(2));
            });
            fila.total = Number(total.toFixed(2));
            const row = ws.addRow(fila);
            preguntas.forEach((_p, i) => {
                const c = row.getCell(`c${i}`);
                const v = c.value;
                const color = v === 'Correcta' ? 'FFC6EFCE' : v === 'Incorrecta' ? 'FFFFC7CE' : 'FFFFEB9C';
                c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
                c.alignment = { horizontal: 'center' };
                row.getCell(`r${i}`).alignment = { wrapText: true, vertical: 'top' };
            });
            row.getCell('total').font = { bold: true };
            if ((r.cambios_pestana || 0) > 0) {
                row.getCell('salidas').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
            }
            row.getCell('detalle_salidas').alignment = { wrapText: true, vertical: 'top' };
        }
        const header = ws.getRow(1);
        header.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        header.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        header.height = 32;
        header.eachCell((c) => {
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
        });
        ws.views = [{ state: 'frozen', xSplit: 1, ySplit: 1 }];
        // Hoja con las preguntas
        const wp = wb.addWorksheet('Preguntas');
        wp.columns = [
            { header: '#', key: 'n', width: 6 },
            { header: 'Tipo', key: 't', width: 22 },
            { header: 'Enunciado', key: 'e', width: 80 },
            { header: 'Respuesta correcta', key: 'c', width: 40 },
        ];
        preguntas.forEach((p, i) => {
            const correctas = Object.values(opciones)
                .filter((o) => o.pregunta_id === p.id && o.es_correcta)
                .map((o) => o.contenido).join(' | ');
            wp.addRow({ n: i + 1, t: p.tipo, e: p.enunciado, c: correctas });
        });
        wp.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        wp.getRow(1).eachCell((c) => {
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
        });
        wp.eachRow((row) => row.eachCell((c) => { c.alignment = { wrapText: true, vertical: 'top' }; }));
        const nombreArchivo = `${evaluacion.titulo}`.replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '_') || 'evaluacion';
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}.xlsx"`);
        await wb.xlsx.write(res);
        res.end();
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
};
