"""Validate generated pages, local links, landmarks and preserved media references."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import re,subprocess

ROOT=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.refs=[]; self.ids=[]; self.h1=0; self.main=0; self.lang=None; self.description=False
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='html': self.lang=a.get('lang')
        if tag=='h1': self.h1+=1
        if tag=='main': self.main+=1
        if tag=='meta' and a.get('name')=='description': self.description=True
        if 'id' in a: self.ids.append(a['id'])
        if tag=='img': assert 'alt' in a, 'Image without alternative text'
        for attr in ('src','href'):
            if attr in a: self.refs.append(a[attr])

pages={}
for path in ROOT.glob('*.html'):
    p=Page(); p.feed(path.read_text(encoding='utf-8')); pages[path.name]=p
    assert p.lang=='es' and p.h1==1 and p.main==1 and p.description, f'{path.name}: missing page semantics'
    assert len(p.ids)==len(set(p.ids)), f'{path.name}: duplicate IDs'
for name,p in pages.items():
    for ref in p.refs:
        url=urlsplit(ref)
        if url.scheme or url.netloc: continue
        target=ROOT/unquote(url.path or name)
        assert target.exists(), f'{name}: missing {ref}'
        if url.fragment and target.name in pages:
            assert url.fragment in pages[target.name].ids, f'{name}: missing fragment {ref}'
assert len(pages)==15, f'Expected 15 portfolio pages, got {len(pages)}'
assert len(re.findall(r'\[\'\d\d ',(ROOT/'player.js').read_text(encoding='utf-8')))==9
subprocess.run(['git','diff','--exit-code','main','--','pide/','.github/','CNAME','.nojekyll'],cwd=ROOT,check=True)
print(f'PASS: {len(pages)} pages; local links, images, unique IDs, main headings and descriptions; 9 tracks; PIDE and deployment configuration unchanged.')
