import React from 'react';
import { AbsoluteFill } from 'remotion';
import { easeOut, keys, tw } from '../animations/ease';
import { useSceneTime } from '../animations/useSceneTime';
import { ArabicTitle } from '../components/ArabicTitle';
import { RUQAA } from '../components/Fonts';
import { Finish, Glow, LightBeam } from '../components/Light';
import { CoconutFlakes, GoldDust } from '../components/Particles';
import { Product } from '../components/Product';
import { SCENES, wordAt } from '../timeline';

/** 00:00 – hook: dark stage, a blade of gold light, coconut flakes, the ball emerges. */
export const S1Hook: React.FC = () => {
  const t = useSceneTime(0);
  const s0 = SCENES.hook[0];
  const beamX = keys(t, [[0, 330], [3.8, 470]], easeOut);
  const beamO = keys(t, [[0, 0.55], [0.6, 1], [3.8, 0.9]]);
  const emerge = tw(t, [0, 1.1], [0, 1], easeOut);
  const scale = keys(t, [[0, 0.6], [3.8, 0.71]], (x) => x); // constant slow push
  const rot = tw(t, [0, 1.6], [-9, 0], easeOut);
  const words = ['لِلفخامةِ', 'مذاقٌ', 'آخر...'];
  const times = [0, 1, 2].map((i) => wordAt(0, i) - s0);
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 42%, #2b1e14 0%, #15100b 48%, #070605 100%)', overflow: 'hidden' }}>
      <GoldDust count={26} seed="s1big" big opacity={0.5} rise={10} />
      <LightBeam x={beamX} y={760} angle={-24} width={430} opacity={beamO} />
      <LightBeam x={beamX + 260} y={760} angle={-24} width={140} opacity={beamO * 0.5} />
      <Glow x={540} y={820} r={520} color="rgba(197,164,109,0.42)" opacity={emerge} blend="screen" />
      <CoconutFlakes count={34} seed="s1back" dark speed={0.45} sizeMul={0.8} opacity={0.75} />
      <Product
        name="ballWhole" x={540} y={830} scale={scale} rotate={rot}
        opacity={0.5 + 0.5 * emerge} blur={(1 - emerge) * 5} shade={0.75}
        shadow="0 40px 60px rgba(0,0,0,0.55)"
      />
      {/* rim light from the beam, a separate layer around the ball */}
      <Glow x={430} y={640} r={260} color="rgba(255,222,160,0.35)" opacity={emerge * 0.8} blend="screen" />
      <CoconutFlakes count={14} seed="s1front" dark speed={0.9} sizeMul={1.7} opacity={0.9} />
      <ArabicTitle words={words} times={times} font={RUQAA} size={104} y={1300} shadow="0 6px 18px rgba(0,0,0,0.6)" />
      <div style={{ position: 'absolute', left: 540 - 160 * tw(t, [times[2], times[2] + 0.9], [0, 1], easeOut), width: 320 * tw(t, [times[2], times[2] + 0.9], [0, 1], easeOut), top: 1500, height: 2, background: 'linear-gradient(90deg, rgba(197,164,109,0), #E8D3A0, rgba(197,164,109,0))' }} />
      <Finish dark vignette={0.6} grainSeed={1} />
    </AbsoluteFill>
  );
};
