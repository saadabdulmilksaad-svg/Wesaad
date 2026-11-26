import React from 'react';
import { AbsoluteFill, random } from 'remotion';
import { easeIn, easeOut, keys, tw } from '../animations/ease';
import { useSceneTime } from '../animations/useSceneTime';
import { ArabicTitle } from '../components/ArabicTitle';
import { MESSIRI } from '../components/Fonts';
import { CreamWaves } from '../components/CreamWaves';
import { Finish, Glow } from '../components/Light';
import { CoconutFlakes, GoldDust } from '../components/Particles';
import { Almond, ContactShadow, Product } from '../components/Product';
import { PRE, SCENES, wordAt } from '../timeline';

const ALMONDS = [
  // angle(deg), radius, size, depth(0 far..1 near), spin
  [205, 400, 210, 0.55, 18], [-25, 420, 250, 0.7, -14], [120, 470, 170, 0.3, 26],
  [60, 390, 190, 0.45, -20], [250, 520, 330, 1.0, 10], [-70, 520, 300, 0.95, -8], [160, 330, 140, 0.15, 30],
];

/** 00:04 – the taste journey: ivory set, ingredients orbit the ball, white chocolate flows. */
export const S2Journey: React.FC = () => {
  const t = useSceneTime(PRE);
  const s0 = SCENES.journey[0];
  const dur = SCENES.journey[1] - s0;
  // iris (mask) reveal out of the dark hook
  const iris = tw(t, [-PRE, 0.25], [0, 1400], easeIn);
  // match-cut push: ball rushes to camera at the end
  const rush = tw(t, [dur - 0.55, dur], [0, 1], easeIn);
  const bob = Math.sin(t * 1.6) * 12;
  const ballScale = 0.5 * (1 + rush * 2.6) * keys(t, [[-0.5, 0.92], [dur, 1.06]], (x) => x);
  const words = ['حكايةٌ', 'من', 'النكهاتِ', 'المتناغمة'];
  const times = [3, 4, 5, 6].map((i) => wordAt(1, i) - s0);
  return (
    <AbsoluteFill style={{ clipPath: `circle(${iris}px at 540px 830px)`, overflow: 'hidden' }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 85% 65% at 50% 38%, #fffdf8 0%, #F8F5ED 42%, #eadfc8 78%, #d8c6a2 100%)' }} />
      {/* champagne-gold rings echoing the logo oval */}
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          position: 'absolute', left: 540 - (380 + i * 90), top: 830 - (300 + i * 70), width: 2 * (380 + i * 90), height: 2 * (300 + i * 70),
          borderRadius: '50%', border: `${3 - i}px solid rgba(197,164,109,${0.55 - i * 0.15})`,
          transform: `rotate(${-12 + t * (4 - i * 2.5)}deg) scale(${1 + rush * 1.5})`, opacity: tw(t, [0, 1], [0, 1]) * (1 - rush),
        }} />
      ))}
      <Glow x={540} y={760} r={600} color="rgba(255,255,255,0.9)" />
      <GoldDust count={22} seed="s2big" big opacity={0.35} rise={8} />
      {/* far almonds */}
      {ALMONDS.filter((a) => a[3] < 0.6).map((a, i) => <Orbit key={i} a={a} t={t} rush={rush} idx={i} />)}
      <CoconutFlakes count={30} seed="s2back" speed={0.35} sizeMul={0.9} opacity={0.9} />
      <CreamWaves t={t} y={1440 - tw(t, [-0.3, 1.6], [0, 90], easeOut)} layers={4} amp={52} />
      <ContactShadow x={540} y={1360} w={420 * (1 - rush)} opacity={0.35 - bob * 0.008} />
      <Product name="ballWhole" x={540} y={830 + bob * (1 - rush)} scale={ballScale} rotate={Math.sin(t * 0.9) * 3}
        shadow="0 40px 50px rgba(90,60,25,0.32)" blur={rush * 16} />
      {/* near almonds (foreground parallax, defocused) */}
      {ALMONDS.filter((a) => a[3] >= 0.6).map((a, i) => <Orbit key={i} a={a} t={t} rush={rush} idx={i + 10} />)}
      <CoconutFlakes count={10} seed="s2front" speed={0.8} sizeMul={2.2} opacity={0.95} />
      <ArabicTitle words={words} times={times} font={MESSIRI} size={78} y={300} gold={false} color="#3A2A1E" out={dur - 0.5} />
      <Finish vignette={0.28} grainSeed={2} />
      {/* gold edge of the iris */}
      {iris < 1300 && (
        <div style={{ position: 'absolute', left: 540 - iris, top: 830 - iris, width: 2 * iris, height: 2 * iris, borderRadius: '50%', boxShadow: '0 0 40px 10px rgba(232,200,130,0.9), inset 0 0 30px 6px rgba(255,240,200,0.8)' }} />
      )}
    </AbsoluteFill>
  );
};

const Orbit: React.FC<{ a: number[]; t: number; rush: number; idx: number }> = ({ a, t, rush, idx }) => {
  const [ang, rad, size, depth, spin] = a;
  const enter = tw(t, [-0.2 + idx * 0.07, 1.3 + idx * 0.07], [0, 1], easeOut);
  const ang2 = ((ang + t * (6 + 6 * depth) * (idx % 2 ? 1 : -1)) * Math.PI) / 180;
  const r = rad * (1.9 - 0.9 * enter) * (1 + rush * (0.8 + depth));
  const x = 540 + Math.cos(ang2) * r;
  const y = 830 + Math.sin(ang2) * r * 0.85 + Math.sin(t * 1.3 + idx) * 10;
  const blur = depth > 0.8 ? 7 + 6 * (depth - 0.8) * 5 : depth < 0.35 ? 3 : 0.6;
  return <Almond x={x} y={y} size={size} rotate={random(`alm${idx}`) * 360 + t * spin} blur={blur + rush * 10} opacity={enter * (1 - rush * 0.6)} />;
};
