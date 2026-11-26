import React from 'react';
import { Img, staticFile } from 'remotion';

/**
 * Original product pixels only. Transforms used: translate / uniform scale /
 * rotate. No colour filters are ever applied to the product itself; shadows,
 * light sweeps and reflections are separate layers around it.
 */
export const PRODUCTS = {
  wrapper: { src: 'products/wrapper.png', w: 1524, h: 461 },
  ballWhole: { src: 'products/ball-whole.png', w: 944, h: 1012 },
  ballCut: { src: 'products/ball-cut.png', w: 1100, h: 1092 },
};
export type ProductKey = keyof typeof PRODUCTS;

export const Product: React.FC<{
  name: ProductKey; x: number; y: number; scale: number; rotate?: number; opacity?: number;
  shadow?: string; sweep?: number; sweepOpacity?: number; reflection?: number; blur?: number; style?: React.CSSProperties;
  /** key-light falloff (0..1): a shadow layer from the scene light, masked to the product */
  shade?: number;
}> = ({ name, x, y, scale, rotate = 0, opacity = 1, shadow, sweep, sweepOpacity = 0.35, reflection = 0, blur = 0, style, shade = 0 }) => {
  const p = PRODUCTS[name];
  const w = p.w * scale, h = p.h * scale;
  const src = staticFile(p.src);
  return (
    <div style={{ position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `rotate(${rotate}deg)`, opacity, ...style }}>
      <Img src={src} style={{ width: w, height: h, display: 'block', filter: [shadow ? `drop-shadow(${shadow})` : '', blur ? `blur(${blur}px)` : ''].join(' ') || undefined }} />
      {shade > 0 && (
        <div style={{
          position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity: shade, filter: blur ? `blur(${blur}px)` : undefined,
          WebkitMaskImage: `url(${src})`, WebkitMaskSize: '100% 100%',
          background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0) 35%, rgba(70,50,30,0.55) 80%, rgba(30,20,12,0.85) 100%)',
        }} />
      )}
      {sweep !== undefined && (
        <div style={{
          position: 'absolute', inset: 0, mixBlendMode: 'soft-light', opacity: sweepOpacity,
          WebkitMaskImage: `url(${src})`, WebkitMaskSize: '100% 100%',
          background: `linear-gradient(105deg, rgba(255,255,255,0) ${sweep * 100 - 18}%, rgba(255,255,255,1) ${sweep * 100}%, rgba(255,255,255,0) ${sweep * 100 + 18}%)`,
        }} />
      )}
      {reflection > 0 && (
        <Img src={src} style={{
          position: 'absolute', left: 0, top: h * 0.96, width: w, height: h, transform: 'scaleY(-1)', opacity: reflection,
          WebkitMaskImage: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 45%)', filter: 'blur(2px)',
        }} />
      )}
    </div>
  );
};

/** Almond lifted from the original cross-section photo, used as a floating ingredient. */
export const Almond: React.FC<{ x: number; y: number; size: number; rotate: number; blur?: number; opacity?: number; shadow?: boolean }> = ({ x, y, size, rotate, blur = 0, opacity = 1, shadow = true }) => (
  <Img src={staticFile('ingredients/almond.png')} style={{
    position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, opacity,
    transform: `rotate(${rotate}deg)`,
    filter: `${shadow ? 'drop-shadow(0 18px 18px rgba(80,50,20,0.28)) ' : ''}${blur ? `blur(${blur}px)` : ''}`,
  }} />
);

export const ContactShadow: React.FC<{ x: number; y: number; w: number; opacity?: number }> = ({ x, y, w, opacity = 0.45 }) => (
  <div style={{ position: 'absolute', left: x - w / 2, top: y - w * 0.09, width: w, height: w * 0.18, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(60,40,20,0.75) 0%, rgba(60,40,20,0) 70%)', opacity, filter: 'blur(6px)' }} />
);
