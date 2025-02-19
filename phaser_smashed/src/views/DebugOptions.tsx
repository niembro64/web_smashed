import React from 'react';
import { Debug, emoji } from '../scenes/types';
import { SoundManagerType } from './SoundManager';
import { replaceUnderscoreWithSpace } from './reactHelpers';
import { debugHide } from '../debugHide';
import ReactGA from 'react-ga4';

interface DebugOptionsProps {
  soundManager: SoundManagerType;
  debugState: Debug;
  setDebugState: React.Dispatch<React.SetStateAction<Debug>>;
  useHomeList: boolean;
  getMaxFromKey: (key: string) => number;
  mainOptionsDebugShowState: Debug;
  setMainOptionsDebugShowState: React.Dispatch<React.SetStateAction<Debug>>;
}

const DebugOptions: React.FC<DebugOptionsProps> = ({
  soundManager,
  debugState,
  setDebugState,
  getMaxFromKey,
  useHomeList,
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

        if ((useHomeList && !putKeyOnHome) || (!useHomeList && putKeyOnHome)) {
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
                  ? emoji.blank
                  : emoji.blank
                : value) +
                '_' +
                key
            );
            break;
        }

        return (
          <div
            // data-tooltip-content={'asdf'}
            id={useHomeList ? 'home-debug' : 'option-debug'}
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
              ReactGA.event({
                action: 'debug_option_click',
                category: 'Debug',
                label: key,
              });

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
            {textToShow}
          </div>
        );
      })}
    </>
  );
};

export default DebugOptions;
