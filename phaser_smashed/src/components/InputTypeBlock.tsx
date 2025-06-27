// InputTypeBlock.tsx

import { debugInit } from '../debugInit';
import {
  CharacterId,
  Debug,
  InputType,
  emoji,
  textForEachCharacter,
  textForEachCharacterAlt,
} from '../scenes/types';
import { isMac } from '../stores/TopLevelStore';
import { getTypeDescription } from '../views/reactHelpers';

const textForEachType: string[][] = [
  [],
  isMac
    ? [
        'PLAYER ON USB CONTROLLER',
        'REFER TO CONTROLS TAB',
        "YOU ARE ON MAC OS: IF YOUR CONTROLLER ISN'T WORKING, TRY A DIFFERENT BROWSER OR DIFFERENT OS",
      ]
    : ['PLAYER ON USB CONTROLLER', 'REFER TO CONTROLS TAB'],
  [],
  ['SCRIPTED BOT', 'PRE-PROGRAMMED BOT'],
  [
    'NEURAL NETWORK BOT',
    'MLP FF NN TRAINED ON GOOD EXAMPLE GAMES',
    'INPUT IS WORLD STATE',
  ],
  [
    'EVOLUTION NN BOT',
    'AN INSTANCE OF THE NN BOT THAT EVOLVES',
    'IF THERE ARE MULTIPLE, ONLY THE BEST PERFORMER IS KEPT',
  ],
];

interface InputTypeBlockProps {
  openEye: boolean;
  input: InputType;
  pIndex: number;
  p: { characterId: CharacterId; input: number | null };
  debugState: Debug;
  getNumActiveBeforeMe: (index: number) => number;
  getNumPlayersBeforeMe: (index: number) => number;
  smashConfigOptions: { name: string; scale: number; nameShort: string }[];
  onClickRotateSelection: (playerIndex: number) => void;
  onClickOscura: (playerIndex: number) => void;
  soundManager: any;
  getNumPlayers: () => number;
  inputArray: InputType[];
  getNumKeyboards: () => number;
  getDoesKeyboardExistLower: (myI: number) => boolean;
  getNumGamepads: () => number;
  getNumControllersExistLower: (myI: number) => number;
}

function InputTypeBlock({
  openEye,
  input,
  pIndex,
  p,
  getNumPlayers,
  debugState,
  getNumActiveBeforeMe,
  getNumPlayersBeforeMe,
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
          data-tooltip-content={
            debugInit.Nintendo_Sprites
              ? textForEachCharacter[p.characterId]
              : textForEachCharacterAlt[p.characterId]
          }
          className="player-char uppercase"
          onMouseEnter={() => {
            soundManager.blipSoundSoft();
          }}
          onClick={() => {
            onClickRotateSelection(pIndex);
          }}
        >
          <div className="startImageWrapper">
            {openEye && !debugState.Chars_Colored && (
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
              className={`startImage pixelated ${
                pIndex > 1 ? 'Inverse' : 'Normal'
              } ${openEye ? 'pb-[0.8vw]' : 'pb-[2vw]'}`}
              src={
                'images/' +
                (debugInit.Nintendo_Sprites ? '' : 'alt_') +
                'character_' +
                p.characterId.toString() +
                '_cropped.png'
              }
              width={
                (55 * smashConfigOptions[p.characterId].scale).toString() + '%'
              }
              alt="char"
            />

            {openEye && (
              <p className="player-char-image-name">
                {smashConfigOptions[p.characterId].name}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Input Status */}
      {openEye && input === 0 && (
        <div
          data-tooltip-content={getTypeDescription(textForEachType[input])}
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

      {openEye && input === 1 && (
        <div
          data-tooltip-content={getTypeDescription(textForEachType[input])}
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
          <span>
            PLAYER{' '}
            {getNumPlayers() > 1 ? getNumPlayersBeforeMe(pIndex) + 1 : ''}
          </span>
          {/* {getNumGamepads() > 1 && (
            <span id="input-sub">
              {getNumControllersExistLower(pIndex) + 1}
            </span>
          )} */}

          <span id="input-sub">
            CONTROLLER
            {/* CONTROLLER {getNumControllersExistLower(pIndex) + 1} */}
          </span>
          {pIndex < 2 && (
            <div className="button-input-emoji">{emoji.gamepad}</div>
          )}
          {!(pIndex < 2) && (
            <div className="button-input-emoji">{emoji.gamepad}</div>
          )}
        </div>
      )}

      {openEye && input === 2 && (
        <div
          data-tooltip-content={(() => {
            const isARROWS: boolean = getDoesKeyboardExistLower(pIndex);

            if (isARROWS) {
              return getTypeDescription([
                'PLAYER ON KEYBOARD ARROWS',
                'REFER TO CONTROLS TAB',
              ]);
            } else {
              return getTypeDescription([
                'PLAYER ON KEYBOARD WASD',
                'REFER TO CONTROLS TAB',
              ]);
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
          <span>
            PLAYER{' '}
            {getNumPlayers() > 1 ? getNumPlayersBeforeMe(pIndex) + 1 : ''}
          </span>
          {getNumKeyboards() > 1 && getDoesKeyboardExistLower(pIndex) && (
            <span id="input-sub">ARROW KEYS</span>
          )}
          {getNumKeyboards() > 1 && !getDoesKeyboardExistLower(pIndex) && (
            <span id="input-sub">WASD KEYS</span>
          )}

          {getNumKeyboards() === 1 && <span id="input-sub">KEYBOARD</span>}
          {pIndex < 2 && (
            <div className="button-input-emoji">{emoji.keyboardWhite}</div>
          )}
          {!(pIndex < 2) && (
            <div className="button-input-emoji">{emoji.keyboardWhite}</div>
          )}
        </div>
      )}

      {openEye && input === 3 && (
        <div
          data-tooltip-content={getTypeDescription(textForEachType[input])}
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

      {openEye && input === 4 && (
        <div
          data-tooltip-content={getTypeDescription(textForEachType[input])}
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
          <span id="input-sub">AI</span>
          <div className="button-input-emoji">{emoji.brain}</div>
        </div>
      )}

      {openEye && input === 5 && (
        <div
          data-tooltip-content={getTypeDescription(textForEachType[input])}
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
          <span id="input-sub">DARWIN</span>
          <div className="button-input-emoji">{emoji.dna}</div>
        </div>
      )}
    </>
  );
}

export default InputTypeBlock;
