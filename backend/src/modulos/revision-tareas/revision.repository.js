import { almacen } from '../../compartido/datos-memoria.js';

export function crearRepositorioRevision(datos = almacen) {
  return {
    async listar(docente, tarea) {
      return [...datos.entregas.values()].filter(e => e.docente.correo === docente && e.tarea === tarea);
    },
    async buscar(id, docente) {
      const entrega = datos.entregas.get(id);
      return entrega?.docente.correo === docente ? entrega : null;
    },
    async guardarFeedback(id, docente, feedback) {
      const entrega = datos.entregas.get(id);
      if (!entrega || entrega.docente.correo !== docente) return null;
      entrega.feedback = feedback;
      entrega.estado = 'REVISADA';
      return entrega;
    },
  };
}
export const repositorioRevision = crearRepositorioRevision();
