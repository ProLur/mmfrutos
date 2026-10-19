"""Build the static portfolio. Python standard library only; no runtime framework."""
from pathlib import Path
import json, re
from html import escape

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / 'content'
NAV = [('index.html','Inicio'),('archivo.html','Proyectos'),('sobre-mi.html','Sobre mí'),('contacto.html','Contacto')]

def link(url, label, cls='text-link'):
    external = ' target="_blank" rel="noopener noreferrer"' if url.startswith('https:') else ''
    return f'<a class="{cls}" href="{escape(url,quote=True)}"{external}>{label}</a>'

def page(file, title, description, body, active='archivo.html', script=''):
    def fallback(match):
        tag = match[0]
        video_id = re.search(r'data-youtube-id="([\w-]+)"',tag)[1]
        video_title = re.search(r'data-youtube-title="([^"]+)"',tag)[1]
        return tag.replace('</div>',f'<noscript><a href="https://www.youtube.com/watch?v={video_id}">Ver {video_title} en YouTube ↗</a></noscript></div>')
    body = re.sub(r'<div class="youtube-embed"[^>]*></div>',fallback,body)
    nav = ''.join(f'<li><a href="{u}"'+(' aria-current="page"' if u==active else '')+f'>{t}</a></li>' for u,t in NAV)
    html = f'''<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="{escape(description,quote=True)}"><meta name="theme-color" content="#f4f1e9">
<meta property="og:title" content="{escape(title,quote=True)} · Manuel M. Frutos"><meta property="og:description" content="{escape(description,quote=True)}"><meta property="og:type" content="website">
<title>{escape(title)} · Manuel M. Frutos</title><link rel="stylesheet" href="style.css?v=editorial1"><script src="main.js?v=editorial1" defer></script>{script}</head>
<body><a class="skip" href="#contenido">Saltar al contenido</a>
<header class="site-header"><a class="wordmark" href="index.html" aria-label="Manuel M. Frutos, inicio">Manuel M. Frutos<span>Música · tecnología · aula</span></a>
<nav aria-label="Navegación principal"><button id="menuBtn" aria-expanded="false" aria-controls="menu">Menú <span aria-hidden="true">＋</span></button><ul id="menu">{nav}</ul></nav></header>
{body}
<footer class="site-footer"><a class="wordmark" href="index.html">Manuel M. Frutos</a><p>Un archivo de música, ideas y cosas que voy haciendo.</p><div><span>© <span id="year">2026</span></span>{link('mailto:mmfrutos@mmfrutos.com','Escríbeme ↗')}{link('archivo.html','Explorar proyectos')}</div></footer>
</body></html>'''
    (ROOT/file).write_text(html,encoding='utf-8')

projects = [
    dict(url='videojuegos.html',title='Reino Visigodo',subtitle='Conquista de Hispania',category='Videojuegos',date='En desarrollo',image='reino-visigodo-header.jpg',text='De una historia escrita en clase a un juego de estrategia histórica. Un proyecto de MMF Games.'),
    dict(url='maximilian23.html',title='Maximilian 23',subtitle='Tecnología que nace en el aula',category='Educación',date='Desde 2025',image='lab23.jpg',text='Un asistente y un conjunto de herramientas para enseñar, escuchar y crear.'),
    dict(url='icaro.html',title='Ícaro Caído',subtitle='Nueve canciones desde la guitarra',category='Música',date='2008',image='icaro.jpg',text='Mi primer disco, autopublicado con el productor Alejandro de Pinedo.'),
    dict(url='maquis.html',title='La Guerra de los Malditos',subtitle='Música para una historia de posguerra',category='Música',date='2024',image='peli.jpg',text='Banda sonora original y el bolero de los créditos, Pena de soledad.'),
    dict(url='bajo.html',title='Bajo Manuel M. Frutos',subtitle='Canciones y memoria familiar',category='Música',date='2025',image='yo.png',text='I Walk Alone, un homenaje a Los Riscos, y nuevas formas de producción sonora.'),
    dict(url='bynox.html',title='Bynox Core',subtitle='Electrónica y experimentación',category='Música',date='2025',image='bynox2.jpg',text='Italo Dance, nostalgia de los 2000 y experimentos con inteligencia artificial musical.'),
    dict(url='libro.html',title='Nuestra Historia',subtitle='Una historia de visigodos',category='Escritura',date='2021',image='libro.jpg',text='Un dictado de clase que acabó convertido en una aventura escrita con mis alumnos.'),
    dict(url='almendralejo.html',title='Almendralejo, 1936',subtitle='Un mapa y la memoria de un lugar',category='Videojuegos',date='2003 / 2004',image='reino-visigodo-ss1.jpg',text='Mapa para 1936, España en llamas, con las voces de Primitivo Rojas y Fernando Sierra.'),
    dict(url='agente.html',title="Xal’Zaroth",subtitle='Un experimento conversacional',category='Experimentos',date='IA',image='xal.png',text='Un personaje con el que conversar: mi agente de inteligencia artificial.')
]

