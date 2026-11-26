import { Easing, interpolate } from 'remotion';

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeIn = Easing.bezier(0.5, 0, 0.75, 0);
export const silky = Easing.bezier(0.33, 0, 0.15, 1);

/** clamped interpolate on seconds */
export const tw = (t: number, [a, b]: [number, number], [from, to]: [number, number], ease = easeInOut) =>
  interpolate(t, [a, b], [from, to], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease });

/** chain of keyframes: [[time,value],...] with easing between */
export const keys = (t: number, k: [number, number][], ease = easeInOut) => {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 0; i < k.length - 1; i++) {
    if (t <= k[i + 1][0]) return tw(t, [k[i][0], k[i + 1][0]], [k[i][1], k[i + 1][1]], ease);
  }
  return k[k.length - 1][1];
};

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
