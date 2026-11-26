import React from 'react';
import { AbsoluteFill } from 'remotion';
import { easeOut, keys, tw } from '../animations/ease';
import { useSceneTime } from '../animations/useSceneTime';
import { ArabicTitle } from '../components/ArabicTitle';
import { MESSIRI, RUQAA } from '../components/Fonts';
import { Finish, Glow } from '../components/Light';
import { CoconutFlakes, GoldDust } from '../components/Particles';
import { PRODUCTS, Product } from '../components/Product';
import { SCENES, wordAt } from '../timeline';

const PRE3 = 0.3;
// focus points measured on the original cross-section (normalised to ball-cut.png)
const P = { center: [0.5, 0.5], wafer: [0.33, 0.70], cream: [0.42, 0.56], almond: [0.405, 0.33] };
const BS = 0.82; // display scale shared by both balls -> true relative size kept
const BX = 540, BY = 860; // ball-cut position in world space
const WHOLE_DX = -600, WHOLE_DY = 30;

/** 00:08 – the secret: camera travels across the real cross-section photo. */
export const S3Secret: React.FC = () => {
  const t = useSceneTime(PRE3);
  const s0 = SCENES.secret[0];
  const dur = SCENES.secret[1] - s0;
  const tW = wordAt(2, 1) - s0, tC = wordAt(2, 2) - s0, tA = wordAt(2, 4) - s0, tWrap = wordAt(2, 6) - s0;
  const cw = PRODUCTS.ballCut.w * BS, ch = PRODUCTS.ballCut.h * BS;
  const pt = (p: number[]) => [BX + (p[0] - 0.5) * cw, BY + (p[1] - 0.5) * ch];
  const [ox, oy] = pt(P.center);
  const aim = (p: number[], k: number) => { const [px, py] = pt(p); return [ox + (px - ox) * k, oy + (py - oy) * k]; };
  const [mwx, mwy] = pt(P.wafer), [mcx, mcy] = pt(P.cream), [max_, may] = pt(P.almond);
  const [wx, wy] = aim(P.wafer, 0.55), [cx, cy] = aim(P.cream, 0.6), [ax, ay] = aim(P.almond, 0.7);
  const pullX = BX + WHOLE_DX / 2 + 40, pullY = BY + 20;
  const fx = keys(t, [[0, ox], [tW - 0.25, ox], [tW + 0.45, wx], [tC - 0.1, wx], [tC + 0.5, cx], [tA - 0.1, cx], [tA + 0.55, ax], [tWrap - 0.35, ax], [tWrap + 1.0, pullX]]);
  const fy = keys(t, [[0, oy], [tW - 0.25, oy], [tW + 0.45, wy], [tC - 0.1, wy], [tC + 0.5, cy], [tA - 0.1, cy], [tA + 0.55, ay], [tWrap - 0.35, ay], [tWrap + 1.0, pullY]]);
  const z = keys(t, [[-PRE3, 1.55], [0.55, 1], [tW - 0.25, 1.0], [tW + 0.45, 1.22], [tC + 0.5, 1.28], [tA + 0.55, 1.45], [tWrap - 0.35, 1.5], [tWrap + 1.0, 0.72], [dur + 0.5, 0.76]]);
  const settleBlur = tw(t, [-PRE3, 0.45], [14, 0], easeOut);
  const fadeIn = tw(t, [-PRE3, -0.1], [0, 1]);
  const wholeIn = tw(t, [tWrap - 0.1, tWrap + 1.1], [0, 1], easeOut);
  const camY = 770;
  const marker = (at: number, until: number, x: number, y: number) => {
    const p = tw(t, [at, at + 0.5], [0, 1], easeOut) * (1 - tw(t, [until - 0.2, until + 0.2], [0, 1]));
    const pulse = 1 + 0.08 * Math.sin((t - at) * 5);
    const r = (34 / z) * pulse;
    return p > 0 ? (
      <div style={{ position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: '50%', opacity: p,
        border: `${2.5 / z}px solid rgba(247,231,191,0.95)`, boxShadow: `0 0 ${18 / z}px rgba(232,200,130,0.9), inset 0 0 ${10 / z}px rgba(255,240,200,0.6)`, transform: `scale(${0.6 + 0.4 * p})` }} />
    ) : null;
  };
  const label = (words: string[], at: number, until: number, size = 104) => (
    <ArabicTitle words={words} times={words.map((_, i) => at + i * 0.16)} font={RUQAA} size={size} y={1440} out={until} shadow="0 6px 16px rgba(0,0,0,0.55)" />
  );
  return (
    <AbsoluteFill style={{ opacity: fadeIn, overflow: 'hidden', background: 'radial-gradient(ellipse 75% 50% at 50% 42%, #fbf3e2 0%, #e9d6ae 30%, #9a7744 63%, #2a1d12 100%)' }}>
      <GoldDust count={24} seed="s3big" big opacity={0.55} rise={6} />
      <Glow x={540} y={800} r={560} color="rgba(255,248,230,0.75)" />
      {/* world (camera) */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0', transform: `translate(540px, ${camY}px) scale(${z}) translate(${-fx}px, ${-fy}px)`, filter: settleBlur > 0.1 ? `blur(${settleBlur}px)` : undefined }}>
        {wholeIn > 0 && (
          <Product name="ballWhole" x={BX + WHOLE_DX + (1 - wholeIn) * -260} y={BY + WHOLE_DY} scale={BS} opacity={wholeIn}
            shadow="0 50px 60px rgba(40,25,10,0.45)" blur={(1 - wholeIn) * 8} />
        )}
        <Product name="ballCut" x={BX} y={BY} scale={BS} shadow="0 50px 70px rgba(40,25,10,0.5)" />
        {marker(tW, tC, mwx, mwy)}
        {marker(tC, tA, mcx, mcy)}
        {marker(tA, tWrap, max_, may)}
      </div>
      <CoconutFlakes count={wholeIn > 0 ? 40 : 18} seed="s3" speed={0.4} sizeMul={1.3} opacity={0.35 + 0.6 * wholeIn} swirl={wholeIn > 0 ? 0.25 : 0} />
      {/* soft lower band so gold type reads cleanly */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1300, height: 620, background: 'linear-gradient(180deg, rgba(20,12,6,0) 0%, rgba(20,12,6,0.55) 45%, rgba(20,12,6,0.75) 100%)' }} />
      {label(['قرمشةٌ', 'مميّزة'], tW, tC - 0.25)}
      {label(['كريمةٌ', 'ناعمة'], tC, tA - 0.25)}
      {label(['مذاقٌ', 'غنيٌّ', 'باللوز'], tA, tWrap - 0.3)}
      <ArabicTitle words={['تغلّفها', 'الشوكولاتة', 'البيضاء', 'ورقائق', 'جوز', 'الهند']}
        times={[6, 7, 8, 9, 10, 11].map((i) => wordAt(2, i) - s0)} font={MESSIRI} size={66} y={1430} maxWidth={860} lineHeight={1.45} out={dur - 0.2} />
      <Finish dark vignette={0.4} grainSeed={3} />
    </AbsoluteFill>
  );
};
