import React from 'react';
import { Debug, emoji } from '../scenes/interfaces';

import { replaceUnderscoreWithSpace } from './helpers/reactHelpers';
import SoundManager, { SoundManagerType } from './SoundManager';

interface PlayOptionsProps {
  soundManager: SoundManagerType;
  debugState: Debug;
  mainOptionsDebugShowState: Debug;
  setDebugState: React.Dispatch<React.SetStateAction<Debug>>;
  getMaxFromKey: (key: string) => number;
  onClickPlayNavBody: () => void;
}

const PlayOptions: React.FC<PlayOptionsProps> = ({
  soundManager,
  debugState,
  mainOptionsDebugShowState,
  setDebugState,
  getMaxFromKey,
  onClickPlayNavBody,
}) => {
  return (
    <div className="over-div">
      <div
        className="popup"
        onClick={() => {
          onClickPlayNavBody();
        }}
      >
        <h1>Debug Options</h1>
        <div id="debug-col">
          {Object.entries(debugState).map(([key, value], index) => {
            if (!!mainOptionsDebugShowState[key]) {
              return null;
            }

            return (
              <div
                id="optionDebug"
                key={index}
                onClick={(e) => {
                  soundManager.blipSound();
                  e.stopPropagation();
                  if (typeof value === 'number') {
                    setDebugState((prevState) => ({
                      ...prevState,
                      [key]: (value + 1) % getMaxFromKey(key),
                    }));
                  }

                  if (typeof value === 'boolean') {
                    setDebugState((prevState) => ({
                      ...prevState,
                      [key]: !value,
                    }));
                  }
                }}
              >
                <div className="debug-value">
                  <p>
                    {typeof value !== 'boolean'
                      ? value
                      : value
                      ? emoji.greenCheck
                      : emoji.redX}
                  </p>
                </div>
                <p className="key">{replaceUnderscoreWithSpace(key)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PlayOptions;
