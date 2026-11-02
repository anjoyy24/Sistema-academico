# Frontend — Sistema Académico Universitario

Interfaz desarrollada con Vue 3, JavaScript, Vite y Vue Router.

## Iniciar el frontend

Desde la raíz del proyecto:

```bash
cd frontend
npm ci
npm run dev
```

Abre la dirección que muestra Vite, normalmente `http://localhost:5173`.

El backend debe ejecutarse en `http://localhost:3000` para que funcionen las peticiones a `/api`. El proxy de desarrollo se configura en `vite.config.js`.

La demo usa correo simulado y datos en memoria. No requiere Google ni PostgreSQL. Los datos se pierden al reiniciar el backend.

## Estructura

```text
frontend/
├── public/                   # Recursos estáticos que se sirven sin procesar
├── src/
│   ├── assets/               # Imágenes y recursos importados por la aplicación
│   │   └── styles/
│   │       ├── variables.css # Colores, tipografía, tamaños y espacios compartidos
│   │       ├── base.css      # Estilos generales de texto y elementos HTML
│   │       ├── componentes.css # Clases comunes para botones, tarjetas y campos
│   │       ├── shadcn.css    # Conecta la paleta con los componentes shadcn-vue
│   │       └── main.css      # Importa los estilos compartidos
│   ├── components/           # Componentes reutilizables entre pantallas
│   │   ├── ui/               # Componentes base de shadcn-vue (Button, etc.)
│   │   └── Encabezado.vue    # Encabezado y navegación compartidos
│   ├── views/                # Pantallas completas
│   │   ├── InicioView.vue    # Pantalla de inicio
│   │   ├── docente/          # Pantallas correspondientes al docente
│   │   └── estudiante/       # Pantallas correspondientes al estudiante
│   ├── lib/                  # Utilidades compartidas para componentes
│   ├── router/
│   │   └── index.js          # Define las rutas y la vista de cada dirección
│   ├── services/
│   │   ├── api.js            # Endpoint de prueba
│   │   └── entregas.js       # Envío simulado, entregas y feedback
│   ├── App.vue               # Estructura compartida y vista de la ruta actual
│   ├── main.js               # Inicia Vue, registra el router e importa estilos
│   └── style.css             # Compatibilidad con la ruta anterior de estilos
├── index.html                # Documento HTML donde se monta Vue
├── components.json           # Configuración de shadcn-vue en JavaScript
├── jsconfig.json             # Alias @ para importar desde src/
├── vite.config.js            # Configuración de Vite y proxy hacia el backend
├── package.json              # Dependencias y scripts npm
└── package-lock.json         # Versiones exactas de las dependencias
```

Las nuevas pantallas van en `views/` y se registran en `router/index.js`. Los elementos reutilizables van en `components/`; las llamadas al backend, en `services/`; y los estilos compartidos, en `assets/styles/`.

## Estilos y componentes: reglas para el equipo

- Usamos CSS compartido para las vistas. Tailwind se mantiene como soporte de los componentes de shadcn-vue; no estamos migrando todas las pantallas a Tailwind.
- Reutiliza los componentes de `components/` y `components/ui/`. Para botones, prefiere el componente `Button` de shadcn-vue antes de crear otro diseño.
- Usa las clases existentes de `assets/styles/componentes.css`: `.tarjeta`, `.campo`, `.grupo-campo`, `.etiqueta`, `.texto-secundario` y `.aviso`. Las clases `.boton` y sus variantes también están disponibles para elementos existentes.
- Usa las variables de `assets/styles/variables.css` para colores, fuentes, tamaños y espacios. Evita definir valores distintos en cada vista. `shadcn.css` conecta esa misma paleta con los componentes de shadcn-vue.
- Cada pantalla lleva un título `h1`; sus secciones usan `h2`. Los estilos de texto se aplican desde `base.css`.
- El encabezado y el contenedor principal ya están en `App.vue`: no los repitas en las vistas.
- Los estilos exclusivos de un componente pueden ir en `<style scoped>`, utilizando las variables compartidas. Si un estilo o elemento se repite, agrégalo a los estilos o componentes comunes.
- Para iconos, usa `@lucide/vue`. Acompaña las acciones con texto o una etiqueta accesible cuando solo muestren un icono.
