import React from 'react';
import { Composition } from 'remotion';
import { Commercial } from './Commercial';
import { FPS, TOTAL_FRAMES } from './timeline';

export const Root: React.FC = () => (
  <>
    <Composition id="RollanaCommercial" component={Commercial} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} defaultProps={{ withAudio: true }} />
  </>
);
