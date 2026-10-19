# Validación de la propuesta

19 de octubre de 2026. Entorno: navegador integrado de Codex y servidor local; HTML estático, Python y Node del entorno disponible.

## Comprobaciones completadas

- `python scripts/build.py`: genera las 15 páginas del portfolio.
- `python scripts/check.py`: un H1, un main, idioma español y descripción en cada página; identificadores únicos; destinos locales y fragmentos existentes; imágenes con texto alternativo; nueve canciones en el reproductor. Compara también con `main` para comprobar que PIDE, dominio y configuración de publicación no cambian.
- `node --check` en `main.js`, `player.js` y `agent.js`: sintaxis correcta.
- `node scripts/check-interactions.cjs`: respuestas del agente tratadas como texto, recuperación ante fallo de red, descarte de respuesta tardía después de borrar; selección de canción, ruta alternativa, error sin falsa reproducción, avance a la siguiente y final de disco. Pruebas con respuestas simuladas, sin enviar conversaciones al backend real.
- `git diff --check`: sin errores de espacios.
- Navegador: portada de escritorio y ficha de Ícaro Caído revisadas visualmente. Archivo: filtro Música muestra 4 proyectos y actualiza su estado accesible. Reproductor: una pista ausente da un mensaje comprensible y mantiene acceso a Spotify y YouTube.
- Vista de 390 px: portada revisada visualmente y menú móvil abierto; se muestran las cuatro opciones y el estado expandido.
- Las 15 páginas se cargaron en marcos del navegador a 320, 390, 768 y 1280 px: 60 comprobaciones sin desbordamiento horizontal ni imágenes locales rotas. Esto comprueba adaptación en el navegador de escritorio, no sustituye una prueba en un teléfono físico.
- Navegación y enlaces al contenido disponibles sin JavaScript; hay enlaces alternativos para los vídeos con `noscript`. El menú móvil mantiene sus enlaces sin scripts. Revisión del código de este modo, sin una sesión separada con JavaScript desactivado.
- Confirmado con Git: ningún cambio en `pide/`, `.github/`, `CNAME` ni `.nojekyll`.

## Límites pendientes

- No se ha podido escuchar el disco completo: faltan los MP3. El estado de error se ha probado en el navegador y los eventos de reproducción/avance se han probado con controles simulados. No se presenta como verificación de audios reales.
- La banda sonora del videojuego se menciona en su ficha y el tráiler se conserva; no se ha añadido un reproductor ficticio sin archivos.
- El agente conserva el servicio existente y se ha probado con respuestas simuladas. La disponibilidad, CORS y las respuestas del backend real no se han validado con mensajes de prueba en producción.
- Spotify, Steam, Amazon, YouTube y Maximilian 23 son servicios externos: se conservan sus enlaces del repositorio, sin afirmar una comprobación completa de su disponibilidad.
- No se ha realizado una certificación de accesibilidad, auditoría de lector de pantalla ni una medición Lighthouse. Se han implementado foco visible, controles nativos, etiquetas, estados, enlace de salto y reducción de movimiento.
- El estado «en desarrollo» del juego procede del contenido del repositorio. Conviene confirmar ese estado antes de publicar la propuesta, ya que no se verificó el lanzamiento en Steam.

No se ha publicado ni fusionado la propuesta.
