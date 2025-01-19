// VideoReplay.tsx

import React, { useRef } from 'react';
import { Debug } from '../scenes/types';

/**
 * Props for the VideoReplay
 */
interface VideoReplayProps {
  isReplayHidden: boolean;
  videoGray: boolean;
  handleTimeUpdate: () => void;
  debugState: Debug;
  videoRef: React.RefObject<HTMLVideoElement>;
}

/**
 * Simple component to show/hide the instant replay video
 */
export default function VideoReplay({
  isReplayHidden,
  videoGray,
  handleTimeUpdate,
  debugState,
  videoRef,
}: VideoReplayProps) {
  // const videoRef = useRef<HTMLVideoElement>(null);

  // Keep the same styling and classes from your original code
  if (isReplayHidden) {
    return null;
  }

  return (
    <div className="video-playback-container">
      <div className="video-playback-super">
        {videoGray && <p className="replay">FAST FORWARD</p>}
        {!videoGray && <p className="replay">INSTANT REPLAY</p>}
        <video
          className={
            videoGray
              ? 'video-playback video-playback-gray'
              : 'video-playback video-playback-normal'
          }
          ref={videoRef}
          onTimeUpdate={() => {
            handleTimeUpdate();
          }}
          onLoadedMetadata={() => {
            handleTimeUpdate();
          }}
        />
      </div>
    </div>
  );
}
