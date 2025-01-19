// KeyboardExplainer.tsx

import React from 'react';
import { ButtonName, Debug } from '../scenes/types';

interface KeyboardExplainerProps {
  debugState: Debug;
  webStateCurr: string;
  numKeyboards: number;
  bothKeysTouched: boolean;
  p1KeysTouched: boolean;
  p2KeysTouched: boolean;
  onClickPlayNavButtons: (buttonName: ButtonName) => void;
}

function KeyboardExplainer({
  debugState,
  webStateCurr,
  numKeyboards,
  bothKeysTouched,
  p1KeysTouched,
  p2KeysTouched,
  onClickPlayNavButtons,
}: KeyboardExplainerProps) {
  /*
   * Keep your original logic for showing the "keyboard-explainer" overlays
   */
  if (
    debugState.Dev_Mode ||
    !debugState.Show_Helper_Keyboard ||
    webStateCurr === 'web-state-setup'
  ) {
    return null;
  }

  if (numKeyboards === 2 && !bothKeysTouched) {
    return (
      <div
        className="keyboard-explainer-double"
        onClick={() => {
          onClickPlayNavButtons('Controls');
        }}
      >
        {!p1KeysTouched && (
          <div className="keyboard-left-checkmark">
            <span>Awaiting</span>
            <div className="small-spinner ss-red"></div>
            <span>WASD</span>
          </div>
        )}
        {!p2KeysTouched && (
          <div className="keyboard-right-checkmark">
            <span>Awaiting</span>
            <div className="small-spinner ss-blue"></div>
            <span>Arrows</span>
          </div>
        )}
      </div>
    );
  }

  if (numKeyboards === 1 && !p1KeysTouched) {
    return (
      <div
        className="keyboard-explainer-single"
        onClick={() => {
          onClickPlayNavButtons('Controls');
        }}
      >
        <div className="keyboard-left-checkmark">
          <span>Awaiting</span>
          <div className="small-spinner ss-red"></div>
          <span>WASD</span>
        </div>
      </div>
    );
  }

  return null;
}

export default KeyboardExplainer;
