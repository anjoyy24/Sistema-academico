import { randomUUID } from 'node:crypto';
import { config } from '../../config/env.js';
import { AppError } from '../../compartido/error.js';
import { email, institutionalEmail, taskCode } from '../../compartido/validaciones.js';
import { correoSimulado } from '../../compartido/correo-simulado.js';
import { repositorioEntregas } from './entregas.repository.js';
import { validarArchivo } from './entregas.validaciones.js';

export function crearServicioEntregas({ repositorio = repositorioEntregas,
  correo = correoSimulado, dominio = config.institutionalDomain, generarId = randomUUID } = {}) {
  return {
    async enviar(datos = {}, archivo) {
      const remitente = institutionalEmail(datos.remitente, dominio);
      const destinatario = email(datos.destinatario, 'Correo del docente');
      const tarea = taskCode(datos.tarea);
      validarArchivo(archivo);
      // Primero confirma el adaptador; un fallo no guarda una entrega exitosa.
      const resultado = await correo.enviar({ remitente, destinatario, tarea, archivo,
        simularFallo: datos.simularFallo === true });
      if (!resultado.confirmado) throw new AppError(502, 'El servicio de correo simulado no confirmó el envío');
      const entrega = await repositorio.guardar({
        id: generarId(), estudiante: { correo: remitente }, docente: { correo: destinatario }, tarea,
        enviado: resultado.enviado, recibido: resultado.recibido,
        archivo: { nombre: archivo.originalname, tipo: archivo.mimetype, contenido: Buffer.from(archivo.buffer) },
        estado: 'POR REVISAR', feedback: null,
      });
      return { id: entrega.id, estado: 'ENVIO_SIMULADO', enviado: entrega.enviado,
        mensaje: 'Envío simulado registrado. No se envió ningún correo real' };
    },
  };
}
export const servicioEntregas = crearServicioEntregas();
