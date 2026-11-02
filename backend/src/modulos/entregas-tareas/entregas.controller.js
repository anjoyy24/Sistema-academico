import { servicioEntregas } from './entregas.service.js';
export async function enviar(req, res) {
  const datos = { ...req.body, simularFallo: req.body.simularFallo === 'true' };
  res.status(201).json(await servicioEntregas.enviar(datos, req.file));
}
