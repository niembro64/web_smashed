// InputTypeBlock.tsx

import {
  CharacterId,
  Debug,
  InputType,
  emoji,
  textForEachCharacter,
} from '../scenes/types';

const textForEachType = {
  // 0: 'Click to Turn On a Player',
  0: '',
  1: 'PLAYER ON USB CONTROLLER',
  // 2: 'A Player with a Keyboard',
  3: 'SCRIPTED BOT',
  4: 'NEURAL NETWORK BOT',
  5: 'BOT SUBJECT TO DARWINIAN EVOLUTION',
};

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
          data-tooltip-content={textForEachCharacter[p.characterId]}
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
                'images/character_' + p.characterId.toString() + '_cropped.png'
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

      {openEye && input === 1 && (
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
              return 'PLAYER ON KEYBOARD ARROWS - REFER TO CONTROLS';
            } else {
              return 'PLAYER ON KEYBOARD WASD - REFER TO CONTROLS';
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

      {openEye && input === 4 && (
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
          <span id="input-sub">AI</span>
          <div className="button-input-emoji">{emoji.brain}</div>
        </div>
      )}

      {openEye && input === 5 && (
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
          <span id="input-sub">DARWIN</span>
          <div className="button-input-emoji">{emoji.dna}</div>
        </div>
      )}
    </>
  );
}

export default InputTypeBlock;
