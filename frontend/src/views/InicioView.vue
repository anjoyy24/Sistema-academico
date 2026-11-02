<script setup>
import { onMounted, ref } from 'vue'
import { consultarApi } from '../services/api.js'

const mensaje = ref('Cargando…')

onMounted(async () => {
  try {
    const datos = await consultarApi()
    mensaje.value = datos.mensaje
  } catch {
    mensaje.value = 'No se pudo conectar con el backend.'
  }
})
</script>

<template>
  <section class="tarjeta">
    <h1>Inicio</h1>
    <p>{{ mensaje }}</p>
    <p class="texto-secundario">Demo para US-01 y US-02: simula un envío en Estudiante y revisa la entrega en Docente. No se envían correos reales ni se requiere Google o PostgreSQL. Los datos se pierden al reiniciar el backend.</p>
  </section>
</template>
