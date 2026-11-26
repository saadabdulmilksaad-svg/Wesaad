"""Arabic voice-over. Preferred engine: ElevenLabs (drop a file at
assets/audio/voiceover-external.mp3 to override). Fallback used here:
Microsoft neural voice ar-SA-HamedNeural (male, MSA) via edge-tts.
Writes one file per line + word timings to assets/audio/vo_timings.json"""
import asyncio, json, ssl, subprocess, os
import edge_tts, edge_tts.communicate as c
c._SSL_CTX = ssl.create_default_context(cafile=os.environ.get('SSL_CERT_FILE', '/root/.ccr/ca-bundle.crt'))

VOICE, RATE, PITCH = 'ar-SA-HamedNeural', '-8%', '-6Hz'
LINES = [  # diacritics guide the pronunciation of the approved script
    'لِلفَخامةِ مَذاقٌ آخَر...',
    'مَعَ رُولانا، تَبدأُ حِكايةٌ مِنَ النَّكَهاتِ المُتَناغِمة.',
    'وِيفَرٌ مُقَرمِش، وكَريمةٌ ناعِمة، وحَبّةُ لَوز، تُغَلِّفُها الشُّوكولاتةُ البَيضاءُ ورَقائقُ جَوزِ الهِند.',
    'تَفاصيلُ تَلتَقي في كُلِّ قَضمة...',
    'لِتَمنَحَ لَحَظاتِكَ مَذاقًا استِثنائيًّا.',
    'رُولانا... تَذَوَّقِ الفَخامة.',
]

async def one(i, text):
    com = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH, boundary='WordBoundary')
    words, audio = [], b''
    async for ch in com.stream():
        if ch['type'] == 'audio': audio += ch['data']
        elif ch['type'] == 'WordBoundary':
            words.append({'w': ch['text'], 't': ch['offset'] / 1e7, 'd': ch['duration'] / 1e7})
    fn = f'assets/audio/vo_{i + 1}.mp3'
    open(fn, 'wb').write(audio)
    dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', fn]))
    return {'file': fn, 'text': text, 'dur': dur, 'words': words}

async def main():
    out = [await one(i, t) for i, t in enumerate(LINES)]
    json.dump(out, open('assets/audio/vo_timings.json', 'w'), ensure_ascii=False, indent=1)
    for o in out: print(round(o['dur'], 2), o['text'])

asyncio.run(main())
