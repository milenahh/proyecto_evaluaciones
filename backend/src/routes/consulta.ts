import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import {
  asignaturasConsulta,
  evaluacionesConsulta,
  participantesConsulta,
  detalleConsulta,
  notasCorteConsulta,
} from '../controllers/consultaController.js';

const router = Router();
const roles = requireRole(['coordinador', 'admin']);

router.get('/asignaturas', authMiddleware, roles, asignaturasConsulta);
router.get('/asignaturas/:asignaturaId/evaluaciones', authMiddleware, roles, evaluacionesConsulta);
router.get('/asignaturas/:asignaturaId/notas-corte', authMiddleware, roles, notasCorteConsulta);
router.get('/evaluaciones/:evaluacionId/participantes', authMiddleware, roles, participantesConsulta);
router.get('/evaluaciones/:evaluacionId/respuestas/:respuestaId', authMiddleware, roles, detalleConsulta);

export default router;
