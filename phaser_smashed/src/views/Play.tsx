/* eslint-disable react-hooks/exhaustive-deps */
import '@fontsource/press-start-2p';
import html2canvas from 'html2canvas';
import moment, { Moment } from 'moment';
import Phaser from 'phaser';
import { useEffect, useRef, useState } from 'react';
import '../App.css';
import {
  debugInit,
  debugMax,
  showOptionOnMainScreenInit,
} from '../debugOptions';
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
} from '../scenes/interfaces';
import MusicManager from './MusicManager';
import SoundManager from './SoundManager';
import {
  ClientInformation,
  SessionInfo,
  axiosSaveOne,
  fetchClientData,
  getAllAxios,
  print,
  sumNumbersIn2DArrayString,
} from './client';
import {
  baseGravity,
  blipDelay,
  characterMoves,
  configInit,
  gravLightMultiplier,
  idColors,
  inputArrayInit,
  keyboardGroups,
  p1Keys,
  p2Keys,
  quotes,
  smashConfigInit,
  smashConfigOptions,
  workingControllersAmazon,
} from './helpers/reactHelpers';

function Play() {
  const myPhaser: any = useRef(null);

  const [debugState, setDebugState] = useState<Debug>(debugInit);

  const soundManager = SoundManager();
  const musicManager = MusicManager();

  const [isReplayHidden, setIsReplayHidden] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [videoGray, setVideoGray] = useState(false);

  const [mainOptionsDebugShowState, setMainOptionsDebugShowState] =
    useState<Debug>(showOptionOnMainScreenInit);

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

    if (debugState.ReplayFastSlow) {
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
      if (debugState.ReplayFastSlow) {
        video.playbackRate = 2;
      } else {
        video.playbackRate = 1;
      }
      video.play();
      return;
    }
  };

  useEffect(() => {
    if (!debugState.ReplayOn) {
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
        debugState.ReplayFullQuality
          ? {}
          : {
              videoBitsPerSecond: 1000000,
            }
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
          print('BROKEN_____________________');
      }
    };

    window.addEventListener('gameState', handlePowerUpCollected);

    return () => {
      window.removeEventListener('gameState', handlePowerUpCollected);
    };
  }, [debugState.ReplayFullQuality, debugState.ReplayOn]);

  const [session, setSession] = useState<SessionInfo | null>(null);
  const [allSessions, setAllSessions] = useState<SessionInfo[]>([]);

  const [hideNiemoIp, setHideNiemoIp] = useState<boolean>(false);

  useEffect(() => {
    print('sessionInfo', session);
  }, [session]);

  useEffect(() => {
    if (allSessions === null) {
      return;
    }
    print('allSessions Updated');
  }, [allSessions]);

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
  const [webState, setWebState] = useState<WebState>('init');
  const [openEye, setOpenEye] = useState<boolean>(false);
  const [topBarDivExists, setTopBarDivExists] = useState<boolean>(false);

  const scrollerRef = useRef<HTMLDivElement>(null);

  const onClickEye = () => {
    setOpenEye(!openEye);
  };

  useEffect(() => {
    if (debugState.DevMode) {
      setWebState('start');
    }
  }, []);

  useEffect(() => {
    const setShowLoaderIntervalFunction = () => {
      const myInterval = setInterval(() => {
        print(
          'myPhaser.current?.scene?.keys?.game?.loaded',
          myPhaser?.current?.scene?.keys?.game?.loaded
        );
        if (myPhaser?.current?.scene?.keys?.game?.loaded) {
          setTimeout(
            () => {
              setWebState('play');
            },
            debugState.DevMode ? 0 : 1
          );
          clearInterval(myInterval);
        }
      }, 1);
    };

    print('webState', webState);
    switch (webState) {
      case 'init':
        print('init');
        break;
      case 'start':
        choosePlay();
        soundManager.startSound();

        musicManager.smallTalkRef.current.play();
        musicManager.monkeysRef.current.pause();
        setTopBarDivExists(false);
        setTimeout(() => {
          setTopBarDivExists(true);
        }, 4000);
        (async () => {
          const allSessions: SessionInfo[] = await getAllAxios();
          setAllSessions(allSessions);
        })();
        break;
      case 'loader':
        readyPlay();
        soundManager.startSound();
        musicManager.smallTalkRef.current.pause();
        musicManager.monkeysRef.current.play();
        setShowLoaderIntervalFunction();
        break;
      case 'play':
        goPlay();
        musicManager.smallTalkRef.current.pause();
        musicManager.monkeysRef.current.pause();
        setTopBarDivExists(true);
        break;
      default:
        break;
    }
  }, [debugState.DevMode, webState]);

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
  const [inputArray, setInputArray] = useState<InputType[]>(inputArrayInit);
  const [smashConfig, setSmashConfig] = useState<SmashConfig>(smashConfigInit);

  const setInputArrayEffect = (newInputArray: InputType[]): void => {
    soundManager.blipSound();
    setInputArray((prevArray: InputType[]) => [0, 0, 0, 0]);

    newInputArray.forEach((item, index) => {
      setTimeout(() => {
        soundManager.blipSound();
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

  useEffect(() => {
    print('inputArray', inputArray);
  }, [inputArray]);

  const setCharacterSlot = (
    charId: CharacterId,
    positionIndex: number
  ): void => {
    if (webState === 'play') {
      return;
    }

    const choices = [...smashConfig.players];
    const choice = choices[positionIndex];
    choice.characterId = charId;

    setSmashConfig({ players: [...choices] });
  };

  const randomizeCharacters = () => {
    soundManager.dice();

    const numBase: number = 4;
    const numChez: number = debugState.UseChez ? 2 : 0;
    const numKoopas: number = debugState.UseKoopas ? 3 : 0;
    const numTotal: number = numBase + numChez + numKoopas;

    const ratioBase: number = numBase / numTotal;
    const ratioChez: number = numChez / numTotal;

    const baseUpperLimit: number = ratioBase;
    const chezUpperLimit: number = baseUpperLimit + ratioChez;

    const newPlayers: PlayerConfigSmall[] = [];

    for (let i = 0; i < 4; i++) {
      const rand: number = Math.random();
      const oldId: number = smashConfig.players[i].characterId;
      let newId: number | null = null;

      // too lazy to do it right
      do {
        if (rand < baseUpperLimit) {
          newId = Math.floor(Math.random() * 4);
        } else if (rand < chezUpperLimit) {
          newId = 4 + Math.floor(Math.random() * 2);
        } else {
          newId = 6 + Math.floor(Math.random() * 3);
        }
      } while (newId === oldId);

      print('new', newId, 'old', oldId);

      newPlayers.push({
        characterId: newId as CharacterId,
        input: 0,
      });
    }

    newPlayers.forEach((player, index) => {
      setTimeout(() => {
        soundManager.blipSound();
        setCharacterSlot(player.characterId, index);
      }, index * blipDelay);
    });
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

  useEffect(() => {
    const newConfig: Phaser.Types.Core.GameConfig = {
      ...config,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: {
            y:
              baseGravity * (debugState.GravityLight ? gravLightMultiplier : 1),
          },
          debug: debugState.DevMode,
        },
      },
    };

    setConfig(newConfig);
  }, [debugState.DevMode, debugState.GravityLight]);

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
      myPhaser.current.scene.keys.game.loaded = false;
      myPhaser.current.destroy(true);
    }

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
        default:
          print("inputArray[inputIndex] didn't match any cases");
          break;
      }
    });
    const newSmashConfig: SmashConfig = { players: [...newPlayers] };
    setQuotesRandomNumber(Math.floor(Math.random() * quotes.length));

    if (!debugState.LoadTimeExtra || debugState.DevMode) {
      setTimeoutQuotesLengthStart = 0;
    }
    const myMoment = moment();

    setWebState('loader');

    setTimeout(() => {
      myPhaser.current = new Phaser.Game(config);
      myPhaser.current.registry.set('parentContext', Play);
      myPhaser.current.registry.set('smashConfig', newSmashConfig);
      myPhaser.current.registry.set('debug', debugState);
      myPhaser.current.registry.set('myMoment', myMoment);
    }, setTimeoutQuotesLengthStart);

    const c: ClientInformation = await fetchClientData();
    const s: SessionInfo = await axiosSaveOne(
      myMoment,
      c,
      newSmashConfig,
      debugState
    );
    setSession(s);
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
    soundManager.blipSound();
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
    if (debugState.UseChez || webState === 'play') {
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
    soundManager.blipSound();
    const choices = [...smashConfig.players];
    const choice = choices[playerIndex];
    let newCharacterId = choice.characterId + 1;

    if (!debugState.DevMode && !debugState.UseChez) {
      while (newCharacterId === 4 || newCharacterId === 5) {
        newCharacterId++;
      }
    }

    if (newCharacterId > smashConfigOptions.length - 1) {
      newCharacterId = 0;
    }

    if (!debugState.DevMode && !debugState.UseKoopas && newCharacterId > 5) {
      newCharacterId = 0;
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

  const clickPauseParent = () => {
    print('GAME STATE', myPhaser.current?.scene?.keys?.game.gameState.nameCurr);
    if (webState === 'play') {
      if (
        myPhaser.current?.scene?.keys?.game.gameState.nameCurr !==
          'game-state-start' &&
        myPhaser.current?.scene?.keys?.game.gameState.nameCurr !==
          'game-state-paused' &&
        myPhaser.current?.scene?.keys?.game.gameState.nameCurr !==
          'game-state-first-blood' &&
        myPhaser.current?.scene?.keys?.game.gameState.nameCurr !==
          'game-state-screen-clear' &&
        myPhaser.current?.scene?.keys?.game.gameState.nameCurr !==
          'game-state-captured-flag' &&
        myPhaser.current?.scene?.keys?.game.gameState.nameCurr !==
          'game-state-finished'
      ) {
        print('CLICK AND PAUSING');
        setGameState(myPhaser.current?.scene?.keys?.game, 'game-state-paused');
      }
    }
  };

  const onClickPlayNavBody = (buttonName: ButtonName) => {
    soundManager.blipSound();

    print('Click NavBody: ', buttonName);

    setShowControls(false);
    setShowControllers(false);
    setShowRulesN64(false);
    setShowAbout(false);
    setShowHistory(false);
    setShowOptions(false);
  };

  const onClickPlayNavButtons = (buttonName: ButtonName) => {
    soundManager.blipSound();
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

    if (webState === 'start') {
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

    if (webState === 'play') {
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
          onClickBackEventHandler();
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

  const onClickBackEventHandler = () => {
    if (myPhaser?.current?.scene?.keys?.game) {
      myPhaser.current.scene.keys.game.loaded = false;
    }
    onClickPlayNavButtons('Back');
    setNumClicks(numClicks + 1);
    clearInterval(intervalClock.current);
    intervalClock.current = null;
    componentPseudoLoad.current = true;
    myPhaser.current.destroy(true);

    setWebState('start');
  };

  useEffect(() => {
    if (webState === 'init') {
      setP1KeysTouched(true);
      setP2KeysTouched(true);
    }
    if (webState === 'start') {
      setP1KeysTouched(true);
      setP2KeysTouched(true);
    }
    if (webState === 'play') {
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
    }
  }, [webState]);

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

  const [text, setText] = useState('');
  const interval: any = useRef(null);

  useEffect(
    function () {
      if (!debugState.TypedLoadingText) {
        return;
      }

      if (interval.current !== null) {
        clearInterval(interval.current);
      }

      let tempIndex = 0;
      let tempText = '';
      interval.current = setInterval(function () {
        tempText = quotes[quotesRandomNumber].text.substring(0, tempIndex + 1);
        setText(tempText);

        if (tempIndex === quotes[quotesRandomNumber].text.length - 1) {
          clearInterval(interval.current);
          interval.current = null;
        }

        tempIndex++;
      }, 1700 / quotes[quotesRandomNumber].text.length);
    },
    [quotesRandomNumber, webState]
  );

  return (
    <div id="top-level" className="over-div">
      {!debugState.DevMode &&
        webState !== 'start' &&
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
      {!debugState.DevMode &&
        webState !== 'start' &&
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
      {webState === 'loader' && (
        <div className="loader">
          <div className="spinnerShrink">
            <div className="spinnerOuterOuter">
              <div className="spinnerOuter">
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
          {debugState.TypedLoadingText && (
            <p className={'.first-loader-p'}>{text}</p>
          )}
          {!debugState.TypedLoadingText && (
            <p className="first-loader-p">{quotes[quotesRandomNumber].text}</p>
          )}
          <p className="second-loader-p">- {quotes[quotesRandomNumber].name}</p>
        </div>
      )}
      <div className="phaser-container" id="phaser-container"></div>
      {(webState === 'start' || webState === 'init') && (
        <div className="start-class-div">
          {!debugState.DevMode && (
            <div
              className={
                'black-hiding-div' +
                (webState === 'init'
                  ? ' black-hiding-div-init'
                  : ' black-hiding-div-start')
              }
            />
          )}
          <div className={'start-title-wrapper'}>
            <div
              className={
                'start-title' +
                (webState === 'start' ? ' startTitleStart' : ' startTitleInit')
              }
              onMouseDown={() => {
                console.log('mouse down');
              }}
              onMouseUp={() => {
                console.log('mouse up');
              }}
            >
              <div
                onMouseDown={() => {
                  setWebState('start');
                }}
              >
                <img src="images/smashed_x10_gif.gif" alt="Smashed Title Gif" />
              </div>
              <h1>{webState === 'init' ? '?' : 'SMASHED'}</h1>
            </div>
          </div>

          <div className="player-choices">
            <div className="player-choices-left">
              {Object.entries(debugState).map(([key, value], index: number) => {
                if (!showOptionOnMainScreenInit[key]) {
                  return null;
                }

                return (
                  <div
                    id="optionStart"
                    key={index}
                    onClick={(e: React.MouseEvent) => {
                      if (key === 'ModeInfinity') {
                        const newMainOpotionsDebugShow: Debug = {
                          ...mainOptionsDebugShowState,
                        };
                        if (debugState.ModeInfinity) {
                          newMainOpotionsDebugShow['Minutes'] = 1;
                          newMainOpotionsDebugShow['Shots'] = 0;
                        } else {
                          newMainOpotionsDebugShow['Minutes'] = 0;
                          newMainOpotionsDebugShow['Shots'] = 1;
                        }

                        setMainOptionsDebugShowState(newMainOpotionsDebugShow);
                      }

                      soundManager.blipSound();
                      e.stopPropagation();
                      if (typeof value === 'number') {
                        setDebugState((prevState) => ({
                          ...prevState,
                          [key]: value - 1 < 0 ? getMaxFromKey(key) : value - 1,
                        }));
                        print(index, key, value);
                      }

                      if (typeof value === 'boolean') {
                        setDebugState((prevState) => ({
                          ...prevState,
                          [key]: !value,
                        }));
                        print(index, key, value);
                      }
                    }}
                  >
                    {key === 'MusicTrack' && (
                      <>
                        <div className="debug-value">
                          <p>🔊</p>
                        </div>
                        <p className="key-start">
                          {(() => {
                            switch (value) {
                              case 0:
                                return 'Dreamland';
                              case 1:
                                return 'NiemoAudio2';
                              case 2:
                                return 'NiemoAudio';
                              case 3:
                                return '1200 Micro';
                              default:
                                return 'Off';
                            }
                          })()}
                        </p>
                      </>
                    )}
                    {key !== 'MusicTrack' && (
                      <>
                        <div className="debug-value">
                          <p>
                            {typeof value !== 'boolean'
                              ? value
                              : value
                              ? emoji.greenCheck
                              : emoji.redX}
                          </p>
                        </div>
                        <p className="key-start">{key}</p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="player-choices-right">
              {smashConfig.players.map((p, pIndex) => {
                return (
                  <div className="player-choice" key={pIndex}>
                    {inputArray[pIndex] === 0 && (
                      <div
                        className="player-char-blank"
                        onClick={() => {
                          onClickRotateSelection(pIndex);
                        }}
                      >
                        <div className="startImageWrapper">
                          {inputArray[pIndex] !== 0 &&
                            inputArray[pIndex] < inputTypeNum && (
                              <img
                                className={
                                  'startImage' +
                                  (pIndex > 1 ? 'Inverse' : 'Normal')
                                }
                                src={
                                  'images/character_' +
                                  p.characterId.toString() +
                                  '_cropped.png'
                                }
                                width={
                                  (
                                    55 * smashConfigOptions[p.characterId].scale
                                  ).toString() + '%'
                                }
                                alt="char"
                              />
                            )}
                          <p className="player-char-image-name">
                            {smashConfigOptions[p.characterId].name}
                          </p>
                        </div>
                      </div>
                    )}
                    {inputArray[pIndex] !== 0 &&
                      inputArray[pIndex] < inputTypeNum && (
                        <div
                          className="player-char"
                          onClick={() => {
                            onClickRotateSelection(pIndex);
                          }}
                        >
                          <div className="startImageWrapper">
                            <div
                              className={
                                'id-circle ' +
                                idColors[getNumActiveBeforeMe(pIndex)]
                              }
                            ></div>
                            {inputArray[pIndex] !== 0 &&
                              inputArray[pIndex] < inputTypeNum && (
                                <img
                                  className={
                                    'startImage' +
                                    (pIndex > 1 ? 'Inverse' : 'Normal')
                                  }
                                  src={
                                    'images/character_' +
                                    p.characterId.toString() +
                                    '_cropped.png'
                                  }
                                  width={
                                    (
                                      55 *
                                      smashConfigOptions[p.characterId].scale
                                    ).toString() + '%'
                                  }
                                  alt="char"
                                />
                              )}
                            <p className="player-char-image-name">
                              {smashConfigOptions[p.characterId].name}
                            </p>
                          </div>
                        </div>
                      )}
                    {inputArray[pIndex] === 0 && (
                      <div
                        className="b-oscuro b-black"
                        onClick={() => {
                          onClickOscura(pIndex);
                        }}
                      >
                        <span>Off</span>
                        <div className="button-input-emoji">
                          {emoji.cloudWhite}
                        </div>
                      </div>
                    )}
                    {inputArray[pIndex] === 1 && (
                      <div
                        className="b-oscuro b-dark"
                        onClick={() => {
                          onClickOscura(pIndex);
                        }}
                      >
                        <span>Gamepad</span>
                        {getNumGamepads() > 1 && (
                          <span id="input-sub">
                            {getNumControllersExistLower(pIndex) + 1}
                          </span>
                        )}
                        {pIndex < 2 && (
                          <div className="button-input-emoji">
                            {emoji.gamepad}
                          </div>
                        )}
                        {!(pIndex < 2) && (
                          <div className="button-input-emoji">
                            {emoji.gamepad}
                          </div>
                        )}
                      </div>
                    )}
                    {inputArray[pIndex] === 2 && (
                      <div
                        className="b-oscuro b-dark"
                        onClick={() => {
                          onClickOscura(pIndex);
                        }}
                      >
                        <span>Keyboard</span>
                        {getNumKeyboards() > 1 &&
                          getDoesKeyboardExistLower(pIndex) && (
                            <span id="input-sub">Arrows</span>
                          )}
                        {getNumKeyboards() > 1 &&
                          !getDoesKeyboardExistLower(pIndex) && (
                            <span id="input-sub">WASD</span>
                          )}
                        {pIndex < 2 && (
                          <div className="button-input-emoji">
                            {emoji.keyboardWhite}
                          </div>
                        )}
                        {!(pIndex < 2) && (
                          <div className="button-input-emoji">
                            {emoji.keyboardWhite}​
                          </div>
                        )}
                      </div>
                    )}
                    {inputArray[pIndex] === 3 && (
                      <div
                        className="b-oscuro b-dark"
                        onClick={() => {
                          onClickOscura(pIndex);
                        }}
                      >
                        <span>Bot</span>
                        <div className="button-input-emoji">{emoji.bot}</div>
                      </div>
                    )}
                    {inputArray[pIndex] === 4 && (
                      <div
                        className="b-oscuro b-dark"
                        onClick={() => {
                          onClickOscura(pIndex);
                        }}
                      >
                        <span>Bot</span>
                        <span id="input-sub">Neural Network</span>
                        <div className="button-input-emoji">{emoji.brain}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bottom-zone">
            <div className="input-group">
              <div
                className="b-all-bots"
                onClick={() => {
                  setInputArrayEffect([2, 0, 0, 2]);
                }}
              >
                <span className={'vs-span'}>
                  {emoji.keyboardWhite + emoji.keyboardWhite}
                </span>
              </div>
              <div
                className="b-all-bots"
                onClick={() => {
                  setInputArrayEffect([2, 0, 0, 3]);
                }}
              >
                <span className={'vs-span'}>
                  {emoji.keyboardWhite + emoji.bot}
                </span>
              </div>
              <div
                className="b-all-bots"
                onClick={() => {
                  setInputArrayEffect([2, 0, 0, 4]);
                }}
              >
                <span className={'vs-span'}>
                  {emoji.keyboardWhite + emoji.brain}
                </span>
              </div>
              <div
                className="b-all-bots"
                onClick={() => {
                  setInputArrayEffect([1, 0, 0, 1]);
                }}
              >
                <span className={'vs-span'}>
                  {emoji.gamepad + emoji.gamepad}
                </span>
              </div>

              <div
                className="b-all-bots"
                onClick={() => {
                  setInputArrayEffect([2, 0, 3, 4]);
                }}
              >
                <span className={'vs-span'}>{emoji.keyboardWhite}</span>
                <span className={'vs-span'}>{emoji.bot + emoji.brain}</span>
              </div>
              <div
                className="b-all-bots"
                onClick={() => {
                  setInputArrayEffect([1, 0, 3, 4]);
                }}
              >
                <span className={'vs-span'}>{emoji.gamepad}</span>
                <span className={'vs-span'}>{emoji.bot + emoji.brain}</span>
              </div>
              <div
                className="b-all-bots"
                onClick={() => {
                  setInputArrayEffect([1, 1, 1, 1]);
                }}
              >
                <span className={'vs-span'}>
                  {emoji.gamepad + emoji.gamepad}
                </span>
                <span className={'vs-span'}>
                  {emoji.gamepad + emoji.gamepad}
                </span>
              </div>
              <div
                className="b-all-bots"
                onClick={() => {
                  setInputArrayEffect([3, 3, 3, 3]);
                }}
              >
                <span className={'vs-span'}>{emoji.bot + emoji.bot}</span>
                <span className={'vs-span'}>{emoji.bot + emoji.bot}</span>
              </div>
              <div
                className="b-all-bots"
                onClick={() => {
                  setInputArrayEffect([4, 4, 4, 4]);
                }}
              >
                <span className={'vs-span'}>{emoji.brain + emoji.brain}</span>
                <span className={'vs-span'}>{emoji.brain + emoji.brain}</span>
              </div>
              <div
                className="b-all-bots"
                onClick={() => {
                  setInputArrayEffect([3, 4, 3, 4]);
                }}
              >
                <span className={'vs-span'}>{emoji.bot + emoji.brain}</span>
                <span className={'vs-span'}>{emoji.bot + emoji.brain}</span>
              </div>
            </div>
            <div
              className="b-all-bots"
              id="dice"
              onClick={() => {
                randomizeCharacters();
              }}
            >
              {emoji.dice}
            </div>
            <div className="b-start" onClick={onClickStartStartButton}>
              <span>START</span>
            </div>
          </div>
        </div>
      )}
      <div className="over-div">
        {topBarDivExists && (
          <div className={openEye ? 'top-bar-eye-open' : 'top-bar-eye-closed'}>
            {!openEye && (
              <img
                className="question-mark"
                src="/images/eye-shut-trans.png"
                alt="question mark"
                onClick={onClickEye}
              />
            )}
            {openEye && (
              <img
                className="question-mark"
                src="/images/eye-open-trans.png"
                alt="question mark"
                onClick={onClickEye}
              />
            )}
            {webState === 'start' && (
              <div
                className="link-tag"
                onClick={() => {
                  onClickPlayNavButtons('Options');
                }}
              >
                {showOptions && <span className="dark-span">Options</span>}
                {!showOptions && <span>Options</span>}
              </div>
            )}
            {webState === 'start' && (
              <div
                className="link-tag"
                onClick={() => {
                  onClickPlayNavButtons('Controllers');
                }}
              >
                {showControllers && <span className="dark-span">Pads</span>}
                {!showControllers && <span>Pads</span>}
              </div>
            )}
            {webState !== 'start' && (
              <div className="link-tag" onClick={onClickBackEventHandler}>
                <span>Back</span>
              </div>
            )}
            {webState !== 'start' && (
              <div
                className="link-tag"
                onClick={() => {
                  onClickStartStartButton();
                }}
              >
                <span>ReStart</span>
              </div>
            )}

            <div
              className="link-tag"
              onClick={() => {
                onClickPlayNavButtons('Controls');
              }}
            >
              {showControls && <span className="dark-span">Buttons</span>}
              {!showControls && <span>Buttons</span>}
            </div>
            <div
              className="link-tag"
              onClick={() => {
                onClickPlayNavButtons('Rules-N64');
              }}
            >
              {showRulesN64 && <span className="dark-span">Rules</span>}
              {!showRulesN64 && <span>Rules</span>}
            </div>
            {webState === 'start' && (
              <div
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
        {showOptions && (
          <div className="over-div">
            <div
              className="popup"
              onClick={() => {
                onClickPlayNavBody('Options');
              }}
            >
              <h1>Debug Options</h1>
              <div id="debug-col">
                {Object.entries(debugState).map(
                  ([key, value], index: number) => {
                    if (!!showOptionOnMainScreenInit[key]) {
                      return null;
                    }

                    return (
                      <div
                        id="optionDebug"
                        key={index}
                        onClick={(e) => {
                          soundManager.blipSound();
                          e.stopPropagation();
                          if (typeof value === 'number') {
                            setDebugState((prevState) => ({
                              ...prevState,
                              [key]:
                                value - 1 < 0 ? getMaxFromKey(key) : value - 1,
                            }));
                            print(index, key, value);
                          }

                          if (typeof value === 'boolean') {
                            setDebugState((prevState) => ({
                              ...prevState,
                              [key]: !value,
                            }));
                            print(index, key, value);
                          }
                        }}
                      >
                        <div className="debug-value">
                          <p>
                            {typeof value !== 'boolean'
                              ? value
                              : value
                              ? emoji.greenCheck
                              : emoji.redX}
                          </p>
                        </div>
                        <p className="key">{key}</p>
                      </div>
                    );
                  }
                )}
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
                        <p className="rules-small">If you rased the flag...</p>
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
                    <a className="working-controller" href={controller.url}>
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
                  className="working-controller"
                  href="https://www.amazon.com/dp/B01MYUDDCV?ref=ppx_yo2ov_dt_b_product_details&th=1/"
                >
                  <span>{emoji.greenCheck} &nbsp;USB-A Extension Cord</span>
                </a>
                <a
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
                <div className="horiz-item-left">
                  <img
                    className="kirbyNiembro"
                    src="./images/character_3_cropped.png"
                    alt="kirby"
                    onMouseDown={() => {
                      print('MOUSE DOWN');
                      setFirstCharacterSlot(5);
                    }}
                  />
                  <a
                    className="btn btn-dark text-light"
                    href="https://niemo.io/"
                  >
                    <span className="text-white small">niemo.io</span>
                  </a>
                </div>
                <div className="horiz-item-right">
                  This game is a tribute to "Smashed Bros", a drinking game
                  invented in St. Louis in late 2009 at the Chemon House. <br />
                  <br />
                  niemeyer.eric@gmail.com
                </div>
                <div className="horiz-item-left">
                  <img
                    className="NANiembro"
                    src="./images/NA.png"
                    alt="Niemo Audio"
                    onMouseDown={() => {
                      print('MOUSE DOWN');
                    }}
                  />

                  <a
                    className="btn btn-dark text-light"
                    href="https://soundcloud.com/niemoaudio/ars-niemo-small-talk-build-iv"
                  >
                    <span className="text-white small">music</span>
                  </a>
                </div>
              </div>
              <div
                id="show-all"
                className={hideNiemoIp ? ' show-all-hide' : ' show-all-show'}
                onClick={(e) => {
                  e.stopPropagation();
                  soundManager.blipSound();
                  setHideNiemoIp(!hideNiemoIp);
                }}
              >
                FILTER
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
                      if (
                        hideNiemoIp &&
                        (s.ip === '69.124.166.109' ||
                          s.ip === '69.115.173.120' ||
                          s.ip === '' ||
                          s.ip === 'null' ||
                          s.ip === null ||
                          s?.ip === null)
                      ) {
                        return null;
                      }
                      let gameViewTop: string = '';
                      let gameViewBottom: string = '';
                      let sc: SmashConfig | null = null;
                      try {
                        sc = JSON.parse(s.smashConfig);
                        print('smashConfig', sc);
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
                            default:
                              gameViewBottom += '?? ';
                              break;
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
                          <td id="title" className="td-left">
                            {paddedIndex} {formattedDate} {s.country} {s.region}{' '}
                            {s.city}
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
      {debugState.DevMode && <div className="dev-mode-div">Dev Mode</div>}
      {webState === 'play' && !isReplayHidden && (
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
    </div>
  );
}

export default Play;
