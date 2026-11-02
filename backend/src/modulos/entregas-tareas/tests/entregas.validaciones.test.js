import { validarArchivo, MAX_FILE_SIZE } from '../entregas.validaciones.js';

describe('US-01 · Envío de tareas por correo (validaciones del archivo)', () => {
  test('Sin adjunto: dado que no adjunta archivo, entonces se rechaza con "Debe adjuntar un archivo"', () => {
    expect(() => validarArchivo(undefined)).toThrow('Debe adjuntar un archivo');
  });

  test('Formato inválido: dado un archivo .exe, entonces se rechaza indicando los formatos permitidos (.pdf, .docx, .zip)', () => {
    const archivo = { originalname: 'virus.exe', size: 1000 };
    expect(() => validarArchivo(archivo)).toThrow('Formatos permitidos: .pdf, .docx, .zip');
  });

  test('Tamaño excedido: dado un archivo mayor a 10 MB, entonces se rechaza', () => {
    const archivo = { originalname: 'tarea.pdf', size: MAX_FILE_SIZE + 1 };
    expect(() => validarArchivo(archivo)).toThrow('El archivo no puede superar los');
  });
});