// StartScreen.tsx

import React from 'react';
import InputTypeBlock from '../components/InputTypeBlock';
import CornerPieces from '../components/CornerPieces';
import {
  SmashConfig,
  Debug,
  InputType,
  PlayerConfigSmall,
  WebState,
  emoji,
} from '../scenes/types';
import { SoundManagerType } from './SoundManager';
import DebugOptions from './DebugOptions';
import InputPresets from './InputPresets';
import {
  idColors,
  mobileMayNotWorkText,
  smashConfigOptions,
} from './reactHelpers';
import { isMobile } from './Main';
import { useTopLevelStore } from '../stores/TopLevelStore';

interface StartScreenProps {
  openEye: boolean;
  // setOpenEye: React.Dispatch<React.SetStateAction<boolean>>;
  onClickEye: () => void;
  setWebStateCurr: (webState: WebState) => void;
  webStateCurr: WebState;
  debugState: Debug;
  smashConfig: SmashConfig;
  inputArray: InputType[];
  setDebugState: React.Dispatch<React.SetStateAction<Debug>>;
  setMainOptionsDebugShowState: React.Dispatch<React.SetStateAction<Debug>>;
  mainOptionsDebugShowState: Debug;
  soundManager: SoundManagerType;
  getMaxFromKey: (key: string) => number;
  onClickStartStartButton: () => void;
  setInputArrayEffect: (newInputArray: InputType[]) => void;
  randomizeCharacters: () => void;
  onClickRotateSelection: (playerIndex: number) => void;
  onClickOscura: (index: number) => void;
  getNumPlayersBeforeMe: (index: number) => number;
  getNumActiveBeforeMe: (index: number) => number;
  getNumPlayers: () => number;
  getNumKeyboards: () => number;
  getDoesKeyboardExistLower: (myI: number) => boolean;
  getNumGamepads: () => number;
}

