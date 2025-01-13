// CornerPieces.tsx

import React from 'react';

interface CornerPiecesProps {
  debugState: any;
  webStateCurr: string;
}

function CornerPieces({ debugState, webStateCurr }: CornerPiecesProps) {
  if (!debugState.Title_Screws || webStateCurr !== 'web-state-init') {
    return null;
  }

  return (
    <>
      <div className="start-title-corner-piece"></div>
      <div className="start-title-corner-piece"></div>
      <div className="start-title-corner-piece"></div>
      <div className="start-title-corner-piece"></div>
    </>
  );
}

export default CornerPieces;
