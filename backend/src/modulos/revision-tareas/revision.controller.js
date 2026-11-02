import { servicioRevision } from './revision.service.js';
export async function listar(req,res) {
  res.json({ entregas: await servicioRevision.listar(req.query.docente, req.query.tarea), simulado: true });
}
export async function guardarFeedback(req,res) {
  res.json(await servicioRevision.guardarFeedback(req.params.id, req.body.docente, req.body));
}
export async function adjunto(req,res) {
  const archivo = await servicioRevision.adjunto(req.params.id, req.query.docente);
  const nombre = archivo.nombre.replace(/[\r\n\/\\]/g,'_');
  res.set('Content-Type','application/octet-stream');
  res.set('X-Content-Type-Options','nosniff');
  res.set('Content-Disposition', `attachment; filename="adjunto"; filename*=UTF-8''${encodeURIComponent(nombre).replace(/'/g,'%27')}`);
  res.send(archivo.contenido);
}
