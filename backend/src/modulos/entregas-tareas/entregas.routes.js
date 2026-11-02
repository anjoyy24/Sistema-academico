import { Router } from 'express';
import multer from 'multer';
import { enviar } from './entregas.controller.js';
import { MAX_FILE_SIZE } from './entregas.validaciones.js';
const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: {
  fileSize: MAX_FILE_SIZE, files: 1, fields: 4, fieldSize: 1024,
} });
router.post('/enviar', upload.single('archivo'), enviar);
export default router;
