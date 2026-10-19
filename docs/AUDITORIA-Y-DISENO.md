# Propuesta de rediseño de mmfrutos.com

Revisión: 19 de octubre de 2026. Base analizada: `172290f06b33e919b75fcfb7df4daf2574882c69`, rama `main` de ProLur/mmfrutos. Propuesta: `redesign/editorial-personal`. Sin publicación ni fusión.

## Qué se ha revisado

Los 16 commits disponibles, las páginas HTML de la web personal, la hoja de estilos, el JavaScript compartido, los scripts de las fichas y el agente, las imágenes y el flujo de importación. También se ha abierto la web publicada en un navegador: su portada coincide con la versión oscura del repositorio. La copia que devolvía el buscador estaba desactualizada, por lo que no se utilizó como referencia visual.

El foro `/pide/` se identificó durante el inventario inicial. Por indicación del usuario queda expresamente fuera: archivos, enlaces internos, estilos y funcionamiento intactos. No se incorpora al portfolio.

## Diagnóstico de experiencia de uso

| Hallazgo concreto | Consecuencia | Respuesta de la propuesta |
| --- | --- | --- |
| Siete entradas en el menú mezclan disciplinas con nombres propios y un experimento. | Alguien que llega por primera vez debe conocer qué es Maximilian 23 para elegir. | Cuatro entradas estables: Inicio, Proyectos, Sobre mí y Contacto. El archivo permite filtrar por disciplina y muestra cada nombre con contexto. |
| La presentación utiliza expresiones como «un portfolio… con una identidad clara». | El texto describe el contenedor, en lugar de a la persona. | Primera persona y detalles verificables: Spectrum, canciones, historias y herramientas de aula. |
| La biografía vive dentro de una ventana superpuesta. | La historia personal se descubre tarde y carece de dirección compartible. | Página Sobre mí, enlazada desde el menú y desde la portada. Se conservan los ocho párrafos de la biografía y sus referencias. |
| Las fichas musicales se abren con enlaces `href="#"` e iframes dentro de modales. | La URL no representa la obra; el botón Atrás no resuelve la navegación; aparecen áreas de scroll anidadas. | Enlaces HTML reales, páginas completas, navegación común y regreso al archivo. Se mantienen los nombres de archivo de las fichas. |
| Las páginas musicales y de entretenimiento originales no tienen un H1 visible. | Falta una referencia clara al entrar y una estructura semántica consistente. | Un H1, un `main` y descripción por página. |
| Neón, sombras, degradados, fondos, etiquetas y tarjetas redondeadas aparecen a la vez. | Hay muchos reclamos de atención del mismo nivel. La obra queda rodeada de decoración. | Color de papel, tinta oscura, verde de la ilustración original y un acento teja. Líneas finas y jerarquía tipográfica. |
| La misma cuadrícula representa casi todo. | Un disco, un juego y una utilidad educativa parecen piezas intercambiables. | Portada con proyecto de juego destacado, franja de educación, selección de discos y nota personal. Fichas con medios y créditos propios; herramientas educativas como directorio. |
| Los vídeos cargan iframes al entrar. | Se inicializan servicios externos aunque la visita solo quiera leer. | Reproducción bajo demanda y acceso independiente a YouTube; sin reproducción automática al abrir la página. |
| El reproductor de Ícaro Caído busca audios ausentes y falla sin un desenlace útil. | Parece que la escucha está disponible, pero no puede empezar. | Nueve pistas conservadas; selección, pausa y avance al terminar; dos rutas compatibles y error explícito con alternativa en Spotify/YouTube. Control de audio visible al seleccionar una pista. |
| El agente escribe respuestas mediante `innerHTML` y persiste conversación y memoria en localStorage. | Respuestas tratadas como HTML; conservación local de datos poco visible. | Texto plano mediante nodos DOM, tiempo de espera limitado, errores comprensibles y conversación de sesión. Se informa del envío al servicio de Render. |
| Cabecera y pie duplicados en archivos editados manualmente. | Cambiar un menú obliga a repetir el cambio y facilita inconsistencias. | Generador estático pequeño, sin dependencias externas. HTML publicado sigue funcionando como archivos estáticos. |

## Dirección de diseño

La referencia conceptual es un archivo personal de autor: una persona que hace música, enseña, escribe y construye cosas. La identidad sale de esa mezcla y de sus obras reales. No se han añadido testimonios, cifras de impacto, premios ni fotografías ficticias.

