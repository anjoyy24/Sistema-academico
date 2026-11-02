import { AppError } from './error.js';

const EMAIL = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/;
export function email(value, label = 'Correo') {
  if (typeof value !== 'string' || value.length > 254 || !EMAIL.test(value)) {
    throw new AppError(400, `${label} inválido`);
  }
  return value.toLowerCase();
}
export function institutionalEmail(value, domain) {
  const result = email(value, 'Correo del remitente');
  if (result.split('@')[1] !== domain.toLowerCase()) {
    throw new AppError(400, `El remitente debe usar el dominio @${domain}`);
  }
  return result;
}
export function taskCode(value) {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(value)) {
    throw new AppError(400, 'Identificador de tarea inválido: usa hasta 64 letras, números, guiones o guiones bajos');
  }
  return value.toUpperCase();
}
