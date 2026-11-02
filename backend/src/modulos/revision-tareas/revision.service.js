import { AppError } from '../../compartido/error.js';
import { email, taskCode } from '../../compartido/validaciones.js';
import { repositorioRevision } from './revision.repository.js';
import { validarFeedback } from './revision.validaciones.js';

function presentar(entrega) {
  return { id: entrega.id, tarea: entrega.tarea, remitente: entrega.estudiante.correo,
    destinatario: entrega.docente.correo, recibido: entrega.recibido, estado: entrega.estado,
    adjuntos: [{ nombre: entrega.archivo.nombre }],
    correcto: entrega.feedback?.correcto || '', incorrecto: entrega.feedback?.incorrecto || '',
    corregir: entrega.feedback?.corregir || '', actualizado: entrega.feedback?.actualizado || null };
}
export function crearServicioRevision({ repositorio = repositorioRevision, reloj = () => new Date() } = {}) {
  return {
    async listar(docente, tarea) {
      const entregas = await repositorio.listar(email(docente, 'Correo del docente'), taskCode(tarea));
      const recientes = new Map();
      for (const entrega of entregas) {
        const anterior = recientes.get(entrega.estudiante.correo);
        if (!anterior || new Date(entrega.recibido) >= new Date(anterior.recibido)) {
          recientes.set(entrega.estudiante.correo, entrega);
        }
      }
      return [...recientes.values()].sort((a,b) => new Date(b.recibido)-new Date(a.recibido)).map(presentar);
    },
    async guardarFeedback(id, docente, datos) {
      const correo = email(docente, 'Correo del docente');
      if (!await repositorio.buscar(id, correo)) throw new AppError(404, 'No existe entrega para revisar');
      const feedback = { ...validarFeedback(datos), actualizado: reloj().toISOString() };
      const entrega = await repositorio.guardarFeedback(id, correo, feedback);
      if (!entrega) throw new AppError(404, 'No existe entrega para revisar');
      return presentar(entrega);
    },
    async adjunto(id, docente) {
      const entrega = await repositorio.buscar(id, email(docente, 'Correo del docente'));
      if (!entrega) throw new AppError(404, 'No existe entrega para revisar');
      return entrega.archivo;
    },
  };
}
export const servicioRevision = crearServicioRevision();
