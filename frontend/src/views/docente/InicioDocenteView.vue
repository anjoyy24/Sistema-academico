<script setup>
import { ref } from 'vue'
import { RefreshCw, Download, Save } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { listarEntregas, guardarFeedback } from '@/services/entregas'

const docente = ref('docente@umss.edu')
const docenteConsultado = ref('')
const tarea = ref('PRACTICA-01')
const entregas = ref([])
const seleccionada = ref(null)
const consultado = ref(false)
const cargando = ref(false)
const guardando = ref(false)
const error = ref('')
const mensaje = ref('')
const feedback = ref({ correcto: '', incorrecto: '', corregir: '' })
function seleccionar(entrega) {
  seleccionada.value = entrega
  feedback.value = { correcto: entrega.correcto || '', incorrecto: entrega.incorrecto || '', corregir: entrega.corregir || '' }
  mensaje.value = ''; error.value = ''
}
async function consultar() {
  cargando.value = true; error.value = ''; mensaje.value = ''; consultado.value = false
  entregas.value = []; seleccionada.value = null
  try {
    const correo = docente.value.trim()
    entregas.value = (await listarEntregas(tarea.value.trim(), correo)).entregas
    docenteConsultado.value = correo
    consultado.value = true
  }
  catch (e) { error.value = e.message }
  finally { cargando.value = false }
}
async function guardar() {
  error.value = ''; mensaje.value = ''; guardando.value = true
  try {
    const result = await guardarFeedback(seleccionada.value.id,feedback.value,docenteConsultado.value)
    Object.assign(seleccionada.value,result)
    mensaje.value = 'Feedback guardado. Entrega REVISADA.'
  } catch (e) { error.value = e.message }
  finally { guardando.value = false }
}
const fecha = value => new Date(value).toLocaleString('es-BO')
</script>

<template>
  <section class="tarjeta">
    <h1>Revisión de tareas</h1>
    <p class="aviso aviso--info">Buzón simulado para el ejercicio. Usa el correo del docente y la tarea indicados al enviar. Los datos se pierden al reiniciar el backend; no hay verificación de identidad.</p>
      <form class="formulario-academico" @submit.prevent="consultar">
        <div class="grupo-campo"><label class="etiqueta" for="docente-revision">Correo del docente de prueba</label>
          <input id="docente-revision" v-model="docente" class="campo" type="email" required maxlength="254" :disabled="cargando || guardando" /></div>
        <div class="grupo-campo"><label class="etiqueta" for="tarea-revision">Identificador de la tarea</label>
          <input id="tarea-revision" v-model="tarea" class="campo" required maxlength="64" pattern="[a-zA-Z0-9_-]+" :disabled="cargando || guardando" /></div>
        <Button type="submit" :disabled="cargando || guardando"><RefreshCw aria-hidden="true" />{{ cargando ? 'Consultando…' : 'Consultar entregas' }}</Button>
      </form>
      <p v-if="consultado && !entregas.length" class="aviso aviso--info" role="status">Sin entregas</p>
      <div v-if="entregas.length" class="revision-distribucion">
        <section aria-labelledby="titulo-entregas">
          <h2 id="titulo-entregas">Entregas recibidas</h2>
          <p class="texto-secundario">Se muestra el correo más reciente de cada estudiante para esta tarea.</p>
          <ul class="lista-entregas">
            <li v-for="entrega in entregas" :key="entrega.id">
              <button type="button" class="seleccionar-entrega" :aria-pressed="seleccionada?.id === entrega.id" :disabled="guardando" @click="seleccionar(entrega)">
                <strong>{{ entrega.remitente }}</strong>
                <span>Recibido: {{ fecha(entrega.recibido) }}</span>
                <span>{{ entrega.estado }}</span>
              </button>
            </li>
          </ul>
        </section>
        <section v-if="seleccionada" aria-labelledby="titulo-feedback">
          <h2 id="titulo-feedback">Retroalimentación</h2>
          <p><strong>{{ seleccionada.remitente }}</strong></p>
          <ul v-if="seleccionada.adjuntos.length" class="lista-adjuntos">
            <li v-for="(adjunto,index) in seleccionada.adjuntos" :key="index">
              <a :href="`/api/revision/${seleccionada.id}/adjunto?docente=${encodeURIComponent(docenteConsultado)}`"><Download :size="16" aria-hidden="true" /> Descargar y abrir {{ adjunto.nombre }}</a>
            </li>
          </ul>
          <p v-else class="texto-secundario">Este correo no contiene archivos adjuntos.</p>
          <form @submit.prevent="guardar">
            <fieldset :disabled="guardando">
              <div class="grupo-campo"><label class="etiqueta" for="correcto">Lo que está bien</label><textarea id="correcto" v-model="feedback.correcto" class="campo" maxlength="10000" /></div>
              <div class="grupo-campo"><label class="etiqueta" for="incorrecto">Lo que está mal</label><textarea id="incorrecto" v-model="feedback.incorrecto" class="campo" maxlength="10000" /></div>
              <div class="grupo-campo"><label class="etiqueta" for="corregir">Lo que debe corregir</label><textarea id="corregir" v-model="feedback.corregir" class="campo" maxlength="10000" /></div>
              <Button type="submit" :disabled="guardando"><Save aria-hidden="true" />{{ guardando ? 'Guardando…' : seleccionada.estado === 'REVISADA' ? 'Actualizar feedback' : 'Guardar feedback' }}</Button>
            </fieldset>
          </form>
        </section>
        <p v-else class="texto-secundario">Selecciona una entrega para abrir sus adjuntos y registrar el feedback.</p>
      </div>
    <p v-if="mensaje" class="aviso aviso--exito" role="status">{{ mensaje }}</p>
    <p v-if="error" class="aviso aviso--error" role="alert">{{ error }}</p>
  </section>
</template>