def card(p, number=None):
    # Historical mod has no local still: use a typographic cover rather than an unrelated image.
    image = f'<div class="type-cover" aria-hidden="true">Almendralejo<span>1936</span></div>' if p['url']=='almendralejo.html' else f'<img src="img/{p["image"]}" alt="{escape(p["title"])}" loading="lazy" width="800" height="600">'
    return f'''<article class="project" data-category="{p['category']}"><a class="project-image {('album' if p['url'] in ['icaro.html','libro.html'] else '')}" href="{p['url']}" tabindex="-1" aria-hidden="true">{image}<span class="image-arrow" aria-hidden="true">↗</span></a><div class="project-meta"><span>{p['category']}</span><span>{p['date']}</span></div><h2><a href="{p['url']}">{p['title']}</a></h2><p>{p['text']}</p></article>'''

home = '''<main id="contenido"><section class="home-hero"><div class="hero-text"><p class="kicker">El espacio personal de Manuel M. Frutos</p><h1>Siempre hay<br>algo por <em>crear.</em></h1><p class="intro">Una canción, una historia, una herramienta para el aula. La curiosidad es el hilo que une todo lo que hago.</p><div class="actions">'''+link('archivo.html','Explorar mis proyectos <span aria-hidden="true">↗</span>','button')+link('sobre-mi.html','Un poco sobre mí →')+'''</div></div><figure class="portrait"><div><img src="img/yo.png" alt="Ilustración de Manuel M. Frutos con una guitarra" width="400" height="500"></div><figcaption>Entre la música y las ganas de hacer cosas.</figcaption></figure></section>
<section class="selected"><div class="section-heading"><div><p class="kicker">En mi mesa de trabajo</p><h2>Ahora, en marcha.</h2></div><p>Dos proyectos en los que se encuentran<br>la historia, la música y el aula.</p></div>
<a class="feature-game" href="videojuegos.html"><div class="game-image"><img src="img/reino-visigodo-header.jpg" alt="Ilustración de Reino Visigodo: Conquista de Hispania" width="920" height="430"></div><div class="feature-copy"><span class="kicker">01 / Videojuegos · MMF Games</span><h3>Reino Visigodo</h3><p class="serif-small">Conquista de Hispania</p><p>La historia que empezó en clase sigue creciendo. Ahora, en un juego de estrategia.</p><span class="text-link">Conocer el proyecto ↗</span></div></a>
<a class="feature-aula" href="maximilian23.html"><div><p class="kicker">02 / Educación y tecnología</p><h3>Maximilian 23</h3><p>Herramientas hechas desde el aula, para el aula.</p><span class="text-link">Entrar en el proyecto ↗</span></div><img src="img/lab23.jpg" alt="Laboratorio Musical de Maximilian 23" loading="lazy" width="800" height="450"></a></section>
<section class="music-section"><div class="section-heading"><div><p class="kicker">Un hilo que siempre vuelve</p><h2>La música, de fondo<br>y en primer plano.</h2></div>'''+link('proyectos.html','Ver todos los trabajos musicales →')+'''</div><div class="project-grid">'''+''.join(card(projects[i]) for i in [2,3,5])+'''</div></section>
<section class="personal-note"><p class="kicker">De dónde viene todo esto</p><div><h2>Antes de todo,<br>un Spectrum.</h2><p>Un parque dibujado en BASIC, un patinete hecho de líneas y círculos. Después llegaron FastTracker 2, las canciones y las historias. Las herramientas han cambiado; las ganas de construir cosas siguen ahí.</p>'''+link('sobre-mi.html','Leer mi historia →')+'''</div></section><section class="contact-strip"><h2>¿Hacemos algo juntos?</h2>'''+link('contacto.html','Hablemos ↗','button')+'''</section></main>'''
page('index.html','Inicio','Música, videojuegos, escritura y herramientas para el aula. El espacio personal de Manuel M. Frutos.',home,'index.html')

