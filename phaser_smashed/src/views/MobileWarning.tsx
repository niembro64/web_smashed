// MobileWarning.tsx

import React from 'react';

interface MobileWarningProps {
  isMobile: boolean;
  allowMobile: boolean;
}

function MobileWarning({ isMobile, allowMobile }: MobileWarningProps) {
  if (allowMobile || !isMobile) {
    return null;
  }
  return (
    <div className="mobile-warning">
      <img src="images/smashed_x10_gif.gif" alt="Smashed Title Gif" />
      <span>Smashed Bros</span>
      <span>is best played on a </span>
      <span>desktop or laptop.</span>
    </div>
  );
}

export default MobileWarning;
