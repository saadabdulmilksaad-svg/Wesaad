#!/usr/bin/env bash
# Assemble VO on the timeline, duck the music under it, add SFX, master to -14 LUFS.
# If assets/audio/voiceover-external.mp3 exists (e.g. ElevenLabs full read), it is used as-is from t=0.
set -euo pipefail
cd "$(dirname "$0")/.."
A=assets/audio
read -r -a ST < <(python3 -c "import json;print(*json.load(open('timeline.json'))['vo_start'])")
if [[ -f $A/voiceover-external.mp3 ]]; then
  ffmpeg -y -v error -i $A/voiceover-external.mp3 -af "apad=whole_dur=30" -ar 48000 -ac 2 $A/voice.wav
else
  IN=(); F=""; MIX=""
  for i in 0 1 2 3 4 5; do
    IN+=(-i "$A/vo_$((i+1)).mp3")
    ms=$(python3 -c "print(int(${ST[$i]}*1000))")
    F+="[$i:a]aresample=48000,adelay=${ms}|${ms}[v$i];"; MIX+="[v$i]"
  done
  ffmpeg -y -v error "${IN[@]}" -filter_complex \
    "${F}${MIX}amix=inputs=6:normalize=0,pan=stereo|c0=c0|c1=c0,highpass=f=70,equalizer=f=180:t=q:w=1:g=1.5,equalizer=f=3200:t=q:w=1.2:g=2,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=2,aecho=0.8:0.5:38|61:0.12|0.08,apad=whole_dur=30,atrim=0:30" \
    $A/voice.wav
fi
cp $A/voice.wav output/rollana-voiceover.wav
ffmpeg -y -v error -i output/rollana-voiceover.wav -c:a libmp3lame -b:a 192k output/rollana-voiceover.mp3
# music ducked by the voice (sidechain), sfx under, final loudness -14 LUFS / -1 dBTP
ffmpeg -y -v error -i $A/music.wav -i $A/voice.wav -i $A/sfx.wav -filter_complex \
  "[1:a]asplit=2[vk][vm];[0:a]volume=0.55[m];[m][vk]sidechaincompress=threshold=0.03:ratio=6:attack=40:release=450:makeup=1[md];[2:a]volume=0.5[s];[md][vm][s]amix=inputs=3:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=9,atrim=0:30[out]" \
  -map "[out]" -ar 48000 $A/mix.wav
ffmpeg -v error -i $A/mix.wav -af ebur128=peak=true -f null - 2>&1 | tail -0
echo mixed