function StartScreen({
  openEye,
  // setOpenEye,
  onClickEye,
  setWebStateCurr,
  webStateCurr,
  debugState,
  smashConfig,
  inputArray,
  setDebugState,
  setMainOptionsDebugShowState,
  mainOptionsDebugShowState,
  soundManager,
  getMaxFromKey,
  onClickStartStartButton,
  setInputArrayEffect,
  randomizeCharacters,
  onClickRotateSelection,
  onClickOscura,
  getNumPlayersBeforeMe,
  getNumActiveBeforeMe,
  getNumPlayers,
  getNumKeyboards,
  getDoesKeyboardExistLower,
  getNumGamepads,
}: StartScreenProps) {
  const { tl_width, tl_text_xl } = useTopLevelStore();

  if (webStateCurr !== 'web-state-setup' && webStateCurr !== 'web-state-init') {
    return null;
  }

  return (
    <div className="start-class-div">
      {/* black-hiding-div */}
      {!debugState.Dev_Mode && (
        <div
          className={
            'black-hiding-div' +
            (webStateCurr === 'web-state-init'
              ? ' black-hiding-div-init'
              : ' black-hiding-div-start')
          }
        />
      )}

      {/* Title + CornerPieces */}
      <div className={'start-title-wrapper'}>
        <div
          className={
            'start-title' +
            (webStateCurr === 'web-state-setup'
              ? ' start-title-start'
              : ' start-title-init cursor-pointer')
          }
          onMouseDown={() => {
            setWebStateCurr('web-state-setup');
          }}
        >
          <div className="start-title-div">
            <img
              className="start-title-div-img"
              src="images/smashed_x10_gif.gif"
              alt="Smashed Title Gif"
            />
          </div>
          <h1
            style={{ fontSize: tl_width ? tl_width * 0.05 + 'px' : '1vw' }}
            // style={{ fontSize: '5vw' }}
            className="start-title-h1 pixelated"
            id={webStateCurr === 'web-state-init' ? 'niemo-games' : undefined}
          >
            {webStateCurr === 'web-state-init' ? 'START' : 'SMASHED'}
          </h1>

          {/* corner pieces */}
          <CornerPieces debugState={debugState} webStateCurr={webStateCurr} />
        </div>
      </div>

      {/* Players Setup */}
      <div className="player-choices">
        {openEye ? (
          <div className="player-choices-left">
            <DebugOptions
              useHomeList={true}
              soundManager={soundManager}
              debugState={debugState}
              mainOptionsDebugShowState={mainOptionsDebugShowState}
              setDebugState={setDebugState}
              getMaxFromKey={getMaxFromKey}
              setMainOptionsDebugShowState={setMainOptionsDebugShowState}
            />
          </div>
        ) : (
          <div className="w-[10vw]" />
        )}
        <div className="player-choices-right">
          {smashConfig.players.map((p: PlayerConfigSmall, pIndex: number) => {
            return (
              <div className="player-choice" key={'player-choice' + pIndex}>
                <InputTypeBlock
                  openEye={openEye}
                  getNumPlayers={getNumPlayers}
                  getNumPlayersBeforeMe={getNumPlayersBeforeMe}
                  input={inputArray[pIndex]}
                  pIndex={pIndex}
                  p={p}
                  debugState={{
                    ...debugState,
                    idColors, // preserve usage of idColors
                  }}
                  getNumActiveBeforeMe={getNumActiveBeforeMe}
                  smashConfigOptions={smashConfigOptions}
                  onClickRotateSelection={onClickRotateSelection}
                  onClickOscura={onClickOscura}
                  soundManager={soundManager}
                  inputArray={inputArray}
                  getNumKeyboards={getNumKeyboards}
                  getDoesKeyboardExistLower={getDoesKeyboardExistLower}
                  getNumGamepads={getNumGamepads}
                  getNumControllersExistLower={() => 0 /* stub if needed */}
                />
              </div>
            );
          })}
        </div>

        {!openEye && <div className="w-[10vw]" />}
      </div>

      {/* <div className="bottom-zone"> */}
      <div
        className={`w-[100%] flex-[0.2] flex flex-row items-center p-[1vw] ${
          openEye ? 'justify-between' : 'justify-center'
        }`}
      >
        {openEye && (
          <InputPresets
            soundManager={soundManager}
            setInputArrayEffect={setInputArrayEffect}
          />
        )}
        {openEye && (
          <div
            className="b-all-bots"
            id="dice"
            onMouseEnter={() => {
              soundManager.blipSoundSoft();
            }}
            onClick={async () => {
              for (let i = 0; i < 3; i++) {
                setTimeout(() => {
                  randomizeCharacters();
                }, i * 200 * 0.25);
              }
            }}
            data-tooltip-content="RANDOMIZE CHARACTERS"
          >
            {emoji.dice}
          </div>
        )}
        {!openEye && isMobile && (
          <div
            className="w-[40vw] mr-[1vw] text-gray-500 text-[2vw] flex flex-col items-center justify-center"
            onMouseEnter={() => {
              soundManager.blipSoundSoft();
            }}
          >
            {mobileMayNotWorkText.map((text, i) => (
              <span key={i}>{text}</span>
            ))}
          </div>
        )}

        {!openEye && (
          <div
            style={{ fontSize: tl_text_xl }}
            onMouseEnter={() => {
              if (inputArray.filter((x) => x !== 0).length === 0) {
                return;
              }
              soundManager.blipSoundSoft();
            }}
            className={`w-[22vw]  ${
              inputArray.filter((x) => x !== 0).length === 0
                ? 'b-start-inactive'
                : 'b-start'
            } `}
            onClick={() => {
              onClickEye();
            }}
          >
            <span>{'PLAY'}</span>
          </div>
        )}
        {!openEye && <div className="w-[1vw]" />}

        <div
          style={{ fontSize: tl_text_xl }}
          onMouseEnter={() => {
            if (inputArray.filter((x) => x !== 0).length === 0) {
              return;
            }
            soundManager.blipSoundSoft();
          }}
          className={`w-[22vw] ${
            inputArray.filter((x) => x !== 0).length === 0
              ? 'b-start-inactive'
              : 'b-start'
          }`}
          onClick={() => {
            onClickStartStartButton();
          }}
        >
          <span>{openEye ? 'START' : 'WATCH'}</span>
        </div>
      </div>
    </div>
  );
}

export default StartScreen;
