# Backend — Sistema Académico Universitario

Ejercicio de pair programming para las US-01 y US-02, con Node.js, Express y JavaScript. Usa correo simulado y almacenamiento en memoria: no necesita Gmail, credenciales de Google ni PostgreSQL.

## Iniciar

Desde la raíz:

```bash
cd backend
npm ci
npm run dev
```

El puerto predeterminado es `3000`. Si ya tienes `.env`, verifica `PORT=3000`. El archivo `.env` es opcional para esta demo; `.env.example` muestra las variables admitidas.

Deja el backend ejecutándose mientras usas el frontend. `npm start` ejecuta sin nodemon. Para detenerlo, presiona **Ctrl+C**. Las entregas, los archivos y el feedback se pierden al reiniciar Express, incluso cuando nodemon reinicia por un cambio de código.

## Estructura por funcionalidad

```text
src/
├── modulos/
│   ├── entregas-tareas/            # US-01: envío simulado de tareas
│   │   ├── entregas.routes.js      # Endpoint y recepción del adjunto con multer
│   │   ├── entregas.controller.js  # Lee la solicitud y responde JSON
│   │   ├── entregas.service.js     # Valida, llama al correo y registra el envío
│   │   ├── entregas.validaciones.js # Extensiones y límite de 10 MB
│   │   └── entregas.repository.js  # Guarda la entrega en memoria
│   └── revision-tareas/            # US-02: revisión y feedback
│       ├── revision.routes.js     # Endpoints de consulta, adjunto y feedback
│       ├── revision.controller.js # Solicitudes y respuestas HTTP
│       ├── revision.service.js    # Entrega más reciente y reglas de revisión
│       ├── revision.validaciones.js # Tres campos obligatorios de feedback
│       └── revision.repository.js # Consulta y actualización en memoria
├── compartido/
│   ├── datos-memoria.js           # Almacén común a ambos módulos
│   ├── correo-simulado.js         # Simula éxito o fallo; no envía correos reales
│   ├── validaciones.js           # Correo institucional e identificador de tarea
│   └── error.js                  # Errores con mensaje y código HTTP
├── config/
│   ├── env.js                    # Puerto, origen y dominio institucional
│   └── database.js               # Pool pg reservado para uso futuro
├── routes/
│   └── status.routes.js          # Endpoints de prueba y estado
├── app.js                        # Configura Express y registra los módulos
└── server.js                     # Inicia el servidor
```

Cada nueva funcionalidad tendrá su carpeta dentro de `modulos/`. Las carpetas representan funcionalidades, no roles. Las utilidades comunes van en `compartido/`. El recorrido es **ruta → controlador → servicio → repositorio**. Los endpoints van en el archivo `.routes.js` de su módulo; `app.js` les asigna un prefijo.

## Endpoints

Los endpoints se definen en el archivo `.routes.js` de cada módulo y se registran con su prefijo en `app.js`. Los endpoints generales permanecen en `routes/status.routes.js`.

| Método | Dirección | Función |
| --- | --- | --- |
| GET | `/api` | Comprobar que Express responde |
| GET | `/api/health` | Estado de la API y de la conexión PostgreSQL opcional |
| POST | `/api/entregas/enviar` | Simular envío y registrar una entrega |
| GET | `/api/revision?docente=docente@umss.edu&tarea=PRACTICA-01` | Listar la entrega más reciente por estudiante |
| GET | `/api/revision/:id/adjunto?docente=docente@umss.edu` | Descargar el adjunto para abrirlo |
| PUT | `/api/revision/:id/feedback` | Guardar o modificar feedback |

El envío usa `multipart/form-data`: `remitente`, `destinatario`, `tarea`, `archivo` y `simularFallo` (`true` o `false`). Se admiten `.pdf`, `.docx` y `.zip`, de hasta 10 × 1024 × 1024 bytes. El remitente debe pertenecer a `est.umss.edu`. La confirmación devuelve `ENVIO_SIMULADO` y la hora; no afirma haber enviado un correo real.

El feedback usa JSON con `docente`, `correcto`, `incorrecto` y `corregir`. Deben completarse los tres campos antes de guardar. Una entrega nueva está `POR REVISAR`; al guardar pasa a `REVISADA`. Una edición conserva ese estado. Un correo posterior del mismo estudiante es una entrega nueva y empieza `POR REVISAR`.

## Probar la demo manualmente

1. En Estudiante, usa `estudiante@est.umss.edu`, `docente@umss.edu`, `PRACTICA-01` y adjunta un archivo permitido.
2. Simula el envío. En Docente, consulta el mismo correo y tarea.
3. Selecciona la entrega, descarga el adjunto y completa los tres campos de feedback.
4. Guarda, edita el feedback o envía otra entrega del mismo estudiante para comprobar cuál aparece.
5. Para comprobar el fallo del correo, marca la casilla correspondiente en Estudiante: debe mostrarse el error sin registrar una nueva entrega.

Es una demostración local con datos de prueba. Los correos escritos en formularios son filtros, no autenticación ni permisos. No se deben cargar datos privados. El envío y la recepción reales de correo quedan fuera de esta versión del ejercicio.

## Pruebas unitarias de Wendy

No se incluyen unit tests. Las reglas están en los archivos `.service.js` y `.validaciones.js` de cada módulo. Las fábricas `crearServicioEntregas({ repositorio, correo, dominio, generarId })` y `crearServicioRevision({ repositorio, reloj })` permiten sustituir sus dependencias sin levantar Express.

`crearAlmacen()` produce datos aislados; las fábricas de repositorio aceptan ese almacén. `crearCorreoSimulado({ reloj })` permite fijar fechas para verificar resultados reproducibles. Wendy puede cubrir los criterios del PDF sin Google ni PostgreSQL.

## Base de datos futura

`backend/database/schema.sql`, dentro del backend, es una propuesta opcional con `estudiantes`, `docentes`, `tareas`, `entregas` y `feedback`. No se ejecuta ni se usa en esta demo; es para una base nueva y debe validarse antes de conectar PostgreSQL. No migra las tablas del prototipo anterior.

Cuando se agregue persistencia, se reemplazarán los repositorios en memoria por consultas parametrizadas con `pg`. `DATABASE_URL` puede quedar vacía mientras tanto.
