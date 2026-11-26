# ROLLANA — Premium Cinematic Commercial (Remotion)

إعلان موشن جرافيك عمودي 9:16 لمدة 30 ثانية لشوكولاتة رولانا، مبني بـ React + TypeScript + Remotion و FFmpeg.

## المخرجات

| الملف | الوصف |
|---|---|
| `output/rollana-commercial.mp4` | الفيديو النهائي — 1080×1920، 30fps، 900 إطار، H.264 + AAC، ‎-14 LUFS |
| `output/rollana-cover.png` | صورة الغلاف (Thumbnail) من المشهد الختامي |
| `output/rollana-voiceover.mp3` | التعليق الصوتي منفردًا، مضبوطًا على زمن الإعلان |
| `REPORT.md` | تقرير الجودة والأدوات ونتائج الفحص |

## هيكل المشروع

```
assets/original     صورة العبوة الأصلية (دون أي تعديل)
assets/products     قصّات من الصورة الأصلية: الغلاف، الحبة الكاملة، الحبة المقطوعة
assets/ingredients  حبة لوز مأخوذة من مقطع الحبة الأصلي
assets/audio        التعليق الصوتي، الموسيقى، المؤثرات، المكساج
assets/fonts        Aref Ruqaa · El Messiri · Cormorant Garamond
src/scenes          S1Hook · S2Journey · S3Secret · S4Reveal · S5Hero
src/components      المنتج، الشريط الحريري، رقائق جوز الهند، الإضاءة، المنصة، العناوين العربية
src/animations      منحنيات الحركة وزمن المشهد
scripts             القص، التعليق الصوتي، الموسيقى، المكساج، المراجعة
timeline.json       توقيت المشاهد وبداية كل جملة صوتية (مصدر واحد للصوت والصورة)
```

## إعادة البناء

```bash
npm install
python3 scripts/extract_products.py   # قص المنتج من الصورة الأصلية (rembg + أقنعة هندسية)
python3 scripts/voiceover.py          # التعليق الصوتي + توقيت الكلمات
python3 scripts/sound.py              # الموسيقى والمؤثرات (توليد أصلي)
./scripts/mix.sh                      # المكساج: Ducking + Loudness
npx remotion studio src/index.ts      # المعاينة
npx remotion render src/index.ts RollanaCommercial output/remotion-render.mp4
ffmpeg -i output/remotion-render.mp4 -c copy -movflags +faststart output/rollana-commercial.mp4
npx remotion still src/index.ts RollanaCommercial output/rollana-cover.png --frame=880 --image-format=png
```

## استبدال التعليق الصوتي بـ ElevenLabs

1. صدّر القراءة كاملة من ElevenLabs بصيغة MP3 واحفظها هنا: `assets/audio/voiceover-external.mp3` (تبدأ من الثانية 0، ومدتها 30 ثانية أو أقل).
2. للحفاظ على تزامن النصوص: اجعل كل جملة تبدأ عند الأزمنة الموجودة في `timeline.json → vo_start`، أو عدّل هذه الأزمنة.
3. شغّل `./scripts/mix.sh` ثم أعد التصيير.

