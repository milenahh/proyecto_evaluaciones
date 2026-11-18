import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import {
  importarNotas,
  listarNotasCorte,
  publicarNotasCorte,
  misNotas,
  listarActividades,
  guardarActividades,
} from '../controllers/notasController.js';

const router = Router();
const gestores = requireRole(['docente', 'admin', 'coordinador']);

router.get('/actividades', authMiddleware, gestores, listarActividades);
router.put('/actividades', authMiddleware, gestores, guardarActividades);
router.post('/importar', authMiddleware, gestores, importarNotas);
router.post('/publicar', authMiddleware, gestores, publicarNotasCorte);
router.get('/asignatura/:asignaturaId/corte/:corte', authMiddleware, gestores, listarNotasCorte);
router.get('/mis-notas', authMiddleware, requireRole(['estudiante']), misNotas);

export default router;
