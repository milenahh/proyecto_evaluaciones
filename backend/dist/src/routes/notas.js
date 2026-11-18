import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import { importarNotas, listarNotasCorte, publicarNotasCorte, misNotas } from '../controllers/notasController.js';
const router = Router();
router.post('/importar', authMiddleware, requireRole(['docente', 'admin', 'coordinador']), importarNotas);
router.post('/publicar', authMiddleware, requireRole(['docente', 'admin', 'coordinador']), publicarNotasCorte);
router.get('/asignatura/:asignaturaId/corte/:corte', authMiddleware, requireRole(['docente', 'admin', 'coordinador']), listarNotasCorte);
router.get('/mis-notas', authMiddleware, requireRole(['estudiante']), misNotas);
export default router;
