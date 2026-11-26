# Rollana — Motion Graphic (9:16)

- `Rollana_Motion_9x16.mp4` — the final video (1080×1920, 30fps, 33s, -14 LUFS)
- `scene.html` — the animation (Canvas). Open `scene.html?play` on a local server for a live preview.
- `music.py` — generates the original music and sound effects (numpy/scipy)
- `render.js` — renders the frames with Playwright
- `audio/` — voiceover lines (ar-SA-HamedNeural voice) and the mixes

Rebuild:
```
python3 music.py
python3 -m http.server 8765 &   # inside rollana/
node render.js full frames
# then the ffmpeg mix and encode commands
```
