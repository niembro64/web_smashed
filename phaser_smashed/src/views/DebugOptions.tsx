import React from 'react';
import { Debug, emoji } from '../scenes/types';
import { SoundManagerType } from './SoundManager';
import { replaceUnderscoreWithSpace } from './reactHelpers';
import { debugHide } from '../debugHide';

interface DebugOptionsProps {
  soundManager: SoundManagerType;
  debugState: Debug;
  setDebugState: React.Dispatch<React.SetStateAction<Debug>>;
  showHomeList: boolean;
  getMaxFromKey: (key: string) => number;
  mainOptionsDebugShowState: Debug;
  setMainOptionsDebugShowState: React.Dispatch<React.SetStateAction<Debug>>;
}

const DebugOptions: React.FC<DebugOptionsProps> = ({
  soundManager,
  debugState,
  setDebugState,
  getMaxFromKey,
  showHomeList,
  mainOptionsDebugShowState,
  setMainOptionsDebugShowState,
}) => {
  return (
    <>
      {Object.entries(debugState).map(([key, value], index) => {
        if (debugHide[key]) {
          return null;
        }

        const putKeyOnHome: boolean = !!mainOptionsDebugShowState[key];

        if (
          (showHomeList && !putKeyOnHome) ||
          (!showHomeList && putKeyOnHome)
        ) {
          return null;
        }

        let textToShow: string = 'XXX';

        switch (key) {
          case 'Minutes':
            if (debugState.Dur_Seconds) {
              textToShow = value + ' Seconds';
            } else {
              textToShow = value + ' Minutes';
            }
            break;
          default:
            textToShow = replaceUnderscoreWithSpace(
              (typeof value === 'boolean'
                ? value
                  ? emoji.greenCheck
                  : emoji.redX
                : value) +
                '_' +
                key
            );
            break;
        }

        return (
          <div
            className={`
              ${
                typeof value === 'boolean'
                  ? value
                    ? 'option-debug-true'
                    : 'option-debug-false'
                  : 'option-debug-true'
              }

              ${showHomeList ? 'w-full' : 'w-[49%]'} 
              cursor-pointer h-20 bg-sky-950 hover:bg-sky-800 active:bg-sky-500 rounded-3xl m-1 flex items-center justify-start pl-[2vw] text-[1.5vw] uppercase
              `}
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

              switch (key) {
                case 'Mode_Infinity':
                  setMainOptionsDebugShowState((x: Debug) => {
                    const newMainOpotionsDebugShow: Debug = {
                      ...x,
                    };
                    if (debugState.Mode_Infinity) {
                      newMainOpotionsDebugShow.Minutes = 1;
                      newMainOpotionsDebugShow.Shots = 0;
                    } else {
                      newMainOpotionsDebugShow.Minutes = 0;
                      newMainOpotionsDebugShow.Shots = 1;
                    }

                    return newMainOpotionsDebugShow;
                  });
                  break;
              }
            }}
          >
            <div className={'option-debug-text'}>{textToShow}</div>
          </div>
        );
      })}
    </>
  );
};

export default DebugOptions;
