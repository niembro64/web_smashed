import React from 'react';
import { InputType, emoji, toolTipStyle, tooltipDelay } from '../scenes/types';
import { SoundManagerType } from './SoundManager';
import { Tooltip } from 'react-tooltip';

export type InputConfiguration = {
  tooltipText: string;
  config: InputType[];
};

interface InputGroupProps {
  setInputArrayEffect: (inputArray: InputType[]) => void;
  soundManager: SoundManagerType;
}

export const MapEmojiToInputType = (inputType: InputType): string | null => {
  switch (inputType) {
    case 0:
      return null;
    case 1:
      return emoji.gamepad;
    case 2:
      return emoji.keyboardWhite;
    case 3:
      return emoji.bot;
    case 4:
      return emoji.brain;
    case 5:
      return emoji.dna;
    default:
      throw new Error('Invalid input type: ' + inputType);
  }
};

const getContainerClasses = (itemCount: number) => {
  switch (itemCount) {
    case 4:
      // 2x2 grid, items centered
      return 'grid grid-cols-2 gap-2 place-items-center';
    case 2:
      // 2 items side-by-side, centered horizontally
      // If you want them spaced fully apart, use justify-between instead of justify-center
      return 'flex flex-row items-center justify-between';
    case 1:
      // Single item centered
      return 'flex items-center justify-center';
    default:
      // Fallback or handle 3 items, etc.
      return 'flex items-center justify-center';
  }
};

export const InputGroup: React.FC<InputGroupProps> = ({
  setInputArrayEffect,
  soundManager,
}) => {
  const inputConfigurations: InputConfiguration[] = [
    {
      tooltipText: 'Two Players on the same Keyboard, WASD vs ARROWS',
      config: [2, 2, 0, 0],
    },
    {
      tooltipText: 'Four Players with Gamepads',
      config: [1, 1, 1, 1],
    },
    {
      tooltipText: 'Four Bots',
      config: [3, 3, 3, 3],
    },
    {
      tooltipText: 'Four AI Bots',
      config: [4, 4, 4, 4],
    },
    {
      tooltipText: 'Four Evolving AI Bots',
      config: [5, 5, 5, 5],
    },
  ];

  return (
    <div className="h-[150px] bg-stone-900 flex flex-row items-center justify-center rounded-3xl p-3">
      <div className="h-full mx-4 flex flex-col items-center justify-evenly">
        <p className="text-4xl">INPUT</p>
        <p className="text-4xl">PRESETS</p>
      </div>
      {inputConfigurations.map((inputConfig, index) => {
        // How many actual items (non-zero) do we have?
        const itemCount = inputConfig.config.filter((t) => t !== 0).length;
        const layoutClasses = getContainerClasses(itemCount);

        const isFirst: boolean = index === 0;
        const isLast: boolean = index === inputConfigurations.length - 1;

        return (
          <div
            key={index}
            data-tooltip-content={inputConfig.tooltipText}
            // Combine your base styles with the layout classes
            className={`input-preset h-full w-[130px] bg-black cursor-pointer px-3 pb-3 pt-1 hover:bg-sky-800 active:bg-sky-500 ${layoutClasses} ${
              isFirst ? 'rounded-l-xl' : ''
            } ${isLast ? 'rounded-r-xl' : ''}`}
            onMouseEnter={() => {
              soundManager.blipSoundSoft();
            }}
            onClick={() =>
              setInputArrayEffect(inputConfig.config as InputType[])
            }
          >
            {inputConfig.config.map((inputType, i) =>
              inputType === 0 ? null : (
                <span key={i} className="text-4xl m-1">
                  {MapEmojiToInputType(inputType)}
                </span>
              )
            )}
          </div>
        );
      })}
    </div>
  );
};

export default InputGroup;
