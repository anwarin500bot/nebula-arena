NEBULA ARENA — PUBLICAR ONLINE SIN LINUX

Este proyecto se ejecuta en un servidor Node.js en Internet y se abre en Chrome.
No necesitas instalar Linux ni programas en tu Chromebook. Sí necesitas una cuenta
de GitHub y una cuenta de Render para publicar el proyecto; sigue los pasos y
revisa las condiciones actuales de ambos servicios antes de confirmar.

PASO 1 — Descargar y extraer
1. Descarga este ZIP.
2. En la app Archivos del Chromebook, haz clic derecho y extrae el ZIP.

PASO 2 — Subir el código a GitHub desde el navegador
1. Abre https://github.com y entra en tu cuenta (o crea una si puedes).
2. Pulsa el botón + y elige New repository.
3. Ponle un nombre, por ejemplo nebula-arena, y crea el repositorio.
4. Dentro del repositorio, elige Add file > Upload files.
5. Abre la carpeta extraída en la app Archivos y arrastra al navegador TODOS los
   archivos y carpetas que hay dentro de nebula_arena_web_deploy (no subas el ZIP).
   Deben quedar server.js, package.json, render.yaml, la carpeta public y el README.
6. Pulsa Commit changes.

PASO 3 — Publicar en Render
1. Abre https://render.com e inicia sesión.
2. En el panel, pulsa New > Web Service.
3. Conecta GitHub si te lo pide y selecciona el repositorio nebula-arena.
4. Configura:
   - Runtime/Language: Node
   - Build Command: npm install
   - Start Command: npm start
   - Instance Type: Free (si aparece disponible)
5. Pulsa Create Web Service y espera a que termine el despliegue.
6. Cuando aparezca la URL que termina en onrender.com, ábrela en Chrome.
   Esa será la dirección que puedes compartir para que otras personas entren.

IMPORTANTE
- No compartas contraseñas, códigos de acceso ni datos personales.
- En cuentas de menores, usa solo opciones permitidas por las condiciones del servicio
  y pide ayuda a un adulto de confianza si la plataforma lo requiere.
- El plan gratuito de Render puede suspender el servidor tras 15 minutos sin tráfico.
  La primera conexión posterior puede tardar aproximadamente un minuto en arrancar.
- Esta es una primera versión/prototipo multijugador de exploración; no es un battle royale completo.
- El juego necesita Internet para cargar Three.js desde su CDN.
- No añadas tarjeta de pago ni elijas un plan de pago para este proyecto de prueba.

Documentación oficial:
https://render.com/docs/deploy-node-express-app
https://render.com/docs/free
