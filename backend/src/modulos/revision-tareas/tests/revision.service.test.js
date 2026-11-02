import { jest } from '@jest/globals';
import { crearServicioRevision } from '../revision.service.js';

const docente = 'docente@fcyt.umss.edu';
const tarea = 'TAREA-01';

const feedbackValido = {
  correcto: 'Buen uso de funciones',
  incorrecto: 'Faltan comentarios',
  corregir: 'Agregar validaciones',
};

function crearEntrega(extra = {}) {
  return {
    id: 'e1',
    tarea,
    estudiante: { correo: 'ana@est.umss.edu.bo' },
    docente: { correo: docente },
    recibido: '2026-11-02T10:00:00Z',
    archivo: { nombre: 'tarea.pdf', tipo: 'application/pdf', contenido: Buffer.from('contenido') },
    estado: 'POR REVISAR',
    feedback: null,
    ...extra,
  };
}

function crearServicio({ entregas = [], existente = null } = {}) {
  const repositorio = {
    listar: jest.fn().mockResolvedValue(entregas),
    buscar: jest.fn().mockResolvedValue(existente),
    guardarFeedback: jest.fn(async (id, correo, feedback) => ({
      ...existente,
      estado: 'REVISADA',
      feedback,
    })),
  };
  const servicio = crearServicioRevision({
    repositorio,
    reloj: () => new Date('2026-11-02T12:00:00Z'),
  });
  return { servicio, repositorio };
}

describe('US-02 · Revisión de tareas con feedback (service)', () => {
  test('Ver entregas recibidas: dado que existen correos de entrega, cuando el docente abre la revisión, entonces ve la lista de estudiantes con su fecha de recepción, todos POR REVISAR', async () => {
    const entregas = [
      crearEntrega({ id: 'e1', estudiante: { correo: 'ana@est.umss.edu.bo' } }),
      crearEntrega({ id: 'e2', estudiante: { correo: 'luis@est.umss.edu.bo' } }),
    ];
    const { servicio, repositorio } = crearServicio({ entregas });

    const lista = await servicio.listar(docente, tarea);

    expect(repositorio.listar).toHaveBeenCalledWith(docente, tarea);
    expect(lista).toHaveLength(2);
    expect(lista.map((e) => e.remitente).sort()).toEqual(['ana@est.umss.edu.bo', 'luis@est.umss.edu.bo']);
    expect(lista.every((e) => e.estado === 'POR REVISAR')).toBe(true);
    expect(lista.every((e) => e.recibido === '2026-11-02T10:00:00Z')).toBe(true);
  });

  test('Sin entregas: dado que no hay correos recibidos, entonces devuelve una lista vacía', async () => {
    const { servicio } = crearServicio({ entregas: [] });
    await expect(servicio.listar(docente, tarea)).resolves.toEqual([]);
  });

  test('Abrir la tarea: dada una entrega con archivo adjunto, cuando el docente la selecciona, entonces puede ver el archivo adjunto', async () => {
    const entrega = crearEntrega();
    const { servicio, repositorio } = crearServicio({ existente: entrega });

    const archivo = await servicio.adjunto('e1', docente);

    expect(repositorio.buscar).toHaveBeenCalledWith('e1', docente);
    expect(archivo).toEqual(entrega.archivo);
  });

  test('Feedback completo: dado un estudiante con entrega, cuando el docente registra los tres campos, entonces el feedback se guarda asociado a esa entrega y pasa a REVISADA', async () => {
    const { servicio, repositorio } = crearServicio({ existente: crearEntrega() });

    const resultado = await servicio.guardarFeedback('e1', docente, feedbackValido);

    expect(repositorio.guardarFeedback).toHaveBeenCalledTimes(1);
    const [id, correo, feedback] = repositorio.guardarFeedback.mock.calls[0];
    expect(id).toBe('e1');
    expect(correo).toBe(docente);
    expect(feedback).toMatchObject(feedbackValido);
    expect(resultado.estado).toBe('REVISADA');
    expect(resultado.correcto).toBe('Buen uso de funciones');
    expect(resultado.incorrecto).toBe('Faltan comentarios');
    expect(resultado.corregir).toBe('Agregar validaciones');
  });

  test('Campo vacío: dado que falta uno de los tres campos, cuando intenta guardar, entonces se rechaza indicando cuál falta y no se modifica la entrega', async () => {
    const { servicio, repositorio } = crearServicio({ existente: crearEntrega() });
    const datos = { ...feedbackValido, corregir: '' };

    await expect(servicio.guardarFeedback('e1', docente, datos)).rejects.toThrow('Falta indicar lo que debe corregir');
    expect(repositorio.guardarFeedback).not.toHaveBeenCalled();
  });

  test('Estudiante sin entrega: dado un estudiante que no envió su tarea, cuando se intenta registrar feedback, entonces se rechaza con "No existe entrega para revisar"', async () => {
    const { servicio, repositorio } = crearServicio({ existente: null });

    await expect(servicio.guardarFeedback('no-existe', docente, feedbackValido)).rejects.toThrow('No existe entrega para revisar');
    expect(repositorio.guardarFeedback).not.toHaveBeenCalled();
  });

  test('Modificar feedback: dada una entrega REVISADA, cuando el docente edita el feedback, entonces se actualiza el contenido y sigue REVISADA', async () => {
    const existente = crearEntrega({
      estado: 'REVISADA',
      feedback: { ...feedbackValido, actualizado: '2026-11-02T11:00:00Z' },
    });
    const { servicio, repositorio } = crearServicio({ existente });
    const nuevo = { ...feedbackValido, corregir: 'Nuevo texto a corregir' };

    const resultado = await servicio.guardarFeedback('e1', docente, nuevo);

    expect(repositorio.guardarFeedback.mock.calls[0][2]).toMatchObject(nuevo);
    expect(resultado.corregir).toBe('Nuevo texto a corregir');
    expect(resultado.estado).toBe('REVISADA');
  });

  test('Varios correos del mismo estudiante: dado un estudiante con más de un correo de la misma tarea, entonces se toma el más reciente', async () => {
    const entregas = [
      crearEntrega({ id: 'vieja', recibido: '2026-11-02T08:00:00Z' }),
      crearEntrega({ id: 'nueva', recibido: '2026-11-02T10:00:00Z' }),
    ];
    const { servicio } = crearServicio({ entregas });

    const lista = await servicio.listar(docente, tarea);

    expect(lista).toHaveLength(1);
    expect(lista[0].id).toBe('nueva');
  });

});