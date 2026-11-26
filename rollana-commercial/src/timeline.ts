import tl from '../timeline.json';
import vo from '../assets/audio/vo_timings.json';

export const FPS = tl.fps;
export const DURATION = tl.duration;
export const TOTAL_FRAMES = Math.round(tl.duration * tl.fps);
export const SCENES = tl.scenes as Record<'hook' | 'journey' | 'secret' | 'reveal' | 'hero', [number, number]>;
export const VO_START = tl.vo_start;
/** absolute time (s) at which word `w` of voice-over line `line` starts */
export const wordAt = (line: number, w: number) => VO_START[line] + vo[line].words[w].t;
export const lineEnd = (line: number) => {
  const ws = vo[line].words;
  return VO_START[line] + ws[ws.length - 1].t + ws[ws.length - 1].d;
};
/** pre-roll / post-roll used for overlapping transitions (seconds) */
export const PRE = 0.5;
export const POST = 0.5;
