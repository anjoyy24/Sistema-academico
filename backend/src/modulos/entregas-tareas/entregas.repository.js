import { almacen } from '../../compartido/datos-memoria.js';

export function crearRepositorioEntregas(datos = almacen) {
  return {
    async guardar(entrega) {
      datos.entregas.set(entrega.id, entrega);
      return entrega;
    },
  };
}
export const repositorioEntregas = crearRepositorioEntregas();
