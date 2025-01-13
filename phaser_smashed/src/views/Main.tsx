// Main.tsx

/* eslint-disable react-hooks/exhaustive-deps */
import '@fontsource/press-start-2p';
import html2canvas from 'html2canvas';
import moment, { Moment } from 'moment';
import Phaser from 'phaser';
import { useCallback, useEffect, useRef, useState } from 'react';
import '../App.css';
import { debugInit } from '../debugInit';
import {
  nnNumTrainingBarTicks,
  replaceNNExpressWithNNClient,
} from '../scenes/helpers/nn';
import { setGameState } from '../scenes/helpers/state';
import { momentStringToMoment } from '../scenes/helpers/time';
import {
  ButtonName,
  CharacterId,
  Debug,
  GameStateWithTime,
  InputType,
  KeyboardGroup,
  PlayerConfigSmall,
  SmashConfig,
  WebState,
  bar,
  emoji,
  inputTypeNum,
} from '../scenes/types';
import DebugOptions from './DebugOptions';
import InputGroup from './InputPresets';
import { MusicManager, MusicManagerType } from './MusicManager';
import SoundManager, { SoundManagerType } from './SoundManager';
import {
  ClientInformation,
  SessionInfo,
  axiosSaveOne,
  fetchClientData,
  fetchNeuralNetwork,
  getAllGameHistory,
  print,
  sumNumbersIn2DArrayString,
} from './client';
import {
  characterMoves,
  configInit,
  idColors,
  inputArrayInit,
  inputArrayInitDevMode,
  inputArrayReset,
  keyboardGroups,
  p1Keys,
  p2Keys,
  quotes,
  smashConfigInit,
  smashConfigInitDevMode,
  smashConfigInitMax,
  smashConfigOptions,
  workingControllersAmazon,
} from './reactHelpers';
import { debugOnMain } from '../debugOnMain';
import { debugMax } from '../debugMax';
import InputTypeBlock from '../scenes/components/InputTypeBlock';
import CornerPieces from '../scenes/components/CornerPieces';

export const blipDelay = 200;
export const baseGravity = 3000;
export const gravLightMultiplier = 0.5;

