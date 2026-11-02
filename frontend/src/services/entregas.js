export async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, { credentials: 'same-origin', ...options });
  let data;
  try { data = await response.json(); }
  catch { throw new Error('Respuesta inesperada del servidor'); }
  if (!response.ok) {
    const error = new Error(data.mensaje || 'No se pudo completar la solicitud');
    error.status = response.status;
    throw error;
  }
  return data;
}
export const enviarEntrega = form => request('/entregas/enviar', { method: 'POST', body: form });
export const listarEntregas = (tarea, docente) => request(`/revision?${new URLSearchParams({ tarea, docente })}`);
export const guardarFeedback = (id, feedback, docente) => request(`/revision/${id}/feedback`, {
  method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...feedback, docente }),
});
