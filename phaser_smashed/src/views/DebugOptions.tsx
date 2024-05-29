import React from 'react';
import { Debug } from '../scenes/interfaces';
import { SoundManagerType } from './SoundManager';
import { replaceUnderscoreWithSpace } from './reactHelpers';

interface DebugOptionsProps {
  soundManager: SoundManagerType;
  debugState: Debug;
  mainOptionsDebugShowState: Debug;
  setDebugState: React.Dispatch<React.SetStateAction<Debug>>;
  showHomeList: boolean;
  getMaxFromKey: (key: string) => number;
}

const DebugOptions: React.FC<DebugOptionsProps> = ({
  soundManager,
  debugState,
  mainOptionsDebugShowState,
  setDebugState,
  getMaxFromKey,
  showHomeList,
}) => {
  return (
    <>
      {Object.entries(debugState).map(([key, value], index) => {
        const putKeyOnHome: boolean = !!mainOptionsDebugShowState[key];

        if (
          (showHomeList && !putKeyOnHome) ||
          (!showHomeList && putKeyOnHome)
        ) {
          return null;
        }

        return (
          <div
            id="option-debug"
            key={index}
            onMouseEnter={() => {
              soundManager.blipSoundSoft();
            }}
            onClick={(e) => {
              soundManager.blipBeedeeSound();
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
            {typeof value !== 'boolean' && (
              <div className="debug-value">
                <p>{value}</p>
              </div>
            )}
            <p
              className={'debug-key'}
              id={
                typeof value === 'boolean'
                  ? value
                    ? 'option-start-true'
                    : 'option-start-false'
                  : ''
              }
            >
              {replaceUnderscoreWithSpace(key)}
            </p>
          </div>
        );
      })}
    </>
  );
};

export default DebugOptions;
