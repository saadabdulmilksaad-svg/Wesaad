import React from 'react';
import { AbsoluteFill, random } from 'remotion';
import { easeOut, keys, tw } from '../animations/ease';
import { useSceneTime } from '../animations/useSceneTime';
import { ArabicTitle } from '../components/ArabicTitle';
import { RUQAA } from '../components/Fonts';
import { Finish, Glow, LightBeam } from '../components/Light';
import { CoconutFlakes, GoldDust } from '../components/Particles';
import { Almond, ContactShadow, Product } from '../components/Product';
import { Podium } from '../components/Podium';
import { PRE, SCENES, wordAt } from '../timeline';

const BALL = 0.31; // one scale for both balls -> true relative size

/** 00:24 – hero: ivory pedestal, original wrapper + balls, tagline, long brand hold. */
export const S5Hero: React.FC = () => {
  const t = useSceneTime(PRE);
  const s0 = SCENES.hero[0];
  const dur = SCENES.hero[1] - s0;
  const fade = tw(t, [-PRE, 0.15], [0, 1]);
  const cam = keys(t, [[-PRE, 1.1], [0.8, 1.0], [dur, 1.065]], easeOut);
  const packIn = tw(t, [-0.2, 1.2], [0, 1], easeOut);
  const ballsIn = tw(t, [0.1, 1.3], [0, 1], easeOut);
  const float = Math.sin(t * 1.3) * 7;
  const sweep = tw(t, [2.3, 3.5], [-0.25, 1.25]);
  const tag = [0, 1, 2].map((i) => wordAt(5, i) - s0);
  return (
    <AbsoluteFill style={{ opacity: fade, overflow: 'hidden' }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 85% 60% at 50% 40%, #fffdf8 0%, #F8F5ED 40%, #e6d8bb 75%, #c8ae80 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, transformOrigin: '50% 58%', transform: `scale(${cam})` }}>
        <LightBeam x={540} y={500} angle={0} width={760} length={1900} opacity={0.5} color="255,236,200" />
        {/* gold oval echo of the logo */}
        <div style={{ position: 'absolute', left: 90, top: 470, width: 900, height: 620, borderRadius: '50%', border: '3px solid rgba(197,164,109,0.55)', boxShadow: '0 0 30px rgba(197,164,109,0.25)', opacity: packIn, transform: `scale(${0.9 + 0.1 * packIn})` }} />
        <GoldDust count={20} seed="s5big" big opacity={0.45} rise={6} />
        <Glow x={540} y={820} r={420} color="rgba(255,250,235,0.5)" blend="screen" />
        <Podium x={540} y={1250} w={920} h={420} glow={packIn} />
        {/* the original wrapper, floating above the pedestal */}
        <Product name="wrapper" x={540} y={800 + float + (1 - packIn) * 120} scale={0.6} rotate={-4 + Math.sin(t * 0.7) * 0.8} opacity={packIn}
          sweep={sweep} sweepOpacity={0.5} shadow="0 40px 40px rgba(80,55,20,0.35)" />
        <ContactShadow x={540} y={1215} w={560} opacity={0.22 * packIn} />
        {/* ingredients resting on the pedestal top */}
        <Almond x={215} y={1230} size={170} rotate={-38} opacity={ballsIn} />
        <Almond x={870} y={1245} size={160} rotate={28} opacity={ballsIn} />
        <Almond x={555} y={1300} size={150} rotate={-80} opacity={ballsIn} />
        {Array.from({ length: 26 }).map((_, i) => {
          const a = random(`pf${i}`) * Math.PI * 2, r = 0.55 + 0.42 * random(`pr${i}`);
          const x = 540 + Math.cos(a) * 430 * r, y = 1250 + Math.sin(a) * 135 * r;
          const s = 10 + 12 * random(`ps${i}`);
          return <div key={i} style={{ position: 'absolute', left: x, top: y, width: s, height: s * 0.38, borderRadius: '45% 55% 50% 50%', background: 'linear-gradient(160deg,#fff,#e6dccb)', boxShadow: '0 2px 3px rgba(90,70,40,0.25)', transform: `rotate(${random(`pa${i}`) * 180}deg)`, opacity: ballsIn }} />;
        })}
        <ContactShadow x={360} y={1262} w={250} opacity={0.5 * ballsIn} />
        <ContactShadow x={725} y={1262} w={290} opacity={0.5 * ballsIn} />
        <Product name="ballWhole" x={360} y={1262 - 1012 * BALL / 2 + 6 + (1 - ballsIn) * 40} scale={BALL} opacity={ballsIn} shadow="0 18px 18px rgba(80,55,20,0.3)" />
        <Product name="ballCut" x={725} y={1262 - 1092 * BALL / 2 + 14 + (1 - ballsIn) * 40} scale={BALL} opacity={ballsIn} shadow="0 18px 18px rgba(80,55,20,0.3)" />
      </div>
      <CoconutFlakes count={12} seed="s5" speed={0.3} sizeMul={1.5} opacity={0.8} />
      <GoldDust count={36} seed="s5dust" opacity={0.9} rise={22} />
      {/* tagline: brand name in the pack red, the promise in gold */}
      <ArabicTitle words={['رولانا...']} times={[tag[0]]} font={RUQAA} size={132} y={250} gold={false} color="#B71926" shadow="0 6px 14px rgba(120,20,25,0.25)" />
      <ArabicTitle words={['تذوّقِ', 'الفخامة']} times={[tag[1], tag[2]]} font={RUQAA} size={112} y={420} gold={false} color="#7a5a2a" shadow="0 4px 10px rgba(120,90,40,0.25)" />
      <div style={{ position: 'absolute', left: 540 - 190 * tw(t, [tag[2], tag[2] + 1], [0, 1], easeOut), width: 380 * tw(t, [tag[2], tag[2] + 1], [0, 1], easeOut), top: 600, height: 3, background: 'linear-gradient(90deg, rgba(197,164,109,0), #C5A46D, rgba(197,164,109,0))' }} />
      <Finish vignette={0.3} grainSeed={5} />
    </AbsoluteFill>
  );
};
