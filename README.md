# Manuel M. Frutos · Propuesta editorial

Rediseño estático, independiente y sin publicar. Ver `docs/AUDITORIA-Y-DISENO.md` para el inventario, diagnóstico y justificación.

## Ver la propuesta

Abrir `index.html` o servir la raíz con `python -m http.server 8766 --bind 127.0.0.1` y visitar `http://127.0.0.1:8766`. No requiere instalar paquetes. El servidor HTTP permite comprobar también el reproductor y el agente; los proveedores externos requieren conexión y pueden aplicar sus propias restricciones.

## Editar y regenerar

- `scripts/build.py`: estructura común, textos de portada, catálogo, contacto y agente.
- `content/*.html`: cuerpo conservado de las fichas y biografía.
- `content/aula.json`: herramientas y destinos de Maximilian 23.
- `style.css`: diseño y tamaños de pantalla.
- `main.js`: menú, filtros y vídeos bajo demanda.
- `player.js`: reproductor de Ícaro Caído.
- `agent.js`: conversación con el servicio existente, sin almacenamiento persistente.

Después de cambiar contenido, ejecutar `python scripts/build.py`. Los HTML de la raíz son los archivos generados y se guardan en Git para que el alojamiento estático no necesite un proceso de compilación.

## Comprobar

```text
python scripts/build.py
python scripts/check.py
node --check main.js
node --check player.js
node --check agent.js
node scripts/check-interactions.cjs
```

## Restablecer las canciones

Los MP3 no aparecen en el historial Git disponible. Depositar los audios originales en `mp3/` con los nombres de `player.js`, o conservar una lista `mp3/lista.txt` con líneas `archivo.mp3 - Título`. También se admite la antigua carpeta `lista/`. No se muestran mensajes de reproducción exitosa hasta que el navegador emite el evento `playing`.

El foro `pide/` está fuera del alcance y permanece intacto. La rama no cambia el dominio ni la configuración de publicación. No fusionar ni desplegar sin aprobación.
