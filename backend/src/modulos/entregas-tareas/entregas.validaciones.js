import { extname } from 'node:path';
import { AppError } from '../../compartido/error.js';

export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const FORMATOS = ['.pdf', '.docx', '.zip'];
export function validarArchivo(archivo) {
  if (!archivo) throw new AppError(400, 'Debe adjuntar un archivo');
  if (!FORMATOS.includes(extname(archivo.originalname).toLowerCase())) {
    throw new AppError(400, 'Formatos permitidos: .pdf, .docx, .zip');
  }
  if (archivo.size > MAX_FILE_SIZE) throw new AppError(400, 'El archivo no puede superar los 10 MB');
  if (!archivo.size) throw new AppError(400, 'El archivo está vacío');
}
