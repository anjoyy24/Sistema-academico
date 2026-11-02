import { Router } from 'express';
import { listar, guardarFeedback, adjunto } from './revision.controller.js';
const router = Router();
router.get('/', listar);
router.put('/:id/feedback', guardarFeedback);
router.get('/:id/adjunto', adjunto);
export default router;
