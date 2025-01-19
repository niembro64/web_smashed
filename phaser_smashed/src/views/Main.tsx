// Main.tsx

/* eslint-disable react-hooks/exhaustive-deps */
import '@fontsource/press-start-2p';
import html2canvas from 'html2canvas';
import moment, { Moment } from 'moment';
import Phaser from 'phaser';
import { useEffect, useRef, useState } from 'react';
import '../App.css';
import { Tooltip } from 'react-tooltip';
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
  toolTipStyle,
  tooltipDelay,
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
import CornerPieces from '../components/CornerPieces';
import InputTypeBlock from '../components/InputTypeBlock';

// >>> NEW imports from the newly created files:
import Popups from './Popups';
import NeuralNetworkTrainStatus from './NeuralNetworkTrainStatus';
import VideoReplay from './VideoReplay';

// Keep these exports the same:
export const blipDelay = 200;
export const baseGravity = 3000;
export const gravLightMultiplier = 0.5;

function Main() {
  const myPhaser: React.RefObject<Phaser.Game> = useRef<Phaser.Game>(null);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const [debugState, setDebugState] = useState<Debug>(debugInit);

  const soundManager: SoundManagerType = SoundManager();
  const musicManager: MusicManagerType = MusicManager();

  const [isReplayHidden, setIsReplayHidden] = useState(false);

  // Keep your original Refs for media recording if needed
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

    // keep original logic
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

  // Keep your replay effect logic:
  useEffect(() => {
    if (debugState.Inst_Replay === 0 || debugState.Simple_Stage) {
      setIsReplayHidden(true);
      return;
    }

    const startRecording = () => {
      setIsReplayHidden(true);
      const canvas = myPhaser.current?.canvas;
      if (!canvas) return;

      const stream = canvas.captureStream();
      const mediaRecorder = new MediaRecorder(
        stream,
        debugState.Inst_Replay === 1
          ? { videoBitsPerSecond: 20000 }
          : debugState.Inst_Replay === 2
          ? { videoBitsPerSecond: 100000 }
          : debugState.Inst_Replay === 3
          ? {
              /* FULL QUALITY */
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
        case 'game-state-first-blood':
        case 'game-state-screen-clear':
        case 'game-state-captured-flag':
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

  // Keep your training states
  const [nnJson, setNnJson] = useState<string | null>(null);
  const [nnRatios, setNnRatios] = useState<number[] | null>(null);
  const [nnProgress, setNnProgress] = useState<number | null>(null);
  const [nnErrorCurr, setNnErrorCurr] = useState<number | null>(null);
  const [nnErrInit, setNnErrInit] = useState<number | null>(null);
  const [nnNumObj, setNnNumObj] = useState<number | null>(null);
  const [nnNumIter, setNnNumIter] = useState<number | null>(null);
  const [nnLogPeriod, setNnLogPeriod] = useState<number | null>(null);

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

  const [numAutoRestarts, setNumAutoRestarts] = useState<number>(0);

  useEffect(() => {
    print('numAutoRestarts', numAutoRestarts);
    if (numAutoRestarts === 0) return;
    onClickStartStartButton();
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
      throw new Error('ws === webStateCurr ' + webStateNext);
    }
    setWebStatePrev(webStateCurr);
    setWebStateXXXX(webStateNext);
  };

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

        if (!isMobile) {
          setTopBarDivExists(true);
        }

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

        if (!isMobile) {
          setTopBarDivExists(true);
        }

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
  // set initial inputs in inputArray
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

  // kill if still alive on reload
  useEffect(() => {
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
    const numTotalAllowed: number = smashConfigAllowed.filter((x) => x).length;
    let inputArrayLocal = [...inputArray];
    if (!numTotalAllowed) {
      print('No allowed characters');
      return;
    }
    if (inputArrayLocal.filter((x) => x !== 0).length === 0) {
      inputArrayLocal = [3, 3, 3, 3];
      setInputArray(inputArrayLocal);
    }
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

  const getNumPlayersBeforeMe = (index: number): number => {
    let numPlayersBeforeMe = 0;
    for (let i = 0; i < index; i++) {
      if (inputArray[i] === 1 || inputArray[i] === 2) {
        numPlayersBeforeMe++;
      }
    }
    return numPlayersBeforeMe;
  };

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
          input: 0,
        },
        {
          characterId: 1,
          input: 0,
        },
        {
          characterId: 2,
          input: 0,
        },
        {
          characterId: 7,
          input: 0,
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
        case 2:
        case 3:
        case 4:
        case 5:
          newPlayers.push({
            characterId: players[inputIndex].characterId,
            input: input,
          });
          break;
        default:
          throw new Error('no match for input');
      }
    });
    if (newPlayers.length === 0) {
      print('newPlayers.length === 0');
      throw new Error('No players selected');
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
    // do whatever with s if you like

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

  // ephemeral code you had for setting first char slot
  const setFirstCharacterSlot = (charId: CharacterId): void => {
    if (debugState.Allow_BlackChez || webStateCurr !== 'web-state-setup') {
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
    choices[0].characterId = charId;
    setSmashConfig({ players: [...choices] });
  };

  const onClickRotateSelection = (playerIndex: number): void => {
    soundManager.blipBeedeeSound();
    const choices = [...smashConfig.players];
    let newCharacterId =
      (choices[playerIndex].characterId + 1) % smashConfigOptions.length;
    const numAllowed = smashConfigAllowed.filter((x) => x).length;
    if (numAllowed === 0) {
      return;
    }
    while (!smashConfigAllowed[newCharacterId]) {
      newCharacterId = (newCharacterId + 1) % smashConfigInitMax;
    }
    choices[playerIndex].characterId = newCharacterId as CharacterId;
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
        const allSess: SessionInfo[] = await getAllGameHistory();
        setAllSessions(allSess);
      })();
    }
  }, [showAbout]);

  const clickPauseParent = () => {
    if (webStateCurr !== 'web-state-game') {
      return;
    }
    // @ts-ignore
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
      // @ts-ignore
      setGameState(myPhaser.current?.scene?.keys?.game, 'game-state-paused');
    }
  };

  const onClickPlayNavBody = (buttonName: ButtonName) => {
    soundManager.blipBeedeeSound();
    print('Click NavBody: ', buttonName);

    // close all
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
        // close all
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
        // close all
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
    let exists = false;
    inputArray.forEach((ia: number, iaIndex: number) => {
      if (ia === 2 && iaIndex < myI) {
        exists = true;
      }
    });
    return exists;
  };

  const getNumKeyboards = (): number => {
    let numK = 0;
    for (let i = 0; i < inputArray.length; i++) {
      if (inputArray[i] === 2) {
        numK++;
      }
    }
    return numK;
  };

  const getNumGamepads = (): number => {
    let pads = 0;
    for (let i = 0; i < inputArray.length; i++) {
      if (inputArray[i] === 1) {
        pads++;
      }
    }
    return pads;
  };

  const getNumPlayers = (): number => {
    const numK = getNumKeyboards();
    const numControllers = getNumGamepads();
    return numK + numControllers;
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
    return debugMax[key as keyof Debug];
  };

  // RENDER
  return (
    <div id="top-level" className="over-div">
      <Tooltip
        opacity={1}
        anchorSelect=".b-all-bots"
        place="top"
        delayHide={tooltipDelay}
        delayShow={tooltipDelay}
        style={toolTipStyle}
      />
      <Tooltip
        opacity={1}
        anchorSelect=".b-dark"
        place="top"
        delayHide={tooltipDelay}
        delayShow={tooltipDelay}
        style={toolTipStyle}
      />
      <Tooltip
        opacity={1}
        anchorSelect=".b-start"
        place="top"
        delayHide={tooltipDelay}
        delayShow={tooltipDelay}
        style={toolTipStyle}
      />
      <Tooltip
        opacity={1}
        anchorSelect=".player-char"
        place="top"
        delayHide={tooltipDelay}
        delayShow={tooltipDelay}
        style={toolTipStyle}
      />

      {/* KEYBOARD EXPLAINER BLOCKS */}
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

      {/* LOADING SCREEN */}
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

      {/* START SCREEN (Init/Setup) */}
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

          {/* Title + CornerPieces */}
          <div className={'start-title-wrapper'}>
            <div
              className={
                'start-title' +
                (webStateCurr === 'web-state-setup'
                  ? ' start-title-start'
                  : ' start-title-init')
              }
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
                  webStateCurr === 'web-state-init' ? 'niemo-games' : undefined
                }
                onMouseDown={() => {
                  setWebStateCurr('web-state-setup');
                }}
              >
                {webStateCurr === 'web-state-init' ? 'START' : 'SMASHED'}
              </h1>

              {/* corner pieces */}
              <CornerPieces
                debugState={debugState}
                webStateCurr={webStateCurr}
              />
            </div>
          </div>

          {/* Players Setup */}
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
                    <InputTypeBlock
                      getNumPlayers={getNumPlayers}
                      getNumPlayersBeforeMe={getNumPlayersBeforeMe}
                      input={inputArray[pIndex]}
                      pIndex={pIndex}
                      p={p}
                      debugState={{
                        ...debugState,
                        idColors, // preserve your usage of idColors
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
              data-tooltip-content="Randomize Characters"
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
              data-tooltip-content="Start the Game!"
            >
              <span>START</span>
            </div>
          </div>
        </div>
      )}

      {/* TOP BAR */}
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
                {showOptions && <span className="dark-span">OPTIONS</span>}
                {!showOptions && <span>OPTIONS</span>}
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
                {showControllers && (
                  <span className="dark-span">CONTROLLERS</span>
                )}
                {!showControllers && <span>CONTROLLERS</span>}
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
                <span>BACK</span>
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
                <span>RESTART</span>
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
              {showControls && <span className="dark-span">CONTROLS</span>}
              {!showControls && <span>CONTROLS</span>}
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
              {showRulesN64 && <span className="dark-span">RULES</span>}
              {!showRulesN64 && <span>RULES</span>}
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
                {showAbout && <span className="dark-span">ABOUT</span>}
                {!showAbout && <span>ABOUT</span>}
              </div>
            )}
          </div>
        )}

        {/* >>> Now we import and render Popups.tsx instead of all that code inline <<< */}
        <Popups
          showRulesN64={showRulesN64}
          showControls={showControls}
          showControllers={showControllers}
          showAbout={showAbout}
          showHistory={showHistory}
          showOptions={showOptions}
          captureScreenshot={captureScreenshot}
          allSessions={allSessions}
          hideNiemoIp={hideNiemoIp}
          setHideNiemoIp={setHideNiemoIp}
          scrollerRef={scrollerRef}
          tz={tz}
          debugState={debugState}
          mainOptionsDebugShowState={mainOptionsDebugShowState}
          setDebugState={setDebugState}
          getMaxFromKey={getMaxFromKey}
          setMainOptionsDebugShowState={setMainOptionsDebugShowState}
          soundManager={soundManager}
          smashConfig={smashConfig}
          onClickPlayNavBody={onClickPlayNavBody}
        />
      </div>

      {/* NEURAL NETWORK TRAINING STATUS BAR */}
      {webStateCurr === 'web-state-game' && nnProgress !== null && (
        <NeuralNetworkTrainStatus
          nnProgress={nnProgress}
          nnErrorCurr={nnErrorCurr}
          nnErrInit={nnErrInit}
          nnNumIter={nnNumIter}
          nnNumObj={nnNumObj}
          nnJson={nnJson}
          nnRatios={nnRatios}
          soundManager={soundManager}
          debugState={debugState}
        />
      )}

      {/* VIDEO REPLAY */}
      {webStateCurr === 'web-state-game' && (
        <VideoReplay
          debugState={debugState}
          isReplayHidden={isReplayHidden}
          videoGray={videoGray}
          handleTimeUpdate={handleTimeUpdate}
          videoRef={videoRef}
        />
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

      {!debugInit.Allow_Mobile && isMobile && (
        <div className="mobile-warning">
          <img src="images/smashed_x10_gif.gif" alt="Smashed Title Gif" />
          <span>Smashed Bros</span>
          <span>is best played on a </span>
          <span>desktop or laptop.</span>
        </div>
      )}
    </div>
  );
}

export default Main;
