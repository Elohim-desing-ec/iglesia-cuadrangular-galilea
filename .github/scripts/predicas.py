"""Lee el canal de YouTube de la iglesia y guarda la lista de videos en data/predicas.json.

La usa predicas.html ("Mensajes que marcan la diferencia"): cuando termina cada culto en vivo,
YouTube lo publica en el canal y esta tarea (.github/workflows/predicas.yml, cada hora y cada
15 minutos los domingos) lo agrega a la lista. El feed solo trae los últimos 15 videos, así que
la lista se va acumulando aquí (máximo MAX videos). Se omiten los videos sin vistas: suelen ser
transmisiones programadas que todavía no empiezan.
"""
import json
import pathlib
import sys
import urllib.request
import xml.etree.ElementTree as ET

CHANNEL = 'UC4fUxSBxz1H2JGVnTPFdl_Q'
OUT = pathlib.Path(__file__).resolve().parents[2] / 'data' / 'predicas.json'
MAX = 60
NS = {'a': 'http://www.w3.org/2005/Atom', 'yt': 'http://www.youtube.com/xml/schemas/2015',
      'media': 'http://search.yahoo.com/mrss/'}

req = urllib.request.Request(f'https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL}',
                             headers={'User-Agent': 'Mozilla/5.0 (site feed reader)'})
# para probar en local se le puede pasar el feed ya descargado: python3 predicas.py feed.xml
raw = pathlib.Path(sys.argv[1]).read_bytes() if len(sys.argv) > 1 else urllib.request.urlopen(req, timeout=30).read()
root = ET.fromstring(raw)

fresh = []
for e in root.findall('a:entry', NS):
    stats = e.find('media:group/media:community/media:statistics', NS)
    if stats is not None and stats.get('views') == '0':
        continue
    fresh.append({'id': e.findtext('yt:videoId', namespaces=NS),
                  'title': e.findtext('a:title', namespaces=NS).strip(),
                  'published': e.findtext('a:published', namespaces=NS)})

old = json.loads(OUT.read_text(encoding='utf-8')) if OUT.exists() else []
seen = {v['id'] for v in fresh}
videos = sorted(fresh + [v for v in old if v['id'] not in seen], key=lambda v: v['published'], reverse=True)[:MAX]

OUT.parent.mkdir(exist_ok=True)
text = json.dumps(videos, ensure_ascii=False, indent=1) + '\n'
if not OUT.exists() or OUT.read_text(encoding='utf-8') != text:
    OUT.write_text(text, encoding='utf-8')
    print(f'{len(videos)} videos guardados')
else:
    print('Sin cambios')