La serif Georgia da a títulos y nombre una voz editorial, mientras Segoe UI/Arial mantiene legibles textos y controles. Son fuentes disponibles en el sistema, sin peticiones a Google Fonts. El fondo `#f4f1e9`, la tinta `#252a26`, el verde `#173c33` y el acento `#823e30` forman una paleta corta. El verde se relaciona con la ilustración de guitarra que ya pertenecía a la web. Se reutilizan las carátulas y las capturas originales; para el mapa antiguo sin imagen local se utiliza una portada tipográfica, evitando confundirlo con una captura del juego nuevo.

La portada responde en orden a tres preguntas: quién está detrás, qué está haciendo ahora y qué más se puede explorar. Reino Visigodo y Maximilian 23 mantienen la prioridad indicada en la portada anterior. La música conserva una sección destacada, además de su catálogo completo. El contacto ofrece el correo real de forma directa.

## Arquitectura y contenido conservado

| Dirección | Contenido y papel |
| --- | --- |
| `index.html` | Presentación, proyectos actuales, selección musical y acceso a biografía y contacto. |
| `archivo.html` | Nuevo índice de nueve proyectos con seis filtros, incluido Todos. |
| `sobre-mi.html` | Nueva página con la biografía completa y sus enlaces. |
| `proyectos.html` | Las cuatro obras musicales. |
| `icaro.html` | Texto, producción, créditos, Spotify, Ni mirarte, entrevista y reproductor de nueve pistas. |
| `maquis.html` | Banda sonora, créditos de Pena de soledad y de Y sin embargo, te quiero, momentos musicales, tráiler y película. |
| `bajo.html` | I Walk Alone, Los Riscos, Pena de soledad, vídeos y plataformas. |
| `bynox.html` | Contexto de IA musical e Italo Dance, carátula, banner, playlist y perfiles. |
| `videojuegos.html` | Reino Visigodo, origen en el aula de Llerena, mecánicas, banda sonora, capturas, tráiler y Steam. |
| `maximilian23.html` | Diez entradas conservadas: asistente, presentación, Aula del Futuro, ¿Se juega?, laboratorio, radio, plástica, herramientas, meteoescuela y entrevista. |
| `entretenimiento.html` | Las dos obras narrativas e históricas; dirección anterior conservada. |
| `libro.html` | Nuestra Historia, origen en el dictado, texto y Amazon. Portada local en lugar de imagen remota. |
| `almendralejo.html` | Periodo, mapa, mod, colaboradores de voz y vídeo. |
| `agente.html` | Xal’Zaroth y conexión al mismo servicio conversacional. Cambia a conversación de sesión, sin escritura de memoria persistente. |
| `contacto.html` | Correo original `mmfrutos@mmfrutos.com`. |

## Audios: resultado de la investigación

No hay archivos MP3 ni manifiestos `lista.txt` en ninguno de los 16 commits accesibles ni en la única rama remota, `main`. Esto no demuestra que nunca se subieran a otro repositorio, a una historia reescrita o a otro alojamiento. Sí descarta una eliminación recuperable en el historial disponible que se ha revisado.

Se comprobaron por HTTP HEAD `https://mmfrutos.com/mp3/lista.txt`, `https://mmfrutos.com/lista/lista.txt` y `https://mmfrutos.com/mp3/01%20Ni%20mirarte.mp3`: las tres rutas devolvieron 404. No se ha afirmado que las nueve rutas individuales fallen, porque solo se comprobó esa primera canción y los dos manifiestos.

El reproductor queda preparado para restaurar `mp3/` o `lista/` con los nombres originales. También acepta el manifiesto original con líneas `archivo.mp3 - Título` o `Título - archivo.mp3`, solo nombres locales. No se han inventado audios ni se han descargado canciones de plataformas. El repositorio no contiene un reproductor independiente para la banda sonora del videojuego; conserva su tráiler y la referencia a la música original. Si se facilitan esos audios, se podrá añadir su escucha usando el mismo patrón.

## Validación y límites

Las comprobaciones ejecutadas se detallan en `VALIDACION.md`. No se ha realizado una auditoría WCAG completa ni se atribuye una puntuación Lighthouse. Los enlaces a terceros se conservan, pero su disponibilidad futura depende de esas plataformas. El servicio conversacional mantiene su endpoint; el rediseño no modifica ese backend.

## Publicación

No se modifica `CNAME`, `.nojekyll` ni `.github/workflows/import-site.yml`. No se utiliza Sites para alojar esta propuesta ni se altera la web actual. La rama y el PR sirven para revisar y aprobar. Cualquier fusión o publicación requiere una instrucción posterior del usuario.
