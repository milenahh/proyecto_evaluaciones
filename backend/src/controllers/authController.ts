import { Response } from 'express';
import pool from '../db.js';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';
import { AuthRequest } from '../middleware/auth.js';

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const usuario = result.rows[0];
    if (!usuario) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    console.log('Usuario encontrado:', usuario.email);
    console.log('Hash de BD:', usuario.contraseña_hash);
    const passwordValid = await comparePassword(password, usuario.contraseña_hash);
    console.log('Contraseña válida:', passwordValid);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    console.log('Generando token para usuario:', usuario.id, usuario.rol);
    const token = generateToken(usuario.id, usuario.rol);
    console.log('Token generado:', token);
    const respuesta = { token, usuario: { id: usuario.id, email: usuario.email, nombre_completo: usuario.nombre_completo, rol: usuario.rol } };
    console.log('Enviando respuesta:', respuesta);
    res.json(respuesta);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, nombre_completo, apellido, rol } = req.body;
    if (!email || !password || !nombre_completo || !apellido) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const existe = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }
    const contraseña_hash = await hashPassword(password);
    const result = await pool.query(
      'INSERT INTO usuarios (email, contraseña_hash, nombre_completo, apellido, rol) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [email, contraseña_hash, nombre_completo, apellido, rol || 'estudiante']
    );
    const usuario = result.rows[0];
    const token = generateToken(usuario.id, usuario.rol);
    res.status(201).json({ token, usuario: { id: usuario.id, email: usuario.email, nombre_completo: usuario.nombre_completo, rol: usuario.rol } });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('SELECT id, email, nombre_completo, apellido, rol FROM usuarios WHERE id = $1', [req.userId]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};
