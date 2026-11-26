import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { loadFonts } from './components/Fonts';
import { S1Hook } from './scenes/S1Hook';
import { S2Journey } from './scenes/S2Journey';
import { S3Secret } from './scenes/S3Secret';
import { S4Reveal } from './scenes/S4Reveal';
import { S5Hero } from './scenes/S5Hero';
import { FPS, POST, PRE, SCENES, TOTAL_FRAMES } from './timeline';

loadFonts();

const seq = (start: number, end: number, pre: number, post: number) => ({
  from: Math.round((start - pre) * FPS),
  durationInFrames: Math.min(TOTAL_FRAMES, Math.round((end + post) * FPS)) - Math.round((start - pre) * FPS),
});

export const Commercial: React.FC<{ withAudio?: boolean }> = ({ withAudio = true }) => (
  <AbsoluteFill style={{ background: '#101010' }}>
    <Sequence name="01 Hook" {...seq(...SCENES.hook, 0, POST)}><S1Hook /></Sequence>
    <Sequence name="02 Journey" {...seq(...SCENES.journey, PRE, POST)}><S2Journey /></Sequence>
    <Sequence name="03 Secret" {...seq(...SCENES.secret, 0.3, POST)}><S3Secret /></Sequence>
    <Sequence name="04 Reveal" {...seq(...SCENES.reveal, PRE, POST)}><S4Reveal /></Sequence>
    <Sequence name="05 Hero" {...seq(...SCENES.hero, PRE, 0)}><S5Hero /></Sequence>
    {withAudio && <Audio src={staticFile('audio/mix.wav')} />}
  </AbsoluteFill>
);
