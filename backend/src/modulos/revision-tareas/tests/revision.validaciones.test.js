import { validarFeedback } from '../revision.validaciones.js';

const feedbackValido = {
  correcto: 'Buen uso de funciones',
  incorrecto: 'Faltan comentarios',
  corregir: 'Agregar validaciones',
};

describe('US-02 · Revisión de tareas (validaciones del feedback)', () => {
  test('Feedback completo: dados los tres campos completos, entonces se aceptan y se devuelven', () => {
    expect(validarFeedback(feedbackValido)).toEqual(feedbackValido);
  });

  test('Campo vacío: dado que falta "lo que está bien", entonces se rechaza indicando cuál falta', () => {
    const datos = { ...feedbackValido, correcto: '' };
    expect(() => validarFeedback(datos)).toThrow('Falta indicar lo que está bien');
  });

  test('Campo vacío: dado que falta "lo que está mal", entonces se rechaza indicando cuál falta', () => {
    const datos = { ...feedbackValido, incorrecto: '' };
    expect(() => validarFeedback(datos)).toThrow('Falta indicar lo que está mal');
  });

  test('Campo vacío: dado que falta "lo que debe corregir", entonces se rechaza indicando cuál falta', () => {
    const datos = { ...feedbackValido, corregir: '' };
    expect(() => validarFeedback(datos)).toThrow('Falta indicar lo que debe corregir');
  });

  test('Campo vacío: dado un campo con solo espacios, entonces se rechaza', () => {
    const datos = { ...feedbackValido, correcto: '   ' };
    expect(() => validarFeedback(datos)).toThrow('Falta indicar lo que está bien');
  });
});