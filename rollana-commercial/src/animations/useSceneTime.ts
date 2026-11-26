import { useCurrentFrame, useVideoConfig } from 'remotion';

/** Scene-local time in seconds: 0 at the scene's nominal start (negative during pre-roll). */
export const useSceneTime = (pre: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps - pre;
};