function Main() {
  const [connectedGamepads, setConnectedGamepads] = useState<Gamepad[]>([]);
  const [positions, setPositions] = useState<{
    [index: number]: { x: number; y: number };
  }>({});

  const animationRef = useRef<number | null>(null);

  // When a new controller connects
  const onGamepadConnected = useCallback((e: GamepadEvent) => {
    const gp = e.gamepad;
    // Make sure we don't double-add the same gamepad
    setConnectedGamepads((prev) => {
      const alreadyThere = prev.some((g) => g.index === gp.index);
      if (!alreadyThere) return [...prev, gp];
      return prev;
    });
  }, []);

  // When a controller disconnects
  const onGamepadDisconnected = useCallback((e: GamepadEvent) => {
    setConnectedGamepads((prev) =>
      prev.filter((g) => g.index !== e.gamepad.index)
    );
  }, []);

  // Helper for simulating clicks
  const dispatchMouseEvent = useCallback(
    (type: 'mousedown' | 'mouseup', x: number, y: number) => {
      const evt = new MouseEvent(type, {
        clientX: x,
        clientY: y,
        bubbles: true,
        cancelable: true,
        view: window,
      });
      document.dispatchEvent(evt);
    },
    []
  );

  const updateGamepads = useCallback(() => {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];

    // Update all gamepad positions in one go
    setPositions((prevPositions) => {
      const newPositions = { ...prevPositions };

      connectedGamepads.forEach((gp) => {
        if (!gp) return;
        const current = gamepads[gp.index];
        if (!current) return;

        // If we don't have an entry yet, place it at center
        if (!newPositions[gp.index]) {
          newPositions[gp.index] = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
          };
        }

        const pos = newPositions[gp.index];

        // Axes (left stick typically)
        const axisX = current.axes[0] || 0;
        const axisY = current.axes[1] || 0;

        const deadzone = 0.15;
        const speed = 5;

        // Move horizontally
        if (Math.abs(axisX) > deadzone) {
          pos.x += axisX * speed;
        }

        // Move vertically
        if (Math.abs(axisY) > deadzone) {
          pos.y += axisY * speed;
        }

        // D-pad buttons (commonly 12=Up, 13=Down, 14=Left, 15=Right)
        if (current.buttons[12]?.pressed) pos.y -= speed; // Up
        if (current.buttons[13]?.pressed) pos.y += speed; // Down
        if (current.buttons[14]?.pressed) pos.x -= speed; // Left
        if (current.buttons[15]?.pressed) pos.x += speed; // Right

        // Bound to window if desired
        if (pos.x < 0) pos.x = 0;
        if (pos.y < 0) pos.y = 0;
        if (pos.x > window.innerWidth) pos.x = window.innerWidth;
        if (pos.y > window.innerHeight) pos.y = window.innerHeight;

        // A button -> mousedown/mouseup
        // Typically button 0 is “A” on many controllers
        const aButton = current.buttons[0];

        if (aButton) {
          // We need a custom property to track whether we "did" the press
          if (aButton.pressed && !(aButton as any).didPress) {
            (aButton as any).didPress = true;
            dispatchMouseEvent('mousedown', pos.x, pos.y);
          } else if (!aButton.pressed && (aButton as any).didPress) {
            (aButton as any).didPress = false;
            dispatchMouseEvent('mouseup', pos.x, pos.y);
          }
        }

        newPositions[gp.index] = pos;
      });

      return newPositions;
    });

    // Keep polling on every frame
    animationRef.current = requestAnimationFrame(updateGamepads);
  }, [connectedGamepads, dispatchMouseEvent]);

  useEffect(() => {
    window.addEventListener('gamepadconnected', onGamepadConnected);
    window.addEventListener('gamepaddisconnected', onGamepadDisconnected);

    // Start the loop
    animationRef.current = requestAnimationFrame(updateGamepads);

    return () => {
      window.removeEventListener('gamepadconnected', onGamepadConnected);
      window.removeEventListener('gamepaddisconnected', onGamepadDisconnected);

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [onGamepadConnected, onGamepadDisconnected, updateGamepads]);


  /////////////////////////////////////////////
  /////////////////////////////////////////////
  /////////////////////////////////////////////
  /////////////////////////////////////////////
  /////////////////////////////////////////////
  /////////////////////////////////////////////
  /////////////////////////////////////////////
  /////////////////////////////////////////////
  /////////////////////////////////////////////
  /////////////////////////////////////////////
  const myPhaser: React.RefObject<Phaser.Game> = useRef<Phaser.Game>(null);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const [debugState, setDebugState] = useState<Debug>(debugInit);

  const soundManager: SoundManagerType = SoundManager();
  const musicManager: MusicManagerType = MusicManager();

  const [isReplayHidden, setIsReplayHidden] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [videoGray, setVideoGray] = useState(false);

  const nnJsonExpress = useRef<string | null>(null);

  ////////////////////////////////
  // Reste NN_Rest_Evolving Button
  ////////////////////////////////
  useEffect(() => {
    if (debugState.NN_Reset_Evolving) {
      return;
    }
    (async () => {
      const x = await replaceNNExpressWithNNClient();

      setTimeout(() => {
        print('debugState.NN_Reset_Evolving Button setTimeout');
        setDebugState((prev: Debug) => {
          return {
            ...prev,
            NN_Reset_Evolving: !debugState.NN_Reset_Evolving,
          };
        });
      }, 1000);
    })();
  }, [debugState.NN_Reset_Evolving]);

  ////////////////////////////////
  // Reste NN_Train_Evolving Button
  ////////////////////////////////
  useEffect(() => {
    if (debugState.NN_Train_Evolving) {
      return;
    }
    (async () => {
      setDebugState((prev: Debug) => {
        return {
          ...prev,
          Mode_Infinity: false,
          Minutes: 30,
          Dur_Seconds: false,
          Matrices_Always: true,
          Auto_Restart: true,
          Simple_Stage: true,
        };
      });

      // set inputs to all input 5
      setInputArrayEffect([5, 5, 5, 5]);

      // set all characters to 0

      const choices: PlayerConfigSmall[] = [
        {
          characterId: 0,
          input: null,
        },
        {
          characterId: 0,
          input: null,
        },
        {
          characterId: 0,
          input: null,
        },
        {
          characterId: 0,
          input: null,
        },
      ];

      setSmashConfig({ players: [...choices] });

      setTimeout(() => {
        print('debugState.NN_Train_Evolving Button setTimeout');
        setDebugState((prev: Debug) => {
          return {
            ...prev,
            NN_Train_Evolving: !debugState.NN_Train_Evolving,
          };
        });
      }, 1000);
    })();
  }, [debugState.NN_Train_Evolving]);

  const pullExpressNeuralNet = async () => {
    nnJsonExpress.current = await fetchNeuralNetwork();
    print('nnJsonExpress.current', nnJsonExpress.current);
    if (nnJsonExpress.current !== null) {
      // printWeightsAndBiases(nnJsonExpress.current as any);
      // @ts-ignore
    }
  };

  const [mainOptionsDebugShowState, setMainOptionsDebugShowState] =
    useState<Debug>(debugOnMain);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video === null || video === undefined || video.duration === Infinity) {
      videoRef.current!.playbackRate = 16;
      setVideoGray(true);
      return;
    }
    setVideoGray(false);

    const s = 5;
    const m = 2;
    const duration = video.duration;

    const pStart = duration - s > 0 ? duration - s : 0;
    const pMid = duration - m > 0 ? duration - m : 0;
    const pEnd = duration;
    let current = video.currentTime;

    if (debugState.Replay_FastSlow) {
      if (current >= pStart && current < pMid) {
        return;
      }

      if (current >= pMid && current < pEnd) {
        video.playbackRate = 0.5;
        return;
      }
    }

    if (current >= pEnd) {
      current = pStart;
      video.currentTime = current;
      if (debugState.Replay_FastSlow) {
        video.playbackRate = 2;
      } else {
        video.playbackRate = 1;
      }
      video.play();
      return;
    }
  };

  useEffect(() => {
    if (debugState.Inst_Replay === 0 || debugState.Simple_Stage) {
      setIsReplayHidden(true);
      return;
    }

    const startRecording = () => {
      setIsReplayHidden(true);

      const canvas = myPhaser.current?.canvas;

      if (!canvas) {
        return;
      }

      const stream = canvas.captureStream();
      const mediaRecorder = new MediaRecorder(
        stream,
        debugState.Inst_Replay === 1
          ? {
              videoBitsPerSecond: 20000,
            }
          : debugState.Inst_Replay === 2
          ? {
              videoBitsPerSecond: 100000,
            }
          : debugState.Inst_Replay === 3
          ? {
              // FULL QUALITY
            }
          : {}
      );

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        setIsReplayHidden(false);
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        videoRef.current!.controls = false;
        videoRef.current!.src = url;
        videoRef.current!.play();
      };

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorderRef.current.start();
    };

    const stopRecording = () => {
      const mediaRecorder = mediaRecorderRef.current;

      if (mediaRecorder) {
        setTimeout(() => {
          mediaRecorder.stop();
        }, 1000);
      }
    };

    const handlePowerUpCollected = (event: any) => {
      const gameStateReact: GameStateWithTime = event.detail;
      bar();
      print('REACT PRINTING', gameStateReact);
      bar();

      const s = gameStateReact.nameCurr;

      switch (s) {
        case 'game-state-start':
          break;
        case 'game-state-play':
          startRecording();
          break;
        case 'game-state-paused':
          stopRecording();
          break;
        case 'game-state-first-blood':
          stopRecording();
          break;
        case 'game-state-screen-clear':
          stopRecording();
          break;
        case 'game-state-captured-flag':
          stopRecording();
          break;
        case 'game-state-finished':
          stopRecording();
          break;
        default:
          throw new Error('gameStateReact.nameCurr not found');
      }
    };

    window.addEventListener('gameState', handlePowerUpCollected);

    return () => {
      window.removeEventListener('gameState', handlePowerUpCollected);
    };
  }, [debugState.ReplayOn]);

  const setAllTrainingStatesToNull = () => {
    setNnJson(null);
    setNnRatios(null);
    setNnProgress(null);
    setNnErrorCurr(null);
    setNnErrInit(null);
    setNnNumObj(null);
    setNnNumIter(null);
    setNnLogPeriod(null);
  };

  const [nnJson, setNnJson] = useState<string | null>(null);
  const [nnRatios, setNnRatios] = useState<number[] | null>(null);
  const [nnProgress, setNnProgress] = useState<number | null>(null);
  const [nnErrorCurr, setNnErrorCurr] = useState<number | null>(null);
  const [nnErrInit, setNnErrInit] = useState<number | null>(null);
  const [nnNumObj, setNnNumObj] = useState<number | null>(null);
  const [nnNumIter, setNnNumIter] = useState<number | null>(null);
  const [nnLogPeriod, setNnLogPeriod] = useState<number | null>(null);

  const numberToStringWithThreeDigitsAndOneDecimal = (n: number): string => {
    return n.toFixed(0).padStart(3, '0');
  };

  const numberToStringWithTwoDigits = (n: number): string => {
    return n.toFixed(0).padStart(2, '0');
  };

  const percentDoneBar = (n: number): string => {
    const incomplete = '-';
    const complete = '|';

    let str = '';
    for (let i = 0; i < nnNumTrainingBarTicks; i++) {
      if (i < n * nnNumTrainingBarTicks) {
        str += complete;
      } else {
        str += incomplete;
      }
    }

    // console.log('str', str);

    return str;
  };

  const [numAutoRestarts, setNumAutoRestarts] = useState<number>(0);

  useEffect(() => {
    print('numAutoRestarts', numAutoRestarts);
    if (numAutoRestarts === 0) {
      return;
    }
    onClickStartStartButton();
    // onClickBackButtonHandler();
  }, [numAutoRestarts]);

  useEffect(() => {
    window.addEventListener('nn-train', async (t) => {
      // @ts-ignore
      switch (t?.detail?.name) {
        case 'netStart':
          // @ts-ignore
          setNnProgress(0);
          // @ts-ignore
          setNnErrorCurr(0);
          // @ts-ignore
          setNnNumIter(t?.detail?.numIter);
          // @ts-ignore
          setNnNumObj(t?.detail?.numObj);
          // @ts-ignore
          setNnLogPeriod(t?.detail?.logPeriod);
          break;
        case 'netJson':
          // @ts-ignore
          setNnJson(t?.detail?.value);
          break;
        case 'netRatios':
          // @ts-ignore
          setNnRatios(t?.detail?.value);
          break;
        case 'netProgress':
          // @ts-ignore
          setNnProgress(t?.detail?.value);
          // @ts-ignore
          setNnErrorCurr(t?.detail?.error);
          break;
        case 'restart-game':
          print('RESTART GAME SIGNAL RECEIVED');
          // setWebStateCurr('web-state-setup');
          // onClickStartStartButton();
          // onClickBackButtonHandler();
          setNumAutoRestarts((prev) => prev + 1);
          break;
        default:
          break;
      }
    });
  }, []);

  useEffect(() => {
    if (!nnErrInit && nnErrorCurr) {
      setNnErrInit((prev) => {
        return nnErrorCurr;
      });
    }
  }, [nnErrorCurr, nnErrInit]);

  // const [session, setSession] = useState<SessionInfo | null>(null);
  const [allSessions, setAllSessions] = useState<SessionInfo[]>([]);

  const [hideNiemoIp, setHideNiemoIp] = useState<boolean>(true);

  function captureScreenshot() {
    print('Capture Screenshot');

    const element = document.querySelector('#top-level');

    html2canvas(element as HTMLElement).then((canvas) => {
      const dataUrl = canvas.toDataURL();

      const link = document.createElement('a');

      link.href = dataUrl;

      const m: Moment = moment();
      const mFormatted = m.format('YYYY-MM-DD-HH-mm-ss');
      const fileName = `Smashed_Rules_${mFormatted}.png`;
      link.download = fileName;

      link.click();
    });
  }

  const [numClicks, setNumClicks] = useState<number>(0);
  const [openEye, setOpenEye] = useState<boolean>(false);
  const [topBarDivExists, setTopBarDivExists] = useState<boolean>(false);
  const [webStateCurr, setWebStateXXXX] = useState<WebState>('web-state-init');
  const [webStatePrev, setWebStatePrev] = useState<WebState>('web-state-init');

  const setWebStateCurr = (webStateNext: WebState) => {
    if (webStateNext === webStateCurr) {
      throw new Error('ws === webStateCurr');
    }

    setWebStatePrev(webStateCurr);
    setWebStateXXXX(webStateNext);
  };

  useEffect(() => {
    if (!myPhaser || !myPhaser.current) {
      return;
    }

    return () => {
      if (!myPhaser || !myPhaser.current) {
        return;
      }

      myPhaser.current.events.off('scoreUpdate', (x: any) => {
        print('scoreUpdate', x);
      });
    };
  }, [myPhaser, myPhaser.current]);

  const scrollerRef = useRef<HTMLDivElement>(null);

  const onClickEye = () => {
    soundManager.blipBeedeeSound();
    setOpenEye(!openEye);
  };

  useEffect(() => {
    if (debugState.Dev_Mode) {
      setWebStateCurr('web-state-setup');
    }
  }, []);

  useEffect(() => {
    print('webStatePrev', webStatePrev);
    print('webStateCurr', webStateCurr);

    const setShowLoaderIntervalFunction = () => {
      const myInterval = setInterval(() => {
        // @ts-ignore
        if (myPhaser?.current?.scene?.keys?.game?.loaded) {
          setTimeout(
            () => {
              setWebStateCurr('web-state-game');
            },
            debugState.Dev_Mode ? 0 : 1
          );
          clearInterval(myInterval);
        }
      }, 1);
    };

    switch (webStateCurr) {
      case 'web-state-init':
        print('init');

        setP1KeysTouched(true);
        setP2KeysTouched(true);
        break;
      case 'web-state-setup':
        setTimeout(() => {
          setOpenEye(true);
        }, 6000);

        choosePlay();
        soundManager.startSound();

        musicManager.musicSetupScreenRef.current.play();
        musicManager.musicLoadingScreenRef.current.pause();

        setTopBarDivExists(true);

        if (debugState.Auto_Start && webStatePrev === 'web-state-init') {
          print('AUTO START');
          onClickStartStartButton();
        }

        setP1KeysTouched(true);
        setP2KeysTouched(true);

        break;
      case 'web-state-load':
        setOpenEye(false);
        readyPlay();
        soundManager.startSound();
        musicManager.musicSetupScreenRef.current.pause();
        musicManager.musicLoadingScreenRef.current.play();
        setShowLoaderIntervalFunction();
        break;
      case 'web-state-game':
        setTimeout(() => {
          setOpenEye(true);
        }, 3000);
        goPlay();
        musicManager.musicSetupScreenRef.current.pause();
        musicManager.musicLoadingScreenRef.current.pause();
        setTopBarDivExists(true);

        const numKeyboards = getNumKeyboardsInUse();
        switch (numKeyboards) {
          case 0:
            setP1KeysTouched(true);
            setP2KeysTouched(true);
            break;
          case 1:
            setP1KeysTouched(false);
            setP2KeysTouched(true);
            break;
          case 2:
            setP1KeysTouched(false);
            setP2KeysTouched(false);
            break;
        }
        break;

      default:
        break;
    }
  }, [webStateCurr]);

  ///////////////////////////////////////
  ///////////////////////////////////////
  // set initial inputs in inputArray
  // 0 -> none
  // 1 -> gamepad
  // 2 -> keyboard
  // 3 -> bot Rules-Based
  // 4 -> bot Neural-Network
  ///////////////////////////////////////
  ///////////////////////////////////////
  const [inputArray, setInputArray] = useState<InputType[]>(
    debugInit.Dev_Mode || debugInit.Auto_Start
      ? inputArrayInitDevMode
      : inputArrayInit
  );
  const [smashConfig, setSmashConfig] = useState<SmashConfig>(
    debugState.Dev_Mode ? smashConfigInitDevMode : smashConfigInit
  );
  const [smashConfigAllowed, setSmashConfigAllowed] = useState<boolean[]>([]);

  useEffect(() => {
    let newSmashConfigAllowed: boolean[] = [];

    for (let i = 0; i < smashConfigInitMax; i++) {
      newSmashConfigAllowed.push(false);
    }

    newSmashConfigAllowed[0] = true;
    newSmashConfigAllowed[1] = true;
    newSmashConfigAllowed[2] = true;
    newSmashConfigAllowed[3] = true;

    if (debugState.Allow_Chez) {
      newSmashConfigAllowed[4] = true;
    }

    if (debugState.Allow_BlackChez) {
      newSmashConfigAllowed[5] = true;
    }

    if (debugState.Allow_Koopas) {
      newSmashConfigAllowed[6] = true;
      newSmashConfigAllowed[7] = true;
      newSmashConfigAllowed[8] = true;
    }

    // print('newSmashConfigAllowed', newSmashConfigAllowed);
    //
    setSmashConfigAllowed(newSmashConfigAllowed);
  }, [
    debugState.Allow_Chez,
    debugState.Allow_BlackChez,
    debugState.Allow_Koopas,
    debugState,
  ]);

  const setInputArrayEffect = (newInputArray: InputType[]): void => {
    soundManager.blipBeedeeSound();
    setInputArray((prevArray: InputType[]) => inputArrayReset);

    newInputArray.forEach((item, index) => {
      if (item === 0) {
        return;
      }

      setTimeout(() => {
        soundManager.blipBeedeeSound();
        setInputArray((prevArray: InputType[]) => {
          const updatedArray = [...prevArray];
          for (let j = 0; j <= index; j++) {
            updatedArray[j] = newInputArray[j];
          }
          return updatedArray;
        });
      }, (index + 1) * blipDelay);
    });
  };

  //////////////////////////////////////////////
  // kill if its still alive on reload
  // let's try this
  //////////////////////////////////////////////
  useEffect(() => {
    // kill smashed game
    if (myPhaser?.current?.scene?.keys?.game) {
      // @ts-ignore
      myPhaser.current.scene.keys.game.loaded = false;
      myPhaser.current.destroy(true);
    }
  }, []);

  const setCharacterSlot = (
    charId: CharacterId,
    positionIndex: number
  ): void => {
    if (webStateCurr !== 'web-state-setup') {
      print('webState !== start');
      return;
    }

    const choices = [...smashConfig.players];
    const choice = choices[positionIndex];
    choice.characterId = charId;

    setSmashConfig({ players: [...choices] });
  };

  const randomizeCharacters = () => {
    soundManager.dice();

    print('smashConfigAllowed', smashConfigAllowed);

    const numTotalAllowed: number = smashConfigAllowed.filter((x) => x).length;
    let inputArrayLocal = [...inputArray];
    if (!numTotalAllowed) {
      print('ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ', numTotalAllowed);
      return;
    }

    if (inputArrayLocal.filter((x) => x !== 0).length === 0) {
      print('inputArrayToUse.filter((x) => x !== 0).length === 0');
      inputArrayLocal = [3, 3, 3, 3];
      setInputArray(inputArrayLocal);
    }

    print('numTotal', numTotalAllowed);

    const newPlayers: PlayerConfigSmall[] = [];

    for (let i = 0; i < 4; i++) {
      const oldId: number = smashConfig.players[i].characterId;
      let newId: number | null = null;
      let isAllowed: boolean = false;

      while (!isAllowed) {
        newId = Math.floor(Math.random() * numTotalAllowed);

        if (smashConfigAllowed[newId] && newId !== oldId) {
          isAllowed = true;
        }
      }

      print('new', newId, 'old', oldId);

      newPlayers.push({
        characterId: newId as CharacterId,
        input: 0,
      });
    }

    let blipIndex = 0;
    for (let i = 0; i < 4; i++) {
      if (inputArrayLocal[i] === 0) {
        continue;
      }

      setTimeout(() => {
        soundManager.blipBeedeeSound();
        setCharacterSlot(newPlayers[i].characterId, i);
      }, blipIndex * blipDelay);

      blipIndex += 1;
    }
  };

  const getNumActiveBeforeMe = (index: number): number => {
    let numActiveBeforeMe = 0;
    for (let i = 0; i < index; i++) {
      if (inputArray[i] !== 0) {
        numActiveBeforeMe++;
      }
    }
    return numActiveBeforeMe;
  };

  useEffect(() => {
    print('smashConfig', smashConfig);
  }, [smashConfig]);

  const [config, setConfig] =
    useState<Phaser.Types.Core.GameConfig>(configInit);

  const [prevent, setPrevent] = useState<boolean>(true);
  useEffect(() => {
    if (!debugState) {
      return;
    }

    if (prevent) {
      setPrevent(false);
      return;
    }

    if (!debugState?.NN_Brand_New) {
      return;
    }
    const debugStateCopy = { ...debugState };
    const inputArrayNew: InputType[] = [3, 3, 3, 3];

    const smashConfigNew: SmashConfig = {
      players: [
        {
          characterId: 0,
          input: 0, // don't set this here
        },
        {
          characterId: 1,
          input: 0, // don't set this here
        },
        {
          characterId: 2,
          input: 0, // don't set this here
        },
        {
          characterId: 7,
          input: 0, // don't set this here
        },
      ],
    };

    debugStateCopy.Minutes = 10;
    debugStateCopy.Simple_Stage = true;
    setSmashConfig(smashConfigNew);
    setInputArray(inputArrayNew);
    setDebugState(debugStateCopy);
  }, [debugState?.NN_Brand_New]);

  let setTimeoutQuotesLengthStart: number = 3000;
  const [quotesRandomNumber, setQuotesRandomNumber] = useState(0);

  const componentPseudoLoad = useRef(true);
  const intervalClock: any = useRef(null);

  const [p1KeysTouched, setP1KeysTouched] = useState<boolean>(false);
  const [p2KeysTouched, setP2KeysTouched] = useState<boolean>(false);
  const [bothKeysTouched, setBothKeysTouched] = useState<boolean>(false);
  const [anyKeyWasPressed, setAnyKeyWasPressed] = useState<boolean>(false);
  const [numKeyboards, setNumKeyboards] = useState<number>(0);

  const onClickStartStartButton = async () => {
    // wait 2 seconds

    if (myPhaser?.current?.scene?.keys?.game) {
      // @ts-ignore
      myPhaser.current.scene.keys.game.loaded = false;
      myPhaser.current.destroy(true);
    }

    setAllTrainingStatesToNull();

    setShowControls(false);
    setShowControllers(false);
    setShowRulesN64(false);
    setShowAbout(false);
    setShowHistory(false);
    setShowOptions(false);

    const players = JSON.parse(JSON.stringify(smashConfig.players));

    const newPlayers: PlayerConfigSmall[] = [];
    inputArray.forEach((input, inputIndex) => {
      switch (input) {
        case 0:
          break;
        case 1:
          newPlayers.push({
            characterId: players[inputIndex].characterId,
            input: inputArray[inputIndex],
          });
          break;
        case 2:
          newPlayers.push({
            characterId: players[inputIndex].characterId,
            input: inputArray[inputIndex],
          });
          break;
        case 3:
          newPlayers.push({
            characterId: players[inputIndex].characterId,
            input: inputArray[inputIndex],
          });
          break;
        case 4:
          newPlayers.push({
            characterId: players[inputIndex].characterId,
            input: inputArray[inputIndex],
          });
          break;
        case 5:
          newPlayers.push({
            characterId: players[inputIndex].characterId,
            input: inputArray[inputIndex],
          });
          break;
        default:
          print("inputArray[inputIndex] didn't match any cases");
          throw new Error("inputArray[inputIndex] didn't match any cases");
      }
    });

    if (newPlayers.length === 0) {
      print('newPlayers.length === 0');
      throw new Error('newPlayers.length === 0');
    }

    const newSmashConfig: SmashConfig = { players: [...newPlayers] };
    setQuotesRandomNumber(Math.floor(Math.random() * quotes.length));

    if (!debugState.Load_Time_Extra || debugState.Dev_Mode) {
      setTimeoutQuotesLengthStart = 0;
    }
    const myMoment = moment();

    setWebStateCurr('web-state-load');

    await pullExpressNeuralNet();

    const c: ClientInformation = await fetchClientData();
    const s: SessionInfo = await axiosSaveOne(
      myMoment,
      c,
      newSmashConfig,
      debugState
    );
    // setSession(s);

    ///////////////////////////////////////////////////
    ///////////////////////////////////////////////////
    // PHASER GAME CREATION
    ///////////////////////////////////////////////////
    ///////////////////////////////////////////////////
    setTimeout(() => {
      // @ts-ignore
      myPhaser.current = new Phaser.Game(config);
      myPhaser.current.registry.set('parentContext', Main);
      myPhaser.current.registry.set('smashConfig', newSmashConfig);
      myPhaser.current.registry.set('debug', debugState);
      myPhaser.current.registry.set('myMoment', myMoment);
      myPhaser.current.registry.set('nnJsonExpress', nnJsonExpress.current);
    }, setTimeoutQuotesLengthStart);
  };

  const getNumKeyboardsInUse = (): number => {
    let numKeyboardsInUse = 0;
    inputArray.forEach((input) => {
      if (input === 2) {
        numKeyboardsInUse++;
      }
    });
    return numKeyboardsInUse;
  };

  const onClickSetInputArrayElement = (
    playerIndex: number,
    newInput: InputType
  ): void => {
    soundManager.blipBeedeeSound();
    let i = newInput;
    let k = getNumKeyboardsInUse();
    if (i === 2 && k >= 2) {
      i++;
    }
    const newInputArray = [...inputArray];
    newInputArray[playerIndex] = i as InputType;
    setInputArray([...newInputArray]);
    print('i', i, 'newInputArray', newInputArray);
  };

  const bamPlay = (): void => {
    soundManager.bam();
  };
  const woahPlay = (): void => {
    soundManager.woah();
  };
  const readyPlay = (): void => {
    soundManager.meleeReady();
  };
  const goPlay = (): void => {
    soundManager.meleeGo();
  };
  const choosePlay = (): void => {
    soundManager.meleeChoose();
  };

  const setFirstCharacterSlot = (charId: CharacterId): void => {
    if (debugState.Allow_BlackChez || webStateCurr !== 'web-state-setup') {
      print('debugState.UseChez || webState !== start');
      return;
    }
    if (charId === 4) {
      bamPlay();
      setInputArray([2, 0, 0, 0]);
    }
    if (charId === 5) {
      woahPlay();
      setInputArray([2, 0, 0, 0]);
    }

    const choices = [...smashConfig.players];
    const choice = choices[0];
    choice.characterId = charId;

    setSmashConfig({ players: [...choices] });
  };

  const onClickRotateSelection = (playerIndex: number): void => {
    soundManager.blipBeedeeSound();
    const choices = [...smashConfig.players];
    const choice = choices[playerIndex];
    let newCharacterId = (choice.characterId + 1) % smashConfigOptions.length;

    const numAllowed = smashConfigAllowed.filter((x) => x).length;

    if (numAllowed === 0) {
      print('numAllowed === 0');
      return;
    }

    while (!smashConfigAllowed[newCharacterId]) {
      newCharacterId = (newCharacterId + 1) % smashConfigInitMax;
    }

    choice.characterId = newCharacterId as CharacterId;

    setSmashConfig({ players: [...choices] });
  };

  const [showRulesN64, setShowRulesN64] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showControllers, setShowControllers] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    if (showAbout) {
      (async () => {
        const allSessions: SessionInfo[] = await getAllGameHistory();
        setAllSessions(allSessions);
      })();
    }
  }, [showAbout]);

  const clickPauseParent = () => {
    // @ts-ignore
    print('GAME STATE', myPhaser.current?.scene?.keys?.game.gameState.nameCurr);
    if (webStateCurr !== 'web-state-game') {
      print('webStateCurr !== web-state-game');
      return;
    }

    if (
      // @ts-ignore
      myPhaser.current?.scene?.keys?.game.gameState.nameCurr !==
        'game-state-start' &&
      // @ts-ignore
      myPhaser.current?.scene?.keys?.game.gameState.nameCurr !==
        'game-state-paused' &&
      // @ts-ignore
      myPhaser.current?.scene?.keys?.game.gameState.nameCurr !==
        'game-state-first-blood' &&
      // @ts-ignore
      myPhaser.current?.scene?.keys?.game.gameState.nameCurr !==
        'game-state-screen-clear' &&
      // @ts-ignore
      myPhaser.current?.scene?.keys?.game.gameState.nameCurr !==
        'game-state-captured-flag' &&
      // @ts-ignore
      myPhaser.current?.scene?.keys?.game.gameState.nameCurr !==
        'game-state-finished'
    ) {
      print('CLICK AND PAUSING');
      // @ts-ignore
      setGameState(myPhaser.current?.scene?.keys?.game, 'game-state-paused');
    }
  };

  const onClickPlayNavBody = (buttonName: ButtonName) => {
    soundManager.blipBeedeeSound();

    print('Click NavBody: ', buttonName);

    setShowControls(false);
    setShowControllers(false);
    setShowRulesN64(false);
    setShowAbout(false);
    setShowHistory(false);
    setShowOptions(false);
  };

  const onClickPlayNavButtons = (buttonName: ButtonName) => {
    soundManager.blipBeedeeSound();
    clickPauseParent();

    switch (buttonName) {
      case 'Back':
        setShowControls(false);
        setShowControllers(false);
        setShowRulesN64(false);
        setShowAbout(false);
        setShowHistory(false);
        setShowOptions(false);
        break;
      case 'ReStart':
        setShowControls(false);
        setShowControllers(false);
        setShowRulesN64(false);
        setShowAbout(false);
        setShowHistory(false);
        setShowOptions(false);
        break;
      case 'Controls':
        setShowControls(!showControls);
        setShowControllers(false);
        setShowRulesN64(false);
        setShowAbout(false);
        setShowHistory(false);
        setShowOptions(false);
        break;
      case 'Controllers':
        setShowControls(false);
        setShowControllers(!showControllers);
        setShowRulesN64(false);
        setShowAbout(false);
        setShowHistory(false);
        setShowOptions(false);
        break;
      case 'Rules-N64':
        setShowControls(false);
        setShowControllers(false);
        setShowRulesN64(!showRulesN64);
        setShowAbout(false);
        setShowHistory(false);
        setShowOptions(false);
        break;
      case 'About':
        setShowControls(false);
        setShowControllers(false);
        setShowRulesN64(false);
        setShowAbout(!showAbout);
        setShowHistory(false);
        setShowOptions(false);
        break;
      case 'History':
        setShowControls(false);
        setShowControllers(false);
        setShowRulesN64(false);
        setShowAbout(false);
        setShowHistory(!showHistory);
        setShowOptions(false);
        break;
      case 'Options':
        setShowControls(false);
        setShowControllers(false);
        setShowRulesN64(false);
        setShowAbout(false);
        setShowHistory(false);
        setShowOptions(!showOptions);
        break;
      default:
        setShowControls(false);
        setShowControllers(false);
        setShowRulesN64(false);
        setShowAbout(false);
        setShowHistory(false);
        setShowOptions(false);
    }
  };

  const onClickOscura = (index: number) => {
    onClickSetInputArrayElement(
      index,
      inputArray[index] + 1 >= inputTypeNum
        ? (0 as InputType)
        : ((inputArray[index] + 1) as InputType)
    );
  };

  const onEventKeyboard = (event: any) => {
    const k = event.key;

    if (webStateCurr === 'web-state-init') {
      switch (k) {
        case 'Enter':
          setWebStateCurr('web-state-setup');
          break;
      }
    }

    if (webStateCurr === 'web-state-setup') {
      let pIndex;
      switch (k) {
        case 'Enter':
          onClickStartStartButton();
          break;
        case 'j':
          onClickOscura(0);
          break;
        case 'k':
          onClickOscura(1);
          break;
        case 'l':
          onClickOscura(2);
          break;
        case ';':
          onClickOscura(3);
          break;
        case 'u':
          pIndex = 0;
          if (inputArray[pIndex] !== 0) {
            onClickRotateSelection(pIndex);
          }
          break;
        case 'i':
          pIndex = 1;
          if (inputArray[pIndex] !== 0) {
            onClickRotateSelection(pIndex);
          }
          break;
        case 'o':
          pIndex = 2;
          if (inputArray[pIndex] !== 0) {
            onClickRotateSelection(pIndex);
          }
          break;
        case 'p':
          pIndex = 3;
          if (inputArray[pIndex] !== 0) {
            onClickRotateSelection(pIndex);
          }
          break;
      }
    }

    if (webStateCurr === 'web-state-game') {
      if (p1Keys.includes(k)) {
        setP1KeysTouched(true);
      }
      if (p2Keys.includes(k)) {
        setP2KeysTouched(true);
      }
      switch (k) {
        case 'Backspace':
          onClickStartStartButton();
          break;
        case 'Escape':
          onClickBackButtonHandler();
          break;
      }
    }
  };

  const cb = (event: any) => {
    onEventKeyboard(event);
    setAnyKeyWasPressed(!anyKeyWasPressed);
  };

  useEffect(() => {
    window.addEventListener<'keydown'>('keydown', cb, { once: true });
  }, [anyKeyWasPressed]);

  const getNumControllersExistLower = (myI: number): number => {
    let num: number = 0;

    inputArray.forEach((ia: number, iaIndex: number) => {
      if (ia === 1 && iaIndex < myI) {
        num++;
      }
    });

    return num;
  };

  const [tz, setTz] = useState('');
  useEffect(() => {
    const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTz(clientTimezone);
  }, []);

  const getDoesKeyboardExistLower = (myI: number): boolean => {
    let exists: boolean = false;

    inputArray.forEach((ia: number, iaIndex: number) => {
      if (ia === 2 && iaIndex < myI) {
        exists = true;
      }
    });

    return exists;
  };

  const getNumKeyboards = (): number => {
    let numK: number = 0;

    inputArray.forEach((ia: number, iaIndex: number) => {
      if (ia === 2) {
        numK++;
      }
    });

    return numK;
  };

  const getNumGamepads = (): number => {
    let pads: number = 0;

    for (let i = 0; i < inputArray.length; i++) {
      if (inputArray[i] === 1) {
        pads++;
      }
    }

    return pads;
  };

  const onClickBackButtonHandler = () => {
    if (myPhaser?.current?.scene?.keys?.game) {
      // @ts-ignore
      myPhaser.current.scene.keys.game.loaded = false;
    }
    onClickPlayNavButtons('Back');
    setNumClicks(numClicks + 1);
    clearInterval(intervalClock.current);
    intervalClock.current = null;
    componentPseudoLoad.current = true;

    if (myPhaser.current) {
      myPhaser.current.destroy(true);
    }

    setWebStateCurr('web-state-setup');
  };

  useEffect(() => {
    let numK = 0;
    inputArray.forEach((input) => {
      if (input === 2) {
        numK++;
      }
    });
    setNumKeyboards(numK);
  }, [inputArray]);

  useEffect(() => {
    if (p1KeysTouched && p2KeysTouched) {
      setBothKeysTouched(true);
    } else {
      setBothKeysTouched(false);
    }
  }, [p1KeysTouched, p2KeysTouched]);

  const getMaxFromKey = (key: string) => {
    print('getInitFromKey', key);

    const newVal = debugMax[key as keyof Debug];
    return newVal;
  };

  return (
    <div id="top-level" className="over-div">
      {!debugState.Dev_Mode &&
        debugState.Show_Helper_Keyboard &&
        webStateCurr !== 'web-state-setup' &&
        numKeyboards === 2 &&
        !bothKeysTouched && (
          <div
            className="keyboard-explainer-double"
            onClick={() => {
              onClickPlayNavButtons('Controls');
            }}
          >
            {!p1KeysTouched && (
              <div className="keyboard-left-checkmark">
                <span>Awaiting</span>
                <div className="small-spinner ss-red"></div>
                <span>WASD</span>
              </div>
            )}
            {!p2KeysTouched && (
              <div className="keyboard-right-checkmark">
                <span>Awaiting</span>
                <div className="small-spinner ss-blue"></div>
                <span>Arrows</span>
              </div>
            )}
          </div>
        )}
      {!debugState.Dev_Mode &&
        debugState.Show_Helper_Keyboard &&
        webStateCurr !== 'web-state-setup' &&
        numKeyboards === 1 &&
        !p1KeysTouched && (
          <div
            className="keyboard-explainer-single"
            onClick={() => {
              onClickPlayNavButtons('Controls');
            }}
          >
            <div className="keyboard-left-checkmark">
              <span>Awaiting</span>
              <div className="small-spinner ss-red"></div>
              <span>WASD</span>
            </div>
          </div>
        )}
      {webStateCurr === 'web-state-load' && (
        <div className="loader">
          <div className="spinner-box">
            <div className="spinner-rotate-x">
              <div className="spinner-rotate-y">
                <div className="spinner">
                  <div className="cube_side">
                    <div className="cube_side_inside"></div>
                  </div>
                  <div className="cube_side">
                    <div className="cube_side_inside"></div>
                  </div>
                  <div className="cube_side">
                    <div className="cube_side_inside"></div>
                  </div>
                  <div className="cube_side">
                    <div className="cube_side_inside"></div>
                  </div>
                  <div className="cube_side">
                    <div className="cube_side_inside"></div>
                  </div>
                  <div className="cube_side">
                    <div className="cube_side_inside"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="loading-table-wrapper">
            <img
              className="loading-table"
              src="/images/table.png"
              alt="table"
            />
          </div>

          {!debugState.Typed_Loading_Text && (
            <p className="first-loader-p">{quotes[quotesRandomNumber].text}</p>
          )}
          <p className="second-loader-p">- {quotes[quotesRandomNumber].name}</p>
        </div>
      )}
      <div className="phaser-container" id="phaser-container"></div>
      {(webStateCurr === 'web-state-setup' ||
        webStateCurr === 'web-state-init') && (
        <div className="start-class-div">
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
          {true && (
            <div className={'start-title-wrapper'}>
              <div
                className={
                  'start-title' +
                  (webStateCurr === 'web-state-setup'
                    ? ' start-title-start'
                    : ' start-title-init')
                }
                onMouseDown={() => {
                  print('mouse down');
                }}
                onMouseUp={() => {
                  print('mouse up');
                }}
              >
                <div
                  className="start-title-div"
                  onMouseDown={() => {
                    setWebStateCurr('web-state-setup');
                  }}
                >
                  <img
                    className="start-title-div-img"
                    src="images/smashed_x10_gif.gif"
                    alt="Smashed Title Gif"
                  />
                </div>
                <h1
                  className="start-title-h1"
                  id={
                    '' +
                    (webStateCurr === 'web-state-init' ? 'niemo-games' : '')
                  }
                  onMouseDown={() => {
                    setWebStateCurr('web-state-setup');
                  }}
                >
                  {webStateCurr === 'web-state-init' ? 'START' : 'SMASHED'}
                </h1>

                {/* CORNER PIECES OFFLOADED */}
                <CornerPieces
                  debugState={debugState}
                  webStateCurr={webStateCurr}
                />
              </div>
            </div>
          )}

          <div className="player-choices">
            <div className="player-choices-left">
              <DebugOptions
                showHomeList={true}
                soundManager={soundManager}
                debugState={debugState}
                mainOptionsDebugShowState={mainOptionsDebugShowState}
                setDebugState={setDebugState}
                getMaxFromKey={getMaxFromKey}
                setMainOptionsDebugShowState={setMainOptionsDebugShowState}
              />
            </div>
            <div className="player-choices-right">
              {smashConfig.players.map((p, pIndex) => {
                return (
                  <div className="player-choice" key={pIndex}>
                    {/* Instead of repeating the same conditional blocks,
                        we now offload them to InputTypeBlock */}
                    <InputTypeBlock
                      input={inputArray[pIndex]}
                      pIndex={pIndex}
                      p={p}
                      debugState={{
                        ...debugState,
                        idColors, // to preserve original usage of idColors
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
                      getNumControllersExistLower={getNumControllersExistLower}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bottom-zone">
            <InputGroup
              soundManager={soundManager}
              setInputArrayEffect={setInputArrayEffect}
            />
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
                  }, i * blipDelay * 0.25);
                }
              }}
            >
              {emoji.dice}
            </div>
            <div
              onMouseEnter={() => {
                if (inputArray.filter((x) => x !== 0).length === 0) {
                  return;
                }

                soundManager.blipSoundSoft();
              }}
              className={
                inputArray.filter((x) => x !== 0).length === 0
                  ? 'b-start-inactive'
                  : 'b-start'
              }
              onClick={() => {
                onClickStartStartButton();
              }}
            >
              <span>START</span>
            </div>
          </div>
        </div>
      )}
      <div className="over-div">
        {topBarDivExists && (
          <div
            onMouseEnter={() => {
              soundManager.blipSoundSoft();
            }}
            className={
              openEye
                ? 'top-bar-eye-open ' +
                  (webStateCurr === 'web-state-game' ? 'bg-black' : 'bg-trans')
                : 'top-bar-eye-closed bg-trans'
            }
          >
            <img
              onMouseEnter={() => {
                soundManager.blipSoundSoft();
              }}
              className="eye-mark"
              src={
                !openEye
                  ? '/images/eye-shut-trans.png'
                  : '/images/eye-open-trans.png'
              }
              alt="question mark"
              onClick={onClickEye}
            />

            {webStateCurr === 'web-state-setup' && (
              <div
                onMouseEnter={() => {
                  soundManager.blipSoundSoft();
                }}
                className="link-tag"
                onClick={() => {
                  onClickPlayNavButtons('Options');
                }}
              >
                {showOptions && <span className="dark-span">Options</span>}
                {!showOptions && <span>Options</span>}
              </div>
            )}
            {webStateCurr === 'web-state-setup' && (
              <div
                onMouseEnter={() => {
                  soundManager.blipSoundSoft();
                }}
                className="link-tag"
                onClick={() => {
                  onClickPlayNavButtons('Controllers');
                }}
              >
                {showControllers && <span className="dark-span">Pads</span>}
                {!showControllers && <span>Pads</span>}
              </div>
            )}
            {webStateCurr !== 'web-state-setup' && (
              <div
                onMouseEnter={() => {
                  soundManager.blipSoundSoft();
                }}
                className="link-tag"
                onClick={() => {
                  onClickBackButtonHandler();
                }}
              >
                <span>Back</span>
              </div>
            )}
            {webStateCurr !== 'web-state-setup' && (
              <div
                onMouseEnter={() => {
                  soundManager.blipSoundSoft();
                }}
                className="link-tag"
                onClick={() => {
                  onClickStartStartButton();
                }}
              >
                <span>ReStart</span>
              </div>
            )}

            <div
              onMouseEnter={() => {
                soundManager.blipSoundSoft();
              }}
              className="link-tag"
              onClick={() => {
                onClickPlayNavButtons('Controls');
              }}
            >
              {showControls && <span className="dark-span">Buttons</span>}
              {!showControls && <span>Buttons</span>}
            </div>
            <div
              onMouseEnter={() => {
                soundManager.blipSoundSoft();
              }}
              className="link-tag"
              onClick={() => {
                onClickPlayNavButtons('Rules-N64');
              }}
            >
              {showRulesN64 && <span className="dark-span">Rules</span>}
              {!showRulesN64 && <span>Rules</span>}
            </div>
            {webStateCurr === 'web-state-setup' && (
              <div
                onMouseEnter={() => {
                  soundManager.blipSoundSoft();
                }}
                className="link-tag"
                onClick={() => {
                  onClickPlayNavButtons('About');
                }}
              >
                {showAbout && <span className="dark-span">About</span>}
                {!showAbout && <span>About</span>}
              </div>
            )}
          </div>
        )}

        {/* ////////////////////////////////// */}
        {/* PLAY OPTIONS */}
        {/* ////////////////////////////////// */}
        {showOptions && (
          <div className="over-div">
            <div
              className="popup"
              onClick={() => {
                onClickPlayNavBody('Options');
              }}
            >
              <h1>Debug Options</h1>
              <div className="player-choices-left">
                <DebugOptions
                  showHomeList={false}
                  soundManager={soundManager}
                  debugState={debugState}
                  mainOptionsDebugShowState={mainOptionsDebugShowState}
                  setDebugState={setDebugState}
                  getMaxFromKey={getMaxFromKey}
                  setMainOptionsDebugShowState={setMainOptionsDebugShowState}
                />
              </div>
            </div>
          </div>
        )}

        {showControls && (
          <div className="over-div">
            <div
              className="popup"
              onClick={() => {
                onClickPlayNavBody('Controls');
              }}
            >
              <h1>Buttons</h1>
              <div id="controls-col">
                {characterMoves.map((charMove, charMoveIndex) => {
                  return (
                    <div id="move" key={charMoveIndex}>
                      <h5>{charMove.move}</h5>
                      <h5>
                        {charMove.button} {charMove.status}
                      </h5>
                    </div>
                  );
                })}
                {keyboardGroups.map((kGroup: KeyboardGroup[], kIndex) => {
                  return (
                    <div id="keyboard" key={kIndex}>
                      <div id="keyboard-top">
                        <h3>Keyboard {kGroup[0].right}</h3>
                      </div>
                      {kGroup.map((kItem, kItemIndex) => {
                        return (
                          <div id="keyboard-bottom" key={kItemIndex}>
                            <div id="keyboard-left">{kItem.left}</div>
                            <div id="keyboard-right">{kItem.right}</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
                <div className="keyboard-buttons"></div>
              </div>
            </div>
          </div>
        )}
        {showRulesN64 && (
          <div>
            <div
              className="popup"
              onClick={() => {
                onClickPlayNavBody('Rules-N64');
              }}
            >
              <div className="rules-top">
                <div className="rules-col">
                  <h1>Web Rules</h1>
                  <div className="rules-outline-web">
                    <img
                      id="rules-web-gif"
                      src="images/smashed_x10_gif.gif"
                      alt="smash title"
                    />
                    <p className="rules-web-since rules-small rules-italic">
                      ★ ★ ★ Since 2022 ★ ★ ★
                    </p>
                    <div className="rules-ul">
                      <div className="rules-li">
                        <div className="rules-big">First Blood</div>
                        <p className="rules-small">
                          If others have never died...
                        </p>
                        <p className="rules-small">And you just died...</p>
                        <p className="rules-small rules-end">
                          You take 1 shot.
                        </p>
                      </div>
                      <div className="rules-li">
                        <div className="rules-big">Screen Clear</div>
                        <p className="rules-small">
                          If someone else just died...
                        </p>
                        <p className="rules-small">
                          And all are dead but you...
                        </p>
                        <p className="rules-small rules-end">
                          They each take 1 shot.
                        </p>
                      </div>
                      <div className="rules-li">
                        <div className="rules-big">Capture The Flag</div>
                        <p className="rules-small">If you raised the flag...</p>
                        <p className="rules-small rules-end">
                          All others each take a shot.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rules-col">
                  <h1>N64 Rules</h1>
                  <div
                    className="rules-outline-n64"
                    onClick={() => {
                      captureScreenshot();
                    }}
                  >
                    <img
                      id="RulesN64Image"
                      src="images/smashRulesGimp01.png"
                      alt="Smashed Rules-N64"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {showControllers && (
          <div>
            <div
              className="popup"
              onClick={() => {
                onClickPlayNavBody('Controllers');
              }}
            >
              <h1>GamePads</h1>
              <div id="wcl">
                <h2>GamePads Suggested: </h2>
                {workingControllersAmazon.map((controller) => {
                  return (
                    <a
                      onMouseEnter={() => {
                        soundManager.blipSoundSoft();
                      }}
                      className="working-controller"
                      href={controller.url}
                    >
                      <span>
                        {emoji.greenCheck} &nbsp;
                        {controller.name}
                      </span>
                    </a>
                  );
                })}
              </div>
              <div id="wcl">
                <h2>Accessories Suggested: </h2>
                <a
                  onMouseEnter={() => {
                    soundManager.blipSoundSoft();
                  }}
                  className="working-controller"
                  href="https://www.amazon.com/dp/B01MYUDDCV?ref=ppx_yo2ov_dt_b_product_details&th=1/"
                >
                  <span>{emoji.greenCheck} &nbsp;USB-A Extension Cord</span>
                </a>
                <a
                  onMouseEnter={() => {
                    soundManager.blipSoundSoft();
                  }}
                  className="working-controller"
                  href="https://www.amazon.com/gp/product/B01N5KGBGQ/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&psc=1"
                >
                  <span>{emoji.greenCheck} &nbsp;USB-C Splitter</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {showAbout && (
          <div>
            <div
              className="popup"
              onClick={() => {
                onClickPlayNavBody('About');
              }}
            >
              <h1>About</h1>
              <div className="horiz">
                <div
                  className="horiz-item-big"
                  onClick={(x) => {
                    x.stopPropagation();
                  }}
                >
                  <p>
                    This game is a tribute to "Smashed Bros", a drinking game
                    invented in St. Louis in late 2009 at the Chemon House.
                  </p>
                  <p>niemeyer.eric@gmail.com</p>
                </div>
                <div className="horiz-item-small">
                  <div className="about-image-wrapper">
                    <img
                      className="about-image about-image-pixelated"
                      src="./images/character_3_cropped.png"
                      alt="kirby"
                      onMouseDown={() => {
                        print('MOUSE DOWN');
                        setFirstCharacterSlot(5);
                      }}
                    />
                  </div>
                  <a
                    onMouseEnter={() => {
                      soundManager.blipSoundSoft();
                    }}
                    className="btn btn-dark text-light"
                    href="https://niemo.io/"
                  >
                    <span className="text-white small">Website</span>
                  </a>
                </div>
                <div className="horiz-item-small">
                  <div className="about-image-wrapper">
                    <img
                      className="about-image"
                      src="./images/NA_new.png"
                      alt="Niemo Audio"
                      onMouseDown={() => {
                        print('MOUSE DOWN');
                      }}
                    />
                  </div>
                  <a
                    onMouseEnter={() => {
                      soundManager.blipSoundSoft();
                    }}
                    className="btn btn-dark text-light"
                    href="https://soundcloud.com/niemoaudio/ars-niemo-small-talk-build-iv"
                  >
                    <span className="text-white small">Music</span>
                  </a>
                </div>
                <div className="horiz-item-small">
                  <div className="about-image-wrapper">
                    <img
                      className="about-image about-image-pixelated"
                      src="./images/blockcracked.png"
                      alt="Niemo Audio"
                      onMouseDown={() => {
                        print('MOUSE DOWN');
                      }}
                    />
                  </div>
                  <a
                    onMouseEnter={() => {
                      soundManager.blipSoundSoft();
                    }}
                    className="btn btn-dark text-light"
                    href="https://resume.niemo.io/"
                  >
                    <span className="text-white small">Resume</span>
                  </a>
                </div>
              </div>
              <div
                id="show-all"
                onMouseEnter={() => {
                  soundManager.blipSoundSoft();
                }}
                className={hideNiemoIp ? ' show-all-hide' : ' show-all-show'}
                onClick={(e) => {
                  e.stopPropagation();
                  soundManager.blipBeedeeSound();
                  setHideNiemoIp((x) => !x);
                }}
              >
                Filter
              </div>
              <div className="scroller" ref={scrollerRef}>
                <table>
                  <thead>
                    <tr id="tr-header">
                      <td id="title" className="td-left">
                        {' '}
                        GAMES TZ:{tz}
                      </td>
                      <th id="title" className="td-left">
                        CONFIG
                      </th>
                      <th id="title" className="td-right">
                        SHOTS
                      </th>
                      <th id="title" className="td-right">
                        DEATHS
                      </th>
                      <th id="title" className="td-right">
                        HITS
                      </th>
                      <th> </th>
                    </tr>
                  </thead>

                  <tbody>
                    {allSessions.map((s: SessionInfo, sIndex: number) => {
                      print(s.city, s.ip);
                      if (
                        hideNiemoIp &&
                        (s.ip === '69.124.166.109' ||
                          s.ip === '169.254.225.231' ||
                          s.ip === '24.186.254.151' ||
                          s.ip === '24.186.254.151' ||
                          s.ip === '69.115.173.120' ||
                          s.ip === '' ||
                          s.ip === 'null' ||
                          s?.ip === null)
                      ) {
                        return null;
                      }

                      // if (hideNiemoIp && s.city === 'Stamford') {
                      //   return null;
                      // }

                      let gameViewTop: string = '';
                      let gameViewBottom: string = '';
                      let sc: SmashConfig | null = null;
                      try {
                        sc = JSON.parse(s.smashConfig);
                        // print('smashConfig', sc);
                      } catch (e) {
                        print('error parsing smashConfigString', e);
                      }
                      if (sc !== null) {
                        sc.players.forEach((sessionPlayer: any) => {
                          gameViewTop +=
                            smashConfigOptions[sessionPlayer.characterId]
                              .nameShort + ' ';
                          print('sessionPlayer.input', sessionPlayer.input);

                          switch (sessionPlayer.input) {
                            case 0:
                              gameViewBottom += sessionPlayer.input + ' ';
                              break;
                            case 1:
                              gameViewBottom += '' + emoji.gamepad + ' ';
                              break;
                            case 2:
                              gameViewBottom += '' + emoji.keyboardWhite + ' ';
                              break;
                            case 3:
                              gameViewBottom += '' + emoji.bot + ' ';
                              break;
                            case 4:
                              gameViewBottom += '' + emoji.brain + ' ';
                              break;
                            case 5:
                              gameViewBottom += '' + emoji.dna + ' ';
                              break;
                            default:
                              throw new Error('input not found');
                          }
                        });
                      }
                      const allSessionsLength: number = allSessions.length;
                      const totalDigits = allSessionsLength.toString().length;
                      const paddedIndex = (allSessionsLength - sIndex)
                        .toString()
                        .padStart(totalDigits, '\u00a0');
                      const sessionMomentObject = momentStringToMoment(
                        s.momentCreated
                      );
                      const mTZ = require('moment-timezone');
                      const clientTimezone =
                        Intl.DateTimeFormat().resolvedOptions().timeZone;
                      const formattedDate = mTZ
                        .tz(moment(sessionMomentObject), clientTimezone)
                        .format('YYYY-MM-DD HH:mm');
                      let totalShots: number = 0;
                      if (
                        s.matrixShotsUnto === null ||
                        s.matrixShotsUnto === 'null'
                      ) {
                      } else {
                        totalShots = sumNumbersIn2DArrayString(
                          s.matrixShotsUnto
                        );
                      }
                      let totalDeaths: number = 0;
                      if (
                        s.matrixDeathsUnto === null ||
                        s.matrixDeathsUnto === 'null'
                      ) {
                      } else {
                        totalDeaths = sumNumbersIn2DArrayString(
                          s.matrixDeathsUnto
                        );
                      }
                      let totalHits: number = 0;
                      if (
                        s.matrixHitsUnto === null ||
                        s.matrixHitsUnto === 'null'
                      ) {
                      } else {
                        totalHits = sumNumbersIn2DArrayString(s.matrixHitsUnto);
                      }
                      return (
                        <tr id={sIndex % 2 ? 'td-odd' : 'td-even'} key={sIndex}>
                          <td className="td-left">
                            <div id="td-info">
                              {paddedIndex} {formattedDate} {s.ip}
                            </div>

                            <div id="td-info">
                              {s.country} {s.region} {s.city}
                            </div>
                          </td>

                          <td className="td-left">
                            <div>{gameViewTop ? gameViewTop : ' '}</div>
                            <div>{gameViewBottom ? gameViewBottom : ' '}</div>
                          </td>
                          <td className="td-right">
                            {totalShots ? totalShots : ' '}
                          </td>
                          <td className="td-right">
                            {totalDeaths ? totalDeaths : ' '}
                          </td>
                          <td className="td-right">
                            {totalHits ? totalHits : ' '}
                          </td>
                          <td> </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
      {webStateCurr === 'web-state-game' && nnProgress !== null && (
        <div className="neural-network-train-status">
          <span>Neural Network Training</span>
          <div className="neural-network-train-top">
            <span>
              {percentDoneBar(nnProgress)} {Math.floor((nnProgress || 0) * 100)}
              %
            </span>
            <span> Error Init {nnErrInit || 0}</span>
            <span> Error Curr {nnErrorCurr || 0}</span>
            <span>
              {' '}
              ITER {nnNumIter || 0} | OBJ {nnNumObj || 0}
            </span>
            {/* <span> Num Object {nnNumObj || 0}</span> */}
            {/* <span> Log Period {nnLogPeriod || 0}</span> */}
          </div>

          <div className="neural-network-train-bottom">
            <div
              onMouseEnter={() => {
                soundManager.blipSoundSoft();
              }}
              className={nnJson === null ? ' b-start-inactive' : 'b-start'}
              onClick={() => {
                if (nnJson !== null && navigator.clipboard !== undefined) {
                  navigator.clipboard.writeText(nnJson);

                  soundManager.blipBeedeeSound();
                }
              }}
            >
              <span>Copy Weights</span>
            </div>
            <div
              onMouseEnter={() => {
                soundManager.blipSoundSoft();
              }}
              className={nnRatios === null ? ' b-start-inactive' : 'b-start'}
              onClick={() => {
                if (nnRatios !== null && navigator.clipboard !== undefined) {
                  navigator.clipboard.writeText(nnRatios.toString());

                  soundManager.blipBeedeeSound();
                }
              }}
            >
              <span>Copy Ratios</span>
            </div>
          </div>
        </div>
      )}
      {(debugState.Dev_Mode ||
        debugState.Auto_Restart ||
        debugState.Auto_Start) && (
        <div className="dev-mode-div">
          {(debugState.Dev_Mode ? 'Dev_Mode' : '') +
            (debugState.Auto_Restart ? ' Auto_Restart' : '') +
            (debugState.Auto_Start ? ' Auto_Start' : '')}
        </div>
      )}
      {webStateCurr === 'web-state-game' && !isReplayHidden && (
        <div className="video-playback-container">
          <div className="video-playback-super">
            {videoGray && <p className="replay">FAST FORWARD</p>}
            {!videoGray && <p className="replay">INSTANT REPLAY</p>}
            <video
              className={
                videoGray
                  ? 'video-playback video-playback-gray'
                  : 'video-playback video-playback-normal'
              }
              ref={videoRef}
              onTimeUpdate={() => {
                print('onTimeUpdate');
                handleTimeUpdate();
              }}
              onLoadedMetadata={() => {
                print('onLoadedMetadata');
                handleTimeUpdate();
              }}
            />
          </div>
        </div>
      )}
      {!debugInit.Allow_Mobile && isMobile && (
        <div className="mobile-warning">
          {/* <img src="/images/table.png" alt="table" /> */}
          <img src="images/smashed_x10_gif.gif" alt="Smashed Title Gif" />
          <span>Smashed Bros</span>
          <span>is best played on a </span>
          <span>desktop or laptop.</span>
        </div>
      )}
      {/* ////////////////////////////////////////// */}
      {/* // GAMEPADS */}
      {/* ////////////////////////////////////////// */}
      {connectedGamepads.map((gp) => {
        const dotPos = positions[gp.index];
        if (!dotPos) return null;
        return (
          <img
            key={gp.index}
            src="images/white_trans.png"
            alt="controller dot"
            style={{
              position: 'absolute',
              left: dotPos.x,
              top: dotPos.y,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              width: 32,
              height: 32,
              zIndex: 100,
            }}
          />
        );
      })}
    </div>
  );
}

export default Main;
