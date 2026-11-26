import React from 'react';

/** Ivory pedestal with champagne-gold trims. */
export const Podium: React.FC<{ x: number; y: number; w: number; h: number; glow?: number }> = ({ x, y, w, h, glow = 1 }) => {
  const ry = w * 0.16;
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - ry, width: w, height: h + 2 * ry }}>
      {/* body */}
      <div style={{
        position: 'absolute', left: 0, top: ry, width: w, height: h,
        background: 'linear-gradient(90deg, #cdbfa5 0%, #efe7d7 18%, #fbf8f1 42%, #f4eee2 62%, #d9ccb2 88%, #b9a888 100%)',
        borderBottomLeftRadius: `${w / 2}px ${ry}px`, borderBottomRightRadius: `${w / 2}px ${ry}px`,
        boxShadow: '0 60px 90px rgba(70,45,15,0.35)',
      }} />
      {/* gold band */}
      <div style={{ position: 'absolute', left: 0, top: ry + h * 0.14, width: w, height: 10, background: 'linear-gradient(90deg, #8A6A35, #E9D29C 35%, #C5A46D 60%, #7a5c2c)', borderRadius: `${w / 2}px / 6px`, opacity: 0.95 }} />
      {/* top face */}
      <div style={{
        position: 'absolute', left: 0, top: 0, width: w, height: 2 * ry, borderRadius: '50%',
        background: 'radial-gradient(ellipse 70% 70% at 45% 40%, #ffffff 0%, #f8f4ea 45%, #e8dcc4 100%)',
        boxShadow: `inset 0 0 0 5px rgba(197,164,109,0.95), inset 0 0 0 9px rgba(255,246,220,0.9), inset 0 -18px 40px rgba(150,120,70,0.25), 0 0 ${60 * glow}px rgba(243,226,184,${0.5 * glow})`,
      }} />
    </div>
  );
};
