import React from 'react';
import { Debug, emoji } from '../scenes/interfaces';
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
            id={showHomeList ? 'home-debug' : 'option-debug'}
            className={
              typeof value === 'boolean'
                ? value
                  ? 'option-debug-true'
                  : 'option-debug-false'
                : 'option-debug-true'
            }
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
                  [key]: (value + 1) % (getMaxFromKey(key) + 1),
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
            <div className={'option-debug-text'}>
              {replaceUnderscoreWithSpace(
                (typeof value === 'boolean'
                  ? value
                    ? showHomeList
                      ? ''
                      : emoji.greenCheck
                    : showHomeList
                    ? ''
                    : emoji.redX
                  : value) +
                  '_' +
                  key
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default DebugOptions;
