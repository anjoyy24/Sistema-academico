<script setup>
import { ref } from 'vue'
import { Send, Paperclip } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { enviarEntrega } from '@/services/entregas'

const tarea = ref('PRACTICA-01')
const remitente = ref('estudiante@est.umss.edu')
const destinatario = ref('docente@umss.edu')
const archivo = ref(null)
const archivoInput = ref(null)
const simularFallo = ref(false)
const enviando = ref(false)
const mensaje = ref('')
const error = ref('')
async function enviar() {
  if (enviando.value) return
  error.value = ''; mensaje.value = ''
  if (!archivo.value) { error.value = 'Debe adjuntar un archivo'; return }
  if (!/\.(pdf|docx|zip)$/i.test(archivo.value.name)) { error.value = 'Formatos permitidos: .pdf, .docx, .zip'; return }
  if (archivo.value.size > 10 * 1024 * 1024) { error.value = 'El archivo no puede superar los 10 MB'; return }
  const form = new FormData()
  form.set('remitente', remitente.value.trim())
  form.set('tarea', tarea.value.trim())
  form.set('destinatario', destinatario.value.trim())
  form.set('simularFallo', String(simularFallo.value))
  form.set('archivo', archivo.value)
  enviando.value = true
  try {
    const result = await enviarEntrega(form)
    mensaje.value = `${result.mensaje}. Hora: ${new Date(result.enviado).toLocaleString('es-BO')}.`
    archivo.value = null
    if (archivoInput.value) archivoInput.value.value = ''
  } catch (e) { error.value = e.message }
  finally { enviando.value = false }
}
</script>

<template>
  <section class="tarjeta">
    <h1>Enviar tarea</h1>
    <p class="aviso aviso--info">Ejercicio con correo simulado. No se envían correos reales y los datos se pierden al reiniciar el backend. Usa datos y archivos de prueba.</p>
    <form class="formulario-academico" @submit.prevent="enviar">
      <fieldset :disabled="enviando">
        <div class="grupo-campo"><label class="etiqueta" for="remitente">Correo del estudiante</label>
          <input id="remitente" v-model="remitente" class="campo" type="email" required maxlength="254" />
          <small class="texto-secundario">Dominio institucional: @est.umss.edu.</small></div>
        <div class="grupo-campo"><label class="etiqueta" for="tarea">Identificador de la tarea</label>
          <input id="tarea" v-model="tarea" class="campo" required maxlength="64" pattern="[a-zA-Z0-9_-]+" aria-describedby="ayuda-tarea" />
          <small id="ayuda-tarea" class="texto-secundario">Usa el mismo identificador en la revisión del docente.</small></div>
        <div class="grupo-campo"><label class="etiqueta" for="destinatario">Correo del docente</label>
          <input id="destinatario" v-model="destinatario" class="campo" type="email" required maxlength="254" /></div>
        <div class="grupo-campo"><label class="etiqueta" for="archivo"><Paperclip :size="16" aria-hidden="true" /> Archivo adjunto</label>
          <input id="archivo" ref="archivoInput" class="campo" type="file" accept=".pdf,.docx,.zip" aria-describedby="ayuda-archivo" @change="archivo = $event.target.files[0] || null" />
          <small id="ayuda-archivo" class="texto-secundario">PDF, DOCX o ZIP. Máximo 10 MB.</small></div>
        <label class="opcion-simulacion"><input v-model="simularFallo" type="checkbox" /> Simular fallo del servicio de correo</label>
        <Button type="submit" :disabled="enviando"><Send aria-hidden="true" />{{ enviando ? 'Simulando…' : 'Simular envío de tarea' }}</Button>
      </fieldset>
    </form>
    <p v-if="mensaje" class="aviso aviso--exito" role="status">{{ mensaje }}</p>
    <p v-if="error" class="aviso aviso--error" role="alert">{{ error }}</p>
  </section>
</template>
