import React from 'react';
import { AbsoluteFill } from 'remotion';
import { easeOut, keys, silky, tw } from '../animations/ease';
import { useSceneTime } from '../animations/useSceneTime';
import { ArabicTitle } from '../components/ArabicTitle';
import { RUQAA } from '../components/Fonts';
import { Finish, Glow } from '../components/Light';
import { CoconutFlakes, GoldDust } from '../components/Particles';
import { Almond, Product } from '../components/Product';
import { SilkRibbon } from '../components/SilkRibbon';
import { PRE, SCENES, wordAt } from '../timeline';

/** 00:17 – the pack: original wrapper centre stage, silk ribbon, light sweep. */
export const S4Reveal: React.FC = () => {
  const t = useSceneTime(PRE);
  const s0 = SCENES.reveal[0];
  const dur = SCENES.reveal[1] - s0;
  // diagonal light-wipe in
  const L = tw(t, [-PRE, 0.35], [1500, -700], silky);
  const enter = tw(t, [-0.1, 1.3], [0, 1], easeOut);
  const push = keys(t, [[0, 0], [dur + 0.5, 1]], (x) => x);
  const scale = 0.655 * (0.82 + 0.18 * enter) * (1 + 0.05 * push);
  const y = 960 + (1 - enter) * 300 + Math.sin(t * 1.2) * 6;
  const rot = -16 * (1 - enter) - 5 + 2 * push;
  const sweep1 = tw(t, [0.9, 2.1], [-0.25, 1.25]);
  const sweep2 = tw(t, [4.2, 5.4], [-0.25, 1.25]);
  const sweep = t < 3 ? sweep1 : sweep2;
  const l4 = ['تفاصيلُ', 'تلتقي', 'في', 'كلِّ', 'قضمة...'];
  const l5 = ['لتمنحَ', 'لحظاتِك', 'مذاقًا', 'استثنائيًّا'];
  return (
    <AbsoluteFill style={{ clipPath: `polygon(${L}px 0, 2400px 0, 2400px 1920px, ${L - 700}px 1920px)`, overflow: 'hidden' }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 55% at 50% 50%, #ecd6a8 0%, #c9a466 32%, #8b6533 62%, #33210f 100%)' }} />
      <GoldDust count={26} seed="s4big" big opacity={0.6} rise={10} />
      {/* parallax: far ribbon (slow, soft) -> near ribbon */}
      <div style={{ position: 'absolute', inset: 0, transform: `translateX(${-push * 30}px)` }}>
        <SilkRibbon t={t} y0={1480} amp={110} width={80} rotate={-6} opacity={0.7} blur={4} seed={2.2} reveal={tw(t, [0, 1.2], [0, 1], easeOut)} speed={0.8} />
      </div>
      <Glow x={540} y={960} r={620} color="rgba(255,244,215,0.85)" opacity={enter} />
      <div style={{ position: 'absolute', inset: 0, transform: `translateX(${-push * 70}px)` }}>
        <SilkRibbon t={t} y0={1000} amp={190} width={150} rotate={-10} seed={0.4} reveal={tw(t, [-0.2, 1.0], [0, 1], easeOut)} />
      </div>
      {/* the original wrapper */}
      <Product name="wrapper" x={540} y={y} scale={scale} rotate={rot} sweep={sweep} sweepOpacity={0.55}
        shadow="0 50px 45px rgba(40,20,5,0.5)" reflection={0.16 * enter} />
      <CoconutFlakes count={14} seed="s4" speed={0.6} sizeMul={1.4} opacity={0.85} />
      {/* foreground almonds, defocused */}
      <Almond x={130 - push * 90} y={1560} size={330} rotate={-30 + t * 6} blur={10} opacity={enter} />
      <Almond x={980 - push * 110} y={420} size={260} rotate={40 - t * 5} blur={9} opacity={enter * 0.9} />
      <ArabicTitle words={l4} times={[0, 1, 2, 3, 4].map((i) => wordAt(3, i) - s0)} font={RUQAA} size={92} y={330}
        gold={false} color="#FBF6EA" shadow="0 6px 16px rgba(40,20,5,0.55)" out={wordAt(4, 0) - s0 - 0.6} />
      <ArabicTitle words={l5} times={[0, 1, 2, 3].map((i) => wordAt(4, i) - s0)} font={RUQAA} size={92} y={330}
        gold={false} color="#FBF6EA" shadow="0 6px 16px rgba(40,20,5,0.55)" out={dur - 0.3} />
      <Finish dark vignette={0.35} grainSeed={4} />
      {/* bright edge of the wipe */}
      {L > -650 && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: 'screen' }}>
          <svg width={2400} height={1920} style={{ position: 'absolute', inset: 0, filter: 'blur(18px)' }}>
            <line x1={L} y1={0} x2={L - 700} y2={1920} stroke="rgba(255,236,190,0.95)" strokeWidth={70} />
          </svg>
        </div>
      )}
    </AbsoluteFill>
  );
};
