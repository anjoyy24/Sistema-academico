import { AppError } from './error.js';

export function crearCorreoSimulado({ reloj = () => new Date() } = {}) {
  return {
    async enviar({ simularFallo = false } = {}) {
      if (simularFallo) throw new AppError(502, 'El servicio de correo simulado falló. No se registró el envío');
      const fecha = reloj().toISOString();
      return { confirmado: true, enviado: fecha, recibido: fecha };
    },
  };
}
export const correoSimulado = crearCorreoSimulado();
