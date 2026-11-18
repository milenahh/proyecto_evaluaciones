import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import {
  asignaturasConsulta,
  evaluacionesConsulta,
  estudiantesConsulta,
  vistaEstudianteConsulta,
  participantesConsulta,
  detalleConsulta,
  notasCorteConsulta,
  datosAplicar,
  aplicarParcial,
} from '../controllers/consultaController.js';

const router = Router();
const roles = requireRole(['coordinador', 'admin', 'docente']);

router.get('/asignaturas', authMiddleware, roles, asignaturasConsulta);
router.get('/asignaturas/:asignaturaId/evaluaciones', authMiddleware, roles, evaluacionesConsulta);
router.get('/asignaturas/:asignaturaId/estudiantes', authMiddleware, roles, estudiantesConsulta);
router.get('/asignaturas/:asignaturaId/estudiantes/:estudianteId/vista', authMiddleware, roles, vistaEstudianteConsulta);
router.get('/asignaturas/:asignaturaId/notas-corte', authMiddleware, roles, notasCorteConsulta);
router.get('/evaluaciones/:evaluacionId/participantes', authMiddleware, roles, participantesConsulta);
router.get('/evaluaciones/:evaluacionId/respuestas/:respuestaId', authMiddleware, roles, detalleConsulta);
router.get('/evaluaciones/:evaluacionId/aplicar', authMiddleware, roles, datosAplicar);
router.post('/evaluaciones/:evaluacionId/aplicar', authMiddleware, roles, aplicarParcial);

export default router;
