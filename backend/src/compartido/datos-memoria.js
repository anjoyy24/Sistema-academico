// Almacenamiento compartido del ejercicio: se pierde al reiniciar Express.
// Cada instancia permite que Wendy aísle los datos de sus pruebas.
export function crearAlmacen() {
  return { entregas: new Map() };
}
export const almacen = crearAlmacen();
