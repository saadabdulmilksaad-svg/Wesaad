import React from 'react';

/** Soft volumetric light beam (screen-blended). */
export const LightBeam: React.FC<{ x: number; y: number; angle: number; width: number; length?: number; opacity: number; color?: string }> = ({ x, y, angle, width, length = 2800, opacity, color = '255,214,150' }) => (
  <div style={{
    position: 'absolute', left: x - width / 2, top: y - length / 2, width, height: length,
    transform: `rotate(${angle}deg)`, transformOrigin: '50% 50%', mixBlendMode: 'screen', opacity,
    background: `linear-gradient(90deg, rgba(${color},0) 0%, rgba(${color},0.22) 30%, rgba(${color},0.5) 50%, rgba(${color},0.22) 70%, rgba(${color},0) 100%)`,
    filter: 'blur(28px)',
    WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, #000 30%, #000 60%, rgba(0,0,0,0) 100%)',
  }} />
);

export const Glow: React.FC<{ x: number; y: number; r: number; color: string; opacity?: number; blend?: React.CSSProperties['mixBlendMode'] }> = ({ x, y, r, color, opacity = 1, blend = 'normal' }) => (
  <div style={{
    position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: '50%',
    background: `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 70%)`, opacity, mixBlendMode: blend,
  }} />
);

/** Film grain + vignette overlay to glue the composite together. */
export const Finish: React.FC<{ vignette?: number; grainSeed?: number; dark?: boolean }> = ({ vignette = 0.35, grainSeed = 0, dark = false }) => (
  <>
    <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 75% 60% at 50% 46%, rgba(0,0,0,0) 55%, rgba(${dark ? '0,0,0' : '60,40,15'},${vignette}) 100%)`, pointerEvents: 'none' }} />
    <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: 0.07, mixBlendMode: 'overlay', pointerEvents: 'none' }}>
      <filter id={`grain${grainSeed}`}><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={grainSeed} stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
      <rect width="100%" height="100%" filter={`url(#grain${grainSeed})`} />
    </svg>
  </>
);