def catalogue(file,title,desc,subset,category='Todos'):
    filters=''
    if file=='archivo.html':
        filters='<div class="filters" role="group" aria-label="Filtrar proyectos" hidden>'+''.join(f'<button data-filter="{c}" aria-pressed="{str(c==category).lower()}">{c}</button>' for c in ['Todos','Música','Videojuegos','Educación','Escritura','Experimentos'])+'</div><p class="result-count" id="resultCount" role="status"></p>'
    body=f'<main id="contenido"><header class="page-heading"><p class="kicker">Archivo personal / {len(subset):02d} proyectos</p><h1>{title}</h1><p class="intro">{desc}</p></header>{filters}<div class="project-grid catalogue">'+''.join(card(p) for p in subset)+'</div></main>'
    page(file,title,desc,body)

catalogue('archivo.html','Lo que voy haciendo.','Música, juegos, historias y herramientas. Distintas formas de dar cuerpo a una idea.',projects)
catalogue('proyectos.html','Música propia.','De las canciones nacidas desde la guitarra a la música para cine y la experimentación electrónica.',[p for p in projects if p['category']=='Música'])
catalogue('entretenimiento.html','Historias y otros mundos.','Escritura, historia local y proyectos que empezaron por curiosidad.',[p for p in projects if p['url'] in ['libro.html','almendralejo.html']])

titles={p['url']:(p['title'],p['text']) for p in projects}
for name in ['icaro','maquis','bajo','bynox','libro','almendralejo','videojuegos']:
    title,desc=titles[name+'.html']
    body=(CONTENT/f'{name}.html').read_text(encoding='utf-8')
    breadcrumb='<div class="breadcrumb">'+link('archivo.html','← Todos los proyectos')+f'<span>{title}</span></div>'
    body=breadcrumb+body
    if name!='videojuegos':
        body=body.replace('</main>','<aside class="next-project">'+link('archivo.html','Seguir explorando el archivo →')+'</aside></main>')
    script='<script src="player.js" defer></script>' if name=='icaro' else ''
    page(name+'.html',title,desc,body,script=script)

items=json.loads((CONTENT/'aula.json').read_text(encoding='utf-8'))
tools=''
for i,item in enumerate(items):
    video=f'<div class="youtube-embed" data-youtube-id="{item["videoId"]}" data-youtube-title="{escape(item["videoTitle"],quote=True)}"></div>' if item.get('videoId') else ''
    tools+=f'<article class="tool-row"><span class="tool-number">{i+1:02d}</span><div><h2>{item["title"]}</h2><p>{item["text"]}</p>{video}</div>'+link(item['href'],item['action']+' ↗')+'</article>'
