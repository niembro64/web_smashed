import React from 'react';
import { InputType, emoji } from '../scenes/interfaces';
import s, { SoundManagerType } from './soundManager';

interface InputGroupProps {
  setInputArrayEffect: (inputArray: InputType[]) => void;
  soundManager: SoundManagerType;
}

export const InputGroup: React.FC<InputGroupProps> = ({
  setInputArrayEffect,
  soundManager,
}) => {
  const inputConfigurations = [
    { config: [2, 2, 0, 0], emojis: emoji.keyboardWhite + emoji.keyboardWhite },
    { config: [2, 3, 0, 0], emojis: emoji.keyboardWhite + emoji.bot },
    { config: [2, 4, 0, 0], emojis: emoji.keyboardWhite + emoji.brain },
    { config: [1, 1, 0, 0], emojis: emoji.gamepad + emoji.gamepad },
    {
      config: [2, 2, 3, 4],
      emojis: emoji.keyboardWhite + emoji.keyboardWhite,
      extraEmojis: emoji.bot + emoji.brain,
    },
    {
      config: [1, 1, 3, 4],
      emojis: emoji.gamepad + emoji.gamepad,
      extraEmojis: emoji.bot + emoji.brain,
    },
    {
      config: [1, 1, 1, 1],
      emojis: emoji.gamepad + emoji.gamepad,
      extraEmojis: emoji.gamepad + emoji.gamepad,
    },
    {
      config: [3, 3, 3, 3],
      emojis: emoji.bot + emoji.bot,
      extraEmojis: emoji.bot + emoji.bot,
    },
    {
      config: [4, 4, 4, 4],
      emojis: emoji.brain + emoji.brain,
      extraEmojis: emoji.brain + emoji.brain,
    },
    {
      config: [3, 3, 4, 4],
      emojis: emoji.bot + emoji.brain,
      extraEmojis: emoji.bot + emoji.brain,
    },
  ];

  return (
    <div className="input-group">
      {inputConfigurations.map((inputConfig, index) => (
        <div
          key={index}
          className="b-all-bots"
          onMouseEnter={() => {
            soundManager.blipSoundSoft();
          }}
          onClick={() => setInputArrayEffect(inputConfig.config as InputType[])}
        >
          <span className={'vs-span'}>{inputConfig.emojis}</span>
          {inputConfig.extraEmojis && (
            <span className={'vs-span'}>{inputConfig.extraEmojis}</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default InputGroup;
