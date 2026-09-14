import pool from '../db.js';
import { hashPassword } from '../utils/auth.js';
export const crearUsuario = async (req, res) => {
    try {
        const { nombre_completo, apellido, email, contrasena, rol } = req.body;
        const contrasena_hash = await hashPassword(contrasena);
        const result = await pool.query(`INSERT INTO usuarios (nombre_completo, apellido, email, contraseña_hash, rol)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, nombre_completo, email, rol`, [nombre_completo, apellido || '', email, contrasena_hash, rol]);
        res.status(201).json(result.rows[0]);
    }
    catch (e) {
        console.error('Error crearUsuario:', e.message);
        res.status(500).json({ error: e.message });
    }
};
export const editarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_completo, apellido, email, contrasena, rol } = req.body;
        let query = 'UPDATE usuarios SET nombre_completo = $1, apellido = $2, email = $3, rol = $4';
        let params = [nombre_completo, apellido, email, rol];
        if (contrasena) {
            const contrasena_hash = await hashPassword(contrasena);
            query += ', contraseña_hash = $5';
            params.push(contrasena_hash);
            query += ` WHERE id = $${params.length + 1}`;
        }
        else {
            query += ` WHERE id = $5`;
        }
        params.push(id);
        await pool.query(query, params);
        res.json({ success: true });
    }
    catch (e) {
        console.error('Error editarUsuario:', e.message);
        res.status(500).json({ error: e.message });
    }
};
export const eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
        res.json({ success: true });
    }
    catch (e) {
        console.error('Error eliminarUsuario:', e.message);
        res.status(500).json({ error: e.message });
    }
};
export const crearAsignatura = async (req, res) => {
    try {
        const { nombre, codigo, creditos, semestre } = req.body;
        const result = await pool.query(`INSERT INTO asignaturas (nombre, codigo, creditos, semestre)
       VALUES ($1, $2, $3, $4) RETURNING id, nombre, codigo, creditos, semestre`, [nombre, codigo || '', creditos || 3, semestre || 1]);
        res.status(201).json(result.rows[0]);
    }
    catch (e) {
        console.error('Error crearAsignatura:', e.message);
        res.status(500).json({ error: e.message });
    }
};
export const editarAsignatura = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, codigo, creditos, semestre } = req.body;
        await pool.query(`UPDATE asignaturas SET nombre = $1, codigo = $2, creditos = $3, semestre = $4 WHERE id = $5`, [nombre, codigo, creditos, semestre, id]);
        res.json({ success: true });
    }
    catch (e) {
        console.error('Error editarAsignatura:', e.message);
        res.status(500).json({ error: e.message });
    }
};
export const eliminarAsignatura = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM asignaturas WHERE id = $1', [id]);
        res.json({ success: true });
    }
    catch (e) {
        console.error('Error eliminarAsignatura:', e.message);
        res.status(500).json({ error: e.message });
    }
};
export const relacionarDocenteAsignatura = async (req, res) => {
    try {
        const { docente_id, asignatura_id } = req.body;
        await pool.query(`INSERT INTO docente_asignatura (usuario_id, asignatura_id, activo)
       VALUES ($1, $2, true)`, [docente_id, asignatura_id]);
        res.status(201).json({ success: true });
    }
    catch (e) {
        console.error('Error relacionarDocenteAsignatura:', e.message);
        res.status(500).json({ error: e.message });
    }
};
export const obtenerUsuarios = async (req, res) => {
    try {
        const { rol } = req.query;
        let query = 'SELECT id, nombre_completo, email, rol FROM usuarios';
        if (rol)
            query += ` WHERE rol = $1`;
        const result = rol
            ? await pool.query(query, [rol])
            : await pool.query(query);
        res.json(result.rows);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
};
export const obtenerAsignaturas = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, nombre, codigo, creditos, semestre FROM asignaturas');
        res.json(result.rows);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
};
export const obtenerDocentesPorAsignatura = async (req, res) => {
    try {
        const { asignaturaId } = req.params;
        const result = await pool.query(`SELECT u.id, u.nombre_completo, u.email FROM usuarios u
       JOIN docente_asignatura da ON u.id = da.usuario_id
       WHERE da.asignatura_id = $1 AND u.rol = 'docente'`, [asignaturaId]);
        res.json(result.rows);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
};
export const asignarEstudianteAsignatura = async (req, res) => {
    try {
        const { estudiante_id, asignatura_id } = req.body;
        await pool.query(`INSERT INTO estudiante_asignatura (estudiante_id, asignatura_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`, [estudiante_id, asignatura_id]);
        res.status(201).json({ success: true });
    }
    catch (e) {
        console.error('Error asignarEstudianteAsignatura:', e.message);
        res.status(500).json({ error: e.message });
    }
};
export const obtenerEstudiantesPorAsignatura = async (req, res) => {
    try {
        const { asignaturaId } = req.params;
        const result = await pool.query(`SELECT u.id, u.nombre_completo, u.email FROM usuarios u
       JOIN estudiante_asignatura ea ON u.id = ea.estudiante_id
       WHERE ea.asignatura_id = $1 AND u.rol = 'estudiante'`, [asignaturaId]);
        res.json(result.rows);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
};
