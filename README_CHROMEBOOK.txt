NEBULA ARENA — VERSIÓN PARA CHROMEBOOK

Este juego funciona en Chrome como una página web. Para ejecutar el servidor multijugador local, necesitas que el entorno Linux esté disponible en tu Chromebook. Si el Chromebook está gestionado por un centro educativo, es posible que Linux esté bloqueado; no intentes saltarte esa restricción.

1) En ChromeOS, abre Configuración > Información de ChromeOS > Desarrolladores > Entorno de desarrollo de Linux > Configurar.
   Sigue las instrucciones. Si esa opción no aparece o está bloqueada, pide ayuda al administrador del dispositivo.
2) Descarga este ZIP y abre la app Archivos.
3) Copia nebula_arena_chromebook.zip a "Archivos de Linux" y extrae el ZIP allí.
4) Abre Terminal desde el lanzador de aplicaciones.
5) Instala Node.js y npm con:
   sudo apt update
   sudo apt install -y nodejs npm
6) En Terminal, entra en la carpeta extraída (si está directamente en Archivos de Linux):
   cd nebula_arena_chromebook
7) Instala las dependencias e inicia el servidor:
   npm install
   npm start
8) Abre Chrome y visita:
   http://localhost:3000

IMPORTANTE
- Es una aplicación web; no se instala como una app Android desde Google Play.
- Para jugar en este Chromebook, el servidor debe permanecer abierto en Terminal.
- Esta versión requiere conexión a Internet para cargar Three.js desde CDN.
- Para jugar con otras personas por Internet, hay que alojar el servidor en un servicio compatible con Node.js y WebSockets.
- Rendimiento 3D depende del modelo de Chromebook. En ChromeOS/Linux puede haber limitaciones de aceleración gráfica.
