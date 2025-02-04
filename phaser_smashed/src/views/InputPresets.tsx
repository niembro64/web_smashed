import React from 'react';
import { InputType, emoji, toolTipStyle, tooltipDelay } from '../scenes/types';
import { SoundManagerType } from './SoundManager';
import { Tooltip } from 'react-tooltip';

export type InputConfiguration = {
  tooltipText: string;
  config: InputType[];
  // emojis: string;
  // extraEmojis?: string;
};

interface InputGroupProps {
  setInputArrayEffect: (inputArray: InputType[]) => void;
  soundManager: SoundManagerType;
}

const mapInputTypeToEmoji = (inputType: InputType): string => {
  switch (inputType) {
    case 0:
      return '';
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
      throw new Error('Invalid InputType: ' + inputType);
  }
};

export const InputPresets: React.FC<InputGroupProps> = ({
  setInputArrayEffect,
  soundManager,
}) => {
  const inputConfigurations: InputConfiguration[] = [
    {
      tooltipText: 'Keyboard Player vs Bot',
      config: [2, 3, 0, 0],
    },
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
    <div className="input-group">
      <div className="input-group-header ">
        <span>INPUT</span>
        <span>PRESETS</span>
      </div>
      {inputConfigurations.map((inputConfig, index) => (
        <div
          key={index}
          data-tooltip-content={inputConfig.tooltipText}
          className="b-all-bots flex flex-row"
          onMouseEnter={() => {
            soundManager.blipSoundSoft();
          }}
          onClick={() => setInputArrayEffect(inputConfig.config)}
        >
          {inputConfig.config.map((x) => {
            if (x === 0) {
              return null;
            }

            return (
              <span className={'vs-span'} key={x}>
                {mapInputTypeToEmoji(x)}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default InputPresets;