page('maximilian23.html','Maximilian 23','Herramientas digitales creadas desde el aula: asistente, laboratorio musical, audiciones, plástica y meteorología.',f'''<main id="contenido"><header class="page-heading"><p class="kicker">Educación y tecnología / Desde el curso 25/26</p><h1>Maximilian 23</h1><p class="intro">Ideas que se prueban<br>en el aula.</p><p>Empezó como un asistente educativo. En el curso 26/27 sigue creciendo con herramientas para escuchar, crear y organizar el día a día del centro.</p><div class="actions">{link('https://maximilian23.com/','Abrir Maximilian 23 ↗','button')}</div></header><figure class="wide-image"><img src="img/lab23.jpg" alt="Interfaz del Laboratorio Musical" width="1200" height="675"><figcaption>Laboratorio Musical · Una de las herramientas del proyecto.</figcaption></figure><section class="tools" aria-label="Herramientas y recursos">{tools}</section></main>''')
bio=(CONTENT/'biografia.html').read_text(encoding='utf-8')
page('sobre-mi.html','Sobre mí','Del Spectrum y FastTracker 2 a la música, la escritura y la tecnología educativa. La historia de Manuel M. Frutos.',f'''<main id="contenido"><header class="page-heading"><p class="kicker">Sobre mí</p><h1>La curiosidad<br>como punto de partida.</h1></header><div class="bio-layout"><aside><img src="img/yo.png" alt="Ilustración de Manuel M. Frutos tocando la guitarra" width="400" height="500"><p>Música, tecnología, escritura y educación.</p></aside><article class="prose">{bio}<p>{link('contacto.html','Si quieres contarme una idea, escríbeme →')}</p></article></div></main>''','sobre-mi.html')
page('contacto.html','Contacto','Escribe a Manuel M. Frutos para propuestas, colaboraciones o consultas.','''<main id="contenido" class="contact-page"><p class="kicker">Contacto</p><h1>Todo empieza<br>con una <em>conversación.</em></h1><p class="intro">Para una colaboración, una propuesta o simplemente para contarme algo.</p>'''+link('mailto:mmfrutos@mmfrutos.com','mmfrutos@mmfrutos.com ↗','email-link')+'''<p>Escríbeme directamente por correo.</p><div class="contact-bottom"><span>Música · Videojuegos · Educación · Escritura</span>'''+link('archivo.html','Conoce antes mis proyectos →')+'''</div></main>''','contacto.html')

page('agente.html',"Xal’Zaroth",'Agente de inteligencia artificial de Manuel M. Frutos. Un experimento conversacional.', '''<main id="contenido"><header class="page-heading"><p class="kicker">Experimentos / Inteligencia artificial</p><h1>Xal’Zaroth</h1><p class="intro">Un personaje al otro lado<br>de la conversación.</p></header><section class="agent-layout"><img src="img/xal.png" alt="Personaje Xal’Zaroth" width="400" height="500"><div><p>Un ser extraterrestre hostil, culto y despiadado que observa a la humanidad desde su nave. Un agente narrativo de IA con el que puedes conversar desde aquí.</p><p class="service-note">Al enviar un mensaje, su contenido se transmite al servicio de Xal’Zaroth alojado en Render. La conversación de esta página dura mientras la mantengas abierta. El servicio puede tardar en despertar.</p><div id="chat" class="chat-log" role="log" aria-label="Conversación con Xal’Zaroth" aria-live="polite"></div><form id="chatForm"><label for="message">Tu mensaje</label><div class="chat-input"><input id="message" name="message" required maxlength="2000" autocomplete="off" placeholder="Escribe a Xal’Zaroth…"><button class="button" type="submit">Enviar ↗</button></div></form><p id="chatStatus" role="status"></p><button id="clearChat" class="text-button" type="button">Borrar conversación de esta página</button></div></section></main>''',script='<script src="agent.js" defer></script>')
print('Generated 15 portfolio pages. PIDE is excluded.')
