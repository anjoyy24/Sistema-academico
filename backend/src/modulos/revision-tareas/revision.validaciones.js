import { AppError } from '../../compartido/error.js';

export function validarFeedback(input = {}) {
  if (!input || typeof input !== 'object') input = {};
  const labels = { correcto: 'lo que está bien', incorrecto: 'lo que está mal', corregir: 'lo que debe corregir' };
  const result = {};
  for (const [key, label] of Object.entries(labels)) {
    if (typeof input[key] !== 'string' || !input[key].trim()) throw new AppError(400, `Falta indicar ${label}`);
    if (input[key].trim().length > 10000) throw new AppError(400, `El campo ${label} no puede superar 10000 caracteres`);
    result[key] = input[key].trim();
  }
  return result;
}
