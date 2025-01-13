// InputTypeBlock.tsx

import React from 'react';
import {
  CharacterId,
  Debug,
  InputType,
  SmashConfig,
  emoji,
  textForEachCharacter,
} from '../scenes/types';

const textForEachType = {
  0: 'Click to Turn On a Player',
  1: 'A Player with a Gamepad (Controller)',
  // 2: 'A Player with a Keyboard',
  3: 'A Normal "Scripted" Bot',
  4: 'A Neural Network Trainined to Play the Game',
  5: 'A Bot that is subject to Darwinian Evolution',
};

interface InputTypeBlockProps {
  input: InputType;
  pIndex: number;
  p: { characterId: CharacterId; input: number | null };
  debugState: Debug;
  getNumActiveBeforeMe: (index: number) => number;
  smashConfigOptions: { name: string; scale: number; nameShort: string }[];
  onClickRotateSelection: (playerIndex: number) => void;
  onClickOscura: (playerIndex: number) => void;
  soundManager: any;
  inputArray: InputType[];
  getNumKeyboards: () => number;
  getDoesKeyboardExistLower: (myI: number) => boolean;
  getNumGamepads: () => number;
  getNumControllersExistLower: (myI: number) => number;
}

function InputTypeBlock({
  input,
  pIndex,
  p,
  debugState,
  getNumActiveBeforeMe,
  smashConfigOptions,
  onClickRotateSelection,
  onClickOscura,
  soundManager,
  inputArray,
  getNumKeyboards,
  getDoesKeyboardExistLower,
  getNumGamepads,
  getNumControllersExistLower,
}: InputTypeBlockProps) {
  return (
    <>
      {/* Player Char */}
      {input === 0 && (
        <div
          className="player-char"
          onMouseEnter={() => {
            soundManager.blipSoundSoft();
          }}
          onClick={() => {
            onClickOscura(pIndex);
          }}
        >
          <div className="startImageWrapper">
            <p className="player-char-image-name"></p>
          </div>
        </div>
      )}

      {input !== 0 && (
        <div
          data-tooltip-content={textForEachCharacter[p.characterId]}
          className="player-char"
          onMouseEnter={() => {
            soundManager.blipSoundSoft();
          }}
          onClick={() => {
            onClickRotateSelection(pIndex);
          }}
        >
          <div className="startImageWrapper">
            {!debugState.Chars_Colored && (
              <div
                className={
                  'id-circle ' +
                  debugState.idColors?.[getNumActiveBeforeMe(pIndex)]
                }
              />
            )}

            <img
              id={(() => {
                if (debugState.Chars_Colored) {
                  switch (pIndex) {
                    case 0:
                      return 'fill-index-0';
                    case 1:
                      return 'fill-index-1';
                    case 2:
                      return 'fill-index-2';
                    case 3:
                      return 'fill-index-3';
                    default:
                      throw new Error('pIndex not found');
                  }
                } else {
                  return '';
                }
              })()}
              className={'startImage' + (pIndex > 1 ? 'Inverse' : 'Normal')}
              src={
                'images/character_' + p.characterId.toString() + '_cropped.png'
              }
              width={
                (55 * smashConfigOptions[p.characterId].scale).toString() + '%'
              }
              alt="char"
            />

            <p className="player-char-image-name">
              {smashConfigOptions[p.characterId].name}
            </p>
          </div>
        </div>
      )}

      {/* Input Status */}
      {input === 0 && (
        <div
          data-tooltip-content={textForEachType[input]}
          className="b-oscuro b-dark"
          onMouseEnter={() => {
            soundManager.blipSoundSoft();
          }}
          onClick={() => {
            onClickOscura(pIndex);
          }}
        >
          <span>Off</span>
        </div>
      )}

      {input === 1 && (
        <div
          data-tooltip-content={textForEachType[input]}
          className={
            'b-oscuro b-dark' +
            (() => {
              switch (getNumActiveBeforeMe(pIndex)) {
                case 0:
                  return ' b-dark-red';
                case 1:
                  return ' b-dark-blue';
                case 2:
                  return ' b-dark-yellow';
                case 3:
                  return ' b-dark-green';
                default:
                  return '';
              }
            })()
          }
          onMouseEnter={() => {
            soundManager.blipSoundSoft();
          }}
          onClick={() => {
            onClickOscura(pIndex);
          }}
        >
          <span>GAMEPAD</span>
          {getNumGamepads() > 1 && (
            <span id="input-sub">
              {getNumControllersExistLower(pIndex) + 1}
            </span>
          )}
          {pIndex < 2 && (
            <div className="button-input-emoji">{emoji.gamepad}</div>
          )}
          {!(pIndex < 2) && (
            <div className="button-input-emoji">{emoji.gamepad}</div>
          )}
        </div>
      )}

      {input === 2 && (
        <div
          data-tooltip-content={(() => {
            const isARROWS: boolean = getDoesKeyboardExistLower(pIndex);

            if (isARROWS) {
              return 'Refer to "Buttons" above';
            } else {
              return 'Refer to "Buttons" above';
            }
          })()}
          className={
            'b-oscuro b-dark' +
            (() => {
              switch (getNumActiveBeforeMe(pIndex)) {
                case 0:
                  return ' b-dark-red';
                case 1:
                  return ' b-dark-blue';
                case 2:
                  return ' b-dark-yellow';
                case 3:
                  return ' b-dark-green';
                default:
                  return '';
              }
            })()
          }
          onMouseEnter={() => {
            soundManager.blipSoundSoft();
          }}
          onClick={() => {
            onClickOscura(pIndex);
          }}
        >
          <span>KEYBOARD</span>
          {getNumKeyboards() > 1 && getDoesKeyboardExistLower(pIndex) && (
            <span id="input-sub">Arrows</span>
          )}
          {getNumKeyboards() > 1 && !getDoesKeyboardExistLower(pIndex) && (
            <span id="input-sub">WASD</span>
          )}
          {pIndex < 2 && (
            <div className="button-input-emoji">{emoji.keyboardWhite}</div>
          )}
          {!(pIndex < 2) && (
            <div className="button-input-emoji">{emoji.keyboardWhite}</div>
          )}
        </div>
      )}

      {input === 3 && (
        <div
          data-tooltip-content={textForEachType[input]}
          className={
            'b-oscuro b-dark' +
            (() => {
              switch (getNumActiveBeforeMe(pIndex)) {
                case 0:
                  return ' b-dark-red';
                case 1:
                  return ' b-dark-blue';
                case 2:
                  return ' b-dark-yellow';
                case 3:
                  return ' b-dark-green';
                default:
                  return '';
              }
            })()
          }
          onMouseEnter={() => {
            soundManager.blipSoundSoft();
          }}
          onClick={() => {
            onClickOscura(pIndex);
          }}
        >
          <span>BOT</span>
          <span id="input-sub">ROBOT</span>
          <div className="button-input-emoji">{emoji.bot}</div>
        </div>
      )}

      {input === 4 && (
        <div
          data-tooltip-content={textForEachType[input]}
          className={
            'b-oscuro b-dark' +
            (() => {
              switch (getNumActiveBeforeMe(pIndex)) {
                case 0:
                  return ' b-dark-red';
                case 1:
                  return ' b-dark-blue';
                case 2:
                  return ' b-dark-yellow';
                case 3:
                  return ' b-dark-green';
                default:
                  return '';
              }
            })()
          }
          onMouseEnter={() => {
            soundManager.blipSoundSoft();
          }}
          onClick={() => {
            onClickOscura(pIndex);
          }}
        >
          <span>BOT</span>
          <span id="input-sub">NEURAL NETWORK</span>
          <div className="button-input-emoji">{emoji.brain}</div>
        </div>
      )}

      {input === 5 && (
        <div
          data-tooltip-content={textForEachType[input]}
          className={
            'b-oscuro b-dark' +
            (() => {
              switch (getNumActiveBeforeMe(pIndex)) {
                case 0:
                  return ' b-dark-red';
                case 1:
                  return ' b-dark-blue';
                case 2:
                  return ' b-dark-yellow';
                case 3:
                  return ' b-dark-green';
                default:
                  return '';
              }
            })()
          }
          onMouseEnter={() => {
            soundManager.blipSoundSoft();
          }}
          onClick={() => {
            onClickOscura(pIndex);
          }}
        >
          <span>BOT</span>
          <span id="input-sub">EVOLVING NN</span>
          <div className="button-input-emoji">{emoji.dna}</div>
        </div>
      )}
    </>
  );
}

export default InputTypeBlock;
