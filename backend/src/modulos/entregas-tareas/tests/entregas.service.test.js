import { jest } from '@jest/globals';
import { crearServicioEntregas } from '../entregas.service.js';
import { MAX_FILE_SIZE } from '../entregas.validaciones.js';

function crearServicio({ confirmado = true } = {}) {
  const correo = {
    enviar: jest.fn().mockResolvedValue({
      confirmado,
      enviado: '2026-11-02T10:00:00Z',
      recibido: '2026-11-02T10:00:01Z',
    }),
  };
  const repositorio = {
    guardar: jest.fn(async (entrega) => entrega),
  };
  const servicio = crearServicioEntregas({
    repositorio,
    correo,
    dominio: 'est.umss.edu.bo',
    generarId: () => 'id-123',
  });
  return { servicio, correo, repositorio };
}

const datosValidos = {
  remitente: 'estudiante@est.umss.edu.bo',
  destinatario: 'docente@fcyt.umss.edu',
  tarea: 'TAREA-01',
};

const archivoValido = {
  originalname: 'tarea.pdf',
  mimetype: 'application/pdf',
  size: 1000,
  buffer: Buffer.from('contenido'),
};

describe('US-01 ·Envío de tareas por correo (service)', () => {
  test('Envío exitoso: dado un remitente institucional, un adjunto válido y el correo del docente, cuando envía, entonces se envía el correo y se guarda la entrega', async () => {
    const { servicio, correo, repositorio } = crearServicio();
    const resultado = await servicio.enviar(datosValidos, archivoValido);

    expect(correo.enviar).toHaveBeenCalledTimes(1);
    expect(repositorio.guardar).toHaveBeenCalledTimes(1);
    expect(repositorio.guardar.mock.calls[0][0].estado).toBe('POR REVISAR');
    expect(resultado.id).toBe('id-123');
    expect(repositorio.guardar.mock.calls[0][0].enviado).toBe('2026-11-02T10:00:00Z');
    expect(resultado.enviado).toBe('2026-11-02T10:00:00Z');
  });

  test('Sin adjunto: dado que no adjunta archivo, cuando intenta enviar, entonces se rechaza con "Debe adjuntar un archivo"', async () => {
    const { servicio, correo, repositorio } = crearServicio();
    await expect(servicio.enviar(datosValidos, undefined)).rejects.toThrow('Debe adjuntar un archivo');
    expect(correo.enviar).not.toHaveBeenCalled();
    expect(repositorio.guardar).not.toHaveBeenCalled();
  });

  test('Formato inválido: dado un archivo .exe, entonces se rechaza indicando los formatos permitidos (.pdf, .docx, .zip)', async () => {
    const { servicio } = crearServicio();
    const archivo = { ...archivoValido, originalname: 'virus.exe' };
    await expect(servicio.enviar(datosValidos, archivo)).rejects.toThrow('.pdf, .docx, .zip');
  });

  test('Tamaño excedido: dado un archivo mayor a 10 MB, entonces se rechaza', async () => {
    const { servicio } = crearServicio();
    const archivo = { ...archivoValido, size: MAX_FILE_SIZE + 1 };
    await expect(servicio.enviar(datosValidos, archivo)).rejects.toThrow('El archivo no puede superar los');
  });

  test('Remitente no institucional: dado un remitente fuera del dominio institucional, entonces se rechaza', async () => {
    const { servicio, correo } = crearServicio();
    const datos = { ...datosValidos, remitente: 'estudiante@gmail.com' };
    await expect(servicio.enviar(datos, archivoValido)).rejects.toThrow('El remitente debe usar el dominio @est.umss.edu.bo');
    expect(correo.enviar).not.toHaveBeenCalled();
  });

  test('Correo del docente inválido: dado un destinatario con formato inválido, entonces se rechaza', async () => {
    const { servicio, correo } = crearServicio();
    const datos = { ...datosValidos, destinatario: 'no-es-un-correo' };
    await expect(servicio.enviar(datos, archivoValido)).rejects.toThrow('Correo del docente inválido');
    expect(correo.enviar).not.toHaveBeenCalled();
  });

  test('Fallo del servicio de correo: dado que el correo falla, entonces no se confirma el envío, se informa el error y no se guarda la entrega', async () => {
    const { servicio, repositorio } = crearServicio({ confirmado: false });
    await expect(servicio.enviar(datosValidos, archivoValido)).rejects.toThrow('no confirmó el envío');
    expect(repositorio.guardar).not.toHaveBeenCalled();
  });
});