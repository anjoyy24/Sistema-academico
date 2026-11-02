import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import statusRoutes from './routes/status.routes.js';
import entregasRoutes from './modulos/entregas-tareas/entregas.routes.js';
import revisionRoutes from './modulos/revision-tareas/revision.routes.js';
import { AppError } from './compartido/error.js';

const app = express();
app.use(cors({ origin: config.frontendOrigin }));
app.use(express.json());
app.use('/api', statusRoutes);
app.use('/api', (req,res,next) => { res.set('Cache-Control', 'no-store'); next(); });
app.use('/api/entregas', entregasRoutes);
app.use('/api/revision', revisionRoutes);
app.use((req, res) => res.status(404).json({ mensaje: 'Ruta no encontrada' }));
app.use((error, req, res, next) => {
  if (error.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ mensaje: 'El archivo no puede superar los 10 MB' });
  if (error.name === 'MulterError') return res.status(400).json({ mensaje: 'Adjunta un solo archivo y completa los campos solicitados' });
  if (error instanceof AppError) return res.status(error.status).json({ mensaje: error.message });
  if (error.type === 'entity.parse.failed') return res.status(400).json({ mensaje: 'JSON inválido' });
  if (error.type === 'entity.too.large') return res.status(413).json({ mensaje: 'Solicitud demasiado grande' });
  // No se imprimen tokens, credenciales, SQL ni datos del buzón.
  console.error('Error del backend:', error.code || error.name);
  res.status(500).json({ mensaje: 'No se pudo completar la operación' });
});
export default app;
