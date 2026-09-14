import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/usuarios', authMiddleware, requireRole(['admin']), adminController.crearUsuario);
router.get('/usuarios', authMiddleware, requireRole(['admin']), adminController.obtenerUsuarios);
router.post('/asignaturas', authMiddleware, requireRole(['admin']), adminController.crearAsignatura);
router.get('/asignaturas', authMiddleware, adminController.obtenerAsignaturas);
router.post('/docente-asignatura', authMiddleware, requireRole(['admin']), adminController.relacionarDocenteAsignatura);

export default router;
router.put('/usuarios/:id', authMiddleware, requireRole(['admin']), adminController.editarUsuario);
router.delete('/usuarios/:id', authMiddleware, requireRole(['admin']), adminController.eliminarUsuario);
router.put('/asignaturas/:id', authMiddleware, requireRole(['admin']), adminController.editarAsignatura);
router.delete('/asignaturas/:id', authMiddleware, requireRole(['admin']), adminController.eliminarAsignatura);
router.get('/asignaturas/:asignaturaId/docentes', authMiddleware, adminController.obtenerDocentesPorAsignatura);
router.post('/estudiante-asignatura', authMiddleware, requireRole(['admin']), adminController.asignarEstudianteAsignatura);
router.get('/asignaturas/:asignaturaId/estudiantes', authMiddleware, adminController.obtenerEstudiantesPorAsignatura);
router.get('/asignaturas/:asignaturaId/docentes', authMiddleware, adminController.obtenerDocentesPorAsignatura);
router.get('/asignaturas/:asignaturaId/docentes', authMiddleware, adminController.obtenerDocentesPorAsignatura);
