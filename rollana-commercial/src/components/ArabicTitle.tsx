import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { easeOut, tw } from '../animations/ease';
import { GOLD_TEXT } from './theme';

/**
 * Word-by-word Arabic title. Words are animated as whole units so Arabic
 * letter joining is never broken. `times` are seconds (scene-local) at which
 * each word appears — wired to the voice-over word boundaries.
 */
export const ArabicTitle: React.FC<{
  words: string[];
  times: number[];
  font: string;
  size: number;
  y: number;
  out?: number; // scene-local time the title leaves
  gold?: boolean;
  color?: string;
  shadow?: string;
  lineHeight?: number;
  maxWidth?: number;
  sheen?: boolean;
  t0?: number; // offset: scene-local time 0 in seconds
}> = ({ words, times, font, size, y, out = 1e9, gold = true, color = '#3A2A1E', shadow, lineHeight = 1.5, maxWidth = 920, sheen = true, t0 = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps - t0;
  const leave = tw(t, [out, out + 0.45], [0, 1]);
  return (
    <div
      dir="rtl"
      style={{
        position: 'absolute', left: (1080 - maxWidth) / 2, width: maxWidth, top: y,
        display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: size * 0.28,
        fontFamily: font, fontSize: size, lineHeight, textAlign: 'center',
        opacity: 1 - leave, transform: `translateY(${-leave * 24}px)`, filter: leave > 0 ? `blur(${leave * 10}px)` : undefined,
      }}
    >
      {words.map((w, i) => {
        const p = tw(t, [times[i] - 0.05, times[i] + 0.55], [0, 1], easeOut);
        const shine = sheen ? tw(t, [times[i], times[i] + 1.6], [130, -30]) : 50;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block', opacity: p,
              transform: `translateY(${(1 - p) * 34}px) scale(${0.94 + 0.06 * p})`,
              filter: p < 1 ? `blur(${(1 - p) * 12}px)` : undefined,
              ...(gold
                ? { backgroundImage: GOLD_TEXT, backgroundSize: '250% 100%', backgroundPosition: `${shine}% 50%`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }
                : { color }),
              textShadow: undefined,
              paddingBottom: size * 0.12,
            }}
          >
            <span style={{ filter: shadow ? `drop-shadow(${shadow})` : undefined }}>{w}</span>
          </span>
        );
      })}
    </div>
  );
};
